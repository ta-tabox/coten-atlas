"use client";

/**
 * シリーズを地図の上の見えるものにするレイヤ群。
 *
 * source と layer の対だけを置き、地図そのものは持たない。
 * 置く先は `MapCanvas` の子で、react-map-gl は親の地図を context から引く。
 *
 * 渡す形を組むのは `@/lib/map/loci` である。
 * ここは組み終わった値を source へ載せるだけで、シリーズを引き直さない。
 */

import { Layer, Source } from "react-map-gl/maplibre";
import type { MapLocusCollection } from "@/lib/map/loci";
import { SERIES_CIRCLE_LAYER, SERIES_SOURCE_ID } from "@/lib/map/series-layer";

type SeriesLayersProps = {
  /** 地図へ渡す形に組んだ事物の全件。 */
  loci: MapLocusCollection;
};

export default function SeriesLayers({ loci }: SeriesLayersProps) {
  return (
    <Source id={SERIES_SOURCE_ID} type="geojson" data={loci}>
      <Layer {...SERIES_CIRCLE_LAYER} />
    </Source>
  );
}
