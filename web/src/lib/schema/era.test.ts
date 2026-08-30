import { describe, expect, it } from "vitest";
import { ERA_END_PRESENT, eraListSchema, parseEras } from "@/lib/schema/era";

/** ARCHITECTURE.md「時系列（era）モデル」の 7 区分をそのまま写したもの。 */
const eras = [
  { id: "prehistory", label: "先史", start: -10000, end: -800 },
  { id: "ancient", label: "古代", start: -800, end: 550 },
  { id: "medieval", label: "中世", start: 550, end: 1450 },
  { id: "earlymodern", label: "近世", start: 1450, end: 1800 },
  { id: "modern19", label: "19世紀", start: 1800, end: 1900 },
  { id: "modern20a", label: "〜WWII", start: 1900, end: 1945 },
  { id: "modern20b", label: "戦後", start: 1945, end: ERA_END_PRESENT },
];

describe("eraListSchema", () => {
  it("隙間なく並んだ 7 区分を通す", () => {
    const parsed = parseEras(eras);

    expect(parsed).toHaveLength(7);
  });

  it("区間に隙間があれば落とす", () => {
    const gapped = eras.map((era) =>
      era.id === "medieval" ? { ...era, start: 600 } : era,
    );
    const result = eraListSchema.safeParse(gapped);

    expect(result.success).toBe(false);
  });

  it("区間が重なっていれば落とす", () => {
    const overlapped = eras.map((era) =>
      era.id === "medieval" ? { ...era, start: 500 } : era,
    );
    const result = eraListSchema.safeParse(overlapped);

    expect(result.success).toBe(false);
  });

  it("幅の無い区間を落とす", () => {
    const result = eraListSchema.safeParse([
      { id: "flat", label: "点", start: 1800, end: 1800 },
    ]);

    expect(result.success).toBe(false);
  });

  it("id が重複していれば落とす", () => {
    const duplicated = eras.map((era) =>
      era.id === "medieval" ? { ...era, id: "ancient" } : era,
    );
    const result = eraListSchema.safeParse(duplicated);

    expect(result.success).toBe(false);
  });

  it("終わっていない区間の後ろに区間があれば落とす", () => {
    const trailing = [
      { id: "ancient", label: "古代", start: -800, end: ERA_END_PRESENT },
      { id: "medieval", label: "中世", start: 550, end: 1450 },
    ];

    expect(eraListSchema.safeParse(trailing).success).toBe(false);
  });

  it("終わっていない区間には幅の検査を掛けない", () => {
    const onlyOne = [
      { id: "modern", label: "現代", start: 1945, end: ERA_END_PRESENT },
    ];

    expect(eraListSchema.safeParse(onlyOne).success).toBe(true);
  });

  it("空の列を落とす", () => {
    expect(eraListSchema.safeParse([]).success).toBe(false);
  });
});

describe("parseEras", () => {
  it("落とした理由を文脈付きで投げる", () => {
    expect(() => parseEras([])).toThrow(/eras/);
  });
});
