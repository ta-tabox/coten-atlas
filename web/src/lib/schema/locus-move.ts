/**
 * 管理画面と保存の API が受け渡す、事物 1 件の座標を書き換える要求と、その応答のスキーマを置く。
 * 書き換えた後の全件の検査は持たず、`@/lib/catalog-dir` の保存の関数が `parseLoci` と参照の検査に通す。
 *
 * 入口は parseLocusMove（API が要求を検査する）と parseLocusMoveResult（管理画面が応答を検査する）。
 */

import * as z from "zod";
import { pointSchema } from "@/lib/schema/geojson";
import { trimmedNonEmptyStringSchema } from "@/lib/schema/text";

/** 事物 1 件の座標を書き換える要求。 */
export const locusMoveSchema = z.strictObject({
  /** 書き換える事物の `id`。 */
  id: trimmedNonEmptyStringSchema,

  /** 書き換えた後の `[経度, 緯度]`。 */
  coordinates: pointSchema.shape.coordinates,
});

export type LocusMove = z.infer<typeof locusMoveSchema>;

/**
 * 座標を書き換える要求を検査して返す。
 * 合わなければ、どこが合わないかを添えて throw する。
 */
export function parseLocusMove(input: unknown): LocusMove {
  const parsed = locusMoveSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      `座標を書き換える要求がスキーマに合わない\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}

/**
 * 保存の API の応答。
 * `problems` は保存しなかった理由の文の配列で、保存したときは空である。
 */
export const locusMoveResultSchema = z.strictObject({
  problems: z.array(z.string()),
});

export type LocusMoveResult = z.infer<typeof locusMoveResultSchema>;

/**
 * 保存の API の応答を検査して返す。
 * 合わなければ、どこが合わないかを添えて throw する。
 */
export function parseLocusMoveResult(input: unknown): LocusMoveResult {
  const parsed = locusMoveResultSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      `保存の API の応答がスキーマに合わない\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}
