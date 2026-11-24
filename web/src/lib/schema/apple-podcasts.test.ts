import { describe, expect, it } from "vitest";
import { parseAppleResponse } from "@/lib/schema/apple-podcasts";

const COLLECTION_ID = 1450522865;

const EPISODE_URL =
  "https://podcasts.apple.com/jp/podcast/slug/id1450522865?i=1000803471242&uo=4";

/** 2026-11-24 に lookup API が返した応答から、番組の行・回の行・他の番組の回の行を 1 件ずつ抜いたもの。 */
const RESPONSE = {
  resultCount: 3,
  results: [
    {
      wrapperType: "track",
      kind: "podcast",
      collectionId: COLLECTION_ID,
      trackName: "歴史を面白く学ぶコテンラジオ （COTEN RADIO）",
    },
    {
      wrapperType: "podcastEpisode",
      kind: "podcast-episode",
      collectionId: COLLECTION_ID,
      episodeGuid: "e00445dd-947d-43b9-9c2d-360604189e25",
      trackViewUrl: EPISODE_URL,
      releaseDate: "2026-11-22T21:00:00Z",
    },
    {
      wrapperType: "podcastEpisode",
      kind: "podcast-episode",
      collectionId: 1,
      trackName: "他の番組の回",
    },
  ],
};

describe("parseAppleResponse", () => {
  it("対象の番組の回だけを guid と URL にして返し、番組の行と他の番組の回は読み飛ばす", () => {
    expect(parseAppleResponse(RESPONSE, COLLECTION_ID)).toEqual([
      { guid: "e00445dd-947d-43b9-9c2d-360604189e25", url: EPISODE_URL },
    ]);
  });

  it("episodeGuid の前後の空白を除いて返す", () => {
    const response = {
      results: [
        {
          kind: "podcast-episode",
          collectionId: COLLECTION_ID,
          episodeGuid: " https://anchor.fm/coten/episodes/94COTEN-RADIO-ebu6ld",
          trackViewUrl: EPISODE_URL,
        },
      ],
    };

    expect(parseAppleResponse(response, COLLECTION_ID)[0].guid).toBe(
      "https://anchor.fm/coten/episodes/94COTEN-RADIO-ebu6ld",
    );
  });

  it("results が無い応答は throw する", () => {
    expect(() =>
      parseAppleResponse({ errorMessage: "x" }, COLLECTION_ID),
    ).toThrow("Apple Podcasts の応答がスキーマに合わない");
  });

  it("対象の番組の回が trackViewUrl を持たなければ throw する", () => {
    const response = {
      results: [
        {
          kind: "podcast-episode",
          collectionId: COLLECTION_ID,
          episodeGuid: "guid-1",
        },
      ],
    };

    expect(() => parseAppleResponse(response, COLLECTION_ID)).toThrow(
      "Apple Podcasts の回がスキーマに合わない",
    );
  });
});
