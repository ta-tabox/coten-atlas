/**
 * 詳細カードの `region` と `tags` の札の行を描く部品を置く。
 * 札を押したときの絞り込みは持たない。
 */

import type { Series } from "@/lib/schema/series";

/**
 * 区画を選べないシリーズの `region` の値。
 * 札に出す地域を持たないので、札を出さない。
 */
const REGION_NONE: Series["region"] = "地域なし";

/**
 * `region` の札を先頭に、`tags` の札を `series.json` の順に並べる。
 * `region` が `地域なし` のときは `region` の札を出さない。
 * 札は表示だけで、押せない。
 */
export default function SeriesLabels({ series }: { series: Series }) {
  const regionLabel = series.region === REGION_NONE ? [] : [series.region];

  return (
    <ul aria-label="地域とタグ" className="mt-1.5 flex flex-wrap gap-1">
      {regionLabel.map((region) => (
        <li
          key={region}
          data-label="region"
          className="rounded-full border border-point bg-paper px-2.5 py-0.5 text-[0.75rem] text-point"
        >
          {region}
        </li>
      ))}
      {series.tags.map((tag) => (
        <li
          key={tag}
          data-label="tag"
          className="rounded-full border border-rule bg-rule/40 px-2.5 py-0.5 text-[0.75rem] text-ink-muted"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
