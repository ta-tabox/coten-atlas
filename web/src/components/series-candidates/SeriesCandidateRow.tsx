"use client";

/**
 * 地図の上に出る候補の一覧に並べる、シリーズ 1 件の行を描く部品を置く。
 * 押した後の処理は持たず、`onPress` を受ける側が決める。
 */

import { type MouseEvent, useState } from "react";
import { formatTimeRange } from "@/lib/format";
import { type Series, TIME_RANGE_UNTIMED } from "@/lib/schema/series";

type SeriesCandidateRowProps = {
  series: Series;
  /** 押下を受けたら true、他の行の押下を待っていて受けなければ false を返す。 */
  onPress: (seriesId: string) => boolean;
};

/**
 * 波の中心。
 * 行の左上からの位置（px）。
 */
type RippleOrigin = { x: number; y: number };

/**
 * `series` の名前と年代を、押すと `onPress` を呼ぶボタンで表示する。
 * `timeRange` が `TIME_RANGE_UNTIMED` のシリーズは年を持たないので、年代の行を出さない。
 */
export default function SeriesCandidateRow({
  series,
  onPress,
}: SeriesCandidateRowProps) {
  // TODO: 波と山形の動きはこの部品に直に書いてあるので、#399（サイト全体のアニメーションの見直し）で共通の部品へ抽出する。
  const [ripple, setRipple] = useState<RippleOrigin | null>(null);

  function press(event: MouseEvent<HTMLButtonElement>): void {
    if (!onPress(series.id)) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    // キーボードの押下は位置を持たない（`detail` が 0）ので、波は行の中央から広げる。
    setRipple(
      event.detail === 0
        ? { x: rect.width / 2, y: rect.height / 2 }
        : { x: event.clientX - rect.left, y: event.clientY - rect.top },
    );
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
