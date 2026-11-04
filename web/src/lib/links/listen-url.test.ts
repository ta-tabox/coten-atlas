import { describe, expect, it } from "vitest";
import { listenUrlOf, SHOW_URLS } from "@/lib/links/listen-url";

const SPOTIFY_EPISODE_URL =
  "https://open.spotify.com/episode/0000000000000000000000";

/** Spotify の回の URL だけを持ち、Apple Podcasts と YouTube の URL を持たない回。 */
const SPOTIFY_ONLY = {
  links: [{ platform: "spotify" as const, url: SPOTIFY_EPISODE_URL }],
};

describe("listenUrlOf", () => {
  it("回の URL を持つ基盤では、その回の URL を返す", () => {
    expect(listenUrlOf(SPOTIFY_ONLY, "spotify")).toBe(SPOTIFY_EPISODE_URL);
  });

  it("回の URL を持たない基盤では、その基盤の番組ページを返す", () => {
    expect(listenUrlOf(SPOTIFY_ONLY, "apple-podcasts")).toBe(
      SHOW_URLS["apple-podcasts"],
    );
    expect(listenUrlOf(SPOTIFY_ONLY, "youtube")).toBe(SHOW_URLS.youtube);
  });

  it("links が空の回では、どの基盤でも番組ページを返す", () => {
    expect(listenUrlOf({ links: [] }, "spotify")).toBe(SHOW_URLS.spotify);
  });
});
