"use client";

/**
 * 詳細カードの、関連するシリーズを押せる名前で並べる行を描く部品を置く。
 * どのシリーズを並べるかは決めず、`@/lib/map/related-series` の `relatedSeriesOf` が選んだ結果を受け取る。
 */

import type { RelatedSeries } from "@/lib/map/related-series";

/**
 * 行の `section` の `aria-labelledby` が参照する、`h3` の id。
 * 同時に開く詳細カードは 1 枚なので固定値でよい。
 */
const RELATED_SERIES_TITLE_ID = "related-series-title";

type RelatedSeriesRowProps = {
  /** 近い順に並べた関連するシリーズ。 */
  relatedSeries: RelatedSeries[];
  onSelect: (seriesId: string) => void;
};

/**
 * 関連するシリーズ（`relatedSeries`）を、渡された順に 1 行に 1 件ずつ、押すと `onSelect` を呼ぶボタンで並べる。
 * 各行は左に名前、右端に関連とみなした理由の共有したタグを、名前より小さく薄い文字で置く。
 * 名前が行に収まらなければ末尾を省略し、全文は `title` 属性に残す。
 * `relatedSeries` が空なら、見出しごと何も描かない。
 */
export default function RelatedSeriesRow({
  relatedSeries,
  onSelect,
}: RelatedSeriesRowProps) {
  if (relatedSeries.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby={RELATED_SERIES_TITLE_ID}
      className="mt-4 flex-none border-t border-rule pt-3"
    >
      <h3
        id={RELATED_SERIES_TITLE_ID}
        className="font-heading text-[0.85rem] tracking-[0.04em] text-ink-muted"
      >
        関連するシリーズ
      </h3>

      <ul className="mt-1 divide-y divide-rule">
        {relatedSeries.map(({ series, sharedTags }) => (
          <li key={series.id}>
            <button
              type="button"
              onClick={() => onSelect(series.id)}
              className="flex w-full items-baseline gap-3 px-1 py-1.5 text-left hover:bg-rule/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-point"
            >
              <span
                title={series.title}
                className="min-w-0 grow truncate text-[0.85rem] text-link"
              >
                {series.title}
              </span>{" "}
              <span
                data-shared-tags
                className="flex-none text-[0.7rem] text-ink-muted"
              >
                <span className="sr-only">共有するタグ </span>
                {sharedTags.join("・")}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
