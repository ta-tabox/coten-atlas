import { describe, expect, it } from "vitest";
import {
  TOOLTIP_MARGIN_PX,
  tooltipLeftOf,
  tooltipTopOf,
} from "@/lib/map/tooltip-position";

describe("tooltipLeftOf", () => {
  it("画面に収まるとき、代表点の水平の中央に置く", () => {
    expect(tooltipLeftOf(200, 100, 390)).toBe(150);
  });

  it("左の端からはみ出すとき、左の余白の位置へずらす", () => {
    expect(tooltipLeftOf(20, 100, 390)).toBe(TOOLTIP_MARGIN_PX);
  });

  it("右の端からはみ出すとき、右の余白の内側へずらす", () => {
    expect(tooltipLeftOf(380, 100, 390)).toBe(390 - 100 - TOOLTIP_MARGIN_PX);
  });

  it("幅が画面に収まらないとき、左の余白の位置に置く", () => {
    expect(tooltipLeftOf(100, 400, 390)).toBe(TOOLTIP_MARGIN_PX);
  });
});

describe("tooltipTopOf", () => {
  it("上に収まるとき、代表点から間隔と高さだけ上へ置く", () => {
    expect(
      tooltipTopOf({
        pointY: 300,
        tooltipHeight: 40,
        gap: 12,
        topClearance: 56,
      }),
    ).toBe(248);
  });

  it("上端が使えない高さに食い込むとき、代表点から間隔だけ下へ置く", () => {
    expect(
      tooltipTopOf({
        pointY: 80,
        tooltipHeight: 40,
        gap: 12,
        topClearance: 56,
      }),
    ).toBe(92);
  });

  it("上端がちょうど使えない高さに接するときは、上に置く", () => {
    expect(
      tooltipTopOf({
        pointY: 108,
        tooltipHeight: 40,
        gap: 12,
        topClearance: 56,
      }),
    ).toBe(56);
  });
});
