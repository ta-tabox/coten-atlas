"use client";

/**
 * シリーズの事物を、円と 2 種類の輪のレイヤで地図へ描く部品を置く。
 *
 * source と、地図上の見た目ごとのレイヤの部品（`@/components/map/layers/`）を並べるだけで、地図そのものは持たない。
 * 置く先は `MapCanvas` の子で、react-map-gl は親の地図を context から取得する。
 * `<Source>` が `source` の id を入れるのは直下の子だけなので、子の部品の中の `<Layer>` へは届かず、各部品が `SERIES_SOURCE_ID` を自分で渡す。
 *
 * 渡す形を組むのは `@/lib/map/loci` である。
 * ここは組み終わった値を source へ載せるだけで、シリーズを取得し直さない。
 */

import { Source } from "react-map-gl/maplibre";
import ContemporarySeriesRingLayer from "@/components/map/layers/ContemporarySeriesRingLayer";
import SelectedSeriesRingLayer from "@/components/map/layers/SelectedSeriesRingLayer";
import SeriesCircleLayer from "@/components/map/layers/SeriesCircleLayer";
import type { CurrentWindow } from "@/lib/era/window";
import { SERIES_SOURCE_ID } from "@/lib/map/layers/shared";
import type { MapLocusCollection } from "@/lib/map/loci";
import type { Series } from "@/lib/schema/series";

type SeriesLayersProps = {
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
      <SeriesCircleLayer loci={loci} currentWindow={currentWindow} />
      <ContemporarySeriesRingLayer
        loci={loci}
        currentWindow={currentWindow}
        selectedSeries={selectedSeries}
      />
      <SelectedSeriesRingLayer
        loci={loci}
        currentWindow={currentWindow}
        selectedSeriesId={selectedSeries?.id ?? null}
      />
    </Source>
  );
}
