/**
 * シリーズを描くどのレイヤも使う、source の id・円のレイヤ・現在窓から事物の濃さを求める関数を置く。
 * レイヤごとの定義と `filter` を組む関数は持たず、`@/lib/map/layers/` のレイヤごとのモジュールが持つ。
 *
 * 第一段階の geometry は Point だけなので、レイヤはどれも circle で足りる。
 * `['geometry-type']` で図形を分ける枝は第二段階まで無い。
 *
 * 不透明度は、era スライダーの現在窓から求めた事物ごとの濃さだけで決まり、シリーズの属性で濃さを変えない。
 * 事物ごとの濃さは `@/lib/era/window` の関数で求めて式へ数値で埋め込み、同じ計算を MapLibre の式で書き直さない。
 * 書き直さない理由は docs/adr/20260911-era-fade-window-only.md が持つ。
 *
 * 色は MapLibre のスタイル式が読むので、Tailwind のトークンでなく生の値を置く。
 * 地図の中で閉じる指定であって、overlay の見た目とは別物である。
 */

import type { CircleLayerSpecification } from "react-map-gl/maplibre";
import {
  type CurrentWindow,
  fadeOpacity,
  overlapRatio,
} from "@/lib/era/window";
import type { MapLocusCollection } from "@/lib/map/loci";

/**
 * シリーズを描くレイヤ 1 枚の定義。
 * `source` は持たず、`@/components/map/series-layers/` の部品が `SERIES_SOURCE_ID` を `<Layer>` へ渡す。
 *
 * `@/lib/map/layers/` のモジュールは `react-map-gl/maplibre` を import できないので、レイヤの型はこの別名で受け取る。
 */
export type SeriesLayerSpecification = Omit<CircleLayerSpecification, "source">;

/** 事物を取得する source の id。 */
export const SERIES_SOURCE_ID = "series-loci";

/**
 * 代表点を描く円のレイヤ。
 *
 * 不透明度を持たない。
 * 現在窓から求めた濃さを不透明度にしたレイヤは `@/lib/map/layers/series-circle` の `seriesCircleLayerIn` が返す。
 */
export const SERIES_CIRCLE_LAYER: SeriesLayerSpecification = {
  id: "series-circle",
  type: "circle",
  paint: {
    "circle-radius": 6,
    "circle-color": "#1f5673",
  },
};

/** 現在窓と重なる事物 1 件の id・シリーズの id と、重なりから求めた濃さ（0 を超え 1 以下）。 */
export type LocusFade = {
  id: string;
  seriesId: string;
  fade: number;
};

/**
 * `loci` のうち `currentWindow` と重なる事物について、id・シリーズの id・濃さを返す。
 * 濃さが 0 の事物は含めない。
 *
 * 円の `filter` と輪の `filter` と一覧パネルの数がこの関数から導かれるので、地図に描く事物の判定を別の式で書き直さない。
 */
export function fadesOf(
  currentWindow: CurrentWindow,
  loci: MapLocusCollection,
): LocusFade[] {
  return loci.features
    .map((locus) => ({
      id: locus.properties.id,
      seriesId: locus.properties.seriesId,
      fade: fadeOpacity(
        overlapRatio(currentWindow, {
          start: locus.properties.timeStart,
          end: locus.properties.timeEnd,
        }),
      ),
    }))
    .filter(({ fade }) => fade > 0);
}

/**
 * `loci` のうち `currentWindow` と重なる事物を持つシリーズの id を返す。
 *
 * 一覧パネルが「地図に出ているシリーズ」を数えるときに呼ぶ。
 * 判定を `seriesCircleLayerIn` の `filter` と同じ `fadesOf` から導くので、パネルの一覧と地図に描かれた円が食い違わない。
 */
export function seriesIdsOnMapIn(
  currentWindow: CurrentWindow,
  loci: MapLocusCollection,
): Set<string> {
  return new Set(fadesOf(currentWindow, loci).map(({ seriesId }) => seriesId));
}
