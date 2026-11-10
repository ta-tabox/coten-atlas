import { describe, expect, it } from "vitest";
import { listMovedLoci } from "@/lib/catalog-editor/moved-loci";
import { type LocusCollection, TIME_RANGE_OF_SERIES } from "@/lib/schema/locus";

/** `[id, 座標]` の対から、事物の全件を作る。 */
function lociOf(...pairs: [string, [number, number]][]): LocusCollection {
  return {
    type: "FeatureCollection",
    features: pairs.map(([id, coordinates]) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates },
      properties: { id, seriesId: id, timeRange: TIME_RANGE_OF_SERIES },
    })),
  };
}

describe("listMovedLoci", () => {
  it("座標が変わった事物だけを、変更前と変更後の座標と一緒に返す", () => {
    const before = lociOf(
      ["hagi", [131.399, 34.408]],
      ["sparta-city", [22.43, 37.07]],
    );
    const current = lociOf(
      ["hagi", [131.399, 34.408]],
      ["sparta-city", [22.5, 37.1]],
    );

    expect(listMovedLoci(before, current)).toEqual([
      { id: "sparta-city", before: [22.43, 37.07], after: [22.5, 37.1] },
    ]);
  });

  it("どの事物の座標も変わっていなければ空配列を返す", () => {
    const loci = lociOf(["hagi", [131.399, 34.408]]);

    expect(listMovedLoci(loci, loci)).toEqual([]);
  });

  it("変更前の全件に無い事物は返さない", () => {
    const before = lociOf(["hagi", [131.399, 34.408]]);
    const current = lociOf(["hagi", [131.399, 34.408]], ["new-locus", [0, 0]]);

    expect(listMovedLoci(before, current)).toEqual([]);
  });
});
