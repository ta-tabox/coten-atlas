/**
 * エピソード（＝番組の 1 回）のスキーマ。
 * RSS から同期した自動層の形を持つ（docs/adr/0005-two-layer-data.md）。
 *
 * ここが検査するのは**正規化後**の形である。
 * フィードの `pubDate` は RFC 822 で来るので、ISO 8601 へ直すのは同期側の仕事になる。
 * `guid` も同じで、初期の 5 件は先頭に空白が付いた URL なので、突き合わせのキーにする前に trim する。
 *
 * `season` が割当キーで、`seriesId` はそれを引いた結果である（docs/adr/0018-season-as-assignment-key.md）。
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
   * 差分同期が突き合わせに使う RSS の `<guid>`。
   * 5 件だけ UUID でなく URL で、先頭に空白が付く。
   */
  guid: z.string().trim().min(1),

  /**
   * 番組から引いてよいのは題号まで（docs/adr/0008-quote-titles-only.md）。
   * 綴りが 3 通りに揺れているので、ここからシリーズ名を抽出しない。
   */
  title: z.string().trim().min(1),

  /**
   * エピソード一覧の並び順。
   * これで足りるので `itunes:episode` は持たない（docs/adr/0018-season-as-assignment-key.md）。
   */
  pubDate: z.iso.datetime(),

  /**
   * 割当キーになる `itunes:season` の値（docs/adr/0018-season-as-assignment-key.md）。
   * 番外編・特別編・告知は持たないので、null の回は inbox へ回る。
   */
  season: z.int().positive().nullable(),

  /** `season` をシリーズ側の索引で引いた結果。 */
  seriesId: z.string().trim().min(1).nullable(),

  /** RSS の `<link>` が入る（docs/adr/0006-rss-link-as-episode-url.md）。 */
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
