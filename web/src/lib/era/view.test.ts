/**
 * 拡大した era スライダーの表示範囲を求める関数を検証する。
 *
 * era は 7 つで、拡大すると 2 つ分（7 分の 2）の範囲が見える。
 */

import { describe, expect, it } from "vitest";
import {
  autoPanDirection,
  clampPositionToViewWindow,
  FULL_VIEW,
  keepWindowInView,
  panStepOf,
  panViewMinBy,
  viewMinCenteredOn,
  viewPercentOf,
  zoomedSpanOf,
} from "@/lib/era/view";

const ERA_COUNT = 7;
const SPAN = 2 / ERA_COUNT;

describe("zoomedSpanOf", () => {
  it("映す era の数だけの幅になる", () => {
    expect(zoomedSpanOf(ERA_COUNT, 2)).toBeCloseTo(SPAN);
    expect(zoomedSpanOf(ERA_COUNT, 3)).toBeCloseTo(3 / 7);
  });

  it("era が映す数以下なら、拡大しても全体と同じ幅になる", () => {
    expect(zoomedSpanOf(2, 2)).toBe(1);
    expect(zoomedSpanOf(1, 2)).toBe(1);
  });
});

describe("viewMinCenteredOn", () => {
  it("位置を中央に置く左端を返す", () => {
    expect(viewMinCenteredOn(0.5, SPAN)).toBeCloseTo(0.5 - SPAN / 2);
  });

  it("端の近くでは、範囲が era 空間の外へ出ないよう丸める", () => {
    expect(viewMinCenteredOn(0, SPAN)).toBe(0);
    expect(viewMinCenteredOn(1, SPAN)).toBeCloseTo(1 - SPAN);
  });
});

describe("keepWindowInView", () => {
  it("窓が表示範囲に入っているなら、左端を動かさない", () => {
    expect(keepWindowInView(0.2, { start: 0.3, end: 0.4 }, SPAN)).toBe(0.2);
  });

  it("窓が左へはみ出すなら、窓の左端が範囲の左端に着く位置まで動かす", () => {
    expect(keepWindowInView(0.5, { start: 0.3, end: 0.4 }, SPAN)).toBe(0.3);
  });

  it("窓が右へはみ出すなら、窓の右端が範囲の右端に着く位置まで動かす", () => {
    expect(keepWindowInView(0, { start: 0.3, end: 0.4 }, SPAN)).toBeCloseTo(
      0.4 - SPAN,
    );
  });
});

describe("panStepOf", () => {
  it("パン 1 回で、era の半区間ぶん動く", () => {
    expect(panStepOf(ERA_COUNT)).toBeCloseTo(0.5 / 7);
  });
});

describe("panViewMinBy", () => {
  it("差の分だけ左端をずらす", () => {
    expect(panViewMinBy(0.2, 0.1, SPAN)).toBeCloseTo(0.3);
  });

  it("era 空間の外へは出ない", () => {
    expect(panViewMinBy(0.01, -0.5, SPAN)).toBe(0);
    expect(panViewMinBy(1 - SPAN, 0.5, SPAN)).toBeCloseTo(1 - SPAN);
  });
});

describe("clampPositionToViewWindow", () => {
  const view = { min: 0.3, span: SPAN };
  const halfWindow = 0.25 / ERA_COUNT;

  it("窓が範囲に収まる位置は、そのまま返す", () => {
    expect(clampPositionToViewWindow(0.4, view, halfWindow)).toBe(0.4);
  });

  it("範囲の端を指しても、窓が範囲からはみ出さない位置へ丸める", () => {
    expect(clampPositionToViewWindow(0.3, view, halfWindow)).toBeCloseTo(
      0.3 + halfWindow,
    );
    expect(clampPositionToViewWindow(0.9, view, halfWindow)).toBeCloseTo(
      0.3 + SPAN - halfWindow,
    );
  });

  it("範囲の端が era 空間の端に着いているときは、その端まで選べる", () => {
    expect(
      clampPositionToViewWindow(0, { min: 0, span: SPAN }, halfWindow),
    ).toBe(0);
    expect(
      clampPositionToViewWindow(1, { min: 1 - SPAN, span: SPAN }, halfWindow),
    ).toBe(1);
  });
});

describe("viewPercentOf", () => {
  it("全体の表示では、位置の割合がそのまま % になる", () => {
    expect(viewPercentOf(0.25, FULL_VIEW)).toBe(25);
  });

  it("拡大した表示では、範囲の左端を 0%、右端を 100% として測り、外なら 0 未満か 100 超になる", () => {
    const view = { min: 0.5, span: 0.25 };

    expect(viewPercentOf(0.5, view)).toBe(0);
    expect(viewPercentOf(0.75, view)).toBe(100);
    expect(viewPercentOf(0.25, view)).toBeLessThan(0);
  });
});

describe("autoPanDirection", () => {
  const view = { min: 0.3, span: SPAN };
  const edgeRatio = 0.125;

  it("指が真ん中にあれば動かさない", () => {
    expect(autoPanDirection({ ratio: 0.5, edgeRatio, view })).toBe(0);
  });

  it("左端に寄れば過去へ、右端に寄れば未来へ動かす", () => {
    expect(autoPanDirection({ ratio: 0.05, edgeRatio, view })).toBe(-1);
    expect(autoPanDirection({ ratio: 0.95, edgeRatio, view })).toBe(1);
  });

  it("端の手前の 0.0001 未満でも、端に着くまで動かし続ける", () => {
    expect(
      autoPanDirection({
        ratio: 0.05,
        edgeRatio,
        view: { ...view, min: 0.00005 },
      }),
    ).toBe(-1);
    expect(
      autoPanDirection({
        ratio: 0.95,
        edgeRatio,
        view: { ...view, min: 1 - SPAN - 0.00005 },
      }),
    ).toBe(1);
  });

  it("もう動かせない端では動かさない", () => {
    expect(
      autoPanDirection({ ratio: 0.05, edgeRatio, view: { ...view, min: 0 } }),
    ).toBe(0);
    expect(
      autoPanDirection({
        ratio: 0.95,
        edgeRatio,
        view: { ...view, min: 1 - SPAN },
      }),
    ).toBe(0);
  });
});
