import { describe, expect, it } from "vitest";
import { assignSeriesId } from "@/lib/feed/assign";
import type { FeedItem } from "@/lib/feed/parse";
import type { Series, SeriesCollection } from "@/lib/schema/series";

/** 渡したシリーズだけを持つ series.geojson 相当。 */
function seriesOf(...features: Series[]): SeriesCollection {
  return { type: "FeatureCollection", features };
}

/** 割当だけを見たいので、geometry と年代は当たり障りのない値で埋める。 */
function series(id: string, season: number): Series {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [12.5, 41.9] },
    properties: {
      id,
      title: id,
      kind: "point",
      timeRange: { start: -27, end: 180 },
      summary: "",
      region: "ヨーロッパ",
      season,
      links: [],
      tags: [],
    },
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
    const assigned = assignSeriesId(
      item({}),
      seriesOf(series("teisei-roma", 66)),
    );

    expect(assigned).toBe("teisei-roma");
  });

  it("season を持たない回を未割当にする", () => {
    const assigned = assignSeriesId(
      item({ title: "【特別編】年末のごあいさつ", season: null }),
      seriesOf(series("teisei-roma", 66)),
    );

    expect(assigned).toBeNull();
  });

  it("番外編の回を、season が索引に有っても未割当にする", () => {
    const assigned = assignSeriesId(
      item({ title: "【番外編＃115】中川政七商店とコテンラジオ", season: 115 }),
      seriesOf(series("teisei-roma", 66), series("nakagawa", 115)),
    );

    expect(assigned).toBeNull();
  });

  it("索引に無い season の回を未割当にする", () => {
    const assigned = assignSeriesId(
      item({ season: 65 }),
      seriesOf(series("teisei-roma", 66)),
    );

    expect(assigned).toBeNull();
  });

  it("シリーズが 1 件も無ければ全件を未割当にする", () => {
    expect(assignSeriesId(item({}), seriesOf())).toBeNull();
  });
});
