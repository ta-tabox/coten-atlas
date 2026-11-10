import { describe, expect, it } from "vitest";
import { parseLocusPatch } from "@/lib/schema/locus-patch";

describe("parseLocusPatch", () => {
  it("事物の id と経度・緯度の対を受ける", () => {
    const patch = parseLocusPatch({ id: "hagi", coordinates: [131.4, 34.41] });

    expect(patch).toEqual({ id: "hagi", coordinates: [131.4, 34.41] });
  });

  it("緯度が -90..90 の外にある座標は throw する", () => {
    expect(() =>
      parseLocusPatch({ id: "hagi", coordinates: [131.4, 95] }),
    ).toThrow(/緯度/);
  });

  it("id が空の要求は throw する", () => {
    expect(() =>
      parseLocusPatch({ id: "", coordinates: [131.4, 34.41] }),
    ).toThrow();
  });

  it("スキーマに無いキーを持つ要求は throw する", () => {
    expect(() =>
      parseLocusPatch({
        id: "hagi",
        coordinates: [131.4, 34.41],
        seriesId: "x",
      }),
    ).toThrow();
  });
});
