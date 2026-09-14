/**
 * 一覧パネルの区画の分け方を見る。
 *
 * 相手は現物でなく手で置いた最小の組み合わせである。
 * 窓と事物の重なりの計算そのものは `@/lib/map/series-layer.test.ts` と `@/lib/era/window.test.ts` が持つ。
 */

import { describe, expect, it } from "vitest";
import type { CurrentWindow } from "@/lib/era/window";
import type { MapLocusCollection, MapLocusFeature } from "@/lib/map/loci";
import { seriesPanelSectionsOf } from "@/lib/map/series-panel";
import {
  ANCHOR_UNLOCATED,
  type Series,
  TIME_RANGE_UNTIMED,
} from "@/lib/schema/series";

/** シリーズのうち、区画の分け方に関わる欄。 */
type SeriesFixture = Pick<Series, "id" | "anchor" | "season" | "timeRange">;

/** 残りの欄を埋めて、スキーマの通るシリーズにする。 */
function seriesOf(fixture: SeriesFixture): Series {
  return {
    title: fixture.id,
    summary: "",
    region: "ヨーロッパ",
    links: [],
    tags: ["概念史"],
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
});

const ROUSHI = seriesOf({
  id: "roushi",
  anchor: "chu",
  season: 30,
  timeRange: { start: -571, end: -471 },
});

const TEISEI_ROMA = seriesOf({
  id: "teisei-roma",
  anchor: "roma",
  season: 66,
  timeRange: { start: -27, end: 476 },
});

const OKANE = seriesOf({
  id: "okane-no-rekishi",
  anchor: ANCHOR_UNLOCATED,
  season: 12,
  timeRange: TIME_RANGE_UNTIMED,
});

/**
 * 年を持つ位置なしのシリーズ。
 * 年は現在窓と重ならない。
 */
const SEPPUKU = seriesOf({
  id: "seppuku",
  anchor: ANCHOR_UNLOCATED,
  season: 40,
  timeRange: { start: 988, end: 1868 },
});

describe("seriesPanelSectionsOf", () => {
  it("現在窓と重なる事物を持つシリーズだけを地図の区画に入れる", () => {
    const { onMap } = seriesPanelSectionsOf({
      series: [SPARTA, TEISEI_ROMA],
      loci: lociOf(SPARTA, TEISEI_ROMA),
      currentWindow: WINDOW,
    });

    expect(onMap).toEqual([SPARTA]);
  });

  it("地図の区画を timeRange の start の昇順に並べる", () => {
    const { onMap } = seriesPanelSectionsOf({
      series: [ROUSHI, SPARTA],
      loci: lociOf(ROUSHI, SPARTA),
      currentWindow: WINDOW,
    });

    expect(onMap).toEqual([SPARTA, ROUSHI]);
  });

  it("位置なしのシリーズは、時期を持たなくても年が現在窓と重ならなくても、別区画に入る", () => {
    const { unlocated } = seriesPanelSectionsOf({
      series: [SPARTA, OKANE, SEPPUKU],
      loci: lociOf(SPARTA),
      currentWindow: WINDOW,
    });

    expect(unlocated).toEqual([OKANE, SEPPUKU]);
  });

  it("位置なしのシリーズを地図の区画に入れない", () => {
    const { onMap } = seriesPanelSectionsOf({
      series: [SPARTA, OKANE, SEPPUKU],
      loci: lociOf(SPARTA),
      currentWindow: WINDOW,
    });

    expect(onMap).toEqual([SPARTA]);
  });
});
