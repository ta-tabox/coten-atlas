/**
 * 公式 RSS の XML を、エピソード 1 件ずつの素の値へ直す。
 *
 * ネットワークへは出ない。
 * 取得とパースを混ぜるとパースの検査に実フィードが要るようになるので、fetch は呼ぶ側（scripts/sync-feed.ts）が持つ。
 *
 * 返すのはフィードに書いてある値だけで、episodes.json の形ではない。
 * seriesId の割当は assign.ts、スキーマの検査は schema/episode.ts が持つ。
 *
 * 正規化はこの層が引き受ける。
 * `guid` は先頭に空白を持つ回が 5 件あるので trim して返す（trim しないと同じ回が毎回「新規」に見える）。
 * `pubDate` は RFC 822 の GMT で来るので ISO 8601 へ直す。
 *
 * 入口は parseFeed。
 */

import { XMLParser } from "fast-xml-parser";

/**
 * フィードのエピソード 1 件。
 *
 * `season` は `itunes:season` で、752 件中 176 件（番外編・特別編・告知）が持たない。
 * `episodeNumber` と `durationSec` は episodes.json へ保存しない（docs/adr/0018-season-as-assignment-key.md）。
 */
export type FeedItem = {
  guid: string;
  title: string;
  link: string;
  /**
   * ISO 8601。
   * フィードの RFC 822 から直したもの。
   */
  pubDate: string;
  audioUrl: string;
  season: number | null;
  episodeNumber: number | null;
  durationSec: number | null;
};

/**
 * 値をすべて文字列のまま受け取る設定。
 *
 * `parseTagValue` を切ってあるので、数字だけの `guid` やタイトルが数値へ化けない。
 * `trimValues` も切ってある。
 * パーサ任せで空白が落ちると、`guid` を trim しているのがこのモジュールなのかパーサなのかが検査で見分けられなくなる。
 */
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: false,
  isArray: (_tagName, jsonPath) => jsonPath === "rss.channel.item",
});

/**
 * RSS の XML を FeedItem の配列へ直す。
 *
 * `item` が 1 件も無ければ投げる。
 * 空の配列を返すと、フィードが壊れた日に呼ぶ側が「全件消えた」を正常な差分として書き込む。
 */
export function parseFeed(xml: string): FeedItem[] {
  const items = itemsOf(parser.parse(xml));

  if (items.length === 0) {
    throw new Error("フィードに item が 1 件も無い");
  }

  return items.map(toFeedItem);
}

/**
 * `rss.channel.item` を配列で取り出す。
 * どこかで途切れていれば空を返し、0 件の判定は呼ぶ側へ渡す。
 */
function itemsOf(document: unknown): Record<string, unknown>[] {
  const channel = recordOf(recordOf(recordOf(document)?.rss)?.channel);
  const items = channel?.item;

  if (!Array.isArray(items)) {
    return [];
  }

  return items.flatMap((item) => {
    const record = recordOf(item);

    return record === null ? [] : [record];
  });
}

/**
 * `item` 1 件を FeedItem へ直す。
 * 欠けていては困る欄が無ければ、何件目のどの回かを添えて投げる。
 */
function toFeedItem(item: Record<string, unknown>, index: number): FeedItem {
  const label = labelOf(item, index);

  return {
    guid: required(textOf(item.guid), "guid", label),
    title: required(textOf(item.title), "title", label),
    link: required(textOf(item.link), "link", label),
    pubDate: toIsoDate(required(textOf(item.pubDate), "pubDate", label), label),
    audioUrl: required(
      textOf(attributeOf(item.enclosure, "@_url")),
      "enclosure/@url",
      label,
    ),
    season: toPositiveInt(
      textOf(item["itunes:season"]),
      "itunes:season",
      label,
    ),
    episodeNumber: toPositiveInt(
      textOf(item["itunes:episode"]),
      "itunes:episode",
      label,
    ),
    durationSec: toDurationSec(textOf(item["itunes:duration"])),
  };
}

/**
 * 投げるときに何件目のどの回かを示す文字列。
 * `guid` より題名の方が人が見て分かるので、題名が読めればそちらを添える。
 */
function labelOf(item: Record<string, unknown>, index: number): string {
  const title = textOf(item.title) ?? textOf(item.guid);
  const position = `${index + 1} 件目`;

  return title === null ? position : `${position}（${title}）`;
}

/**
 * 欠けていては困る欄を取り出す。
 * 無ければ投げる。
 */
function required(value: string | null, field: string, label: string): string {
  if (value === null) {
    throw new Error(`${label} に ${field} が無い`);
  }

  return value;
}

/**
 * 要素の中身を、前後の空白を落とした文字列で返す。
 * 空欄と、空白しか無い欄は null。
 *
 * 属性を持つ要素の中身はパーサが `#text` へ入れるので、素の文字列と両方を受ける。
 * `<guid isPermaLink="false">` が属性を持つ側で、`<link>` が持たない側である。
 */
function textOf(node: unknown): string | null {
  const raw = typeof node === "string" ? node : recordOf(node)?.["#text"];

  if (typeof raw !== "string") {
    return null;
  }

  const trimmed = raw.trim();

  return trimmed === "" ? null : trimmed;
}

/** 要素の属性を取り出す。 */
function attributeOf(node: unknown, name: string): unknown {
  return recordOf(node)?.[name];
}

/**
 * RFC 822 の日時を ISO 8601 へ直す。
 *
 * 全 752 件が `Wed, 19 Aug 2026 21:00:00 GMT` の形で、時間帯を明示して持つ。
 * 時間帯を持たない綴りを渡すと `Date` は実行環境の地方時として読むので、その形はフィードに現れないことを前提にしている。
 *
 * RFC 822 の解釈自体は ECMAScript の規定の外にあり、実装に委ねられている。
 * 走らせる先が Node（V8）だけなのでこれで足りる。
 */
function toIsoDate(pubDate: string, label: string): string {
  const parsed = new Date(pubDate);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${label} の pubDate を日時として読めない: ${pubDate}`);
  }

  return parsed.toISOString();
}

/**
 * `itunes:season` や `itunes:episode` の値を正の整数へ直す。
 * 欄が無ければ null を返し、欄はあるのに正の整数でなければ投げる。
 */
function toPositiveInt(
  text: string | null,
  field: string,
  label: string,
): number | null {
  if (text === null) {
    return null;
  }

  const value = Number(text);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} の ${field} が正の整数でない: ${text}`);
  }

  return value;
}

/**
 * `itunes:duration` を秒へ直す。
 * `00:52:48`（時:分:秒）と `18:20`（分:秒）と秒だけの綴りを受ける。
 *
 * 読めない綴りは投げずに null にする。
 * この値を読む先がまだ無いので（episodes.json へも保存しない）、綴りの揺れで同期全体を止める理由が無い。
 */
function toDurationSec(text: string | null): number | null {
  if (text === null) {
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
}

/**
 * オブジェクトとして読める値だけを通す。
 * パーサの返り値は形が保証されていないので、添字を引く前にここを通す。
 */
function recordOf(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}
