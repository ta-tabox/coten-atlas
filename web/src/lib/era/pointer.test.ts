/**
 * `clientXToPosition` が返す era 空間の位置を検証する。
 *
 * トラックは横の座標 100 から幅 400 に置き、目盛りは 200 にする。
 * 1 目盛りがトラックの上の 2 に当たる。
 */

import { describe, expect, it } from "vitest";
import { clientXToPosition, dragToPosition } from "@/lib/era/pointer";

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

describe("dragToPosition", () => {
  /** 幅 400 の帯で、位置 0.5 を押した場所から `clientX` まで指を動かしたときの位置を返す。 */
  function draggedTo(clientX: number, startPosition = 0.5): number {
    return dragToPosition({
      startPosition,
      startClientX: 200,
      clientX,
      beltWidth: TRACK_WIDTH,
      stepCount: STEP_COUNT,
    });
  }

  it("移動量が 0 なら位置は変わらない", () => {
    expect(draggedTo(200)).toBe(0.5);
  });

  it("右へ動かすと、帯の幅に対する移動量の割合だけ位置が小さくなる", () => {
    expect(draggedTo(240)).toBe(0.4);
  });

  it("左へ動かすと、位置が大きくなる", () => {
    expect(draggedTo(160)).toBe(0.6);
  });

  it("帯の端を越えて動かしても、位置は 0 と 1 を越えない", () => {
    expect(draggedTo(2000)).toBe(0);
    expect(draggedTo(-2000)).toBe(1);
  });

  it("位置は最も近い目盛りへ丸める", () => {
    // 1 目盛りは帯の上の 2px なので、2.4px は 1.2 目盛りで、最も近い 1 目盛りへ丸まる。
    expect(draggedTo(197.6)).toBe(0.5 + 1 / STEP_COUNT);
  });
});
