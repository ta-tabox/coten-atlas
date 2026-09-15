/**
 * 検証するのは、props のシリーズと選択の有無から何が表示され、押下が何を返すかである。
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SeriesPanelItem from "@/components/SeriesPanelItem";
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

describe("SeriesPanelItem", () => {
  it("年を持つシリーズは、名前と整形した年代を出す", () => {
    render(
      <SeriesPanelItem series={SPARTA} isSelected={false} onSelect={vi.fn()} />,
    );

    expect(screen.getByText("スパルタ")).toBeVisible();
    expect(screen.getByText("前900年〜前200年")).toBeVisible();
  });

  it("時期を持たないシリーズは、名前だけを出して年代を出さない", () => {
    render(
      <SeriesPanelItem series={OKANE} isSelected={false} onSelect={vi.fn()} />,
    );

    expect(screen.getByText("お金の歴史")).toBeVisible();
    expect(screen.queryByText(/\d+年/)).toBeNull();
  });

  it("押すと、シリーズの id を渡して onSelect を呼ぶ", () => {
    const onSelect = vi.fn();

    render(
      <SeriesPanelItem
        series={SPARTA}
        isSelected={false}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /スパルタ/ }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith("sparta");
  });

  it("選択中なら aria-current を付ける", () => {
    render(
      <SeriesPanelItem series={SPARTA} isSelected={true} onSelect={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: /スパルタ/ })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("選択中でなければ aria-current を付けない", () => {
    render(
      <SeriesPanelItem series={SPARTA} isSelected={false} onSelect={vi.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: /スパルタ/ }),
    ).not.toHaveAttribute("aria-current");
  });
});
