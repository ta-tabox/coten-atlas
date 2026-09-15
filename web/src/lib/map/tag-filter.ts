/**
 * タグで一覧パネルと地図を絞り込む純関数を置く。
 * 選んだタグの状態とタグを並べる描画は持たず、`MapCanvas` と `SeriesPanelTagFilter` が持つ。
 *
 * 絞り込みはシリーズの集合に対して行い、一覧パネルの区画と地図の事物はどちらも絞った後のシリーズから組む。
 * 事物を絞った後のシリーズで選ぶのは `@/lib/map/loci` の `lociForSeries` である。
 */

import type { SeriesPanelSections } from "@/lib/map/series-panel";
import type { SeriesList } from "@/lib/schema/series";

/** 一覧パネルに並べるタグ 1 つと、そのタグを持つシリーズの数。 */
export type PanelTag = {
  tag: string;
  seriesCount: number;
};

/**
 * `sections` の両方の区画に並ぶシリーズの `tags` を、そのタグを持つシリーズの数の降順で返す。
 * 数が同じタグは、地図の区画・位置なしの区画の順にシリーズを走査して先に現れた方を前に置く。
 *
 * `sections` には絞り込む前の区画を渡す。
 * 絞り込んだ後の区画を渡すと、選んだタグを持つシリーズに付くタグしか並ばず、ほかのタグへ選び直せない。
 */
export function panelTagsOf(sections: SeriesPanelSections): PanelTag[] {
  const panelSeries = [...sections.onMap, ...sections.unlocated];
  const tags = [...new Set(panelSeries.flatMap((one) => one.tags))];

  return tags
    .map((tag) => ({
      tag,
      seriesCount: panelSeries.filter((one) => one.tags.includes(tag)).length,
    }))
    .toSorted((a, b) => b.seriesCount - a.seriesCount);
}

/**
 * `series` のうち `tag` を `tags` に持つシリーズを、`series` の並び順で返す。
 * `tag` が null なら `series` をそのまま返す。
 */
export function taggedSeriesOf(
  series: SeriesList,
  tag: string | null,
): SeriesList {
  if (tag === null) {
    return series;
  }

  return series.filter((one) => one.tags.includes(tag));
}
