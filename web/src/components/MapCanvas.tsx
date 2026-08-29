"use client";

/**
 * ベースマップを画面いっぱいに描く。
 *
 * react-map-gl は maplibre 本体を実行時に動的 import するので、プリレンダでは空のコンテナだけが出る。
 * この層を `next/dynamic` の `ssr: false` で包む必要は無い。
 * worker の在り処は `workerUrl` で名指す。
 * 渡さないと maplibre はバンドル後のチャンク URL からの相対で worker を探し、404 の HTML を掴んで地図だけが描画されなくなる（docs/adr/0013-maplibre-worker-self-hosted.md）。
 * attributionControl は渡さない。
 * OpenFreeMap は `OpenFreeMap © OpenMapTiles Data from OpenStreetMap` の表示を利用条件にしており、false を渡すと既定の AttributionControl ごと表示が消えて規約違反になる。
 * style で寸法を渡す。
 * スタイルは CSS Modules へ寄せる決まりだが（docs/adr/0015-css-modules.md）、MapLibreMap は container の `style` しか公開せず `className` を持たないので、寸法だけはここに残る。
 */

import MapLibreMap from "react-map-gl/maplibre";
import {
  BASEMAP_STYLE_URL,
  INITIAL_VIEW_STATE,
  MAP_WORKER_URL,
} from "@/lib/map-config";

export default function MapCanvas() {
  return (
    <MapLibreMap
      mapStyle={BASEMAP_STYLE_URL}
      initialViewState={INITIAL_VIEW_STATE}
      workerUrl={MAP_WORKER_URL}
      style={{ width: "100%", height: "100dvh" }}
    />
  );
}
