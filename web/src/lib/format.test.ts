import { describe, expect, it } from "vitest";
import { formatTimeRange, formatYearWithoutUnit } from "@/lib/format";

describe("formatYearWithoutUnit", () => {
  it("紀元前には「前」を付け、紀元は数字だけにして、単位を付けない", () => {
    expect(formatYearWithoutUnit(-800)).toBe("前800");
    expect(formatYearWithoutUnit(550)).toBe("550");
  });
});

describe("formatTimeRange", () => {
  it("紀元前から紀元へ跨る年代は、紀元前の端にだけ「前」を付ける", () => {
    expect(formatTimeRange({ start: -800, end: 550 })).toBe("前800年〜550年");
  });

  it("紀元前に閉じた年代は、両端に「前」を付ける", () => {
    expect(formatTimeRange({ start: -900, end: -200 })).toBe(
      "前900年〜前200年",
    );
  });

  it("1 年の出来事はその年だけを書く", () => {
    expect(formatTimeRange({ start: -660, end: -660 })).toBe("前660年");
  });
});
