/**
 * 検証するのは、段ごとに出る領域と、見出しのタップ・キーボード・ドラッグが段の変更として返ること、era スライダーの出し入れである。
 * jsdom はレイアウトを持たないので、高さは `offsetHeight`・`clientHeight`・`innerHeight` を差し替えて決める。
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SeriesSheet from "@/components/series-sheet/SeriesSheet";
import type { SheetStage } from "@/lib/map/sheet";

/** `innerHeight` が 800 のときの、段ごとのシートの高さ。 */
const STAGE_HEIGHTS: Record<SheetStage, number> = {
  closed: 48,
  era: 160,
  list: 400,
  full: 720,
};

/** 見出しの行の高さ。 */
const HEADING_HEIGHT = 48;

/** 見出しの行を押す指の初期値。 */
function pointerAt(clientY: number) {
  return { pointerId: 1, isPrimary: true, button: 0, clientY };
}

/**
 * 差し替えた高さを返す。
 * シートは段で変わり、見出しの行は一定で、era スライダーの中身は `era` の段との差になる。
 */
function heightOf(element: HTMLElement): number {
  if (element.dataset.stage !== undefined) {
    return STAGE_HEIGHTS[element.dataset.stage as SheetStage];
  }

  return element.dataset.testid === "series-sheet-heading"
    ? HEADING_HEIGHT
    : STAGE_HEIGHTS.era - STAGE_HEIGHTS.closed;
}

beforeEach(() => {
  Element.prototype.setPointerCapture = () => {};
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(
    function (this: HTMLElement) {
      return heightOf(this);
    },
  );
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(
    function (this: HTMLElement) {
      return heightOf(this);
    },
  );
  vi.stubGlobal("innerHeight", 800);
});

/** `stage` の段のシートを描き、段の変更と era スライダーの出し入れを受ける関数を返す。 */
function renderSheet(stage: SheetStage, isEraSliderShown = true) {
  const onStageChange = vi.fn();
  const onEraSliderShownChange = vi.fn();

  render(
    <SeriesSheet
      stage={stage}
      onStageChange={onStageChange}
      heading="一覧"
      eraSlider={<p>スライダー</p>}
      isEraSliderShown={isEraSliderShown}
      onEraSliderShownChange={onEraSliderShownChange}
    >
      <p>中身</p>
    </SeriesSheet>,
  );

  return { onStageChange, onEraSliderShownChange };
}

/** 見出しの行を返す。 */
function headingRow(): HTMLElement {
  return screen.getByTestId("series-sheet-heading");
}

/** jsdom は Tailwind の CSS を読まないので、領域を隠すクラスが付いているかで出ているかを見る。 */
function isHidden(text: string, levels: number): boolean {
  let element = screen.getByText(text) as HTMLElement | null;

  for (let level = 0; level < levels; level += 1) {
    element = element?.parentElement ?? null;
  }

  return element?.classList.contains("invisible") ?? false;
}

/** era スライダーを入れた領域が隠れているか。 */
function isEraHidden(): boolean {
  return isHidden("スライダー", 2);
}

/** 一覧か詳細カードを入れた領域が隠れているか。 */
function isBodyHidden(): boolean {
  return isHidden("中身", 1);
}

describe("SeriesSheet の段ごとの表示", () => {
  it("closed の段では、era スライダーも中身も隠す", () => {
    renderSheet("closed");

    expect(isEraHidden()).toBe(true);
    expect(isBodyHidden()).toBe(true);
  });

  it("era の段では、era スライダーだけを出す", () => {
    renderSheet("era", false);

    expect(isEraHidden()).toBe(false);
    expect(isBodyHidden()).toBe(true);
  });

  it("list の段では、中身を出し、era スライダーは出す設定のときだけ出す", () => {
    renderSheet("list", true);

    expect(isBodyHidden()).toBe(false);
    expect(isEraHidden()).toBe(false);
  });

  it("list の段で era スライダーを出さない設定なら、era スライダーを隠す", () => {
    renderSheet("list", false);

    expect(isBodyHidden()).toBe(false);
    expect(isEraHidden()).toBe(true);
  });

  it("full の段では、中身だけを出す", () => {
    renderSheet("full", true);

    expect(isBodyHidden()).toBe(false);
    expect(isEraHidden()).toBe(true);
  });
});

describe("SeriesSheet の era スライダーの出し入れ", () => {
  it("list の段では、時代のボタンを出し、押すと出し入れを逆にして返す", () => {
    const { onEraSliderShownChange } = renderSheet("list", true);

    fireEvent.click(screen.getByRole("button", { name: "時代" }));

    expect(onEraSliderShownChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("時代のボタンを押しても、見出しのタップとして段を移さない", () => {
    const { onStageChange } = renderSheet("list");

    fireEvent.pointerDown(
      screen.getByRole("button", { name: "時代" }),
      pointerAt(40),
    );
    fireEvent.pointerUp(
      screen.getByRole("button", { name: "時代" }),
      pointerAt(40),
    );

    expect(onStageChange).not.toHaveBeenCalled();
  });

  it("list 以外の段では、時代のボタンを出さない", () => {
    renderSheet("era");

    expect(screen.queryByRole("button", { name: "時代" })).toBeNull();
  });
});

describe("SeriesSheet の見出しの操作", () => {
  it("見出しをタップすると、次の段を返す", () => {
    const { onStageChange } = renderSheet("closed");

    fireEvent.pointerDown(headingRow(), pointerAt(780));
    fireEvent.pointerUp(headingRow(), pointerAt(780));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("era");
  });

  it("full の段で見出しをタップすると、closed を返す", () => {
    const { onStageChange } = renderSheet("full");

    fireEvent.pointerDown(headingRow(), pointerAt(100));
    fireEvent.pointerUp(headingRow(), pointerAt(100));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("closed");
  });

  it("キーボードで見出しのボタンを押すと、次の段を返す", () => {
    const { onStageChange } = renderSheet("era");

    fireEvent.click(screen.getByRole("button", { name: "一覧" }));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("list");
  });

  it("ポインタの操作で起きた click は、タップの処理と重ねて段を移さない", () => {
    const { onStageChange } = renderSheet("era");

    fireEvent.click(screen.getByRole("button", { name: "一覧" }), {
      detail: 1,
    });

    expect(onStageChange).not.toHaveBeenCalled();
  });

  it("list の段から下へ closed の高さまでドラッグして離すと、closed を返す", () => {
    const { onStageChange } = renderSheet("list");

    fireEvent.pointerDown(headingRow(), pointerAt(400));
    fireEvent.pointerMove(headingRow(), pointerAt(790));
    fireEvent.pointerUp(headingRow(), pointerAt(790));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("closed");
  });

  it("era の段から、list に近い高さまで上へドラッグして離すと、list を返す", () => {
    const { onStageChange } = renderSheet("era");

    fireEvent.pointerDown(headingRow(), pointerAt(640));
    fireEvent.pointerMove(headingRow(), pointerAt(420));
    fireEvent.pointerUp(headingRow(), pointerAt(420));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("list");
  });

  it("closed の段から画面の上端近くまでドラッグして離すと、full を返す", () => {
    const { onStageChange } = renderSheet("closed");

    fireEvent.pointerDown(headingRow(), pointerAt(780));
    fireEvent.pointerMove(headingRow(), pointerAt(100));
    fireEvent.pointerUp(headingRow(), pointerAt(100));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("full");
  });

  it("ドラッグしている間は、指の位置に最も近い段の中身を出す", () => {
    renderSheet("closed");

    fireEvent.pointerDown(headingRow(), pointerAt(780));
    fireEvent.pointerMove(headingRow(), pointerAt(420));

    expect(isBodyHidden()).toBe(false);
  });
});
