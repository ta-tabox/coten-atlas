/**
 * 検証するのは、段ごとに出る領域と、取っ手のタップ・キーボード・スワイプが段の変更として返ること、era スライダーの出し入れである。
 */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BottomSheet from "@/components/bottom-sheet/BottomSheet";
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
  const onTargetHeightChange = vi.fn();

  render(
    <BottomSheet
      stage={stage}
      onStageChange={onStageChange}
      label="一覧"
      eraSlider={<p>スライダー</p>}
      isEraSliderShown={isEraSliderShown}
      onEraSliderShownChange={onEraSliderShownChange}
      onTargetHeightChange={onTargetHeightChange}
    >
      <p>中身</p>
    </BottomSheet>,
  );

  return { onStageChange, onEraSliderShownChange, onTargetHeightChange };
}

/** 取っ手の行を返す。 */
function handleRow(): HTMLElement {
  return screen.getByTestId("bottom-sheet-handle");
}

/**
 * `text` を持つ要素を入れたシートの領域が、隠れる設定（`data-open` が false）かを返す。
 * jsdom は CSS を読まないので、見えるかでなく、領域の設定で見る。
 */
function isRegionHidden(text: string): boolean {
  return (
    screen.getByText(text).closest<HTMLElement>("[data-sheet-region]")?.dataset
      .open === "false"
  );
}

/** era スライダーを入れた領域が隠れる設定か。 */
function isEraHidden(): boolean {
  return isRegionHidden("スライダー");
}

/** 一覧か詳細カードを入れた領域が隠れる設定か。 */
function isBodyHidden(): boolean {
  return isRegionHidden("中身");
}

describe("BottomSheet の段ごとの表示", () => {
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

describe("BottomSheet の era スライダーの出し入れ", () => {
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

describe("BottomSheet の取っ手の操作", () => {
  it("取っ手をタップすると、次の段を返す", () => {
    const { onStageChange } = renderSheet("closed");

    fireEvent.pointerDown(handleRow(), pointerAt(780));
    fireEvent.pointerUp(handleRow(), pointerAt(780));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("era");
  });

  it("full の段で取っ手をタップすると、closed を返す", () => {
    const { onStageChange } = renderSheet("full");

    fireEvent.pointerDown(handleRow(), pointerAt(100));
    fireEvent.pointerUp(handleRow(), pointerAt(100));

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

    fireEvent.pointerDown(handleRow(), pointerAt(600));
    fireEvent.pointerMove(handleRow(), pointerAt(540));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("list");
  });

  it("取っ手を下へ短くスワイプすると、1 つ低い段を返す", () => {
    const { onStageChange } = renderSheet("list");

    fireEvent.pointerDown(handleRow(), pointerAt(400));
    fireEvent.pointerMove(handleRow(), pointerAt(460));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("era");
  });

  it("スワイプのしきい値に届かない移動では、段を移さない", () => {
    const { onStageChange } = renderSheet("era");

    fireEvent.pointerDown(handleRow(), pointerAt(600));
    fireEvent.pointerMove(handleRow(), pointerAt(570));
    fireEvent.pointerUp(handleRow(), pointerAt(570));

    expect(onStageChange).not.toHaveBeenCalledWith("closed");
    expect(onStageChange).not.toHaveBeenCalledWith("list");
  });

  it("スワイプで段を移した後に指を離しても、タップとして段をもう 1 つ進めない", () => {
    const { onStageChange } = renderSheet("era");

    fireEvent.pointerDown(handleRow(), pointerAt(600));
    fireEvent.pointerMove(handleRow(), pointerAt(530));
    fireEvent.pointerUp(handleRow(), pointerAt(530));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("list");
  });

  it("一番高い段で上へスワイプしても、同じ段を返す", () => {
    const { onStageChange } = renderSheet("full");

    fireEvent.pointerDown(handleRow(), pointerAt(100));
    fireEvent.pointerMove(handleRow(), pointerAt(40));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("full");
  });
});

describe("BottomSheet の目標の高さ", () => {
  it("list の段では、画面の高さの半分を渡す", () => {
    vi.stubGlobal("innerHeight", 800);

    const { onTargetHeightChange } = renderSheet("list");

    expect(onTargetHeightChange).toHaveBeenLastCalledWith(400);
  });

  it("full の段では、画面の高さから上端に残す高さを引いた高さを渡す", () => {
    vi.stubGlobal("innerHeight", 800);

    const { onTargetHeightChange } = renderSheet("full");

    expect(onTargetHeightChange).toHaveBeenLastCalledWith(712);
  });
});

describe("BottomSheet の閉じるボタン", () => {
  it("list の段で押すと、era の段を返す", () => {
    const { onStageChange } = renderSheet("list");

    fireEvent.click(screen.getByRole("button", { name: "一覧を閉じる" }));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("era");
  });

  it("full の段で押すと、段を飛ばして era の段を返す", () => {
    const { onStageChange } = renderSheet("full");

    fireEvent.click(screen.getByRole("button", { name: "一覧を閉じる" }));

    expect(onStageChange).toHaveBeenCalledExactlyOnceWith("era");
  });

  it("closed と era の段では出さない", () => {
    renderSheet("closed");

    expect(screen.queryByRole("button", { name: "一覧を閉じる" })).toBeNull();

    cleanup();
    renderSheet("era");

    expect(screen.queryByRole("button", { name: "一覧を閉じる" })).toBeNull();
  });

  it("押しても、取っ手のタップとして段を進めない", () => {
    const { onStageChange } = renderSheet("list");
    const button = screen.getByRole("button", { name: "一覧を閉じる" });

    fireEvent.pointerDown(button, pointerAt(40));
    fireEvent.pointerUp(button, pointerAt(40));

    expect(onStageChange).not.toHaveBeenCalled();
  });
});
