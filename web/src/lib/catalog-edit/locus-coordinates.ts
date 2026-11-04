/**
 * 事物の全件のうち 1 件の座標を書き換えた全件を作る純関数を置く。
 * 書き換えた後の全件の検査とファイルへの書き込みは持たず、`@/lib/catalog-dir` の保存の関数が持つ。
 *
 * 座標は小数第 3 位（約 100 m）で丸める。
 * 地図のドラッグが返す座標は 10 桁を超える小数で、そのまま書くと `catalog/loci.geojson` の差分の行が読めない。
 */

import type { LocusCollection } from "@/lib/schema/locus";
import type { LocusMove } from "@/lib/schema/locus-move";

/** 座標を丸める小数の桁数。 */
const COORDINATE_FRACTION_DIGITS = 3;

/** `value` を小数第 `COORDINATE_FRACTION_DIGITS` 位で丸める。 */
function roundCoordinate(value: number): number {
  const scale = 10 ** COORDINATE_FRACTION_DIGITS;

  return Math.round(value * scale) / scale;
}

/**
 * 事物の全件（`loci`）のうち `id` が `move.id` の事物の座標を `move.coordinates` に書き換えた、新しい全件を返す。
 * 該当する事物が無ければ undefined を返す。
 *
 * 書き換えるのは該当する事物の座標だけで、並び順と他の欄は `loci` のまま保つ。
 * 保存の差分を座標の 1 行に限るための保証である。
 */
export function updateLocusCoordinates(
  loci: LocusCollection,
  move: LocusMove,
): LocusCollection | undefined {
  if (!loci.features.some((feature) => feature.properties.id === move.id)) {
    return undefined;
  }

  const [longitude, latitude] = move.coordinates;
  const coordinates: [number, number] = [
    roundCoordinate(longitude),
    roundCoordinate(latitude),
  ];

  return {
    ...loci,
    features: loci.features.map((feature) =>
      feature.properties.id === move.id
        ? { ...feature, geometry: { ...feature.geometry, coordinates } }
        : feature,
    ),
  };
}
