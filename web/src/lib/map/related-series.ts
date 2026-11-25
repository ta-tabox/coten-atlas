/**
 * 詳細カードの関連シリーズ行に並べるシリーズを選ぶ純関数を置く。
 * 行の描画と選択を移す操作は持たず、詳細カードの部品と `MapCanvas` が持つ。
 *
 * 関連とみなすのは、`tags` を一つでも共有するか、`region` が同じ（`地域なし` どうしを除く）シリーズである。
 * 並べる順は、主題のタグ（種別のタグを除いた `tags`）の一致数・`region` の一致・種別のタグの一致数・年代の中点の近さの順に比べて決める。
 * 種別のタグ（`SERIES_CATEGORY_TAGS`）を主題のタグと同じ重さで数えると、`人物` だけを共有する地域も主題も違うシリーズが上位に並ぶ。
 * 例えば吉田松陰（日本・人物・幕末・思想・教育）は、西郷隆盛・高杉晋作・ペリー来航（幕末と日本を共有）を先に、伊藤野枝（思想と日本を共有）をその次に並べる。
 */

import {
  REGION_NONE,
  SERIES_CATEGORY_TAGS,
  type Series,
  type SeriesList,
  TIME_RANGE_UNTIMED,
} from "@/lib/schema/series";

/** 関連シリーズ行に並べるシリーズの最大の数。 */
export const RELATED_SERIES_LIMIT = 4;

const CATEGORY_TAGS: ReadonlySet<string> = new Set(SERIES_CATEGORY_TAGS);

/** シリーズ（`other`）が、起点のシリーズ（`origin`）と共有するものを比べる順に並べた値。 */
type Closeness = {
  topicTagCount: number;
  isSameRegion: boolean;
  categoryTagCount: number;
  /**
   * 年代の中点どうしの差（年）。
   * どちらかが時期を持たなければ正の無限大。
   */
  yearDistance: number;
};

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

/** 起点のシリーズ（`origin`）から見た、シリーズ（`other`）の近さを返す。 */
function closenessOf(origin: Series, other: Series): Closeness {
  const sharedTags = origin.tags.filter((tag) => other.tags.includes(tag));
  const categoryTagCount = sharedTags.filter((tag) =>
    CATEGORY_TAGS.has(tag),
  ).length;
  const originYear = midYearOf(origin);
  const otherYear = midYearOf(other);

  return {
    topicTagCount: sharedTags.length - categoryTagCount,
    isSameRegion:
      origin.region !== REGION_NONE && origin.region === other.region,
    categoryTagCount,
    yearDistance:
      originYear === null || otherYear === null
        ? Number.POSITIVE_INFINITY
        : Math.abs(originYear - otherYear),
  };
}

/** 二つの近さ（`a` と `b`）を比べ、`a` の方が近ければ負の数、`b` の方が近ければ正の数、同じなら 0 を返す。 */
function compareCloseness(a: Closeness, b: Closeness): number {
  return (
    b.topicTagCount - a.topicTagCount ||
    Number(b.isSameRegion) - Number(a.isSameRegion) ||
    b.categoryTagCount - a.categoryTagCount ||
    // 両方が時期を持たないと無限大どうしの差が NaN になるので、0 にして並び順を保つ。
    a.yearDistance - b.yearDistance ||
    0
  );
}

/**
 * シリーズの全件（`seriesList`）のうち、選択中のシリーズ（`origin`）に関連するシリーズを、近い順に `RELATED_SERIES_LIMIT` 件まで返す。
 * 関連するシリーズが無ければ空配列を返す。
 *
 * 近さが同じシリーズは `seriesList` の並び順を保つので、同じシリーズを選び直しても関連シリーズ行の並びは入れ替わらない。
 * `origin` 自身は返さない。
 */
export function relatedSeriesOf(
  seriesList: SeriesList,
  origin: Series,
): Series[] {
  const related = seriesList
    .filter((other) => other.id !== origin.id)
    .map((other) => ({ other, closeness: closenessOf(origin, other) }))
    .filter(
      ({ closeness }) =>
        closeness.topicTagCount > 0 ||
        closeness.categoryTagCount > 0 ||
        closeness.isSameRegion,
    );

  return related
    .toSorted((a, b) => compareCloseness(a.closeness, b.closeness))
    .slice(0, RELATED_SERIES_LIMIT)
    .map(({ other }) => other);
}
