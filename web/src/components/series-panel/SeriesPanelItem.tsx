"use client";

/**
 * 一覧パネルの区画に並べるシリーズ 1 件を、選択のボタンとして表示する。
 *
 * 選択を保持しない。
 * 選択中かどうかは props で受け取り、押されたシリーズの id は `onSelect` で返す。
 */

import { formatTimeRange } from "@/lib/format";
import { type Series, TIME_RANGE_UNTIMED } from "@/lib/schema/series";

type SeriesPanelItemProps = {
  /** 表示するシリーズ。 */
  series: Series;
  /** `series` が選択中か。 */
  isSelected: boolean;
  /** ボタンが押されたときに、`series` の id を渡して呼ぶ。 */
  onSelect: (seriesId: string) => void;
};

/**
 * `series` の名前と年代を、押すと `onSelect` を呼ぶボタンで表示する。
 * 選択中なら、色に加えて左の太線と太字で示す。
 *
 * `timeRange` が `TIME_RANGE_UNTIMED` のシリーズは年を持たないので、年代の行を出さない。
 */
export default function SeriesPanelItem({
  series,
  isSelected,
  onSelect,
}: SeriesPanelItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(series.id)}
      aria-current={isSelected ? "true" : undefined}
      className={`w-full rounded-md border-l-4 px-3 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${isSelected ? "border-l-orange-700 bg-orange-100/70 font-bold" : "border-l-transparent hover:bg-white/60"}`}
    >
      <span className="block text-[0.9rem]">{series.title}</span>
      {series.timeRange !== TIME_RANGE_UNTIMED && (
        <span className="block text-[0.75rem] font-normal text-zinc-600 tabular-nums">
          {formatTimeRange(series.timeRange)}
        </span>
      )}
    </button>
  );
}
