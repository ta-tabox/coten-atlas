/**
 * 代表点の上に出すツールチップの左端の位置を決める関数を置く。
 */

/** ツールチップと画面の左右の端の間に残す幅（px）。 */
export const TOOLTIP_MARGIN_PX = 8;

/**
 * ツールチップの左端の位置（px）を、代表点の水平位置（`pointX`）・ツールチップの幅（`tooltipWidth`）・画面の幅（`viewportWidth`）から求めて返す。
 * ツールチップは代表点の水平の中央に置き、画面の端からはみ出すときだけ内側へずらす。
 *
 * 幅が画面に収まらないときは、左の余白の位置を返す。
 */
export function tooltipLeftOf(
  pointX: number,
  tooltipWidth: number,
  viewportWidth: number,
): number {
  const maxLeft = viewportWidth - tooltipWidth - TOOLTIP_MARGIN_PX;

  return Math.max(
    TOOLTIP_MARGIN_PX,
    Math.min(pointX - tooltipWidth / 2, maxLeft),
  );
}
