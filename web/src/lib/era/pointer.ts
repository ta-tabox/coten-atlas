/**
 * era スライダーの上のポインタの横の座標を、era 空間の位置（0..1）へ変換する純関数を置く。
 * 全体を映すトラックでは、左端から 1/4 の所を指すと位置 0.25 になり、拡大して 2 つの era だけを映すトラックでは、映している範囲の中での割合を全体の位置へ直す。
 *
 * トラックの矩形（左端と幅）とポインタの座標は呼び出し側が DOM から読んで渡し、このモジュールは DOM を読まない。
 * 位置から年や現在窓を求める処理は `scale.ts` と `window.ts` に置く。
 */

import { FULL_VIEW, type ViewRange } from "@/lib/era/view";

/** `clientXToPosition` が受け取る、ポインタの座標とトラックの矩形と目盛りの数の組。 */
export type PointerOnTrack = {
  /** ポインタの横の座標（`PointerEvent.clientX`）。 */
  clientX: number;
  /** トラックの左端の横の座標（`getBoundingClientRect().left`）。 */
  trackLeft: number;
  /** トラックの幅（`getBoundingClientRect().width`）。 */
  trackWidth: number;
  /** トラックの左端から右端までの目盛りの数。 */
  stepCount: number;
  /** トラックが映している era 空間の範囲で、省略すると全体を映す。 */
  view?: ViewRange;
  /** トラックの両端からこの距離（px）以内を範囲の端として扱い、省略か 0 なら端へ寄せない。 */
  edgeSnapPx?: number;
};

/**
 * `clientX` がトラックの上で指す era 空間の位置を、`stepCount` の目盛りのうち最も近い目盛りの位置（0..1）で返す。
 * `clientX` がトラックの左端より左なら範囲の左端を、右端より右なら範囲の右端を返し、全体を映すなら 0 と 1 になる。
 *
 * 目盛りへ丸めるのは、ポインタで動かした位置とキーボードで動かした位置を、同じ `<input type="range">` の値で表せるようにするため。
 * 端へ寄せる幅（`edgeSnapPx`）は、指で端を正確に押せないトラックで、両端の位置を選べるようにするために渡す。
 */
export function clientXToPosition({
  clientX,
  trackLeft,
  trackWidth,
  stepCount,
  view = FULL_VIEW,
  edgeSnapPx = 0,
}: PointerOnTrack): number {
  const x = clientX - trackLeft;
  const ratio = snapToEdges(x, trackWidth, edgeSnapPx);
  const position = view.min + ratio * view.span;

  return Math.round(position * stepCount) / stepCount;
}

/** トラック上の横の位置 `x`（px）を、幅に対する 0..1 の割合へ直し、両端から `edgeSnapPx` 以内なら 0 か 1 へ寄せる。 */
function snapToEdges(
  x: number,
  trackWidth: number,
  edgeSnapPx: number,
): number {
  if (edgeSnapPx > 0 && x <= edgeSnapPx) {
    return 0;
  }

  if (edgeSnapPx > 0 && x >= trackWidth - edgeSnapPx) {
    return 1;
  }

  return Math.min(Math.max(x / trackWidth, 0), 1);
}
