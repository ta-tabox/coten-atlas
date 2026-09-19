/**
 * タグで一覧パネルと地図を絞り込む純関数を置く。
 * 選んだタグの状態とタグを並べる描画は持たず、`MapCanvas` と `SeriesPanelTagFilter` が持つ。
 *
 * 例えば「戦争」を選ぶと、`taggedSeriesOf` が「戦争」を持つシリーズだけを残し、一覧パネルはそのシリーズだけを並べ、地図は `@/lib/map/loci` の `lociForSeries` がそのシリーズの点だけを残して描く。
 * 一覧パネルと地図を同じ絞ったシリーズから作るので、パネルに並ぶシリーズと地図の点が食い違わない。
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
 * `selectedTags` のうち `sections` のどのシリーズも持たないタグは、数を 0 として末尾へ足す。
 *
 * `sections` には `selectedTags` で絞り込んだ後の区画を渡すので、並ぶタグは選んだタグと一緒に選べるものだけになり、数はそのタグを足したときに残るシリーズの数になる。
 * 絞り込んだ区画が空になっても選んだタグを押して外せるように、選んだタグは必ず並べる。
 */
export function panelTagsOf(
  sections: SeriesPanelSections,
  selectedTags: readonly string[],
): PanelTag[] {
  const panelSeries = [...sections.onMap, ...sections.unlocated];
  const tags = [...new Set(panelSeries.flatMap((one) => one.tags))];

  const counted = tags
    .map((tag) => ({
      tag,
      seriesCount: panelSeries.filter((one) => one.tags.includes(tag)).length,
    }))
    .toSorted((a, b) => b.seriesCount - a.seriesCount);
  const missingSelected = selectedTags
    .filter((tag) => !tags.includes(tag))
    .map((tag) => ({ tag, seriesCount: 0 }));

  return [...counted, ...missingSelected];
}

/**
 * `series` のうち、選択中のタグ（`selectedTags`）をすべて持つシリーズを返す。
 * 選択中のタグが無ければ `series` をそのまま返す。
 *
 * 残したシリーズの順序は `series` のまま変えないので、一覧パネルの位置なしの区画は絞る前と同じ順に並ぶ。
 */
export function taggedSeriesOf(
  series: SeriesList,
  selectedTags: readonly string[],
): SeriesList {
  if (selectedTags.length === 0) {
    return series;
  }

  return series.filter((one) =>
    selectedTags.every((tag) => one.tags.includes(tag)),
  );
}

/**
 * `selectedTags` に `tag` があれば外し、無ければ末尾へ足した配列を返す。
 * `selectedTags` は書き換えない。
 */
export function toggledTagsOf(
  selectedTags: readonly string[],
  tag: string,
): string[] {
  if (selectedTags.includes(tag)) {
    return selectedTags.filter((one) => one !== tag);
  }

  return [...selectedTags, tag];
}
