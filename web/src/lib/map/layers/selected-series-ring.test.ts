/**
 * レイヤ定義は宣言的なデータなので、描画でなく定義を見る。
 * jsdom に WebGL は無く、描いた結果を確かめる手立てがこの層に無い（docs/HARNESS.md「1. 検証の層構造」）。
 */

import { describe, expect, it } from "vitest";
import type { CurrentWindow } from "@/lib/era/window";
import {
  SELECTED_SERIES_RING_LAYER,
  selectedSeriesRingLayerIn,
} from "@/lib/map/layers/selected-series-ring";
import type { MapLocusCollection, MapLocusFeature } from "@/lib/map/loci";

const WINDOW: CurrentWindow = { start: 100, end: 200 };

/**
 * `id` の事物を、`timeStart` から `timeEnd` までの年で 1 件作る。
 * シリーズの id は事物の id と同じにする。
 */
function locusOf(
  id: string,
  timeStart: number,
  timeEnd: number,
): MapLocusFeature {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [0, 0] },
    properties: { id, seriesId: id, timeStart, timeEnd },
  };
}

/** `locus` のシリーズの id を `seriesId` に置き換えた事物を返す。 */
function withSeriesId(
  locus: MapLocusFeature,
  seriesId: string,
): MapLocusFeature {
  return { ...locus, properties: { ...locus.properties, seriesId } };
}

/** `features` を地図へ渡す形の全件にする。 */
function lociOf(...features: MapLocusFeature[]): MapLocusCollection {
  return { type: "FeatureCollection", features };
}

describe("selectedSeriesRingLayerIn", () => {
  it("選択中のシリーズの事物のうち、窓と重なるものだけを filter に残す", () => {
    const selectedInside = withSeriesId(locusOf("in", 120, 140), "sparta");
    const selectedOutside = withSeriesId(locusOf("out", 500, 600), "sparta");
    const other = locusOf("other", 120, 140);

    const layer = selectedSeriesRingLayerIn({
      currentWindow: WINDOW,
      loci: lociOf(selectedInside, selectedOutside, other),
      selectedSeriesId: "sparta",
    });

    expect(layer.filter).toEqual(["in", ["get", "id"], ["literal", ["in"]]]);
  });

  it("選択が無ければ、どの事物も filter に残さない", () => {
    const layer = selectedSeriesRingLayerIn({
      currentWindow: WINDOW,
      loci: lociOf(locusOf("inside", 120, 140)),
      selectedSeriesId: null,
    });

    expect(layer.filter).toEqual(["in", ["get", "id"], ["literal", []]]);
  });

  it("id と縁の描き方は SELECTED_SERIES_RING_LAYER から変えない", () => {
    const layer = selectedSeriesRingLayerIn({
      currentWindow: WINDOW,
      loci: lociOf(),
      selectedSeriesId: null,
    });

    expect(layer.id).toBe(SELECTED_SERIES_RING_LAYER.id);
    expect(layer.paint).toEqual(SELECTED_SERIES_RING_LAYER.paint);
  });
});
