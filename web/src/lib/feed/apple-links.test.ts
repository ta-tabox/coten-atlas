import { describe, expect, it } from "vitest";
import { listSearchTerms, withAppleUrls } from "@/lib/feed/apple-links";
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

describe("withAppleUrls", () => {
  it("guid が一致する回の links へ Apple Podcasts の URL を入れる", () => {
    const result = withAppleUrls(
      [episode({ guid: "guid-1" })],
      [{ guid: "guid-1", url: NEW_URL }],
    );

    expect(result[0].links).toEqual({ "apple-podcasts": NEW_URL });
  });

  it("前後に空白を持つ guid の回も、trim 済みの guid の URL で結ぶ", () => {
    // 初期の 5 件は RSS の guid の前に空白が付く。
    // episodes.json は trim 済みの guid を持つので、API の guid も trim 済みで渡る。
    const result = withAppleUrls(
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
    const result = withAppleUrls(
      [previous, episode({ guid: "guid-none" })],
      [{ guid: "guid-other", url: NEW_URL }],
    );

    expect(result.map(({ links }) => links)).toEqual([
      { "apple-podcasts": OLD_URL },
      {},
    ]);
  });

  it("API が返した URL で前回の URL を置き換える", () => {
    const result = withAppleUrls(
      [episode({ links: { "apple-podcasts": OLD_URL } })],
      [{ guid: "guid-1", url: NEW_URL }],
    );

    expect(result[0].links["apple-podcasts"]).toBe(NEW_URL);
  });

  it("Apple Podcasts 以外の基盤の links を残す", () => {
    const result = withAppleUrls(
      [episode({ links: { spotify: "https://open.spotify.com/episode/x" } })],
      [{ guid: "guid-1", url: NEW_URL }],
    );

    expect(result[0].links).toEqual({
      spotify: "https://open.spotify.com/episode/x",
      "apple-podcasts": NEW_URL,
    });
  });
});

describe("listSearchTerms", () => {
  const series = [
    { id: "mongol-shurai", title: "モンゴル帝国襲来" },
    { id: "sparta", title: "スパルタ" },
  ];

  it("URL を持たない回のシリーズの題に COTEN RADIO を付けた語を、重複なしで返す", () => {
    const terms = listSearchTerms(
      [
        episode({ guid: "a", seriesId: "mongol-shurai" }),
        episode({ guid: "b", seriesId: "mongol-shurai" }),
        episode({ guid: "c", seriesId: "sparta" }),
      ],
      series,
    );

    expect(terms).toEqual([
      "モンゴル帝国襲来 COTEN RADIO",
      "スパルタ COTEN RADIO",
    ]);
  });

  it("URL を持つ回のシリーズの語は返さない", () => {
    const terms = listSearchTerms(
      [episode({ links: { "apple-podcasts": OLD_URL } })],
      series,
    );

    expect(terms).toEqual([]);
  });

  it("シリーズに割り当たらない回が URL を持たなければ、番組名と回の種別の語を返す", () => {
    const terms = listSearchTerms(
      [episode({ season: null, seriesId: null })],
      series,
    );

    expect(terms).toContain("COTEN RADIO 特別編");
    expect(terms).toContain("コテンラジオ");
  });

  it("割り当たった seriesId が series に無ければ throw する", () => {
    expect(() =>
      listSearchTerms([episode({ seriesId: "unknown" })], series),
    ).toThrow("seriesId が series に無い: unknown");
  });
});
