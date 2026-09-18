/**
 * 配信フィードの season を回ごとに訂正する表のスキーマを置く。
 * 訂正した season を割当にどう使うかは持たず、`src/lib/feed/assign.ts` が持つ。
 *
 * 訂正表は人間が書く手動層で、`catalog/season-corrections.json` の形を持つ。
 * 題名の `【NN-M】` と `itunes:season` から正しい season が決まらない回と、両者の食い違いを人間が確かめた回を、guid で名指して書く。
 * zod の既定は未知のキーを黙って捨て、手書きの書き間違いがどこにも映らないので、スキーマに無いキーを拒否する。
 *
 * 入口は parseSeasonCorrections。
 */

import * as z from "zod";
import { duplicatesOf } from "@/lib/schema/duplicates";
import { trimmedNonEmptyStringSchema } from "@/lib/schema/text";

/** 訂正表の 1 行。 */
export const seasonCorrectionSchema = z.strictObject({
  /**
   * 訂正する回の RSS の `<guid>`。
   * 同期は trim した guid で突き合わせるので、前後に空白を付けて書くと、どの回にも当たらない。
   */
  guid: trimmedNonEmptyStringSchema,

  /**
   * 割当に使う season。
   * null は、その回をどのシリーズにも割り当てないことを表す。
   */
  season: z.int().positive().nullable(),

  /** なぜ訂正するかの 1 文。 */
  reason: trimmedNonEmptyStringSchema,
});

/**
 * 訂正表の全行。
 *
 * 同じ guid の行が二つあると、どちらの season で割り当てるかが決まらないので、`guid` の重複を拒否する。
 */
export const seasonCorrectionListSchema = z
  .array(seasonCorrectionSchema)
  .superRefine((corrections, ctx) => {
    const guids = corrections.map((correction) => correction.guid);

    for (const guid of duplicatesOf(guids)) {
      ctx.addIssue({ code: "custom", message: `guid が重複している: ${guid}` });
    }
  });

export type SeasonCorrection = z.infer<typeof seasonCorrectionSchema>;
export type SeasonCorrectionList = z.infer<typeof seasonCorrectionListSchema>;

/**
 * 訂正表の全行を検査して返す。
 * 合わなければ、どの行のどこが合わないかを添えて throw する。
 */
export function parseSeasonCorrections(input: unknown): SeasonCorrectionList {
  const parsed = seasonCorrectionListSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      `season の訂正表がスキーマに合わない\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}
