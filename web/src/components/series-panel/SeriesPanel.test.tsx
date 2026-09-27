/**
 * 検証するのは、props の区画とタグがパネルのどこに並ぶかと、パネル全体と区画ごとの開閉である。
 * 区画 1 つの表示は `SeriesPanelSection.test.tsx`、タグの絞り込みの表示は `SeriesPanelTagFilter.test.tsx`、シリーズ 1 件の表示は `SeriesPanelItem.test.tsx`、props に何を渡すかを決める配線は `MapCanvas.test.tsx` が検証する。
 */

import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import SeriesPanel from "@/components/series-panel/SeriesPanel";
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

/** 絞り込まずに、`SPARTA` と `OKANE` のタグを並べるときのタグの絞り込みの props。 */
const TAG_FILTER_PROPS: Pick<
  ComponentProps<typeof SeriesPanel>,
  "tags" | "selectedTags" | "onSelectedTagsChange"
> = {
  tags: [
    { tag: "集団", seriesCount: 1 },
    { tag: "経済", seriesCount: 1 },
    { tag: "概念史", seriesCount: 1 },
  ],
  selectedTags: [],
  onSelectedTagsChange: () => {},
};

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
        {...TAG_FILTER_PROPS}
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
        {...TAG_FILTER_PROPS}
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
        {...TAG_FILTER_PROPS}
        onSelect={vi.fn()}
      />,
    );

    expect(
      within(onMapSection()).getByText(
        "この時代に地図に出ているシリーズは無い。",
      ),
    ).toBeVisible();
  });

  it("絞り込み中に地図に出ているシリーズが無ければ、選んだタグを持つシリーズがその区画に無いことを文で言う", () => {
    render(
      <SeriesPanel
        sections={{ onMap: [], unlocated: [OKANE] }}
        selectedSeriesId={null}
        {...TAG_FILTER_PROPS}
        selectedTags={["経済"]}
        onSelect={vi.fn()}
      />,
    );

    expect(
      within(onMapSection()).getByText(
        "この時代に地図に出ているシリーズに、「経済」を持つものは無い。",
      ),
    ).toBeVisible();
  });

  it("タグの絞り込みでタグを押すと、そのタグを足した配列を渡して onSelectedTagsChange を呼ぶ", () => {
    const onSelectedTagsChange = vi.fn();

    render(
      <SeriesPanel
        sections={SECTIONS}
        selectedSeriesId={null}
        {...TAG_FILTER_PROPS}
        onSelectedTagsChange={onSelectedTagsChange}
        onSelect={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "タグで絞り込む" }));
    fireEvent.click(screen.getByRole("button", { name: /経済/ }));

    expect(onSelectedTagsChange).toHaveBeenCalledExactlyOnceWith(["経済"]);
  });

  it("区画の見出しを押すとその区画のシリーズだけを隠し、もう一度押すと戻す", () => {
    render(
      <SeriesPanel
        sections={SECTIONS}
        selectedSeriesId={null}
        {...TAG_FILTER_PROPS}
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
        {...TAG_FILTER_PROPS}
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

  it("タグの絞り込みは、タグの列を閉じた状態で始まる", () => {
    render(
      <SeriesPanel
        sections={SECTIONS}
        selectedSeriesId={null}
        {...TAG_FILTER_PROPS}
        onSelect={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "タグで絞り込む" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: /経済/ })).toBeNull();
  });

  it("パネル全体を閉じて開き直しても、開いたタグの絞り込みは開いたまま残る", () => {
    render(
      <SeriesPanel
        sections={SECTIONS}
        selectedSeriesId={null}
        {...TAG_FILTER_PROPS}
        onSelect={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "タグで絞り込む" }));
    fireEvent.click(screen.getByRole("button", { name: "一覧を閉じる" }));
    fireEvent.click(screen.getByRole("button", { name: "シリーズ一覧を開く" }));

    expect(screen.getByRole("button", { name: /経済/ })).toBeVisible();
  });

  it("閉じるボタンで一覧を隠し、開くボタンで一覧を戻す", () => {
    render(
      <SeriesPanel
        sections={SECTIONS}
        selectedSeriesId={null}
        {...TAG_FILTER_PROPS}
        onSelect={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "一覧を閉じる" }));

    expect(screen.queryByRole("button", { name: /スパルタ/ })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "シリーズ一覧を開く" }));

    expect(screen.getByRole("button", { name: /スパルタ/ })).toBeVisible();
  });
});
