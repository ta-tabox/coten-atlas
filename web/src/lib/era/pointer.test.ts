/**
 * `clientXToPosition` が返す era 空間の位置を検証する。
 *
 * トラックは横の座標 100 から幅 400 に置き、目盛りは 200 にする。
 * 1 目盛りがトラックの上の 2 に当たる。
 */

import { describe, expect, it } from "vitest";
import { clientXToPosition } from "@/lib/era/pointer";

const TRACK_LEFT = 100;
const TRACK_WIDTH = 400;
const STEP_COUNT = 200;

/** `clientX` が、横の座標 100 から幅 400 の 200 目盛りのトラックの上で指す位置を返す。 */
function positionAt(clientX: number): number {
  return clientXToPosition({
    clientX,
    trackLeft: TRACK_LEFT,
    trackWidth: TRACK_WIDTH,
    stepCount: STEP_COUNT,
  });
}

describe("clientXToPosition", () => {
  it("トラックの左端・中央・右端は、位置の 0・0.5・1 を指す", () => {
    expect(positionAt(100)).toBe(0);
    expect(positionAt(300)).toBe(0.5);
    expect(positionAt(500)).toBe(1);
  });

  it("トラックの左端より左は 0、右端より右は 1 を返す", () => {
    expect(positionAt(40)).toBe(0);
    expect(positionAt(560)).toBe(1);
  });

  it("目盛りの間を指すと、最も近い目盛りの位置を返す", () => {
    // 左端から 2.6 は 1.3 目盛りなので、1 目盛りの位置（1/200）へ丸まる。
    expect(positionAt(102.6)).toBe(1 / STEP_COUNT);
  });
});

describe("clientXToPosition の拡大した範囲と端の寄せ", () => {
  const view = { min: 0.4, span: 0.2 };

  it("拡大した範囲の左端・右端を指すと、範囲の端の位置になる", () => {
    const at = (clientX: number) =>
      clientXToPosition({
        clientX,
        trackLeft: TRACK_LEFT,
        trackWidth: TRACK_WIDTH,
        stepCount: STEP_COUNT,
        view,
      });

    expect(at(100)).toBe(0.4);
    expect(at(300)).toBe(0.5);
    expect(at(500)).toBe(0.6);
  });

  it("両端から edgeSnapPx 以内を指すと、範囲の端の位置に寄る", () => {
    const at = (clientX: number) =>
      clientXToPosition({
        clientX,
        trackLeft: TRACK_LEFT,
        trackWidth: TRACK_WIDTH,
        stepCount: STEP_COUNT,
        edgeSnapPx: 8,
      });

    expect(at(108)).toBe(0);
    expect(at(492)).toBe(1);
    expect(at(120)).toBeCloseTo(0.05, 1);
  });

  it("edgeSnapPx を渡さなければ、端の近くも指した位置のままである", () => {
    expect(positionAt(104)).toBe(0.01);
  });
});
