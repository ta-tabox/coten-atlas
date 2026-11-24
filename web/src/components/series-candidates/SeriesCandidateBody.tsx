"use client";

/**
 * 地図の押した位置で重なった代表点のシリーズを、選び分ける一覧として描く。
 * 枠は持たない。
 *
 * 選択は保持せず、行の押下は `onSelect`、閉じる操作は `onClose` で返す。
 */

import { useEffect } from "react";
import SeriesPanelItem from "@/components/series-panel/SeriesPanelItem";
import type { Series } from "@/lib/schema/series";

type SeriesCandidateBodyProps = {
  /** 押した位置に近い順の候補。 */
  candidates: Series[];
  onSelect: (seriesId: string) => void;
  onClose: () => void;
};

/**
 * 見出しと閉じるボタンの下に、`candidates` を一覧パネルの行と同じ見た目で並べる。
 * Escape キーを押すと `onClose` を呼ぶ。
 */
export default function SeriesCandidateBody({
  candidates,
  onSelect,
  onClose,
}: SeriesCandidateBodyProps) {
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <>
      <header className="flex items-center gap-3 border-b border-rule pb-2">
        <h2 className="grow font-heading text-[0.95rem] font-bold text-heading">
          重なっているシリーズ
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="候補を閉じる"
          className="-mr-1.5 flex-none rounded-control px-1.5 text-[1.1rem] text-ink-muted hover:bg-rule/40 hover:text-ink"
        >
          ×
        </button>
      </header>
      <ul data-candidate-list className="min-h-0 overflow-y-auto">
        {candidates.map((series) => (
          <li key={series.id}>
            <SeriesPanelItem
              series={series}
              isSelected={false}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
