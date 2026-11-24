/**
 * Apple Podcasts の lookup API と Search API から、番組の回の URL を取得する。
 * ネットワークを叩く境界で、応答は `parseAppleResponse` を通した `AppleEpisode` の配列にして返す。
 *
 * 取得を二つに分ける。
 * lookup API は新しい順に最新の 200 回までしか返さない（`offset` を付けても同じ 200 回が返る）ので、それより前の回は Search API で取る。
 * 回を `links` へ結ぶ処理と、Search API の検索語を決める処理は持たず、`src/lib/feed/apple-links.ts` が持つ。
 *
 * 取得の失敗は throw する。
 * 失敗しても同期を続けるかどうかは呼ぶ側が決める。
 */

import {
  type AppleEpisode,
  parseAppleResponse,
} from "@/lib/schema/apple-podcasts";

/**
 * 番組の Apple Podcasts 上の識別子。
 * 応答の `collectionId` がこの値の回だけを番組の回として扱う。
 */
const COLLECTION_ID = 1450522865;

const LOOKUP_URL = `https://itunes.apple.com/lookup?id=${COLLECTION_ID}&entity=podcastEpisode&limit=200&country=jp`;

const SEARCH_URL = "https://itunes.apple.com/search";

/**
 * 取得を諦めるまでの時間。
 * 応答を返さない相手に当たったとき、待ち続けると同期が終わりも失敗もしない状態で止まる。
 */
const FETCH_TIMEOUT_MS = 60_000;

/**
 * Search API の呼び出しの最小の間隔。
 * Search API は 1 分あたり約 20 回で制限に当たるので、1 回あたり 3 秒より長く空ける。
 */
const SEARCH_INTERVAL_MS = 3_500;

/**
 * 最後に Search API を呼び始めた時刻（`Date.now()` の値）。
 * まだ呼んでいなければ 0。
 */
let lastSearchStartedAt = 0;

/**
 * `url` から API の応答を取得し、番組の回にして返す。
 * 応答が 2xx でなければ、JSON として読めなければ、スキーマに合わなければ throw する。
 */
async function fetchAppleEpisodes(url: string): Promise<AppleEpisode[]> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(
      `Apple Podcasts の API を取得できない: ${response.status} ${response.statusText} (${url})`,
    );
  }

  const body: unknown = await response.json().catch((cause: unknown) => {
    throw new Error(`Apple Podcasts の応答が JSON として読めない: ${url}`, {
      cause,
    });
  });

  return parseAppleResponse(body, COLLECTION_ID);
}

/**
 * lookup API から、番組の最新の 200 回を取得する。
 */
export function fetchAppleLookup(): Promise<AppleEpisode[]> {
  return fetchAppleEpisodes(LOOKUP_URL);
}

/**
 * Search API から、検索語（`term`）に当たる番組の回を最大 200 回取得する。
 * 前回の呼び出しから `SEARCH_INTERVAL_MS` 空くまで待ってから呼ぶので、続けて呼んでも制限に当たらない。
 */
export async function fetchAppleSearch(term: string): Promise<AppleEpisode[]> {
  const wait = lastSearchStartedAt + SEARCH_INTERVAL_MS - Date.now();

  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }

  lastSearchStartedAt = Date.now();

  const query = new URLSearchParams({
    entity: "podcastEpisode",
    country: "jp",
    limit: "200",
    term,
  });

  return fetchAppleEpisodes(`${SEARCH_URL}?${query}`);
}
