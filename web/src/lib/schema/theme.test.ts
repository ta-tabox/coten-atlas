import { describe, expect, it } from "vitest";
import {
  parseThemes,
  themeCollectionSchema,
  timeRangeSchema,
} from "@/lib/schema/theme";

/** ARCHITECTURE.md「データモデル」の例をそのまま写した 1 件。 */
const sangokushi = {
  type: "Feature",
  geometry: { type: "Point", coordinates: [112.5, 34.6] },
  properties: {
    id: "sangokushi",
    title: "三国志",
    kind: "polygon",
    timeRange: { start: 180, end: 280 },
    summary: "",
    region: "中国",
    seasons: [22],
    links: [
      { platform: "spotify", url: "https://open.spotify.com/show/sangokushi" },
    ],
    tags: ["戦乱", "中国"],
  },
};

/** 渡した件数の FeatureCollection を作る。 */
function collectionOf(...features: unknown[]): unknown {
  return { type: "FeatureCollection", features };
}

/** 正例の properties を部分的に差し替えた 1 件を作る。 */
function themeWith(properties: Record<string, unknown>): unknown {
  return {
    ...sangokushi,
    properties: { ...sangokushi.properties, ...properties },
  };
}

describe("themeCollectionSchema", () => {
  it("ARCHITECTURE の例をそのまま通す", () => {
    const parsed = parseThemes(collectionOf(sangokushi));

    expect(parsed.features[0].properties.id).toBe("sangokushi");
  });

  it("未知の kind を落とす", () => {
    const result = themeCollectionSchema.safeParse(
      collectionOf(themeWith({ kind: "raster" })),
    );

    expect(result.success).toBe(false);
  });

  it("id が重複した 2 件を落とす", () => {
    const result = themeCollectionSchema.safeParse(
      collectionOf(sangokushi, themeWith({ seasons: [23] })),
    );

    expect(result.success).toBe(false);
  });

  it("同じ season を 2 テーマが持つと落とす", () => {
    const result = themeCollectionSchema.safeParse(
      collectionOf(sangokushi, themeWith({ id: "sangokushi-2" })),
    );

    expect(result.success).toBe(false);
  });

  it("緯度と経度が入れ替わった座標を落とす", () => {
    const swapped = {
      ...sangokushi,
      geometry: { type: "Point", coordinates: [34.6, 112.5] },
    };
    const result = themeCollectionSchema.safeParse(collectionOf(swapped));

    expect(result.success).toBe(false);
  });

  it("閉じていない多角形を落とす", () => {
    const openRing = {
      ...sangokushi,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [110, 30],
            [115, 30],
            [115, 35],
            [110, 35],
          ],
        ],
      },
    };
    const result = themeCollectionSchema.safeParse(collectionOf(openRing));

    expect(result.success).toBe(false);
  });
});

describe("timeRangeSchema", () => {
  it("紀元前を負値で受ける", () => {
    const parsed = timeRangeSchema.parse({ start: -800, end: -146 });

    expect(parsed.start).toBe(-800);
  });

  it("start と end が同じ年でも受ける", () => {
    expect(timeRangeSchema.safeParse({ start: 1600, end: 1600 }).success).toBe(
      true,
    );
  });

  it("start が end より後なら落とす", () => {
    const result = timeRangeSchema.safeParse({ start: 280, end: 180 });

    expect(result.success).toBe(false);
  });
});

describe("parseThemes", () => {
  it("落とした理由を文脈付きで投げる", () => {
    expect(() =>
      parseThemes(collectionOf(themeWith({ kind: "raster" }))),
    ).toThrow(/themes/);
  });
});
