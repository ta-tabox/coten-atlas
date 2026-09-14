---
paths:
  - "**/src/**"
  - "**/scripts/**"
---

# 置き場と依存の向き（リポジトリの表）

`coding.md`「置き場と依存の向き」の規則を、このリポジトリの実在するモジュールに当てた表。
上の `paths` に当たるファイルを Read した時点で読み込まれる。
`docs/ARCHITECTURE.md` は境界の禁止則をここへ委ね、「正は `.claude/rules/layers.md`」の一行で指す。
パスは `web/` からの相対で書く。

## 境界を閉じるモジュール

| 境界 | 閉じるモジュール | 他のモジュールが受け取るもの |
|---|---|---|
| `catalog/` のファイル | アプリのビルドは `src/lib/catalog-dir.ts`（`loadSeries`・`loadLoci`・`loadEras`）、同期は `scripts/sync-feed.ts`（JSON の構文の検査は `scripts/json-file.ts`） | スキーマを通した `SeriesList`・`LocusCollection`・`EraList`・`EpisodeCollection` |
| RSS（ネットワーク） | `scripts/sync-feed.ts` の `fetchFeed` | XML の文字列。`src/lib/feed/parse.ts` の `parseFeed` が検査済みの `FeedItem` の配列にする |
| 配信した `episodes.json`（ブラウザの fetch） | `src/lib/episodes.ts` の `fetchEpisodes` | `EpisodesResult`（`parseEpisodes` を通した `Episode` の配列か、取得の失敗） |
| MapLibre の DOM とイベント | `src/components/MapCanvas.tsx`（source と layer は子の `src/components/SeriesLayers.tsx`） | クリックした事物の `seriesId` |

## 層と、import してよい相手

| 層 | 置き場 | import してよい相手 | 持つもの |
|---|---|---|---|
| 境界の検証 | `src/lib/schema/` | `src/lib/schema/` の中だけ | zod のスキーマと、そこから導く型・`parse*` の関数・ファイルをまたぐ参照の判定 |
| フィードの二段 | `src/lib/feed/parse.ts`（XML の表記を均す）・`src/lib/feed/schema.ts`（値の規則） | `src/lib/feed/` の中だけ | 均した記録と、検査済みの `FeedItem` |
| 設定の定数 | `src/lib/base-path.ts`・`src/lib/map/config.ts` | `src/lib/base-path.ts` | 公開先のパスの接頭辞 `BASE_PATH`・ベースマップと worker の URL・地図の初期位置 |
| 純粋な計算 | `src/lib/era/`・`src/lib/map/loci.ts`・`src/lib/map/series-layer.ts`・`src/lib/feed/assign.ts`・`src/lib/format.ts` | 境界の検証の型と定数・`src/lib/feed/schema.ts` の型・同じ層 | 関数とテスト |
| 境界 | `src/lib/catalog-dir.ts`・`src/lib/episodes.ts`・`scripts/json-file.ts` | 境界の検証・設定の定数 | `node:fs` か `fetch` による読み書きと、境界の検証の呼び出し |
| 描画 | `src/components/` | 純粋な計算・境界の検証の型と定数・設定の定数・`src/lib/episodes.ts`・同じ層 | React の部品 |
| 配線 | `src/app/`・`scripts/sync-feed.ts` | `src/app/` は描画・`src/lib/catalog-dir.ts`・純粋な計算、`scripts/sync-feed.ts` はフィードの二段・純粋な計算・境界の検証・`scripts/json-file.ts` | 受け取り・呼び出し・出力 |
| 検査の機構 | `scripts/smoke.ts`・`scripts/lint-comments.ts` | `scripts/smoke.ts` は設定の定数、`scripts/lint-comments.ts` はこのリポジトリのモジュールを import しない | 配信物を開いて観測を集める `observe` と、観測から違反を出す `violationsOf`・コメントの禁止語の検査 |

## 一つしか無い状態の正

| 状態 | 正 |
|---|---|
| 選択中のシリーズ（`selectedSeriesId`） | `src/components/MapCanvas.tsx` の state。子へは props で渡し、子に複製しない |
| era スライダーの位置（`eraPosition`） | `src/components/MapCanvas.tsx` の state。`EraSlider` と `SeriesLayers` へは props で渡す |
| エピソードの取得の状態（`EpisodesState`） | `src/components/MapCanvas.tsx` の state。マウントした直後に `fetchEpisodes` で取得し、`SeriesDetailCard` へは props で渡す |

## プロジェクト固有（育てる欄）
- （このプロジェクトで決めた逸脱・追加をここに追記する。理由を一行添える）
