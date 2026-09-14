"use client";

/**
 * シリーズを地図の上の見えるものにするレイヤ群。
 *
 * source と layer の対だけを置き、地図そのものは持たない。
 * 置く先は `MapCanvas` の子で、react-map-gl は親の地図を context から取得する。
 *
 * 渡す形を組むのは `@/lib/map/loci` である。
 * ここは組み終わった値を source へ載せるだけで、シリーズを引き直さない。
 * 円の不透明度と選択中のシリーズを囲む輪の `filter` を現在窓から組むのは `@/lib/map/series-layer` である。
 */

import { Layer, Source } from "react-map-gl/maplibre";
import type { CurrentWindow } from "@/lib/era/window";
import type { MapLocusCollection } from "@/lib/map/loci";
import {
  SERIES_SOURCE_ID,
  selectedSeriesRingLayerIn,
  seriesCircleLayerIn,
} from "@/lib/map/series-layer";

type SeriesLayersProps = {
  /** 地図へ渡す形に組んだ事物の全件。 */
  loci: MapLocusCollection;
  /** 円の不透明度を決める、era スライダーの現在窓。 */
  currentWindow: CurrentWindow;
  /**
   * 輪で囲むシリーズの id。
   * 選択が無ければ null。
   */
  selectedSeriesId: string | null;
};

/**
 * `loci` を geojson の source へ載せ、`currentWindow` から不透明度を決めた円のレイヤと、`selectedSeriesId` の事物を囲む輪のレイヤを重ねて描く。
 *
 * 輪のレイヤを円のレイヤより後に置くので、輪は円の上に描かれる。
 */
export default function SeriesLayers({
  loci,
  currentWindow,
  selectedSeriesId,
}: SeriesLayersProps) {
  return (
    <Source id={SERIES_SOURCE_ID} type="geojson" data={loci}>
      <Layer {...seriesCircleLayerIn(currentWindow, loci)} />
      <Layer
        {...selectedSeriesRingLayerIn({
          currentWindow,
          loci,
          selectedSeriesId,
        })}
      />
    </Source>
  );
}
