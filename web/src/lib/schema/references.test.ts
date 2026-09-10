import { describe, expect, it } from "vitest";
import type { EpisodeCollection } from "@/lib/schema/episode";
import { ERA_END_PRESENT, type EraList } from "@/lib/schema/era";
import {
  type LocusCollection,
  type LocusTimeRange,
  TIME_RANGE_OF_SERIES,
} from "@/lib/schema/locus";
import {
  brokenAnchors,
  brokenLocusSeriesReferences,
  brokenSeriesReferences,
  lociOutsideSeriesTimeRange,
  seriesOutsideEraSpace,
} from "@/lib/schema/references";
import {
  ANCHOR_UNLOCATED,
  type Series,
  type SeriesList,
  TIME_RANGE_UNTIMED,
} from "@/lib/schema/series";

/** 検査に要る欄（id・season・anchor・timeRange）だけを差し替えたシリーズ一覧を作る。 */
function seriesListOf(
  ...entries: {
    id: string;
    season: number;
    anchor?: string;
    timeRange?: Series["timeRange"];
  }[]
): SeriesList {
  return entries.map(({ id, season, anchor, timeRange }) => ({
    id,
    title: id,
    kind: "place",
    anchor: anchor ?? `${id}-anchor`,
    timeRange: timeRange ?? { start: -900, end: -200 },
    summary: "",
    region: "ヨーロッパ",
    season,
    links: [],
    tags: ["集団"],
  }));
}

/** 検査に要る欄（id・seriesId・timeRange）だけを差し替えた事物の全件を作る。 */
function lociOf(
  ...entries: { id: string; seriesId: string; timeRange?: LocusTimeRange }[]
): LocusCollection {
  return {
    type: "FeatureCollection",
    features: entries.map(({ id, seriesId, timeRange }) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [22.43, 37.07] },
      properties: {
        id,
        seriesId,
        timeRange: timeRange ?? TIME_RANGE_OF_SERIES,
      },
    })),
  };
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

  it("timeRange が時期を持たない値のシリーズは見ない", () => {
    const problems = seriesOutsideEraSpace(
      seriesListOf({
        id: "okane",
        season: 12,
        anchor: ANCHOR_UNLOCATED,
        timeRange: TIME_RANGE_UNTIMED,
      }),
      closed,
    );

    expect(problems).toEqual([]);
  });
});

describe("brokenAnchors", () => {
  it("anchor が自分の事物を指していれば空", () => {
    const problems = brokenAnchors(
      seriesListOf({ id: "sparta", season: 2, anchor: "sparta-city" }),
      lociOf({ id: "sparta-city", seriesId: "sparta" }),
    );

    expect(problems).toEqual([]);
  });

  it("anchor が指す事物がどこにも無ければ名指す", () => {
    const problems = brokenAnchors(
      seriesListOf({ id: "sparta", season: 2, anchor: "sparta-city" }),
      lociOf(),
    );

    expect(problems).toEqual([expect.stringContaining("sparta-city")]);
  });

  it("anchor が別のシリーズの事物を指していれば名指す", () => {
    const problems = brokenAnchors(
      seriesListOf({ id: "sparta", season: 2, anchor: "athens-city" }),
      lociOf({ id: "athens-city", seriesId: "athens" }),
    );

    expect(problems).toEqual([expect.stringContaining("athens")]);
  });

  it("代表点の timeRange に年が書かれていれば名指す", () => {
    const problems = brokenAnchors(
      seriesListOf({ id: "sparta", season: 2, anchor: "sparta-city" }),
      lociOf({
        id: "sparta-city",
        seriesId: "sparta",
        timeRange: { start: -404, end: -371 },
      }),
    );

    expect(problems).toEqual([expect.stringContaining(TIME_RANGE_OF_SERIES)]);
  });

  it("位置なしのシリーズが事物を持たなければ空", () => {
    const problems = brokenAnchors(
      seriesListOf({ id: "okane", season: 12, anchor: ANCHOR_UNLOCATED }),
      lociOf({ id: "sparta-city", seriesId: "sparta" }),
    );

    expect(problems).toEqual([]);
  });

  it("位置なしのシリーズが事物を持てば名指す", () => {
    const problems = brokenAnchors(
      seriesListOf({ id: "okane", season: 12, anchor: ANCHOR_UNLOCATED }),
      lociOf({ id: "athens-agora", seriesId: "okane" }),
    );

    expect(problems).toEqual([expect.stringContaining("okane")]);
  });
});

describe("brokenLocusSeriesReferences", () => {
  it("seriesId が実在するシリーズを指していれば空", () => {
    const problems = brokenLocusSeriesReferences(
      lociOf({ id: "sparta-city", seriesId: "sparta" }),
      seriesListOf({ id: "sparta", season: 2 }),
    );

    expect(problems).toEqual([]);
  });

  it("どのシリーズにも無い seriesId を名指す", () => {
    const problems = brokenLocusSeriesReferences(
      lociOf({ id: "athens-city", seriesId: "athens" }),
      seriesListOf({ id: "sparta", season: 2 }),
    );

    expect(problems).toEqual([expect.stringContaining("athens")]);
  });
});

describe("lociOutsideSeriesTimeRange", () => {
  /** -900 から -200 までのシリーズ 1 件。 */
  const sparta = seriesListOf({ id: "sparta", season: 2 });

  it("シリーズの timeRange に収まる年なら空", () => {
    const problems = lociOutsideSeriesTimeRange(
      lociOf({
        id: "sparta-city",
        seriesId: "sparta",
        timeRange: { start: -404, end: -371 },
      }),
      sparta,
    );

    expect(problems).toEqual([]);
  });

  it("両端が一致していても収まっていると見る（timeRange は閉区間）", () => {
    const problems = lociOutsideSeriesTimeRange(
      lociOf({
        id: "sparta-city",
        seriesId: "sparta",
        timeRange: { start: -900, end: -200 },
      }),
      sparta,
    );

    expect(problems).toEqual([]);
  });

  it("シリーズより後ろへはみ出す年を名指す", () => {
    const problems = lociOutsideSeriesTimeRange(
      lociOf({
        id: "sparta-city",
        seriesId: "sparta",
        timeRange: { start: -404, end: 146 },
      }),
      sparta,
    );

    expect(problems).toEqual([expect.stringContaining("sparta-city")]);
  });

  it("シリーズと一致する印を置いた事物は見ない", () => {
    const problems = lociOutsideSeriesTimeRange(
      lociOf({ id: "sparta-city", seriesId: "sparta" }),
      sparta,
    );

    expect(problems).toEqual([]);
  });

  it("seriesId の指す先が無い事物は見ない", () => {
    const problems = lociOutsideSeriesTimeRange(
      lociOf({
        id: "athens-city",
        seriesId: "athens",
        timeRange: { start: -3000, end: -2000 },
      }),
      sparta,
    );

    expect(problems).toEqual([]);
  });

  it("timeRange が時期を持たない値のシリーズの事物は見ない", () => {
    const problems = lociOutsideSeriesTimeRange(
      lociOf({
        id: "lydia",
        seriesId: "okane",
        timeRange: { start: -600, end: -546 },
      }),
      seriesListOf({
        id: "okane",
        season: 12,
        anchor: ANCHOR_UNLOCATED,
        timeRange: TIME_RANGE_UNTIMED,
      }),
    );

    expect(problems).toEqual([]);
  });
});
