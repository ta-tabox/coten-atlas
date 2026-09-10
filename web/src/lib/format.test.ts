import { describe, expect, it } from "vitest";
import { formatTimeRange } from "@/lib/format";

describe("formatTimeRange", () => {
  it("紀元前から紀元へ跨る年代を両端で書く", () => {
    expect(formatTimeRange({ start: -800, end: 550 })).toBe(
      "紀元前800年〜紀元550年",
    );
  });

  it("紀元前に閉じた年代の両端に紀元前を付ける", () => {
    expect(formatTimeRange({ start: -900, end: -200 })).toBe(
      "紀元前900年〜紀元前200年",
    );
  });

  it("1 年の出来事はその年だけを書く", () => {
    expect(formatTimeRange({ start: -660, end: -660 })).toBe("紀元前660年");
  });
});
