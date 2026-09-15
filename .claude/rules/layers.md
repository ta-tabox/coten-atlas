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

| 境界 | 閉じるモジュール | 他のモジュールが受け取るもの |
|---|---|---|
| `catalog/` のファイル | アプリのビルドは `src/lib/catalog-dir.ts`（`loadSeries`・`loadLoci`・`loadEras`）、同期は `scripts/sync-feed.ts`（JSON の構文の検査は `scripts/json-file.ts`） | スキーマを通した `SeriesList`・`LocusCollection`・`EraList`・`EpisodeCollection` |
| RSS（ネットワーク） | `scripts/sync-feed.ts` の `fetchFeed` | XML の文字列。`src/lib/feed/parse.ts` の `parseFeed` が検査済みの `FeedItem` の配列にする |
| 配信した `episodes.json`（ブラウザの fetch） | `src/lib/episodes.ts` の `fetchEpisodes` | `EpisodesResult`（`parseEpisodes` を通した `Episode` の配列か、取得の失敗） |
| MapLibre の DOM とイベント | `src/components/map/MapCanvas.tsx`（source と layer は子の `src/components/map/SeriesLayers.tsx`） | クリックした事物の `seriesId` |

## 境界の禁止則

- `fetch` を呼ぶのは `src/lib/episodes.ts` の `fetchEpisodes` と `scripts/sync-feed.ts` の `fetchFeed` だけにする
  ベースマップのタイルは MapLibre が取得し、このリポジトリのコードは `src/lib/map/config.ts` の URL を渡すだけにする
- `node:fs` を import するのは `src/lib/catalog-dir.ts`・`scripts/`・`tests/` だけにする
  `"use client"` を付けたモジュールからは `node:fs` へ届かないので、`src/lib/catalog-dir.ts` を呼ぶのは Server Component（`src/app/page.tsx`）だけにする
- `catalog/` のファイルは `import` で読まず、`node:fs` か、`public/` へ複製したものを `fetch` で読む
  `catalog/` は `tsconfig.json` の `include` の外にあって `resolveJsonModule` も `.geojson` に効かないので、読み方を二つに限れば `tsconfig.json` にも `vitest.config.ts` にも手当てが要らない
- ブラウザが取得する自前の URL（`episodes.json`・MapLibre の worker）は、`src/lib/base-path.ts` の `BASE_PATH` を先頭に付けて組む
  GitHub Pages はリポジトリ名を挟んだ場所へ配信するので、付けないと公開後に 404 になる
- `catalog/`・`public/`・RSS から読んだ値は、読んだモジュールの中で `parseSeries`・`parseLoci`・`parseEras`・`parseEpisodes`・`parseFeed` を通してから渡す
  `tests/catalog.test.ts` は `catalog/` の現物しか見ないので、複製し損ねた値や 404 の HTML はこの検査でしか止まらない
- MapLibre が出す DOM は canvas のコンテナと attribution だけにし、`<Popup>` と built-in control（Navigation・Scale 等）を使わない
  地図の上に載せるものは React + Tailwind の overlay で書く
  理由は `docs/adr/0022-map-dom-boundary.md` が持つ
- `react-map-gl/maplibre` の部品を描くのは `src/components/map/MapCanvas.tsx` と `src/components/map/SeriesLayers.tsx` だけにする
  `src/lib/map/` が `maplibre-gl` と `react-map-gl/maplibre` から import するのは型だけにする

## 層と、import してよい相手

| 層 | 置き場 | import してよい相手 | 持つもの |
|---|---|---|---|
| 境界の検証 | `src/lib/schema/` | `src/lib/schema/` の中だけ | zod のスキーマと、そこから導く型・`parse*` の関数・ファイルをまたぐ参照の判定 |
| フィードの二段 | `src/lib/feed/parse.ts`（XML の表記を均す）・`src/lib/feed/schema.ts`（値の規則） | `src/lib/feed/` の中だけ | 均した記録と、検査済みの `FeedItem` |
| 設定の定数 | `src/lib/base-path.ts`・`src/lib/map/config.ts` | `src/lib/base-path.ts` | 公開先のパスの接頭辞 `BASE_PATH`・ベースマップと worker の URL・地図の初期位置 |
| 純粋な計算 | `src/lib/era/`・`src/lib/map/loci.ts`・`src/lib/map/series-layer.ts`・`src/lib/map/series-panel.ts`・`src/lib/feed/assign.ts`・`src/lib/format.ts` | 境界の検証の型と定数・`src/lib/feed/schema.ts` の型・同じ層 | 関数とテスト |
| 境界 | `src/lib/catalog-dir.ts`・`src/lib/episodes.ts`・`scripts/json-file.ts` | 境界の検証・設定の定数 | `node:fs` か `fetch` による読み書きと、境界の検証の呼び出し |
| 描画 | `src/components/<関心>/`（直下にはディレクトリだけを置く） | 純粋な計算・境界の検証の型と定数・設定の定数・`src/lib/episodes.ts`・同じ層 | React の部品 |
| 配線 | `src/app/`・`scripts/sync-feed.ts` | `src/app/` は描画・`src/lib/catalog-dir.ts`・純粋な計算、`scripts/sync-feed.ts` はフィードの二段・純粋な計算・境界の検証・`scripts/json-file.ts` | 受け取り・呼び出し・出力 |
| 検査の機構 | `scripts/smoke.ts`・`scripts/lint-comments.ts` | `scripts/smoke.ts` は設定の定数、`scripts/lint-comments.ts` はこのリポジトリのモジュールを import しない | 配信物を開いて観測を集める `observe` と、観測から違反を出す `violationsOf`・コメントの禁止語の検査 |

## 一つしか無い状態の正

複数の部品が読む状態を並べる。
持つ部品は state を一つだけ持ち、読む部品へは props で渡す。

| 状態 | 持つ部品 | 書く部品 | 読む部品 |
|---|---|---|---|
| 選択中のシリーズ（`selectedSeriesId`） | `src/components/map/MapCanvas.tsx` | `MapCanvas`・`SeriesPanel`・`SeriesDetailCard` | `SeriesLayers`・`SeriesPanel`・`SeriesDetailCard` |
| era スライダーの位置（`eraPosition`） | `src/components/map/MapCanvas.tsx` | `EraSlider` | `EraSlider`・`SeriesLayers`・`SeriesPanel` |
| エピソードの取得の状態（`EpisodesState`） | `src/components/map/MapCanvas.tsx` | `MapCanvas` | `SeriesDetailCard` |

## プロジェクト固有（育てる欄）
- （このプロジェクトで決めた逸脱・追加をここに追記する。理由を一行添える）
