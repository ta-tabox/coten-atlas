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
import { fileURLToPath } from "node:url";
import { assignSeriesId } from "../src/lib/feed/assign.ts";
import { type FeedItem, parseFeed } from "../src/lib/feed/parse.ts";
import { type Episode, parseEpisodes } from "../src/lib/schema/episode.ts";
import {
  parseSeries,
  type SeriesCollection,
} from "../src/lib/schema/series.ts";

/**
 * 公式 RSS の在り処。
 * Apple Podcasts の lookup API が返す `feedUrl` を 2026-08-23 に実取得した値で、以後はこれを直接叩く。
 */
const FEED_URL = "https://anchor.fm/s/8c2088c/podcast/rss";

/** データ層の置き場。 */
const DATA_DIR = fileURLToPath(new URL("../../data", import.meta.url));

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

/**
 * RSS を取ってくる。
 * 応答が 2xx でなければ投げる。
 */
async function fetchFeed(url: string): Promise<string> {
  const response = await fetch(url);

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
 * 前回までに書いた `episodes.json` の guid を集める。
 * まだ無ければ空で、フィード全件が新着になる。
 */
function readKnownGuids(): Set<string> {
  if (!fs.existsSync(EPISODES_FILE)) {
    return new Set();
  }

  const known = parseEpisodes(
    JSON.parse(fs.readFileSync(EPISODES_FILE, "utf8")),
  );

  return new Set(known.episodes.map((episode) => episode.guid));
}

/**
 * フィードの 1 件を `episodes.json` の 1 件へ直す。
 *
 * `link` は Spotify のエピソードページである（docs/adr/0006-rss-link-as-episode-url.md）。
 * `episodeNumber` と `durationSec` は読む先が無いので落とす（docs/adr/0018-season-as-assignment-key.md）。
 */
function toEpisode(item: FeedItem, seriesId: string | null): Episode {
  return {
    guid: item.guid,
    title: item.title,
    pubDate: item.pubDate,
    audioUrl: item.audioUrl,
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
 */
function writeJson(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

/**
 * フィードから消えた回を報せる。
 *
 * `episodes.json` は毎回組み直すので、フィードが一部しか返さなかった日には黙って回が消える。
 * 消えること自体を止めはしないが、気付ける形にはしておく。
 */
function warnDisappeared(items: FeedItem[], knownGuids: Set<string>): void {
  const present = new Set(items.map((item) => item.guid));
  const disappeared = [...knownGuids].filter((guid) => !present.has(guid));

  if (disappeared.length > 0) {
    console.error(
      `前回あった ${disappeared.length} 件がフィードに無い: ${disappeared.join(", ")}`,
    );
  }
}

/**
 * 取得から書き出しまでを通す。
 * 数え上げたサマリを標準出力へ書く。
 */
async function main(): Promise<void> {
  const items = parseFeed(await fetchFeed(FEED_URL));
  const series = readSeries();
  const knownGuids = readKnownGuids();

  warnDisappeared(items, knownGuids);

  const syncedAt = new Date().toISOString();
  const assignments = items.map((item) => ({
    item,
    seriesId: assignSeriesId(item, series),
  }));

  writeJson(
    EPISODES_FILE,
    parseEpisodes({
      syncedAt,
      episodes: assignments.map(({ item, seriesId }) =>
        toEpisode(item, seriesId),
      ),
    }),
  );

  const added = assignments.filter(({ item }) => !knownGuids.has(item.guid));
  const unassigned = added.filter(({ seriesId }) => seriesId === null);

  if (unassigned.length > 0) {
    const inboxFile = path.join(INBOX_DIR, `${syncedAt.slice(0, 10)}.json`);

    writeJson(inboxFile, {
      syncedAt,
      episodes: unassigned.map(({ item }) => toInboxEntry(item)),
    });
    console.log(`inbox: ${path.relative(process.cwd(), inboxFile)}`);
  }

  console.log(
    `フィード ${items.length} 件 / 新規 ${added.length} 件 / 割当 ${added.length - unassigned.length} 件 / 要レビュー ${unassigned.length} 件`,
  );
}

await main();
