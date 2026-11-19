/**
 * レイヤ定義は宣言的なデータなので、描画でなく定義を見る。
 * jsdom に WebGL は無く、描いた結果を確かめる手立てがこの層に無い（docs/HARNESS.md「1. 検証の層構造」）。
 */

import { describe, expect, it } from "vitest";
import type { CurrentWindow } from "@/lib/era/window";
import {
  CONTEMPORARY_SERIES_RING_LAYER,
  contemporarySeriesRingLayerIn,
} from "@/lib/map/layers/contemporary-series-ring";
import type { MapLocusCollection, MapLocusFeature } from "@/lib/map/loci";
import {
  ANCHOR_UNLOCATED,
  type Series,
  TIME_RANGE_UNTIMED,
} from "@/lib/schema/series";

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

/** `id` のシリーズを、`timeRange` の年で 1 件作る。 */
function seriesOf(id: string, timeRange: Series["timeRange"]): Series {
  return {
    id,
    title: id,
    season: 1,
    anchor: ANCHOR_UNLOCATED,
    timeRange,
    summary: "",
    region: "ヨーロッパ",
    links: {},
    tags: ["概念史"],
  };
}

/** `features` を地図へ渡す形の全件にする。 */
function lociOf(...features: MapLocusFeature[]): MapLocusCollection {
  return { type: "FeatureCollection", features };
}

describe("contemporarySeriesRingLayerIn", () => {
  it("選択中のシリーズと年が重なる他のシリーズの事物だけを filter に残す", () => {
    const own = locusOf("selected", 120, 140);
    const overlapping = locusOf("overlapping", 140, 200);
    const touching = locusOf("touching", 150, 180);
    const apart = locusOf("apart", 160, 200);

    const layer = contemporarySeriesRingLayerIn({
      currentWindow: WINDOW,
      loci: lociOf(own, overlapping, touching, apart),
      selectedSeries: seriesOf("selected", { start: 100, end: 150 }),
    });

    expect(layer.filter).toEqual([
      "in",
      ["get", "id"],
      ["literal", ["overlapping", "touching"]],
    ]);
  });

  it("選択中のシリーズと年が重なっても、窓と重ならない事物は filter に残さない", () => {
    const outside = locusOf("outside", 500, 600);

    const layer = contemporarySeriesRingLayerIn({
      currentWindow: WINDOW,
      loci: lociOf(outside),
      selectedSeries: seriesOf("selected", { start: 100, end: 600 }),
    });

    expect(layer.filter).toEqual(["in", ["get", "id"], ["literal", []]]);
  });

  it("選択が無ければ、どの事物も filter に残さない", () => {
    const layer = contemporarySeriesRingLayerIn({
      currentWindow: WINDOW,
      loci: lociOf(locusOf("inside", 120, 140)),
      selectedSeries: null,
    });

    expect(layer.filter).toEqual(["in", ["get", "id"], ["literal", []]]);
  });

  it("選択中のシリーズが時期を持たなければ、どの事物も filter に残さない", () => {
    const layer = contemporarySeriesRingLayerIn({
      currentWindow: WINDOW,
      loci: lociOf(locusOf("inside", 120, 140)),
      selectedSeries: seriesOf("okane", TIME_RANGE_UNTIMED),
    });

    expect(layer.filter).toEqual(["in", ["get", "id"], ["literal", []]]);
  });

  it("id と縁の描き方は CONTEMPORARY_SERIES_RING_LAYER から変えない", () => {
    const layer = contemporarySeriesRingLayerIn({
      currentWindow: WINDOW,
      loci: lociOf(),
      selectedSeries: null,
    });

    expect(layer.id).toBe(CONTEMPORARY_SERIES_RING_LAYER.id);
    expect(layer.paint).toEqual(CONTEMPORARY_SERIES_RING_LAYER.paint);
  });
});
