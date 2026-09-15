"use client";

/**
 * 一覧パネルの区画 1 つを、開閉のボタンを兼ねた見出しと、説明とシリーズの列で表示する。
 *
 * 開閉も選択も保持しない。
 * どちらも props で受け取り、見出しの押下は `onToggle`、シリーズの押下は `onSelect` で返す。
 */

import { type ReactNode, useId } from "react";
import SeriesPanelItem from "@/components/SeriesPanelItem";
import type { Series } from "@/lib/schema/series";

type SeriesPanelSectionProps = {
  /**
   * 区画の見出し。
   * 区画の名前と、開閉のボタンの名前にもなる。
   */
  heading: string;
  /** 見出しの頭に置く、区画の種類を示す記号。 */
  marker: ReactNode;
  /** 見出しの下に置く、区画に何が並ぶかの説明。 */
  note: string;
  /** 区画に並べるシリーズ。 */
  series: Series[];
  /** `series` が空のときに一覧の代わりに出す文。 */
  emptyNote: string;
  /**
   * 選択中のシリーズの id。
   * 選択が無ければ null。
   */
  selectedSeriesId: string | null;
  /** シリーズが押されたときに、その id を渡して呼ぶ。 */
  onSelect: (seriesId: string) => void;
  /** 説明とシリーズの列を表示しているか。 */
  isExpanded: boolean;
  /** 見出しが押されたときに呼ぶ。 */
  onToggle: () => void;
};

/**
 * 見出しの下に、`isExpanded` が true のときだけ説明とシリーズの列を表示する。
 * `series` が空なら、シリーズの列の代わりに `emptyNote` を出す。
 */
export default function SeriesPanelSection({
  heading,
  marker,
  note,
  series,
  emptyNote,
  selectedSeriesId,
  onSelect,
  isExpanded,
  onToggle,
}: SeriesPanelSectionProps) {
  const headingId = useId();
  const bodyId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="shrink-0 rounded-lg border border-white/60 bg-white/35 p-1"
    >
      <h3 id={headingId} className="text-[0.8rem] font-bold text-zinc-800">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-controls={bodyId}
          className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <span aria-hidden="true" className="flex-none">
            {marker}
          </span>
          <span className="min-w-0">{heading}</span>
          <span className="ml-auto flex-none text-[0.75rem] font-normal whitespace-nowrap text-zinc-600 tabular-nums">
            {series.length}件
          </span>
          {/* 閉じている間は三角を右へ向け、開いているか閉じているかを形でも示す。 */}
          <span
            aria-hidden="true"
            className={`flex-none text-[0.6rem] text-zinc-600 motion-safe:transition-transform ${isExpanded ? "" : "-rotate-90"}`}
          >
            ▼
          </span>
        </button>
      </h3>

      <div id={bodyId} hidden={!isExpanded} className="pb-1">
        <p className="px-2 text-[0.75rem] leading-[1.5] text-zinc-600">
          {note}
        </p>

        {series.length === 0 ? (
          <p className="mt-1.5 px-2 text-[0.85rem] text-zinc-600">
            {emptyNote}
          </p>
        ) : (
          <ul className="mt-1.5 flex flex-col gap-0.5">
            {series.map((one) => (
              <li key={one.id}>
                <SeriesPanelItem
                  series={one}
                  isSelected={one.id === selectedSeriesId}
                  onSelect={onSelect}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
