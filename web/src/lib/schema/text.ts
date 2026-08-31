/**
 * スキーマ共通の文字列の形。
 * 鍵や表示名に使う欄が `schema/` の 3 ファイルにあり、どれも同じ制約を持つ。
 */

import * as z from "zod";

/**
 * 前後に空白が無く、空でもない文字列。
 * `trim()` で直して受けると、書かれた現物と検査済みの値が黙って食い違い、正規化の破れを検査で見つけられなくなるので、直さずに落とす。
 */
export const trimmedNonEmptyStringSchema = z
  .string()
  .min(1)
  .refine((value) => value === value.trim(), {
    message: "前後に空白が付いている",
  });
