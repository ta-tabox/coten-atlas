/**
 * テーマ（＝コテンラジオの 1 シリーズ）の契約。
 * 地図が読む GeoJSON FeatureCollection の形を、実行時に検査できるかたちで持つ。
 *
 * 座標の順は GeoJSON の規定どおり `[経度, 緯度]` で、緯度が先の並びは検査で落ちる。
 * 年は西暦の整数で、負値が紀元前を表す（0 年は暦に存在しないが、区別しても得るものが無いので許す）。
 *
 * 描画も RSS 同期もこの形だけを前提にしてよい。
 * 渡された値を検査するだけで `data/` の在り処は呼ぶ側が知るので、ファイルの読み込み口はここが持たない。
 * 入口は parseThemes。
 */

import * as z from "zod";
import { duplicatesOf } from "@/lib/schema/duplicates";
import { linksSchema } from "@/lib/schema/link";

/**
 * 描画スタイルの分岐キー。
 * `concept`（概念史）は場所が一意に決まらないものを控えめに描くための区分である。
 */
export const themeKindSchema = z.enum(["point", "polygon", "line", "concept"]);

/**
 * テーマが扱う年代の範囲。
 * 負値は紀元前を指す。
 */
export const timeRangeSchema = z
  .object({
    start: z.int(),
    end: z.int(),
  })
  .superRefine((range, ctx) => {
    if (range.start > range.end) {
      ctx.addIssue({
        code: "custom",
        message: `timeRange が逆転している（start=${range.start} > end=${range.end}）`,
      });
    }
  });

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
 * テーマが取りうる形。
 * 都市国家は Point、帝国や文明圏は Polygon、遠征や航海は LineString、場所が散る概念史は MultiPoint を使う。
 */
const geometrySchema = z.discriminatedUnion("type", [
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

/**
 * テーマ 1 件が持つ属性。
 *
 * `season` が割当キーで、`itunes:season` の値を持つ（docs/adr/0018-season-as-assignment-key.md）。
 * 1 テーマ = 1 シリーズ = `itunes:season` の 1 値で、束ねない。
 * `ROADMAP.md` の完了判定がシリーズ数を数えて全件がここに在るかを見るので、束ねると feature 数とシリーズ数が一致しなくなる。
 *
 * `summary` は自前の要約を入れる欄で、番組の説明文は引かないので当面は空である（docs/adr/0008-quote-titles-only.md）。
 */
export const themePropertiesSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  kind: themeKindSchema,
  timeRange: timeRangeSchema,
  summary: z.string(),
  region: z.string().trim().min(1),
  season: z.int().positive(),
  links: linksSchema,
  tags: z.array(z.string().trim().min(1)),
});

/** テーマ 1 件。 */
export const themeFeatureSchema = z.object({
  type: z.literal("Feature"),
  geometry: geometrySchema,
  properties: themePropertiesSchema,
});

/**
 * テーマ全件。
 * MapLibre へそのまま渡せる GeoJSON FeatureCollection である。
 *
 * `id` と `season` の重複をここで落とす。
 * `id` はエピソードが指す先の鍵で、`season` は同期が組む season → themeId の索引の鍵なので、どちらも重複すると引いた先が一つに定まらない。
 */
export const themeCollectionSchema = z
  .object({
    type: z.literal("FeatureCollection"),
    features: z.array(themeFeatureSchema),
  })
  .superRefine((collection, ctx) => {
    const properties = collection.features.map((feature) => feature.properties);

    for (const id of duplicatesOf(properties.map((property) => property.id))) {
      ctx.addIssue({ code: "custom", message: `id が重複している: ${id}` });
    }

    const seasons = properties.map((property) => property.season);

    for (const season of duplicatesOf(seasons)) {
      ctx.addIssue({
        code: "custom",
        message: `season が複数のテーマに割り当てられている: ${season}`,
      });
    }
  });

export type ThemeKind = z.infer<typeof themeKindSchema>;
export type TimeRange = z.infer<typeof timeRangeSchema>;
export type Theme = z.infer<typeof themeFeatureSchema>;
export type ThemeCollection = z.infer<typeof themeCollectionSchema>;

/**
 * テーマ全件を検査して返す。
 * 合わなければ、どの要素のどこが合わないかを添えて投げる。
 */
export function parseThemes(input: unknown): ThemeCollection {
  const parsed = themeCollectionSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      `themes がスキーマに合わない\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}
