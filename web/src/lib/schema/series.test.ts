import { describe, expect, it } from "vitest";
import {
  parseSeries,
  seriesListSchema,
  seriesTimeRangeSchema,
} from "@/lib/schema/series";

/** docs/ARCHITECTURE.md「データモデル」の例をそのまま写した 1 件。 */
const sparta = {
  id: "sparta",
  title: "スパルタ",
  kind: "place",
  anchor: "sparta-city",
  timeRange: { start: -900, end: -200 },
  summary: "",
  region: "ギリシア",
  season: 2,
  links: [],
  tags: ["古代", "ギリシア"],
};

/** 正例を部分的に差し替えた 1 件を作る。 */
function seriesWith(overrides: Record<string, unknown>): unknown {
  return { ...sparta, ...overrides };
}

describe("seriesListSchema", () => {
  it("ARCHITECTURE の例をそのまま通す", () => {
    const parsed = parseSeries([sparta]);

    expect(parsed[0].id).toBe("sparta");
  });

  it("位置なしの印を anchor に受ける", () => {
    const parsed = parseSeries([seriesWith({ anchor: "unlocated" })]);

    expect(parsed[0].anchor).toBe("unlocated");
  });

  it("未知の kind を落とす", () => {
    const result = seriesListSchema.safeParse([seriesWith({ kind: "raster" })]);

    expect(result.success).toBe(false);
  });

  it("geometry を持つ 1 件を落とす", () => {
    const result = seriesListSchema.safeParse([
      seriesWith({ geometry: { type: "Point", coordinates: [22.43, 37.07] } }),
    ]);

    expect(result.success).toBe(false);
  });

  it("スキーマに無いキーを持つ 1 件を落とす", () => {
    const result = seriesListSchema.safeParse([
      seriesWith({ related: ["athens"] }),
    ]);

    expect(result.success).toBe(false);
  });

  it("id が重複した 2 件を落とす", () => {
    const result = seriesListSchema.safeParse([
      sparta,
      seriesWith({ season: 3 }),
    ]);

    expect(result.success).toBe(false);
  });

  it("同じ season を 2 シリーズが持つと落とす", () => {
    const result = seriesListSchema.safeParse([
      sparta,
      seriesWith({ id: "sparta-2" }),
    ]);

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
    const result = seriesListSchema.safeParse([twoSpotify]);

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
    expect(() => parseSeries([seriesWith({ kind: "raster" })])).toThrow(
      /series/,
    );
  });
});
