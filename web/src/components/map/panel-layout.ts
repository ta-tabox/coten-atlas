/**
 * 地図の左に置く一覧パネルの寸法と、パネルを開いたままにする画面の幅の定数を置く。
 *
 * パネルの置き場所と幅の CSS は `MapCanvas` と `SeriesPanel` が持ち、ここは地図の視野をずらす幅をその CSS に揃えるために持つ。
 */

/**
 * デスクトップの幅で、一覧パネルの右端までの画面の左端からの距離（px）。
 * 一覧パネルが開いている間、MapLibre の `padding.left` に渡し、点を描く範囲を一覧パネルの右側に限る。
 *
 * `MapCanvas` が一覧パネルを置く位置（`left-4`）と `SeriesPanel` の幅（18rem）と枠線（左右 1px ずつ）の和で、ルートの文字の大きさが 16px のときの値になる。
 * 一致は `tests/e2e/panel-clearance.spec.ts` が見る。
 */
export const PANEL_RIGHT_EDGE_PX = 306;

/**
 * デスクトップの幅とみなす画面の条件（Tailwind の `md`）。
 * この幅に満たない画面では、一覧パネルが開いていても地図の視野を動かさない。
 */
export const DESKTOP_MEDIA_QUERY = "(min-width: 48rem)";
