"use client";

/**
 * ベースマップを画面いっぱいに描く。
 *
 * react-map-gl は maplibre 本体を実行時に動的 import するので、プリレンダでは空のコンテナだけが出る。
 * この層を `next/dynamic` の `ssr: false` で包む必要は無い。
 * attributionControl は渡さない。
 * OpenFreeMap は `OpenFreeMap © OpenMapTiles Data from OpenStreetMap` の表示を利用条件にしており、false を渡すと既定の AttributionControl ごと表示が消えて規約違反になる。
 */

import MapLibreMap from "react-map-gl/maplibre";
import { BASEMAP_STYLE_URL, INITIAL_VIEW_STATE } from "@/lib/map-config";

export default function MapCanvas() {
  return (
    <MapLibreMap
      mapStyle={BASEMAP_STYLE_URL}
      initialViewState={INITIAL_VIEW_STATE}
      style={{ width: "100%", height: "100dvh" }}
    />
  );
}
