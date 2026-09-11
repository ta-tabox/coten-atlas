/**
 * `catalog/` のスキーマが持つ値を、画面に表示する文字列へ変換する。
 * 受け取るのは値だけで、取得も絞り込みもしない。
 */

import type { SeriesTimeRange } from "@/lib/schema/series";

/**
 * `year` を「前800年」「550年」の形式の文字列へ整形する。
 * 負値は紀元前なので「前」を付け、0 と正値は数字だけにする（符号の意味は `@/lib/schema/series` の `seriesTimeRangeSchema` が正）。
 */
export function formatYear(year: number): string {
  return year < 0 ? `前${-year}年` : `${year}年`;
}

/**
 * `range` を「前800年〜550年」の形式の文字列へ整形する。
 * `start` と `end` が同じ年なら、その年 1 つだけを返す。
 *
 * `timeRange` は両端を含む閉区間で、`start === end` は 1 年の出来事を表す。
 * 「前660年〜前660年」と両端を書くと、幅のある年代と区別が付かない。
 */
export function formatTimeRange(range: SeriesTimeRange): string {
  if (range.start === range.end) {
    return formatYear(range.start);
  }

  return `${formatYear(range.start)}〜${formatYear(range.end)}`;
}
