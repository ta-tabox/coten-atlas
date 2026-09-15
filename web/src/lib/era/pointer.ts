/**
 * era スライダーのトラック（era のセルが並ぶ横長の領域）の上のポインタの横の座標を、era 空間の位置（0..1）へ変換する。
 *
 * トラックの矩形（左端と幅）とポインタの座標は呼び出し側が DOM から読んで渡し、このモジュールは DOM を読まない。
 * 位置から年や現在窓を求める処理は `scale.ts` と `window.ts` に置く。
 */

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
};

/**
 * `clientX` がトラックの上で指す era 空間の位置を、`stepCount` の目盛りのうち最も近い目盛りの位置（0..1）で返す。
 * `clientX` がトラックの左端より左なら 0 を、右端より右なら 1 を返す。
 *
 * 目盛りへ丸めるのは、ポインタで動かした位置とキーボードで動かした位置を、同じ `<input type="range">` の値で表せるようにするため。
 */
export function clientXToPosition({
  clientX,
  trackLeft,
  trackWidth,
  stepCount,
}: PointerOnTrack): number {
  const ratio = Math.min(Math.max((clientX - trackLeft) / trackWidth, 0), 1);

  return Math.round(ratio * stepCount) / stepCount;
}
