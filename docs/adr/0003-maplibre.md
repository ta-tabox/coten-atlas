# 0003. 地図ライブラリに MapLibre GL JS を採る

- **状態**: 採用
- **決定日**: 2026-07-14
- **関係する ADR**: 0004（ベースマップ）

## 文脈

テーマを Point / Polygon / LineString で地図上に置き、era スライダーに応じて
opacity を連続的に変える。ベースマップは淡色でテーマを主役にしたい。

## 決定

MapLibre GL JS（+ react-map-gl の maplibre エントリ）を採る。

## 理由

無料・ベクタタイル・opacity 遷移やスタイル制御の自由度が高い。

採らなかった案:

> **採らなかった案は移設時（2026-08-25）の補足。** 前身の決定表は決定と理由の2列しか持たず、
> 代替案の比較を記録していない。ここでの記述は当時の決定文そのものではなく、
> `docs/adr/README.md` の節構成を満たすための再構成である。


- **Mapbox GL JS** — アクセストークンと従量課金が要る。MapLibre はその fork で API が揃っており、
  手放す理由が無い
- **Leaflet** — ラスタ前提でベクタの opacity 遷移とスタイル制御が弱い

## 帰結

- ベースマップはベクタタイルのスタイル URL で差し替えられる（0004）
- `AttributionControl` が既定で attribution を出すので、`attributionControl: false` を渡さないことが 0004 の条件になる
- テーマの描画は GeoJSON ソース + レイヤで書ける（0005 の `themes.geojson` を直接食わせる）

## 覆る条件

ベクタタイルの opacity 遷移やスタイル制御が要件に足りないと分かったとき。
