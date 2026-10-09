import { describe, expect, it } from "vitest";
import { parseLocusMove, parseLocusMoveResult } from "@/lib/schema/locus-move";

describe("parseLocusMove", () => {
  it("事物の id と経度・緯度の対を受ける", () => {
    const move = parseLocusMove({ id: "hagi", coordinates: [131.4, 34.41] });

    expect(move).toEqual({ id: "hagi", coordinates: [131.4, 34.41] });
  });

  it("緯度が -90..90 の外にある座標は throw する", () => {
    expect(() =>
      parseLocusMove({ id: "hagi", coordinates: [131.4, 95] }),
    ).toThrow(/緯度/);
  });

  it("id が空の要求は throw する", () => {
    expect(() =>
      parseLocusMove({ id: "", coordinates: [131.4, 34.41] }),
    ).toThrow();
  });

  it("スキーマに無いキーを持つ要求は throw する", () => {
    expect(() =>
      parseLocusMove({
        id: "hagi",
        coordinates: [131.4, 34.41],
        seriesId: "x",
      }),
    ).toThrow();
  });
});

describe("parseLocusMoveResult", () => {
  it("理由の文の配列を持つ応答を受ける", () => {
    expect(parseLocusMoveResult({ problems: ["理由"] })).toEqual({
      problems: ["理由"],
    });
  });

  it("problems を持たない応答は throw する", () => {
    expect(() => parseLocusMoveResult({ ok: true })).toThrow();
  });
});
