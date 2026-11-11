/**
 * 代表点の円のレイヤへ、現在窓から求めた事物ごとの濃さを不透明度と `filter` として設定する関数を置く。
 * 円のレイヤそのものの定義と、濃さを求める `fadesOf` は持たず、`@/lib/map/series-layer` が持つ。
 */

import type { CurrentWindow } from "@/lib/era/window";
import type { MapLocusCollection } from "@/lib/map/loci";
import {
  fadesOf,
  type LocusFade,
  SERIES_CIRCLE_LAYER,
  type SeriesLayerSpecification,
} from "@/lib/map/series-layer";

/** 円のレイヤの `circle-opacity` に置ける値の型。 */
type CircleOpacity = NonNullable<
  SeriesLayerSpecification["paint"]
>["circle-opacity"];

/**
 * `fades` の濃さを事物の `id` で選ぶ式を返す。
 * `fades` が空なら 0 を返す。
 *
 * MapLibre の `match` は入力と既定値の間に 1 組以上の「値と出力」を要求するので、空の `fades` から `match` を組むと式が不正になる。
 */
function fadeByLocusId(fades: LocusFade[]): CircleOpacity {
  if (fades.length === 0) {
    return 0;
  }

  const [first, ...rest] = fades;

  return [
    "match",
    ["get", "id"],
    first.id,
    first.fade,
    ...rest.flatMap(({ id, fade }) => [id, fade]),
    0,
  ];
}

/**
 * `SERIES_CIRCLE_LAYER` に、`currentWindow` と `loci` の各事物の年の重なりから求めた濃さを不透明度として設定したレイヤを返す。
 *
 * 濃さが 0 の事物は `filter` で地図から除く。
 * 不透明度が 0 の円も MapLibre はクリックとホバーの対象に含めるので、除かないと何も見えない場所で詳細カードが開く。
 */
export function seriesCircleLayerIn(
  currentWindow: CurrentWindow,
  loci: MapLocusCollection,
): SeriesLayerSpecification {
  const fades = fadesOf(currentWindow, loci);

  return {
    ...SERIES_CIRCLE_LAYER,
    filter: ["in", ["get", "id"], ["literal", fades.map(({ id }) => id)]],
    paint: {
      ...SERIES_CIRCLE_LAYER.paint,
      "circle-opacity": fadeByLocusId(fades),
      // MapLibre は feature ごとに値が変わる式を遷移の途中で補間せず、遷移が終わるまで前の値を描き続ける。
      // 既定の 300ms を残すと、スライダーを動かしている間は円の濃さが変わらない。
      "circle-opacity-transition": { duration: 0 },
    },
  };
}
