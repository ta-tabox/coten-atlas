/**
 * 公式 RSS を取得し、XML の文字列を返す関数を置く。
 * XML の読み方は持たず、`src/lib/feed/parse.ts` が持つ。
 *
 * `pnpm sync` と `pnpm seasons:uncreated` の両方が呼ぶので、配信元の URL と待ち時間の正はこのファイルに一つだけ置く。
 *
 * 入口は fetchFeed。
 */

/**
 * 公式 RSS の在り処。
 * Apple Podcasts の lookup API が返す `feedUrl` の値で、lookup API を経由せずこの URL を直接叩く。
 */
const FEED_URL = "https://anchor.fm/s/8c2088c/podcast/rss";

/**
 * 取得を諦めるまでの時間。
 * 応答を返さない配信元に当たったとき、待ち続けると呼んだスクリプトが終わりも失敗もしない状態で止まる。
 * 7.2 MB のフィードの取得は 2 秒弱で終わるので、桁が二つ違えば異常と見てよい。
 */
const FETCH_TIMEOUT_MS = 60_000;

/**
 * 公式 RSS を取得し、本文の XML を返す。
 * 応答が 2xx でなければ throw する。
 */
export async function fetchFeed(): Promise<string> {
  const response = await fetch(FEED_URL, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(
      `RSS を取得できない: ${response.status} ${response.statusText} (${FEED_URL})`,
    );
  }

  return response.text();
}
