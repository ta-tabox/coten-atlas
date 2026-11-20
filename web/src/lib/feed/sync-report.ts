/**
 * 同期の前後の差（新しい回・割当が変わった回・フィードから消えた回）を、同期の PR の本文に載せる Markdown へ組む純関数を置く。
 * 差の元になる割当と前回の `episodes.json` の読み込みは持たず、`scripts/sync-feed.ts` が持つ。
 *
 * PR の読み手が `episodes.json` の差分を開く前に見る場所を決められるよう、回は題とシリーズ名で示し、guid とシリーズの `id` は出さない。
 * 題はフィードの文字列なので、`@名前` が入っても GitHub が通知を飛ばさないようにコードの書式で囲む。
 *
 * 入口は formatSyncReport。
 */

import type { Assignment } from "@/lib/feed/episode";
import type { Episode } from "@/lib/schema/episode";
import type { SeriesList } from "@/lib/schema/series";

/**
 * 配信日を日本時間の日付で出すための、UTC からのずれ（ミリ秒）。
 *
 * 番組は 06:00 JST に配信し、`pubDate` は UTC で前日の 21:00 になるので、UTC の日付のままだと配信日が 1 日ずれる。
 */
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * `formatSyncReport` が受ける、同期の前後の値。
 * `scripts/sync-feed.ts` が組み、`assignments` は今回のフィードの全件の割当、`previous` は前回の `episodes.json` を guid で引ける形にしたものである。
 */
export type SyncReportInput = {
  assignments: readonly Assignment[];
  previous: ReadonlyMap<string, Episode>;
  series: SeriesList;
};

/**
 * 同期の前後の値（`input`）から、見る場所の件数と、新しい回・割当が変わった回・フィードから消えた回の表を Markdown で返す。
 *
 * 0 件の表は出さず、三つとも 0 件なら、差分が各回の欄の更新だけであることを一文で返す。
 */
export function formatSyncReport(input: SyncReportInput): string {
  const titleById = new Map(input.series.map(({ id, title }) => [id, title]));
  const added = listAdded(input);
  const reassigned = listReassigned(input);
  const disappeared = listDisappeared(input);

  const counts = [
    "## 見る場所",
    "",
    `- 新しい回: ${added.length} 件`,
    `- 割当が変わった回: ${reassigned.length} 件`,
    `- フィードから消えた回: ${disappeared.length} 件`,
  ];

  if (added.length + reassigned.length + disappeared.length === 0) {
    return [
      ...counts,
      "",
      "`episodes.json` の差分は各回の欄の更新だけで、新しい回・割当の変化・消えた回は無い。",
      "",
    ].join("\n");
  }

  const tables = [
    table(
      "新しい回",
      ["配信日（JST）", "題", "シリーズ"],
      added.map((assignment) => [
        dateOf(assignment.item.pubDate),
        codeOf(assignment.item.title),
        seriesLabelOf(assignment, titleById),
      ]),
    ),
    table(
      "割当が変わった回",
      ["題", "前のシリーズ", "今のシリーズ"],
      reassigned.map(({ assignment, previousSeriesId }) => [
        codeOf(assignment.item.title),
        previousSeriesLabelOf(previousSeriesId, titleById),
        seriesLabelOf(assignment, titleById),
      ]),
    ),
    table(
      "フィードから消えた回",
      ["配信日（JST）", "題", "前のシリーズ"],
      disappeared.map((episode) => [
        dateOf(episode.pubDate),
        codeOf(episode.title),
        previousSeriesLabelOf(episode.seriesId, titleById),
      ]),
    ),
  ].filter((section) => section !== null);

  return [...counts, "", ...tables].join("\n");
}

/**
 * 前回の `episodes.json` に無かった回の割当を、配信日の新しい順に返す。
 * 無ければ空配列。
 */
function listAdded({ assignments, previous }: SyncReportInput): Assignment[] {
  return assignments
    .filter(({ item }) => !previous.has(item.guid))
    .sort((left, right) => right.item.pubDate.localeCompare(left.item.pubDate));
}

/**
 * 前回の `episodes.json` にも在り、前回と今回で `seriesId` が違う回の割当を、前回の `seriesId` と組にして返す。
 * 割当が外れた回と新しく付いた回も含み、無ければ空配列。
 */
function listReassigned({ assignments, previous }: SyncReportInput): {
  assignment: Assignment;
  previousSeriesId: string | null;
}[] {
  return assignments.flatMap((assignment) => {
    const previousEpisode = previous.get(assignment.item.guid);

    if (
      previousEpisode === undefined ||
      previousEpisode.seriesId === assignment.seriesId
    ) {
      return [];
    }

    return [{ assignment, previousSeriesId: previousEpisode.seriesId }];
  });
}

/**
 * 前回の `episodes.json` に在り、今回のフィードに無い回を、配信日の新しい順に返す。
 * 無ければ空配列。
 */
function listDisappeared({
  assignments,
  previous,
}: SyncReportInput): Episode[] {
  const present = new Set(assignments.map(({ item }) => item.guid));

  return [...previous.values()]
    .filter(({ guid }) => !present.has(guid))
    .sort((left, right) => right.pubDate.localeCompare(left.pubDate));
}

/**
 * 見出し（`heading`）・列名（`columns`）・行（`rows`）から Markdown の表の節を返す。
 * 行が無ければ null で、呼ぶ側が節ごと出さない。
 */
function table(
  heading: string,
  columns: readonly string[],
  rows: readonly string[][],
): string | null {
  if (rows.length === 0) {
    return null;
  }

  return [
    `### ${heading}`,
    "",
    `| ${columns.join(" | ")} |`,
    `|${columns.map(() => "---").join("|")}|`,
    ...rows.map((cells) => `| ${cells.join(" | ")} |`),
    "",
  ].join("\n");
}

/**
 * 今回の割当（`assignment`）のシリーズを、シリーズ名（`titleById` から取得）で返す。
 *
 * シリーズ番号は決まったのにシリーズが無い回は、シーズン調査の issue の題と照合できるようシリーズ番号を添えて返す。
 */
function seriesLabelOf(
  { key, seriesId }: Assignment,
  titleById: ReadonlyMap<string, string>,
): string {
  if (seriesId !== null) {
    return titleById.get(seriesId) ?? seriesId;
  }

  if (key.season !== null) {
    return `シリーズ未作成（season ${key.season}）`;
  }

  return "割当なし（番外編・告知など）";
}

/**
 * 前回の `episodes.json` の `seriesId`（`seriesId`）を、シリーズ名（`titleById` から取得）で返す。
 * null なら「未割当」。
 */
function previousSeriesLabelOf(
  seriesId: string | null,
  titleById: ReadonlyMap<string, string>,
): string {
  if (seriesId === null) {
    return "未割当";
  }

  return titleById.get(seriesId) ?? seriesId;
}

/**
 * ISO 8601 の日時（`pubDate`）を、日本時間の日付（`YYYY-MM-DD`）で返す。
 */
function dateOf(pubDate: string): string {
  return new Date(Date.parse(pubDate) + JST_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
}

/**
 * フィードの文字列（`text`）を、Markdown の表のセルに置けるコードの書式で返す。
 *
 * `|` は表の列の区切りと読まれるので、コードの書式の中でも `\|` に置き換える。
 */
function codeOf(text: string): string {
  return `\`${text.replaceAll("|", "\\|").replaceAll("`", "'")}\``;
}
