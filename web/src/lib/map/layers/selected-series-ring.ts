/**
 * 選択中のシリーズの事物を囲む輪のレイヤの定義と、描く事物を絞る `filter` を設定する関数を置く。
 * 同時代のシリーズを縁取る輪は持たず、`@/lib/map/layers/contemporary-series-ring` が持つ。
 */

import type { CurrentWindow } from "@/lib/era/window";
import type { MapLocusCollection } from "@/lib/map/loci";
import { fadesOf, type SeriesLayerSpecification } from "@/lib/map/series-layer";

/**
 * 選択中のシリーズの事物を囲む輪のレイヤ。
 *
 * 塗りを持たず縁だけを描くので、`SERIES_CIRCLE_LAYER` の円の不透明度を変えずに上へ重ねられる。
 * 描く事物を絞る `filter` は `selectedSeriesRingLayerIn` が設定する。
 * 縁の色は、`SeriesPanel` が選択中のシリーズのボタンに付ける左の太線の色（Tailwind の `orange-700`）と同じ値にする。
 */
export const SELECTED_SERIES_RING_LAYER: SeriesLayerSpecification = {
  id: "series-selected-ring",
  type: "circle",
  paint: {
    "circle-radius": 10,
    "circle-opacity": 0,
    "circle-stroke-width": 3,
    "circle-stroke-color": "#c2410c",
  },
};

/**
 * `SELECTED_SERIES_RING_LAYER` に、`selectedSeriesId` のシリーズの事物のうち `currentWindow` と重なるものだけを描く `filter` を設定したレイヤを返す。
 * `selectedSeriesId` が null なら、どの事物も描かない `filter` を設定する。
 *
 * 窓と重ならない事物に輪を描くと、`seriesCircleLayerIn` が除いた円の在り処だけが地図に残る。
 */
export function selectedSeriesRingLayerIn({
  currentWindow,
  loci,
  selectedSeriesId,
}: {
  currentWindow: CurrentWindow;
  loci: MapLocusCollection;
  selectedSeriesId: string | null;
}): SeriesLayerSpecification {
  const ringLocusIds = fadesOf(currentWindow, loci)
    .filter(({ seriesId }) => seriesId === selectedSeriesId)
    .map(({ id }) => id);

  return {
    ...SELECTED_SERIES_RING_LAYER,
    filter: ["in", ["get", "id"], ["literal", ringLocusIds]],
  };
}
