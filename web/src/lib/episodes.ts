/**
 * 配信された `episodes.json` をブラウザが取得し、シリーズごとに絞り込む。
 *
 * ビルド時に `catalog/` を `node:fs` で読む `@/lib/catalog-dir` とは別経路である。
 * `"use client"` を付けたコンポーネントは `node:fs` に到達しないので、エピソードだけを実行時の fetch にする（docs/ARCHITECTURE.md §3「配り方」）。
 *
 * 取得は `fetchEpisodes`、絞り込みは `episodesForSeries` が担当する。
 */

import { BASE_PATH } from "@/lib/base-path";
import { type Episode, parseEpisodes } from "@/lib/schema/episode";

/**
 * `fetchEpisodes` が返す取得の結果。
 *
 * 取得の失敗を空配列で表さない。
 * 空配列にすると、割り当てられたエピソードが 0 件のシリーズと取得の失敗が同じ値になり、`SeriesDetailCard` が二つを書き分けられない。
 */
export type EpisodesResult =
  | { kind: "loaded"; episodes: Episode[] }
  | { kind: "error" };

/**
 * `SeriesDetailCard` が受け取るエピソードの状態。
 * `fetchEpisodes` が返るまでが `loading` で、返った後は `EpisodesResult` のどちらかになる。
 */
export type EpisodesState = { kind: "loading" } | EpisodesResult;

/**
 * 配信された `episodes.json` の URL。
 *
 * `BASE_PATH` を付ける理由は `@/lib/base-path` が正。
 * `public/catalog/episodes.json` を作るのは `package.json` の `sync-catalog` で、`predev` と `prebuild` が実行する。
 */
const EPISODES_URL = `${BASE_PATH}/catalog/episodes.json`;

/**
 * 配信されたエピソードの全件を取得し、`parseEpisodes` の検査に通して返す。
 * 取得か検査に失敗したら throw せず `{ kind: "error" }` を返し、`console.error` に理由を出力する。
 *
 * throw しないのは、エピソードが 0 件でも `SeriesDetailCard` を開くためである。
 * 失敗は `scripts/smoke.ts` のスモークが `console.error` と 4xx で検出する。
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
    console.error(`エピソードの取得に失敗した: ${EPISODES_URL}`, cause);

    return { kind: "error" };
  }
}

/**
 * `seriesId` が一致するエピソードを、`pubDate` の古い順に返す。
 * 一致するエピソードが無ければ空配列を返す。
 *
 * 比較は `Date.parse` の値で行う。
 * ISO 8601 は秒の小数部が任意なので、文字列のまま比較すると `...00Z` が `...00.000Z` より後ろに並ぶ。
 */
export function episodesForSeries(
  episodes: Episode[],
  seriesId: string,
): Episode[] {
  return episodes
    .filter((episode) => episode.seriesId === seriesId)
    .sort((a, b) => Date.parse(a.pubDate) - Date.parse(b.pubDate));
}
