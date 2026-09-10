/**
 * `catalog/` のスキーマが持つ値を、画面に表示する文字列へ変換する。
 * 受け取るのは値だけで、取得も絞り込みもしない。
 */

import type { SeriesTimeRange } from "@/lib/schema/series";

/**
 * `year` を「紀元前800年」「紀元550年」の形式の文字列へ整形する。
 * 負値が紀元前、0 と正値が紀元である（符号の意味は `@/lib/schema/series` の `seriesTimeRangeSchema` が正）。
 */
function formatYear(year: number): string {
  return year < 0 ? `紀元前${-year}年` : `紀元${year}年`;
}

/**
 * `range` を「紀元前800年〜紀元550年」の形式の文字列へ整形する。
 * `start` と `end` が同じ年なら、その年 1 つだけを返す。
 *
 * `timeRange` は両端を含む閉区間で、`start === end` は 1 年の出来事を表す。
 * 「紀元前660年〜紀元前660年」と両端を書くと、幅のある年代と区別が付かない。
 */
export function formatTimeRange(range: SeriesTimeRange): string {
  if (range.start === range.end) {
    return formatYear(range.start);
  }

  return `${formatYear(range.start)}〜${formatYear(range.end)}`;
}
