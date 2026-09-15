/**
 * 検証するのは、props の開閉・シリーズ・選択から何が表示され、見出しとシリーズの押下が何を返すかである。
 * シリーズ 1 件の表示は `SeriesPanelItem.test.tsx` が検証する。
 */

import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import SeriesPanelSection from "@/components/series-panel/SeriesPanelSection";
import type { Series } from "@/lib/schema/series";

const SPARTA: Series = {
  id: "sparta",
  title: "スパルタ",
  anchor: "sparta-city",
  timeRange: { start: -900, end: -200 },
  summary: "",
  region: "ヨーロッパ",
  season: 2,
  links: [],
  tags: ["集団"],
};

const ROUSHI: Series = {
  ...SPARTA,
  id: "roushi-soushi",
  title: "老子・荘子",
  anchor: "chu",
  timeRange: { start: -571, end: -286 },
  region: "中国",
  season: 30,
  tags: ["人物"],
};

/** 区画を開いた状態で描くときの props。 */
const PROPS: ComponentProps<typeof SeriesPanelSection> = {
  heading: "地図に出ているシリーズ",
  marker: <span />,
  note: "スライダーが指す時代に重なるシリーズを並べている。",
  series: [SPARTA, ROUSHI],
  emptyNote: "この時代に地図に出ているシリーズは無い。",
  selectedSeriesId: null,
  onSelect: () => {},
  isExpanded: true,
  onToggle: () => {},
};

/** 見出しで名前の付いた区画を返す。 */
function section(): HTMLElement {
  return screen.getByRole("region", { name: /地図に出ているシリーズ/ });
}

describe("SeriesPanelSection", () => {
  it("見出しの名前を持つ区画に、説明とシリーズを並べる", () => {
    render(<SeriesPanelSection {...PROPS} />);

    expect(within(section()).getByText(PROPS.note)).toBeVisible();
    expect(
      within(section()).getByRole("button", { name: /スパルタ/ }),
    ).toBeVisible();
    expect(
      within(section()).getByRole("button", { name: /老子・荘子/ }),
    ).toBeVisible();
  });

  it("シリーズが無ければ、一覧の代わりに emptyNote を出す", () => {
    render(<SeriesPanelSection {...PROPS} series={[]} />);

    expect(within(section()).getByText(PROPS.emptyNote)).toBeVisible();
  });

  it("selectedSeriesId のシリーズだけを選択中として並べる", () => {
    render(<SeriesPanelSection {...PROPS} selectedSeriesId="sparta" />);

    expect(screen.getByRole("button", { name: /スパルタ/ })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(
      screen.getByRole("button", { name: /老子・荘子/ }),
    ).not.toHaveAttribute("aria-current");
  });

  it("シリーズを押すと、その id を渡して onSelect を呼ぶ", () => {
    const onSelect = vi.fn();

    render(<SeriesPanelSection {...PROPS} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: /老子・荘子/ }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith("roushi-soushi");
  });

  it("開いている間は、見出しのボタンに aria-expanded=true を付ける", () => {
    render(<SeriesPanelSection {...PROPS} />);

    expect(
      screen.getByRole("button", { name: /地図に出ているシリーズ/ }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("閉じている間は説明とシリーズの列を隠し、見出しのボタンに aria-expanded=false を付ける", () => {
    render(<SeriesPanelSection {...PROPS} isExpanded={false} />);

    expect(
      screen.getByRole("button", { name: /地図に出ているシリーズ/ }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(PROPS.note)).not.toBeVisible();
    expect(screen.queryByRole("button", { name: /スパルタ/ })).toBeNull();
  });

  it("見出しを押すと onToggle を呼ぶ", () => {
    const onToggle = vi.fn();

    render(<SeriesPanelSection {...PROPS} onToggle={onToggle} />);
    fireEvent.click(
      screen.getByRole("button", { name: /地図に出ているシリーズ/ }),
    );

    expect(onToggle).toHaveBeenCalledOnce();
  });
});
