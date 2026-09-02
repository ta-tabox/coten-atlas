/**
 * 未割当スタブ（`data/inbox/YYYY-MM-DD.json`）のスキーマ。
 * どのシリーズにも当たらなかった回が、人間の判定を待って並ぶ（docs/adr/0005-two-layer-data.md）。
 *
 * 持つのは人間がシリーズを決めるために要る欄だけである。
 * 座標と年代は `series.geojson` を書くときに埋めるものなので、ここには置かない。
 *
 * ここは人間が開いて編集しうる唯一の生成物なので、読み戻す側が形を確かめる。
 * 崩れたまま受けると、同じ日の一覧へ継ぎ足して書き戻すときに崩れが残る。
 *
 * 入口は parseInbox。
 */

import * as z from "zod";
import { trimmedNonEmptyStringSchema } from "@/lib/schema/text";

/** inbox の 1 件。 */
export const inboxEntrySchema = z.strictObject({
  /** `episodes.json` と同じ、RSS の `<guid>` を trim したもの。 */
  guid: trimmedNonEmptyStringSchema,

  /** 人間がどのシリーズの回かを見当付けるための題号。 */
  title: trimmedNonEmptyStringSchema,

  /**
   * `itunes:season` の値。
   * これを持たない回（番外編・特別編・告知）が inbox の大半を占めるので null を許す。
   */
  season: z.int().positive().nullable(),

  /** RSS の `<link>`（docs/adr/0006-rss-link-as-episode-url.md）。 */
  link: z.url(),
});

/** inbox のファイル 1 本。 */
export const inboxSchema = z.strictObject({
  syncedAt: z.iso.datetime(),
  episodes: z.array(inboxEntrySchema),
});

export type InboxEntry = z.infer<typeof inboxEntrySchema>;
export type Inbox = z.infer<typeof inboxSchema>;

/**
 * inbox 1 本を検査して返す。
 * 合わなければ、どの要素のどこが合わないかを添えて投げる。
 */
export function parseInbox(input: unknown): Inbox {
  const parsed = inboxSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      `inbox がスキーマに合わない\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}
