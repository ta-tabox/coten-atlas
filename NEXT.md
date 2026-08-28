# NEXT — coten-atlas

申し送り専用。**作業単位と状態は GitHub Issues**、順序と規約は `ROADMAP.md`（地図）。
ここに内容を複製しない（複製した瞬間から腐る）。
**マージの直前にここを追随させる**（規約は `ROADMAP.md`「進め方の横断規約」）。

## 人間へ渡すもの

**#41（VISION）は冷えたセッションへ渡さない**。
あれは人間との対話が本体で、Claude が一人で埋めると要件定義の言い換えが出てくるだけになる。
対話できる場で開く。

決めたこと（本文は #39〜#42 が持つ。ここは索引）:

- 文書を**五層**へ割る。`VISION.md`（なぜ）> `ARCHITECTURE.md`（どう）> `HARNESS.md`（検証）> `ROADMAP.md`（順序）、経緯と決定は `docs/adr/`
- 旧プラン一枚は**撤去**する。地図はルートの `ROADMAP.md` へ（公開する器ではルートの `ls` が目次として働く）
- **ADR を導入する**（#40）。`CLAUDE.md` の「ADR は置かない」は逆へ書き直す。
  1決定1レコード・追記のみ・覆すときは書き換えず supersede
- アプリ本体を **`web/` サブディレクトリ**へ移す（#39。ルートは器の文書と運用設定に空ける）
- `CODING.md` は toiito 版が4点先行しているが、**雛形の更新を待ってから**追随する（#42。器の側だけ直すと雛形が三世代目の遅れになる）

文書の割り方について: 最初は文書1枚 = issue 1枚で7件に割ったが、完了条件が
「ファイルが存在し N 節を持つ」しか出せず、**判定で割れなかった分を成果物の境界で代用していた**ので #40 の1枚へ畳んだ。
issue 台帳の三つの理由（並行マシンからの状態更新・機械的な完了確定・公開時の開発ログ）のうち、
散文の移設に効くのは三つ目だけで、それは本文の厚い issue 1枚でも果たせる。
#39 と #41 を畳まなかったのは、前者が**ビルドを壊しうる**（CI 赤が散文の編集を人質に取る）、
後者が**人間待ちで閉じられない単位**になるから。

**fermentary へ搬送済み**（`fermentary/NEXT.md` の6行。宛先は fermentary なのでこちらから実行しない）。
gh-review が3行:
「起動を絞る口は job 側の `if:` が唯一」を足すか諮る ／
雛形の `claude-code-review.yml` が `timeout-minutes` と `concurrency` を持たない ／
「検証の型」へ「ワークフローを直す PR では陽性が出せない」を足すか諮る。
coding-standards が3行（いずれも 2026-08-26 の #18 で出た）:
検査器の収集層を TypeScript 7.1 の新 API へ移す（保留・7.1 公開が着手条件） ／
併置されたテストが検査器の除外に入らない ／
検査器のコメントを規約の粒度で見直す。
概念側は `fermentary/memory/inbox.md` 2026-08-25「コピー配布された規約は、逆流の経路を持たない限り…」。

**#10**（public 化と実地検証）は #9 の後。gh-review 二系統（PR 自動レビュー・`@claude` 対話）とも
陽性テスト済みで、公開の前提（#54 README・#55 ライセンス）も揃ったので、着手できる状態にある。

## 開いている issue

**次の実装は #3**（S2・テーマのスキーマとシード）。
#2 でベースマップが立ち、描画層の載る土台はできた。

- 実装: #3〜#6（S2〜S3）。**次はここ**。
  **#5 は #19 が決まるまで書けない**（読み込み口が #19 の決定に従う）
- 実装（先に降りた束）: #27（S6・RSS 同期）／ #26（S8・GitHub Pages 配信）／ #62（S8・`/about` とフッタの出典・ライセンス表記）
- 器の構成: #41（VISION・人間との対話が本体）
- gh-review: #10（人間・public 化と実地検証）。前提の #54・#55 は済んだ（下記「済んだもの」）
- 決定レーン: #19（Claude・#3 依存。#5 のブロッカーでもある）
- 検証層: #66（Claude・E2E スモークの配線）。**決定は済んでいる**ので設計から始めない。
  守らせる範囲も採らなかった案も実測も ADR-0014 が持つ。
  #66 の覚え書きはそのうち配線で踏む落とし穴だけを抜き出したもので、ADR の代わりにはならない

## 配布物の追随

**未達はいま無い**。
`fermentary/playbooks/coding-standards.md` の配布手順は7段とも通っている。
最後まで残っていた機械層（`web/biome.json` + `web/scripts/lint-comments.ts` + `web/tests/`）は 2026-08-26 に #18 で入った。

- **追随は、この器の開発を再開するときにまとめてやる**（2026-08-26 の方針）。
  都度の追随はそこで打ち切りにしたので、放っておけば雛形との乖離は開き続ける。
  実装へ触れる最初のセッションが配布手順を通し直す。
- 検査器は正典のコピーで**バイト一致を保っている**。
  直すときは正典（`fermentary/tools/coding-standards/scripts/lint-comments.ts`）を先に直して配り直す。
  器の側で直すと、次の追随で黙って踏み潰される。

## issue にしなかった覚え書き（該当 issue に着手するとき拾う）

- `data/eras.json` 末尾の `end: 2030` は現在より先。スライダー右端が未来を指してよいかは #3 で決める
- 一つのエピソードが複数シリーズに跨る回（対談・番外編）と、`match` 正規表現の衝突時の優先順位。
  #3 が `themeId` を単数 nullable で固定するので、S6 の精緻化のときに突き合わせる
- モバイルでの振る舞い（全画面マップ + 下部スライダー + 左パネル）の範囲は S8 の精緻化で決める
- **S4 を割るときは [ADR-0015](docs/adr/0015-css-modules.md) の「帰結」を開く**。スタイルの書き方（CSS Modules）と、S4 が `globals.css` のトークンを置く分担をそこが持つ

## 精緻化の状態

- issue へ降りている: **S1〜S3**（#2〜#6）・**S6**（#27）・**S8**（#26）
- 粗いまま: **S4・S5・S7**、および任意課題の S9。
  **#6 が閉じたら次の束（S4・S5）を割る**（正典: `fermentary/playbooks/planning.md`「精緻化はいつやるか」）。
  S7 を割る単位は `ROADMAP.md`「順序の理由」末尾の分割規約が持つ

## 済んだもの

- 2026-08-28 #65 完了（CSS の書き方）。**CSS Modules で書き、CSS フレームワークは入れない**（[ADR-0015](docs/adr/0015-css-modules.md)）。
  人間が三択（素の CSS 1 枚 / CSS Modules / Tailwind v4）から選び、適用は「いまから」を採った。
  設定も依存追加も無いので、導入のための issue は起こさない。
  S4 が最初の `*.module.css` と `globals.css` のトークンを置いた時点で適用が始まる。
  `ARCHITECTURE.md`「技術スタック」へ「スタイル」の行を足した。
- 2026-08-27 #2 完了（S1・ベースマップの全画面表示）。
  `web/src/lib/map-config.ts`（接続先と初期表示位置）と `web/src/components/MapCanvas.tsx`（`<Map>` への配線）を置き、トップページから読む。
  react-map-gl が maplibre 本体を実行時に動的 import するので、**`next/dynamic` の `ssr: false` は使っていない**（issue の指示から外れた判断）。
  プリレンダは window に触らずに通るため `ssr: false` が要らず、入れるとページごとクライアント側へ落ちる（Server Component では渡せないため）。
  **MapLibre の worker はこの器が配る**（ADR-0013。ADR-0012 の v5 固定を supersede）。
  最初 v6 で出したが実機で地図が描画されず、人間の報告を受けて追った。
  v6 は worker を別ファイルで `import.meta.url` からの相対で取りに行き、バンドル後のその URL は Turbopack のチャンクを指すので 404 の HTML が返る。
  worker はタイルのデコードを担うので、無いと attribution だけが乗った空白の画面になる。
  一度 v5 へ固定して避けたが、新しい版に乗り続ける方を採って v6 へ戻した。
  配線は三点（`dev`・`build` の前段で `public/` へ複製・複製は追跡しない・`workerUrl` で名指す）で、`BASE_PATH` は `web/src/lib/base-path.ts` が一箇所で持つ。
  **実機で地図が出るところまでは確認した**（2026-08-27、人間）。
  パン・ズームの手触りと淡色の濃度は未判定。
  **ブラウザプレビューでは地図の描画を検証できない**——ペインのタブが `visibilityState: hidden` のままなので `requestAnimationFrame` が回らず、初回描画も `load` も起きずタイル要求がゼロで止まる。
  この器で地図の描画に触る issue は、機械判定の緑と実機の目視を必ずセットにする。
  プレビューで確認できるのは DOM の層だけ（attribution の文言と位置・body の余白・コンテナが viewport に追随すること）。
- 2026-08-27 ライセンスを決めた（#55）。
  コードは MIT（ルートに `LICENSE`）、`data/` のキュレーション層（`themes.geojson`・`eras.json`）は CC BY 4.0、番組由来の要素はどちらの範囲でもない（[ADR-0011](docs/adr/0011-license.md)）。
  範囲の限定を `LICENSE` 本文へ書かないのは、除外条項を足すと SPDX として MIT と識別されなくなり `licenseInfo` が `NOASSERTION` へ倒れうるため。
  README のライセンス節は同じ PR で入れた。
  残りは ADR だけが行き先を知る状態を避けて issue 本文へ降ろした（`data/LICENSE` は #3、`/about` とフッタの文言は #62、`licenseInfo` の検出確認は #10 の完了条件）。
  #25 が置き場を `ARCHITECTURE.md` へ反映するところで止めて文言を S8 へ残したのに、その S8 issue が無かったので、#62 を新規に起票した。
- 2026-08-27 ルートに最小の README を置いた（#54）。
  五節（一行の説明・現況・技術スタック・文書への導線・出典と引用の範囲）だけで、
  スクリーンショットも設計判断の詳説も公開 URL も持たないポートフォリオ版は S8 の分担。
  出典の節は ADR-0008 が README へ要求する4点を満たす。
  ライセンス節は #55 で足したので、いまは六節。
- 2026-08-27 #25 完了。`ARCHITECTURE.md` の §3 と §4 を ADR-0008 へ追随させた。
  スキーマ例の `summary` を空にし、UI 構成へ `/about` とフッタを足した。
  文言そのもの（フッタと `/about` の本文）は S8、README は #54 の持ち分で、
  出典表記の正は ADR-0008 のままにして本文を複製していない。
  フッタの物理的な置き場所は全画面マップの制約次第なので S8 の判断に残した
- 2026-08-27 台帳の乖離を5点直し、公開の前提を2枚起票した。
  `ARCHITECTURE.md` は §5 と §6 が `sync-feed.ts` の置き場で食い違っていたので、
  `web/` の道具立てに依るスクリプトは `web/scripts/` へ統一した（#3・#19・#27 の綴りも追随）。
  `data/` はルート側にあって `web/tsconfig.json` の `include` の外にあり `resolveJsonModule` は
  `.json` にしか効かないので、**`data/themes.geojson` は素の `import` では読めない**。
  この始末は #19 の「決めること」へ入れ、#5 の前提欄へ #19 を足した
  （#19 の本文は「#5 を書く前に決める」と言っていたのに、#5 側が拾っていなかった）。
  #25 の完了条件は旧プランの節番号（§2・§3）のままで、同じ issue の「作るもの」（§3・§4）と
  食い違っていたので現行の `ARCHITECTURE.md` へ揃えた。
  README（#54）とライセンス（#55）を起票して #10 の前提へ入れた。
  README が無いまま public にすると、S8 のポートフォリオ版が揃うまで説明の無いリポジトリが晒される。
- 2026-07-14 立ち上げ。プランを一枚の地図へ正典化（Next.js static export + MapLibre）
- 2026-07-14 S0 完了。移設・git init・初回コミット・Cowork 化・fermentary 並置
- 2026-08-02 台帳を **issue 台帳版へ移行**。プランの地図を状態を持たない形へ改訂し、
  S1〜S3 を issue 草稿へ精緻化。テスト = Vitest、判定の口 = `mise run check` を決定
- 2026-08-02 ラベル19枚と issue #1〜#6 を登録し、草稿を撤去
- 2026-08-22 bootstrap 配布物を正典へ追随（`chore/sync-bootstrap`）。規約の核と skill を
  現行版へ、CLAUDE.md に規約・gh-review・経緯の受け皿の入口、`.claude/settings.json` を配置。
  機械層と workflows は前提未達で見送り
- 2026-08-23 GH 基盤のうち実行環境に依存しない層を配置。PR テンプレ、`claude-code-review.yml`、
  issue テンプレの `name` を3文字以上へ修正（`作業` は2文字でテンプレート選択画面に出ていなかった）。
  残りは #8〜#10 へ降ろした
- 2026-08-23 未 issue 化分を洗い出し、#13〜#19 を登録して草稿を撤去。
  内訳は実地検証2・未決定の決定4・配布の未達分1。S4 以降は精緻化の規律どおり降ろしていない
- 2026-08-25 S1 の足場が立った（#1・PR #30）。
  Next.js 16 の static export、Biome、Vitest。
  判定の口は一本（当初 `mise run check`。2026-08-25 に `pnpm check` へ移した。下記）で、
  ランタイムは `mise.toml` が node 24 / pnpm 11.21.0 に固定する。
  `basePath` が dev にも効くので、開発サーバで開くのは `/coten-atlas`（`/` は 404）
- 2026-08-25 リモート実行（Claude Code on the web）の設定を配置。
  `.claude/hooks/session-start.sh`（`CLAUDE_CODE_REMOTE` の門 + `require_git_author` + mise の導入）と
  `settings.json` の `SessionStart` 配線、`CLAUDE.md` へ縮退モードのブロック。
  mise は `mise.run` へ出られないので npm から入れる（ランタイム版をリモートでも
  `mise.toml` の固定へ揃えるため。2026-08-25 に理由文を実態へ直した）。**リモートでは未検証**——egress の実測は人間が環境を立ててから
- 2026-08-25 #8 完了・クローズ。`/install-github-app` で GitHub App 導入と
  `CLAUDE_CODE_OAUTH_TOKEN` の secrets 登録が済んだ。`/install-github-app` は
  ワークフロー変更を PR #34 として main へ直接マージしており、副作用として `claude-code-review.yml` が
  GitHub 公式のデフォルト生成物へ上書きされ、`claude.yml`（`@claude` 対話用）が新規に届いた。
  この生成物は `gh-review.md` の契約から複数逸脱している——`issues` トリガを持つ、
  `author_association` の絞りが無い、`pull_request` 経路が fork を絞っていない、
  `timeout-minutes` と `concurrency: cancel-in-progress: false` が無い、
  `claude.yml` の `allowed-tools` が無指定。**#9 で埋める**
- 2026-08-25 #9 完了・クローズ（PR #35, #36）。`claude.yml` / `claude-code-review.yml` を
  fermentary の雛形（`author_association` 絞り・fork 絞り・`timeout-minutes`・`concurrency`
  非対称・`allowed-tools` 名指しを含む契約準拠版）へ置き換え、`check.yml`（`mise run check`
  一本を CI の判定口にする）を新規追加した。
  陽性テストの過程で `claude-code-action` 側の既知のリグレッション（native installer が
  `~/.local/bin` 不在時に「missing or broken」と警告しつつ success を騙り、後続の SDK 実行が
  ENOENT で落ちる。upstream `anthropics/claude-code-action#1290` と同種、2026-05 にも一度発生し
  再発した）を実測（rerun でも再現し一過性ではないことを確認）。PR #36 で `mkdir -p ~/.local/bin`
  を対処として追加し、issue #9 のコメントで `@claude` を呼ぶ陽性テストが success で通ることを確認した。
  upstream は 2026-08-25 時点でまだ open のため、この対処は当面残す
  （upstream が直ってから外す作業は fermentary へ還すかは未定）
- 2026-08-25 **判定の口を mise tasks から pnpm scripts へ移した**。`pnpm check` の一本
  （`tsc --noEmit` → `biome ci .` → `vitest run` → `next build`。static export は
  ビルド時にしか壊れない失敗を持つので `next build` を口に含める）。`mise.toml` は
  `[tools]` だけを持つ。薄いラッパの mise task も置かない。
  波及先は package.json / mise.toml / CI 二本 / settings.json / session-start.sh /
  CLAUDE.md / プランの地図 §1・§0・§4・§5（現 ADR-0009 / ROADMAP.md / ARCHITECTURE.md）/ PR・issue テンプレ / NEXT.md。
  toolchain 正典（タスクランナー = mise tasks）からの逸脱は CLAUDE.md に記録し、
  正典の改定は fermentary/NEXT.md へ諮ってある。
  **これ以前の記録に出てくる `mise run check` / `mise run sync` は読み替える**
  CI（PR #38）は最初 run が一つも作られなかった。
  原因は `check.yml` ではなく main との競合。
  枝分かれした後に PR #22 がプランの地図を触ったので PR が `dirty` になり、
  GitHub が `refs/pull/38/merge` を作れず `pull_request` トリガが起動しない。
  main を取り込み、S5（#22 の近接の三つ）と S6（`pnpm sync`）の双方を残す形で競合を解いた。
  `Check` run #7 が緑。
  node は `mise.toml` の固定どおり 24.19.0 で走り、`pnpm check` の四段が全て通った。
  PR 本文が「CI の緑をもって node 24 での確認とする」として保留していた分は、これで済んでいる。
  `claude-code-review.yml` は `types: [opened, ready_for_review, reopened]` なので、
  この PR では一度も起動していない（`opened` の時点で競合しており、その後の push は `synchronize`）。
  自動レビューを掛けるなら人間が `ready_for_review` か再オープンで叩く
- 2026-08-25 器の構成を toiito へ寄せる設計。文書を五層（`VISION` なぜ > `ARCHITECTURE` どう >
  `HARNESS` 検証 > `ROADMAP` 順序、決定と経緯は `docs/adr/`）へ割る・プラン一枚は撤去して
  ルートの `ROADMAP.md` へ・**ADR を導入**・アプリ本体を `web/` 配下へ、を決定し #39〜#42 を登録して草稿を撤去。
  ADR を入れる直接の理由は現物にあった——`mise run check` → `pnpm check` の移設が決定表のセルを
  その場で書き換えており、旧決定の本文は git 履歴にしか残っていない（決定日は 2026-08-02 のまま中身だけ 08-25）。
  fermentary へは4件搬送（配布型の規約の逆流・ADR の playbook 新設・器の骨格の雛形化・gh-review への申し送り）
- 2026-08-25 リモートセッションの膜素材を搬入。競合した PR で run が生成されない件は
  `fermentary/kb/github-actions.md` へ事実として、契約に足すかは同 `NEXT.md` の搬送行で諮る
- 2026-08-25 **push 権限を改定し、force push の門を置いた**（#43）。`Bash(git push:*)` は雛形どおり
  allow へ戻し、戻せない形だけを `.claude/hooks/guard-force-push.sh`（PreToolUse）が拾って ask へ回す。
  権限パターンは前方一致なので `git push origin --force` の語順を拾えず、列挙では塞げないため
  コマンド全文を見るフックにした。CLAUDE.md の push 規則は「git」節へ集約した。
  **リモートセッションで発火を実測（2026-08-25）**——`git push --force --dry-run origin <branch>` で
  確認ダイアログが出て（陽性）、素の `git push -u origin <branch>` は訊かれずに通った（陰性）。
  権限設定はセッション開始時に読まれるので、フックを入れた回のセッションでは確かめられない
- 2026-08-25 **`claude.yml` の run の大半が `skipped` で終わるのは適切**と判断した。
  結論と根拠は ADR-0010。ワークフロー側は触っていない——
  `claude.yml` は雛形の写しで「FILL 以外は契約」と自己宣言しており、コメント一行でも逸脱になる。
  一般化できる知見だが、契約（`gh-review.md`）側も触っていない。
  `get_workflow_run_usage` は消費実績の出典に使えない——この器では 335 秒走った success の run も
  `total_ms: 0` を返すので、`skipped` の 0 と区別が付かない
- 2026-08-25 #40 完了。文書を五層へ割り、プラン一枚を撤去した。
  `docs/adr/`（0001〜0010。0002 は 0009 に supersede されたヘッダ付きで本文を残す）／
  `ARCHITECTURE.md`（現況）／ `ROADMAP.md`（順序）／ `HARNESS.md`（検証）。
  `VISION.md` は未作成のまま名前だけ予約してある（#41）。
  `CLAUDE.md` の「ADR は置かない」は逆へ書き直し（8.8KB → 6.0KB）、検証と実行環境の記述は
  `HARNESS.md` へ移した。参照の付け替えで**コメント一行だけ**設定ファイルにも触れている
  （mise.toml / next.config.ts / CI 二本 / settings.json）——完了条件が「プランへの参照 0 件」なので
  避けられなかった。#39 は先にマージされたので、`ARCHITECTURE.md`「ディレクトリ構造」は
  `web/` 移設後の姿へこちらが追随した。
  **ADR-0010 は移設中に生えた**——main が決定表へ「gh-review の起動の絞り」を足したのが、
  こちらが消す側の表だったため。表を畳む作業と表への追記が並走すると、後から入った決定は
  黙って落ちる。**表を撤去する PR が走っている間は、表へ足さず ADR へ直接足す**
- 2026-08-26 #44 完了・クローズ（PR #49）。`claude-code-review.yml` に `timeout-minutes: 30` と
  `concurrency`（group は PR 番号、`cancel-in-progress: false`）を置いた。三本とも上限と排他を持つ状態になった。
  一歩目の照合の結果は**雛形が持っていない**側だったが、写し落としではなく**雛形が正典に追随していない**欠落である
  ——`gh-review.md`「実行を縛る」は両方を要求しており、`claude.yml` の雛形は持っている。
  よって器は正典どおり足せばよく、逸脱記録は要らない（ファイル冒頭に断り書き一行だけ置いた。雛形が直ったら消す）。
  `timeout` を実測（レビュー一本 7分48秒、PR #43）へ寄せず正典の目安 30 に置いたのは、
  サンプルが一本しか無いことと、器側だけ短くすると雛形との差分をもう一つ抱えることによる。
  **ワークフローを直す PR には自動レビューが付かない**——`claude-code-action` は走っている
  ワークフローの内容がデフォルトブランチの版と一致しなければ実行を飛ばす。
  質が悪いのは、そのスキップが **`success` で終わる**こと（PR #49 の run は 12 秒・緑・コメントゼロ）。
  run 一覧からはレビュー完走と区別が付かず、判定はログの `Exiting due to workflow validation skip` を見るしかない。
  **上限が効いていること自体はその run で確認できる**（ワークフローファイルは PR ブランチの版で評価される）が、
  自動レビューの陽性は**次にレビューが走る PR** まで出せない。次の PR がその実地になる。
  fermentary へは3件諮った（`fermentary/NEXT.md` の搬送行）: 起動の絞りは job 側の `if:` が唯一 ／
  雛形の `timeout-minutes`・`concurrency` 欠落 ／「検証の型」がワークフロー変更 PR の陽性不能を扱っていない。
  事実2件は `fermentary/kb/github-actions.md` へ収録済み（上の validation スキップと、
  `get_workflow_run_usage` が消費実績の出典に使えないこと）
