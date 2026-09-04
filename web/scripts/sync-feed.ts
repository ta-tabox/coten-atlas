/**
 * 公式 RSS を引いて `data/episodes.json` を書き直し、シリーズへ割り当てられなかった新着を `data/inbox/` へ出す。
 *
 * ここが持つのは同期の段取りだけである。
 * フィードの読み方は `src/lib/feed/parse.ts`、割当の規則は同 `assign.ts`、inbox の読み書きは `inbox.ts`、JSON の読み書きは `json-file.ts` が持つ。
 * どのファイルをどの順で読み書きするかを決めるのがこの層の仕事で、その順序は main を上から読めば追える。
 *
 * `episodes.json` はフィードから毎回組み直す。
 * 自動層なので人手の加筆を前提にせず、シリーズの割当も `series.json` の現状から引き直す（docs/adr/0005-two-layer-data.md）。
 * 差分は「新着かどうか」を決めるためだけに取り、inbox へ出すのは新着のうち未割当のものに限る。
 *
 * 失敗は黙って飲まずに落とす。
 * 空の結果を正常な差分として書くと、フィードが壊れた日に `episodes.json` が消える。
 *
 * `pnpm check` の連鎖には入れない。
 * ネットワークへ出るので、配信元が落ちている日に検査が赤くなる。
 *
 * 入口は `pnpm sync`。
 */

import fs from "node:fs";
import path from "node:path";
import { writeInbox } from "@scripts/inbox";
import { readJsonFile, writeJsonFile } from "@scripts/json-file";
import { assignableSeasonOf, assignSeriesId } from "@/lib/feed/assign";
import { parseFeed } from "@/lib/feed/parse";
import type { FeedItem } from "@/lib/feed/schema";
import { type Episode, parseEpisodes } from "@/lib/schema/episode";
import { parseSeries, type SeriesList } from "@/lib/schema/series";

/**
 * 公式 RSS の在り処。
 * Apple Podcasts の lookup API が返す `feedUrl` を 2026-08-23 に実取得した値で、以後はこれを直接叩く。
 */
const FEED_URL = "https://anchor.fm/s/8c2088c/podcast/rss";

/**
 * 取得を諦めるまでの時間。
 * 応答を返さない配信元に当たったとき、待ち続けると同期が終わりも失敗もしない状態で止まる。
 * 実測で 7.2 MB を 2 秒弱で引けているので、桁が二つ違えば異常と見てよい。
 */
const FETCH_TIMEOUT_MS = 60_000;

/**
 * データ層の置き場。
 *
 * `pnpm sync` の作業ディレクトリ（`web/`）から辿る。
 * このファイルは `dist/` へ出力してから走るので、`import.meta.url` から辿ると出力先の深さの分だけずれた場所を指す。
 * 実行の入口が `pnpm sync` の一本なので、pnpm が保証する作業ディレクトリの方が動かない。
 */
const DATA_DIR = path.resolve(process.cwd(), "../data");

const EPISODES_FILE = path.join(DATA_DIR, "episodes.json");
const SERIES_FILE = path.join(DATA_DIR, "series.json");
const INBOX_DIR = path.join(DATA_DIR, "inbox");

/** フィードの 1 件と、それに決まったシリーズ。 */
type Assignment = {
  item: FeedItem;
  seriesId: string | null;
};

/**
 * RSS を取ってくる。
 * 応答が 2xx でなければ投げる。
 */
async function fetchFeed(url: string): Promise<string> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(
      `RSS を取得できない: ${response.status} ${response.statusText} (${url})`,
    );
  }

  return response.text();
}

/**
 * 人間が書いたシリーズ一覧を読む。
 * 割当はこの中身から season の索引を組んで引くので、ここに無い season のエピソードはどれも inbox へ回る。
 *
 * ファイルがまだ無い日は、失敗にせず空のシリーズ一覧として扱う。
 * シリーズを 1 件も書いていない段階でこのスクリプトが inbox を出せることが、人間がシリーズを書き始める入口になる。
 */
function readSeries(file: string): SeriesList {
  if (!fs.existsSync(file)) {
    console.error(
      `${path.relative(process.cwd(), file)} がまだ無いので、全件を未割当として扱う`,
    );

    return [];
  }

  return parseSeries(readJsonFile(file));
}

/**
 * 前回の同期が書き出したエピソード一覧を読み、guid から seriesId を引ける対応表にして返す。
 * ファイルがまだ無い初回は空の対応表になり、フィードの全件が新着として扱われる。
 *
 * この対応表には二つの役目がある。
 * 鍵（guid）の有無が「その回が新着か」を決め、値（seriesId）が「前回付いていた割当が外れていないか」を決める。
 * 鍵だけでは、割当が null へ後退した回と元から未割当だった回を見分けられない。
 */
function readPreviousAssignments(file: string): Map<string, string | null> {
  if (!fs.existsSync(file)) {
    return new Map();
  }

  const previous = parseEpisodes(readJsonFile(file));

  return new Map(
    previous.episodes.map((episode) => [episode.guid, episode.seriesId]),
  );
}

/**
 * フィードの 1 件を `episodes.json` の 1 件へ直す。
 *
 * `link` は Spotify のエピソードページである（docs/adr/0006-rss-link-as-episode-url.md）。
 * `audioUrl`・`episodeNumber`・`durationSec` はスキーマに欄が無いので落とす。
 * `episodeSchema` は未知のキーを捨てずに落とすので、足すと `parseEpisodes` が赤になる。
 */
function toEpisode(item: FeedItem, seriesId: string | null): Episode {
  return {
    guid: item.guid,
    title: item.title,
    pubDate: item.pubDate,
    season: item.season,
    seriesId,
    links: [{ platform: "spotify", url: item.link }],
  };
}

/**
 * フィードから消えた回を報せる。
 *
 * `episodes.json` は毎回組み直すので、フィードが一部しか返さなかった日には黙って回が消える。
 * 消えること自体を止めはしないが、気付ける形にはしておく。
 */
function warnDisappeared(
  items: FeedItem[],
  previous: Map<string, string | null>,
): void {
  const present = new Set(items.map((item) => item.guid));
  const disappeared = [...previous.keys()].filter((guid) => !present.has(guid));

  if (disappeared.length > 0) {
    console.error(
      `前回あった ${disappeared.length} 件がフィードに無い: ${disappeared.join(", ")}`,
    );
  }
}

/**
 * 前回は付いていた seriesId が外れた回を報せる。
 *
 * inbox へ出すのは新着だけなので、既に見送った回の割当が外れても人間の手元には現れない。
 * `series.json` から season を消したり書き換えたりすると起きるので、黙って直すと地図からその回が消えたことに気付けない。
 */
function warnLostAssignments(
  assignments: Assignment[],
  previous: Map<string, string | null>,
): void {
  const lost = assignments.filter(
    ({ item, seriesId }) =>
      seriesId === null && (previous.get(item.guid) ?? null) !== null,
  );

  if (lost.length > 0) {
    console.error(
      `前回付いていた seriesId が外れた回が ${lost.length} 件ある: ${lost
        .map(({ item }) => item.guid)
        .join(", ")}`,
    );
  }
}

/**
 * `data/` を指せていることを確かめる。
 *
 * 作業ディレクトリが違うと、書き出しは黙って別の場所へ `data/` を作り、755 件をそこへ置く。
 * `eras.json` は追跡されていて必ず在るので、これが無い場所は `data/` ではない。
 */
function assertDataDir(): void {
  if (fs.existsSync(path.join(DATA_DIR, "eras.json"))) {
    return;
  }

  throw new Error(
    `data/ が見つからない: ${DATA_DIR}（pnpm sync は web/ から走らせる）`,
  );
}

/**
 * 数え上げたサマリを標準出力へ書く。
 *
 * 未割当は二つに割る。
 * 規則で確定した分は `series.json` を埋めても減らないので、一つの数に混ぜると進捗が読めない。
 */
function reportSummary(assignments: Assignment[], added: Assignment[]): void {
  const unassigned = assignments.filter(({ seriesId }) => seriesId === null);
  const settledByRule = unassigned.filter(
    ({ item }) => assignableSeasonOf(item) === null,
  );
  const awaitingSeries = unassigned.filter(
    ({ item }) => assignableSeasonOf(item) !== null,
  );
  const awaitingSeasons = new Set(
    awaitingSeries.map(({ item }) => assignableSeasonOf(item)),
  );

  console.log(
    `フィード ${assignments.length} 件 / 新規 ${added.length} 件 / 割当 ${assignments.length - unassigned.length} 件 / 未割当 ${unassigned.length} 件`,
  );
  console.log(
    `  規則で確定      ${settledByRule.length} 件（season を持たない回・番外編）`,
  );
  console.log(
    `  シリーズ未作成  ${awaitingSeries.length} 件（season ${awaitingSeasons.size} 件）`,
  );
}

/**
 * 取得から書き出しまでを通す。
 */
async function main(): Promise<void> {
  assertDataDir();

  const items = parseFeed(await fetchFeed(FEED_URL));
  const series = readSeries(SERIES_FILE);
  const previous = readPreviousAssignments(EPISODES_FILE);

  warnDisappeared(items, previous);

  const syncedAt = new Date().toISOString();
  const assignments: Assignment[] = items.map((item) => ({
    item,
    seriesId: assignSeriesId(item, series),
  }));

  warnLostAssignments(assignments, previous);

  const added = assignments.filter(({ item }) => !previous.has(item.guid));
  const newlyUnassigned = added.filter(({ seriesId }) => seriesId === null);

  // inbox を先に書く。
  // episodes.json を先に書くと、その後で落ちたときに guid だけが既知になり、未判定のまま二度と出てこない回ができる。
  if (newlyUnassigned.length > 0) {
    const file = writeInbox(
      INBOX_DIR,
      syncedAt,
      newlyUnassigned.map(({ item }) => item),
    );

    console.log(`inbox: ${path.relative(process.cwd(), file)}`);
  }

  writeJsonFile(
    EPISODES_FILE,
    parseEpisodes({
      syncedAt,
      episodes: assignments.map(({ item, seriesId }) =>
        toEpisode(item, seriesId),
      ),
    }),
  );

  reportSummary(assignments, added);
}

await main();
