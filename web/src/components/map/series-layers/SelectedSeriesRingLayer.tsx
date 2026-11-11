"use client";

/**
 * 選択中のシリーズの事物を輪で囲む部品を置く。
 * source は持たず、`<Layer>` へ `SERIES_SOURCE_ID` を渡して、親の `SeriesLayers` の `<Source>` が載せた事物を描く。
 */

import { Layer } from "react-map-gl/maplibre";
import type { CurrentWindow } from "@/lib/era/window";
import { selectedSeriesRingLayerIn } from "@/lib/map/layers/selected-series-ring";
import type { MapLocusCollection } from "@/lib/map/loci";
import { SERIES_SOURCE_ID } from "@/lib/map/series-layer";

type SelectedSeriesRingLayerProps = {
  /** 地図へ渡す形に組んだ事物の全件。 */
  loci: MapLocusCollection;
  /** 輪を描く事物を、円が描かれている事物に絞る era スライダーの現在窓。 */
  currentWindow: CurrentWindow;
  /**
   * 輪で囲むシリーズの id。
   * 選択が無ければ null。
   */
  selectedSeriesId: string | null;
};

/** 選択中のシリーズ（`selectedSeriesId`）の事物のうち、現在窓（`currentWindow`）と重なるものを輪で囲む。 */
export default function SelectedSeriesRingLayer({
  loci,
  currentWindow,
  selectedSeriesId,
}: SelectedSeriesRingLayerProps) {
  return (
    <Layer
      {...selectedSeriesRingLayerIn({ currentWindow, loci, selectedSeriesId })}
      source={SERIES_SOURCE_ID}
    />
  );
}
