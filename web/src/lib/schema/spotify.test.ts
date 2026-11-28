import { describe, expect, it } from "vitest";
import {
  parseSpotifyEpisodesPage,
  parseSpotifyToken,
} from "@/lib/schema/spotify";

/**
 * 応答の抜粋。
 * `null` の要素と、検査に使わない欄を含む。
 */
const PAGE = {
  total: 788,
  items: [
    {
      id: "75lEv5z7amg6yAo5DSk6F7",
      name: "【特別編】題【COTEN RADIO ピーター・ティール編2】",
      release_date: "2026-11-25",
      external_urls: {
        spotify: "https://open.spotify.com/episode/75lEv5z7amg6yAo5DSk6F7",
      },
      duration_ms: 2651916,
    },
    null,
  ],
  next: "https://api.spotify.com/v1/shows/x/episodes?offset=50&limit=50&market=JP",
};

describe("parseSpotifyEpisodesPage", () => {
  it("null の要素を読み飛ばし、回と次のページの URL を返す", () => {
    expect(parseSpotifyEpisodesPage(PAGE)).toEqual({
      episodes: [
        {
          title: "【特別編】題【COTEN RADIO ピーター・ティール編2】",
          releaseDate: "2026-11-25",
          url: "https://open.spotify.com/episode/75lEv5z7amg6yAo5DSk6F7",
        },
      ],
      nextUrl: PAGE.next,
    });
  });

  it("最後のページの next が null なら nextUrl も null にする", () => {
    expect(
      parseSpotifyEpisodesPage({ items: [], next: null }).nextUrl,
    ).toBeNull();
  });

  it("null でない要素に release_date が無ければ throw する", () => {
    expect(() =>
      parseSpotifyEpisodesPage({
        items: [
          {
            name: "題",
            external_urls: { spotify: "https://open.spotify.com/episode/a" },
          },
        ],
        next: null,
      }),
    ).toThrow("Spotify の回がスキーマに合わない");
  });

  it("items が無い応答は throw する", () => {
    expect(() => parseSpotifyEpisodesPage({ error: { status: 404 } })).toThrow(
      "Spotify の回の一覧がスキーマに合わない",
    );
  });
});

describe("parseSpotifyToken", () => {
  it("access_token を返す", () => {
    expect(parseSpotifyToken({ access_token: "t", token_type: "Bearer" })).toBe(
      "t",
    );
  });

  it("access_token が無ければ throw する", () => {
    expect(() => parseSpotifyToken({ error: "invalid_client" })).toThrow(
      "Spotify のトークンの応答がスキーマに合わない",
    );
  });
});
