# S3: kind ごとのレイヤでテーマを描画する
labels: claude,ui

**前提**: #02, #04 ／ **担当**: Claude ／ **参照**: `docs/plan.md` §2（kind）、§3（UI 構成）

## 目的
テーマを地図上の見えるものにする。opacity 制御（S4）が載る土台でもあるので、
レイヤの paint プロパティは後から式で差し替えられる形にしておく。

## 作るもの
- `src/lib/data.ts` — `export function loadThemes(): ThemeCollection`。
  `data/themes.geojson` をビルド時 import し `parseThemes` に通す
  （静的サイトなので実行時 fetch はしない。`docs/plan.md` §4 末尾）
- `src/lib/map-style.ts` — kind ごとのレイヤ定義4本を `LayerProps` として export
  - `pointLayer`（circle + ラベル）/ `polygonLayer`（fill + outline）/
    `lineLayer`（line）/ `conceptLayer`（淡色・低彩度）
  - 各レイヤは `filter: ['==', ['get', 'kind'], '<kind>']` で分岐する
    （ソースは1本。kind ごとに Source を割らない）
- `src/components/ThemeLayers.tsx` — `<Source id="themes" type="geojson" data={themes}>`
  の下に上記 `<Layer>` を並べる
- `src/components/MapCanvas.tsx` — `<ThemeLayers />` を子に置く
- テスト `src/lib/map-style.test.ts` — 4本の filter 式がそれぞれ意図した kind だけを
  選ぶこと（レイヤ定義は宣言的なデータなので、描画ではなく定義を検査する）

## 触らないもの
era スライダー・opacity 制御（S4）、詳細カード（#06）、`data/`

## 完了条件（機械判定）
- `mise run check` が緑
- `map-style.test.ts` が通る
- `mise run build` が `out/` を生成する

## 人間の判定（別トラック）
シード全件が地図上に見え、重なりが破綻していない。concept 系が控えめに見えるか。
