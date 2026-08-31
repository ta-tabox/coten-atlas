import { describe, expect, it } from "vitest";
import {
  parseSeries,
  seriesCollectionSchema,
  seriesTimeRangeSchema,
} from "@/lib/schema/series";

/** ARCHITECTURE.md「データモデル」の例をそのまま写した 1 件。 */
const sparta = {
  type: "Feature",
  geometry: { type: "Point", coordinates: [22.43, 37.07] },
  properties: {
    id: "sparta",
    title: "スパルタ",
    kind: "place",
    timeRange: { start: -900, end: -200 },
    summary: "",
    region: "ギリシア",
    season: 2,
    links: [],
    tags: ["古代", "ギリシア"],
  },
};

/** 渡した件数の FeatureCollection を作る。 */
function collectionOf(...features: unknown[]): unknown {
  return { type: "FeatureCollection", features };
}

/** 正例の properties を部分的に差し替えた 1 件を作る。 */
function seriesWith(properties: Record<string, unknown>): unknown {
  return {
    ...sparta,
    properties: { ...sparta.properties, ...properties },
  };
}

describe("seriesCollectionSchema", () => {
  it("ARCHITECTURE の例をそのまま通す", () => {
    const parsed = parseSeries(collectionOf(sparta));

    expect(parsed.features[0].properties.id).toBe("sparta");
  });

  it("未知の kind を落とす", () => {
    const result = seriesCollectionSchema.safeParse(
      collectionOf(seriesWith({ kind: "raster" })),
    );

    expect(result.success).toBe(false);
  });

  it("id が重複した 2 件を落とす", () => {
    const result = seriesCollectionSchema.safeParse(
      collectionOf(sparta, seriesWith({ season: 3 })),
    );

    expect(result.success).toBe(false);
  });

  it("同じ season を 2 シリーズが持つと落とす", () => {
    const result = seriesCollectionSchema.safeParse(
      collectionOf(sparta, seriesWith({ id: "sparta-2" })),
    );

    expect(result.success).toBe(false);
  });

  it("同じ配信基盤のリンクを 2 本持つシリーズを落とす", () => {
    const twoSpotify = seriesWith({
      links: [
        {
          platform: "spotify",
          url: "https://podcasters.spotify.com/pod/show/coten/episodes/a",
        },
        {
          platform: "spotify",
          url: "https://podcasters.spotify.com/pod/show/coten/episodes/b",
        },
      ],
    });
    const result = seriesCollectionSchema.safeParse(collectionOf(twoSpotify));

    expect(result.success).toBe(false);
  });
});

describe("seriesTimeRangeSchema", () => {
  it("紀元前を負値で受ける", () => {
    const parsed = seriesTimeRangeSchema.parse({ start: -800, end: -146 });

    expect(parsed.start).toBe(-800);
  });

  it("start と end が同じ年でも受ける", () => {
    expect(
      seriesTimeRangeSchema.safeParse({ start: 1600, end: 1600 }).success,
    ).toBe(true);
  });

  it("start が end より後なら落とす", () => {
    const result = seriesTimeRangeSchema.safeParse({ start: 280, end: 180 });

    expect(result.success).toBe(false);
  });
});

describe("parseSeries", () => {
  it("落とした理由を文脈付きで投げる", () => {
    expect(() =>
      parseSeries(collectionOf(seriesWith({ kind: "raster" }))),
    ).toThrow(/series/);
  });
});
