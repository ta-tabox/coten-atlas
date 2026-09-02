# ADR — 決定と経緯の受け皿

このリポジトリの決定は、1決定1レコードでここに置く。
`ARCHITECTURE.md` が持つのは**現況**、`ROADMAP.md` が持つのは**順序**、
`HARNESS.md` が持つのは**検証**で、**なぜそう決めたか**を持つのはここだけ。

前身は「coten-atlas 実装プラン（地図）」§1 決定事項の表で、2026-08-25 に1決定1レコードへ割った。
表をやめた理由は現物にある——`mise run check` → `pnpm check` の移設（`45d1991`）が
該当セルをその場で書き換えており、旧決定の本文が git 履歴にしか残っていない。
しかも決定日は `2026-08-02` のまま中身だけ 2026-08-25 になった。
表というかたちが、決定と決定日を別々に上書きできてしまう。

## 規約

1. **1ファイル1決定**。命名は `NNNN-<slug>.md`（4桁ゼロ埋め・連番・欠番を作らない）
2. **ヘッダ**: `状態`（`採用` / `supersede 済み（→ NNNN）`）・`決定日`・`関係する ADR`
3. **節は 文脈 / 決定 / 理由（採らなかった案と、それを採らなかった条件）/ 帰結 / 覆る条件**
4. **書き換えない。** 覆すときは新しい ADR を書き、旧 ADR のヘッダに
   `supersede 済み（→ NNNN）` を足すだけ（**本文は一字も削らない**）
   - 例外は一度だけ適用した（[0017](0017-local-only-instructions.md)、2026-08-29）。
     公開に先立ち、外から読んで解けない語彙を全 ADR の本文で置き換えた。
     動かしたのは語彙だけで、決定・理由・帰結は動かしていない
5. **「決定」と読めない事柄は ADR にしない。**
   未決の論点は issue、順序は `ROADMAP.md`、現況は `ARCHITECTURE.md`

## 一覧

| ADR | 決定 | 決定日 | 状態 |
|---|---|---|---|
| [0001](0001-nextjs-static-export.md) | スタックを Next.js App Router + TypeScript の static export にする | 2026-07-14 | 採用 |
| [0002](0002-mise-run-check.md) | 機械判定の口を `mise run check` 一本にする | 2026-08-02 | supersede 済み（→ 0009） |
| [0003](0003-maplibre.md) | 地図ライブラリに MapLibre GL JS を採る | 2026-07-14 | 採用 |
| [0004](0004-openfreemap-positron.md) | ベースマップに OpenFreeMap positron を採る（代替は Carto Positron） | 2026-08-23 | 採用 |
| [0005](0005-two-layer-data.md) | データを「エピソード = RSS 自動 / テーマ = 人間キュレーション」の二層に分ける | 2026-07-14 | 採用 |
| [0006](0006-rss-link-as-episode-url.md) | 配信リンクは RSS の `<link>` をそのまま使う | 2026-08-23 | 採用 |
| [0007](0007-github-pages.md) | GitHub Pages で配信し、独自ドメインは当てない | 2026-08-23 | 採用 |
| [0008](0008-quote-titles-only.md) | 引用は題号に限り、説明文・ロゴ・カバーアートに触れない | 2026-08-23 | 採用 |
| [0009](0009-pnpm-check.md) | 判定の口を `pnpm check` へ移す（0002 を supersede） | 2026-08-25 | 採用 |
| [0010](0010-gh-review-trigger-narrowing.md) | gh-review の起動を絞るのは job 側の `if:` の一本にする | 2026-08-25 | 採用 |
| [0011](0011-license.md) | コードは MIT、データは CC BY 4.0、番組由来の要素は範囲外と明記する | 2026-08-27 | 採用 |
| [0012](0012-maplibre-v5.md) | maplibre-gl は v5 系に固定する | 2026-08-27 | supersede 済み（→ 0013） |
| [0013](0013-maplibre-worker-self-hosted.md) | MapLibre の worker はこのリポジトリが配る（0012 を supersede） | 2026-08-27 | 採用 |
| [0014](0014-e2e-offline-smoke.md) | E2E を入れる（外部を遮断したスモーク1枚に限る） | 2026-08-28 | 採用 |
| [0015](0015-css-modules.md) | スタイルは CSS Modules で書き、CSS フレームワークを入れない | 2026-08-28 | supersede 済み（→ 0021） |
| [0016](0016-playwright-runner.md) | ブラウザを立てる検証は Playwright が回し、Vitest は純関数だけを見る | 2026-08-29 | 採用 |
| [0017](0017-local-only-instructions.md) | 手元の環境にだけ意味を持つ指示と申し送りは追跡しない | 2026-08-29 | 採用 |
| [0018](0018-season-as-assignment-key.md) | エピソードとテーマの割当キーを `itunes:season` にする | 2026-08-29 | 採用 |
| [0019](0019-era-open-end.md) | 終わっていない era の `end` は年を書かず、印を置く | 2026-08-29 | 採用 |
| [0020](0020-series-rename.md) | 地図の 1 エントリの呼び名を `series` にする | 2026-08-30 | 採用 |
| [0021](0021-tailwind-v4.md) | スタイルを Tailwind v4 で書く（0015 を supersede） | 2026-08-31 | 採用 |
| [0022](0022-map-dom-boundary.md) | 地図の上に載せるものは React 側で書き、MapLibre の DOM は canvas と attribution に限る | 2026-08-31 | 採用 |
| [0023](0023-kind-place-or-concept.md) | `kind` は geometry から導けない差だけを持つ | 2026-08-31 | 採用 |
| [0024](0024-map-feature-carries-key-only.md) | 地図から返る feature は鍵の運搬に限り、シリーズの属性は `data/` を読んだ値から引く | 2026-09-01 | 採用 |
| [0025](0025-retire-next-md.md) | 申し送りの層（`NEXT.md`）を畳み、状態・順序・決定・現況の四つの外に層を作らない | 2026-09-01 | 採用 |
| [0026](0026-two-phase-location.md) | 位置情報を二段階に分け、第一段階は代表点か位置なしに限る | 2026-09-02 | 採用 |
| [0027](0027-series-and-loci.md) | シリーズと事物を分け、シリーズは代表点の参照か位置なしの印を持つ | 2026-09-02 | 採用 |
| [0028](0028-local-only-admin.md) | データを編集する管理画面は手元でだけ動かし、保存先は git のまま | 2026-09-02 | 採用 |

**0019 までのレコードは `テーマ` の語で書かれている。**
地図の 1 エントリの呼び名を [0020](0020-series-rename.md) で `series`（シリーズ）へ揃えたので、それより前のレコードにある「テーマ」は「シリーズ」と読む。

## ADR にしないもの

次の3件は決定というより既定の踏襲なので、結論だけを `ARCHITECTURE.md`
「技術スタック」の表に置く（同表がそれらの唯一の記載になる）。

- ツールチェーン（mise + pnpm + Biome）——理由はこのリポジトリの外で決めており、ここでは踏襲するだけ
- テストランナー = Vitest（単体のみ。ブラウザを立てる層を分ける判断は [0016](0016-playwright-runner.md) が持つ）
- エピソード取得を RSS 自動同期にする——手順ごと `ARCHITECTURE.md`「RSS 同期パイプライン」が持つ

歴史地図（OpenHistoricalMap 連動を S9 へ後回し）は**順序の判断**なので `ROADMAP.md` 側。
