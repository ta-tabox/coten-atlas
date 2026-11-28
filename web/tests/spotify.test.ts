import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchSpotifyEpisodes } from "@scripts/spotify";

const CREDENTIALS = { clientId: "id", clientSecret: "secret" };

/** 応答の抜粋の 1 回。 */
function item(id: string, name: string) {
  return {
    name,
    release_date: "2026-11-25",
    external_urls: { spotify: `https://open.spotify.com/episode/${id}` },
  };
}

/** `body` を JSON で返す応答。 */
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchSpotifyEpisodes", () => {
  it("next をたどって全ページの回を集め、null の要素を読み飛ばす", async () => {
    const next = "https://api.spotify.com/v1/shows/x/episodes?offset=50";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({ access_token: "token" }))
      .mockResolvedValueOnce(json({ items: [item("a", "一"), null], next }))
      .mockResolvedValueOnce(json({ items: [item("b", "二")], next: null }));

    vi.stubGlobal("fetch", fetchMock);

    const episodes = await fetchSpotifyEpisodes(CREDENTIALS);

    expect(episodes?.map(({ url }) => url)).toEqual([
      "https://open.spotify.com/episode/a",
      "https://open.spotify.com/episode/b",
    ]);
    expect(fetchMock.mock.calls[2][0]).toBe(next);
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe(
      "Bearer token",
    );
  });

  it("取得に失敗したら、標準エラーへ理由を出して null を返す", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({}, 401)));

    expect(await fetchSpotifyEpisodes(CREDENTIALS)).toBeNull();
    expect(error).toHaveBeenCalledWith(expect.stringContaining("401"));
  });
});
