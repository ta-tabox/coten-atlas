"use client";

/**
 * 一覧パネルのタグの絞り込みを、開閉のボタンを兼ねた見出しと、押して選ぶタグの列で表示する部品を置く。
 *
 * 選んだタグも開閉も保持しない。
 * どちらも props で受け取り、押したタグを足し引きした選択と解除は `onSelectedTagsChange`、見出しの押下は `onToggle` で返す。
 * 並べるタグを数えるのは `@/lib/map/tag-filter` である。
 */

import { useId } from "react";
import { formatTagCondition } from "@/lib/format";
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
  /** 見出しが押されたときに呼ぶ。 */
  onToggle: () => void;
};

/**
 * 見出しの下に、`isExpanded` が true のときだけ `tags` を押せるボタンの列で表示する。
 * `selectedTags` が空でなければ、開閉によらず絞り込み中のタグと解除のボタンを出す。
 *
 * 解除のボタンは、`selectedTags` のタグが `tags` に無いときも出す。
 * 現在窓が動くと並ぶタグが入れ替わるので、タグの列からしか解除できないと、列から消えたタグで絞ったまま戻れなくなる。
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
      className="shrink-0 rounded-lg border border-white/60 bg-white/35 p-1"
    >
      <h3 id={headingId} className="text-[0.8rem] font-bold text-zinc-800">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-controls={bodyId}
          className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <span className="min-w-0">タグで絞り込む</span>
          {/* 開いているか閉じているかを、色だけでなく形でも示す。 */}
          <span
            aria-hidden="true"
            className={`ml-auto flex-none text-[0.6rem] text-zinc-600 motion-safe:transition-transform ${isExpanded ? "" : "-rotate-90"}`}
          >
            ▼
          </span>
        </button>
      </h3>

      {selectedTags.length > 0 && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 px-2 py-1 text-[0.8rem]">
          <span className="min-w-0 grow">
            {formatTagCondition(selectedTags)}シリーズだけを表示している。
          </span>
          <button
            type="button"
            onClick={() => onSelectedTagsChange([])}
            className="flex-none rounded border border-zinc-900/15 bg-white/60 px-1.5 text-[0.75rem] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            絞り込みを解除
          </button>
        </p>
      )}

      <div id={bodyId} hidden={!isExpanded} className="pb-1">
        {tags.length === 0 ? (
          <p className="px-2 text-[0.85rem] text-zinc-600">
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
                    className={`rounded-full border px-2 py-0.5 text-[0.8rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${isSelected ? "border-zinc-800 bg-zinc-800 font-bold text-white" : "border-zinc-900/15 bg-white/50 hover:bg-white/80"}`}
                  >
                    {tag}
                    <span
                      className={`ml-1 text-[0.7rem] font-normal tabular-nums ${isSelected ? "text-zinc-200" : "text-zinc-600"}`}
                    >
                      {seriesCount}件
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
