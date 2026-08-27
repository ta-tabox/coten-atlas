"use client";

/**
 * ベースマップを画面いっぱいに描く。
 *
 * react-map-gl は maplibre 本体を実行時に動的 import するので、プリレンダでは空のコンテナだけが出る。
 * この層を `next/dynamic` の `ssr: false` で包む必要は無い。
 * maplibre-gl は v5 系に固定してある（docs/adr/0011-maplibre-v5.md）。
 * v6 へ上げると worker が 404 になり、attribution だけが乗った空白の画面になる。
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
