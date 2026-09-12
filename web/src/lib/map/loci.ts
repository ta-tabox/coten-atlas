/**
 * 事物とシリーズを突き合わせて、地図の source へ渡す形を組む。
 *
 * 代表点の `timeRange` は `TIME_RANGE_OF_SERIES` のままなので、`seriesId` でシリーズを取得して年を写す（docs/adr/0027-series-and-loci.md）。
 * 写すのは properties だけで、geometry は触らない。
 * `catalog/` の形は動かさない（docs/adr/0024-map-feature-carries-key-only.md）。
 *
 * 年は `timeStart` / `timeEnd` の 2 欄へ潰して持つ。
 * MapLibre は GeoJSON source の properties から string と数値しか返さないので、平らにしておけば地図から読み戻す経路（S4 の opacity 制御）が後から生えても壊れない（同 ADR）。
 *
 * 位置なしのシリーズはここに現れない。
 * 事物を 1 件も持たないので、走査する側の判定が要らない（docs/adr/0026-two-phase-location.md）。
 */

import type { Locus, LocusCollection } from "@/lib/schema/locus";
import { TIME_RANGE_OF_SERIES } from "@/lib/schema/locus";
import {
  type Series,
  type SeriesList,
  TIME_RANGE_UNTIMED,
} from "@/lib/schema/series";

/**
 * 地図へ渡す事物 1 件の属性。
 * 鍵の 2 欄はそのまま運び、年の 2 欄は事物かシリーズの `timeRange` から写した値である。
 */
export type MapLocusProperties = {
  id: string;
  seriesId: string;
  timeStart: number;
  timeEnd: number;
};

/** 地図へ渡す事物 1 件。 */
export type MapLocusFeature = {
  type: "Feature";
  geometry: Locus["geometry"];
  properties: MapLocusProperties;
};

/** 地図へ渡す事物の全件。 */
export type MapLocusCollection = {
  type: "FeatureCollection";
  features: MapLocusFeature[];
};

/**
 * 事物 1 件へ、年を写す。
 * 事物の `timeRange` が `TIME_RANGE_OF_SERIES` なら、`seriesId` が指すシリーズの年を写す。
 *
 * 指す先が無いか、指す先のシリーズの `timeRange` が `TIME_RANGE_UNTIMED` で年を解決できなければ throw する。
 * 参照の壊れは `references.ts` が `pnpm test` で落とすので、ビルドまで残っていれば検査そのものが素通りしている。
 */
function toMapLocus(
  locus: Locus,
  seriesById: Map<string, Series>,
): MapLocusFeature {
  const { id, seriesId, timeRange } = locus.properties;
  const series = seriesById.get(seriesId);

  if (series === undefined) {
    throw new Error(`locus ${id}: seriesId ${seriesId} がどのシリーズにも無い`);
  }

  const years =
    timeRange === TIME_RANGE_OF_SERIES ? series.timeRange : timeRange;

  if (years === TIME_RANGE_UNTIMED) {
    throw new Error(
      `locus ${id}: シリーズ ${seriesId} は時期を持たないので、年を解決できない`,
    );
  }

  return {
    type: "Feature",
    geometry: locus.geometry,
    properties: {
      id,
      seriesId,
      timeStart: years.start,
      timeEnd: years.end,
    },
  };
}

/** 事物の全件を、地図の source へ渡す形へ直す。 */
export function toMapLoci(
  loci: LocusCollection,
  series: SeriesList,
): MapLocusCollection {
  const seriesById = new Map(series.map((one) => [one.id, one]));

  return {
    type: "FeatureCollection",
    features: loci.features.map((locus) => toMapLocus(locus, seriesById)),
  };
}
