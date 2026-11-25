/**
 * 詳細カードの年代を文字で描く部品を置く。
 * 行の並びと区切りは持たず、使う側が持つ。
 */

import { formatTimeRange } from "@/lib/format";
import type { SeriesTimeRange } from "@/lib/schema/series";

type SeriesPeriodProps = {
  timeRange: SeriesTimeRange;
};

/** `timeRange` を「前900年〜前200年」の形の年代にして描く。 */
export default function SeriesPeriod({ timeRange }: SeriesPeriodProps) {
  return <span>{formatTimeRange(timeRange)}</span>;
}
