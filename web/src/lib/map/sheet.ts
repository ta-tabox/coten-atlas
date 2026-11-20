/**
 * スマホの幅のシートが取る 2 つの段と、ドラッグを離した位置から段を決める計算を置く。
 * シートの描画と指の操作の受け取りは `@/components/series-sheet/SeriesSheet` が持つ。
 */

/** シートの段。`closed` は見出しの一行だけを出し、`open` は画面の高さの半分まで開く。 */
export type SheetStage = "closed" | "open";

/** `open` の段のシートの高さが画面の高さ（`dvh`）に占める割合。 */
export const SHEET_OPEN_RATIO = 0.5;

/**
 * ドラッグを離した時点のシートの高さ（`releasedHeight`）から、シートが移る段を返す。
 * `closedHeight` と `openHeight` の中点ちょうどは `open` にする。
 *
 * 近い段へ移すので、指を離した位置が段の間のどこでも、シートは必ずどちらかの段で止まる。
 */
export function sheetStageOf({
  releasedHeight,
  closedHeight,
  openHeight,
}: {
  releasedHeight: number;
  closedHeight: number;
  openHeight: number;
}): SheetStage {
  const midpoint = (closedHeight + openHeight) / 2;

  return releasedHeight >= midpoint ? "open" : "closed";
}
