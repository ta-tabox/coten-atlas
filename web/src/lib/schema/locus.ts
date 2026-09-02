/**
 * 事物（`locus`、複数形 `loci`）のスキーマ。
 * `data/loci.geojson` の形を、実行時に検査できるかたちで持つ。
 * 事物とは、シリーズが地図の上に持つもののことである。
 *
 * シリーズと事物は 1 対多で、多の側にある `seriesId` が一の側を指す（docs/adr/0027-series-and-loci.md）。
 * どの事物が代表点かはシリーズ側の `anchor` が示すので、役割の欄は持たない。
 * 通す geometry は Point だけである（docs/adr/0026-two-phase-location.md）。
 *
 * 地図の source へ渡す形はここが組まない。
 * `kind` と、シリーズと一致する `timeRange` を写すのはビルド時の仕事で、`data/` の形は動かさない（docs/adr/0024-map-feature-carries-key-only.md）。
 *
 * 入口は parseLoci。
 */

import * as z from "zod";
import { duplicatesOf } from "@/lib/duplicates";
import { pointSchema } from "@/lib/schema/geojson";
import { ANCHOR_UNLOCATED, seriesTimeRangeSchema } from "@/lib/schema/series";
import { trimmedNonEmptyStringSchema } from "@/lib/schema/text";

/**
 * シリーズの `timeRange` と同じことを表す値。
 * 消費側がこの文字列を直に書かなくて済むよう、名前で配る。
 */
export const TIME_RANGE_OF_SERIES = "series";

/**
 * 事物を指す鍵。
 * 位置なしの印と同じ綴りを名乗ると、シリーズの `anchor` がその事物を指しているのか位置なしを宣言しているのかを読み分けられない。
 */
const locusIdSchema = trimmedNonEmptyStringSchema.refine(
  (id) => id !== ANCHOR_UNLOCATED,
  {
    message: `${ANCHOR_UNLOCATED} は位置なしの印なので、事物の id には使えない`,
  },
);

/**
 * 事物が扱う年代の範囲。
 * 年の閉区間か、シリーズの `timeRange` と同じことを表す `TIME_RANGE_OF_SERIES`。
 * 代表点はシリーズ全体を代表するので年を写さず、印の側を置く（この決まりは 2 つのファイルを並べないと見えないので、`references.ts` が見る）。
 */
const locusTimeRangeSchema = z.union([
  seriesTimeRangeSchema,
  z.literal(TIME_RANGE_OF_SERIES),
]);

/** 事物 1 件が持つ属性。 */
export const locusPropertiesSchema = z.strictObject({
  /** 事物間で一意な鍵。 */
  id: locusIdSchema,

  /**
   * この事物を持つシリーズの id。
   * シリーズと事物の紐づけはこの欄だけが担う。
   */
  seriesId: trimmedNonEmptyStringSchema,

  /** この事物が扱う年代の範囲。 */
  timeRange: locusTimeRangeSchema,
});

/** 事物 1 件。 */
export const locusFeatureSchema = z.strictObject({
  /** GeoJSON が geometry と properties の対に要求する固定値。 */
  type: z.literal("Feature"),

  /** 地図のどこに置くか。 */
  geometry: pointSchema,

  properties: locusPropertiesSchema,
});

/**
 * 事物の全件。
 * MapLibre へ渡す source の元になる GeoJSON FeatureCollection である。
 *
 * `id` の重複をここで落とす。
 * シリーズの `anchor` が指す先の鍵なので、重複すると引いた先が一つに定まらない。
 */
export const locusCollectionSchema = z
  .strictObject({
    type: z.literal("FeatureCollection"),
    features: z.array(locusFeatureSchema),
  })
  .superRefine((collection, ctx) => {
    const ids = collection.features.map((feature) => feature.properties.id);

    for (const id of duplicatesOf(ids)) {
      ctx.addIssue({ code: "custom", message: `id が重複している: ${id}` });
    }
  });

export type Locus = z.infer<typeof locusFeatureSchema>;
export type LocusCollection = z.infer<typeof locusCollectionSchema>;
export type LocusTimeRange = z.infer<typeof locusTimeRangeSchema>;

/**
 * 事物の全件を検査して返す。
 * 合わなければ、どの要素のどこが合わないかを添えて投げる。
 */
export function parseLoci(input: unknown): LocusCollection {
  const parsed = locusCollectionSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      `loci がスキーマに合わない\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}
