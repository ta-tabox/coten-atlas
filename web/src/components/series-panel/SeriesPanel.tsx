"use client";

/**
 * シリーズの一覧パネルを、タグの絞り込みと、地図に出ているシリーズの区画と位置なしのシリーズの区画で表示し、シリーズの押下を選択として、タグの押下を絞り込みとして返す。
 *
 * 選択も絞り込みも保持しない。
 * 選択中のシリーズと絞り込みに使うタグは props で受け取り、押されたシリーズの id は `onSelect`、選び直したタグは `onSelectedTagsChange` で返す。
 * どのシリーズをどちらの区画に入れるかは `@/lib/map/series-panel` が決める。
 */

import { useId } from "react";
import SeriesPanelBody from "@/components/series-panel/SeriesPanelBody";
import type { SeriesPanelSections } from "@/lib/map/series-panel";
import type { PanelTag } from "@/lib/map/tag-filter";

type SeriesPanelProps = {
  /** 地図に出ている区画と、位置なしの区画に並べるシリーズ。 */
  sections: SeriesPanelSections;
  /** 選択が無ければ null。 */
  selectedSeriesId: string | null;
  onSelect: (seriesId: string) => void;
  /** タグのボタンを並べる順は配列の順。 */
  tags: PanelTag[];
  /**
   * 絞り込みに使っているタグ。
   * 絞り込んでいなければ空配列。
   */
  selectedTags: string[];
  /** タグが押されたときに押したタグを足し引きした配列を、絞り込みが解除されたときに空配列を渡して呼ぶ。 */
  onSelectedTagsChange: (tags: string[]) => void;
  /**
   * 一覧を開いているか。
   * 地図の視野を一覧の幅だけずらす親が読むので、親が持つ。
   */
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

/**
 * タグの絞り込みと二つの区画を並べた一覧パネルを表示する。
 * 閉じている間は、一覧の代わりに開くボタンだけを出す。
 */
export default function SeriesPanel({
  sections,
  selectedSeriesId,
  onSelect,
  tags,
  selectedTags,
  onSelectedTagsChange,
  isOpen,
  onOpenChange,
}: SeriesPanelProps) {
  const titleId = useId();

  return (
    <div
      data-series-panel
      className="flex min-h-0 flex-col overflow-hidden rounded-box border border-rule bg-paper font-body text-ink shadow-sm"
    >
      {/* 閉じても外さず hidden にするのは、区画の開閉を開き直したときに残すため。 */}
      <aside
        aria-labelledby={titleId}
        hidden={!isOpen}
        className={`min-h-0 w-[18rem] max-w-full flex-col py-3 leading-[1.6] ${isOpen ? "flex" : "hidden"}`}
      >
        <header className="flex items-center gap-3 border-b border-rule px-4 pb-2">
          <h2
            id={titleId}
            className="grow font-heading text-[1.05rem] font-bold text-heading"
          >
            コテンラジオのシリーズ
          </h2>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-expanded={true}
            aria-label="一覧を閉じる"
            className="-mr-1.5 flex-none rounded-control px-1.5 text-[1.1rem] text-ink-muted hover:bg-rule/40 hover:text-ink"
          >
            ×
          </button>
        </header>

        <SeriesPanelBody
          sections={sections}
          selectedSeriesId={selectedSeriesId}
          onSelect={onSelect}
          tags={tags}
          selectedTags={selectedTags}
          onSelectedTagsChange={onSelectedTagsChange}
        />
      </aside>
      {!isOpen && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          aria-expanded={false}
          className="px-4 py-2 text-left text-[0.9rem] font-bold hover:bg-rule/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-point"
        >
          シリーズ一覧を開く
        </button>
      )}
    </div>
  );
}
