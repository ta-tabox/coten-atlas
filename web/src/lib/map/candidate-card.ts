/**
 * 重なった代表点の候補の一覧の枠が、代表点の上に出る水平位置を決める関数と、枠の幅を置く。
 * 枠の描画と、代表点の画面上の位置の取得は持たない。
 */

/** 候補の一覧の枠の幅（px）。 */
export const CANDIDATE_CARD_WIDTH_PX = 288;

/** 候補の一覧の枠と画面の左右の端の間に残す幅（px）。 */
export const CANDIDATE_CARD_MARGIN_PX = 8;

/**
 * 枠の左端の位置（px）を、代表点の水平位置（`pointX`）と画面の幅（`viewportWidth`）から求めて返す。
 * 枠は代表点の水平の中央に置き、画面の端からはみ出すときだけ内側へずらす。
 *
 * 枠の矢印が、ずらした後も代表点を指せるように、矢印の位置は `pointX` から枠の左端を引いた値にする。
 */
export function candidateCardLeftOf(
  pointX: number,
  viewportWidth: number,
): number {
  const centered = pointX - CANDIDATE_CARD_WIDTH_PX / 2;
  const maxLeft =
    viewportWidth - CANDIDATE_CARD_WIDTH_PX - CANDIDATE_CARD_MARGIN_PX;

  return Math.max(CANDIDATE_CARD_MARGIN_PX, Math.min(centered, maxLeft));
}
