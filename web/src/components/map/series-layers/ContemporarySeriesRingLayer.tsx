"use client";

/**
 * 選択中のシリーズと年が重なるシリーズの事物を縁取る部品を置く。
 * source は持たず、`<Layer>` へ `SERIES_SOURCE_ID` を渡して、親の `SeriesLayers` の `<Source>` が載せた事物を描く。
 */

import { Layer } from "react-map-gl/maplibre";
import type { CurrentWindow } from "@/lib/era/window";
import { contemporarySeriesRingLayerIn } from "@/lib/map/layers/contemporary-series-ring";
import type { MapLocusCollection } from "@/lib/map/loci";
import { SERIES_SOURCE_ID } from "@/lib/map/series-layer";
import type { Series } from "@/lib/schema/series";

type ContemporarySeriesRingLayerProps = {
  /** 地図へ渡す形に組んだ事物の全件。 */
  loci: MapLocusCollection;
  /** 縁取る事物を、円が描かれている事物に絞る era スライダーの現在窓。 */
  currentWindow: CurrentWindow;
  /**
   * 年の重なりで同時代のシリーズを決める起点のシリーズ。
   * 選択が無ければ null。
   */
  selectedSeries: Series | null;
};

/** 選択中のシリーズ（`selectedSeries`）と年が重なる他のシリーズの事物のうち、現在窓（`currentWindow`）と重なるものを縁取る。 */
export default function ContemporarySeriesRingLayer({
  loci,
  currentWindow,
  selectedSeries,
}: ContemporarySeriesRingLayerProps) {
  return (
    <Layer
      {...contemporarySeriesRingLayerIn({
        currentWindow,
        loci,
        selectedSeries,
      })}
      source={SERIES_SOURCE_ID}
    />
  );
}
