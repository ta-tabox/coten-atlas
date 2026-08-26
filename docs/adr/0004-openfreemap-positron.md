# 0004. ベースマップに OpenFreeMap positron を採る（代替は Carto Positron）

- **状態**: 採用
- **決定日**: 2026-08-23
- **関係する ADR**: 0003（地図ライブラリ）

## 文脈

要件は POI 不要・地域名程度で足りる淡色のベースマップ。
テーマオブジェクトを主役にしたいので、地図側は控えめであってほしい。

## 決定

OpenFreeMap の positron `https://tiles.openfreemap.org/styles/positron`（API キー不要・リクエスト数無制限・商用可、MIT）。要求 attribution は `OpenFreeMap © OpenMapTiles Data from OpenStreetMap` で、スタイルが参照する TileJSON が持つので MapLibre の `AttributionControl` が既定で表示する（`attributionControl: false` を渡さないことが条件）。代替は Carto Positron `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`（attribution は `© CARTO, © OpenStreetMap contributors`、API キー必須・フェアユース 5M タイルリクエスト/月）

## 理由

POI 不要・地域名程度で足りる要件に合致。淡色はテーマオブジェクトを主役にできる。キー不要と無制限を手放す理由が他に無いので、Carto へ倒すのは OpenFreeMap の可用性が実際に問題になったときだけ（確認日 2026-08-23）。

## 帰結

- API キーを環境変数に持たない。リモート実行の設定が一つ減る
- `attributionControl: false` を渡さないことが要求 attribution の満たし方になる
- タイルの取得先 `https://tiles.openfreemap.org` へ出られない環境では地図の見た目を確認できない（`HARNESS.md`）

## 覆る条件

OpenFreeMap の可用性が実際に問題になったとき（そのときは Carto Positron へ倒す）。
