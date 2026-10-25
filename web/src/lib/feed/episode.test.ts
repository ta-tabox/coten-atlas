import { describe, expect, it } from "vitest";
import { type Assignment, toEpisode } from "@/lib/feed/episode";
import type { Episode } from "@/lib/schema/episode";

const GUID = "4d80b4a3-deee-41f3-8045-d06ade19132f";

/** 帝政ローマ編の 1 回を、season 66 で割り当てた結果。 */
const ASSIGNMENT: Assignment = {
  item: {
    guid: GUID,
    title: "【66-10】五賢帝時代はじまる！【COTEN RADIO 帝政ローマ編10】",
    pubDate: "2026-08-19T21:00:00.000Z",
    audioUrl: "https://anchor.fm/s/8c2088c/podcast/play/122753786/episode.mp3",
    season: 66,
    episodeNumber: 10,
    durationSec: 3168,
  },
  key: { source: "title", season: 66 },
  seriesId: "imperial-rome",
};

const APPLE_PODCASTS_URL =
  "https://podcasts.apple.com/jp/podcast/id1450522865?i=1000000000000";

/** 前回の同期で、同じ guid の回が Apple Podcasts の URL を持っていた状態。 */
const PREVIOUS_EPISODE: Episode = {
  guid: GUID,
  title: "【66-10】五賢帝時代はじまる！",
  pubDate: "2026-08-19T21:00:00.000Z",
  season: 66,
  seriesId: "imperial-rome",
  links: [{ platform: "apple-podcasts", url: APPLE_PODCASTS_URL }],
};

describe("toEpisode", () => {
  it("前回の同じ guid の回が持っていた links を引き継ぐ", () => {
    const previous = new Map([[GUID, PREVIOUS_EPISODE]]);

    expect(toEpisode(ASSIGNMENT, previous).links).toEqual([
      { platform: "apple-podcasts", url: APPLE_PODCASTS_URL },
    ]);
  });

  it("前回に無い回の links は、フィードの link を入れず空にする", () => {
    expect(toEpisode(ASSIGNMENT, new Map()).links).toEqual([]);
  });

  it("links 以外の欄は前回の値でなくフィードと割当から組み直す", () => {
    const previous = new Map([[GUID, PREVIOUS_EPISODE]]);
    const episode = toEpisode(ASSIGNMENT, previous);

    expect(episode.title).toBe(ASSIGNMENT.item.title);
    expect(episode.season).toBe(66);
    expect(episode.seriesId).toBe("imperial-rome");
  });
});
