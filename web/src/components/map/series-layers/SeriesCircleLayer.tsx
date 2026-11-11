"use client";

/**
 * シリーズの代表点を、現在窓から求めた濃さを不透明度にした円で描く部品を置く。
 * source は持たず、`<Layer>` へ `SERIES_SOURCE_ID` を渡して、親の `SeriesLayers` の `<Source>` が載せた事物を描く。
 */

import { Layer } from "react-map-gl/maplibre";
import type { CurrentWindow } from "@/lib/era/window";
import { seriesCircleLayerIn } from "@/lib/map/layers/series-circle";
import type { MapLocusCollection } from "@/lib/map/loci";
import { SERIES_SOURCE_ID } from "@/lib/map/series-layer";

type SeriesCircleLayerProps = {
  /** 地図へ渡す形に組んだ事物の全件。 */
  loci: MapLocusCollection;
  /** 円の不透明度を決める、era スライダーの現在窓。 */
  currentWindow: CurrentWindow;
};

/** 事物（`loci`）の各件を、現在窓（`currentWindow`）との年の重なりから求めた濃さを不透明度にした円で描く。 */
export default function SeriesCircleLayer({
  loci,
  currentWindow,
}: SeriesCircleLayerProps) {
  return (
    <Layer
      {...seriesCircleLayerIn(currentWindow, loci)}
      source={SERIES_SOURCE_ID}
    />
  );
}
