/**
 * 地図の代表点にマウスを載せたときに出す、シリーズのタイトルと年代の小さな札を描く。
 * 押せる要素を持たず、選択も保持しない。
 */

import { formatTimeRangeWithoutUnit } from "@/lib/format";
import { type Series, TIME_RANGE_UNTIMED } from "@/lib/schema/series";

type SeriesTooltipProps = {
  series: Series[];
};

/**
 * `series` のタイトルと年代を縦に並べる。
 * 年を持たないシリーズは年代の行を出さない。
 */
export default function SeriesTooltip({ series }: SeriesTooltipProps) {
  return (
    <ul
      role="tooltip"
      className="space-y-1 whitespace-nowrap rounded-control bg-ink px-3 py-1.5 font-body text-paper"
    >
      {series.map((item) => (
        <li key={item.id}>
          <span data-series-title className="block text-[0.8rem] font-bold">
            {item.title}
          </span>
          {item.timeRange !== TIME_RANGE_UNTIMED && (
            <span className="block text-[0.7rem] text-rule tabular-nums">
              {formatTimeRangeWithoutUnit(item.timeRange)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
