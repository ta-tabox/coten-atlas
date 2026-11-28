/**
 * Apple Podcasts の回の URL を `episodes.json` の回へ結ぶ純関数と、URL を持たない回を探す純関数を置く。
 * API の取得は持たず、ネットワークを叩くモジュールが持つ。
 *
 * 結ぶ鍵は RSS の `<guid>` である。
 * 回の URL を持たない回の `links` は触らず、前回の同期から引き継いだ値を残す。
 */

import type { AppleEpisode } from "@/lib/schema/apple-podcasts";
import type { Episode } from "@/lib/schema/episode";

/**
 * `appleEpisodes` の URL を、同じ guid の回（`episodes`）の `links["apple-podcasts"]` へ入れた配列を返す。
 * 一致する回が無ければ、その回の `links` はそのまま返す。
 */
export function setAppleUrls(
  episodes: readonly Episode[],
  appleEpisodes: readonly AppleEpisode[],
): Episode[] {
  const urlByGuid = new Map(appleEpisodes.map(({ guid, url }) => [guid, url]));

  return episodes.map((episode) => {
    const url = urlByGuid.get(episode.guid);

    return url === undefined
      ? episode
      : { ...episode, links: { ...episode.links, "apple-podcasts": url } };
  });
}

/**
 * Apple Podcasts の回の URL をまだ持たない回を、`episodes` から返す。
 * 持たない回は、Search API で探す対象になる。
 */
export function listUnlinkedEpisodes(episodes: readonly Episode[]): Episode[] {
  return episodes.filter(
    (episode) => episode.links["apple-podcasts"] === undefined,
  );
}

/**
 * Apple Podcasts の回（`appleEpisodes`）のうち、`guid` が一致する 1 回を返す。
 * 一致する回が無ければ undefined を返す。
 *
 * Search API は検索語に近い他の回も返すので、検索した回の URL として使うのは、`guid` が一致した回だけにする。
 */
export function findAppleEpisode(
  appleEpisodes: readonly AppleEpisode[],
  guid: string,
): AppleEpisode | undefined {
  return appleEpisodes.find((appleEpisode) => appleEpisode.guid === guid);
}
