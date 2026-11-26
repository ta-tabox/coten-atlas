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
  series: Series;
  isSelected: boolean;
  /** 行の右端に、押せることを示す右向きの山形を出す。 */
  hasChevron?: boolean;
  onSelect: (seriesId: string) => void;
};

/**
 * `series` の名前と年代を、押すと `onSelect` を呼ぶボタンで表示する。
 * 選択中なら、文字の色に加えて、名前の左の赤い点と太字で示す。
 * `hasChevron` が true なら、一覧パネルと違って押せる行だと一目で分からない場面（地図の上の候補の一覧）のために、右端へ山形を出す。
 *
 * `timeRange` が `TIME_RANGE_UNTIMED` のシリーズは年を持たないので、年代の行を出さない。
 */
export default function SeriesPanelItem({
  series,
  isSelected,
  hasChevron = false,
  onSelect,
}: SeriesPanelItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(series.id)}
      aria-current={isSelected ? "true" : undefined}
      className={`relative w-full cursor-pointer py-2 ${hasChevron ? "pr-9" : "pr-1"} pl-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-point ${isSelected ? "font-bold text-selected" : "hover:bg-rule/40"}`}
    >
      {/* 選択中の行に付ける赤い点は名前の左の余白に置き、名前と年代の頭をそろえたままにする。 */}
      {isSelected && (
        <span
          aria-hidden="true"
          className="absolute top-[1.05rem] left-1 size-2 rounded-full bg-selected"
        />
      )}
      <span data-series-title className="block text-[0.9rem]">
        {series.title}
      </span>
      {series.timeRange !== TIME_RANGE_UNTIMED && (
        <span className="block text-[0.75rem] font-normal text-ink-muted tabular-nums">
          {formatTimeRange(series.timeRange)}
        </span>
      )}
      {hasChevron && (
        <svg
          aria-hidden="true"
          data-series-chevron
          viewBox="0 0 24 24"
          className="absolute top-1/2 right-3 size-4 -translate-y-1/2 fill-none stroke-ink-muted stroke-2"
        >
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
