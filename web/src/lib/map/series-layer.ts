/**
 * シリーズを描くレイヤの定義。
 *
 * 第一段階の geometry は Point だけなので、レイヤは circle の 1 本で足りる（docs/adr/0026-two-phase-location.md）。
 * `['geometry-type']` で図形を分ける枝は第二段階まで無い。
 *
 * 不透明度は、era スライダーの現在窓から求めた事物ごとの濃さだけで決まり、シリーズの属性で濃さを変えない。
 * 事物ごとの濃さは `@/lib/era/window` の関数で求めて式へ数値で埋め込み、同じ計算を MapLibre の式で書き直さない。
 * 書き直さない理由は docs/adr/0043-era-fade-window-only.md が持つ。
 *
 * 色は MapLibre のスタイル式が読むので、Tailwind のトークンでなく生の値を置く。
 * 地図の中で閉じる指定であって、overlay の見た目とは別物である（docs/adr/0022-map-dom-boundary.md）。
 */

import type { ExpressionSpecification } from "maplibre-gl";
import type { CircleLayerSpecification } from "react-map-gl/maplibre";
import {
  type CurrentWindow,
  fadeOpacity,
  overlapRatio,
} from "@/lib/era/window";
import type { MapLocusCollection } from "@/lib/map/loci";

/** 事物を取得する source の id。 */
export const SERIES_SOURCE_ID = "series-loci";

/**
 * 代表点を描く円のレイヤ。
 * `source` は `<Source>` の子に置くと react-map-gl が入れるので持たない。
 *
 * 不透明度を持たない。
 * 現在窓から求めた濃さを不透明度にしたレイヤは `seriesCircleLayerIn` が返す。
 */
export const SERIES_CIRCLE_LAYER: Omit<CircleLayerSpecification, "source"> = {
  id: "series-circle",
  type: "circle",
  paint: {
    "circle-radius": 6,
    "circle-color": "#1f5673",
  },
};

/** 現在窓と重なる事物 1 件の id と、重なりから求めた濃さ（0 を超え 1 以下）。 */
type LocusFade = {
  id: string;
  fade: number;
};

/**
 * `loci` のうち `currentWindow` と重なる事物について、id と濃さを返す。
 * 濃さが 0 の事物は含めない。
 */
function fadesOf(
  currentWindow: CurrentWindow,
  loci: MapLocusCollection,
): LocusFade[] {
  return loci.features
    .map((locus) => ({
      id: locus.properties.id,
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
 * `fades` の濃さを事物の `id` で選ぶ式を返す。
 * `fades` が空なら 0 を返す。
 *
 * MapLibre の `match` は入力と既定値の間に 1 組以上の「値と出力」を要求するので、空の `fades` から `match` を組むと式が不正になる。
 */
function fadeByLocusId(fades: LocusFade[]): ExpressionSpecification | number {
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
): Omit<CircleLayerSpecification, "source"> {
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
