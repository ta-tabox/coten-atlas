import { describe, expect, it } from "vitest";
import {
  linkSpotifyEpisodes,
  readSpotifyCredentials,
} from "@/lib/feed/spotify-links";
import type { Episode } from "@/lib/schema/episode";
import type { SpotifyEpisode } from "@/lib/schema/spotify";

const URL_A = "https://open.spotify.com/episode/aaaa";
const URL_B = "https://open.spotify.com/episode/bbbb";
const APPLE_URL = "https://podcasts.apple.com/jp/podcast/x/id1450522865?i=1";

/**
 * 回の 1 件。
 * 結ぶ処理に効くのは `title`・`pubDate`・`links` だけである。
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

/** Spotify の回の 1 件。 */
function spotify(overrides: Partial<SpotifyEpisode>): SpotifyEpisode {
  return {
    title: "【67-1】題",
    releaseDate: "2026-11-09",
    url: URL_A,
    ...overrides,
  };
}

describe("linkSpotifyEpisodes", () => {
  it("公開日と題が一致する回の links へ Spotify の URL を足し、他の基盤の URL を残す", () => {
    const result = linkSpotifyEpisodes(
      [episode({ links: { "apple-podcasts": APPLE_URL } })],
      [spotify({})],
    );

    expect(result.episodes[0].links).toEqual({
      "apple-podcasts": APPLE_URL,
      spotify: URL_A,
    });
    expect(result.unmatched).toEqual([]);
    expect(result.ambiguous).toEqual([]);
  });

  it("題の前後の空白と全角半角の違いを均して結ぶ", () => {
    const result = linkSpotifyEpisodes(
      [episode({ title: "【番外編＃150】質問を  浴びせた" })],
      [
        spotify({
          title: " 【番外編#150】質問を 浴びせた ",
          releaseDate: "2026-11-09",
        }),
      ],
    );

    expect(result.episodes[0].links.spotify).toBe(URL_A);
  });

  it("API に無い回は unmatched へ入れ、前回の links を変えない", () => {
    const previous = episode({ links: { spotify: URL_B } });
    const result = linkSpotifyEpisodes([previous], []);

    expect(result.unmatched).toEqual([previous]);
    expect(result.episodes[0].links).toEqual({ spotify: URL_B });
  });

  it("公開日が違う回は、題が同じでも結ばない", () => {
    const result = linkSpotifyEpisodes(
      [episode({})],
      [spotify({ releaseDate: "2026-11-10" })],
    );

    expect(result.unmatched).toHaveLength(1);
    expect(result.episodes[0].links).toEqual({});
  });

  it("同じ日に配信された別の題の 2 回を、それぞれの URL で結ぶ", () => {
    const result = linkSpotifyEpisodes(
      [
        episode({ guid: "g1", title: "【特別編】前編" }),
        episode({ guid: "g2", title: "【特別編】後編" }),
      ],
      [
        spotify({ title: "【特別編】後編", url: URL_B }),
        spotify({ title: "【特別編】前編", url: URL_A }),
      ],
    );

    expect(result.episodes.map(({ links }) => links.spotify)).toEqual([
      URL_A,
      URL_B,
    ]);
  });

  it("同じ日に同じ題の 2 回が API にあるときは ambiguous へ入れ、結ばない", () => {
    const result = linkSpotifyEpisodes(
      [episode({})],
      [spotify({ url: URL_A }), spotify({ url: URL_B })],
    );

    expect(result.ambiguous).toHaveLength(1);
    expect(result.episodes[0].links).toEqual({});
  });

  it("同じ日に同じ題の 2 回が episodes にあるときは、どちらも ambiguous へ入れる", () => {
    const result = linkSpotifyEpisodes(
      [episode({ guid: "g1" }), episode({ guid: "g2" })],
      [spotify({})],
    );

    expect(result.ambiguous).toHaveLength(2);
    expect(
      result.episodes.every(({ links }) => links.spotify === undefined),
    ).toBe(true);
  });
});

describe("readSpotifyCredentials", () => {
  it("2 つの変数が揃っていれば認証情報を返す", () => {
    expect(
      readSpotifyCredentials({
        SPOTIFY_CLIENT_ID: "id",
        SPOTIFY_CLIENT_SECRET: "secret",
      }),
    ).toEqual({ clientId: "id", clientSecret: "secret" });
  });

  it("どちらかが無いか空なら null を返す", () => {
    expect(readSpotifyCredentials({ SPOTIFY_CLIENT_ID: "id" })).toBeNull();
    expect(
      readSpotifyCredentials({
        SPOTIFY_CLIENT_ID: "id",
        SPOTIFY_CLIENT_SECRET: "",
      }),
    ).toBeNull();
  });
});
