/**
 * エピソードを配信基盤で開く URL を決める純関数と、基盤ごとの番組ページの URL を置く。
 *
 * 回ごとの URL を基盤から取得する処理は持たず、取得した URL は `episodes.json` の `links` に入っている前提で読む。
 * 回ごとの URL が無い基盤は番組ページを開くので、どの回のどのボタンも必ずどこかへ飛ぶ。
 */

import type { Episode } from "@/lib/schema/episode";
import type { Platform } from "@/lib/schema/link";

/**
 * 配信基盤ごとの、番組全体のページの URL。
 *
 * Apple Podcasts の id は lookup API の collection id である。
 */
export const SHOW_URLS: Record<Platform, string> = {
  spotify: "https://open.spotify.com/show/3qiAapMhh8UgWVfDWTSq2f",
  "apple-podcasts": "https://podcasts.apple.com/jp/podcast/id1450522865",
};

/**
 * エピソード（`episode`）を配信基盤（`platform`）で開く URL を返す。
 * その基盤の URL を `links` に持たなければ、`SHOW_URLS` の番組ページの URL を返す。
 */
export function listenUrlOf(
  episode: Pick<Episode, "links">,
  platform: Platform,
): string {
  return episode.links[platform] ?? SHOW_URLS[platform];
}
