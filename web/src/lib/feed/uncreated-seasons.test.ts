import { describe, expect, it } from "vitest";
import type { FeedItem } from "@/lib/feed/schema";
import {
  listUncreatedSeasons,
  listUnreportedSeasons,
  type UncreatedSeason,
} from "@/lib/feed/uncreated-seasons";
import type { Series } from "@/lib/schema/series";

/** season の有無だけを見たいので、代表点と年代は当たり障りのない値で埋める。 */
function series(id: string, season: number): Series {
  return {
    id,
    title: id,
    anchor: `${id}-anchor`,
    timeRange: { start: 1206, end: 1294 },
    summary: "",
    region: "中央ユーラシア",
    season,
    links: {},
    tags: ["集団"],
  };
}

/**
 * フィードの 1 件。
 * guid・題名・season・pubDate だけが結果に効く。
 */
function item(overrides: Partial<FeedItem>): FeedItem {
  return {
    guid: "guid-68-1",
    title: "【68-1】革命のはじまり【COTEN RADIO フランス革命と陰謀論編1】",
    pubDate: "2026-11-01T21:00:00.000Z",
    audioUrl: "https://anchor.fm/s/8c2088c/podcast/play/1/episode.mp3",
    season: 68,
    episodeNumber: 1,
    durationSec: 3000,
    ...overrides,
  };
}

const CREATED_SERIES = [series("mongol-shurai", 67)];

const FRENCH_REVOLUTION_ITEMS = [
  item({
    guid: "guid-68-2",
    title: "【68-2】三部会【COTEN RADIO フランス革命と陰謀論編2】",
    pubDate: "2026-11-08T21:00:00.000Z",
    episodeNumber: 2,
  }),
  item({}),
];

describe("listUncreatedSeasons", () => {
  it("series.json に無い season は、題の末尾のシリーズ名・回の数・最も古い回とともに返る", () => {
    expect(
      listUncreatedSeasons(FRENCH_REVOLUTION_ITEMS, CREATED_SERIES, []),
    ).toEqual([
      {
        season: 68,
        seriesName: "フランス革命と陰謀論",
        episodeCount: 2,
        firstEpisode: {
          title:
            "【68-1】革命のはじまり【COTEN RADIO フランス革命と陰謀論編1】",
          pubDate: "2026-11-01T21:00:00.000Z",
        },
      },
    ]);
  });

  it("題の末尾が【COTEN RADIOショート 〜編N】の season も、シリーズ名を取り出す", () => {
    const shortItem = item({
      title:
        "【68-1】革命のはじまり【COTEN RADIOショート フランス革命と陰謀論編1】",
    });

    expect(
      listUncreatedSeasons([shortItem], CREATED_SERIES, [])[0]?.seriesName,
    ).toBe("フランス革命と陰謀論");
  });

  it("series.json に在る season の回だけなら空配列になる", () => {
    const mongolItem = item({
      guid: "guid-67-1",
      title: "【67-1】襲来【COTEN RADIO モンゴル帝国襲来編1】",
      season: 67,
    });

    expect(listUncreatedSeasons([mongolItem], CREATED_SERIES, [])).toEqual([]);
  });

  it("番外編の回は itunes:season を持っていても数えない", () => {
    const bonusItem = item({
      guid: "guid-bonus",
      title: "【番外編＃115】おたより回",
      season: 115,
    });

    expect(listUncreatedSeasons([bonusItem], CREATED_SERIES, [])).toEqual([]);
  });

  it("訂正表が既存の season へ移した回は、題の番号が未作成でも数えない", () => {
    const correctedItem = item({ guid: "guid-corrected" });

    expect(
      listUncreatedSeasons([correctedItem], CREATED_SERIES, [
        { guid: "guid-corrected", season: 67, reason: "題の番号が誤っている" },
      ]),
    ).toEqual([]);
  });

  it("題が【COTEN RADIO 〜編N】で終わらない season は、シリーズ名が null になる", () => {
    const untitledItem = item({ title: "【68-1】革命のはじまり" });

    expect(
      listUncreatedSeasons([untitledItem], CREATED_SERIES, [])[0]?.seriesName,
    ).toBeNull();
  });

  it("未作成の season が複数あれば season の昇順に並ぶ", () => {
    const laterItem = item({
      guid: "guid-69-1",
      title: "【69-1】はじまり【COTEN RADIO 次のシリーズ編1】",
      season: 69,
    });

    expect(
      listUncreatedSeasons([laterItem, ...FRENCH_REVOLUTION_ITEMS], [], []).map(
        ({ season }) => season,
      ),
    ).toEqual([68, 69]);
  });
});

describe("listUnreportedSeasons", () => {
  const uncreated: UncreatedSeason[] = [6, 68].map((season) => ({
    season,
    seriesName: null,
    episodeCount: 1,
    firstEpisode: { title: "", pubDate: "2026-11-01T21:00:00.000Z" },
  }));

  it("題に（season 68）を含む issue が在ると season 68 だけが除かれ、season 6 は残る", () => {
    expect(
      listUnreportedSeasons(uncreated, [
        "シーズン調査: フランス革命と陰謀論編（season 68）",
      ]).map(({ season }) => season),
    ).toEqual([6]);
  });

  it("既存の issue が無ければ全件が返る", () => {
    expect(listUnreportedSeasons(uncreated, [])).toEqual(uncreated);
  });
});
