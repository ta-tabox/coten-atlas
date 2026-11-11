import { describe, expect, it } from "vitest";
import { toSurveyIssue } from "@/lib/feed/survey-issue";
import type { UncreatedSeason } from "@/lib/feed/uncreated-seasons";

/** 2026-11-11 の配信フィードに在る、series.json に無い season 68。 */
const FRENCH_REVOLUTION: UncreatedSeason = {
  season: 68,
  seriesName: "フランス革命と陰謀論",
  episodeCount: 2,
  firstEpisode: {
    title: "【68-1】革命のはじまり【COTEN RADIO フランス革命と陰謀論編1】",
    pubDate: "2026-11-01T21:00:00.000Z",
  },
};

/**
 * 起票する issue の本文が持つ節の見出し。
 * 手で起票したシーズン調査の issue の節と同じ並びにする。
 */
const SECTION_HEADINGS = [
  "## 目的",
  "## 事実（起票した時点の配信フィード）",
  "## 対象（1 件）",
  "## 作るもの",
  "## 触らないもの",
  "## 完了条件（機械判定）",
  "## 人間の判定",
];

describe("toSurveyIssue", () => {
  it("シリーズ名が取れた season の題は「シーズン調査: <名前>編（season N）」になる", () => {
    expect(toSurveyIssue(FRENCH_REVOLUTION).title).toBe(
      "シーズン調査: フランス革命と陰謀論編（season 68）",
    );
  });

  it("シリーズ名が null の season の題は、名前の位置に（シリーズ名は未確定）を置く", () => {
    expect(
      toSurveyIssue({ ...FRENCH_REVOLUTION, seriesName: null }).title,
    ).toBe("シーズン調査: （シリーズ名は未確定）（season 68）");
  });

  it("本文は前提の行に続けて、手本の issue と同じ節を同じ順に持つ", () => {
    const { body } = toSurveyIssue(FRENCH_REVOLUTION);
    const positions = SECTION_HEADINGS.map((heading) => body.indexOf(heading));

    expect(body.startsWith("**前提**:")).toBe(true);
    expect(positions).not.toContain(-1);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("本文の対象の表と事実に、season・シリーズ名・回の数・最初の回の題と pubDate が入る", () => {
    const { body } = toSurveyIssue(FRENCH_REVOLUTION);

    expect(body).toContain("| 68 | フランス革命と陰謀論 |");
    expect(body).toContain("season 68 の回は 2 回ある");
    expect(body).toContain(`「${FRENCH_REVOLUTION.firstEpisode.title}」`);
    expect(body).toContain("`2026-11-01T21:00:00.000Z`");
  });
});
