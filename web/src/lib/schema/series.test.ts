import { describe, expect, it } from "vitest";
import {
  parseSeries,
  seriesListSchema,
  seriesTimeRangeSchema,
  TIME_RANGE_UNTIMED,
} from "@/lib/schema/series";

/** docs/ARCHITECTURE.md「データモデル」の例をそのまま写した 1 件。 */
const sparta = {
  id: "sparta",
  title: "スパルタ",
  kind: "place",
  anchor: "sparta-city",
  timeRange: { start: -900, end: -200 },
  summary: "",
  region: "ヨーロッパ",
  season: 2,
  links: [],
  tags: ["集団", "戦争"],
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
    const parsed = parseSeries([
      seriesWith({ kind: "concept", anchor: "unlocated" }),
    ]);

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

describe("ADR-0044 が決めた語彙の検査", () => {
  it("一覧に無い region を拒否する", () => {
    const result = seriesListSchema.safeParse([
      seriesWith({ region: "ギリシア" }),
    ]);

    expect(result.success).toBe(false);
  });

  it("種別を 1 つも持たない tags を拒否する", () => {
    const result = seriesListSchema.safeParse([seriesWith({ tags: ["戦争"] })]);

    expect(result.success).toBe(false);
  });

  it("種別が 2 つある tags を受ける", () => {
    const parsed = parseSeries([seriesWith({ tags: ["人物", "出来事"] })]);

    expect(parsed[0].tags).toEqual(["人物", "出来事"]);
  });

  it("tags が 5 個ある 1 件を拒否する", () => {
    const result = seriesListSchema.safeParse([
      seriesWith({ tags: ["人物", "幕末", "思想", "教育", "戦争"] }),
    ]);

    expect(result.success).toBe(false);
  });

  it("era と同じ粒度の時代名を持つ tags を拒否する", () => {
    const result = seriesListSchema.safeParse([
      seriesWith({ tags: ["集団", "古代"] }),
    ]);

    expect(result.success).toBe(false);
  });

  it("era より細かい時代名を持つ tags を受ける", () => {
    const parsed = parseSeries([seriesWith({ tags: ["人物", "幕末"] })]);

    expect(parsed[0].tags).toEqual(["人物", "幕末"]);
  });

  it("番組内のコーナー名で始まる title を拒否する", () => {
    const result = seriesListSchema.safeParse([
      seriesWith({ title: "ショート 紫式部" }),
    ]);

    expect(result.success).toBe(false);
  });

  it("kind が place で anchor が位置なしの 1 件を拒否する", () => {
    const result = seriesListSchema.safeParse([
      seriesWith({ kind: "place", anchor: "unlocated" }),
    ]);

    expect(result.success).toBe(false);
  });

  it("kind が concept なら代表点を持ってよい", () => {
    const parsed = parseSeries([
      seriesWith({ kind: "concept", tags: ["概念史"] }),
    ]);

    expect(parsed[0].anchor).toBe("sparta-city");
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

describe("時期を持たないことを表す timeRange", () => {
  /** 種別が概念史だけで位置なしのシリーズへ差し替える欄。 */
  const untimedConcept = {
    kind: "concept",
    anchor: "unlocated",
    timeRange: TIME_RANGE_UNTIMED,
    tags: ["経済", "概念史"],
  };

  it("種別が概念史だけで位置なしのシリーズなら受ける", () => {
    const parsed = parseSeries([seriesWith(untimedConcept)]);

    expect(parsed[0].timeRange).toBe(TIME_RANGE_UNTIMED);
  });

  it("種別に人物を含むシリーズなら拒否する", () => {
    const result = seriesListSchema.safeParse([
      seriesWith({ ...untimedConcept, tags: ["人物", "概念史"] }),
    ]);

    expect(result.success).toBe(false);
  });

  it("代表点を持つシリーズなら拒否する", () => {
    const result = seriesListSchema.safeParse([
      seriesWith({ ...untimedConcept, anchor: "sparta-city" }),
    ]);

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
