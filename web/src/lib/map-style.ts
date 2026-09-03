/**
 * シリーズを描くレイヤの定義。
 *
 * 第一段階の geometry は Point だけなので、レイヤは circle の 1 本で足りる（docs/adr/0026-two-phase-location.md）。
 * `['geometry-type']` で図形を分ける枝は第二段階まで無い。
 *
 * 不透明度は定数でなく式で持つ。
 * era スライダーの opacity 制御（S4）が同じ欄を差し替えるので、定数で埋めると差し替えのときに paint の形から変えることになる。
 *
 * 色は MapLibre のスタイル式が読むので、Tailwind のトークンでなく生の値を置く。
 * 地図の中で閉じる指定であって、overlay の見た目とは別物である（docs/adr/0022-map-dom-boundary.md）。
 */

import type { CircleLayerSpecification } from "react-map-gl/maplibre";
import type { SeriesKind } from "@/lib/schema/series";

/** 事物を引く source の id。 */
export const SERIES_SOURCE_ID = "series-loci";

/**
 * `kind` ごとの円の不透明度。
 * `concept` は場所が一意に決まらないので、`place` より薄く置く（docs/adr/0023-kind-place-or-concept.md）。
 */
export const CIRCLE_OPACITY_BY_KIND: Record<SeriesKind, number> = {
  place: 0.85,
  concept: 0.35,
};

/**
 * 代表点を描く円のレイヤ。
 * `source` は `<Source>` の子に置くと react-map-gl が入れるので持たない。
 */
export const SERIES_CIRCLE_LAYER: Omit<CircleLayerSpecification, "source"> = {
  id: "series-circle",
  type: "circle",
  paint: {
    "circle-radius": 6,
    "circle-color": "#1f5673",
    "circle-opacity": [
      "match",
      ["get", "kind"],
      "concept",
      CIRCLE_OPACITY_BY_KIND.concept,
      CIRCLE_OPACITY_BY_KIND.place,
    ],
  },
};
