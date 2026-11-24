import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SeriesCandidateBody from "@/components/series-candidates/SeriesCandidateBody";
import type { Series } from "@/lib/schema/series";

const ROMA: Series = {
  id: "julius-caesar",
  title: "カエサル",
  anchor: "rome",
  timeRange: { start: -100, end: -44 },
  region: "ヨーロッパ",
  season: 1,
  links: {},
  tags: [],
};

const TEISEI: Series = { ...ROMA, id: "teisei-roma", title: "帝政ローマ" };

describe("SeriesCandidateBody", () => {
  it("候補のシリーズごとに、タイトルと年代の行を並べる", () => {
    render(
      <SeriesCandidateBody
        candidates={[ROMA, TEISEI]}
        onSelect={() => {}}
        onClose={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: /カエサル/ }).textContent,
    ).toContain("前100年〜前44年");
    expect(screen.getByRole("button", { name: /帝政ローマ/ })).toBeDefined();
  });

  it("行を押すと、そのシリーズの id で onSelect を呼ぶ", () => {
    const onSelect = vi.fn();
    render(
      <SeriesCandidateBody
        candidates={[ROMA, TEISEI]}
        onSelect={onSelect}
        onClose={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /帝政ローマ/ }));

    expect(onSelect).toHaveBeenCalledWith("teisei-roma");
  });

  it("Escape キーと閉じるボタンで onClose を呼ぶ", () => {
    const onClose = vi.fn();
    render(
      <SeriesCandidateBody
        candidates={[ROMA, TEISEI]}
        onSelect={() => {}}
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "候補を閉じる" }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
