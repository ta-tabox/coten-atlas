# ADR — 決定と経緯の置き場

このリポジトリの決定は、1決定1レコードでここに置く。
`docs/ARCHITECTURE.md` が持つのは**現況**、`docs/ROADMAP.md` が持つのは**順序**、
`docs/HARNESS.md` が持つのは**検証**で、**なぜそう決めたか**を持つのはここだけ。

前身は「coten-atlas 実装プラン（地図）」§1 決定事項の表で、2026-08-25 に1決定1レコードへ割った。
表をやめた理由は現物にある——`mise run check` → `pnpm check` の移設（`45d1991`）が
該当セルをその場で書き換えており、旧決定の本文が git 履歴にしか残っていない。
しかも決定日は `2026-08-02` のまま中身だけ 2026-08-25 になった。
表というかたちが、決定と決定日を別々に上書きできてしまう。

## 規約

1. **1ファイル1決定**。命名は `<識別子>.md` で、識別子は `YYYYMMDD-<slug>`（例: `20260927-adr-date-slug-identifier`）
   `YYYYMMDD` はヘッダの決定日、`<slug>` は決定を表す英小文字・数字・ハイフンの語句
   識別子を決定日と決定の内容だけから導くので、並行するブランチが互いの ADR を知らずに書いても名前が衝突しない
   同じ日の ADR は slug で区別し、同じ日の中の順序は持たない
   識別子が既存のものと完全に一致したら、後から書く側が slug を変える
   完全に一致した場合は git が同じパスの追加として衝突させるので、重複は黙って入らない
2. **ヘッダ**: `状態`（`採用` / `supersede 済み（→ <識別子>）`）・`決定日`・`関係する ADR`
3. **節は 文脈 / 決定 / 理由（採らなかった案と、それを採らなかった条件）/ 帰結 / 覆る条件**
4. **書き換えない。** 覆すときは新しい ADR を書き、旧 ADR のヘッダに
   `supersede 済み（→ <識別子>）` を足すだけ（**本文は一字も削らない**）
   **意味が変わる変更は、一部だけでも同じ**
   一節だけを直したくなっても、旧 ADR は残したまま新しい ADR を書き、変わらない部分は複写する
   決定は生きていて帰結だけが古くなった場合も、帰結を直した新しい版を書く
   帰結が古くなったとは、決定の波及先（この決定を受けて何が変わるか）が動いたことを指す
   決定時点の例として書いたファイル名・関数名・値の一覧（規約7）の字面が現況と違うだけなら、決定・理由・帰結・覆る条件のどれも動いていないので、新しい版を書かない
   その現況はコードと現況の文書が持つ
   1 レコードは「その時点で正しかった設計の状態」を全体で一つ示すものなので、部分の書き換えを許すと、どの時点の状態を読んでいるのかが読み手に分からなくなる
   複写の手間より、状態が一つに定まることを優先する
   例外は**意味を変えない語彙の置き換え**（用語の統一・読み手に意味をより明確にする言い換え）
   これはその場で直してよい
   決定・理由・帰結のどれかが動くなら例外に当たらない
5. **ADR にするのは、モジュールの外から見える形を変える決定だけ。**
   外から見える形とは、公開する関数と型・データの形・層の依存の向き・リポジトリ全体に効く選択（ライセンス・配信先・外部サービス・ツールチェーン・検査の連鎖）の四つを指す
   判定は「その選択を知らずに別のモジュールか別の PR を書く人が、コードと git の履歴だけでは気付けずに間違えるか」の一問で、四つのどれにも当たらなければ ADR にしない
   issue や着手の指示が ADR を書くと指定していても、この判定を先に通す
   ADR にしない選択の理由は、コミットの本文と、そのモジュールの冒頭のコメントに書く（規範は `.claude/rules/coding.md`「コメント」節）
   ADR にしなかった事柄は列挙しない（判定が上の一問なので、一覧が無くても次に書く人が同じ答えに至る）
   未決の論点は issue、順序は `docs/ROADMAP.md`、現況は `docs/ARCHITECTURE.md` が持つ
6. **簡潔に書く。**
   ADR は決めた回に一度書かれ、その後は何度も参照される
   書く労力より読む労力を減らす方を選ぶ
   - **全節に当てる**: 一文一意。同じ事実を二度書かない。決定を読むために要らない経緯は書かない
   - **表にする**: 決定そのものが値であるもの（値域・固定する版・上限・案の比較）、状況と選択の対応、可否の別
     現況の一覧（ファイル・script・列の一覧）は表にせず、規約7 に従って現況の文書を指す
   - **1 行 1 項目にする**: 理由と、採らなかった案（「案 ／ 採らなかった理由」）
   - **決定の節は並べ方も決める**: 決定した順でなく読み手が参照する単位（欄ごと・値ごと・状況ごと）
     番号で節を割ると、一つの欄を調べる人が複数の節を読む
   - **既にマージされたレコードには当てない**: 組み直しは規約4 に当たる
7. **決定はアーキテクチャの水準で書き、個別の実装に関与しない。**
   決定の本体（決定の節で言い切る文）に置くのは、責務の切り方・層の境界・採る方式・満たす条件である
   ファイル名・関数名・値の一覧は決定の本体にせず、決定時点の例として書き、「現況は X が持つ」と現況の置き場を添える
   現況を持つのはコードと現況の文書（`docs/ARCHITECTURE.md`・`docs/HARNESS.md`・`.claude/rules/`）で、ADR ではない
   実装の詳細を決定の本体に置くと、実装が動くたびに ADR が古くなり、決定が動いていないのに規約4 の改訂版が要ることになるので、決定の本体を実装の詳細から切り離す

ADR の外（コード・現況の文書・issue・PR）から指すときは、識別子だけでは中身が読めないので `ADR-<識別子>（決定の名前）` と書く。
ファイルのパスで指すときは `docs/adr/<識別子>.md` と書く。

**`覆る条件` を空にしない。**
ここが書けない決定は、覆るときに誰も気付かないので、採用のまま永久に残る。
書こうとして書けないなら、それは決定ではなく既定の踏襲なので、規約5 に従って ADR にしない。

## 雛形

```markdown
# 決定を一行で

- **状態**: 採用
- **決定日**: YYYY-MM-DD
- **関係する ADR**: なし

## 文脈

何が問題で、なぜ今決める必要があるのか。

## 決定

何を決めたか。

## 理由

なぜそれを選んだか。
**採らなかった案と、それを採らなかった条件**を併記する
（条件が変われば覆るので、下の「覆る条件」と対になる）。

## 帰結

この決定を受けて何が変わるか。波及先。

## 覆る条件

何が起きたらこの決定を見直すか。
```

## 一覧

| ADR | 決定 | 決定日 | 状態 | 旧番号 |
|---|---|---|---|---|
| [20260714-maplibre](20260714-maplibre.md) | 地図ライブラリに MapLibre GL JS を採る | 2026-07-14 | 採用 | 0003 |
| [20260714-nextjs-static-export](20260714-nextjs-static-export.md) | スタックを Next.js App Router + TypeScript の static export にする | 2026-07-14 | 採用 | 0001 |
| [20260714-two-layer-data](20260714-two-layer-data.md) | データを「エピソード = RSS 自動 / テーマ = 人間キュレーション」の二層に分ける | 2026-07-14 | supersede 済み（→ 20260904-two-layer-data-without-inbox） | 0005 |
| [20260802-mise-run-check](20260802-mise-run-check.md) | 機械判定の口を `mise run check` 一本にする | 2026-08-02 | supersede 済み（→ 20260825-pnpm-check） | 0002 |
| [20260823-github-pages](20260823-github-pages.md) | GitHub Pages で配信し、独自ドメインは当てない | 2026-08-23 | 採用 | 0007 |
| [20260823-openfreemap-positron](20260823-openfreemap-positron.md) | ベースマップに OpenFreeMap positron を採る（代替は Carto Positron） | 2026-08-23 | 採用 | 0004 |
| [20260823-quote-titles-only](20260823-quote-titles-only.md) | 引用は題号に限り、説明文・ロゴ・カバーアートに触れない | 2026-08-23 | 採用 | 0008 |
| [20260823-rss-link-as-episode-url](20260823-rss-link-as-episode-url.md) | 配信リンクは RSS の `<link>` をそのまま使う | 2026-08-23 | supersede 済み（→ 20261009-three-platform-episode-links） | 0006 |
| [20260825-gh-review-trigger-narrowing](20260825-gh-review-trigger-narrowing.md) | gh-review の起動を絞るのは job 側の `if:` の一本にする | 2026-08-25 | 採用 | 0010 |
| [20260825-pnpm-check](20260825-pnpm-check.md) | 判定の口を `pnpm check` へ移す（20260802-mise-run-check を supersede） | 2026-08-25 | supersede 済み（→ 20260914-pnpm-check-current-form） | 0009 |
| [20260827-license](20260827-license.md) | コードは MIT、データは CC BY 4.0、番組由来の要素は範囲外と明記する | 2026-08-27 | 採用 | 0011 |
| [20260827-maplibre-v5](20260827-maplibre-v5.md) | maplibre-gl は v5 系に固定する | 2026-08-27 | supersede 済み（→ 20260827-maplibre-worker-self-hosted） | 0012 |
| [20260827-maplibre-worker-self-hosted](20260827-maplibre-worker-self-hosted.md) | MapLibre の worker はこのリポジトリが配る（20260827-maplibre-v5 を supersede） | 2026-08-27 | 採用 | 0013 |
| [20260828-css-modules](20260828-css-modules.md) | スタイルは CSS Modules で書き、CSS フレームワークを入れない | 2026-08-28 | supersede 済み（→ 20260831-tailwind-v4） | 0015 |
| [20260828-e2e-offline-smoke](20260828-e2e-offline-smoke.md) | E2E を入れる（外部を遮断したスモーク1枚に限る） | 2026-08-28 | 採用 | 0014 |
| [20260829-era-open-end](20260829-era-open-end.md) | 終わっていない era の `end` は年を書かず、印を置く | 2026-08-29 | 採用 | 0019 |
| [20260829-local-only-instructions](20260829-local-only-instructions.md) | 手元の環境にだけ意味を持つ指示と申し送りは追跡しない | 2026-08-29 | 採用 | 0017 |
| [20260829-playwright-runner](20260829-playwright-runner.md) | ブラウザを立てる検証は Playwright が回し、Vitest は純関数だけを見る | 2026-08-29 | 採用 | 0016 |
| [20260829-season-as-assignment-key](20260829-season-as-assignment-key.md) | エピソードとテーマの割当キーを `itunes:season` にする | 2026-08-29 | supersede 済み（→ 20260915-season-assignment-precedence） | 0018 |
| [20260830-series-rename](20260830-series-rename.md) | 地図の 1 エントリの呼び名を `series` にする | 2026-08-30 | 採用 | 0020 |
| [20260831-kind-place-or-concept](20260831-kind-place-or-concept.md) | `kind` は geometry から導けない差だけを持つ | 2026-08-31 | supersede 済み（→ 20260911-drop-series-kind） | 0023 |
| [20260831-map-dom-boundary](20260831-map-dom-boundary.md) | 地図の上に載せるものは React 側で書き、MapLibre の DOM は canvas と attribution に限る | 2026-08-31 | 採用 | 0022 |
| [20260831-tailwind-v4](20260831-tailwind-v4.md) | スタイルを Tailwind v4 で書く（20260828-css-modules を supersede） | 2026-08-31 | 採用 | 0021 |
| [20260901-map-feature-carries-key-only](20260901-map-feature-carries-key-only.md) | 地図から返る feature は鍵の運搬に限り、シリーズの属性は `data/` を読んだ値から引く | 2026-09-01 | 採用 | 0024 |
| [20260901-retire-next-md](20260901-retire-next-md.md) | 申し送りの層（`NEXT.md`）を畳み、状態・順序・決定・現況の四つの外に層を作らない | 2026-09-01 | 採用 | 0025 |
| [20260902-local-only-admin](20260902-local-only-admin.md) | データを編集する管理画面は手元でだけ動かし、保存先は git のまま | 2026-09-02 | 採用 | 0028 |
| [20260902-series-and-loci](20260902-series-and-loci.md) | シリーズと事物を分け、シリーズは代表点の参照か位置なしの印を持つ | 2026-09-02 | 採用 | 0027 |
| [20260902-two-phase-location](20260902-two-phase-location.md) | 位置情報を二段階に分け、第一段階は代表点か位置なしに限る | 2026-09-02 | 採用 | 0026 |
| [20260904-two-layer-data-without-inbox](20260904-two-layer-data-without-inbox.md) | データを「エピソード = RSS 自動 / シリーズ = 人間キュレーション」の二層に分け、未割当は `episodes.json` の `seriesId` を正にする（20260714-two-layer-data を supersede） | 2026-09-04 | 採用 | 0029 |
| [20260906-catalog-rename](20260906-catalog-rename.md) | データの置き場の名前を `catalog/` にする | 2026-09-06 | 採用 | 0030 |
| [20260906-docs-under-docs](20260906-docs-under-docs.md) | リポジトリ自身の文書は `docs/` に置き、ルートには道具がその位置を要求するものだけを残す | 2026-09-06 | 採用 | 0032 |
| [20260906-lib-layout-by-concern](20260906-lib-layout-by-concern.md) | `web/src/lib/` は関心ごとのディレクトリで割り、ファイル名の接頭辞で代用しない | 2026-09-06 | 採用 | 0031 |
| [20260906-rules-under-claude](20260906-rules-under-claude.md) | 従わせる規則は `.claude/rules/` に置き、`docs/` には記述だけを残す | 2026-09-06 | 採用 | 0033 |
| [20260907-era-space-window](20260907-era-space-window.md) | 現在窓の幅は era 空間の位置で決め、`"present"` の右端は呼び出し元が渡す現在年にする | 2026-09-07 | 採用 | 0038 |
| [20260907-post-deploy-reachability](20260907-post-deploy-reachability.md) | 配信の直後に到達テストを走らせる（ブラウザを立てず、`src`・`href` のパスへの到達だけを検証する） | 2026-09-07 | 採用 | 0036 |
| [20260907-series-vocabulary](20260907-series-vocabulary.md) | 手で書く欄の語彙を決め、`region` は地図の区画・`tags` は種別と主題だけを持つ | 2026-09-07 | supersede 済み（→ 20260911-series-vocabulary-tiebreaks） | 0034 |
| [20260909-history-review-lane](20260909-history-review-lane.md) | 歴史の裏どりを `@historian` の別レーンに分け、Web 検索を許す | 2026-09-09 | 採用 | 0035 |
| [20260910-sources-layer](20260910-sources-layer.md) | `catalog/` の値の典拠を `docs/sources/<シリーズ id>.md` に置く | 2026-09-10 | 採用 | 0037 |
| [20260910-untimed-concept-series](20260910-untimed-concept-series.md) | 時代を跨いで続く概念史のシリーズは、`timeRange` に年を書かず時期なしの印を置く | 2026-09-10 | 採用 | 0039 |
| [20260911-drop-series-kind](20260911-drop-series-kind.md) | `series.json` の `kind` を廃止し、代表点を持つシリーズを同じ濃さで地図に描く（20260831-kind-place-or-concept を supersede） | 2026-09-11 | 採用 | 0042 |
| [20260911-era-fade-window-only](20260911-era-fade-window-only.md) | 地図の点の濃さは、現在窓との重なりから事物ごとに TypeScript で求めた数値をそのまま MapLibre の `circle-opacity` へ渡し、窓と重ならない事物は `filter` で除く（20260911-era-fade-wiring を supersede） | 2026-09-11 | 採用 | 0043 |
| [20260911-era-fade-wiring](20260911-era-fade-wiring.md) | 地図の点の濃さは、現在窓との重なりから事物ごとに TypeScript で求めた数値を MapLibre の `circle-opacity` へ渡し、窓と重ならない事物は `filter` で除く | 2026-09-11 | supersede 済み（→ 20260911-era-fade-window-only） | 0040 |
| [20260911-series-vocabulary-tiebreaks](20260911-series-vocabulary-tiebreaks.md) | 手で書く欄の語彙を決め、代表点・事物の `id`・`id` の語の区切りで候補が割れたときの選び方を足す（20260907-series-vocabulary を supersede） | 2026-09-11 | supersede 済み（→ 20260911-series-vocabulary-without-kind） | 0041 |
| [20260911-series-vocabulary-without-kind](20260911-series-vocabulary-without-kind.md) | 手で書く欄の語彙と、代表点・事物の `id`・`id` の語の区切りで候補が割れたときの選び方を、`kind` を除いて決め直す（20260911-series-vocabulary-tiebreaks を supersede） | 2026-09-11 | 採用 | 0044 |
| [20260914-pnpm-check-current-form](20260914-pnpm-check-current-form.md) | 判定の口は `web/` で打つ `pnpm check` の一本で、踏襲しているツールチェーンの規約と同じ形にする（20260825-pnpm-check を supersede） | 2026-09-14 | 採用 | 0045 |
| [20260915-season-assignment-precedence](20260915-season-assignment-precedence.md) | エピソードの割当に使う season を、訂正表・題名の先頭の `【NN-M】`・`itunes:season` の順に決める（20260829-season-as-assignment-key を supersede） | 2026-09-15 | 採用 | 0046 |
| [20260927-adr-date-slug-identifier](20260927-adr-date-slug-identifier.md) | ADR の識別子を決定日と slug にする | 2026-09-27 | 採用 | — |
| [20261009-three-platform-episode-links](20261009-three-platform-episode-links.md) | エピソードの配信リンクを Spotify・Apple Podcasts・YouTube の 3 基盤で持ち、RSS の `<link>` を使わない（20260823-rss-link-as-episode-url を supersede） | 2026-10-09 | 採用 | — |

**20260828-e2e-offline-smoke は人間の目視を L5 と呼んでいる。**
`docs/HARNESS.md`「検証の層構造」は番号を `pnpm check` の連鎖の位置に限り、人間の目視に番号を与えないので、20260828-e2e-offline-smoke の L5 は「人間の目視」と読む。

**`kind` を廃止する前に書かれたレコードは、シリーズが `kind` の欄を持つものとして書かれている。**
`kind` は [20260911-drop-series-kind](20260911-drop-series-kind.md) で廃止したので、supersede されていないレコード（20260823-quote-titles-only・20260831-tailwind-v4・20260902-two-phase-location・20260902-series-and-loci・20260909-history-review-lane・20260907-era-space-window・20260910-untimed-concept-series）にある `kind` の記述は、欄が在った時点の設計として読む。

**呼び名を `series` へ揃える前に書かれたレコードは `テーマ` の語で書かれている。**
地図の 1 エントリの呼び名を [20260830-series-rename](20260830-series-rename.md) で `series`（シリーズ）へ揃えたので、決定日が 20260830-series-rename より前のレコードにある「テーマ」は「シリーズ」と読む。

**文書を `docs/` へ移す前に書かれたレコードは `ARCHITECTURE.md`・`CODING.md`・`HARNESS.md`・`ROADMAP.md` をルート直下のものとして指している。**
この 4 本を [20260906-docs-under-docs](20260906-docs-under-docs.md) で `docs/` へ移したので、決定日が 20260906-docs-under-docs より前のレコードにある名指しは `docs/` の下と読む。
`CODING.md` だけは [20260906-rules-under-claude](20260906-rules-under-claude.md) で `.claude/rules/` へ分かれたので、`coding.md`（コード）か `writing.md`（文章・コミット）と読む。
ルートに残るのは `README.md`・`LICENSE`・`CLAUDE.md` だけである。

**置き場を `catalog/` へ改名する前に書かれたレコードは `data/` の名でデータの置き場を指している。**
置き場を [20260906-catalog-rename](20260906-catalog-rename.md) で `catalog/` へ改名したので、決定日が 20260906-catalog-rename より前のレコードにある `data/` は `catalog/` と読む。
上の一覧の 20260901-map-feature-carries-key-only の行も同じで、一覧は各レコードの語彙をそのまま写す。

**規約7 を足す前に書かれたレコードは、ファイル名・関数名・値の一覧を決定の本体に置いていることがある。**
規約7（決定はアーキテクチャの水準で書き、個別の実装に関与しない）より前に書かれたので、それらは決定時点の例と読み、現況はコードと現況の文書で確かめる。
名前・置き場・値域そのものを決めたレコード（20260830-series-rename の呼び名、20260906-catalog-rename・20260906-docs-under-docs・20260906-rules-under-claude の置き場、20260911-series-vocabulary-without-kind の語彙の値域など）では、その名前・置き場・値が決定の本体である。
字面が現況と違っても決定が動いていなければ、規約4 に従って改訂版は書かない。
