---
paths:
  - "**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}"
---

# TypeScript / JavaScript のうち coten-atlas だけの規則

`typescript.md`（共有の雛形とバイト一致させる配布物）に加えて読み込まれる。
雛形からの逸脱と追加だけを持ち、`typescript.md` は書き換えない。

## 機械が見ている分

表の全体と各規則を何のために見るかは `typescript.md`「機械が見ている分」が持ち、ここは雛形に無い規則だけを持つ。

| 規則 | 道具 | severity | 何のために |
|---|---|---|---|
| `node:fs` を import してよいのは `src/lib/catalog-dir.*`・`scripts/**`・`tests/**` だけ | biome `style/noRestrictedImports` | error | ブラウザに届くコードへ `node:fs` が混ざらない |
| `maplibre-gl`・`react-map-gl/maplibre` を import してよいのは `src/components/map/MapCanvas.tsx`・`src/components/map/SeriesLayers.tsx`・`src/lib/map/series-layer.ts` だけ | 同上 | error | 地図の DOM への依存を描画層と純粋な計算の一箇所に閉じる |
| `src/lib/**` から `src/app/**` を import しない | 同上 | error | 依存を `src/app` から `src/lib` への一方向に保つ |
