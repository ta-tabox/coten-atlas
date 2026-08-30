/**
 * エピソード（＝番組の 1 回）のスキーマ。
 * RSS から同期した自動層の形を持つ（docs/adr/0005-two-layer-data.md）。
 *
 * ここが検査するのは**正規化後**の形である。
 * フィードの `pubDate` は RFC 822 で来るので、ISO 8601 へ直すのは同期側の仕事になる。
 * `guid` も同じで、初期の 5 件は先頭に空白が付いた URL なので、突き合わせのキーにする前に trim する。
 *
 * `season` が割当キーで、`themeId` はそれを引いた結果である（docs/adr/0018-season-as-assignment-key.md）。
 * どちらも持たない回（番外編・特別編・告知）があるので null を許す。
 *
 * 入口は parseEpisodes。
 */

import * as z from "zod";
import { duplicatesOf } from "@/lib/duplicates";
import { linksSchema } from "@/lib/schema/link";

/** エピソード 1 件。 */
export const episodeSchema = z.object({
  /**
   * RSS 2.0 の `<guid>` 要素。
   * globally unique identifier の頭字で、フィードの中で各回を一意に指す文字列を意味する。
   * 綴りを開かずに置いているのは、同期側が読む要素名と一致していないと対応を追う手間が増えるため。
   *
   * 同期はこれを鍵に既存の episodes.json と突き合わせる。
   * 747 件は UUID だが 5 件は anchor.fm のエピソード URL なので、UUID には固定できない。
   */
  guid: z.string().trim().min(1),
  title: z.string().trim().min(1),
  pubDate: z.iso.datetime(),
  audioUrl: z.url(),
  season: z.int().positive().nullable(),
  themeId: z.string().trim().min(1).nullable(),
  links: linksSchema,
});

/**
 * エピソード全件。
 *
 * `guid` の重複をここで落とす。
 * 差分同期はこれを鍵に既存と突き合わせるので、重複すると同じ回が二度書かれたのか別の回なのかを見分けられない。
 */
export const episodeCollectionSchema = z
  .object({
    syncedAt: z.iso.datetime(),
    episodes: z.array(episodeSchema),
  })
  .superRefine((collection, ctx) => {
    const guids = collection.episodes.map((episode) => episode.guid);

    for (const guid of duplicatesOf(guids)) {
      ctx.addIssue({ code: "custom", message: `guid が重複している: ${guid}` });
    }
  });

export type Episode = z.infer<typeof episodeSchema>;
export type EpisodeCollection = z.infer<typeof episodeCollectionSchema>;

/**
 * エピソード全件を検査して返す。
 * 合わなければ、どの要素のどこが合わないかを添えて投げる。
 */
export function parseEpisodes(input: unknown): EpisodeCollection {
  const parsed = episodeCollectionSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      `episodes がスキーマに合わない\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}
