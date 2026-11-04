"use client";

/**
 * 管理画面でシリーズの全件を、選択のボタンの列として表示する部品を置く。
 *
 * 選択を保持しない。
 * 選択中のシリーズは props で受け取り、押されたシリーズの id は `onSelect` で返す。
 */

import { ANCHOR_UNLOCATED, type SeriesList } from "@/lib/schema/series";

type AdminSeriesListProps = {
  /** 並べるシリーズの全件。 */
  series: SeriesList;
  /**
   * 選択中のシリーズの id。
   * 選択が無ければ null。
   */
  selectedSeriesId: string | null;
  /** シリーズが押されたときに、その id を渡して呼ぶ。 */
  onSelect: (seriesId: string) => void;
};

/**
 * `series` の名前と代表点の `id` を、押すと `onSelect` を呼ぶボタンで並べる。
 * 位置なしのシリーズは代表点の代わりに「位置なし」と出す。
 */
export default function AdminSeriesList({
  series,
  selectedSeriesId,
  onSelect,
}: AdminSeriesListProps) {
  return (
    <ul className="flex flex-col gap-0.5 overflow-y-auto">
      {series.map((one) => {
        const isSelected = one.id === selectedSeriesId;

        return (
          <li key={one.id}>
            <button
              type="button"
              onClick={() => onSelect(one.id)}
              aria-current={isSelected ? "true" : undefined}
              className={`w-full rounded-md border-l-4 px-3 py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${isSelected ? "border-l-orange-700 bg-orange-100/70 font-bold" : "border-l-transparent hover:bg-white/60"}`}
            >
              <span className="block text-[0.85rem]">{one.title}</span>
              <span className="block text-[0.7rem] font-normal text-zinc-600">
                {one.anchor === ANCHOR_UNLOCATED ? "位置なし" : one.anchor}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
