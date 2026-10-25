import { describe, expect, it } from "vitest";
import { updateLocusCoordinates } from "@/lib/catalog-edit/locus-coordinates";
import { type LocusCollection, TIME_RANGE_OF_SERIES } from "@/lib/schema/locus";

/** 代表点を 2 件持つ事物の全件。 */
const loci: LocusCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [131.399, 34.408] },
      properties: {
        id: "hagi",
        seriesId: "yoshida-shoin",
        timeRange: TIME_RANGE_OF_SERIES,
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [22.43, 37.07] },
      properties: {
        id: "sparta-city",
        seriesId: "sparta",
        timeRange: TIME_RANGE_OF_SERIES,
      },
    },
  ],
};

describe("updateLocusCoordinates", () => {
  it("id が一致する事物の座標だけが書き換わり、他の事物はそのまま残る", () => {
    const updated = updateLocusCoordinates(loci, {
      id: "sparta-city",
      coordinates: [22.5, 37.1],
    });

    expect(updated?.features.map((f) => f.geometry.coordinates)).toEqual([
      [131.399, 34.408],
      [22.5, 37.1],
    ]);
  });

  it("書き換えた座標は小数第 3 位で丸まる", () => {
    const updated = updateLocusCoordinates(loci, {
      id: "hagi",
      coordinates: [131.40049999, 34.4084999],
    });

    expect(updated?.features[0].geometry.coordinates).toEqual([131.4, 34.408]);
  });

  it("id が一致する事物が無ければ undefined を返す", () => {
    expect(
      updateLocusCoordinates(loci, { id: "nowhere", coordinates: [0, 0] }),
    ).toBeUndefined();
  });

  it("渡した全件は書き換わらない", () => {
    updateLocusCoordinates(loci, { id: "hagi", coordinates: [0, 0] });

    expect(loci.features[0].geometry.coordinates).toEqual([131.399, 34.408]);
  });
});
