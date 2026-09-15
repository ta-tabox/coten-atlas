/**
 * レイヤ定義は宣言的なデータなので、描画でなく定義を見る。
 * jsdom に WebGL は無く、描いた結果を確かめる手立てがこの層に無い（docs/HARNESS.md「1. 検証の層構造」）。
 */

import { describe, expect, it } from "vitest";
import {
  type CurrentWindow,
  fadeOpacity,
  overlapRatio,
} from "@/lib/era/window";
import type { MapLocusCollection, MapLocusFeature } from "@/lib/map/loci";
import {
  SELECTED_SERIES_RING_LAYER,
  SERIES_CIRCLE_LAYER,
  selectedSeriesRingLayerIn,
  seriesCircleLayerIn,
  seriesIdsOnMapIn,
} from "@/lib/map/series-layer";

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

describe("seriesCircleLayerIn", () => {
  it("事物ごとの窓との重なりから求めた濃さを、そのまま不透明度にする", () => {
    const inside = locusOf("inside", 120, 140);
    const partial = locusOf("partial", 190, 300);

    const layer = seriesCircleLayerIn(WINDOW, lociOf(inside, partial));

    expect(layer.paint?.["circle-opacity"]).toEqual([
      "match",
      ["get", "id"],
      "inside",
      1,
      "partial",
      fadeOpacity(overlapRatio(WINDOW, { start: 190, end: 300 })),
      0,
    ]);
  });

  it("窓と重ならない事物を filter で除く", () => {
    const inside = locusOf("inside", 120, 140);
    const outside = locusOf("outside", 500, 600);

    const layer = seriesCircleLayerIn(WINDOW, lociOf(inside, outside));

    expect(layer.filter).toEqual([
      "in",
      ["get", "id"],
      ["literal", ["inside"]],
    ]);
  });

  it("窓と重なる事物が 1 件も無ければ、不透明度を 0 にする", () => {
    const outside = locusOf("outside", 500, 600);

    const layer = seriesCircleLayerIn(WINDOW, lociOf(outside));

    expect(layer.paint?.["circle-opacity"]).toBe(0);
    expect(layer.filter).toEqual(["in", ["get", "id"], ["literal", []]]);
  });

  it("窓が動くと circle-opacity が変わる", () => {
    const loci = lociOf(locusOf("partial", 190, 300));

    const before = seriesCircleLayerIn(WINDOW, loci);
    const after = seriesCircleLayerIn({ start: 150, end: 250 }, loci);

    expect(after.paint?.["circle-opacity"]).not.toEqual(
      before.paint?.["circle-opacity"],
    );
  });

  it("不透明度の遷移を 0 にする", () => {
    const layer = seriesCircleLayerIn(WINDOW, lociOf());

    expect(layer.paint?.["circle-opacity-transition"]).toEqual({
      duration: 0,
    });
  });

  it("id と色と半径は SERIES_CIRCLE_LAYER から変えない", () => {
    const layer = seriesCircleLayerIn(WINDOW, lociOf());

    expect(layer.id).toBe(SERIES_CIRCLE_LAYER.id);
    expect(layer.paint?.["circle-color"]).toBe(
      SERIES_CIRCLE_LAYER.paint?.["circle-color"],
    );
    expect(layer.paint?.["circle-radius"]).toBe(
      SERIES_CIRCLE_LAYER.paint?.["circle-radius"],
    );
  });
});

describe("seriesIdsOnMapIn", () => {
  it("窓と重なる事物を持つシリーズの id だけを返す", () => {
    const inside = locusOf("inside", 120, 140);
    const outside = locusOf("outside", 500, 600);

    expect(seriesIdsOnMapIn(WINDOW, lociOf(inside, outside))).toEqual(
      new Set(["inside"]),
    );
  });

  it("窓と重なる事物を 2 件持つシリーズの id を 1 つにまとめる", () => {
    const first = withSeriesId(locusOf("first", 120, 140), "sparta");
    const second = withSeriesId(locusOf("second", 150, 160), "sparta");

    expect(seriesIdsOnMapIn(WINDOW, lociOf(first, second))).toEqual(
      new Set(["sparta"]),
    );
  });
});

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
