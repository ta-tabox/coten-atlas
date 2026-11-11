/**
 * 選択中のシリーズと年が重なるシリーズの事物を縁取る輪のレイヤの定義と、描く事物を絞る `filter` を設定する関数を置く。
 * 選択中のシリーズ自身を囲む輪は持たず、`@/lib/map/layers/selected-series-ring` が持つ。
 */

import type { CurrentWindow } from "@/lib/era/window";
import type { MapLocusCollection } from "@/lib/map/loci";
import { fadesOf, type SeriesLayerSpecification } from "@/lib/map/series-layer";
import {
  type Series,
  type SeriesTimeRange,
  TIME_RANGE_UNTIMED,
} from "@/lib/schema/series";

/**
 * 選択中のシリーズと年が重なるシリーズの事物を縁取るレイヤ。
 *
 * 強調を `circle-opacity` でなく縁（`circle-stroke-*`）で表すので、現在窓から求めた円の濃さは変わらず、薄く残る円は薄いまま縁だけが付く。
 * 半径を `SERIES_CIRCLE_LAYER` の円と同じにして、円の輪郭をなぞる。
 * 描く事物を絞る `filter` は `contemporarySeriesRingLayerIn` が設定する。
 * 縁の色は、`SELECTED_SERIES_RING_LAYER` の縁と同じ色相で明るい Tailwind の `orange-400` にする。
 */
export const CONTEMPORARY_SERIES_RING_LAYER: SeriesLayerSpecification = {
  id: "series-contemporary-ring",
  type: "circle",
  paint: {
    "circle-radius": 6,
    "circle-opacity": 0,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#fb923c",
  },
};

/**
 * `CONTEMPORARY_SERIES_RING_LAYER` に、`selectedSeries` と年が重なる他のシリーズの事物のうち `currentWindow` と重なるものだけを描く `filter` を設定したレイヤを返す。
 * `selectedSeries` が null か、`timeRange` が `TIME_RANGE_UNTIMED` なら、どの事物も描かない `filter` を設定する。
 *
 * 年の重なりは、`selectedSeries` の `timeRange` と事物の `timeStart` / `timeEnd` を、両端を含む閉区間どうしとして比べる。
 * 現在窓は重なりの判定に使わず、`selectedSeriesRingLayerIn` と同じ理由で描く事物を絞るためだけに使う。
 * `selectedSeries` 自身の事物は `SELECTED_SERIES_RING_LAYER` が囲むので含めない。
 */
export function contemporarySeriesRingLayerIn({
  currentWindow,
  loci,
  selectedSeries,
}: {
  currentWindow: CurrentWindow;
  loci: MapLocusCollection;
  selectedSeries: Series | null;
}): SeriesLayerSpecification {
  const ringLocusIds =
    selectedSeries === null || selectedSeries.timeRange === TIME_RANGE_UNTIMED
      ? []
      : contemporaryLocusIdsOf({
          currentWindow,
          loci,
          seriesId: selectedSeries.id,
          timeRange: selectedSeries.timeRange,
        });

  return {
    ...CONTEMPORARY_SERIES_RING_LAYER,
    filter: ["in", ["get", "id"], ["literal", ringLocusIds]],
  };
}

/**
 * `loci` のうち、`seriesId` 以外のシリーズの事物で、年が `timeRange` と重なり、かつ `currentWindow` と重なるものの id を返す。
 */
function contemporaryLocusIdsOf({
  currentWindow,
  loci,
  seriesId,
  timeRange,
}: {
  currentWindow: CurrentWindow;
  loci: MapLocusCollection;
  seriesId: string;
  timeRange: SeriesTimeRange;
}): string[] {
  const idsOnMap = new Set(fadesOf(currentWindow, loci).map(({ id }) => id));

  return loci.features
    .map(({ properties }) => properties)
    .filter(
      (locus) =>
        idsOnMap.has(locus.id) &&
        locus.seriesId !== seriesId &&
        locus.timeStart <= timeRange.end &&
        timeRange.start <= locus.timeEnd,
    )
    .map(({ id }) => id);
}
