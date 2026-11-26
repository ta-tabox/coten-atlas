/**
 * 詳細カードの関連シリーズ行に並べるシリーズを選ぶ純関数を置く。
 * 行の描画と選択を移す操作は持たず、詳細カードの部品と `MapCanvas` が持つ。
 *
 * 関連とみなすのは、狭いタグ（種別のタグと `SERIES_BROAD_TOPIC_TAGS` を除いた `tags`）を一つでも共有するシリーズである。
 * 並べる順は、共有する狭いタグの数が多い方を先にし、同じなら年代の中点が近い方を先にする。
 * 例えば吉田松陰（人物・幕末・思想・教育）は、`幕末` を共有する西郷隆盛・高杉晋作・ペリー来航と、`教育` を共有するシリーズを並べ、`思想` だけを共有する伊藤野枝は並べない。
 * `region` を判定に使わない理由と、広いタグを名指しで除く理由は docs/adr/20261126-related-series-narrow-tags.md が持つ。
 */

import {
  SERIES_BROAD_TOPIC_TAGS,
  SERIES_CATEGORY_TAGS,
  type Series,
  type SeriesList,
  TIME_RANGE_UNTIMED,
} from "@/lib/schema/series";

/** `relatedSeriesOf` が返し、関連シリーズ行が 1 件ずつ描く、関連するシリーズと、起点のシリーズと共有した狭いタグ。 */
export type RelatedSeries = {
  series: Series;
  /** 起点のシリーズの `tags` の並び順で、1 個以上。 */
  sharedTags: string[];
};

/** 関連シリーズ行に並べるシリーズの最大の数。 */
export const RELATED_SERIES_LIMIT = 4;

const UNCOUNTED_TAGS: ReadonlySet<string> = new Set([
  ...SERIES_CATEGORY_TAGS,
  ...SERIES_BROAD_TOPIC_TAGS,
]);

/**
 * 年代（`series.timeRange`）の中点の年を返す。
 * 時期を持たないシリーズには null を返す。
 */
function midYearOf(series: Series): number | null {
  if (series.timeRange === TIME_RANGE_UNTIMED) {
    return null;
  }

  return (series.timeRange.start + series.timeRange.end) / 2;
}

/**
 * 二つのシリーズ（`a` と `b`）の年代の中点どうしの差（年）を返す。
 * どちらかが時期を持たなければ正の無限大を返し、時期を持つシリーズより後ろへ並べる。
 */
function yearDistanceOf(a: Series, b: Series): number {
  const aYear = midYearOf(a);
  const bYear = midYearOf(b);

  if (aYear === null || bYear === null) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.abs(aYear - bYear);
}

/** 起点のシリーズ（`origin`）と別のシリーズ（`other`）が共有する狭いタグを、`origin` の `tags` の並び順で返す。 */
function sharedNarrowTagsOf(origin: Series, other: Series): string[] {
  return origin.tags.filter(
    (tag) => !UNCOUNTED_TAGS.has(tag) && other.tags.includes(tag),
  );
}

/**
 * シリーズの全件（`seriesList`）のうち、選択中のシリーズ（`origin`）に関連するシリーズを、共有した狭いタグと組にして、近い順に `RELATED_SERIES_LIMIT` 件まで返す。
 * 関連するシリーズが無ければ空配列を返す。
 *
 * 近さが同じシリーズは `seriesList` の並び順を保つので、同じシリーズを選び直しても関連シリーズ行の並びは入れ替わらない。
 * `origin` 自身は返さない。
 */
export function relatedSeriesOf(
  seriesList: SeriesList,
  origin: Series,
): RelatedSeries[] {
  const related = seriesList
    .filter((other) => other.id !== origin.id)
    .map((other) => ({
      series: other,
      sharedTags: sharedNarrowTagsOf(origin, other),
      yearDistance: yearDistanceOf(origin, other),
    }))
    .filter(({ sharedTags }) => sharedTags.length > 0);

  return related
    .toSorted(
      (a, b) =>
        b.sharedTags.length - a.sharedTags.length ||
        // 両方が時期を持たないと無限大どうしの差が NaN になるので、0 にして並び順を保つ。
        a.yearDistance - b.yearDistance ||
        0,
    )
    .slice(0, RELATED_SERIES_LIMIT)
    .map(({ series, sharedTags }) => ({ series, sharedTags }));
}
