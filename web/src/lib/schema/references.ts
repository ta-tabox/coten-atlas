/**
 * episodes と series をまたぐ参照の整合を見る。
 * ファイル単体の検査は各スキーマが持つが、`seriesId` の指す先が実在するかは両方を並べないと見えない。
 *
 * series 側の `id` は人手で変わりうるので、変えた後に同期を回し忘れると episodes 側の参照だけが古いまま残る。
 * それを緑のまま通さないための検査で、現物へ掛けるのは `tests/data.test.ts`。
 *
 * episode が `season` を持つのに `seriesId` が null の状態は見ない。
 * 差分同期は新規の回にしか割当を掛けないので、シリーズが後から増えたときに正しく起きる状態である。
 */

import type { EpisodeCollection } from "@/lib/schema/episode";
import type { SeriesCollection } from "@/lib/schema/series";

/**
 * `seriesId` の参照が壊れているエピソードを、理由の文で返す。
 * 壊れていなければ空。
 */
export function brokenSeriesReferences(
  episodes: EpisodeCollection,
  series: SeriesCollection,
): string[] {
  const seasonsById = new Map(
    series.features.map((feature) => [
      feature.properties.id,
      feature.properties.season,
    ]),
  );

  const problems: string[] = [];

  for (const episode of episodes.episodes) {
    if (episode.seriesId === null) {
      continue;
    }

    const season = seasonsById.get(episode.seriesId);

    if (season === undefined) {
      problems.push(
        `guid ${episode.guid}: seriesId ${episode.seriesId} がどのシリーズにも無い`,
      );
      continue;
    }

    if (season !== episode.season) {
      problems.push(
        `guid ${episode.guid}: seriesId ${episode.seriesId} の season（${season}）と回の season（${episode.season}）が食い違う`,
      );
    }
  }

  return problems;
}
