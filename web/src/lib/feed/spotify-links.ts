/**
 * Spotify の回の URL を `episodes.json` の回へ結ぶ純関数と、認証情報を環境変数から読む純関数を置く。
 * API の取得は持たず、ネットワークを叩くモジュールが持つ。
 *
 * Spotify の応答は RSS の `<guid>` を持たないので、結ぶ鍵は公開日（UTC の日付）と題の組にする。
 * 題は前後の空白と全角半角の揺れを均してから比べる。
 * 鍵に当たる回が無い回と、鍵に当たる回が複数ある回は結ばず、`links` を前回の値のまま残す。
 */

import type { Episode } from "@/lib/schema/episode";
import type { SpotifyEpisode } from "@/lib/schema/spotify";

/**
 * `linkSpotifyEpisodes` の結果。
 * `unmatched` と `ambiguous` の回の `links` は入力のままである。
 */
export type SpotifyLinkResult = {
  episodes: Episode[];
  /** 鍵に当たる Spotify の回が無い回。 */
  unmatched: Episode[];
  /** 鍵に当たる Spotify の回が複数ある回と、同じ鍵を持つ別の回が `episodes` にある回。 */
  ambiguous: Episode[];
};

/** Client Credentials フローに使う認証情報。 */
export type SpotifyCredentials = {
  clientId: string;
  clientSecret: string;
};

/**
 * 題を、前後の空白と全角半角の揺れを均した比較用の文字列にする。
 */
function normalizeTitle(title: string): string {
  return title.normalize("NFKC").replace(/\s+/g, " ").trim();
}

/** 公開日（`YYYY-MM-DD`）と題から、回を結ぶ鍵を作る。 */
function keyOf(date: string, title: string): string {
  return `${date}\t${normalizeTitle(title)}`;
}

/** 値を、鍵（`keyOfItem` の結果）が同じものごとの配列にまとめる。 */
function groupBy<T>(
  items: readonly T[],
  keyOfItem: (item: T) => string,
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = keyOfItem(item);

    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return groups;
}

/**
 * `spotifyEpisodes` の URL を、公開日と題が一致する回（`episodes`）の `links.spotify` へ入れる。
 * 結べなかった回と複数に当たった回は、`links` を変えずに `unmatched`・`ambiguous` へ分けて返す。
 *
 * 複数に当たった回の URL を選ぶと、別の回の URL を載せるおそれがあるので、結ばない。
 */
export function linkSpotifyEpisodes(
  episodes: readonly Episode[],
  spotifyEpisodes: readonly SpotifyEpisode[],
): SpotifyLinkResult {
  const spotifyByKey = groupBy(spotifyEpisodes, ({ releaseDate, title }) =>
    keyOf(releaseDate, title),
  );
  const episodesByKey = groupBy(episodes, ({ pubDate, title }) =>
    keyOf(pubDate.slice(0, 10), title),
  );
  const unmatched: Episode[] = [];
  const ambiguous: Episode[] = [];

  const linked = episodes.map((episode) => {
    const key = keyOf(episode.pubDate.slice(0, 10), episode.title);
    const candidates = spotifyByKey.get(key) ?? [];

    if (candidates.length === 0) {
      unmatched.push(episode);

      return episode;
    }

    if (candidates.length > 1 || (episodesByKey.get(key) ?? []).length > 1) {
      ambiguous.push(episode);

      return episode;
    }

    return {
      ...episode,
      links: { ...episode.links, spotify: candidates[0].url },
    };
  });

  return { episodes: linked, unmatched, ambiguous };
}

/**
 * 環境変数（`env`）から Spotify の認証情報を読む。
 * `SPOTIFY_CLIENT_ID` と `SPOTIFY_CLIENT_SECRET` のどちらかが無いか空なら null を返す。
 */
export function readSpotifyCredentials(
  env: Readonly<Record<string, string | undefined>>,
): SpotifyCredentials | null {
  const clientId = env.SPOTIFY_CLIENT_ID;
  const clientSecret = env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
}
