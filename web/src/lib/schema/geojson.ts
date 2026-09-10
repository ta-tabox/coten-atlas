/**
 * GeoJSON の geometry の形。
 * 5 種を仕様（RFC 7946）から手で写したもの（ライブラリの型は引いていない）。
 *
 * 座標の順は GeoJSON の規定どおり `[経度, 緯度]` で、緯度が先の並びは検査で落ちる。
 * 仕様は列挙に無いメンバー（foreign members）を許すが、`catalog/` のデータでは書き間違いの検出を優先し、スキーマに無いメンバーは落とす。
 *
 * ここが持つのは外部仕様の写しだけである。
 * `catalog/` のデータがどの図形を通すかという判断は持たない。
 * それは `catalog/` の形を決めるスキーマの側にあり、変わる理由もそちらにしか無い。
 */

import * as z from "zod";

const longitudeSchema = z
  .number()
  .min(-180, { message: "経度が -180..180 の外にある" })
  .max(180, { message: "経度が -180..180 の外にある" });

const latitudeSchema = z
  .number()
  .min(-90, { message: "緯度が -90..90 の外にある" })
  .max(90, { message: "緯度が -90..90 の外にある" });

/**
 * 経度・緯度の対。
 * 経度が先なのは GeoJSON の規定で、入れ替えた座標は範囲の検査で落ちる。
 * ただし入れ替えても両方が範囲に収まる土地（緯度・経度とも ±90 の内側）はすり抜けるので、目視の代わりにはならない。
 */
const positionSchema = z.tuple([longitudeSchema, latitudeSchema]);

/**
 * 環が閉じているか。
 * Polygon は環の最初と最後の座標が一致することを要求する。
 * 手前の `min(4, { abort: true })` が短い環を止めるので、空の配列はここへ来ない。
 */
function isClosedRing(ring: readonly (readonly [number, number])[]): boolean {
  const first = ring[0];
  const last = ring[ring.length - 1];

  return first[0] === last[0] && first[1] === last[1];
}

/** 閉じた環 1 本。 */
const ringSchema = z
  .array(positionSchema)
  .min(4, { abort: true })
  .refine(isClosedRing, { message: "多角形の環が閉じていない" });

/** 1 地点。 */
export const pointSchema = z.strictObject({
  type: z.literal("Point"),
  coordinates: positionSchema,
});

/** 散らばった複数の地点。 */
const multiPointSchema = z.strictObject({
  type: z.literal("MultiPoint"),
  coordinates: z.array(positionSchema).min(1),
});

/** 順に繋いだ経路。 */
const lineStringSchema = z.strictObject({
  type: z.literal("LineString"),
  coordinates: z.array(positionSchema).min(2),
});

/**
 * 環で囲んだ面。
 * 最初の環が外周で、2 つ目以降は穴を表す。
 */
const polygonSchema = z.strictObject({
  type: z.literal("Polygon"),
  coordinates: z.array(ringSchema).min(1),
});

/**
 * 飛び地のある面。
 * 要素の一つずつが Polygon と同じ環の列で、外周と穴の並びも同じ。
 */
const multiPolygonSchema = z.strictObject({
  type: z.literal("MultiPolygon"),
  coordinates: z.array(z.array(ringSchema).min(1)).min(1),
});

/**
 * 図形の種類と座標の対。
 * 5 種のうちどれを使うかは、置く対象の性質を知っている側が決める。
 */
export const geometrySchema = z.discriminatedUnion("type", [
  pointSchema,
  multiPointSchema,
  lineStringSchema,
  polygonSchema,
  multiPolygonSchema,
]);
