/**
 * `catalog/` のファイルをまたぐ整合を見る。
 * ファイル単体の検査は各スキーマが持つが、参照の指す先や区間の重なりは両方のファイルを並べないと見えない。
 *
 * 検査はどれも「データは在るのに、壊れ方が画面に出ず静かに沈む」形を赤にする。
 * - episodes → series（brokenSeriesReferences）: `seriesId` が実在するシリーズを指し、その `season` とも一致すること。
 *   series 側の `id` は人手で変わりうるので、変えた後に同期を回し忘れると episodes 側の参照だけが古いまま残る
 * - series → loci（brokenAnchors）: `anchor` の宣言が現物と合うこと。
 *   指す先を欠いた代表点も、事物を持ってしまった位置なしも、地図には「その点が無い」としか出ない
 * - loci → series（brokenLocusSeriesReferences・lociOutsideSeriesTimeRange）: `seriesId` が実在すること、年を書いた事物がシリーズの年代に収まること。
 *   参照を外した事物は濃淡を引く先を持たず、はみ出した年の事物はシリーズが一覧に出ない時代の地図へ現れる
 * - series → eras（seriesOutsideEraSpace）: `timeRange` が era 空間と重なること。
 *   重ならないシリーズはスライダーのどの位置でも現在窓に掛からず、地図に一度も現れない
 *
 * episode が `season` を持つのに `seriesId` が null の状態は見ない。
 * 差分同期は新規の回にしか割当を掛けないので、シリーズが後から増えたときに正しく起きる状態である。
 *
 * ここは fs を触らない純関数だけを持つ。
 * 現物へ掛けるのは `tests/catalog.test.ts` で、対象のファイルが揃うまで各検査は skip される。
 */

import type { EpisodeCollection } from "@/lib/schema/episode";
import { ERA_END_PRESENT, type EraList } from "@/lib/schema/era";
import { type LocusCollection, TIME_RANGE_OF_SERIES } from "@/lib/schema/locus";
import { ANCHOR_UNLOCATED, type SeriesList } from "@/lib/schema/series";

/**
 * `seriesId` の参照が壊れているエピソードを、理由の文で返す。
 * 壊れていなければ空。
 */
export function brokenSeriesReferences(
  episodes: EpisodeCollection,
  series: SeriesList,
): string[] {
  const seasonsById = new Map(series.map(({ id, season }) => [id, season]));

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
 * `anchor` の宣言が現物と合わないシリーズを、理由の文で返す。
 * 合わなければ、そのシリーズは地図に出ないか、位置なしと宣言したまま点を持つ。
 * 壊れていなければ空。
 */
export function brokenAnchors(
  series: SeriesList,
  loci: LocusCollection,
): string[] {
  const lociById = new Map(
    loci.features.map((feature) => [feature.properties.id, feature.properties]),
  );
  const locatedSeriesIds = new Set(
    loci.features.map((feature) => feature.properties.seriesId),
  );

  const problems: string[] = [];

  for (const { id, anchor } of series) {
    if (anchor === ANCHOR_UNLOCATED) {
      if (locatedSeriesIds.has(id)) {
        problems.push(
          `series ${id}: 位置なしと宣言しているのに事物を持っている`,
        );
      }

      continue;
    }

    const locus = lociById.get(anchor);

    if (locus === undefined) {
      problems.push(`series ${id}: anchor が指す事物 ${anchor} がどこにも無い`);
      continue;
    }

    if (locus.seriesId !== id) {
      problems.push(
        `series ${id}: anchor が指す事物 ${anchor} は別のシリーズ（${locus.seriesId}）の事物である`,
      );
      continue;
    }

    if (locus.timeRange !== TIME_RANGE_OF_SERIES) {
      problems.push(
        `series ${id}: 代表点 ${anchor} の timeRange に年が書かれている（代表点は ${TIME_RANGE_OF_SERIES} でなければならない）`,
      );
    }
  }

  return problems;
}

/**
 * `seriesId` がどのシリーズも指していない事物を、理由の文で返す。
 * 指す先が無い事物は、描画の濃淡に要る `kind` を引けない。
 * 壊れていなければ空。
 */
export function brokenLocusSeriesReferences(
  loci: LocusCollection,
  series: SeriesList,
): string[] {
  const seriesIds = new Set(series.map(({ id }) => id));
  const properties = loci.features.map((feature) => feature.properties);

  return properties
    .filter((locus) => !seriesIds.has(locus.seriesId))
    .map(
      (locus) =>
        `locus ${locus.id}: seriesId ${locus.seriesId} がどのシリーズにも無い`,
    );
}

/**
 * シリーズの `timeRange` からはみ出した年を書いている事物を、理由の文で返す。
 * はみ出した事物は、シリーズが一覧に出ない時代の地図へ現れる。
 * 壊れていなければ空。
 *
 * `TIME_RANGE_OF_SERIES` の事物は定義上はみ出しようがないので見ない。
 * `seriesId` の指す先が無い事物も見ない。
 * 比べる相手が居ないだけで、それを名指すのは brokenLocusSeriesReferences の仕事である。
 */
export function lociOutsideSeriesTimeRange(
  loci: LocusCollection,
  series: SeriesList,
): string[] {
  const timeRangesBySeriesId = new Map(
    series.map(({ id, timeRange }) => [id, timeRange]),
  );

  const properties = loci.features.map((feature) => feature.properties);

  const problems: string[] = [];

  for (const { id, seriesId, timeRange } of properties) {
    if (timeRange === TIME_RANGE_OF_SERIES) {
      continue;
    }

    const span = timeRangesBySeriesId.get(seriesId);

    if (span === undefined) {
      continue;
    }

    if (timeRange.start < span.start || timeRange.end > span.end) {
      problems.push(
        `locus ${id}: timeRange（${timeRange.start}..${timeRange.end}）がシリーズ ${seriesId} の timeRange（${span.start}..${span.end}）からはみ出している`,
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
  series: SeriesList,
  eras: EraList,
): string[] {
  const spaceStart = eras[0].start;
  const lastEnd = eras[eras.length - 1].end;

  const problems: string[] = [];

  for (const { id, timeRange } of series) {
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
