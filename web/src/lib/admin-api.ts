/**
 * 管理画面のブラウザから保存の API を呼ぶ関数を置く。
 * API の本体は `src/app/admin/api/loci/route.dev.ts` で、`next dev` でだけ立つ。
 */

import { BASE_PATH } from "@/lib/base-path";
import type { LocusMove } from "@/lib/schema/locus-move";
import { parseLocusMoveResult } from "@/lib/schema/locus-move";

/**
 * 事物の座標を保存する API の URL。
 * パスは `src/app/admin/api/loci/route.dev.ts` の置き場から決まるので、置き場を動かしたらここも直す。
 */
const LOCUS_MOVE_URL = `${BASE_PATH}/admin/api/loci`;

/**
 * 事物 1 件の座標を書き換える要求（`move`）を保存の API へ送り、保存しなかった理由の文の配列を返す。
 * 保存したときは空配列を返す。
 *
 * API へ届かないか応答の形が違うときも throw せず、その旨を理由の文にして返す。
 * 管理画面は理由をそのまま画面に出すので、失敗の形を一つにしておく。
 */
export async function postLocusMove(move: LocusMove): Promise<string[]> {
  try {
    const response = await fetch(LOCUS_MOVE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(move),
    });
    const body: unknown = await response.json();

    return parseLocusMoveResult(body).problems;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);

    return [`保存の API を呼べなかった（${LOCUS_MOVE_URL}）: ${message}`];
  }
}
