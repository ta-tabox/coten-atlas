/**
 * 検証するのは、props の区画がパネルのどの区画に並ぶかと、パネル全体と区画ごとの開閉である。
 * 区画 1 つの表示は `SeriesPanelSection.test.tsx`、シリーズ 1 件の表示は `SeriesPanelItem.test.tsx`、props に何を渡すかを決める配線は `MapCanvas.test.tsx` が検証する。
 */

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SeriesPanel from "@/components/SeriesPanel";
import type { SeriesPanelSections } from "@/lib/map/series-panel";
import {
  ANCHOR_UNLOCATED,
  type Series,
  TIME_RANGE_UNTIMED,
} from "@/lib/schema/series";

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

const OKANE: Series = {
  ...SPARTA,
  id: "okane-no-rekishi",
  title: "お金の歴史",
  anchor: ANCHOR_UNLOCATED,
  timeRange: TIME_RANGE_UNTIMED,
  region: "地域なし",
  season: 12,
  tags: ["経済", "概念史"],
};

const SECTIONS: SeriesPanelSections = { onMap: [SPARTA], unlocated: [OKANE] };

/** 地図に出ているシリーズの区画を返す。 */
function onMapSection(): HTMLElement {
  return screen.getByRole("region", { name: /地図に出ているシリーズ/ });
}

/** 位置なしのシリーズの区画を返す。 */
function unlocatedSection(): HTMLElement {
  return screen.getByRole("region", { name: /場所や時代をまたぐシリーズ/ });
}

describe("SeriesPanel", () => {
  it("地図に出ているシリーズと位置なしのシリーズを、別々の区画に並べる", () => {
    render(
      <SeriesPanel
        sections={SECTIONS}
        selectedSeriesId={null}
        onSelect={vi.fn()}
      />,
    );

    expect(
      within(onMapSection()).getByRole("button", { name: /スパルタ/ }),
    ).toBeVisible();
    expect(
      within(unlocatedSection()).getByRole("button", { name: /お金の歴史/ }),
    ).toBeVisible();
    expect(within(onMapSection()).queryByText("お金の歴史")).toBeNull();
  });

  it("シリーズを押すと、その id を渡して onSelect を呼ぶ", () => {
    const onSelect = vi.fn();

    render(
      <SeriesPanel
        sections={SECTIONS}
        selectedSeriesId={null}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /お金の歴史/ }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith("okane-no-rekishi");
  });

  it("地図に出ているシリーズが無ければ、その区画に無いことを文で言う", () => {
    render(
      <SeriesPanel
        sections={{ onMap: [], unlocated: [OKANE] }}
        selectedSeriesId={null}
        onSelect={vi.fn()}
      />,
    );

    expect(
      within(onMapSection()).getByText(
        "この時代に地図に出ているシリーズは無い。",
      ),
    ).toBeVisible();
  });

  it("区画の見出しを押すとその区画のシリーズだけを隠し、もう一度押すと戻す", () => {
    render(
      <SeriesPanel
        sections={SECTIONS}
        selectedSeriesId={null}
        onSelect={vi.fn()}
      />,
    );
    const onMapToggle = screen.getByRole("button", {
      name: /地図に出ているシリーズ/,
    });

    fireEvent.click(onMapToggle);

    expect(screen.queryByRole("button", { name: /スパルタ/ })).toBeNull();
    expect(screen.getByRole("button", { name: /お金の歴史/ })).toBeVisible();

    fireEvent.click(onMapToggle);

    expect(screen.getByRole("button", { name: /スパルタ/ })).toBeVisible();
  });

  it("パネル全体を閉じて開き直しても、閉じた区画は閉じたまま残る", () => {
    render(
      <SeriesPanel
        sections={SECTIONS}
        selectedSeriesId={null}
        onSelect={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /場所や時代をまたぐシリーズ/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "一覧を閉じる" }));
    fireEvent.click(screen.getByRole("button", { name: "シリーズ一覧を開く" }));

    expect(screen.queryByRole("button", { name: /お金の歴史/ })).toBeNull();
    expect(screen.getByRole("button", { name: /スパルタ/ })).toBeVisible();
  });

  it("閉じるボタンで一覧を隠し、開くボタンで一覧を戻す", () => {
    render(
      <SeriesPanel
        sections={SECTIONS}
        selectedSeriesId={null}
        onSelect={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "一覧を閉じる" }));

    expect(screen.queryByRole("button", { name: /スパルタ/ })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "シリーズ一覧を開く" }));

    expect(screen.getByRole("button", { name: /スパルタ/ })).toBeVisible();
  });
});
