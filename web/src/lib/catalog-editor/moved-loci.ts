/**
 * 変更前と変更後の事物の全件を比べ、座標が変わった事物を列挙する純関数を置く。
 * 例えば変更前の `sparta-city` が `[22.43, 37.07]` で変更後が `[22.5, 37.1]` なら、`{ id: "sparta-city", before: [22.43, 37.07], after: [22.5, 37.1] }` を返す。
 */

import type { LocusCollection } from "@/lib/schema/locus";

/** 座標が変わった事物 1 件の、変更前と変更後の `[経度, 緯度]`。 */
export type MovedLocus = {
  id: string;
  before: [number, number];
  after: [number, number];
};

/**
 * 変更後の全件（`current`）のうち、変更前の全件（`before`）と `id` が一致して座標が違う事物を、`current` の並び順で返す。
 * 変わった事物が無ければ空配列を返す。
 *
 * 変更前の全件に無い事物は、変更前の座標を持たないので返さない。
 */
export function listMovedLoci(
  before: LocusCollection,
  current: LocusCollection,
): MovedLocus[] {
  const beforeById = new Map(
    before.features.map((feature) => [
      feature.properties.id,
      feature.geometry.coordinates,
    ]),
  );

  return current.features.flatMap((feature) => {
    const id = feature.properties.id;
    const previous = beforeById.get(id);
    const after = feature.geometry.coordinates;

    if (
      previous === undefined ||
      (previous[0] === after[0] && previous[1] === after[1])
    ) {
      return [];
    }

    return [{ id, before: previous, after }];
  });
}
