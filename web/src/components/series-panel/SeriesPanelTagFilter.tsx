"use client";

/**
 * 一覧パネルのタグの絞り込みを、開閉のボタンを兼ねた見出しと、押して選ぶタグの列で表示する部品を置く。
 *
 * 選んだタグも開閉も保持しない。
 * どちらも props で受け取り、押したタグを足し引きした選択と解除は `onSelectedTagsChange`、見出しの押下は `onToggle` で返す。
 * 並べるタグを数えるのは `@/lib/map/tag-filter` である。
 */

import { useId } from "react";
import { type PanelTag, toggledTagsOf } from "@/lib/map/tag-filter";

type SeriesPanelTagFilterProps = {
  /** 押して選べるタグと、そのタグを持つシリーズの数。 */
  tags: PanelTag[];
  /**
   * 絞り込みに使っているタグ。
   * 絞り込んでいなければ空配列。
   */
  selectedTags: string[];
  /** タグが押されたときに押したタグを足し引きした配列を、絞り込みが解除されたときに空配列を渡して呼ぶ。 */
  onSelectedTagsChange: (tags: string[]) => void;
  /** タグの列を表示しているか。 */
  isExpanded: boolean;
  onToggle: () => void;
};

/**
 * 見出しの下に、`isExpanded` が true のときだけ `tags` を押せるボタンの列で表示する。
 * `selectedTags` が空でなければ、開閉によらず解除のボタンを出す。
 *
 * タグの列を閉じたままでも絞り込みを外せるように、解除のボタンはタグの列の外に置く。
 */
export default function SeriesPanelTagFilter({
  tags,
  selectedTags,
  onSelectedTagsChange,
  isExpanded,
  onToggle,
}: SeriesPanelTagFilterProps) {
  const headingId = useId();
  const bodyId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="shrink-0 rounded-box border border-rule p-1"
    >
      <h3
        id={headingId}
        className="font-heading text-[0.85rem] font-bold text-ink"
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-controls={bodyId}
          className="flex w-full items-center gap-1.5 rounded-control px-1.5 py-1 text-left hover:bg-rule/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point"
        >
          <span className="min-w-0">タグで絞り込む</span>
          {/* 開いているか閉じているかを、色だけでなく形でも示す。 */}
          <span
            aria-hidden="true"
            className={`ml-auto flex-none text-[0.6rem] text-ink-muted motion-safe:transition-transform ${isExpanded ? "" : "-rotate-90"}`}
          >
            ▼
          </span>
        </button>
      </h3>

      {selectedTags.length > 0 && (
        <div className="px-2 py-1">
          <button
            type="button"
            onClick={() => onSelectedTagsChange([])}
            className="flex-none rounded-control border border-rule bg-paper px-1.5 text-[0.75rem] hover:bg-rule/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point"
          >
            絞り込みを解除
          </button>
        </div>
      )}

      <div id={bodyId} hidden={!isExpanded} className="pb-1">
        {tags.length === 0 ? (
          <p className="px-2 text-[0.85rem] text-ink-muted">
            並べるタグは無い。
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1 px-1.5 pt-0.5">
            {tags.map(({ tag, seriesCount }) => {
              const isSelected = selectedTags.includes(tag);

              return (
                <li key={tag}>
                  {/* 選択中のタグを、色だけでなく色以外の見た目でも示す。 */}
                  <button
                    type="button"
                    onClick={() =>
                      onSelectedTagsChange(toggledTagsOf(selectedTags, tag))
                    }
                    aria-pressed={isSelected}
                    className={`rounded-control border px-2 py-0.5 text-[0.8rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point ${isSelected ? "border-ink bg-ink font-bold text-paper" : "border-rule bg-paper hover:bg-rule/40"}`}
                  >
                    {tag}
                    <span
                      className={`ml-1 text-[0.7rem] font-normal tabular-nums ${isSelected ? "text-paper/80" : "text-ink-muted"}`}
                    >
                      {seriesCount}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
