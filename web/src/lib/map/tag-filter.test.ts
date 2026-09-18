/**
 * タグの並べ方と、タグで絞ったシリーズから組んだ一覧パネルの区画と地図の事物を見る。
 *
 * 相手は現物でなく手で置いた最小の組み合わせである。
 * 区画の分け方そのものは `@/lib/map/series-panel.test.ts` が持つ。
 */

import { describe, expect, it } from "vitest";
import type { CurrentWindow } from "@/lib/era/window";
import {
  lociForSeries,
  type MapLocusCollection,
  type MapLocusFeature,
} from "@/lib/map/loci";
import { seriesIdsOnMapIn } from "@/lib/map/series-layer";
import { seriesPanelSectionsOf } from "@/lib/map/series-panel";
import {
  panelTagsOf,
  taggedSeriesOf,
  toggledTagsOf,
} from "@/lib/map/tag-filter";
import {
  ANCHOR_UNLOCATED,
  type Series,
  TIME_RANGE_UNTIMED,
} from "@/lib/schema/series";

/** シリーズのうち、区画の分け方とタグの絞り込みに関わる欄。 */
type SeriesFixture = Pick<
  Series,
  "id" | "anchor" | "season" | "timeRange" | "tags"
>;

/** 残りの欄を埋めて、スキーマの通るシリーズにする。 */
function seriesOf(fixture: SeriesFixture): Series {
  return {
    title: fixture.id,
    summary: "",
    region: "ヨーロッパ",
    links: [],
    ...fixture,
  };
}

/** `series` の代表点を、`series` の年を写した事物として 1 件作る。 */
function anchorOf(series: Series): MapLocusFeature {
  if (series.timeRange === TIME_RANGE_UNTIMED) {
    throw new Error(`fixture のシリーズ ${series.id} が時期を持たない`);
  }

  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [0, 0] },
    properties: {
      id: series.anchor,
      seriesId: series.id,
      timeStart: series.timeRange.start,
      timeEnd: series.timeRange.end,
    },
  };
}

/** `series` の代表点を地図へ渡す形の全件にする。 */
function lociOf(...series: Series[]): MapLocusCollection {
  return { type: "FeatureCollection", features: series.map(anchorOf) };
}

/** 紀元前 500 年から紀元前 300 年までの現在窓。 */
const WINDOW: CurrentWindow = { start: -500, end: -300 };

const SPARTA = seriesOf({
  id: "sparta",
  anchor: "sparta-city",
  season: 2,
  timeRange: { start: -900, end: -200 },
  tags: ["集団", "戦争"],
});

const ROUSHI = seriesOf({
  id: "roushi",
  anchor: "chu",
  season: 30,
  timeRange: { start: -571, end: -471 },
  tags: ["人物", "思想"],
});

const ALEXANDER = seriesOf({
  id: "alexander",
  anchor: "pella",
  season: 5,
  timeRange: { start: -356, end: -323 },
  tags: ["人物", "戦争"],
});

/**
 * `戦争` のタグを持つシリーズ。
 * 年は現在窓と重ならない。
 */
const TEISEI_ROMA = seriesOf({
  id: "teisei-roma",
  anchor: "roma",
  season: 66,
  timeRange: { start: -27, end: 476 },
  tags: ["帝国", "戦争"],
});

const OKANE = seriesOf({
  id: "okane-no-rekishi",
  anchor: ANCHOR_UNLOCATED,
  season: 12,
  timeRange: TIME_RANGE_UNTIMED,
  tags: ["概念史", "経済"],
});

const SERIES = [SPARTA, ROUSHI, ALEXANDER, TEISEI_ROMA, OKANE];

const LOCI = lociOf(SPARTA, ROUSHI, ALEXANDER, TEISEI_ROMA);

describe("panelTagsOf", () => {
  it("タグを持つシリーズの数の降順に並べ、数が同じタグは先に現れた方を前に置く", () => {
    const tags = panelTagsOf(
      {
        onMap: [SPARTA, ROUSHI, ALEXANDER],
        unlocated: [],
      },
      [],
    );

    expect(tags).toEqual([
      { tag: "戦争", seriesCount: 2 },
      { tag: "人物", seriesCount: 2 },
      { tag: "集団", seriesCount: 1 },
      { tag: "思想", seriesCount: 1 },
    ]);
  });

  it("位置なしの区画のシリーズのタグも、地図の区画のシリーズのタグの後に並べる", () => {
    const tags = panelTagsOf({ onMap: [SPARTA], unlocated: [OKANE] }, []);

    expect(tags.map(({ tag }) => tag)).toEqual([
      "集団",
      "戦争",
      "概念史",
      "経済",
    ]);
  });

  it("同じタグを 2 回持つシリーズを、そのタグを持つシリーズ 1 件と数える", () => {
    const doubled = { ...SPARTA, tags: ["戦争", "戦争"] };

    expect(panelTagsOf({ onMap: [doubled], unlocated: [] }, [])).toEqual([
      { tag: "戦争", seriesCount: 1 },
    ]);
  });

  it("区画がどちらも空なら空配列を返す", () => {
    expect(panelTagsOf({ onMap: [], unlocated: [] }, [])).toEqual([]);
  });

  it("選んだタグをどのシリーズも持たなければ、そのタグを数 0 で末尾に並べる", () => {
    expect(panelTagsOf({ onMap: [SPARTA], unlocated: [] }, ["経済"])).toEqual([
      { tag: "集団", seriesCount: 1 },
      { tag: "戦争", seriesCount: 1 },
      { tag: "経済", seriesCount: 0 },
    ]);
  });
});

describe("taggedSeriesOf", () => {
  it("選んだタグを tags に持つシリーズだけを、series の並び順で返す", () => {
    expect(taggedSeriesOf(SERIES, ["戦争"])).toEqual([
      SPARTA,
      ALEXANDER,
      TEISEI_ROMA,
    ]);
  });

  it("タグを 2 つ選ぶと、両方を tags に持つシリーズだけを返す", () => {
    expect(taggedSeriesOf(SERIES, ["人物", "戦争"])).toEqual([ALEXANDER]);
  });

  it("選んだタグが空なら series をそのまま返す", () => {
    expect(taggedSeriesOf(SERIES, [])).toBe(SERIES);
  });
});

describe("toggledTagsOf", () => {
  it("選んでいないタグを、選んだタグの末尾へ足す", () => {
    expect(toggledTagsOf(["人物"], "戦争")).toEqual(["人物", "戦争"]);
  });

  it("選んでいるタグを、選んだタグから外す", () => {
    expect(toggledTagsOf(["人物", "戦争"], "人物")).toEqual(["戦争"]);
  });
});

describe("タグで絞ったシリーズから組んだ一覧パネルの区画と地図の事物", () => {
  it("タグを選ぶと、一覧パネルの地図の区画と地図に出る事物のシリーズが、そのタグを持つ同じ集合に絞られる", () => {
    const tagged = taggedSeriesOf(SERIES, ["戦争"]);
    const taggedLoci = lociForSeries(LOCI, tagged);

    const { onMap } = seriesPanelSectionsOf({
      series: tagged,
      loci: taggedLoci,
      currentWindow: WINDOW,
    });

    expect(onMap).toEqual([SPARTA, ALEXANDER]);
    expect(seriesIdsOnMapIn(WINDOW, taggedLoci)).toEqual(
      new Set(onMap.map(({ id }) => id)),
    );
  });

  it("タグを選ぶと、位置なしの区画もそのタグを持つシリーズに絞られる", () => {
    const tagged = taggedSeriesOf(SERIES, ["戦争"]);

    const { unlocated } = seriesPanelSectionsOf({
      series: tagged,
      loci: lociForSeries(LOCI, tagged),
      currentWindow: WINDOW,
    });

    expect(unlocated).toEqual([]);
  });

  it("タグを選ぶと、絞った区画から数えたタグは、選んだタグと一緒に持たれているタグだけになる", () => {
    const tagged = taggedSeriesOf(SERIES, ["人物"]);
    const sections = seriesPanelSectionsOf({
      series: tagged,
      loci: lociForSeries(LOCI, tagged),
      currentWindow: WINDOW,
    });

    expect(panelTagsOf(sections, ["人物"])).toEqual([
      { tag: "人物", seriesCount: 2 },
      { tag: "思想", seriesCount: 1 },
      { tag: "戦争", seriesCount: 1 },
    ]);
  });

  it("タグを解除すると、一覧パネルの区画と地図の事物が絞る前に戻る", () => {
    const released = taggedSeriesOf(SERIES, []);
    const releasedLoci = lociForSeries(LOCI, released);

    expect(releasedLoci).toEqual(LOCI);
    expect(
      seriesPanelSectionsOf({
        series: released,
        loci: releasedLoci,
        currentWindow: WINDOW,
      }),
    ).toEqual(
      seriesPanelSectionsOf({
        series: SERIES,
        loci: LOCI,
        currentWindow: WINDOW,
      }),
    );
  });
});
