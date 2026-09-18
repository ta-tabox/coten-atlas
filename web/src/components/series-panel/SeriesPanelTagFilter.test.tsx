/**
 * 検証するのは、props のタグ・絞り込みに使っているタグ・開閉から何が表示され、タグと解除と見出しのボタンの押下が何を返すかである。
 * どのタグをどの順に並べるかは `@/lib/map/tag-filter.test.ts` が検証する。
 */

import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import SeriesPanelTagFilter from "@/components/series-panel/SeriesPanelTagFilter";

/** 絞り込まずに、タグの列を開いた状態で描くときの props。 */
const PROPS: ComponentProps<typeof SeriesPanelTagFilter> = {
  tags: [
    { tag: "戦争", seriesCount: 2 },
    { tag: "人物", seriesCount: 1 },
  ],
  selectedTags: [],
  onSelectedTagsChange: () => {},
  isExpanded: true,
  onToggle: () => {},
};

describe("SeriesPanelTagFilter", () => {
  it("各タグを、そのタグを持つシリーズの数を添えたボタンにする", () => {
    render(<SeriesPanelTagFilter {...PROPS} />);

    const war = screen.getByRole("button", { name: /戦争/ });

    expect(war).toBeVisible();
    expect(within(war).getByText("2件")).toBeVisible();
    expect(screen.getByRole("button", { name: /人物/ })).toBeVisible();
  });

  it("選んでいないタグを押すと、選んだタグの末尾へ足した配列を渡して onSelectedTagsChange を呼ぶ", () => {
    const onSelectedTagsChange = vi.fn();

    render(
      <SeriesPanelTagFilter
        {...PROPS}
        selectedTags={["人物"]}
        onSelectedTagsChange={onSelectedTagsChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /戦争/ }));

    expect(onSelectedTagsChange).toHaveBeenCalledExactlyOnceWith([
      "人物",
      "戦争",
    ]);
  });

  it("selectedTags のタグだけに aria-pressed=true を付ける", () => {
    render(<SeriesPanelTagFilter {...PROPS} selectedTags={["戦争"]} />);

    expect(screen.getByRole("button", { name: /戦争/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /人物/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("選択中のタグを押すと、そのタグを外した配列を渡して onSelectedTagsChange を呼ぶ", () => {
    const onSelectedTagsChange = vi.fn();

    render(
      <SeriesPanelTagFilter
        {...PROPS}
        selectedTags={["戦争", "人物"]}
        onSelectedTagsChange={onSelectedTagsChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /戦争/ }));

    expect(onSelectedTagsChange).toHaveBeenCalledExactlyOnceWith(["人物"]);
  });

  it("絞り込んでいなければ、解除のボタンを出さない", () => {
    render(<SeriesPanelTagFilter {...PROPS} />);

    expect(screen.queryByRole("button", { name: "絞り込みを解除" })).toBeNull();
  });

  it("解除のボタンを押すと、空配列を渡して onSelectedTagsChange を呼ぶ", () => {
    const onSelectedTagsChange = vi.fn();

    render(
      <SeriesPanelTagFilter
        {...PROPS}
        selectedTags={["戦争", "人物"]}
        onSelectedTagsChange={onSelectedTagsChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "絞り込みを解除" }));

    expect(onSelectedTagsChange).toHaveBeenCalledExactlyOnceWith([]);
  });

  it("タグを 2 つ選んでいれば、両方を持つシリーズだけを表示していると言う", () => {
    render(<SeriesPanelTagFilter {...PROPS} selectedTags={["戦争", "人物"]} />);

    expect(
      screen.getByText(
        "「戦争」「人物」をすべて持つシリーズだけを表示している。",
      ),
    ).toBeVisible();
  });

  it("selectedTags のタグが tags に無くても、絞り込み中のタグと解除のボタンを出す", () => {
    render(<SeriesPanelTagFilter {...PROPS} selectedTags={["経済"]} />);

    expect(
      screen.getByText("「経済」を持つシリーズだけを表示している。"),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "絞り込みを解除" }),
    ).toBeVisible();
  });

  it("閉じている間はタグのボタンを隠し、解除のボタンは残す", () => {
    render(
      <SeriesPanelTagFilter
        {...PROPS}
        selectedTags={["戦争"]}
        isExpanded={false}
      />,
    );

    expect(
      screen.getByRole("button", { name: "タグで絞り込む" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: /人物/ })).toBeNull();
    expect(
      screen.getByRole("button", { name: "絞り込みを解除" }),
    ).toBeVisible();
  });

  it("見出しを押すと onToggle を呼ぶ", () => {
    const onToggle = vi.fn();

    render(<SeriesPanelTagFilter {...PROPS} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("button", { name: "タグで絞り込む" }));

    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("tags が空なら、並べるタグが無いことを文で言う", () => {
    render(<SeriesPanelTagFilter {...PROPS} tags={[]} />);

    expect(screen.getByText("並べるタグは無い。")).toBeVisible();
  });
});
