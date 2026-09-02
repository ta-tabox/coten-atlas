import { describe, expect, it } from "vitest";
import {
  locusCollectionSchema,
  parseLoci,
  TIME_RANGE_OF_SERIES,
} from "@/lib/schema/locus";
import { ANCHOR_UNLOCATED } from "@/lib/schema/series";

/** ARCHITECTURE.md「データモデル」の例をそのまま写した 1 件。 */
const spartaCity = {
  type: "Feature",
  geometry: { type: "Point", coordinates: [22.43, 37.07] },
  properties: {
    id: "sparta-city",
    seriesId: "sparta",
    timeRange: TIME_RANGE_OF_SERIES,
  },
};

/** 渡した件数の FeatureCollection を作る。 */
function collectionOf(...features: unknown[]): unknown {
  return { type: "FeatureCollection", features };
}

/** 正例の properties を部分的に差し替えた 1 件を作る。 */
function locusWith(properties: Record<string, unknown>): unknown {
  return {
    ...spartaCity,
    properties: { ...spartaCity.properties, ...properties },
  };
}

describe("locusCollectionSchema", () => {
  it("ARCHITECTURE の例をそのまま通す", () => {
    const parsed = parseLoci(collectionOf(spartaCity));

    expect(parsed.features[0].properties.id).toBe("sparta-city");
  });

  it("年の閉区間を書いた timeRange を受ける", () => {
    const parsed = parseLoci(
      collectionOf(locusWith({ timeRange: { start: -404, end: -371 } })),
    );

    expect(parsed.features[0].properties.timeRange).toEqual({
      start: -404,
      end: -371,
    });
  });

  it("逆転した timeRange を落とす", () => {
    const result = locusCollectionSchema.safeParse(
      collectionOf(locusWith({ timeRange: { start: -371, end: -404 } })),
    );

    expect(result.success).toBe(false);
  });

  it("位置なしの印を id に名乗る事物を落とす", () => {
    const result = locusCollectionSchema.safeParse(
      collectionOf(locusWith({ id: ANCHOR_UNLOCATED })),
    );

    expect(result.success).toBe(false);
  });

  it("Point 以外の geometry を落とす", () => {
    const line = {
      ...spartaCity,
      geometry: {
        type: "LineString",
        coordinates: [
          [22.43, 37.07],
          [23.73, 37.98],
        ],
      },
    };
    const result = locusCollectionSchema.safeParse(collectionOf(line));

    expect(result.success).toBe(false);
  });

  it("スキーマに無いキーを持つ properties を落とす", () => {
    const result = locusCollectionSchema.safeParse(
      collectionOf(locusWith({ role: "anchor" })),
    );

    expect(result.success).toBe(false);
  });

  it("id が重複した 2 件を落とす", () => {
    const result = locusCollectionSchema.safeParse(
      collectionOf(spartaCity, locusWith({ seriesId: "athens" })),
    );

    expect(result.success).toBe(false);
  });
});

describe("parseLoci", () => {
  it("落とした理由を文脈付きで投げる", () => {
    expect(() => parseLoci(collectionOf(locusWith({ id: "" })))).toThrow(
      /loci/,
    );
  });
});
