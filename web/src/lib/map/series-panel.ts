/**
 * 一覧パネルに並べるシリーズを、地図に出ている区画と地図に出ない区画へ分ける。
 *
 * 地図に出ているかは `@/lib/map/series-layer` の `seriesIdsOnMapIn` で決め、地図の円を描くレイヤと同じ判定を使う。
 * 位置なしのシリーズの大半は `timeRange` が `TIME_RANGE_UNTIMED` で現在窓と比べられないので、位置なしの区画は現在窓で絞らずに全件を入れる。
 * 描画（React）と選択の状態はここに置かない。
 */

import type { CurrentWindow } from "@/lib/era/window";
import type { MapLocusCollection } from "@/lib/map/loci";
import { seriesIdsOnMapIn } from "@/lib/map/series-layer";
import {
  ANCHOR_UNLOCATED,
  type Series,
  type SeriesList,
  TIME_RANGE_UNTIMED,
} from "@/lib/schema/series";

/** 一覧パネルの二つの区画に並べるシリーズ。 */
export type SeriesPanelSections = {
  /**
   * 現在窓と重なる事物を持つシリーズ。
   * `timeRange` の `start` の昇順で、同じ年は `series` の並び順を保つ。
   */
  onMap: Series[];
  /**
   * `anchor` が `ANCHOR_UNLOCATED` のシリーズの全件。
   * 現在窓によらず、`series` の並び順を保つ。
   */
  unlocated: Series[];
};

/**
 * `one` の `timeRange` の `start` を返す。
 * `timeRange` が `TIME_RANGE_UNTIMED` なら throw する。
 *
 * スキーマは `TIME_RANGE_UNTIMED` を位置なしのシリーズにしか許さないので、地図に出ているシリーズで throw したらスキーマの検査を通っていない。
 */
function startYearOf(one: Series): number {
  if (one.timeRange === TIME_RANGE_UNTIMED) {
    throw new Error(
      `シリーズ ${one.id} は地図に出ているのに時期を持たない（anchor=${one.anchor}）`,
    );
  }

  return one.timeRange.start;
}

/**
 * `series` を、`currentWindow` の地図に `loci` の事物が出ているシリーズと、位置なしのシリーズの二つの区画へ分けて返す。
 * どちらにも当たらないシリーズ（代表点を持つが現在窓と重ならない）は、どちらの区画にも入れない。
 */
export function seriesPanelSectionsOf({
  series,
  loci,
  currentWindow,
}: {
  series: SeriesList;
  loci: MapLocusCollection;
  currentWindow: CurrentWindow;
}): SeriesPanelSections {
  const idsOnMap = seriesIdsOnMapIn(currentWindow, loci);

  const onMap = series
    .filter((one) => idsOnMap.has(one.id))
    .toSorted((a, b) => startYearOf(a) - startYearOf(b));
  const unlocated = series.filter((one) => one.anchor === ANCHOR_UNLOCATED);

  return { onMap, unlocated };
}
