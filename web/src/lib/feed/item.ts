/**
 * フィードのエピソード 1 件が満たすべき形。
 * 受けるのは XML から取り出したままの文字列で、返すのは型の付いた値である。
 *
 * XML の癖はここへ持ち込まない。
 * `#text` と素の文字列の差や属性の在り処は `parse.ts` が均し、ここは均した後の記録だけを見る。
 *
 * 正規化を二つ引き受ける。
 * `guid` は先頭に空白を持つ回が 5 件あるので trim する（trim しないと同じ回が毎回「新規」に見える）。
 * `pubDate` は RFC 822 の GMT で来るので ISO 8601 へ直す。
 *
 * 入口は feedItemSchema。
 */

import * as z from "zod";

/**
 * 前後の空白を落として受ける、空でない文字列。
 * `data/` のスキーマは空白付きを直さず落とすが、こちらは配信元から来た値を正規化する側なので直して受ける。
 */
const trimmedTextSchema = z.string().trim().min(1);

/**
 * RFC 822 の日時を ISO 8601 へ直す。
 *
 * 全件が `Wed, 19 Aug 2026 21:00:00 GMT` の形で、時間帯を明示して持つ。
 * 時間帯を持たない文字列を渡すと `Date` は実行環境の地方時として読むので、その形はフィードに現れないことを前提にしている。
 *
 * RFC 822 の解釈自体は ECMAScript の規定の外にあり、実装に委ねられている。
 * 走らせる先が Node（V8）だけなのでこれで足りる。
 */
const pubDateSchema = z.string().transform((text, ctx) => {
  const parsed = new Date(text);

  if (Number.isNaN(parsed.getTime())) {
    ctx.addIssue({ code: "custom", message: `日時として読めない: ${text}` });

    return z.NEVER;
  }

  return parsed.toISOString();
});

/**
 * `itunes:season` や `itunes:episode` のように、欄ごと無いことがある正の整数。
 * 欄が無ければ null で、欄はあるのに正の整数でなければ落とす。
 */
const optionalPositiveIntSchema = z
  .string()
  .optional()
  .transform((text, ctx) => {
    if (text === undefined) {
      return null;
    }

    const value = Number(text);

    if (!Number.isInteger(value) || value <= 0) {
      ctx.addIssue({ code: "custom", message: `正の整数でない: ${text}` });

      return z.NEVER;
    }

    return value;
  });

/**
 * `itunes:duration` を秒へ直す。
 * `00:52:48`（時:分:秒）と `18:20`（分:秒）と秒だけの表記を受ける。
 *
 * 読めない表記は落とさずに null にする。
 * この値を読む先がまだ無いので（episodes.json へも保存しない）、表記の揺れで同期全体を止める理由が無い。
 */
const optionalDurationSecSchema = z
  .string()
  .optional()
  .transform((text) => {
    if (text === undefined) {
      return null;
    }

    const parts = text.split(":").map(Number);

    if (
      parts.length > 3 ||
      parts.some((part) => !Number.isInteger(part) || part < 0)
    ) {
      return null;
    }

    return parts.reduce((total, part) => total * 60 + part, 0);
  });

/**
 * フィードのエピソード 1 件。
 *
 * `season` は `itunes:season` で、752 件中 176 件（番外編・特別編・告知）が持たない。
 * `episodeNumber` と `durationSec` は episodes.json へ保存しない（docs/adr/0018-season-as-assignment-key.md）。
 */
export const feedItemSchema = z.object({
  guid: trimmedTextSchema,
  title: trimmedTextSchema,
  link: trimmedTextSchema,
  pubDate: pubDateSchema,
  audioUrl: trimmedTextSchema,
  season: optionalPositiveIntSchema,
  episodeNumber: optionalPositiveIntSchema,
  durationSec: optionalDurationSecSchema,
});

export type FeedItem = z.infer<typeof feedItemSchema>;
