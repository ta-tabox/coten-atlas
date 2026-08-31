/**
 * コテンラジオの 1 シリーズのスキーマ。
 * 地図が読む GeoJSON FeatureCollection の形を、実行時に検査できるかたちで持つ。
 *
 * 年は西暦の整数で、負値が紀元前を表す（0 年は暦に存在しないが、区別しても得るものが無いので許す）。
 * geometry の形そのものは `geojson.ts` が持つ。
 *
 * 描画も RSS 同期もこの形だけを前提にしてよい。
 * 渡された値を検査するだけで `data/` の在り処は呼ぶ側が知るので、ファイルの読み込み口はここが持たない。
 * 入口は parseSeries。
 */

import * as z from "zod";
import { duplicatesOf } from "@/lib/duplicates";
import { geometrySchema } from "@/lib/schema/geojson";
import { linksSchema } from "@/lib/schema/link";

/**
 * 描画スタイルの分岐キー。
 * `concept`（概念史）は場所が一意に決まらないものを控えめに描くための区分である。
 */
export const seriesKindSchema = z.enum(["point", "polygon", "line", "concept"]);

/**
 * シリーズが扱う年代の範囲。
 * 負値は紀元前を指す。
 */
export const seriesTimeRangeSchema = z
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
 * シリーズ 1 件が持つ属性。
 * 地図の描画・一覧パネル・詳細カード・RSS 同期の全部がここを読む。
 */
export const seriesPropertiesSchema = z.object({
  /** エピソードの `seriesId` が指す先。 */
  id: z.string().trim().min(1),

  /** 番組から引いてよいのは題号まで（docs/adr/0008-quote-titles-only.md）。 */
  title: z.string().trim().min(1),

  /**
   * 描画スタイルの分岐キー。
   * `geometry.type` とは独立に持つ（縛り方は #4 が決める）。
   */
  kind: seriesKindSchema,

  /** era スライダーの現在窓との重なり率が、そのまま表示 opacity になる。 */
  timeRange: seriesTimeRangeSchema,

  /** 番組の説明文は引かないので、当面は空である（docs/adr/0008-quote-titles-only.md）。 */
  summary: z.string(),

  /** `tags` と並べて、近接の判定（関連シリーズ行）が読む。 */
  region: z.string().trim().min(1),

  /**
   * 割当キーになる `itunes:season` の値（docs/adr/0018-season-as-assignment-key.md）。
   * 1 シリーズ = 1 値で、複数を束ねない。
   */
  season: z.int().positive(),

  /** 配信側にシリーズ単位のページが無いので、指す先は未決定（当面は空）。 */
  links: linksSchema,

  /**
   * 主題の近さを表す唯一の欄。
   * 関連シリーズ行と tag 絞り込みが読む。
   */
  tags: z.array(z.string().trim().min(1)),
});

/** シリーズ 1 件。 */
export const seriesFeatureSchema = z.object({
  /** GeoJSON が geometry と properties の対に要求する固定値。 */
  type: z.literal("Feature"),

  /** 図形の使い分けは `ARCHITECTURE.md` §3 が持つ。 */
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
  .object({
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
