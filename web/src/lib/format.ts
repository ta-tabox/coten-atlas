/**
 * スキーマの値を、画面へ出す字面へ直す。
 *
 * 整形をコンポーネントから出すために在る。
 * 受け取るのは値だけで、取得も絞り込みもしない。
 */

import type { SeriesTimeRange } from "@/lib/schema/series";

/**
 * 西暦の整数を「紀元前800年」「紀元550年」の形へ直す。
 * 負値が紀元前で、0 と正値が紀元である（`@/lib/schema/series` の `timeRange`）。
 */
function formatYear(year: number): string {
  return year < 0 ? `紀元前${-year}年` : `紀元${year}年`;
}

/**
 * シリーズの年代を「紀元前800年〜紀元550年」の形へ直す。
 *
 * `timeRange` は両端を含む閉区間で、`start == end` は 1 年の出来事を表す。
 * その 1 年を「紀元前660年〜紀元前660年」と両端で書くと、幅のある年代と見分けが付かない。
 */
export function formatTimeRange(range: SeriesTimeRange): string {
  if (range.start === range.end) {
    return formatYear(range.start);
  }

  return `${formatYear(range.start)}〜${formatYear(range.end)}`;
}
