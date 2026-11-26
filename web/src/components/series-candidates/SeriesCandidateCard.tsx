"use client";

/**
 * 地図の押した位置で重なった代表点のシリーズを、選び分ける一覧の吹き出しとして描く。
 * 吹き出しの下の矢印が、重なった代表点を指す。
 * 見出しも閉じるボタンも持たず、閉じる操作は枠の外の押下と Escape キーが担う。
 *
 * 選択は保持せず、行の押下は `onSelect`、閉じる操作は `onClose` で返す。
 */

import { useEffect, useRef } from "react";
import SeriesPanelItem from "@/components/series-panel/SeriesPanelItem";
import type { Series } from "@/lib/schema/series";

type SeriesCandidateCardProps = {
  /** 押した位置に近い順の候補。 */
  candidates: Series[];
  /** 矢印の先の、吹き出しの左端からの水平位置（px）。 */
  arrowLeftPx: number;
  onSelect: (seriesId: string) => void;
  onClose: () => void;
};

/**
 * `candidates` を一覧パネルの行と同じ見た目で、角丸と罫線の吹き出しに並べる。
 * 高さは行がおよそ 3 つ入る分までで、それを超える候補は吹き出しの中でスクロールする。
 * 吹き出しの外を押すか Escape キーを押すと `onClose` を呼ぶ。
 *
 * 吹き出しの外の押下は地図のクリックより先に届くので、地図の上を押したときも選択を変えずに閉じてから、地図のクリックが新しい候補を決める。
 */
export default function SeriesCandidateCard({
  candidates,
  arrowLeftPx,
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
      className="relative font-body text-ink"
    >
      <ul
        data-candidate-list
        className="max-h-48 overflow-y-auto rounded-box border border-rule bg-paper py-1 shadow-sm"
      >
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
      {/* 吹き出しの下辺から代表点を指す矢印。 */}
      {/* 矢印の大きさを変えるときは、`SeriesCandidateOverlay` の `CANDIDATE_ARROW_GAP_PX` と、下の `left` の計算に使う矢印の半幅も合わせる。 */}
      <span
        aria-hidden="true"
        data-candidate-arrow
        style={{ left: arrowLeftPx - 6 }}
        className="absolute -bottom-1.5 size-3 rotate-45 border-r border-b border-rule bg-paper"
      />
    </aside>
  );
}
