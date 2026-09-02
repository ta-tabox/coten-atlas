/**
 * 公式 RSS の XML から、エピソード 1 件ずつの値を取り出す。
 *
 * ネットワークへは出ない。
 * 取得とパースを混ぜるとパースの検査に実フィードが要るようになるので、fetch は呼ぶ側（scripts/sync-feed.ts）が持つ。
 *
 * ここが引き受けるのは XML の癖を均すところまでである。
 * `#text` と素の文字列の差、属性の在り処、要素の欠落を落とし込んで、全欄が文字列（か欠落）の記録へ均す。
 * 値を信用してよいかの判定は持たないので、このファイルは zod を引かない。
 * 何が必須で何をどう変換するかは `schema.ts` が持つ。
 *
 * 入口は parseFeed。
 */

import { XMLParser } from "fast-xml-parser";
import { type FeedItem, parseFeedItem } from "@/lib/feed/schema";

/**
 * XML から取り出したままの 1 件。
 * スキーマへ渡す前の、全欄が文字列か欠落の記録である。
 */
type RawFeedItem = {
  guid?: string;
  title?: string;
  link?: string;
  pubDate?: string;
  audioUrl?: string;
  season?: string;
  episodeNumber?: string;
  durationSec?: string;
};

/**
 * 値をすべて文字列のまま受け取る設定。
 *
 * `parseTagValue` を切ってあるので、数字だけの `guid` やタイトルが数値へ化けない。
 * `trimValues` も切ってある。
 * パーサ任せで空白が落ちると、`guid` を trim しているのがこちらのスキーマなのかパーサなのかが検査で見分けられなくなる。
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
 * `item` 1 件を均して、スキーマへ渡す。
 * 均すところまでがこの層の仕事で、可否の判定は `schema.ts` が持つ。
 */
function toFeedItem(item: Record<string, unknown>, index: number): FeedItem {
  const raw = toRawFeedItem(item);

  return parseFeedItem(raw, labelOf(raw, index));
}

/**
 * `item` の要素と属性を、全欄が文字列か欠落の記録へ均す。
 * 値の可否はここでは見ない。
 */
function toRawFeedItem(item: Record<string, unknown>): RawFeedItem {
  return {
    guid: textOf(item.guid),
    title: textOf(item.title),
    link: textOf(item.link),
    pubDate: textOf(item.pubDate),
    audioUrl: textOf(attributeOf(item.enclosure, "@_url")),
    season: textOf(item["itunes:season"]),
    episodeNumber: textOf(item["itunes:episode"]),
    durationSec: textOf(item["itunes:duration"]),
  };
}

/**
 * 投げるときに何件目のどの回かを示す文字列。
 * `guid` より題名の方が人が見て分かるので、題名が読めればそちらを添える。
 */
function labelOf(raw: RawFeedItem, index: number): string {
  const title = raw.title ?? raw.guid;
  const position = `${index + 1} 件目`;

  return title === undefined ? position : `${position}（${title}）`;
}

/**
 * 要素の中身を文字列で返す。
 * 空欄と、空白しか無い欄は欠落として扱う。
 *
 * 属性を持つ要素の中身はパーサが `#text` へ入れるので、素の文字列と両方を受ける。
 * `<guid isPermaLink="false">` が属性を持つ側で、`<link>` が持たない側である。
 *
 * 前後の空白はここでは落とさない。
 * 落とすのはスキーマの仕事で、ここが均すのは XML の形だけである。
 */
function textOf(node: unknown): string | undefined {
  const raw = typeof node === "string" ? node : recordOf(node)?.["#text"];

  if (typeof raw !== "string" || raw.trim() === "") {
    return undefined;
  }

  return raw;
}

/** 要素の属性を取り出す。 */
function attributeOf(node: unknown, name: string): unknown {
  return recordOf(node)?.[name];
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
