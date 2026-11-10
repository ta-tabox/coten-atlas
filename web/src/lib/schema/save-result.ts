/**
 * 管理画面の API が返す、保存の結果のスキーマを置く。
 *
 * 入口は parseSaveResult。
 */

import * as z from "zod";

/**
 * 保存の結果。
 * `problems` は保存しなかった理由の文の配列で、保存したときは空である。
 */
export const saveResultSchema = z.strictObject({
  problems: z.array(z.string()),
});

export type SaveResult = z.infer<typeof saveResultSchema>;

/**
 * 管理画面の API の応答を、保存の結果として検査して返す。
 * 合わなければ、どこが合わないかを添えて throw する。
 */
export function parseSaveResult(input: unknown): SaveResult {
  const parsed = saveResultSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      `管理画面の API の応答がスキーマに合わない\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}
