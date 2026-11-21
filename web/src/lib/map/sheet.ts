/**
 * スマホの幅のシートが取る 4 つの段と、段の移り方を決める計算を置く。
 * シートの描画と指の操作の受け取りは `@/components/series-sheet/SeriesSheet` が持つ。
 */

/**
 * シートの段を、低い順に並べたもの。
 * `closed` は見出しだけ、`era` は見出しと era スライダー、`list` は一覧か詳細カードを画面の高さの半分、`full` は同じ中身を画面の高さの 9 割で出す。
 */
export const SHEET_STAGES = ["closed", "era", "list", "full"] as const;

export type SheetStage = (typeof SHEET_STAGES)[number];

/** `list` の段のシートの高さが、画面の高さ（`dvh`）に占める割合。 */
export const SHEET_LIST_RATIO = 0.5;

/** `full` の段のシートの高さが、画面の高さ（`dvh`）に占める割合。 */
export const SHEET_FULL_RATIO = 0.9;

/**
 * 見出しをタップしたときに移る段を返す。
 * 低い方から 1 段ずつ上がり、`full` からは `closed` へ戻る。
 *
 * ドラッグができない操作（キーボードと読み上げ）でも、すべての段へ届くための循環である。
 */
export function nextSheetStage(stage: SheetStage): SheetStage {
  const index = SHEET_STAGES.indexOf(stage);

  return SHEET_STAGES[(index + 1) % SHEET_STAGES.length];
}

/**
 * ドラッグを離した時点のシートの高さ（`releasedHeight`）に最も近い高さの段を返す。
 * 2 つの段の中点ちょうどは、高い方の段にする。
 *
 * 近い段へ移すので、指を離した位置が段の間のどこでも、シートは必ずどれかの段で止まる。
 */
export function sheetStageOf({
  releasedHeight,
  stageHeights,
}: {
  releasedHeight: number;
  stageHeights: Record<SheetStage, number>;
}): SheetStage {
  return SHEET_STAGES.reduce((nearest, stage) => {
    const distance = Math.abs(stageHeights[stage] - releasedHeight);
    const nearestDistance = Math.abs(stageHeights[nearest] - releasedHeight);

    return distance <= nearestDistance ? stage : nearest;
  });
}
