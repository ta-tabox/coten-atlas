/**
 * Apple Podcasts の回の URL を `episodes.json` の回へ結ぶ純関数と、Search API の検索語を決める純関数を置く。
 * API の取得は持たず、ネットワークを叩くモジュールが持つ。
 *
 * 結ぶ鍵は RSS の `<guid>` である。
 * 回の URL を持たない回の `links` は触らず、前回の同期から引き継いだ値を残す。
 */

import type { AppleEpisode } from "@/lib/schema/apple-podcasts";
import type { Episode } from "@/lib/schema/episode";
import type { Series } from "@/lib/schema/series";

/**
 * シリーズに割り当たらない回（番外編・特別編・告知）を見つけるための Search API の検索語。
 * 回の題がシリーズの題を含まないので、番組名と回の種別で探す。
 */
const UNASSIGNED_SEARCH_TERMS = [
  "コテンラジオ",
  "COTEN RADIO",
  "COTEN RADIO 番外編",
  "COTEN RADIO 特別編",
];

/**
 * `appleEpisodes` の URL を、同じ guid の回（`episodes`）の `links["apple-podcasts"]` へ入れた配列を返す。
 * 一致する回が無ければ、その回の `links` はそのまま返す。
 */
export function withAppleUrls(
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
 * Apple Podcasts の回の URL をまだ持たない回（`episodes`）を探すための、Search API の検索語を重複なしで返す。
 * シリーズに割り当たった回はシリーズの題（`series` の `title`）に ` COTEN RADIO` を付けた語、割り当たらない回は番組名と回の種別の語で探す。
 *
 * 全回が URL を持つなら空配列を返す。
 * 割り当たった `seriesId` が `series` に無ければ throw する。
 */
export function listSearchTerms(
  episodes: readonly Episode[],
  series: ReadonlyArray<Pick<Series, "id" | "title">>,
): string[] {
  const titleById = new Map(series.map(({ id, title }) => [id, title]));
  const terms = episodes
    .filter((episode) => episode.links["apple-podcasts"] === undefined)
    .flatMap(({ seriesId }) => {
      if (seriesId === null) {
        return UNASSIGNED_SEARCH_TERMS;
      }

      const title = titleById.get(seriesId);

      if (title === undefined) {
        throw new Error(`seriesId が series に無い: ${seriesId}`);
      }

      return [`${title} COTEN RADIO`];
    });

  return [...new Set(terms)];
}
