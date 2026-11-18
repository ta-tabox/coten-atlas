/**
 * `series.json` にシリーズが無く、シーズン調査の issue もまだ無い season について、起票する issue の題と本文を JSON で標準出力へ書く。
 * 起票はせず、`.github/workflows/uncreated-seasons.yml` が出力の 1 件ごとに `gh issue create` を呼ぶ。
 *
 * 引数は既存の issue の題を並べた JSON の配列のファイルで、open と closed の両方を含める。
 * 標準出力は JSON だけにし、ワークフローがそのまま `jq` で読めるようにする。
 *
 * 入口は `pnpm seasons:uncreated <issue の題の JSON>`。
 */

import path from "node:path";
import * as z from "zod";
import { fetchFeed } from "@scripts/fetch-feed";
import { readJsonFile } from "@scripts/json-file";
import { parseFeed } from "@/lib/feed/parse";
import type { FeedItem } from "@/lib/feed/schema";
import { toSurveyIssue } from "@/lib/feed/survey-issue";
import {
  listUncreatedSeasons,
  listUnreportedSeasons,
} from "@/lib/feed/uncreated-seasons";
import {
  parseSeasonCorrections,
  type SeasonCorrectionList,
} from "@/lib/schema/season-correction";
import { parseSeries, type SeriesList } from "@/lib/schema/series";

/**
 * データ層の置き場。
 *
 * `pnpm seasons:uncreated` の作業ディレクトリ（`web/`）から辿る。
 * このファイルは `dist/` へ出力してから走るので、`import.meta.url` から辿ると出力先の深さの分だけずれた場所を指す。
 */
const CATALOG_DIR = path.resolve(process.cwd(), "../catalog");

/**
 * 既存の issue の題の一覧のファイルの形。
 * `gh issue list --json title --jq '[.[].title]'` の出力に当たる。
 */
const issueTitlesSchema = z.array(z.string());

/**
 * 既存の issue の題の一覧をファイル（`file`）から読む。
 * 文字列の配列でなければ、ファイルの名前を添えて throw する。
 */
function readIssueTitles(file: string): string[] {
  const parsed = issueTitlesSchema.safeParse(readJsonFile(file));

  if (!parsed.success) {
    throw new Error(
      `issue の題の一覧が文字列の配列でない: ${file}\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}

/**
 * コマンドの引数（`argv`）から、既存の issue の題の JSON のファイルのパスを返す。
 * 引数が無ければ、渡し方を添えて throw する。
 */
function requireIssueTitlesFile(argv: readonly string[]): string {
  const file = argv[2];

  if (file === undefined) {
    throw new Error(
      "既存の issue の題の JSON のファイルを引数に渡す（pnpm seasons:uncreated <ファイル>）",
    );
  }

  return file;
}

/**
 * `catalog/` からシリーズ一覧と訂正表を読み、スキーマに通して返す。
 * どちらかがスキーマに合わなければ throw する。
 */
function readCatalog(): {
  series: SeriesList;
  corrections: SeasonCorrectionList;
} {
  return {
    series: parseSeries(readJsonFile(path.join(CATALOG_DIR, "series.json"))),
    corrections: parseSeasonCorrections(
      readJsonFile(path.join(CATALOG_DIR, "season-corrections.json")),
    ),
  };
}

/**
 * 公式 RSS を取得し、検査済みのフィードの回の配列にして返す。
 */
async function readFeedItems(): Promise<FeedItem[]> {
  const feedXml = await fetchFeed();

  return parseFeed(feedXml);
}

/**
 * 入力の読み込み・起票する issue の計算・標準出力への書き出しを順に通す。
 */
async function main(): Promise<void> {
  const issueTitles = readIssueTitles(requireIssueTitlesFile(process.argv));
  const { series, corrections } = readCatalog();
  const items = await readFeedItems();

  const uncreated = listUncreatedSeasons(items, series, corrections);
  const issues = listUnreportedSeasons(uncreated, issueTitles).map(
    toSurveyIssue,
  );

  console.log(JSON.stringify(issues, null, 2));
}

await main();
