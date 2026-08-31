import { describe, expect, it } from "vitest";
import type { EpisodeCollection } from "@/lib/schema/episode";
import { brokenSeriesReferences } from "@/lib/schema/references";
import type { SeriesCollection } from "@/lib/schema/series";

/** 検査に要る欄（id と season）だけを差し替えた FeatureCollection を作る。 */
function seriesCollectionOf(
  ...entries: { id: string; season: number }[]
): SeriesCollection {
  return {
    type: "FeatureCollection",
    features: entries.map(({ id, season }) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [22.43, 37.07] },
      properties: {
        id,
        title: id,
        kind: "place",
        timeRange: { start: -900, end: -200 },
        summary: "",
        region: "ギリシア",
        season,
        links: [],
        tags: [],
      },
    })),
  };
}

/** 検査に要る欄（guid・season・seriesId）だけを差し替えた episodes.json 相当を作る。 */
function episodeCollectionOf(
  ...entries: { guid: string; season: number | null; seriesId: string | null }[]
): EpisodeCollection {
  return {
    syncedAt: "2026-08-19T22:00:00Z",
    episodes: entries.map(({ guid, season, seriesId }) => ({
      guid,
      title: guid,
      pubDate: "2026-08-19T21:00:00Z",
      season,
      seriesId,
      links: [],
    })),
  };
}

describe("brokenSeriesReferences", () => {
  it("実在するシリーズの id と season を指していれば空", () => {
    const problems = brokenSeriesReferences(
      episodeCollectionOf({ guid: "a", season: 2, seriesId: "sparta" }),
      seriesCollectionOf({ id: "sparta", season: 2 }),
    );

    expect(problems).toEqual([]);
  });

  it("どのシリーズにも無い seriesId を名指す", () => {
    const problems = brokenSeriesReferences(
      episodeCollectionOf({ guid: "a", season: 2, seriesId: "athens" }),
      seriesCollectionOf({ id: "sparta", season: 2 }),
    );

    expect(problems).toEqual([expect.stringContaining("athens")]);
  });

  it("seriesId の指すシリーズと season が食い違えば名指す", () => {
    const problems = brokenSeriesReferences(
      episodeCollectionOf({ guid: "a", season: 3, seriesId: "sparta" }),
      seriesCollectionOf({ id: "sparta", season: 2 }),
    );

    expect(problems).toEqual([expect.stringContaining("食い違う")]);
  });

  it("未割当の回は見ない", () => {
    const problems = brokenSeriesReferences(
      episodeCollectionOf({ guid: "a", season: 99, seriesId: null }),
      seriesCollectionOf({ id: "sparta", season: 2 }),
    );

    expect(problems).toEqual([]);
  });
});
