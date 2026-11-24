import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SeriesCandidateCard from "@/components/series-candidates/SeriesCandidateCard";
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

describe("SeriesCandidateCard", () => {
  it("枠の外を押すと onClose を呼び、枠の中を押しても呼ばない", () => {
    const onClose = vi.fn();
    render(
      <>
        <p>外</p>
        <SeriesCandidateCard
          candidates={[ROMA]}
          onSelect={() => {}}
          onClose={onClose}
        />
      </>,
    );

    fireEvent.pointerDown(screen.getByRole("button", { name: /カエサル/ }));

    expect(onClose).not.toHaveBeenCalled();

    fireEvent.pointerDown(screen.getByText("外"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
