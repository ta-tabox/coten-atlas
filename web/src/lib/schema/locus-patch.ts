/**
 * 管理画面が事物 1 件の欄の一部を書き換える要求のスキーマを置く。
 * 書き換えた後の全件の検査は持たず、`@/lib/catalog-dir` の保存の関数が `parseLoci` と参照の検査に通す。
 *
 * 例えば `{ id: "hagi", coordinates: [131.4, 34.41] }` は、事物 `hagi` の座標だけを書き換える。
 * 入口は parseLocusPatch。
 */

import * as z from "zod";
import { pointSchema } from "@/lib/schema/geojson";
import { trimmedNonEmptyStringSchema } from "@/lib/schema/text";

/** 事物 1 件の欄の一部を書き換える要求。 */
export const locusPatchSchema = z.strictObject({
  /** 書き換える事物の `id`。 */
  id: trimmedNonEmptyStringSchema,

  /** 書き換えた後の `[経度, 緯度]`。 */
  coordinates: pointSchema.shape.coordinates,
});

export type LocusPatch = z.infer<typeof locusPatchSchema>;

/**
 * 事物 1 件を書き換える要求を検査して返す。
 * 合わなければ、どこが合わないかを添えて throw する。
 */
export function parseLocusPatch(input: unknown): LocusPatch {
  const parsed = locusPatchSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      `事物を書き換える要求がスキーマに合わない\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}
