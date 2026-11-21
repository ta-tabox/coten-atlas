/**
 * 検証するのは、段ごとに出る領域と、取っ手のタップ・キーボード・スワイプが段の変更として返ること、era スライダーの出し入れである。
 */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SeriesSheet from "@/components/series-sheet/SeriesSheet";
import type { SheetStage } from "@/lib/map/sheet";

/** 取っ手の行を押す指の初期値。 */
function pointerAt(clientY: number) {
  return { pointerId: 1, isPrimary: true, button: 0, clientY };
}

beforeEach(() => {
  // jsdom は setPointerCapture を実装していないので、何もしない関数を置く。
  Element.prototype.setPointerCapture = () => {};
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

/** 取っ手の行を返す。 */
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
  it("list の段で era スライダーを出しているとき、閉じるボタンを押すと、出さない設定を返す", () => {
    const { onEraSliderShownChange } = renderSheet("list", true);

    fireEvent.click(
      screen.getByRole("button", { name: "時代スライダーを閉じる" }),
    );

    expect(onEraSliderShownChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("list の段で era スライダーを出していないとき、「時代を変える」ボタンを押すと、出す設定を返す", () => {
    const { onEraSliderShownChange } = renderSheet("list", false);

    fireEvent.click(screen.getByRole("button", { name: "時代を変える" }));

    expect(onEraSliderShownChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("era スライダーを出しているときは「時代を変える」ボタンを出さず、出していないときは閉じるボタンを出さない", () => {
    renderSheet("list", true);

    expect(screen.queryByRole("button", { name: "時代を変える" })).toBeNull();

    cleanup();
    renderSheet("list", false);

    expect(
      screen.queryByRole("button", { name: "時代スライダーを閉じる" }),
    ).toBeNull();
  });

  it("「時代を変える」ボタンを押しても、取っ手のタップとして段を移さない", () => {
    const { onStageChange } = renderSheet("list", false);
    const button = screen.getByRole("button", { name: "時代を変える" });

    fireEvent.pointerDown(button, pointerAt(40));
    fireEvent.pointerUp(button, pointerAt(40));

    expect(onStageChange).not.toHaveBeenCalled();
  });

  it("list 以外の段では、どちらのボタンも出さない", () => {
    renderSheet("era", false);

    expect(screen.queryByRole("button", { name: "時代を変える" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "時代スライダーを閉じる" }),
    ).toBeNull();
  });
});

describe("SeriesSheet の取っ手の操作", () => {
  it("取っ手をタップすると、次の段を返す", () => {
    const { onStageChange } = renderSheet("closed");

    fireEvent.pointerDown(headingRow(), pointerAt(780));
    fireEvent.pointerUp(headingRow(), pointerAt(780));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("era");
  });

  it("full の段で取っ手をタップすると、closed を返す", () => {
    const { onStageChange } = renderSheet("full");

    fireEvent.pointerDown(headingRow(), pointerAt(100));
    fireEvent.pointerUp(headingRow(), pointerAt(100));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("closed");
  });

  it("キーボードで取っ手のボタンを押すと、次の段を返す", () => {
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

  it("取っ手を上へ短くスワイプすると、動いた距離によらず 1 つ高い段を返す", () => {
    const { onStageChange } = renderSheet("era");

    fireEvent.pointerDown(headingRow(), pointerAt(600));
    fireEvent.pointerMove(headingRow(), pointerAt(570));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("list");
  });

  it("取っ手を下へ短くスワイプすると、1 つ低い段を返す", () => {
    const { onStageChange } = renderSheet("list");

    fireEvent.pointerDown(headingRow(), pointerAt(400));
    fireEvent.pointerMove(headingRow(), pointerAt(430));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("era");
  });

  it("スワイプのしきい値に届かない移動では、段を移さない", () => {
    const { onStageChange } = renderSheet("era");

    fireEvent.pointerDown(headingRow(), pointerAt(600));
    fireEvent.pointerMove(headingRow(), pointerAt(590));
    fireEvent.pointerUp(headingRow(), pointerAt(590));

    expect(onStageChange).not.toHaveBeenCalledWith("closed");
    expect(onStageChange).not.toHaveBeenCalledWith("list");
  });

  it("スワイプで段を移した後に指を離しても、タップとして段をもう 1 つ進めない", () => {
    const { onStageChange } = renderSheet("era");

    fireEvent.pointerDown(headingRow(), pointerAt(600));
    fireEvent.pointerMove(headingRow(), pointerAt(560));
    fireEvent.pointerUp(headingRow(), pointerAt(560));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("list");
  });

  it("一番高い段で上へスワイプしても、同じ段を返す", () => {
    const { onStageChange } = renderSheet("full");

    fireEvent.pointerDown(headingRow(), pointerAt(100));
    fireEvent.pointerMove(headingRow(), pointerAt(60));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("full");
  });
});
