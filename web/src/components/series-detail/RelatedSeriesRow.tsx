"use client";

/**
 * 詳細カードの、関連するシリーズを押せる名前で並べる行を描く部品を置く。
 * どのシリーズを並べるかは決めず、`@/lib/map/related-series` の `relatedSeriesOf` が選んだ結果を受け取る。
 */

import type { Series } from "@/lib/schema/series";

/**
 * 行の `section` の `aria-labelledby` が参照する、`h3` の id。
 * 同時に開く詳細カードは 1 枚なので固定値でよい。
 */
const RELATED_SERIES_TITLE_ID = "related-series-title";

type RelatedSeriesRowProps = {
  /** 近い順に並べた関連するシリーズ。 */
  relatedSeries: Series[];
  onSelect: (seriesId: string) => void;
};

/**
 * 関連するシリーズ（`relatedSeries`）の名前を、渡された順に、押すと `onSelect` を呼ぶボタンで並べる。
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

      <ul className="mt-2 flex flex-wrap gap-1.5">
        {relatedSeries.map((series) => (
          <li key={series.id}>
            <button
              type="button"
              onClick={() => onSelect(series.id)}
              className="rounded-control border border-rule px-3 py-1 text-left text-[0.85rem] text-link hover:bg-rule/40 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-point"
            >
              {series.title}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
