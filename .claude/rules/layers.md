---
paths:
  - "**/src/**"
  - "**/scripts/**"
---

# 置き場と依存の向き（リポジトリの表）

`coding.md`「置き場と依存の向き」の規則を、このリポジトリの実在するモジュールに当てた表。
`docs/ARCHITECTURE.md` は境界の禁止則をここへ委ね、「正は `.claude/rules/layers.md`」の一行で指す。
パスは `web/` からの相対で書く。
ただし `catalog/` はリポジトリのルート直下にあって `web/` の外なので、ルートからの名前で書く。

## 境界を閉じるモジュール

| 境界 | 閉じるモジュール | fetch を呼ぶか | 他のモジュールが受け取るもの |
|---|---|---|---|
| `catalog/` のファイル | アプリのビルドと管理画面は `src/lib/catalog-dir.ts`（読みは `loadSeries`・`loadLoci`・`loadEras`、最後のコミットの版の読みは `loadCommittedLoci`、書きは `saveLoci`）、同期は `scripts/sync-feed.ts` と `scripts/backfill-apple-podcasts.ts`（`catalog/` のパスは `scripts/catalog-files.ts`、JSON の構文の検査は `scripts/json-file.ts`） | 呼ばない | スキーマを通した `SeriesList`・`LocusCollection`・`EraList`・`EpisodeCollection`・`SeasonCorrectionList` |
| RSS（ネットワーク） | `scripts/sync-feed.ts` の `fetchFeed` | 呼ぶ | XML の文字列。`src/lib/feed/parse.ts` の `parseFeed` が検査済みの `FeedItem` の配列にする |
| Apple Podcasts の API（ネットワーク） | `scripts/apple-podcasts.ts` の `fetchAppleLookup`・`fetchAppleSearch` | 呼ぶ | `src/lib/schema/apple-podcasts.ts` の `parseAppleResponse` を通した `AppleEpisode` の配列 |
| 配信した `episodes.json`（ブラウザの fetch） | `src/lib/episodes.ts` の `fetchEpisodes` | 呼ぶ | `EpisodesResult`（`parseEpisodes` を通した `Episode` の配列か、取得の失敗） |
| ベースマップのスタイル（ブラウザの fetch） | `src/components/map/use-basemap-style.ts` の `useBasemapStyle` | 呼ぶ | 地名を日本語にしたスタイルか、取得に失敗したときの `BASEMAP_STYLE_URL` |
| 管理画面の保存の API（HTTP） | 受け手は `src/app/admin/api/loci/route.dev.ts`、送り手は `src/lib/admin-api.ts` の `patchLocus` | 送り手だけが呼ぶ | 受け手は `parseLocusPatch` を通した `LocusPatch`、送り手は `parseSaveResult` を通した保存しなかった理由の文の配列 |
| MapLibre の DOM とイベント | 公開の地図は `src/components/map/MapCanvas.tsx`（source と layer は子の `src/components/map/SeriesLayers.tsx`、押した位置の点の判定は子のフック `src/components/map/use-overlap-candidates.ts`、マウスを載せた点の判定は子のフック `src/components/map/use-hover-tooltip.ts`、どちらの点の取得も `src/components/map/points-under.ts`）、管理画面の地図は `src/components/admin/map/**`（ベースマップは `EditorMap.tsx`、編集の機能ごとのレイヤはその子） | 呼ばない | 公開の地図は押した位置の候補の `seriesId` の配列、管理画面の地図はドラッグして離した事物の `LocusPatch` |

## 境界の禁止則

- `fetch` を呼ぶのは、「境界を閉じるモジュール」の表で fetch を呼ぶとした行の、閉じるモジュールだけにする
  ベースマップのうちこのリポジトリのコードが取得するのはスタイルの JSON だけにし、タイル・グリフ・スプライトは MapLibre が取得する
- `node:fs` を import してよいモジュールは biome が見る（`.claude/rules/languages/typescript.project.md`「機械が見ている分」）
  `"use client"` を付けたモジュールからは `node:fs` へ届かないので、`src/lib/catalog-dir.ts` を呼ぶのは Server Component と Route Handler（`src/app/page.tsx`・`src/app/admin/page.dev.tsx`・`src/app/admin/api/loci/route.dev.ts`）だけにする
- `catalog/` のファイルは `import` で読まず、`node:fs` か、`public/` へ複製したものを `fetch` で読む
  `catalog/` は `tsconfig.json` の `include` の外にあって `resolveJsonModule` も `.geojson` に効かないので、読み方を二つに限れば `tsconfig.json` にも `vitest.config.ts` にも手当てが要らない
- ブラウザが取得する自前の URL（`episodes.json`・MapLibre の worker）は、`src/lib/base-path.ts` の `BASE_PATH` を先頭に付けて組む
  GitHub Pages はリポジトリ名を挟んだ場所へ配信するので、付けないと公開後に 404 になる
- `catalog/`・`public/`・RSS から読んだ値は、読んだモジュールの中で `parseSeries`・`parseLoci`・`parseEras`・`parseEpisodes`・`parseFeed` を通してから渡す
  `tests/catalog.test.ts` は `catalog/` の現物しか見ないので、複製し損ねた値や 404 の HTML はこの検査でしか止まらない
- MapLibre が出す DOM は canvas のコンテナと attribution だけにし、`<Popup>` と built-in control（Navigation・Scale 等）を使わない
  地図の上に載せるものは React + Tailwind の overlay で書く
  理由は `docs/adr/20260831-map-dom-boundary.md` が持つ
- `maplibre-gl`・`react-map-gl/maplibre` を import してよいモジュールは biome が見る（`.claude/rules/languages/typescript.project.md`「機械が見ている分」）
  そのうち `src/lib/map/layers/shared.ts` が import するのは型だけにする（値と型の区別は biome では見分けられない）

## 層と、import してよい相手

置き場は `web/` からの相対の glob で書き、glob と違う層に入るファイルだけを名指す。
一つのファイルが複数の行に当たるときは、名指した行を glob の行より優先する。
`web/src` の追跡しているファイルがどれかの行の置き場に当たることは、`web/tests/layers.test.ts` が見る。

| 層 | 置き場 | import してよい相手 | 持つもの |
|---|---|---|---|
| 境界の検証 | `src/lib/schema/**` | `src/lib/schema/**` の中だけ | zod のスキーマと、そこから導く型・`parse*` の関数・ファイルをまたぐ参照の判定 |
| フィードの二段 | `src/lib/feed/parse.*`（XML の表記を均す）・`src/lib/feed/schema.*`（値の規則）・`src/lib/feed/__fixtures__/**` | `src/lib/feed/` の中だけ | 均した記録と、検査済みの `FeedItem` |
| 設定の定数 | `src/lib/base-path.*`・`src/lib/map/config.ts` | `src/lib/base-path.*` | 公開先のパスの接頭辞 `BASE_PATH`・ベースマップと worker の URL・地図の初期位置 |
| 純粋な計算 | `src/lib/catalog-editor/**`・`src/lib/era/**`・`src/lib/map/**`・`src/lib/links/**`・`src/lib/site/**`・`src/lib/feed/apple-links.*`・`src/lib/feed/assign.*`・`src/lib/feed/episode.*`・`src/lib/feed/uncreated-seasons.*`・`src/lib/feed/survey-issue.*`・`src/lib/feed/sync-report.*`・`src/lib/format.*` | 境界の検証の型と定数・`src/lib/feed/schema.ts` の型・同じ層 | 関数とテスト |
| 境界 | `src/lib/catalog-dir.*`・`src/lib/episodes.*`・`src/lib/admin-api.*`・`scripts/json-file.ts`・`scripts/catalog-files.ts`・`scripts/apple-podcasts.ts` | 境界の検証・設定の定数・純粋な計算 | `node:fs`・`git`・`fetch` による読み書きと、境界の検証の呼び出し |
| 描画 | `src/components/**`（直下にはディレクトリだけを置き、フックは扱う機能のディレクトリに `use-*.ts` で置く） | 純粋な計算・境界の検証の型と定数・設定の定数・`src/lib/episodes.*`・`src/lib/admin-api.*`・同じ層 | React の部品とフック |
| 配線 | `src/app/**`・`scripts/sync-feed.ts`・`scripts/backfill-apple-podcasts.ts` | `src/app/**` は描画・`src/lib/catalog-dir.*`・純粋な計算・境界の検証、`scripts/sync-feed.ts` と `scripts/backfill-apple-podcasts.ts` はフィードの二段・純粋な計算・境界の検証・`scripts/json-file.ts`・`scripts/catalog-files.ts`・`scripts/apple-podcasts.ts` | 受け取り・呼び出し・出力 |
| スモークの機構 | `scripts/smoke.ts` | 設定の定数 | 配信物を開き、観測から違反を出す関数 |
| E2E の機構 | `scripts/e2e.ts` | `scripts/smoke.ts` | 画面の部品と地図の点の位置を求める関数 |
| コメントの検査 | `scripts/lint-comments.ts` | なし | コメントの禁止語の検査 |

## 一つしか無い状態の正

複数の部品が読む状態を並べる。
持つ部品は state を一つだけ持ち、読む部品へは props で渡す。

| 状態 | 持つ部品 | 書く部品 | 読む部品 |
|---|---|---|---|
| 選択中のシリーズ（`selectedSeriesId`） | `src/components/map/MapCanvas.tsx` | `MapCanvas`・`SeriesPanelBody`・`SeriesDetailBody`・`SeriesDetailCard` | `SeriesLayers`・`SeriesPanelBody`・`SeriesDetailBody`・`SeriesDetailCard` |
| era スライダーの位置（`eraPosition`） | `src/components/map/MapCanvas.tsx` | `EraSlider`・`MapCanvas` | `EraSlider`・`SeriesLayers`・`SeriesPanelBody` |
| タグの絞り込みに使うタグ（`selectedTags`） | `src/components/map/MapCanvas.tsx` | `SeriesPanelBody` | `SeriesLayers`・`SeriesPanelBody` |
| エピソードの取得の状態（`EpisodesState`） | `src/components/map/MapCanvas.tsx` | `MapCanvas` | `SeriesDetailBody` |
| 重なった代表点の候補（`overlap`） | `src/components/map/use-overlap-candidates.ts` | `MapCanvas` | `SeriesCandidateOverlay` |
| シートの段（`sheetStage`） | `src/components/map/MapCanvas.tsx` | `MapCanvas`・`BottomSheet` | `BottomSheet` |
| シートで era スライダーを出すか（`isEraSliderShown`） | `src/components/map/MapCanvas.tsx` | `MapCanvas`・`BottomSheet` | `BottomSheet` |
| シートの目標の高さ（`sheetTargetHeight`） | `src/components/map/MapCanvas.tsx` | `BottomSheet` | `MapCanvas` |

## プロジェクト固有（育てる欄）
- （このプロジェクトで決めた逸脱・追加をここに追記する。理由を一行添える）
