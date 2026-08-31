/**
 * コテンラジオの 1 シリーズのスキーマ。
 * 地図が読む GeoJSON FeatureCollection の形を、実行時に検査できるかたちで持つ。
 *
 * 年は西暦の整数で、負値が紀元前を表す（0 年は暦に存在しないが、区別しても得るものが無いので許す）。
 * geometry の形そのものは `geojson.ts` が持つ。
 * zod の既定は未知のキーを黙って捨て、手書きの書き間違いや規約外の欄の混入がどこにも映らないので、スキーマに無いキーは落とす。
 *
 * 描画も RSS 同期もこの形だけを前提にしてよい。
 * 渡された値を検査するだけで `data/` の在り処は呼ぶ側が知るので、ファイルの読み込み口はここが持たない。
 * 入口は parseSeries。
 */

import * as z from "zod";
import { duplicatesOf } from "@/lib/duplicates";
import { geometrySchema } from "@/lib/schema/geojson";
import { linksSchema } from "@/lib/schema/link";
import { trimmedNonEmptyStringSchema } from "@/lib/schema/text";

/**
 * 描画スタイルの分岐キー。
 * 図形の違いは `geometry.type` が表すので、ここは場所が一意に決まるかどうかだけを分ける（docs/adr/0023-kind-place-or-concept.md）。
 */
export const seriesKindSchema = z.enum(["place", "concept"]);

/**
 * シリーズが扱う年代の範囲。
 * 負値は紀元前を指す。
 */
export const seriesTimeRangeSchema = z
  .strictObject({
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
 * シリーズ 1 件が持つ属性。
 * 地図の描画・一覧パネル・詳細カード・RSS 同期の全部がここを読む。
 */
export const seriesPropertiesSchema = z.strictObject({
  /** エピソードの `seriesId` が指す先。 */
  id: trimmedNonEmptyStringSchema,

  /**
   * シリーズ名。
   * 番組から引いてよいのは題号までなので、説明文をここへ入れない（docs/adr/0008-quote-titles-only.md）。
   */
  title: trimmedNonEmptyStringSchema,

  /**
   * 描画スタイルの分岐キー。
   * `concept` は場所が一意に決まらないもので、控えめに描く（docs/adr/0023-kind-place-or-concept.md）。
   */
  kind: seriesKindSchema,

  /**
   * シリーズが扱う年代の範囲。
   * era スライダーの現在窓との重なり率（0..1）をイージングに通した値が、表示 opacity になる。
   */
  timeRange: seriesTimeRangeSchema,

  /**
   * 自前で書く要約。
   * 番組の説明文を引かない代わりに置いた欄なので、書かれるまでは空である（docs/adr/0008-quote-titles-only.md）。
   */
  summary: z.string(),

  /**
   * 大まかな地域名。
   * `tags` と並べて、近接の判定（関連シリーズ行）が読む。
   */
  region: trimmedNonEmptyStringSchema,

  /**
   * 割当キーになる `itunes:season` の値（docs/adr/0018-season-as-assignment-key.md）。
   * 1 シリーズ = 1 値で、複数を束ねない。
   */
  season: z.int().positive(),

  /**
   * 配信ページへの導線。
   * 配信側にシリーズ単位のページが無いので、指す先は未決定である（当面は空）。
   */
  links: linksSchema,

  /**
   * 主題のラベル。
   * 主題の近さは地図にも era スライダーにも現れないので、これだけが表す。
   */
  tags: z.array(trimmedNonEmptyStringSchema),
});

/** シリーズ 1 件。 */
export const seriesFeatureSchema = z.strictObject({
  /** GeoJSON が geometry と properties の対に要求する固定値。 */
  type: z.literal("Feature"),

  /**
   * 地図のどこに、どんな図形で置くか。
   * 使い分けは `ARCHITECTURE.md` §3 が持つ。
   */
  geometry: geometrySchema,

  properties: seriesPropertiesSchema,
});

/**
 * シリーズ全件。
 * MapLibre へそのまま渡せる GeoJSON FeatureCollection である。
 *
 * `id` と `season` の重複をここで落とす。
 * `id` はエピソードが指す先の鍵で、`season` は同期が組む season → seriesId の索引の鍵なので、どちらも重複すると引いた先が一つに定まらない。
 */
export const seriesCollectionSchema = z
  .strictObject({
    type: z.literal("FeatureCollection"),
    features: z.array(seriesFeatureSchema),
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
        message: `season が複数のシリーズに割り当てられている: ${season}`,
      });
    }
  });

export type Series = z.infer<typeof seriesFeatureSchema>;
export type SeriesCollection = z.infer<typeof seriesCollectionSchema>;

/**
 * シリーズ全件を検査して返す。
 * 合わなければ、どの要素のどこが合わないかを添えて投げる。
 */
export function parseSeries(input: unknown): SeriesCollection {
  const parsed = seriesCollectionSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      `series がスキーマに合わない\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}
