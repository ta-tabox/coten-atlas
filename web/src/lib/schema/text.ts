/**
 * 前後の空白と空文字を拒否する、文字列の zod スキーマを置く。
 * 鍵や表示名に使う欄が `schema/` の複数のファイルにあり、どれも同じ制約を持つ。
 */

import * as z from "zod";

/**
 * 前後に空白を持つ文字列と空文字を拒否する zod スキーマ。
 * `trim()` で直して受けると、書かれた現物と検査済みの値が黙って食い違い、正規化の破れを検査で見つけられなくなるので、直さずに拒否する。
 */
export const trimmedNonEmptyStringSchema = z
  .string()
  .min(1)
  .refine((value) => value === value.trim(), {
    message: "前後に空白が付いている",
  });
