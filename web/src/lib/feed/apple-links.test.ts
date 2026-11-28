import { describe, expect, it } from "vitest";
import {
  findAppleEpisode,
  listUnlinkedEpisodes,
  setAppleUrls,
} from "@/lib/feed/apple-links";
import type { Episode } from "@/lib/schema/episode";

const OLD_URL = "https://podcasts.apple.com/jp/podcast/old/id1450522865?i=1";
const NEW_URL = "https://podcasts.apple.com/jp/podcast/new/id1450522865?i=2";

/**
 * 回の 1 件。
 * links と割当以外は結ぶ処理に効かない。
 */
function episode(overrides: Partial<Episode>): Episode {
  return {
    guid: "guid-1",
    title: "【67-1】題",
    pubDate: "2026-11-09T21:00:00.000Z",
    season: 67,
    seriesId: "mongol-shurai",
    links: {},
    ...overrides,
  };
}

describe("setAppleUrls", () => {
  it("guid が一致する回の links へ Apple Podcasts の URL を入れる", () => {
    const result = setAppleUrls(
      [episode({ guid: "guid-1" })],
      [{ guid: "guid-1", url: NEW_URL }],
    );

    expect(result[0].links).toEqual({ "apple-podcasts": NEW_URL });
  });

  it("前後に空白を持つ guid の回も、trim 済みの guid の URL で結ぶ", () => {
    // 初期の 5 件は RSS の guid の前に空白が付く。
    // episodes.json は trim 済みの guid を持つので、API の guid も trim 済みで渡る。
    const result = setAppleUrls(
      [episode({ guid: "https://anchor.fm/coten/episodes/94" })],
      [{ guid: "https://anchor.fm/coten/episodes/94", url: NEW_URL }],
    );

    expect(result[0].links["apple-podcasts"]).toBe(NEW_URL);
  });

  it("API に無い回の links は、前回から引き継いだ URL を含めて変えない", () => {
    const previous = episode({
      guid: "guid-old",
      links: { "apple-podcasts": OLD_URL },
    });
    const result = setAppleUrls(
      [previous, episode({ guid: "guid-none" })],
      [{ guid: "guid-other", url: NEW_URL }],
    );

    expect(result.map(({ links }) => links)).toEqual([
      { "apple-podcasts": OLD_URL },
      {},
    ]);
  });

  it("API が返した URL で前回の URL を置き換える", () => {
    const result = setAppleUrls(
      [episode({ links: { "apple-podcasts": OLD_URL } })],
      [{ guid: "guid-1", url: NEW_URL }],
    );

    expect(result[0].links["apple-podcasts"]).toBe(NEW_URL);
  });

  it("Apple Podcasts 以外の基盤の links を残す", () => {
    const result = setAppleUrls(
      [episode({ links: { spotify: "https://open.spotify.com/episode/x" } })],
      [{ guid: "guid-1", url: NEW_URL }],
    );

    expect(result[0].links).toEqual({
      spotify: "https://open.spotify.com/episode/x",
      "apple-podcasts": NEW_URL,
    });
  });
});

describe("listUnlinkedEpisodes", () => {
  it("Apple Podcasts の URL を持たない回だけを返す", () => {
    const linked = episode({
      guid: "linked",
      links: { "apple-podcasts": OLD_URL },
    });
    const unlinked = episode({ guid: "unlinked" });

    expect(listUnlinkedEpisodes([linked, unlinked])).toEqual([unlinked]);
  });

  it("Apple Podcasts 以外の基盤の URL だけを持つ回は、持たない回に数える", () => {
    const spotifyOnly = episode({
      links: { spotify: "https://open.spotify.com/episode/x" },
    });

    expect(listUnlinkedEpisodes([spotifyOnly])).toEqual([spotifyOnly]);
  });
});

describe("findAppleEpisode", () => {
  const found = [
    { guid: "guid-near", url: OLD_URL },
    { guid: "guid-target", url: NEW_URL },
  ];

  it("検索結果の 2 件目以降でも、guid が一致する回を返す", () => {
    expect(findAppleEpisode(found, "guid-target")).toEqual({
      guid: "guid-target",
      url: NEW_URL,
    });
  });

  it("guid が一致する回が無ければ undefined を返す", () => {
    expect(findAppleEpisode(found, "guid-other")).toBeUndefined();
  });
});
