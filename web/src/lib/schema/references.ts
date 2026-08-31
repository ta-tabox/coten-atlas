/**
 * `data/` のファイルをまたぐ整合を見る。
 * ファイル単体の検査は各スキーマが持つが、参照の指す先や区間の重なりは両方のファイルを並べないと見えない。
 *
 * 検査は 2 つで、どちらも「データは在るのに、壊れ方が画面に出ず静かに沈む」形を赤にする。
 * - episodes → series（brokenSeriesReferences）: `seriesId` が実在するシリーズを指し、その `season` とも一致すること。
 *   series 側の `id` は人手で変わりうるので、変えた後に同期を回し忘れると episodes 側の参照だけが古いまま残る
 * - series → eras（seriesOutsideEraSpace）: `timeRange` が era 空間と重なること。
 *   重ならないシリーズはスライダーのどの位置でも現在窓に掛からず、地図に一度も現れない
 *
 * episode が `season` を持つのに `seriesId` が null の状態は見ない。
 * 差分同期は新規の回にしか割当を掛けないので、シリーズが後から増えたときに正しく起きる状態である。
 *
 * ここは fs を触らない純関数だけを持つ。
 * 現物へ掛けるのは `tests/data.test.ts` で、対象のファイルが揃うまで各検査は skip される。
 */

import type { EpisodeCollection } from "@/lib/schema/episode";
import { ERA_END_PRESENT, type EraList } from "@/lib/schema/era";
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

/**
 * era 空間と重ならない `timeRange` を持つシリーズを、理由の文で返す。
 * 重なりが無ければそのシリーズはスライダーのどの位置にも現れないので、直すのは timeRange か、era の列を伸ばすかのどちらか。
 * 壊れていなければ空。
 *
 * era 空間は先頭 era の `start` に始まり（この年を含む）、末尾 era の `end` が年ならそこで終わる（この年を含まない）。
 * 末尾が `ERA_END_PRESENT` の間は後ろへ開いているので、右側の検査は掛からない。
 * 右端をどの年へ解決して描くか（S4、docs/adr/0019-era-open-end.md の帰結）とは独立で、ここは era の列そのものだけを見る。
 */
export function seriesOutsideEraSpace(
  series: SeriesCollection,
  eras: EraList,
): string[] {
  const spaceStart = eras[0].start;
  const lastEnd = eras[eras.length - 1].end;

  const problems: string[] = [];

  for (const feature of series.features) {
    const { id, timeRange } = feature.properties;

    if (timeRange.end < spaceStart) {
      problems.push(
        `series ${id}: timeRange の end（${timeRange.end}）が最初の era の start（${spaceStart}）より前で、スライダーのどの位置にも現れない`,
      );
      continue;
    }

    if (lastEnd !== ERA_END_PRESENT && timeRange.start >= lastEnd) {
      problems.push(
        `series ${id}: timeRange の start（${timeRange.start}）が最後の era の end（${lastEnd}）以後で、スライダーのどの位置にも現れない`,
      );
    }
  }

  return problems;
}
