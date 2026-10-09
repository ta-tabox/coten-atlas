/**
 * シリーズを描くレイヤの定義。
 *
 * 第一段階の geometry は Point だけなので、レイヤは代表点の circle と、選択中のシリーズを囲む circle と、選択中のシリーズと同時代のシリーズを縁取る circle の 3 本で足りる。
 * `['geometry-type']` で図形を分ける枝は第二段階まで無い。
 *
 * 不透明度は、era スライダーの現在窓から求めた事物ごとの濃さだけで決まり、シリーズの属性で濃さを変えない。
 * 事物ごとの濃さは `@/lib/era/window` の関数で求めて式へ数値で埋め込み、同じ計算を MapLibre の式で書き直さない。
 * 書き直さない理由は docs/adr/20260911-era-fade-window-only.md が持つ。
 *
 * 色は MapLibre のスタイル式が読むので、Tailwind のトークンでなく生の値を置く。
 * 地図の中で閉じる指定であって、overlay の見た目とは別物である。
 */

import type { ExpressionSpecification } from "maplibre-gl";
import type { CircleLayerSpecification } from "react-map-gl/maplibre";
import {
  type CurrentWindow,
  fadeOpacity,
  overlapRatio,
} from "@/lib/era/window";
import type { MapLocusCollection } from "@/lib/map/loci";
import {
  type Series,
  type SeriesTimeRange,
  TIME_RANGE_UNTIMED,
} from "@/lib/schema/series";

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

/**
 * 選択中のシリーズの事物を囲む輪のレイヤ。
 * `source` は `SERIES_CIRCLE_LAYER` と同じ理由で持たない。
 *
 * 塗りを持たず縁だけを描くので、`SERIES_CIRCLE_LAYER` の円の不透明度を変えずに上へ重ねられる。
 * 描く事物を絞る `filter` は `selectedSeriesRingLayerIn` が設定する。
 * 縁の色は、`SeriesPanel` が選択中のシリーズのボタンに付ける左の太線の色（Tailwind の `orange-700`）と同じ値にする。
 */
export const SELECTED_SERIES_RING_LAYER: Omit<
  CircleLayerSpecification,
  "source"
> = {
  id: "series-selected-ring",
  type: "circle",
  paint: {
    "circle-radius": 10,
    "circle-opacity": 0,
    "circle-stroke-width": 3,
    "circle-stroke-color": "#c2410c",
  },
};

/**
 * 選択中のシリーズと年が重なるシリーズの事物を縁取るレイヤ。
 * `source` は `SERIES_CIRCLE_LAYER` と同じ理由で持たない。
 *
 * 強調を `circle-opacity` でなく縁（`circle-stroke-*`）で表すので、現在窓から求めた円の濃さは変わらず、薄く残る円は薄いまま縁だけが付く。
 * 半径を `SERIES_CIRCLE_LAYER` の円と同じにして、円の輪郭をなぞる。
 * 描く事物を絞る `filter` は `contemporarySeriesRingLayerIn` が設定する。
 * 縁の色は、`SELECTED_SERIES_RING_LAYER` の縁と同じ色相で明るい Tailwind の `orange-400` にする。
 */
export const CONTEMPORARY_SERIES_RING_LAYER: Omit<
  CircleLayerSpecification,
  "source"
> = {
  id: "series-contemporary-ring",
  type: "circle",
  paint: {
    "circle-radius": 6,
    "circle-opacity": 0,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#fb923c",
  },
};

/** 現在窓と重なる事物 1 件の id・シリーズの id と、重なりから求めた濃さ（0 を超え 1 以下）。 */
type LocusFade = {
  id: string;
  seriesId: string;
  fade: number;
};

/**
 * `loci` のうち `currentWindow` と重なる事物について、id・シリーズの id・濃さを返す。
 * 濃さが 0 の事物は含めない。
 */
function fadesOf(
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

/**
 * `SELECTED_SERIES_RING_LAYER` に、`selectedSeriesId` のシリーズの事物のうち `currentWindow` と重なるものだけを描く `filter` を設定したレイヤを返す。
 * `selectedSeriesId` が null なら、どの事物も描かない `filter` を設定する。
 *
 * 窓と重ならない事物に輪を描くと、`seriesCircleLayerIn` が除いた円の在り処だけが地図に残る。
 */
export function selectedSeriesRingLayerIn({
  currentWindow,
  loci,
  selectedSeriesId,
}: {
  currentWindow: CurrentWindow;
  loci: MapLocusCollection;
  selectedSeriesId: string | null;
}): Omit<CircleLayerSpecification, "source"> {
  const ringLocusIds = fadesOf(currentWindow, loci)
    .filter(({ seriesId }) => seriesId === selectedSeriesId)
    .map(({ id }) => id);

  return {
    ...SELECTED_SERIES_RING_LAYER,
    filter: ["in", ["get", "id"], ["literal", ringLocusIds]],
  };
}

/**
 * `CONTEMPORARY_SERIES_RING_LAYER` に、`selectedSeries` と年が重なる他のシリーズの事物のうち `currentWindow` と重なるものだけを描く `filter` を設定したレイヤを返す。
 * `selectedSeries` が null か、`timeRange` が `TIME_RANGE_UNTIMED` なら、どの事物も描かない `filter` を設定する。
 *
 * 年の重なりは、`selectedSeries` の `timeRange` と事物の `timeStart` / `timeEnd` を、両端を含む閉区間どうしとして比べる。
 * 現在窓は重なりの判定に使わず、`selectedSeriesRingLayerIn` と同じ理由で描く事物を絞るためだけに使う。
 * `selectedSeries` 自身の事物は `SELECTED_SERIES_RING_LAYER` が囲むので含めない。
 */
export function contemporarySeriesRingLayerIn({
  currentWindow,
  loci,
  selectedSeries,
}: {
  currentWindow: CurrentWindow;
  loci: MapLocusCollection;
  selectedSeries: Series | null;
}): Omit<CircleLayerSpecification, "source"> {
  const ringLocusIds =
    selectedSeries === null || selectedSeries.timeRange === TIME_RANGE_UNTIMED
      ? []
      : contemporaryLocusIdsOf({
          currentWindow,
          loci,
          seriesId: selectedSeries.id,
          timeRange: selectedSeries.timeRange,
        });

  return {
    ...CONTEMPORARY_SERIES_RING_LAYER,
    filter: ["in", ["get", "id"], ["literal", ringLocusIds]],
  };
}

/**
 * `loci` のうち、`seriesId` 以外のシリーズの事物で、年が `timeRange` と重なり、かつ `currentWindow` と重なるものの id を返す。
 */
function contemporaryLocusIdsOf({
  currentWindow,
  loci,
  seriesId,
  timeRange,
}: {
  currentWindow: CurrentWindow;
  loci: MapLocusCollection;
  seriesId: string;
  timeRange: SeriesTimeRange;
}): string[] {
  const idsOnMap = new Set(fadesOf(currentWindow, loci).map(({ id }) => id));

  return loci.features
    .map(({ properties }) => properties)
    .filter(
      (locus) =>
        idsOnMap.has(locus.id) &&
        locus.seriesId !== seriesId &&
        locus.timeStart <= timeRange.end &&
        timeRange.start <= locus.timeEnd,
    )
    .map(({ id }) => id);
}
