import { describe, expect, it } from "vitest";
import { assignableSeasonOf, assignSeriesId } from "@/lib/feed/assign";
import type { FeedItem } from "@/lib/feed/schema";
import type { Series } from "@/lib/schema/series";

/** 割当だけを見たいので、代表点と年代は当たり障りのない値で埋める。 */
function series(id: string, season: number): Series {
  return {
    id,
    title: id,
    kind: "place",
    anchor: `${id}-anchor`,
    timeRange: { start: -27, end: 180 },
    summary: "",
    region: "ヨーロッパ",
    season,
    links: [],
    tags: ["集団"],
  };
}

/**
 * フィードの 1 件。
 * 題名と season だけが割当に効く。
 */
function item(overrides: Partial<FeedItem>): FeedItem {
  return {
    guid: "4d80b4a3-deee-41f3-8045-d06ade19132f",
    title: "【66-10】五賢帝時代はじまる！【COTEN RADIO 帝政ローマ編10】",
    link: "https://podcasters.spotify.com/pod/show/coten/episodes/66-10",
    pubDate: "2026-08-19T21:00:00.000Z",
    audioUrl: "https://anchor.fm/s/8c2088c/podcast/play/122753786/episode.mp3",
    season: 66,
    episodeNumber: 10,
    durationSec: 3168,
    ...overrides,
  };
}

describe("assignSeriesId", () => {
  it("season が索引に有るシリーズの id を返す", () => {
    const assigned = assignSeriesId(item({}), [series("teisei-roma", 66)]);

    expect(assigned).toBe("teisei-roma");
  });

  it("season を持たない回を未割当にする", () => {
    const assigned = assignSeriesId(
      item({ title: "【特別編】年末のごあいさつ", season: null }),
      [series("teisei-roma", 66)],
    );

    expect(assigned).toBeNull();
  });

  it("番外編の回を、season が索引に有っても未割当にする", () => {
    const assigned = assignSeriesId(
      item({ title: "【番外編＃115】中川政七商店とコテンラジオ", season: 115 }),
      [series("teisei-roma", 66), series("nakagawa", 115)],
    );

    expect(assigned).toBeNull();
  });

  it("索引に無い season の回を未割当にする", () => {
    const assigned = assignSeriesId(item({ season: 65 }), [
      series("teisei-roma", 66),
    ]);

    expect(assigned).toBeNull();
  });

  it("シリーズが 1 件も無ければ全件を未割当にする", () => {
    expect(assignSeriesId(item({}), [])).toBeNull();
  });
});

describe("assignableSeasonOf", () => {
  it("season を持つ回はその値を返す", () => {
    expect(assignableSeasonOf(item({ season: 66 }))).toBe(66);
  });

  it("番外編は season を持っていても null を返す", () => {
    const bonus = item({
      title: "【番外編＃115】中川政七商店とコテンラジオ",
      season: 115,
    });

    expect(assignableSeasonOf(bonus)).toBeNull();
  });

  it("season を持たない回は null を返す", () => {
    const special = item({ title: "【特別編】年末のごあいさつ", season: null });

    expect(assignableSeasonOf(special)).toBeNull();
  });
});
