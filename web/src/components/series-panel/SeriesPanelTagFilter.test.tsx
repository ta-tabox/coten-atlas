/**
 * 検証するのは、props のタグと絞り込みに使っているタグから何が表示され、タグと解除のボタンの押下が何を返すかである。
 * どのタグをどの順に並べるかは `@/lib/map/tag-filter.test.ts` が検証する。
 */

import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import SeriesPanelTagFilter from "@/components/series-panel/SeriesPanelTagFilter";

/** 絞り込まずに描くときの props。 */
const PROPS: ComponentProps<typeof SeriesPanelTagFilter> = {
  tags: [
    { tag: "戦争", seriesCount: 2 },
    { tag: "人物", seriesCount: 1 },
  ],
  selectedTags: [],
  onSelectedTagsChange: () => {},
};

describe("SeriesPanelTagFilter", () => {
  it("開閉のボタンを持たず、タグのボタンを tags の順に、タグの名前だけを名前にして並べる", () => {
    render(<SeriesPanelTagFilter {...PROPS} />);

    expect(
      screen.getAllByRole("button").map((button) => button.textContent),
    ).toEqual(["戦争", "人物"]);
    expect(screen.getByRole("button", { name: "戦争" })).toBeVisible();
    expect(screen.queryByText("2")).toBeNull();
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

  it("tags が空なら、並べるタグが無いことを文で言う", () => {
    render(<SeriesPanelTagFilter {...PROPS} tags={[]} />);

    expect(screen.getByText("並べるタグは無い。")).toBeVisible();
  });
});
