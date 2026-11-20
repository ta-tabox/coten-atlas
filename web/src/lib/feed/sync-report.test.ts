import { describe, expect, it } from "vitest";
import type { Assignment } from "@/lib/feed/episode";
import type { FeedItem } from "@/lib/feed/schema";
import { formatSyncReport } from "@/lib/feed/sync-report";
import type { Episode } from "@/lib/schema/episode";
import type { Series } from "@/lib/schema/series";

/** シリーズ名だけを見たいので、他の欄は当たり障りのない値で埋める。 */
const MONGOL: Series = {
  id: "mongol-shurai",
  title: "モンゴル帝国襲来",
  anchor: "mongol-shurai-anchor",
  timeRange: { start: 1206, end: 1294 },
  summary: "",
  region: "中央ユーラシア",
  season: 67,
  links: {},
  tags: ["集団"],
};

/**
 * フィードの 1 件。
 * guid・題名・pubDate だけが表に効く。
 */
function item(overrides: Partial<FeedItem>): FeedItem {
  return {
    guid: "guid-67-2",
    title: "【67-2】襲来【COTEN RADIO モンゴル帝国襲来編2】",
    pubDate: "2026-11-15T21:00:00.000Z",
    audioUrl: "https://anchor.fm/s/8c2088c/podcast/play/1/episode.mp3",
    season: 67,
    episodeNumber: 2,
    durationSec: 3000,
    ...overrides,
  };
}

/** 前回の `episodes.json` の 1 件。 */
function episode(overrides: Partial<Episode>): Episode {
  return {
    guid: "guid-67-1",
    title: "【67-1】はじまり【COTEN RADIO モンゴル帝国襲来編1】",
    pubDate: "2026-11-12T21:00:00.000Z",
    season: 67,
    seriesId: "mongol-shurai",
    links: {},
    ...overrides,
  };
}

const UNCHANGED: Assignment = {
  item: item({
    guid: "guid-67-1",
    title: "【67-1】はじまり【COTEN RADIO モンゴル帝国襲来編1】",
  }),
  key: { source: "title", season: 67 },
  seriesId: "mongol-shurai",
};

describe("formatSyncReport", () => {
  it("新しい回・割当の変化・消えた回が無ければ、表を出さずに差分が欄の更新だけだと書く", () => {
    const report = formatSyncReport({
      assignments: [UNCHANGED],
      previous: new Map([["guid-67-1", episode({})]]),
      series: [MONGOL],
    });

    expect(report).toContain("- 新しい回: 0 件");
    expect(report).toContain("新しい回・割当の変化・消えた回は無い");
    expect(report).not.toContain("|");
  });

  it("新しい回は、日本時間の配信日・コードの書式の題・シリーズ名で 1 行になる", () => {
    const added: Assignment = {
      item: item({}),
      key: { source: "title", season: 67 },
      seriesId: "mongol-shurai",
    };

    const report = formatSyncReport({
      assignments: [UNCHANGED, added],
      previous: new Map([["guid-67-1", episode({})]]),
      series: [MONGOL],
    });

    expect(report).toContain("- 新しい回: 1 件");
    expect(report).toContain(
      "| 2026-11-16 | `【67-2】襲来【COTEN RADIO モンゴル帝国襲来編2】` | モンゴル帝国襲来 |",
    );
  });

  it("シリーズが無いシリーズ番号の回はシリーズ番号を添え、シリーズ番号の無い回は割当なしと書く", () => {
    const uncreated: Assignment = {
      item: item({ guid: "guid-68-1", title: "【68-1】革命" }),
      key: { source: "title", season: 68 },
      seriesId: null,
    };
    const bonus: Assignment = {
      item: item({ guid: "guid-bonus", title: "【番外編＃115】おたより" }),
      key: { source: "none", season: null },
      seriesId: null,
    };

    const report = formatSyncReport({
      assignments: [uncreated, bonus],
      previous: new Map(),
      series: [MONGOL],
    });

    expect(report).toContain("| シリーズ未作成（season 68） |");
    expect(report).toContain("| 割当なし（番外編・告知など） |");
  });

  it("前回と seriesId が変わった回は、前と今のシリーズ名で 1 行になる", () => {
    const report = formatSyncReport({
      assignments: [UNCHANGED],
      previous: new Map([["guid-67-1", episode({ seriesId: null })]]),
      series: [MONGOL],
    });

    expect(report).toContain("- 割当が変わった回: 1 件");
    expect(report).toContain("| 未割当 | モンゴル帝国襲来 |");
  });

  it("前回に在って今回のフィードに無い回は、前のシリーズ名とともに消えた回の表に出る", () => {
    const report = formatSyncReport({
      assignments: [],
      previous: new Map([["guid-67-1", episode({})]]),
      series: [MONGOL],
    });

    expect(report).toContain("- フィードから消えた回: 1 件");
    expect(report).toContain("### フィードから消えた回");
    expect(report).toContain("| モンゴル帝国襲来 |");
  });

  it("題の | は表の区切りと読まれないよう \\| に置き換わる", () => {
    const piped: Assignment = {
      item: item({ guid: "guid-pipe", title: "A|B" }),
      key: { source: "title", season: 67 },
      seriesId: "mongol-shurai",
    };

    const report = formatSyncReport({
      assignments: [piped],
      previous: new Map(),
      series: [MONGOL],
    });

    expect(report).toContain("`A\\|B`");
  });
});
