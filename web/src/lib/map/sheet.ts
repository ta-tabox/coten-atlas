/**
 * スマホの幅のシートが取る 4 つの段と、段の移り方を決める計算を置く。
 * シートの描画と指の操作の受け取りは `@/components/bottom-sheet/BottomSheet` が持つ。
 */

/**
 * シートの段の名前。
 * `closed` は取っ手だけ、`era` は取っ手と era スライダー、`list` は一覧か詳細カードを画面の高さの半分、`full` は同じ中身を画面の高さの 9 割で出す。
 */
export const SHEET_STAGE = {
  closed: "closed",
  era: "era",
  list: "list",
  full: "full",
} as const;

export type SheetStage = (typeof SHEET_STAGE)[keyof typeof SHEET_STAGE];

/**
 * シートの段を低い順に並べたもの。
 * タップとスワイプが移る順を決める。
 */
export const SHEET_STAGES: readonly SheetStage[] = [
  SHEET_STAGE.closed,
  SHEET_STAGE.era,
  SHEET_STAGE.list,
  SHEET_STAGE.full,
];

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
 * `stage` から、スワイプの向き（`direction`）の隣の段を返す。
 * 一番低い段で下へ、一番高い段で上へスワイプしたときは、同じ段を返す。
 *
 * スワイプは指の移動の距離でなく向きで段を決めるので、短い移動でも次の段へ届く。
 */
export function stepSheetStage(
  stage: SheetStage,
  direction: "up" | "down",
): SheetStage {
  const index = SHEET_STAGES.indexOf(stage) + (direction === "up" ? 1 : -1);

  return SHEET_STAGES[Math.min(SHEET_STAGES.length - 1, Math.max(0, index))];
}
