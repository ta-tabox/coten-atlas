# S1: ベースマップを全画面に出す
labels: claude,ui

**前提**: #01 ／ **担当**: Claude ／ **参照**: `docs/plan.md` §1（地図・ベースマップ）、§3（UI 構成）

## 目的
テーマ描画（#05）が載る土台を用意する。static export と MapLibre の噛み合わせ
（SSR 回避・CSS 読み込み）をここで一度解決し、以降の UI issue から外す。

## 作るもの
- 依存追加: `maplibre-gl`、`react-map-gl`
- `src/lib/map-config.ts`
  - `export const BASEMAP_STYLE_URL: string` — OpenFreeMap の淡色スタイル
    （positron 系）。**URL は実際に fetch して 200 と JSON を確認してから固定する**
  - `export const INITIAL_VIEW_STATE = { longitude: 20, latitude: 30, zoom: 1.6 }`
    （ユーラシア〜アフリカが一望できる初期位置）
- `src/components/MapCanvas.tsx` — `"use client"`。
  `export default function MapCanvas(): JSX.Element`。
  `react-map-gl/maplibre` の `<Map>` を `mapStyle={BASEMAP_STYLE_URL}`、
  `initialViewState={INITIAL_VIEW_STATE}`、`style={{ width: '100%', height: '100dvh' }}`
- `src/app/page.tsx` — `next/dynamic` + `ssr: false` で `MapCanvas` を読む
  （MapLibre は window に依存する。static export のプリレンダで落ちるのを避ける）
- `src/app/layout.tsx` — `import 'maplibre-gl/dist/maplibre-gl.css'`
- `src/components/MapCanvas.test.tsx` — `react-map-gl/maplibre` をモックし、
  `<Map>` へ `BASEMAP_STYLE_URL` と `INITIAL_VIEW_STATE` が渡ることを検証
  （MapLibre 本体は jsdom で描画できない。テストするのは配線であって地図ではない）

## 触らないもの
`data/`、`scripts/`、スキーマ関連（#03 以降）

## 完了条件（機械判定）
- `mise run check` が緑
- `mise run build` が `out/index.html` を生成する（プリレンダで落ちない）
- `MapCanvas.test.tsx` が通る

## 人間の判定（別トラック）
実機で全画面に地図が出て、パン・ズームが効く。淡色がテーマオブジェクトの邪魔を
しない濃度か（濃すぎるなら別スタイルへ差し替え）。

## 引き継ぎ
採用したスタイル URL を `docs/plan.md` §1 の表へ追記する（規約の確定なので地図の改訂に当たる）。
