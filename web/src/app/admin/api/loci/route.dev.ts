/**
 * 管理画面から事物 1 件の座標を書き換える要求を受け、`catalog/loci.geojson` へ保存する Route Handler を置く。
 * `next dev` でだけ立ち、`next build` の成果物には入らない（拡張子の扱いは `next.config.ts` が正）。
 *
 * 応答の本文はどの場合も `LocusMoveResult` で、保存しなかった理由を `problems` に入れる。
 * 要求の形が違えば 400、事物が無ければ 404、全件の検査に通らなければ 422 を返す。
 */

import { loadLoci, saveLoci } from "@/lib/catalog-dir";
import { updateLocusCoordinates } from "@/lib/catalog-edit/locus-coordinates";
import {
  type LocusMove,
  type LocusMoveResult,
  parseLocusMove,
} from "@/lib/schema/locus-move";

/** `problems` を本文にした、状態コード `status` の応答を返す。 */
function resultResponse(problems: string[], status: number): Response {
  const result: LocusMoveResult = { problems };

  return Response.json(result, { status });
}

/** 要求の本文を読み、座標を書き換えた事物の全件を検査に通してから保存する。 */
export async function POST(request: Request): Promise<Response> {
  let move: LocusMove;

  try {
    const body: unknown = await request.json();

    move = parseLocusMove(body);
  } catch (error) {
    // request.json の SyntaxError と parseLocusMove の検査の失敗だけを要求の誤りとして返し、それ以外は投げ直す。
    if (!(error instanceof Error)) {
      throw error;
    }

    return resultResponse([error.message], 400);
  }

  const updated = updateLocusCoordinates(loadLoci(), move);

  if (updated === undefined) {
    return resultResponse([`事物 ${move.id} が loci.geojson に無い`], 404);
  }

  const problems = saveLoci(updated);

  return resultResponse(problems, problems.length === 0 ? 200 : 422);
}
