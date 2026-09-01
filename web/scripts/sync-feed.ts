/**
 * 公式 RSS を引いて `data/episodes.json` を書き直し、シリーズへ割り当てられなかった新着を `data/inbox/` へ出す。
 *
 * ここが持つのは取得と入出力と組み立てで、フィードの読み方（`src/lib/feed/parse.ts`）と割当の規則（同 `assign.ts`）は持たない。
 * 判定の要る部分を外へ出してあるので、この層はネットワークとファイルを触る手順だけになる。
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
 * `series.geojson` を読む。
 * まだ無ければ空の FeatureCollection を返し、全件が inbox へ落ちる。
 *
 * 無いことを失敗にしない。
 * シリーズを人間が書き始める前でも、このスクリプトが inbox を出せることがその入口になる。
 */
function readSeries(): SeriesCollection {
  if (!fs.existsSync(SERIES_FILE)) {
    console.error(
      `${path.relative(process.cwd(), SERIES_FILE)} がまだ無いので、全件を未割当として扱う`,
    );

    return { type: "FeatureCollection", features: [] };
  }

  return parseSeries(JSON.parse(fs.readFileSync(SERIES_FILE, "utf8")));
}

/**
 * 前回までに書いた `episodes.json` を、guid から seriesId を引ける形で読む。
 * まだ無ければ空で、フィード全件が新着になる。
 *
 * 割当まで持つのは、前回あった割当が外れたことを見るため。
 * guid の有無だけでは、割当が null へ後退した回と元から未割当の回を見分けられない。
 */
function readPreviousAssignments(): Map<string, string | null> {
  if (!fs.existsSync(EPISODES_FILE)) {
    return new Map();
  }

  const previous = parseEpisodes(
    JSON.parse(fs.readFileSync(EPISODES_FILE, "utf8")),
  );

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
 * JSON を末尾の改行付きで書く。
 * 生成物も人間が読む差分に出るので、整形して書く。
 *
 * 同じディレクトリへ一時ファイルを書いてから rename する。
 * 書き込みの途中で落ちると、直接書いていた場合は中途半端な JSON がその名前で残る。
 * inbox は人間がまだ判定していない一覧なので、壊れた状態で残ると書く順序で守ったはずの作業がそこで消える。
 */
function writeJson(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });

  // rename が atomic なのは同じファイルシステムの上だけなので、一時ファイルを別の場所へ置かない。
  const temporary = `${file}.tmp`;

  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temporary, file);
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
 * ファイルを読んで JSON として解釈する。
 * 構文が壊れていれば、どのファイルかを添えて投げる。
 *
 * `JSON.parse` が投げる SyntaxError は位置しか言わない。
 * inbox は日付ごとに増えるので、名前が無いとどれを直せばよいか分からない。
 */
function parseJsonFile(file: string): { episodes?: unknown } {
  const text = fs.readFileSync(file, "utf8");

  try {
    return JSON.parse(text);
  } catch (cause) {
    throw new Error(`JSON として読めない: ${file}`, { cause });
  }
}

/**
 * 同じ日に既に出してある inbox を読む。
 * 無ければ空。
 *
 * 読めない中身なら投げる。
 * 人間がまだ判定していない一覧なので、壊れているときに黙って空で上書きすると作業が消える。
 */
function readInbox(file: string): InboxEntry[] {
  if (!fs.existsSync(file)) {
    return [];
  }

  const existing = parseJsonFile(file);

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
function writeInbox(syncedAt: string, unassigned: Assignment[]): void {
  const file = path.join(INBOX_DIR, `${syncedAt.slice(0, 10)}.json`);
  const existing = readInbox(file);
  const known = new Set(existing.map((entry) => entry.guid));
  const added = unassigned
    .map(({ item }) => toInboxEntry(item))
    .filter((entry) => !known.has(entry.guid));

  writeJson(file, { syncedAt, episodes: [...existing, ...added] });
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
  const series = readSeries();
  const previous = readPreviousAssignments();

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
    writeInbox(syncedAt, unassigned);
  }

  writeJson(
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
