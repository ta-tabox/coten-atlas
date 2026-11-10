/**
 * 管理画面のブラウザから、管理画面の API を呼ぶ関数を置く。
 * API の本体は `src/app/admin/api/` の下にあり、`next dev` でだけ立つ。
 */

import { BASE_PATH } from "@/lib/base-path";
import type { LocusPatch } from "@/lib/schema/locus-patch";
import { parseSaveResult } from "@/lib/schema/save-result";

/**
 * 事物を書き換える API の URL。
 * パスは `src/app/admin/api/loci/route.dev.ts` の置き場から決まるので、置き場を動かしたらここも直す。
 */
const LOCI_API_URL = `${BASE_PATH}/admin/api/loci`;

/**
 * 事物 1 件を書き換える要求（`patch`）を API へ送り、保存しなかった理由の文の配列を返す。
 * 保存したときは空配列を返す。
 *
 * API へ届かないか応答の形が違うときも throw せず、その旨を理由の文にして返す。
 * 管理画面は理由をそのまま画面に出すので、失敗の形を一つにしておく。
 */
export async function patchLocus(patch: LocusPatch): Promise<string[]> {
  try {
    const response = await fetch(LOCI_API_URL, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const body: unknown = await response.json();

    return parseSaveResult(body).problems;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);

    return [`管理画面の API を呼べなかった（${LOCI_API_URL}）: ${message}`];
  }
}
