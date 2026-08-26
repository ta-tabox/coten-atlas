"use client";

/**
 * ベースマップを画面いっぱいに描く。
 *
 * MapLibre は window に触るので、この層はブラウザでしか動かない。
 * 読む側が SSR を外す（src/app/page.tsx）。
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
