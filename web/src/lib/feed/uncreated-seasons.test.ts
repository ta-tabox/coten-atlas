import { describe, expect, it } from "vitest";
import type { Assignment } from "@/lib/feed/episode";
import type { FeedItem } from "@/lib/feed/schema";
import {
  listUncreatedSeasons,
  listUnreportedSeasons,
  type UncreatedSeason,
} from "@/lib/feed/uncreated-seasons";

/**
 * フィードの 1 件。
 * 題名と pubDate だけが結果に効く。
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

/** 題名の番号で season が決まり、シリーズ一覧にその season が無かった回の割当。 */
function uncreated(season: number, feedItem: FeedItem): Assignment {
  return { item: feedItem, key: { source: "title", season }, seriesId: null };
}

const FRENCH_REVOLUTION = [
  uncreated(
    68,
    item({
      guid: "guid-68-2",
      title: "【68-2】三部会【COTEN RADIO フランス革命と陰謀論編2】",
      pubDate: "2026-11-08T21:00:00.000Z",
      episodeNumber: 2,
    }),
  ),
  uncreated(68, item({})),
];

describe("listUncreatedSeasons", () => {
  it("シリーズが無いシリーズ番号は、題の末尾のシリーズ名・回の数・最も古い回とともに返る", () => {
    expect(listUncreatedSeasons(FRENCH_REVOLUTION)).toEqual([
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

  it("シリーズへ割り当たった回だけなら空配列になる", () => {
    const assigned: Assignment = {
      item: item({ guid: "guid-67-1", season: 67 }),
      key: { source: "title", season: 67 },
      seriesId: "mongol-shurai",
    };

    expect(listUncreatedSeasons([assigned])).toEqual([]);
  });

  it("割当でシリーズ番号が決まらなかった回（番外編など）は数えない", () => {
    const bonus: Assignment = {
      item: item({ guid: "guid-bonus", title: "【番外編＃115】おたより回" }),
      key: { source: "none", season: null },
      seriesId: null,
    };

    expect(listUncreatedSeasons([bonus])).toEqual([]);
  });

  it("題が【COTEN RADIOショート 〜編N】で終わるシリーズ番号も、シリーズ名を取り出す", () => {
    const shortItem = item({
      title:
        "【68-1】革命のはじまり【COTEN RADIOショート フランス革命と陰謀論編1】",
    });

    expect(
      listUncreatedSeasons([uncreated(68, shortItem)])[0]?.seriesName,
    ).toBe("フランス革命と陰謀論");
  });

  it("題が【COTEN RADIO 〜編N】で終わらないシリーズ番号は、シリーズ名が null になる", () => {
    const untitledItem = item({ title: "【68-1】革命のはじまり" });

    expect(
      listUncreatedSeasons([uncreated(68, untitledItem)])[0]?.seriesName,
    ).toBeNull();
  });

  it("未作成のシリーズ番号が複数あればシリーズ番号の昇順に並ぶ", () => {
    const laterItem = item({
      guid: "guid-69-1",
      title: "【69-1】はじまり【COTEN RADIO 次のシリーズ編1】",
    });

    expect(
      listUncreatedSeasons([
        uncreated(69, laterItem),
        ...FRENCH_REVOLUTION,
      ]).map(({ season }) => season),
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

  it("題に（season 68）を含む issue が在るとシリーズ番号 68 だけが除かれ、6 は残る", () => {
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
