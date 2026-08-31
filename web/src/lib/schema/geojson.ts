/**
 * GeoJSON の geometry の形。
 * この器が使う 4 種を、仕様（RFC 7946）から手で写したもの（ライブラリの型は引いていない）。
 *
 * 座標の順は GeoJSON の規定どおり `[経度, 緯度]` で、緯度が先の並びは検査で落ちる。
 *
 * ここが持つのは外部仕様の写しだけである。
 * どのシリーズをどの図形で置くかという判断は持たない。
 * それは `series.ts` の `kind` と `geometry` の側にあり、変わる理由もそちらにしか無い。
 */

import * as z from "zod";

/**
 * 経度・緯度の対。
 *
 * 範囲を検査するのは、緯度と経度を入れ替えた座標を落とすため。
 * 入れ替えても両方が範囲に収まる土地（緯度・経度とも ±90 の内側）はこれをすり抜けるので、目視の代わりにはならない。
 */
const positionSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
]);

/**
 * 多角形の環が閉じているか。
 * GeoJSON は最初と最後の座標が一致することを要求する。
 *
 * 長さが 4 以上あることを前提にしてよい。
 * 手前の `min(4)` が `abort: true` を持つので、足りない環はここへ来ない。
 * 外すと空の環で添字が undefined になり、safeParse が結果を返さずに投げる。
 */
function isClosedRing(ring: readonly (readonly [number, number])[]): boolean {
  const first = ring[0];
  const last = ring[ring.length - 1];

  return first[0] === last[0] && first[1] === last[1];
}

/**
 * 図形の種類と座標の対。
 * 4 種のうちどれを使うかは、置く対象の性質を知っている側が決める。
 */
export const geometrySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("Point"),
    coordinates: positionSchema,
  }),
  z.object({
    type: z.literal("MultiPoint"),
    coordinates: z.array(positionSchema).min(1),
  }),
  z.object({
    type: z.literal("LineString"),
    coordinates: z.array(positionSchema).min(2),
  }),
  z.object({
    type: z.literal("Polygon"),
    coordinates: z
      .array(
        z
          .array(positionSchema)
          .min(4, { abort: true })
          .refine(isClosedRing, { message: "多角形の環が閉じていない" }),
      )
      .min(1),
  }),
]);
