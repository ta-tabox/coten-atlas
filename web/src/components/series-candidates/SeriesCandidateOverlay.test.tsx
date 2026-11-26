import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SeriesCandidateOverlay from "@/components/series-candidates/SeriesCandidateOverlay";
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

describe("SeriesCandidateOverlay", () => {
  it("枠の下辺を代表点の 22px 上に置き、矢印が代表点の真下を指す", () => {
    vi.stubGlobal("innerWidth", 1000);
    const { container } = render(
      <SeriesCandidateOverlay
        candidates={[ROMA]}
        anchor={{ x: 500, y: 300 }}
        onSelect={() => {}}
        onClose={() => {}}
      />,
    );
    const frame = container.firstElementChild as HTMLElement;
    const arrow = screen
      .getByRole("complementary")
      .querySelector<HTMLElement>("[data-candidate-arrow]");

    expect(frame.style.top).toBe("278px");
    expect(frame.style.left).toBe("356px");
    expect(arrow?.style.left).toBe("138px");

    vi.unstubAllGlobals();
  });
});
