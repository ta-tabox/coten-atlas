import { describe, expect, it } from "vitest";
import {
  formatTagCondition,
  formatTimeRange,
  formatYearWithoutUnit,
} from "@/lib/format";

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

describe("formatTagCondition", () => {
  it("タグが 1 つなら、そのタグを持つ句にする", () => {
    expect(formatTagCondition(["戦争"])).toBe("「戦争」を持つ");
  });

  it("タグが 2 つ以上なら、すべてを持つ句にする", () => {
    expect(formatTagCondition(["戦争", "人物"])).toBe(
      "「戦争」「人物」をすべて持つ",
    );
  });
});
