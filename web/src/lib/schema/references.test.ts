import { describe, expect, it } from "vitest";
import type { EpisodeCollection } from "@/lib/schema/episode";
import { ERA_END_PRESENT, type EraList } from "@/lib/schema/era";
import {
  brokenSeriesReferences,
  seriesOutsideEraSpace,
} from "@/lib/schema/references";
import type { SeriesList } from "@/lib/schema/series";

/** 検査に要る欄（id・season・timeRange）だけを差し替えたシリーズ一覧を作る。 */
function seriesListOf(
  ...entries: {
    id: string;
    season: number;
    timeRange?: { start: number; end: number };
  }[]
): SeriesList {
  return entries.map(({ id, season, timeRange }) => ({
    id,
    title: id,
    kind: "place",
    anchor: `${id}-anchor`,
    timeRange: timeRange ?? { start: -900, end: -200 },
    summary: "",
    region: "ギリシア",
    season,
    links: [],
    tags: [],
  }));
}

/** 検査に要る欄（start と end）だけを差し替えた era の列を作る。 */
function eraListOf(
  ...spans: { start: number; end: number | typeof ERA_END_PRESENT }[]
): EraList {
  return spans.map((span, index) => ({
    id: `era-${index}`,
    label: `era-${index}`,
    start: span.start,
    end: span.end,
  }));
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
      seriesListOf({ id: "sparta", season: 2 }),
    );

    expect(problems).toEqual([]);
  });

  it("どのシリーズにも無い seriesId を名指す", () => {
    const problems = brokenSeriesReferences(
      episodeCollectionOf({ guid: "a", season: 2, seriesId: "athens" }),
      seriesListOf({ id: "sparta", season: 2 }),
    );

    expect(problems).toEqual([expect.stringContaining("athens")]);
  });

  it("seriesId の指すシリーズと season が食い違えば名指す", () => {
    const problems = brokenSeriesReferences(
      episodeCollectionOf({ guid: "a", season: 3, seriesId: "sparta" }),
      seriesListOf({ id: "sparta", season: 2 }),
    );

    expect(problems).toEqual([expect.stringContaining("食い違う")]);
  });

  it("未割当の回は見ない", () => {
    const problems = brokenSeriesReferences(
      episodeCollectionOf({ guid: "a", season: 99, seriesId: null }),
      seriesListOf({ id: "sparta", season: 2 }),
    );

    expect(problems).toEqual([]);
  });
});

describe("seriesOutsideEraSpace", () => {
  /** -800 に始まり、末尾が終わっていない 2 区間の era 空間。 */
  const openEnded = eraListOf(
    { start: -800, end: 550 },
    { start: 550, end: ERA_END_PRESENT },
  );

  /** -800 に始まり 1450 で終わる、閉じた 2 区間の era 空間。 */
  const closed = eraListOf(
    { start: -800, end: 550 },
    { start: 550, end: 1450 },
  );

  it("era 空間と重なる timeRange なら空", () => {
    const problems = seriesOutsideEraSpace(
      seriesListOf({ id: "sparta", season: 2 }),
      openEnded,
    );

    expect(problems).toEqual([]);
  });

  it("最初の era より前に終わる timeRange を名指す", () => {
    const problems = seriesOutsideEraSpace(
      seriesListOf({
        id: "primordial",
        season: 3,
        timeRange: { start: -5000, end: -1000 },
      }),
      openEnded,
    );

    expect(problems).toEqual([expect.stringContaining("primordial")]);
  });

  it("end が最初の era の start と同じ年なら重なる（timeRange は閉区間）", () => {
    const problems = seriesOutsideEraSpace(
      seriesListOf({
        id: "edge",
        season: 4,
        timeRange: { start: -2000, end: -800 },
      }),
      openEnded,
    );

    expect(problems).toEqual([]);
  });

  it("末尾の era が終わっていなければ、後ろ側はどこまでも重なる", () => {
    const problems = seriesOutsideEraSpace(
      seriesListOf({
        id: "future",
        season: 5,
        timeRange: { start: 3000, end: 3100 },
      }),
      openEnded,
    );

    expect(problems).toEqual([]);
  });

  it("末尾の era の end が年なら、それ以後に始まる timeRange を名指す", () => {
    const problems = seriesOutsideEraSpace(
      seriesListOf({
        id: "late",
        season: 6,
        timeRange: { start: 1450, end: 1500 },
      }),
      closed,
    );

    expect(problems).toEqual([expect.stringContaining("late")]);
  });
});
