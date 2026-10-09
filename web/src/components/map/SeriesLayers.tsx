"use client";

/**
 * シリーズを地図の上の見えるものにするレイヤ群。
 *
 * source と layer の対だけを置き、地図そのものは持たない。
 * 置く先は `MapCanvas` の子で、react-map-gl は親の地図を context から取得する。
 *
 * 渡す形を組むのは `@/lib/map/loci` である。
 * ここは組み終わった値を source へ載せるだけで、シリーズを引き直さない。
 * 円の不透明度と、選択中のシリーズを囲む輪・同時代のシリーズを縁取る輪の `filter` を現在窓から組むのは `@/lib/map/series-layer` である。
 */

import { Layer, Source } from "react-map-gl/maplibre";
import type { CurrentWindow } from "@/lib/era/window";
import type { MapLocusCollection } from "@/lib/map/loci";
import {
  contemporarySeriesRingLayerIn,
  SERIES_SOURCE_ID,
  selectedSeriesRingLayerIn,
  seriesCircleLayerIn,
} from "@/lib/map/series-layer";
import type { Series } from "@/lib/schema/series";

type SeriesLayersProps = {
  /** 地図へ渡す形に組んだ事物の全件。 */
  loci: MapLocusCollection;
  /** 円の不透明度を決める、era スライダーの現在窓。 */
  currentWindow: CurrentWindow;
  /**
   * 輪で囲み、年の重なりで同時代のシリーズを決める起点のシリーズ。
   * 選択が無ければ null。
   *
   * id でなくシリーズを受け取るのは、位置なしのシリーズやタグの絞り込みで外れたシリーズの年が `loci` から読めないため。
   */
  selectedSeries: Series | null;
};

/**
 * `loci` を geojson の source へ載せ、`currentWindow` から不透明度を決めた円のレイヤと、`selectedSeries` と同時代のシリーズの事物を縁取る輪のレイヤと、`selectedSeries` の事物を囲む輪のレイヤを重ねて描く。
 *
 * 輪のレイヤを円のレイヤより後に置くので、輪は円の上に描かれる。
 */
export default function SeriesLayers({
  loci,
  currentWindow,
  selectedSeries,
}: SeriesLayersProps) {
  return (
    <Source id={SERIES_SOURCE_ID} type="geojson" data={loci}>
      <Layer {...seriesCircleLayerIn(currentWindow, loci)} />
      <Layer
        {...contemporarySeriesRingLayerIn({
          currentWindow,
          loci,
          selectedSeries,
        })}
      />
      <Layer
        {...selectedSeriesRingLayerIn({
          currentWindow,
          loci,
          selectedSeriesId: selectedSeries?.id ?? null,
        })}
      />
    </Source>
  );
}
