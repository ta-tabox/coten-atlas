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
 * Apple Podcasts の id は lookup API の collection id で、YouTube は番組の公式チャンネルである。
 */
export const SHOW_URLS: Record<Platform, string> = {
  spotify: "https://open.spotify.com/show/3qiAapMhh8UgWVfDWTSq2f",
  "apple-podcasts": "https://podcasts.apple.com/jp/podcast/id1450522865",
  youtube: "https://www.youtube.com/@cotenradio",
};

/**
 * エピソード（`episode`）を配信基盤（`platform`）で開く URL を返す。
 * その基盤のリンクを `links` に持たなければ、`SHOW_URLS` の番組ページの URL を返す。
 *
 * `find` の 1 件で足りる理由は `@/lib/schema/link` が正。
 */
export function listenUrlOf(
  episode: Pick<Episode, "links">,
  platform: Platform,
): string {
  const link = episode.links.find((one) => one.platform === platform);

  return link?.url ?? SHOW_URLS[platform];
}
