"use client";

/**
 * 一覧パネルの区画 1 つを、開閉のボタンを兼ねた見出しと、シリーズの列で表示する。
 *
 * 開閉も選択も保持しない。
 * どちらも props で受け取り、見出しの押下は `onToggle`、シリーズの押下は `onSelect` で返す。
 */

import { type ReactNode, useId } from "react";
import SeriesPanelItem from "@/components/series-panel/SeriesPanelItem";
import type { Series } from "@/lib/schema/series";

type SeriesPanelSectionProps = {
  /** 区画の名前と開閉のボタンの名前を兼ねる見出しの文字。 */
  heading: string;
  /** 見出しの頭に置く、区画の種類を示す記号。 */
  marker: ReactNode;
  seriesList: Series[];
  /** `seriesList` が空のときに一覧の代わりに出す文。 */
  emptyNote: string;
  /** 選択が無ければ null。 */
  selectedSeriesId: string | null;
  onSelect: (seriesId: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
};

/**
 * 見出しの下に、`isExpanded` が true のときだけシリーズの列を表示する。
 * `seriesList` が空なら、シリーズの列の代わりに `emptyNote` を出す。
 */
export default function SeriesPanelSection({
  heading,
  marker,
  seriesList,
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
      className="shrink-0 rounded-box border border-rule p-1"
    >
      <h3
        id={headingId}
        className="font-heading text-[0.85rem] font-bold text-heading"
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-controls={bodyId}
          className="flex w-full items-center gap-1.5 rounded-control px-1.5 py-1 text-left hover:bg-rule/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point"
        >
          <span aria-hidden="true" className="flex-none">
            {marker}
          </span>
          <span className="min-w-0">{heading}</span>
          <span className="ml-auto flex-none text-[0.75rem] font-normal whitespace-nowrap text-ink-muted tabular-nums">
            {seriesList.length}件
          </span>
          {/* 閉じている間は三角を右へ向け、開いているか閉じているかを形でも示す。 */}
          <span
            aria-hidden="true"
            className={`flex-none text-[0.6rem] text-ink-muted motion-safe:transition-transform ${isExpanded ? "" : "-rotate-90"}`}
          >
            ▼
          </span>
        </button>
      </h3>

      <div id={bodyId} hidden={!isExpanded} className="pb-1">
        {seriesList.length === 0 ? (
          <p className="px-2 text-[0.85rem] text-ink-muted">{emptyNote}</p>
        ) : (
          <ul className="mx-2 mt-1 flex flex-col divide-y divide-rule">
            {seriesList.map((series) => (
              <li key={series.id}>
                <SeriesPanelItem
                  series={series}
                  isSelected={series.id === selectedSeriesId}
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
