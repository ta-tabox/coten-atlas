/**
 * era スライダーの上のポインタの横の座標を、era 空間の位置（0..1）へ変換する純関数を置く。
 * デスクトップの幅では、トラックの左端から 1/4 の所を指すと位置 0.25 になる（`clientXToPosition`）。
 * スマホの幅では、押した所から帯の幅の 1/10 だけ右へ指を動かすと、位置が 0.1 小さくなる（`dragToPosition`）。
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

/** `dragToPosition` が受け取る、押した時点の位置と指の座標、帯の幅と目盛りの数の組。 */
export type DragOnBelt = {
  /** 押した時点の era 空間の位置（0..1）。 */
  startPosition: number;
  startClientX: number;
  clientX: number;
  /** 画面に見えている幅でなく、帯の全幅（px）。 */
  beltWidth: number;
  stepCount: number;
};

/**
 * 押した位置から指が動いた量だけ帯が逆向きに動いたとみなして、新しい era 空間の位置を `stepCount` の目盛りのうち最も近い目盛りの位置（0..1）で返す。
 * 右へ動かすと位置は小さくなり、0 と 1 は越えない。
 *
 * 押した場所によらず、動かした量だけで位置が決まる。
 * 現在窓を画面の中央に留めて帯を動かす配置で、指と帯が同じ速さで動くようにするために使う。
 */
export function dragToPosition({
  startPosition,
  startClientX,
  clientX,
  beltWidth,
  stepCount,
}: DragOnBelt): number {
  const moved = (clientX - startClientX) / beltWidth;
  const position = Math.min(Math.max(startPosition - moved, 0), 1);

  return Math.round(position * stepCount) / stepCount;
}
