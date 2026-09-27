import { describe, expect, it } from "vitest";
import { parseSeasonCorrections } from "@/lib/schema/season-correction";

/** 訂正表の 1 行。 */
const correction = {
  guid: "de11d2d5-62dc-4c83-923b-419b71c94193",
  season: 40,
  reason: "フィードの itunes:season は 37 だが、サラディンと十字軍の回である",
};

describe("parseSeasonCorrections", () => {
  it("空の訂正表を通す", () => {
    expect(parseSeasonCorrections([])).toEqual([]);
  });

  it("season を正の整数で書いた行を通す", () => {
    expect(parseSeasonCorrections([correction])).toEqual([correction]);
  });

  it("season を null で書いた行を通す", () => {
    const unassigned = { ...correction, season: null };

    expect(parseSeasonCorrections([unassigned])).toEqual([unassigned]);
  });

  it("season が 0 の行で throw する", () => {
    expect(() =>
      parseSeasonCorrections([{ ...correction, season: 0 }]),
    ).toThrow();
  });

  it("reason が空の行で throw する", () => {
    expect(() =>
      parseSeasonCorrections([{ ...correction, reason: "" }]),
    ).toThrow();
  });

  it("前後に空白の付いた guid の行で throw する", () => {
    const padded = { ...correction, guid: ` ${correction.guid}` };

    expect(() => parseSeasonCorrections([padded])).toThrow();
  });

  it("スキーマに無いキーを持つ行で throw する", () => {
    expect(() =>
      parseSeasonCorrections([
        { ...correction, seriesId: "saladin-to-jujigun" },
      ]),
    ).toThrow();
  });

  it("同じ guid の行が二つあると、その guid を名指して throw する", () => {
    expect(() =>
      parseSeasonCorrections([correction, { ...correction, season: 37 }]),
    ).toThrow(correction.guid);
  });
});
