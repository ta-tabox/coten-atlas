"use client";

/**
 * 選ばれたシリーズ 1 件の詳細カードの枠を描く。
 * 中身は `SeriesDetailBody` が描く。
 */

import SeriesDetailBody, {
  SERIES_DETAIL_TITLE_ID,
} from "@/components/series-detail/SeriesDetailBody";
import type { EpisodesState } from "@/lib/episodes";
import type { Series } from "@/lib/schema/series";

type SeriesDetailCardProps = {
  series: Series;
  /**
   * 代表点の事物の地名。
   * 位置なしのシリーズは null。
   */
  placeName: string | null;
  /** `series` に割り当てられたエピソードと、その取得の状態。 */
  episodes: EpisodesState;
  /** `relatedSeriesOf` が近い順に選んだ、`series` に関連するシリーズ。 */
  relatedSeries: Series[];
  onSelect: (seriesId: string) => void;
  onClose: () => void;
};

/**
 * `SeriesDetailBody` を、角丸と罫線の枠に入れて描く。
 * 枠の高さは 36rem を上限にし、親の要素が縦の flex コンテナで高さの上限を持つなら、その上限まで縮む。
 */
export default function SeriesDetailCard({
  series,
  placeName,
  episodes,
  relatedSeries,
  onSelect,
  onClose,
}: SeriesDetailCardProps) {
  return (
    <aside
      aria-labelledby={SERIES_DETAIL_TITLE_ID}
      className="flex max-h-[36rem] min-h-0 w-[22rem] max-w-full flex-col overflow-hidden rounded-box border border-rule bg-paper px-5 py-4 font-body leading-[1.7] text-ink shadow-sm"
    >
      <SeriesDetailBody
        series={series}
        placeName={placeName}
        episodes={episodes}
        relatedSeries={relatedSeries}
        onSelect={onSelect}
        onClose={onClose}
      />
    </aside>
  );
}
