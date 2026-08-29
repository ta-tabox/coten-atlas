import { describe, expect, it } from "vitest";
import {
  episodeCollectionSchema,
  episodeSchema,
  parseEpisodes,
} from "@/lib/schema/episode";

/** #13 で実地確認したフィードの形を、正規化後のかたちへ直した 1 件。 */
const episode = {
  guid: "0f9d4b52-1f3a-4c9e-9b7a-2f1c8d6e5a40",
  title: "【COTEN RADIO 三国志編1】黄巾の乱",
  pubDate: "2026-08-19T21:00:00Z",
  audioUrl: "https://anchor.fm/s/8c2088c/podcast/play/12345/episode.mp3",
  season: 22,
  themeId: "sangokushi",
  links: [
    { platform: "spotify", url: "https://open.spotify.com/episode/abc123" },
  ],
};

/** エピソード 1 件だけを持つ episodes.json 相当。 */
function collectionOf(...episodes: unknown[]): unknown {
  return { syncedAt: "2026-08-19T22:00:00Z", episodes };
}

describe("episodeSchema", () => {
  it("正規化後の 1 件を通す", () => {
    const parsed = episodeSchema.parse(episode);

    expect(parsed.season).toBe(22);
  });

  it("guid の前後の空白を落として受ける", () => {
    const parsed = episodeSchema.parse({
      ...episode,
      guid: " https://anchor.fm/coten/episodes/e000001",
    });

    expect(parsed.guid).toBe("https://anchor.fm/coten/episodes/e000001");
  });

  it("season も themeId も無い回を通す", () => {
    const parsed = episodeSchema.parse({
      ...episode,
      season: null,
      themeId: null,
    });

    expect(parsed.themeId).toBeNull();
  });

  it("正規化前の RFC 822 の pubDate を落とす", () => {
    const result = episodeSchema.safeParse({
      ...episode,
      pubDate: "Wed, 19 Aug 2026 21:00:00 GMT",
    });

    expect(result.success).toBe(false);
  });

  it("空白だけの guid を落とす", () => {
    const result = episodeSchema.safeParse({ ...episode, guid: "   " });

    expect(result.success).toBe(false);
  });

  it("未知の配信基盤を落とす", () => {
    const result = episodeSchema.safeParse({
      ...episode,
      links: [{ platform: "apple", url: "https://podcasts.apple.com/x" }],
    });

    expect(result.success).toBe(false);
  });
});

describe("episodeCollectionSchema", () => {
  it("guid が重複した 2 件を落とす", () => {
    const result = episodeCollectionSchema.safeParse(
      collectionOf(episode, { ...episode, title: "別の回" }),
    );

    expect(result.success).toBe(false);
  });

  it("エピソードが 0 件でも通す", () => {
    expect(episodeCollectionSchema.safeParse(collectionOf()).success).toBe(
      true,
    );
  });
});

describe("parseEpisodes", () => {
  it("落とした理由を文脈付きで投げる", () => {
    expect(() => parseEpisodes({ episodes: [] })).toThrow(/episodes/);
  });
});
