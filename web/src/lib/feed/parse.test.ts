import { describe, expect, it } from "vitest";
import { EMPTY_FEED_XML, FEED_XML } from "@/lib/feed/__fixtures__/feed";
import { parseFeed } from "@/lib/feed/parse";
import type { FeedItem } from "@/lib/feed/schema";

/** フィクスチャの中から題名の書き出しで 1 件を選ぶ。 */
function itemStartingWith(items: FeedItem[], prefix: string): FeedItem {
  const found = items.find((item) => item.title.startsWith(prefix));

  if (found === undefined) {
    throw new Error(`フィクスチャに ${prefix} で始まる回が無い`);
  }

  return found;
}

describe("parseFeed", () => {
  it("フィードの item を全件返す", () => {
    expect(parseFeed(FEED_XML)).toHaveLength(4);
  });

  it("UUID の guid をそのまま取る", () => {
    const item = itemStartingWith(parseFeed(FEED_XML), "【66-10】");

    expect(item.guid).toBe("4d80b4a3-deee-41f3-8045-d06ade19132f");
  });

  it("先頭に空白のある URL の guid を trim して取る", () => {
    const item = itemStartingWith(parseFeed(FEED_XML), "【94】");

    expect(item.guid).toBe(
      "https://anchor.fm/coten/episodes/94COTEN-RADIO-ebu6ld",
    );
  });

  it("pubDate を GMT として読む", () => {
    const item = itemStartingWith(parseFeed(FEED_XML), "【66-10】");

    expect(item.pubDate).toBe("2026-08-19T21:00:00.000Z");
  });

  it("itunes:season を持たない item の season が null になる", () => {
    const item = itemStartingWith(parseFeed(FEED_XML), "【特別編】");

    expect(item.season).toBeNull();
  });

  it("itunes:season を持つ item の season を数値で取る", () => {
    const item = itemStartingWith(parseFeed(FEED_XML), "【66-10】");

    expect(item.season).toBe(66);
  });

  it("enclosure の url を audioUrl に取る", () => {
    const item = itemStartingWith(parseFeed(FEED_XML), "【66-10】");

    expect(item.audioUrl).toBe(
      "https://anchor.fm/s/8c2088c/podcast/play/122753786/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2026-6-13%2F5c1734a4.mp3",
    );
  });

  it("link に Spotify のエピソードページを取る", () => {
    const item = itemStartingWith(parseFeed(FEED_XML), "【66-10】");

    expect(item.link).toBe(
      "https://podcasters.spotify.com/pod/show/coten/episodes/66-10COTEN-RADIO-10-e3m0l9q",
    );
  });

  it("時:分:秒 の itunes:duration を秒へ直す", () => {
    const item = itemStartingWith(parseFeed(FEED_XML), "【66-10】");

    expect(item.durationSec).toBe(3168);
  });

  it("分:秒 の itunes:duration を秒へ直す", () => {
    const item = itemStartingWith(parseFeed(FEED_XML), "【特別編】");

    expect(item.durationSec).toBe(1100);
  });

  it("item が 0 件の XML で投げる", () => {
    expect(() => parseFeed(EMPTY_FEED_XML)).toThrow("item が 1 件も無い");
  });

  it("pubDate を持たない item で投げる", () => {
    const withoutPubDate = FEED_XML.replace(
      "<pubDate>Wed, 19 Aug 2026 21:00:00 GMT</pubDate>",
      "",
    );

    expect(() => parseFeed(withoutPubDate)).toThrow(/pubDate/);
  });

  it("欠けた欄を一度に全部報せる", () => {
    const withoutBoth = FEED_XML.replace(
      "<pubDate>Wed, 19 Aug 2026 21:00:00 GMT</pubDate>",
      "",
    ).replace(
      "<link>https://podcasters.spotify.com/pod/show/coten/episodes/66-10COTEN-RADIO-10-e3m0l9q</link>",
      "",
    );

    // 最初に見つけた欄で投げると、直して走らせ直すまで次の欠けが見えない。
    expect(() => parseFeed(withoutBoth)).toThrow(/link/);
    expect(() => parseFeed(withoutBoth)).toThrow(/pubDate/);
  });

  it("正の整数でない itunes:season で投げる", () => {
    const brokenSeason = FEED_XML.replace(
      "<itunes:season>66</itunes:season>",
      "<itunes:season>いち</itunes:season>",
    );

    expect(() => parseFeed(brokenSeason)).toThrow("正の整数でない");
  });

  it("日時として読めない pubDate で投げる", () => {
    const brokenPubDate = FEED_XML.replace(
      "Wed, 19 Aug 2026 21:00:00 GMT",
      "きのう",
    );

    expect(() => parseFeed(brokenPubDate)).toThrow("日時として読めない");
  });
});
