"use client";

/**
 * ベースマップを画面いっぱいに描き、その上へシリーズのレイヤを載せる。
 *
 * react-map-gl は maplibre 本体を実行時に動的 import するので、プリレンダでは空のコンテナだけが出る。
 * この層を `next/dynamic` の `ssr: false` で包む必要は無い。
 * worker の在り処は `workerUrl` で名指す。
 * 渡さないと maplibre はバンドル後のチャンク URL からの相対で worker を探し、404 の HTML を掴んで地図だけが描画されなくなる（docs/adr/0013-maplibre-worker-self-hosted.md）。
 * attributionControl は渡さない。
 * OpenFreeMap は `OpenFreeMap © OpenMapTiles Data from OpenStreetMap` の表示を利用条件にしており、false を渡すと既定の AttributionControl ごと表示が消えて規約違反になる。
 * style で寸法を渡す。
 * スタイルは Tailwind のユーティリティで書く決まりだが（docs/adr/0021-tailwind-v4.md）、MapLibreMap は container の `style` しか公開せず `className` を持たないので、寸法だけはここに残る。
 * built-in control（Navigation・Scale 等）はここへ足さない。
 * MapLibre が吐く DOM は `maplibre-gl.css` が素のカスケードで押さえており、レイヤに入った Tailwind のユーティリティが負けるので、当てても効かない（docs/adr/0022-map-dom-boundary.md）。
 * 地図の上に置くものは React 側の overlay として書く。
 */

import MapLibreMap from "react-map-gl/maplibre";
import SeriesLayers from "@/components/SeriesLayers";
import {
  BASEMAP_STYLE_URL,
  INITIAL_VIEW_STATE,
  MAP_WORKER_URL,
} from "@/lib/map-config";
import type { MapLocusCollection } from "@/lib/map-loci";

type MapCanvasProps = {
  /** 地図へ渡す形に組んだ事物の全件。 */
  loci: MapLocusCollection;
};

export default function MapCanvas({ loci }: MapCanvasProps) {
  return (
    <MapLibreMap
      mapStyle={BASEMAP_STYLE_URL}
      initialViewState={INITIAL_VIEW_STATE}
      workerUrl={MAP_WORKER_URL}
      style={{ width: "100%", height: "100dvh" }}
    >
      <SeriesLayers loci={loci} />
    </MapLibreMap>
  );
}
