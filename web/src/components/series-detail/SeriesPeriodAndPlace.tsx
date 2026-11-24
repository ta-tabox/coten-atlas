/**
 * 詳細カードの年代と代表点の地名の行を描く部品を置く。
 * 地名の取得は持たず、`placeName` を props で受け取る。
 */

import { formatTimeRange } from "@/lib/format";
import { type Series, TIME_RANGE_UNTIMED } from "@/lib/schema/series";

/**
 * 年代と地名を縦線で区切って 1 行に出す。
 * 年代は `timeRange` が `TIME_RANGE_UNTIMED` のとき、地名は `placeName` が null のとき出さず、両方無ければ行ごと出さない。
 * 幅に収まらなければ折り返す。
 */
export default function SeriesPeriodAndPlace({
  series,
  placeName,
}: {
  series: Series;
  placeName: string | null;
}) {
  const parts = [
    series.timeRange === TIME_RANGE_UNTIMED
      ? null
      : formatTimeRange(series.timeRange),
    placeName,
  ].filter((part) => part !== null);

  if (parts.length === 0) {
    return null;
  }

  return (
    <p className="mt-1 text-[0.85rem] text-ink-muted">{parts.join("｜")}</p>
  );
}
