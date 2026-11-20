/**
 * 検証するのは、見出しのタップ・キーボード・ドラッグが段の変更として返ることと、閉じた段で中身を隠すことである。
 * jsdom はレイアウトを持たないので、高さは `offsetHeight`・`clientHeight`・`innerHeight` を差し替えて決める。
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SeriesSheet from "@/components/series-sheet/SeriesSheet";
import type { SheetStage } from "@/lib/map/sheet";

/** 閉じた段の高さ。 */
const CLOSED_HEIGHT = 48;

/** `innerHeight` の半分で、開いた段の高さ。 */
const OPEN_HEIGHT = 400;

/** 見出しの行を押す指の初期値。 */
function pointerAt(clientY: number) {
  return { pointerId: 1, isPrimary: true, button: 0, clientY };
}

beforeEach(() => {
  Element.prototype.setPointerCapture = () => {};
  // シートの外形の高さは段で変わり、見出しの行の高さは変わらない。
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(
    function (this: HTMLElement) {
      return this.dataset.stage === "open" ? OPEN_HEIGHT : CLOSED_HEIGHT;
    },
  );
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(
    function (this: HTMLElement) {
      return this.dataset.stage === "open" ? OPEN_HEIGHT : CLOSED_HEIGHT;
    },
  );
  vi.stubGlobal("innerHeight", OPEN_HEIGHT * 2);
});

/** `stage` の段のシートを描き、段の変更を受ける関数を返す。 */
function renderSheet(stage: SheetStage = "closed") {
  const onStageChange = vi.fn();

  render(
    <SeriesSheet stage={stage} onStageChange={onStageChange} heading="一覧">
      <p>中身</p>
    </SeriesSheet>,
  );

  return onStageChange;
}

/** 見出しの行を返す。 */
function headingRow(): HTMLElement {
  return screen.getByTestId("series-sheet-heading");
}

describe("SeriesSheet", () => {
  it("閉じた段では中身を隠す", () => {
    renderSheet("closed");

    // jsdom は Tailwind の CSS を読まないので、隠すクラスが付くことで確かめる。
    expect(screen.getByText("中身").parentElement).toHaveClass("invisible");
  });

  it("開いた段では中身を出す", () => {
    renderSheet("open");

    expect(screen.getByText("中身")).toBeVisible();
  });

  it("閉じた段で見出しをタップすると open を返す", () => {
    const onStageChange = renderSheet("closed");

    fireEvent.pointerDown(headingRow(), pointerAt(800));
    fireEvent.pointerUp(headingRow(), pointerAt(800));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("open");
  });

  it("開いた段で見出しをタップすると closed を返す", () => {
    const onStageChange = renderSheet("open");

    fireEvent.pointerDown(headingRow(), pointerAt(500));
    fireEvent.pointerUp(headingRow(), pointerAt(500));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("closed");
  });

  it("キーボードで見出しのボタンを押すと段を入れ替える", () => {
    const onStageChange = renderSheet("closed");

    fireEvent.click(screen.getByRole("button", { name: "一覧" }));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("open");
  });

  it("ポインタの操作で起きた click は、タップの処理と重ねて段を入れ替えない", () => {
    const onStageChange = renderSheet("closed");

    fireEvent.click(screen.getByRole("button", { name: "一覧" }), {
      detail: 1,
    });

    expect(onStageChange).not.toHaveBeenCalled();
  });

  it("閉じた段から中点を超えるまで上へドラッグして離すと open を返す", () => {
    const onStageChange = renderSheet("closed");

    fireEvent.pointerDown(headingRow(), pointerAt(800));
    fireEvent.pointerMove(headingRow(), pointerAt(500));
    fireEvent.pointerUp(headingRow(), pointerAt(500));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("open");
  });

  it("開いた段から少しだけ下へドラッグして離すと open を返す", () => {
    const onStageChange = renderSheet("open");

    fireEvent.pointerDown(headingRow(), pointerAt(400));
    fireEvent.pointerMove(headingRow(), pointerAt(440));
    fireEvent.pointerUp(headingRow(), pointerAt(440));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("open");
  });

  it("開いた段から中点を超えるまで下へドラッグして離すと closed を返す", () => {
    const onStageChange = renderSheet("open");

    fireEvent.pointerDown(headingRow(), pointerAt(400));
    fireEvent.pointerMove(headingRow(), pointerAt(700));
    fireEvent.pointerUp(headingRow(), pointerAt(700));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("closed");
  });

  it("ドラッグしている間は、閉じた段でも中身を出す", () => {
    renderSheet("closed");

    fireEvent.pointerDown(headingRow(), pointerAt(800));
    fireEvent.pointerMove(headingRow(), pointerAt(700));

    expect(screen.getByText("中身").parentElement).not.toHaveClass("invisible");
  });
});
