"use client";

/**
 * 重なった代表点の候補の一覧を、代表点の上に置く位置決めの枠を描く。
 * 一覧の中身は `SeriesCandidateCard` が描く。
 */

import SeriesCandidateCard from "@/components/series-candidates/SeriesCandidateCard";
import {
  CANDIDATE_CARD_WIDTH_PX,
  candidateCardLeftOf,
} from "@/lib/map/candidate-card";
import type { ScreenPoint } from "@/lib/map/overlap-candidates";
import type { Series } from "@/lib/schema/series";

/**
 * 吹き出しの下辺を、代表点の中心から上へ離す距離（px）。
 * 下辺から突き出す矢印の先（約 9px）が、円（半径 6px）に重ならず、円との間に余白が残る。
 */
const CANDIDATE_ARROW_GAP_PX = 22;

type SeriesCandidateOverlayProps = {
  candidates: Series[];
  /** 吹き出しが指す代表点の、地図の左上からの位置。 */
  anchor: ScreenPoint;
  onSelect: (seriesId: string) => void;
  onClose: () => void;
};

/** `SeriesCandidateCard` を、`anchor` の代表点の上に、矢印がその点を指すように絶対配置して描く。 */
export default function SeriesCandidateOverlay({
  candidates,
  anchor,
  onSelect,
  onClose,
}: SeriesCandidateOverlayProps) {
  const left = candidateCardLeftOf(anchor.x, window.innerWidth);

  return (
    <div
      className="absolute z-20 -translate-y-full"
      style={{
        left,
        top: anchor.y - CANDIDATE_ARROW_GAP_PX,
        width: CANDIDATE_CARD_WIDTH_PX,
      }}
    >
      <SeriesCandidateCard
        candidates={candidates}
        arrowLeftPx={anchor.x - left}
        onSelect={onSelect}
        onClose={onClose}
      />
    </div>
  );
}
