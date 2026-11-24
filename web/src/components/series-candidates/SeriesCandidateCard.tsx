"use client";

/**
 * 重なった代表点の候補の一覧を入れる枠を描く。
 * 中身は `SeriesCandidateBody` が描く。
 */

import { useEffect, useRef } from "react";
import SeriesCandidateBody from "@/components/series-candidates/SeriesCandidateBody";
import type { Series } from "@/lib/schema/series";

type SeriesCandidateCardProps = {
  candidates: Series[];
  onSelect: (seriesId: string) => void;
  onClose: () => void;
};

/**
 * `SeriesCandidateBody` を角丸と罫線の枠に入れて描く。
 * 枠の外を押すと `onClose` を呼ぶ。
 *
 * 枠の外の押下は、地図のクリックより先に届くので、地図の上を押したときも選択を変えずに閉じてから、地図のクリックが新しい候補を決める。
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

    document.addEventListener("pointerdown", closeOnOutsidePress);

    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [onClose]);

  return (
    <aside
      ref={cardRef}
      aria-label="重なっているシリーズ"
      className="flex max-h-72 w-72 max-w-full flex-col overflow-hidden rounded-box border border-rule bg-paper px-3 py-3 font-body text-ink shadow-sm"
    >
      <SeriesCandidateBody
        candidates={candidates}
        onSelect={onSelect}
        onClose={onClose}
      />
    </aside>
  );
}
