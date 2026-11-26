import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

const TEISEI: Series = { ...ROMA, id: "teisei-roma", title: "帝政ローマ" };

/** 枠の外に置く段落と一緒に、2 件の候補を持つ枠を描く。 */
function renderCard(onSelect = () => {}, onClose = () => {}) {
  render(
    <>
      <p>外</p>
      <SeriesCandidateCard
        candidates={[ROMA, TEISEI]}
        arrowLeftPx={100}
        onSelect={onSelect}
        onClose={onClose}
      />
    </>,
  );
}

describe("SeriesCandidateCard", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("候補のシリーズごとに、タイトルと年代の行を並べ、見出しを出さない", () => {
    renderCard();

    expect(
      screen.getByRole("button", { name: /カエサル/ }).textContent,
    ).toContain("前100年〜前44年");
    expect(screen.getByRole("button", { name: /帝政ローマ/ })).toBeDefined();
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("矢印を、吹き出しの左端から arrowLeftPx の位置に置く", () => {
    renderCard();

    const arrow = document.querySelector<HTMLElement>("[data-candidate-arrow]");

    expect(arrow?.style.left).toBe("94px");
  });

  it("行を押すと、動きが見える間待ってから、そのシリーズの id で onSelect を呼ぶ", () => {
    vi.useFakeTimers();

    const onSelect = vi.fn();
    renderCard(onSelect);

    fireEvent.click(screen.getByRole("button", { name: /帝政ローマ/ }));

    expect(onSelect).not.toHaveBeenCalled();
    expect(document.querySelector("[data-candidate-ripple]")).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onSelect).toHaveBeenCalledWith("teisei-roma");
  });

  it("待っている間に別の行を押しても、onSelect は 1 回だけ呼ぶ", () => {
    vi.useFakeTimers();

    const onSelect = vi.fn();
    renderCard(onSelect);

    fireEvent.click(screen.getByRole("button", { name: /帝政ローマ/ }));
    fireEvent.click(screen.getByRole("button", { name: /カエサル/ }));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("teisei-roma");
  });

  it("待っている間に枠が閉じると、onSelect を呼ばない", () => {
    vi.useFakeTimers();

    const onSelect = vi.fn();
    const { unmount } = render(
      <SeriesCandidateCard
        candidates={[ROMA, TEISEI]}
        arrowLeftPx={100}
        onSelect={onSelect}
        onClose={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /帝政ローマ/ }));
    unmount();
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("動きを減らす設定では、待たずに onSelect を呼ぶ", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true })),
    );

    const onSelect = vi.fn();
    renderCard(onSelect);

    fireEvent.click(screen.getByRole("button", { name: /帝政ローマ/ }));

    expect(onSelect).toHaveBeenCalledWith("teisei-roma");
  });

  it("各行の右端に、押せることを示す山形を出す", () => {
    renderCard();

    expect(document.querySelectorAll("[data-series-chevron]")).toHaveLength(2);
  });

  it("枠の外を押すと onClose を呼び、枠の中を押しても呼ばない", () => {
    const onClose = vi.fn();
    renderCard(() => {}, onClose);

    fireEvent.pointerDown(screen.getByRole("button", { name: /カエサル/ }));

    expect(onClose).not.toHaveBeenCalled();

    fireEvent.pointerDown(screen.getByText("外"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Escape キーを押すと onClose を呼ぶ", () => {
    const onClose = vi.fn();
    renderCard(() => {}, onClose);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
