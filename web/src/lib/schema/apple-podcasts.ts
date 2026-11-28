/**
 * Apple Podcasts の lookup API と Search API の応答を検査する zod スキーマと、`parseAppleResponse` を置く。
 * 取得は持たず、ネットワークを叩くモジュールが持つ。
 *
 * 二つの API は同じ形の `results` を返す。
 * Search API の `results` には他の番組の回が混ざるので、`collectionId` が一致する回だけを検査し、他の番組の欠けた欄で同期を止めない。
 * 回の `episodeGuid` は RSS の `<guid>` と一致するが、初期の回は前後に空白が付きうるので、ここで trim して突き合わせの鍵にする。
 *
 * 入口は `parseAppleResponse`。
 */

import * as z from "zod";

/** `results` の要素を、回かどうかと番組の識別だけで読む zod スキーマ。 */
const appleResponseSchema = z.object({
  results: z.array(
    z.looseObject({
      kind: z.string().optional(),
      collectionId: z.number().optional(),
    }),
  ),
});

/** 回の `episodeGuid` と回のページの URL（`trackViewUrl`）を、`AppleEpisode` の形へ写す zod スキーマ。 */
const appleEpisodeSchema = z
  .looseObject({
    episodeGuid: z.string().trim().min(1),
    trackViewUrl: z.url(),
  })
  .transform(({ episodeGuid, trackViewUrl }) => ({
    guid: episodeGuid,
    url: trackViewUrl,
  }));

/**
 * Apple Podcasts の 1 回。
 * `guid` は trim 済みの RSS の `<guid>`、`url` は Apple Podcasts でその回を開く URL。
 */
export type AppleEpisode = z.infer<typeof appleEpisodeSchema>;

/**
 * API の応答（`input`）から、番組（`collectionId`）の回を取り出す。
 * 番組自身の行や他の番組の回は読み飛ばす。
 *
 * 応答の外形が違うか、対象の番組の回に `episodeGuid` か `trackViewUrl` が無ければ throw する。
 */
export function parseAppleResponse(
  input: unknown,
  collectionId: number,
): AppleEpisode[] {
  const response = appleResponseSchema.safeParse(input);

  if (!response.success) {
    throw new Error(
      `Apple Podcasts の応答がスキーマに合わない\n${z.prettifyError(response.error)}`,
    );
  }

  return response.data.results
    .filter(
      (row) =>
        row.kind === "podcast-episode" && row.collectionId === collectionId,
    )
    .map((row) => {
      const episode = appleEpisodeSchema.safeParse(row);

      if (!episode.success) {
        throw new Error(
          `Apple Podcasts の回がスキーマに合わない\n${z.prettifyError(episode.error)}`,
        );
      }

      return episode.data;
    });
}
