"use client";

/**
 * 地図の押した位置で重なった代表点のシリーズを、選び分ける一覧の枠として描く。
 * 見出しも閉じるボタンも持たない。
 * 閉じる操作は、枠の外の押下と Escape キーが担う。
 *
 * 選択は保持せず、行の押下は `onSelect`、閉じる操作は `onClose` で返す。
 */

import { useEffect, useRef } from "react";
import SeriesPanelItem from "@/components/series-panel/SeriesPanelItem";
import type { Series } from "@/lib/schema/series";

type SeriesCandidateCardProps = {
  /** 押した位置に近い順の候補。 */
  candidates: Series[];
  onSelect: (seriesId: string) => void;
  onClose: () => void;
};

/**
 * `candidates` を一覧パネルの行と同じ見た目で、角丸と罫線の枠に並べる。
 * 枠の外を押すか Escape キーを押すと `onClose` を呼ぶ。
 *
 * 枠の外の押下は地図のクリックより先に届くので、地図の上を押したときも選択を変えずに閉じてから、地図のクリックが新しい候補を決める。
 */
export default function SeriesCandidateCard({
  candidates,
  onSelect,
  onClose,
}: SeriesCandidateCardProps) {
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function closeOnOutsidePress(event: PointerEvent): void {
      if (!cardRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    function closeOnEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <aside
      ref={cardRef}
      aria-label="重なっているシリーズ"
      className="max-h-72 w-72 max-w-full overflow-y-auto rounded-box border border-rule bg-paper py-1 font-body text-ink shadow-sm"
    >
      <ul data-candidate-list>
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
    </aside>
  );
}
