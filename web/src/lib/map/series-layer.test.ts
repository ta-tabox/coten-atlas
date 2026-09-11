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
  CIRCLE_OPACITY_BY_KIND,
  SERIES_CIRCLE_LAYER,
  seriesCircleLayerIn,
} from "@/lib/map/series-layer";

/** `kind` だけで決まる円の不透明度の式。 */
const OPACITY_BY_KIND = [
  "match",
  ["get", "kind"],
  "concept",
  CIRCLE_OPACITY_BY_KIND.concept,
  CIRCLE_OPACITY_BY_KIND.place,
];

const WINDOW: CurrentWindow = { start: 100, end: 200 };

/** `id` の事物を、`timeStart` から `timeEnd` までの年で 1 件作る。 */
function locusOf(
  id: string,
  timeStart: number,
  timeEnd: number,
): MapLocusFeature {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [0, 0] },
    properties: { id, seriesId: id, kind: "place", timeStart, timeEnd },
  };
}

/** `features` を地図へ渡す形の全件にする。 */
function lociOf(...features: MapLocusFeature[]): MapLocusCollection {
  return { type: "FeatureCollection", features };
}

describe("SERIES_CIRCLE_LAYER", () => {
  it("円の濃さを kind の 2 値で分ける", () => {
    expect(SERIES_CIRCLE_LAYER.paint?.["circle-opacity"]).toEqual(
      OPACITY_BY_KIND,
    );
  });

  it("concept を place より薄く描く", () => {
    expect(CIRCLE_OPACITY_BY_KIND.concept).toBeLessThan(
      CIRCLE_OPACITY_BY_KIND.place,
    );
  });
});

describe("seriesCircleLayerIn", () => {
  it("kind の濃さに、事物ごとの窓との重なりから求めた濃さを掛ける", () => {
    const inside = locusOf("inside", 120, 140);
    const partial = locusOf("partial", 190, 300);

    const layer = seriesCircleLayerIn(WINDOW, lociOf(inside, partial));

    expect(layer.paint?.["circle-opacity"]).toEqual([
      "*",
      OPACITY_BY_KIND,
      [
        "match",
        ["get", "id"],
        "inside",
        1,
        "partial",
        fadeOpacity(overlapRatio(WINDOW, { start: 190, end: 300 })),
        0,
      ],
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

  it("窓と重なる事物が 1 件も無ければ、窓の濃さを 0 にする", () => {
    const outside = locusOf("outside", 500, 600);

    const layer = seriesCircleLayerIn(WINDOW, lociOf(outside));

    expect(layer.paint?.["circle-opacity"]).toEqual(["*", OPACITY_BY_KIND, 0]);
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
