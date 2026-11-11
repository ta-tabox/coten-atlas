/**
 * 現在窓と重なる事物から、地図に出ているシリーズの id を求める関数のテストを置く。
 */

import { describe, expect, it } from "vitest";
import type { CurrentWindow } from "@/lib/era/window";
import type { MapLocusCollection, MapLocusFeature } from "@/lib/map/loci";
import { seriesIdsOnMapIn } from "@/lib/map/series-layer";

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
