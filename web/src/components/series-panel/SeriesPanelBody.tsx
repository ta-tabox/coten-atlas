"use client";

/**
 * 一覧パネルの中身（タグの絞り込みの帯と、地図に出ているシリーズと位置なしのシリーズの 2 つの区画）を、枠も開閉も持たずに表示する。
 *
 * 選択も絞り込みも保持しない。
 * 区画ごとの開閉だけをここで持ち、枠が隠れても残すかは置く側が決める。
 */

import { useState } from "react";
import SeriesPanelSection from "@/components/series-panel/SeriesPanelSection";
import SeriesPanelTagFilter from "@/components/series-panel/SeriesPanelTagFilter";
import { formatTagCondition } from "@/lib/format";
import type { SeriesPanelSections } from "@/lib/map/series-panel";
import type { PanelTag } from "@/lib/map/tag-filter";

type SeriesPanelBodyProps = {
  /** 地図に出ている区画と、位置なしの区画に並べるシリーズ。 */
  sections: SeriesPanelSections;
  /** 選択が無ければ null。 */
  selectedSeriesId: string | null;
  onSelect: (seriesId: string) => void;
  /** 帯に並べる順は配列の順。 */
  tags: PanelTag[];
  /**
   * 絞り込みに使っているタグ。
   * 絞り込んでいなければ空配列。
   */
  selectedTags: string[];
  /** タグが押されたときに押したタグを足し引きした配列を、絞り込みが解除されたときに空配列を渡して呼ぶ。 */
  onSelectedTagsChange: (tags: string[]) => void;
};

/** タグの絞り込みの帯の下に、2 つの区画を縦に並べる。 */
export default function SeriesPanelBody({
  sections,
  selectedSeriesId,
  onSelect,
  tags,
  selectedTags,
  onSelectedTagsChange,
}: SeriesPanelBodyProps) {
  const [isOnMapExpanded, setIsOnMapExpanded] = useState(true);
  const [isUnlocatedExpanded, setIsUnlocatedExpanded] = useState(true);

  // 地図の円（`SERIES_CIRCLE_LAYER` の `circle-color`）と同じ色で塗った丸で、地図に点があることを示す。
  const onMapMarker = <span className="block size-2.5 rounded-full bg-point" />;

  // 塗りの無い点線の輪で、地図に点を持たないことを示す。
  const unlocatedMarker = (
    <span className="block size-2.5 rounded-full border border-dashed border-ink-muted" />
  );

  return (
    <>
      <div className="shrink-0 border-b border-rule px-4 py-2">
        <SeriesPanelTagFilter
          tags={tags}
          selectedTags={selectedTags}
          onSelectedTagsChange={onSelectedTagsChange}
        />
      </div>

      {/* overflow-y-auto だけを指定すると CSS が横の overflow も auto に変えて横スクロールバーが出るので、overflow-x-hidden を明示する。 */}
      <div className="flex min-h-0 flex-col gap-3 overflow-x-hidden overflow-y-auto overscroll-contain px-2 pt-2 pb-1">
        <SeriesPanelSection
          sectionKey="on-map"
          heading="地図に出ているシリーズ"
          marker={onMapMarker}
          seriesList={sections.onMap}
          emptyNote={
            selectedTags.length === 0
              ? "この時代に地図に出ているシリーズは無い。"
              : `この時代に地図に出ているシリーズに、${formatTagCondition(selectedTags)}ものは無い。`
          }
          selectedSeriesId={selectedSeriesId}
          onSelect={onSelect}
          isExpanded={isOnMapExpanded}
          onToggle={() => setIsOnMapExpanded(!isOnMapExpanded)}
        />
        <SeriesPanelSection
          sectionKey="unlocated"
          heading="場所や時代をまたぐシリーズ"
          marker={unlocatedMarker}
          seriesList={sections.unlocated}
          emptyNote={
            selectedTags.length === 0
              ? "場所や時代をまたぐシリーズは無い。"
              : `場所や時代をまたぐシリーズに、${formatTagCondition(selectedTags)}ものは無い。`
          }
          selectedSeriesId={selectedSeriesId}
          onSelect={onSelect}
          isExpanded={isUnlocatedExpanded}
          onToggle={() => setIsUnlocatedExpanded(!isUnlocatedExpanded)}
        />
      </div>
    </>
  );
}
