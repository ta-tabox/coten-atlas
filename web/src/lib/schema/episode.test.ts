import { describe, expect, it } from "vitest";
import {
  episodeCollectionSchema,
  episodeSchema,
  parseEpisodes,
} from "@/lib/schema/episode";

/** #13 で実地確認したフィードの形を、正規化後のかたちへ直した 1 件。 */
const episode = {
  guid: "4d80b4a3-deee-41f3-8045-d06ade19132f",
  title: "【66-10】五賢帝時代はじまる！【COTEN RADIO 帝政ローマ編10】",
  pubDate: "2026-08-19T21:00:00Z",
  season: 66,
  seriesId: "teisei-roma",
  links: [
    {
      platform: "spotify",
      url: "https://podcasters.spotify.com/pod/show/coten/episodes/66-10COTEN-RADIO-10-e3m0l9q",
    },
  ],
};

/** エピソード 1 件だけを持つ episodes.json 相当。 */
function collectionOf(...episodes: unknown[]): unknown {
  return { syncedAt: "2026-08-19T22:00:00Z", episodes };
}

describe("episodeSchema", () => {
  it("正規化後の 1 件を通す", () => {
    const parsed = episodeSchema.parse(episode);

    expect(parsed.season).toBe(66);
  });

  it("guid の前後の空白を落として受ける", () => {
    const parsed = episodeSchema.parse({
      ...episode,
      guid: " https://anchor.fm/coten/episodes/e000001",
    });

    expect(parsed.guid).toBe("https://anchor.fm/coten/episodes/e000001");
  });

  it("season も seriesId も無い回を通す", () => {
    const parsed = episodeSchema.parse({
      ...episode,
      season: null,
      seriesId: null,
    });

    expect(parsed.seriesId).toBeNull();
  });

  it("season の無い回に seriesId が付いていれば落とす", () => {
    const result = episodeSchema.safeParse({ ...episode, season: null });

    expect(result.success).toBe(false);
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

  it("同じ配信基盤のリンクを 2 本持つ回を落とす", () => {
    const result = episodeSchema.safeParse({
      ...episode,
      links: [
        {
          platform: "spotify",
          url: "https://podcasters.spotify.com/pod/show/coten/episodes/a",
        },
        {
          platform: "spotify",
          url: "https://podcasters.spotify.com/pod/show/coten/episodes/b",
        },
      ],
    });

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
