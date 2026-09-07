/**
 * 現在窓の取り方と、そこからシリーズの濃淡へ落ちるまでを見る。
 *
 * 窓も `timeRange` も両端を含む閉区間なので、境界の 1 年がそのまま見えるかどうかを分ける。
 * 重なりの本体はその 1 年の扱いにあるので、接するだけの範囲と 1 年だけ重なる範囲を並べて置く。
 */

import { describe, expect, it } from "vitest";
import {
  type CurrentWindow,
  currentWindow,
  fadeOpacity,
  overlapRatio,
} from "@/lib/era/window";
import { ERA_END_PRESENT, parseEras } from "@/lib/schema/era";

/** docs/ARCHITECTURE.md §3 の 7 区分をそのまま写したもの。 */
const ERAS = parseEras([
  { id: "prehistory", label: "先史", start: -10000, end: -800 },
  { id: "ancient", label: "古代", start: -800, end: 550 },
  { id: "medieval", label: "中世", start: 550, end: 1450 },
  { id: "earlymodern", label: "近世", start: 1450, end: 1800 },
  { id: "modern19", label: "19世紀", start: 1800, end: 1900 },
  { id: "modern20a", label: "〜WWII", start: 1900, end: 1945 },
  { id: "modern20b", label: "戦後", start: 1945, end: ERA_END_PRESENT },
]);

/** 戦後の右端に置く年。 */
const PRESENT_END = 2026;

/** 19 世紀（1800〜1900）の真ん中に取った窓。 */
const WINDOW_IN_19C: CurrentWindow = { start: 1825, end: 1875 };

describe("currentWindow", () => {
  it("区間の真ん中では、その区間の幅の半分を取る", () => {
    expect(currentWindow(4.5 / 7, ERAS, PRESENT_END)).toEqual(WINDOW_IN_19C);
  });

  it("同じ幅でも、era が変われば跨る年数が変わる", () => {
    // 先史は 9200 年幅なので、19 世紀の 50 年に対して 4600 年になる。
    expect(currentWindow(0.5 / 7, ERAS, PRESENT_END)).toEqual({
      start: -7700,
      end: -3100,
    });
  });

  it("era 空間の端では、外へ出た側が落ちて窓が狭くなる", () => {
    expect(currentWindow(0, ERAS, PRESENT_END)).toEqual({
      start: -10000,
      end: -7700,
    });
  });
});

describe("overlapRatio", () => {
  it("1 年のシリーズは、その年を含む窓で 1.0 になる", () => {
    expect(overlapRatio(WINDOW_IN_19C, { start: 1850, end: 1850 })).toBe(1);
  });

  it("窓を覆い尽くすシリーズも 1.0 になる", () => {
    expect(overlapRatio(WINDOW_IN_19C, { start: 1000, end: 1990 })).toBe(1);
  });

  it("窓と重ならないシリーズは 0 になる", () => {
    expect(overlapRatio(WINDOW_IN_19C, { start: 1900, end: 1950 })).toBe(0);
  });

  it("窓の外側に接するだけのシリーズも 0 になる", () => {
    expect(overlapRatio(WINDOW_IN_19C, { start: 1876, end: 1900 })).toBe(0);
    expect(overlapRatio(WINDOW_IN_19C, { start: 1700, end: 1824 })).toBe(0);
  });

  it("窓の端の 1 年だけ重なるシリーズは、その 1 年ぶんになる", () => {
    // 窓は 51 年、シリーズは 26 年なので、短い方の 26 年が分母になる。
    expect(overlapRatio(WINDOW_IN_19C, { start: 1875, end: 1900 })).toBe(
      1 / 26,
    );
  });

  it("窓の半分に重なるシリーズは 0.5 前後になる", () => {
    // 1850〜1875 の 26 年が、51 年の窓のうちに入る。
    expect(overlapRatio(WINDOW_IN_19C, { start: 1850, end: 1900 })).toBe(
      26 / 51,
    );
  });
});

describe("fadeOpacity", () => {
  it("両端は 0 と 1 のまま、真ん中も動かさない", () => {
    expect(fadeOpacity(0)).toBe(0);
    expect(fadeOpacity(1)).toBe(1);
    expect(fadeOpacity(0.5)).toBe(0.5);
  });

  it("両端の近くでは、重なり率より緩やかに動く", () => {
    expect(fadeOpacity(0.1)).toBeLessThan(0.1);
    expect(fadeOpacity(0.9)).toBeGreaterThan(0.9);
  });

  it("0..1 の外を渡されたら両端へ寄せる", () => {
    expect(fadeOpacity(-1)).toBe(0);
    expect(fadeOpacity(2)).toBe(1);
  });
});
