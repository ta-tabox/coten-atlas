/**
 * 配ったエピソードをブラウザが取ってきて、シリーズごとに絞る。
 *
 * `catalog/` を `node:fs` で読む口（`@/lib/catalog-dir`）とは別の経路である。
 * あちらはビルド時に Server Component が読み、こちらは実行時に配信物を fetch する（docs/ARCHITECTURE.md §3「配り方」）。
 * 同じファイルに置くと、呼べる場所が混ざる。
 *
 * 取得（非同期）と絞り込み（純関数）は分けたまま置く。
 * 絞り込みを取得から切り離しておけば、fetch を差し替えずに並びと割当を固められる。
 */

import { BASE_PATH } from "@/lib/base-path";
import { type Episode, parseEpisodes } from "@/lib/schema/episode";

/**
 * エピソードを取ってきた結果。
 *
 * 取れなかったことを空の一覧で表さない。
 * 空で返すと、カタログに回が無いシリーズと取得の失敗が同じ値になり、画面がその二つを言い分けられなくなる。
 */
export type EpisodesResult =
  | { kind: "loaded"; episodes: Episode[] }
  | { kind: "error" };

/**
 * 画面から見たエピソードの状態。
 * 取得が返るまでが `loading` で、その後は `EpisodesResult` のどちらかになる。
 */
export type EpisodesState = { kind: "loading" } | EpisodesResult;

/**
 * 配信された episodes.json の在り処。
 *
 * `BASE_PATH` を付けないと、リポジトリ名を挟んだ公開先で 404 になる（`@/lib/base-path`）。
 * 実体を `public/catalog/` へ置くのは `package.json` の `sync-catalog` で、`predev` / `prebuild` が呼ぶ。
 */
const EPISODES_URL = `${BASE_PATH}/catalog/episodes.json`;

/**
 * 配信されたエピソードの全件を、スキーマの検査に通して返す。
 * 取れなければ `error` を返す。
 *
 * 詳細カードはエピソードが 1 件も無くても開くので、ここで投げると欠損が地図ごと巻き込む。
 * 投げる代わりに `console.error` へ出す。
 * 遮断版スモーク（`scripts/smoke.ts`）が同一オリジンの 4xx と `console.error` を見るので、複製漏れも 404 の HTML を掴んだ形も `pnpm check` で赤くなる。
 */
export async function fetchEpisodes(): Promise<EpisodesResult> {
  try {
    const response = await fetch(EPISODES_URL);

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return {
      kind: "loaded",
      episodes: parseEpisodes(await response.json()).episodes,
    };
  } catch (cause) {
    console.error(`エピソードを取れなかった: ${EPISODES_URL}`, cause);

    return { kind: "error" };
  }
}

/**
 * 一つのシリーズに割り当たったエピソードを、配信の古い順に返す。
 * 割当の無い回（`seriesId` が null）はどのシリーズにも入らない。
 *
 * 並べ替えの鍵は `pubDate` を時刻へ直した値である。
 * ISO 8601 は秒の小数部を書いても書かなくてもよく、文字列のまま比べると `...00Z` が `...00.000Z` より後ろに来る。
 */
export function episodesForSeries(
  episodes: Episode[],
  seriesId: string,
): Episode[] {
  return episodes
    .filter((episode) => episode.seriesId === seriesId)
    .sort((a, b) => Date.parse(a.pubDate) - Date.parse(b.pubDate));
}
