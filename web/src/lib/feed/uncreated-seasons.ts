/**
 * 配信フィードの回のうち、`series.json` にシリーズが無いシリーズ番号（`season`）をまとめる純関数を置く。
 * issue の題と本文は組まず、`survey-issue.ts` が組む。
 *
 * シリーズ番号は、同期の割当が訂正表・題名の先頭の `【NN-M】` の `NN`・`itunes:season` のどれかから決めた値で、`series.json` の各シリーズの `season` と照合する。
 * 同期の割当の結果だけから数え、シリーズ番号を自分で決め直さない。
 * 割当と違う規則で数えると、同期が割り当てる回を未作成と言い、同期が未割当に残す回を見落とす。
 *
 * 入口は listUncreatedSeasons と listUnreportedSeasons。
 */

import type { Assignment } from "@/lib/feed/episode";
import type { FeedItem } from "@/lib/feed/schema";

/**
 * 題の末尾の `【COTEN RADIO <名前>編<回>】` に当たる正規表現。
 * 括弧の中の `<名前>` をシリーズ名として取り出す。
 *
 * 短い回のシリーズは `【COTEN RADIOショート <名前>編<回>】` と書くので、`COTEN RADIO` の直後から空白までの語は読み飛ばす。
 */
const TITLE_SERIES_NAME_PATTERN = /【COTEN RADIO[^ 【】]* ([^【】]+?)編\d*】$/;

/**
 * `series.json` にシリーズが無いシリーズ番号 1 件の要約。
 *
 * `listUncreatedSeasons` が作り、シーズン調査の issue の題と本文を組む `toSurveyIssue` へ渡す。
 * `seriesName` は最初の回の題から取れなければ null で、名前の確定は起票した後の調査に任せる。
 */
export type UncreatedSeason = {
  season: number;
  seriesName: string | null;
  episodeCount: number;
  firstEpisode: { title: string; pubDate: string };
};

/**
 * 同期の割当の結果（`assignments`）のうち、シリーズ番号は決まったのにシリーズが無い回をシリーズ番号ごとにまとめ、シリーズ名・回の数・最初の回を返す。
 * 無ければ空配列。
 *
 * 番外編・訂正表で外した回・番号の無い回は割当でシリーズ番号が null になるので、ここでは数えない。
 * 結果はシリーズ番号の昇順に並べ、起票の順と issue の番号の順をシリーズ番号の順に揃える。
 */
export function listUncreatedSeasons(
  assignments: readonly Assignment[],
): UncreatedSeason[] {
  const uncreatedItems = assignments
    .map(({ item, key, seriesId }) => ({ item, season: key.season, seriesId }))
    .filter(
      (entry): entry is { item: FeedItem; season: number; seriesId: null } =>
        entry.season !== null && entry.seriesId === null,
    );
  const itemsBySeason = Map.groupBy(uncreatedItems, ({ season }) => season);

  return [...itemsBySeason.entries()]
    .sort(([left], [right]) => left - right)
    .map(([season, entries]) =>
      toUncreatedSeason(
        season,
        entries.map(({ item }) => item),
      ),
    );
}

/**
 * 未作成のシリーズ番号（`seasons`）のうち、題に `（season <N>）` を含む issue が既存の issue の題（`issueTitles`）に無いものを返す。
 * 全件に issue があれば空配列。
 *
 * 閉じた issue の題も渡す。
 * 開いた issue だけと比べると、調査を終えて閉じた後に `series.json` へ載る前のシリーズ番号へ、同じ issue を二度起票する。
 */
export function listUnreportedSeasons(
  seasons: readonly UncreatedSeason[],
  issueTitles: readonly string[],
): UncreatedSeason[] {
  return seasons.filter(
    ({ season }) =>
      !issueTitles.some((title) => title.includes(seasonLabelOf(season))),
  );
}

/**
 * issue の題でシリーズ番号を名指す語（`（season <N>）`）を返す。
 *
 * 起票する題に置く側（`survey-issue.ts`）も、起票済みかを照合する `listUnreportedSeasons` もこの関数で組むので、書式を変えても両者は食い違わない。
 */
export function seasonLabelOf(season: number): string {
  return `（season ${season}）`;
}

/**
 * 1 つのシリーズ番号（`season`）の回（`seasonItems`）から、未作成のシリーズ番号の要約を作る。
 * `seasonItems` は 1 件以上ある前提で、最初の回は `pubDate` が最も古い回にする。
 */
function toUncreatedSeason(
  season: number,
  seasonItems: readonly FeedItem[],
): UncreatedSeason {
  const [first] = [...seasonItems].sort((left, right) =>
    left.pubDate.localeCompare(right.pubDate),
  );

  return {
    season,
    seriesName: seriesNameOf(first.title),
    episodeCount: seasonItems.length,
    firstEpisode: { title: first.title, pubDate: first.pubDate },
  };
}

/**
 * 題（`title`）の末尾の `【COTEN RADIO <名前>編<回>】` から `<名前>` を返す。
 * 題がその形で終わらなければ null。
 */
function seriesNameOf(title: string): string | null {
  return TITLE_SERIES_NAME_PATTERN.exec(title)?.[1] ?? null;
}
