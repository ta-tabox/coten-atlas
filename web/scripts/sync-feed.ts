/**
 * 公式 RSS を引いて `data/episodes.json` を書き直し、シリーズへ割り当てられなかった新着を `data/inbox/` へ出す。
 *
 * ここが持つのは同期の段取りだけである。
 * フィードの読み方は `src/lib/feed/parse.ts`、割当の規則は同 `assign.ts`、JSON の読み書きは `json-file.ts` が持つ。
 * どのファイルをどの順で読み書きするかを決めるのがこの層の仕事で、その順序は main を上から読めば追える。
 *
 * `episodes.json` はフィードから毎回組み直す。
 * 自動層なので人手の加筆を前提にせず、シリーズの割当も `series.geojson` の現状から引き直す（docs/adr/0005-two-layer-data.md）。
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
import { readJsonFile, writeJsonFile } from "@scripts/json-file";
import { assignSeriesId } from "@/lib/feed/assign";
import { type FeedItem, parseFeed } from "@/lib/feed/parse";
import { type Episode, parseEpisodes } from "@/lib/schema/episode";
import { parseSeries, type SeriesCollection } from "@/lib/schema/series";

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
const SERIES_FILE = path.join(DATA_DIR, "series.geojson");
const INBOX_DIR = path.join(DATA_DIR, "inbox");

/**
 * 人間がシリーズを決めるために要る欄だけを持つ、inbox の 1 件。
 * 座標と年代は `series.geojson` を書くときに人間が埋めるので、ここには持たせない。
 */
type InboxEntry = {
  guid: string;
  title: string;
  season: number | null;
  link: string;
};

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
function readSeries(file: string): SeriesCollection {
  if (!fs.existsSync(file)) {
    console.error(
      `${path.relative(process.cwd(), file)} がまだ無いので、全件を未割当として扱う`,
    );

    return { type: "FeatureCollection", features: [] };
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

/** フィードの 1 件を inbox の 1 件へ直す。 */
function toInboxEntry(item: FeedItem): InboxEntry {
  return {
    guid: item.guid,
    title: item.title,
    season: item.season,
    link: item.link,
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
 * `series.geojson` から season を消したり書き換えたりすると起きるので、黙って直すと地図からその回が消えたことに気付けない。
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
 * 同じ日に既に出してある inbox のエントリを読む。
 * ファイルが無ければ空。
 *
 * 期待した形でなければ例外を投げて同期ごと止める。
 * 人間がまだ判定していないエントリの置き場なので、読めないからと空で上書きすると、そこに並んでいたエントリが消える。
 */
function readInbox(file: string): InboxEntry[] {
  if (!fs.existsSync(file)) {
    return [];
  }

  const existing = readJsonFile(file) as { episodes?: unknown };

  if (!Array.isArray(existing.episodes)) {
    throw new Error(`inbox の中身を読めない: ${file}`);
  }

  return existing.episodes as InboxEntry[];
}

/**
 * その日の inbox へ未割当の回を足す。
 *
 * 既にある同じ日の一覧へ継ぎ足す。
 * 1 日に 2 度走らせたとき、丸ごと書き換えると 1 度目に出した未判定の回が消える。
 *
 * 人間が解決した回をここから消すことはしない。
 * これは日付ごとの記録であって未割当の現在値ではないので、いま何が未割当かは episodes.json の seriesId が持つ。
 */
function writeInbox(
  directory: string,
  syncedAt: string,
  unassigned: Assignment[],
): void {
  const file = path.join(directory, `${syncedAt.slice(0, 10)}.json`);
  const existing = readInbox(file);
  const known = new Set(existing.map((entry) => entry.guid));
  const added = unassigned
    .map(({ item }) => toInboxEntry(item))
    .filter((entry) => !known.has(entry.guid));

  writeJsonFile(file, { syncedAt, episodes: [...existing, ...added] });
  console.log(`inbox: ${path.relative(process.cwd(), file)}`);
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
 * 取得から書き出しまでを通す。
 * 数え上げたサマリを標準出力へ書く。
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
  const unassigned = added.filter(({ seriesId }) => seriesId === null);

  // inbox を先に書く。
  // episodes.json を先に書くと、その後で落ちたときに guid だけが既知になり、未判定のまま二度と出てこない回ができる。
  if (unassigned.length > 0) {
    writeInbox(INBOX_DIR, syncedAt, unassigned);
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

  console.log(
    `フィード ${items.length} 件 / 新規 ${added.length} 件 / 割当 ${added.length - unassigned.length} 件 / 要レビュー ${unassigned.length} 件`,
  );
}

await main();
