/**
 * エピソード（＝番組の 1 回）のスキーマ。
 * RSS から同期した自動層の形を持つ（docs/adr/0029-two-layer-data-without-inbox.md）。
 *
 * ここが検査するのは**正規化後**の形で、正規化そのものは同期側の仕事である。
 * フィードの `pubDate` は RFC 822 で来るので、ISO 8601 へ直してから書く。
 * `guid` は初期の 5 件が先頭に空白の付いた URL なので、突き合わせのキーにする前に trim して書く。
 * 未正規化の値をここで直して受けると同期側の破れが見えなくなるので、直さずに落とす。
 *
 * `season` が割当キーで、`seriesId` はそれを引いた結果である（docs/adr/0018-season-as-assignment-key.md）。
 * どちらも持たない回（番外編・特別編・告知）があるので null を許す。
 *
 * 同期側がスキーマ外の欄を書いても、黙って捨てられると気付く場所が無いので、スキーマに無いキーは落とす。
 *
 * 入口は parseEpisodes。
 */

import * as z from "zod";
import { duplicatesOf } from "@/lib/duplicates";
import { linksSchema } from "@/lib/schema/link";
import { trimmedNonEmptyStringSchema } from "@/lib/schema/text";

/** エピソード 1 件。 */
export const episodeSchema = z
  .strictObject({
    /**
     * 差分同期が突き合わせに使う RSS の `<guid>`。
     * 大半は UUID だが、初期の 5 件だけ `<guid> https://anchor.fm/coten/episodes/94COTEN-RADIO-ebu6ld</guid>` のように先頭へ空白の付いた URL が来る（#13 の実測）。
     */
    guid: trimmedNonEmptyStringSchema,

    /**
     * 各回の題号。
     * 基本形は `【COTEN RADIO 宗教改革編2】` だが、`編` の欠落・回番号でなく前後編・開き括弧の欠落で崩れる（#13 の実測）。
     * ここからシリーズ名を抽出せず、割当は `itunes:season` で行う（docs/adr/0018-season-as-assignment-key.md）。
     */
    title: trimmedNonEmptyStringSchema,

    /**
     * エピソード一覧の並び順。
     * これで足りるので `itunes:episode` は持たない（docs/adr/0018-season-as-assignment-key.md）。
     */
    pubDate: z.iso.datetime(),

    /**
     * 割当キーになる `itunes:season` の値（docs/adr/0018-season-as-assignment-key.md）。
     * 番外編・特別編・告知は持たないので、null の回は `seriesId` も必ず null になる。
     */
    season: z.int().positive().nullable(),

    /** `season` をシリーズ側の索引で引いた結果。 */
    seriesId: trimmedNonEmptyStringSchema.nullable(),

    /** RSS の `<link>` が入る（docs/adr/0006-rss-link-as-episode-url.md）。 */
    links: linksSchema,
  })
  .superRefine((episode, ctx) => {
    // seriesId は season を索引で引いた結果なので、season の無い回に割当は存在しえない。
    if (episode.season === null && episode.seriesId !== null) {
      ctx.addIssue({
        code: "custom",
        message: `season が無いのに seriesId が割り当たっている（seriesId=${episode.seriesId}）`,
      });
    }
  });

/**
 * エピソード全件。
 *
 * `guid` の重複をここで落とす。
 * 差分同期はこれを鍵に既存と突き合わせるので、重複すると同じ回が二度書かれたのか別の回なのかを見分けられない。
 */
export const episodeCollectionSchema = z
  .strictObject({
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
