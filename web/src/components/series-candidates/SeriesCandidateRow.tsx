"use client";

/**
 * 候補の一覧の 1 行を、押すとその位置から波が広がり、右端の山形が右へ動くボタンとして描く。
 * ホバーできる端末では、載せると山形が右へ動く。
 *
 * 一覧パネルの行（`SeriesPanelItem`）と違い、地図の上に単独で出る行なので、動きで押せることと押したことを示す。
 * 押した後に一覧を閉じる時機は持たず、`onPress` を受ける側が決める。
 */

import { type MouseEvent, useState } from "react";
import { formatTimeRange } from "@/lib/format";
import { type Series, TIME_RANGE_UNTIMED } from "@/lib/schema/series";

type SeriesCandidateRowProps = {
  series: Series;
  onPress: (seriesId: string) => void;
};

/**
 * 波の中心。
 * 行の左上からの位置（px）。
 */
type RippleOrigin = { x: number; y: number };

/**
 * `series` の名前と年代を、押すと `onPress` を呼ぶボタンで表示する。
 * `timeRange` が `TIME_RANGE_UNTIMED` のシリーズは年を持たないので、年代の行を出さない。
 *
 * キーボードの操作は押した位置を持たないので、波は行の中央から広げる。
 */
export default function SeriesCandidateRow({
  series,
  onPress,
}: SeriesCandidateRowProps) {
  const [ripple, setRipple] = useState<RippleOrigin | null>(null);

  function press(event: MouseEvent<HTMLButtonElement>): void {
    const rect = event.currentTarget.getBoundingClientRect();

    setRipple(
      event.detail === 0
        ? { x: rect.width / 2, y: rect.height / 2 }
        : { x: event.clientX - rect.left, y: event.clientY - rect.top },
    );
    onPress(series.id);
  }

  return (
    <button
      type="button"
      onClick={press}
      className="group relative block w-full cursor-pointer overflow-hidden py-2 pr-9 pl-4 text-left hover:bg-rule/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-point"
    >
      <span data-series-title className="block text-[0.9rem]">
        {series.title}
      </span>
      {series.timeRange !== TIME_RANGE_UNTIMED && (
        <span className="block text-[0.75rem] text-ink-muted tabular-nums">
          {formatTimeRange(series.timeRange)}
        </span>
      )}
      <svg
        aria-hidden="true"
        data-series-chevron
        viewBox="0 0 24 24"
        className={`absolute top-1/2 right-3 size-4 -translate-y-1/2 fill-none stroke-ink-muted stroke-2 transition-transform duration-200 motion-reduce:transition-none ${ripple === null ? "group-hover:translate-x-1" : "translate-x-2"}`}
      >
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {ripple !== null && (
        <span
          aria-hidden="true"
          data-candidate-ripple
          style={{ left: ripple.x, top: ripple.y }}
          className="pointer-events-none absolute size-[40rem] animate-ripple rounded-full bg-point/25 motion-reduce:hidden"
        />
      )}
    </button>
  );
}
