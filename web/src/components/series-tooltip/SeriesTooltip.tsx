/**
 * 地図の代表点にマウスを載せたときに出す、シリーズのタイトルと年代の小さな札を描く。
 * 押せる要素を持たず、選択も保持しない。
 */

import { formatTimeRange } from "@/lib/format";
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
      className="max-w-64 rounded-control border border-rule bg-paper px-3 py-2 font-body text-ink shadow-sm"
    >
      {series.map((item) => (
        <li key={item.id}>
          <span data-series-title className="block text-[0.9rem]">
            {item.title}
          </span>
          {item.timeRange !== TIME_RANGE_UNTIMED && (
            <span className="block text-[0.75rem] text-ink-muted tabular-nums">
              {formatTimeRange(item.timeRange)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
