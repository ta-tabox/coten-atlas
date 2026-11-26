/**
 * era スライダーを拡大したときに見せる範囲（表示範囲）を、era 空間の位置（0..1）で扱う純関数を置く。
 * 拡大すると、era のうち一部（`ZOOMED_ERA_COUNT`）だけがトラックに入り、残りは表示範囲を左右へずらして見る。
 *
 * 表示範囲の左端は `min`、幅は `span` で持ち、拡大していないときは全体（`FULL_VIEW`）である。
 * 現在窓の求め方は `window.ts`、位置と年の対応は `scale.ts` が持つ。
 */

import type { CurrentWindowPositions } from "@/lib/era/window";

/** 表示範囲を、左端 `min` と幅 `span` の組で持ち、どちらも era 空間の位置（0..1）で表す。 */
export type ViewRange = {
  min: number;
  span: number;
};

/** 拡大していないときの表示範囲で、era 空間の全体を指す。 */
export const FULL_VIEW: ViewRange = { min: 0, span: 1 };

/**
 * 拡大したときに、トラックへ入れる era の数を、画面の幅の形ごとに持つ。
 * トラックが広いデスクトップの幅では、広く見せても目盛りが細かいので、スマホの幅より多く入れて前後の era を見せ続ける。
 */
export const ZOOMED_ERA_COUNT = { mobile: 2, desktop: 3 } as const;

/** 左右のパンのボタン 1 回で、表示範囲が動く幅を era の区間の数で表した値。 */
export const PAN_STEP_IN_ERAS = 0.5;

/**
 * `visibleEraCount` 個の era を映す表示範囲の幅を返す。
 * era が `visibleEraCount` 以下なら全体と同じ 1 を返し、拡大しても範囲は狭まらない。
 */
export function zoomedSpanOf(
  eraCount: number,
  visibleEraCount: number,
): number {
  return Math.min(visibleEraCount / eraCount, 1);
}

/** 左端 `min` を、表示範囲が era 空間の外へ出ない範囲（0 から `1 - span`）へ丸めて返す。 */
export function clampViewMin(min: number, span: number): number {
  return Math.min(Math.max(min, 0), 1 - span);
}

/** `position` を中央に置く表示範囲の左端を、端の近くでは範囲が外へ出ないよう丸めて返す。 */
export function viewMinCenteredOn(position: number, span: number): number {
  return clampViewMin(position - span / 2, span);
}

/**
 * 現在窓（`window`）が表示範囲から出ているときだけ、窓が入る最小の移動で左端を直して返す。
 * 位置が外部の操作で動いたとき、拡大した表示範囲が窓を見失わないために使う。
 */
export function keepWindowInView(
  min: number,
  window: CurrentWindowPositions,
  span: number,
): number {
  if (window.start < min) {
    return clampViewMin(window.start, span);
  }

  if (window.end > min + span) {
    return clampViewMin(window.end - span, span);
  }

  return min;
}

/** 左右のパンのボタン 1 回で、表示範囲が動く幅を、era 空間の位置（0..1）の差で返す。 */
export function panStepOf(eraCount: number): number {
  return PAN_STEP_IN_ERAS / eraCount;
}

/**
 * 拡大した表示範囲の中で選べる位置を、現在窓（位置の前後 `halfWindow`）が範囲からはみ出さない範囲へ丸めて返す。
 * 範囲の端が era 空間の端（0 と 1）に着いているときは、窓が era 空間の外へ丸められるので、その端までは丸めない。
 *
 * 指が範囲の端にあるとき、位置を丸めないと窓がはみ出し、`keepWindowInView` がはみ出した分だけ範囲をずらす。
 * ずらす量が指の端への近さで変わるので、丸めて、範囲をずらす速さを自動送りの一定の速さだけに決めさせる。
 */
export function clampPositionToViewWindow(
  position: number,
  view: ViewRange,
  halfWindow: number,
): number {
  const epsilon = 1e-9;
  const lower = view.min <= epsilon ? 0 : view.min + halfWindow;
  const upper =
    view.min + view.span >= 1 - epsilon ? 1 : view.min + view.span - halfWindow;

  return Math.min(Math.max(position, lower), upper);
}

/** 表示範囲の左端を、`delta`（負なら過去へ）だけずらし、era 空間の外へ出ない範囲に丸めて返す。 */
export function panViewMinBy(min: number, delta: number, span: number): number {
  return clampViewMin(min + delta, span);
}

/** `position` が表示範囲の左端から何 % の所にあるかを返し、範囲の外なら 0 未満か 100 超になる。 */
export function viewPercentOf(position: number, view: ViewRange): number {
  return ((position - view.min) / view.span) * 100;
}

/** `autoPanDirection` が受け取る、指の位置と表示範囲の組。 */
export type AutoPanInput = {
  /** 指のトラック上の横の位置を、トラックの幅に対する 0..1 の割合で持つ。 */
  ratio: number;
  /** トラックの両端から、この割合の内側へ指が入ると表示範囲を動かす。 */
  edgeRatio: number;
  view: ViewRange;
};

/**
 * 指がトラックの端に寄っているとき、表示範囲を動かす向きを返す。
 * 左端に寄り、まだ過去側へ動かせるなら -1、右端に寄り、まだ未来側へ動かせるなら 1、それ以外は 0 を返す。
 *
 * 現在窓の半分の幅を `edgeRatio` に渡すと、窓がトラックの端に着いたときに動き出す。
 */
export function autoPanDirection({
  ratio,
  edgeRatio,
  view,
}: AutoPanInput): -1 | 0 | 1 {
  const margin = 0.0001;

  if (ratio <= edgeRatio && view.min > margin) {
    return -1;
  }

  if (ratio >= 1 - edgeRatio && view.min < 1 - view.span - margin) {
    return 1;
  }

  return 0;
}
