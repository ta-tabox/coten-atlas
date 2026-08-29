# 0016. ブラウザを立てる検証は Playwright が回し、Vitest は純関数だけを見る

- **状態**: 採用
- **決定日**: 2026-08-29
- **関係する ADR**: 0014、0009

## 文脈

0014 で L4 のスモークを入れると決めた。
最初の配線は素の node スクリプト（`pnpm smoke` が `node scripts/smoke.ts` を叩く）で、判定の純関数だけを Vitest から見る形にした。

その形が読み手に追えなかった。

- **一つのファイルに入口が二つある**。CLI から来ると `main()` が走り、Vitest から import すると走らない。切り替えているのは末尾の `process.argv[1]` の比較で、読み手はそこへ辿り着くまで判定がどこで走るのか分からない
- **陽性対照を Vitest へ入れた回に、L2 までブラウザを立て始めた**。観測層が事故を拾えるかを見るには実ブラウザが要るので、`vitest run` が Chromium を起動する形になった。`HARNESS.md` の層の表に「スモークの観測層だけ Chromium を立てる」という但し書きを足すことになり、L2 の定義（jsdom）と食い違った

S3 以降でテーマ描画・スライダー・パネルの同期が入ると、jsdom では書けない検証が出てくる見込みがある。
そのとき同じ問いをもう一度引くことになる。

## 決定

**ブラウザを立てる検証は `@playwright/test` が回す。**
設定は `web/playwright.config.ts` が持ち、**走らせる範囲と viewport は project ごとに分ける**。
スモークは project `smoke`（`web/tests/smoke/`）で、`pnpm smoke` は `--project=smoke` で名指す。

スモークと E2E は深さが違う。
同じ条件で回すと片方の都合がもう片方へ漏れるので、操作を伴う E2E を足すときは project をもう一つ並べる。
端末ごとの検証（スマホ幅など）はその project の `use` が持ち、共有の設定へは置かない。

**綴りで担当を分ける。**
`.spec.ts` が Playwright、`.test.ts` が Vitest。
どちらの既定も相手の綴りまで拾うので、両方の設定で絞ってある。

**Vitest はブラウザを立てない。**
見るのは jsdom で足りるものだけで、L4 の機構のうち純関数（`violationsOf`・`resolveWithinRoot`）はこちらに残る。

`web/scripts/smoke.ts` は機構だけを持つ。
配信サーバと観測（`observe`）と判定の純関数を置き、`main()` と `process.argv` の分岐は持たない。
ブラウザは自分で起こさず、Playwright の `page` フィクスチャを受け取る。
寿命も viewport も project の側が持つので、この層が握ると project ごとの切り替えが効かなくなる。

判定の口は `pnpm check` の一本のまま（0009）。
`pnpm smoke` が `playwright test --project=smoke` を呼び、連鎖の末尾に居る。

## 理由

**入口が一つになる。** `main()` と argv の分岐が消えるので、「どこで判定が走るのか」がファイルの構造から読める。

**層の境界が戻る。** ブラウザを立てるのは L4 だけになり、L2 は jsdom へ戻る。実測でも、Chromium を見えない場所へ向けて `vitest run` を回すと 59 本すべてが通る。

**S3 以降の受け皿になる。** 操作を伴う検証は locator と自動待機が要る。足すときに runner を選び直さずに済み、spec を 1 枚足すだけになる。

**移行がいま一番安い。** 対象が spec 2 枚ぶんしか無い。テストが増えてから寄せると、その全部を書き換えることになる。

### 採らなかった案

- **node スクリプトのまま続ける。** 依存は増えないが、入口が二つある構造は残る。S3 で操作を伴う検証を足すとき、待機と locator を自前で書くか、そこで結局 runner を入れるかになる
- **観測層の陽性対照を Vitest から外し、スモーク側の自己検査にする。** L2 は jsdom へ戻るが、`it()` の形が失われて検査が script のロジックへ埋まる。増やすときに書き足しにくい
- **Vitest の browser mode を使う。** runner は一つで済むが、Playwright の locator と自動待機は使えるものの trace・retry・レポータの整備が Playwright ほど枯れていない。操作を伴う検証が主目的になる先を見て採らなかった

## 帰結

- **runner が二つになる。** 新しいテストを書くときの分かれ目は「ブラウザが要るか」の一点で、要るなら `*.spec.ts`、要らないなら `*.test.ts` に置く
- Vitest の `include` は `*.test.*` だけ、Playwright の `testMatch` は `*.spec.ts` だけに絞ってある。どちらの既定も相手の綴りを拾うので、絞らないと同じファイルを二つの runner が走らせる
- **`pnpm smoke` が project を名指すので、E2E の project を足してもスモークの範囲は動かない。** 二重に走らせないための工夫が後から要らない
- viewport は project の `use` が持つ。判定は `page.viewportSize()` を読むので、`scripts/smoke.ts` は自分で寸法を決めない
- `pnpm test` は Chromium を要求しなくなった。要求するのは `pnpm smoke` だけになる
- `pnpm check` は 6.3 秒から 6.8 秒へ伸びた。Playwright の起動ぶんで、spec は 2 ワーカで並行に走る
- Playwright は `test-results/` を書くので追跡しない
- `ARCHITECTURE.md`「技術スタック」の「テスト」の行が二つの runner を持つ。単体側が ADR を持たない既定の踏襲であることは変わらない

## 覆る条件

Vitest の browser mode が trace とレポータまで揃え、操作を伴う検証を Playwright と同じ手触りで書けるようになったとき。
そのときは runner を一つへ畳む判断をやり直す。

ブラウザを立てる検証が増えず、S3 以降も jsdom で足り続けたとき。
そのときは spec を Vitest へ戻して Playwright を落とす。
