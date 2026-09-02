/**
 * どのシリーズにも当たらなかった回を溜める置き場の読み書き。
 *
 * ここに並ぶのは人間がまだ判定していないエントリで、人間はこれを見て `series.geojson` へシリーズを足す。
 * 人間が手を入れる先は `series.geojson` であってこのファイルではないので、解決した回をここから消すことはしない。
 * いま何が未割当かは `episodes.json` の `seriesId` が持ち、こちらは日付ごとの記録である。
 *
 * 読みはスキーマに掛ける。
 * 人間が開いて編集しうる場所なので、形が崩れたものを黙って受けると、書き戻すときに崩れたまま残る。
 *
 * 入口は readInbox と writeInbox。
 */

import fs from "node:fs";
import path from "node:path";
import { readJsonFile, writeJsonFile } from "@scripts/json-file";
import * as z from "zod";
import type { FeedItem } from "@/lib/feed/item";

/**
 * inbox の 1 件。
 *
 * 人間がシリーズを決めるために要る欄だけを持つ。
 * 座標と年代は `series.geojson` を書くときに埋めるものなので、ここには置かない。
 */
const inboxEntrySchema = z.strictObject({
  guid: z.string().trim().min(1),
  title: z.string().trim().min(1),
  season: z.int().positive().nullable(),
  link: z.url(),
});

/** inbox のファイル 1 本。 */
const inboxFileSchema = z.strictObject({
  syncedAt: z.iso.datetime(),
  episodes: z.array(inboxEntrySchema),
});

export type InboxEntry = z.infer<typeof inboxEntrySchema>;

/** フィードの 1 件を inbox の 1 件へ直す。 */
export function toInboxEntry(item: FeedItem): InboxEntry {
  return {
    guid: item.guid,
    title: item.title,
    season: item.season,
    link: item.link,
  };
}

/**
 * その日の inbox に既に並んでいるエントリを読む。
 * ファイルが無ければ空。
 *
 * 形が合わなければ例外を投げて同期ごと止める。
 * 人間がまだ判定していないエントリの置き場なので、読めないからと空で上書きすると、そこに並んでいたエントリが消える。
 */
export function readInbox(file: string): InboxEntry[] {
  if (!fs.existsSync(file)) {
    return [];
  }

  const parsed = inboxFileSchema.safeParse(readJsonFile(file));

  if (!parsed.success) {
    throw new Error(
      `inbox の形に合わない: ${file}\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data.episodes;
}

/**
 * その日の inbox へ未割当の回を足す。
 *
 * 既にある同じ日の一覧へ継ぎ足す。
 * 1 日に 2 度走らせたとき、丸ごと書き換えると 1 度目に出したエントリが消える。
 */
export function writeInbox(
  directory: string,
  syncedAt: string,
  unassigned: FeedItem[],
): string {
  const file = path.join(directory, `${syncedAt.slice(0, 10)}.json`);
  const existing = readInbox(file);
  const known = new Set(existing.map((entry) => entry.guid));
  const added = unassigned
    .map(toInboxEntry)
    .filter((entry) => !known.has(entry.guid));

  writeJsonFile(file, { syncedAt, episodes: [...existing, ...added] });

  return file;
}
