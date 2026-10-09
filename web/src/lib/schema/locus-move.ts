/**
 * 管理画面が保存の API へ送る、事物 1 件の座標を書き換える要求のスキーマを置く。
 * 書き換えた後の全件の検査は持たず、`@/lib/catalog-dir` の保存の関数が `parseLoci` と参照の検査に通す。
 *
 * 入口は parseLocusMove。
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
