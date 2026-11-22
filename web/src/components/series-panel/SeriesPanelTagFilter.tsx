"use client";

/**
 * タグの絞り込みを、横へスクロールする一行のボタンの列で表示する部品を置く。
 *
 * 選んだタグを保持しない。
 * 選んだタグは props で受け取り、押したタグを足し引きした選択と解除は `onSelectedTagsChange` で返す。
 * 並べるタグを数えるのは `@/lib/map/tag-filter` である。
 */

import { type PanelTag, toggledTagsOf } from "@/lib/map/tag-filter";

type SeriesPanelTagFilterProps = {
  /**
   * 押して選べるタグ。
   * 並べる順は配列の順で、数は表示しない。
   */
  tags: PanelTag[];
  /**
   * 絞り込みに使っているタグ。
   * 絞り込んでいなければ空配列。
   */
  selectedTags: string[];
  /** タグが押されたときに押したタグを足し引きした配列を、絞り込みが解除されたときに空配列を渡して呼ぶ。 */
  onSelectedTagsChange: (tags: string[]) => void;
};

/**
 * `tags` を押せるボタンの列で表示する。
 * `selectedTags` が空でなければ、列の先頭に解除のボタンを出す。
 *
 * 列は折り返さず横へスクロールするので、タグが増えても高さは変わらない。
 */
export default function SeriesPanelTagFilter({
  tags,
  selectedTags,
  onSelectedTagsChange,
}: SeriesPanelTagFilterProps) {
  if (tags.length === 0) {
    return <p className="text-[0.85rem] text-ink-muted">並べるタグは無い。</p>;
  }

  return (
    <ul
      aria-label="タグで絞り込む"
      className="flex gap-1 overflow-x-auto pb-1 whitespace-nowrap"
    >
      {selectedTags.length > 0 && (
        <li className="flex-none">
          <button
            type="button"
            onClick={() => onSelectedTagsChange([])}
            className="rounded-full border border-rule bg-paper px-2.5 py-0.5 text-[0.8rem] hover:bg-rule/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point"
          >
            絞り込みを解除
          </button>
        </li>
      )}
      {tags.map(({ tag }) => {
        const isSelected = selectedTags.includes(tag);

        return (
          <li key={tag} className="flex-none">
            {/* 選択中のタグを、色だけでなく色以外の見た目でも示す。 */}
            <button
              type="button"
              onClick={() =>
                onSelectedTagsChange(toggledTagsOf(selectedTags, tag))
              }
              aria-pressed={isSelected}
              className={`rounded-full border px-2.5 py-0.5 text-[0.8rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point ${isSelected ? "border-point bg-point font-bold text-paper" : "border-rule bg-paper hover:bg-rule/40"}`}
            >
              {tag}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
