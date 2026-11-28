/**
 * Spotify の Web API から、番組の全回の URL を取得する。
 * ネットワークを叩く境界で、応答は `parseSpotifyToken`・`parseSpotifyEpisodesPage` を通した `SpotifyEpisode` の配列にして返す。
 * 回を `links` へ結ぶ処理と、認証情報を環境変数から読む処理は持たず、`src/lib/feed/spotify-links.ts` が持つ。
 *
 * 認証は Client Credentials フローで、トークンは 1 回の取得に 1 つだけ取る。
 * 回の一覧は `limit=50` で `next` をたどる（`limit=1` では回の URL が返らない）。
 * 取得に失敗したら、標準エラーへ警告を出して null を返す。
 * Spotify は回の URL を足すだけの任意の情報源なので、呼び出し側は処理を続けられ、回の `links` は前回の値のまま残る。
 */

import type { SpotifyCredentials } from "@/lib/feed/spotify-links";
import {
  parseSpotifyEpisodesPage,
  parseSpotifyToken,
  type SpotifyEpisode,
} from "@/lib/schema/spotify";

const SHOW_ID = "3qiAapMhh8UgWVfDWTSq2f";

const TOKEN_URL = "https://accounts.spotify.com/api/token";

/**
 * 回の一覧の最初のページの URL。
 * `market` を付けないと 404 になる事例が報告されている。
 */
const FIRST_PAGE_URL = `https://api.spotify.com/v1/shows/${SHOW_ID}/episodes?market=JP&limit=50`;

/**
 * 取得を諦めるまでの時間。
 * 応答を返さない相手に当たったとき、待ち続けると同期が終わりも失敗もしない状態で止まる。
 */
const FETCH_TIMEOUT_MS = 60_000;

/**
 * `response` が 2xx でなければ throw し、2xx なら本文を JSON として読んで返す。
 * JSON として読めなければ throw する。
 */
async function readJsonResponse(
  response: Response,
  label: string,
): Promise<unknown> {
  if (!response.ok) {
    throw new Error(
      `Spotify の${label}を取得できない: ${response.status} ${response.statusText}`,
    );
  }

  return response.json().catch((cause: unknown) => {
    throw new Error(`Spotify の${label}が JSON として読めない`, { cause });
  });
}

/**
 * Client Credentials フローで、アクセストークンを取得する。
 * 応答が 2xx でなければ、スキーマに合わなければ throw する。
 */
async function fetchAccessToken({
  clientId,
  clientSecret,
}: SpotifyCredentials): Promise<string> {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  const body = await readJsonResponse(response, "トークン");

  return parseSpotifyToken(body);
}

/**
 * 回の一覧を、最初のページから `next` が null になるまで取得して返す。
 * 応答が 2xx でなければ、スキーマに合わなければ throw する。
 */
async function fetchAllEpisodes(token: string): Promise<SpotifyEpisode[]> {
  const episodes: SpotifyEpisode[] = [];
  let url: string | null = FIRST_PAGE_URL;

  while (url !== null) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const body = await readJsonResponse(response, "回の一覧");
    const page = parseSpotifyEpisodesPage(body);

    episodes.push(...page.episodes);
    url = page.nextUrl;
  }

  return episodes;
}

/**
 * 番組の全回を取得する。
 * 取得に失敗したら、警告を出して null を返す。
 */
export async function fetchSpotifyEpisodes(
  credentials: SpotifyCredentials,
): Promise<SpotifyEpisode[] | null> {
  try {
    const token = await fetchAccessToken(credentials);

    return await fetchAllEpisodes(token);
  } catch (error) {
    console.error(
      `Spotify の回の一覧を取得できず、links を更新しない: ${error instanceof Error ? error.message : String(error)}`,
    );

    return null;
  }
}
