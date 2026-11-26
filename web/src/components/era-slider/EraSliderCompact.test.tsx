/**
 * 検証するのは、props の位置から何が表示され、拡大の切り替え・指の操作・キーボードの操作で何が返るかである。
 * 位置を保持して地図のレイヤへ渡す配線は `MapCanvas.test.tsx` が検証する。
 *
 * jsdom はレイアウトを持たないので、ポインタの操作のテストはトラックの矩形を横の座標 100 から幅 700 に固定する。
 * 幅 700 は 7 つの era の 700 目盛りに合わせてあり、全体を映すトラックでは 1px が 1 目盛りに当たる。
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import EraSliderCompact from "@/components/era-slider/EraSliderCompact";
import { ERA_END_PRESENT, type EraList } from "@/lib/schema/era";

const ERAS: EraList = [
  { id: "prehistory", label: "先史", start: -10000, end: -800 },
  { id: "ancient", label: "古代", start: -800, end: 550 },
  { id: "medieval", label: "中世", start: 550, end: 1450 },
  { id: "earlymodern", label: "近世", start: 1450, end: 1800 },
  { id: "modern19", label: "19世紀", start: 1800, end: 1900 },
  { id: "modern20a", label: "〜WWII", start: 1900, end: 1945 },
  { id: "modern20b", label: "戦後", start: 1945, end: ERA_END_PRESENT },
];

const PRESENT_END = 2026;

/** 位置 4.5/7 は、5 つ目の「19世紀」の区間の中央に当たる。 */
const MODERN19_CENTER = 4.5 / 7;

const TRACK_LEFT = 100;
const TRACK_WIDTH = 700;

const ZOOM_LABEL = "表示範囲を拡大して細かく調整する";

/** `position` を指す EraSliderCompact を描画し、再描画と、位置の変更を受ける関数を返す。 */
function renderAt(position: number) {
  const onPositionChange = vi.fn();
  const view = render(
    <EraSliderCompact
      eras={ERAS}
      presentEnd={PRESENT_END}
      position={position}
      onPositionChange={onPositionChange}
    />,
  );

  return {
    onPositionChange,
    moveTo: (next: number) =>
      view.rerender(
        <EraSliderCompact
          eras={ERAS}
          presentEnd={PRESENT_END}
          position={next}
          onPositionChange={onPositionChange}
        />,
      ),
  };
}

/** 描画されたトラックの要素を、矩形を横の座標 `TRACK_LEFT` から幅 `TRACK_WIDTH` に固定して返す。 */
function laidOutTrack(): HTMLElement {
  const track = screen.getByTestId("era-slider-track");

  vi.spyOn(track, "getBoundingClientRect").mockReturnValue(
    new DOMRect(TRACK_LEFT, 0, TRACK_WIDTH, 46),
  );

  return track;
}

/** 横の座標 `clientX` にある、主ボタンで押すポインタのイベントの初期値を返す。 */
function primaryPointerAt(clientX: number) {
  return { pointerId: 1, isPrimary: true, button: 0, clientX };
}

/** 描画された境目の年の文字を、左から順に返す。 */
function boundaryYearTexts(): (string | null)[] {
  return screen
    .getAllByTestId("era-boundary-year")
    .map((year) => year.textContent);
}

/** 先頭の era のセルが、トラックの左端から何 % の所にあるかを返す。 */
function firstCellLeftPercent(): number {
  return Number.parseFloat(screen.getAllByRole("listitem")[0].style.left);
}

/** 拡大のボタンを押す。 */
function zoomIn() {
  fireEvent.click(screen.getByRole("button", { name: ZOOM_LABEL }));
}

describe("EraSliderCompact", () => {
  beforeAll(() => {
    // jsdom は setPointerCapture を実装していないので、トラックを押すテストのために何もしない関数を置く。
    Element.prototype.setPointerCapture = () => {};
  });

  it("era の名前を区間の順に並べる", () => {
    renderAt(MODERN19_CENTER);

    expect(
      screen.getAllByRole("listitem").map((item) => item.textContent),
    ).toEqual(["先史", "古代", "中世", "近世", "19世紀", "〜WWII", "戦後"]);
  });

  it("現在窓の中心が乗っている era だけを強調する", () => {
    renderAt(MODERN19_CENTER);

    const emphasized = screen
      .getAllByRole("listitem")
      .filter((item) => item.dataset.emphasized === "true");

    expect(emphasized.map((item) => item.textContent)).toEqual(["19世紀"]);
  });

  it("現在窓の年の範囲を表示し、読み上げの値にも使う", () => {
    renderAt(MODERN19_CENTER);

    const slider = screen.getByRole("slider", { name: "時代" });

    expect(screen.getByText(/^\d+年〜\d+年$/)).toBeInTheDocument();
    expect(slider).toHaveAttribute(
      "aria-valuetext",
      screen.getByText(/^\d+年〜\d+年$/).textContent,
    );
  });

  it("全体を映しているとき、境目の年は強調した era の始まりと終わりの 2 つだけ描く", () => {
    renderAt(MODERN19_CENTER);

    expect(boundaryYearTexts()).toEqual(["1800", "1900"]);
  });

  it("先頭の era を強調するときは、始まりの年が前10000で、終わりが前800である", () => {
    renderAt(0);

    expect(boundaryYearTexts()).toEqual(["前10000", "前800"]);
  });

  it("拡大すると、表示範囲の両端の年を境目の年として描く", () => {
    renderAt(MODERN19_CENTER);

    zoomIn();

    // 位置 4.5/7 を中央に置く範囲は 3.5/7 から 5.5/7 までで、近世の中ほど（1625）と〜WWII の中ほど（1923）に当たる。
    expect(boundaryYearTexts()).toEqual(["1625", "1923"]);
  });

  it("拡大のボタンは押した状態を伝え、もう一度押すと全体へ戻る", () => {
    renderAt(MODERN19_CENTER);
    const toggle = screen.getByRole("button", { name: ZOOM_LABEL });

    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(boundaryYearTexts()).toEqual(["1800", "1900"]);
  });

  it("拡大していないあいだは、表示範囲をずらすボタンを押せない", () => {
    renderAt(MODERN19_CENTER);

    expect(
      screen.getByRole("button", { name: "表示範囲を過去の方向へずらす" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "表示範囲を未来の方向へずらす" }),
    ).toBeDisabled();
  });

  it("拡大すると、表示範囲をずらすボタンを押せる", () => {
    renderAt(MODERN19_CENTER);

    zoomIn();

    expect(
      screen.getByRole("button", { name: "表示範囲を過去の方向へずらす" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "表示範囲を未来の方向へずらす" }),
    ).toBeEnabled();
  });

  it("表示範囲が過去の端にあるとき、過去へずらすボタンだけ押せない", () => {
    renderAt(0);

    zoomIn();

    expect(
      screen.getByRole("button", { name: "表示範囲を過去の方向へずらす" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "表示範囲を未来の方向へずらす" }),
    ).toBeEnabled();
  });

  it("未来へずらすと、era のセルが左へ動き、位置は変わらない", () => {
    const { onPositionChange } = renderAt(MODERN19_CENTER);
    zoomIn();
    const before = firstCellLeftPercent();

    fireEvent.click(
      screen.getByRole("button", { name: "表示範囲を未来の方向へずらす" }),
    );

    expect(firstCellLeftPercent()).toBeLessThan(before);
    expect(onPositionChange).not.toHaveBeenCalled();
  });

  it("表示範囲をずらして現在窓が範囲の外へ出たとき、つまみを隠す", () => {
    renderAt(MODERN19_CENTER);
    zoomIn();
    const next = screen.getByRole("button", {
      name: "表示範囲を未来の方向へずらす",
    });

    expect(screen.getByTestId("era-slider-thumb")).toHaveClass("opacity-100");

    for (let count = 0; count < 4; count += 1) {
      fireEvent.click(next);
    }

    expect(screen.getByTestId("era-slider-thumb")).toHaveClass("opacity-0");
    expect(next).toBeDisabled();
  });

  it("拡大中に位置が外から動いて現在窓が範囲の外へ出たら、範囲が窓を追う", () => {
    const { moveTo } = renderAt(MODERN19_CENTER);
    zoomIn();
    const before = firstCellLeftPercent();

    moveTo(0.1);

    expect(firstCellLeftPercent()).toBeGreaterThan(before);
  });

  it("トラックを押すと、押した横の位置を 0..1 の位置に直して onPositionChange へ渡す", () => {
    const { onPositionChange } = renderAt(0);

    fireEvent.pointerDown(laidOutTrack(), primaryPointerAt(450));

    expect(onPositionChange).toHaveBeenCalledWith(0.5);
  });

  it("全体を映しているとき、トラックの両端から 8px 以内を押すと、0 と 1 を選ぶ", () => {
    const { onPositionChange } = renderAt(MODERN19_CENTER);
    const track = laidOutTrack();

    fireEvent.pointerDown(track, primaryPointerAt(TRACK_LEFT + 6));
    fireEvent.pointerDown(
      track,
      primaryPointerAt(TRACK_LEFT + TRACK_WIDTH - 6),
    );

    expect(onPositionChange.mock.calls).toEqual([[0], [1]]);
  });

  it("拡大しているとき、両端の近くも押した位置のままで、表示範囲の中の位置を選ぶ", () => {
    const { onPositionChange } = renderAt(MODERN19_CENTER);
    zoomIn();

    fireEvent.pointerDown(laidOutTrack(), primaryPointerAt(TRACK_LEFT + 175));

    // 表示範囲は 3.5/7 から幅 2/7 で、トラックの 1/4 は 3.5/7 + 0.25 * 2/7 に当たり、目盛りへ丸めると 400/700 になる。
    expect(onPositionChange).toHaveBeenCalledWith(400 / 700);
  });

  it("トラックを押したまま動かすと、動かした先の位置を渡し、ドラッグ中であることを示す", () => {
    const { onPositionChange } = renderAt(0);
    const track = laidOutTrack();

    fireEvent.pointerDown(track, primaryPointerAt(300));
    fireEvent.pointerMove(track, primaryPointerAt(450));

    expect(onPositionChange).toHaveBeenLastCalledWith(0.5);
    expect(screen.getByTestId("era-slider")).toHaveAttribute(
      "data-dragging",
      "true",
    );
  });

  it("押した位置からのずれが小さいうちは、ドラッグ中とみなさない", () => {
    renderAt(0);
    const track = laidOutTrack();

    fireEvent.pointerDown(track, primaryPointerAt(300));
    fireEvent.pointerMove(track, primaryPointerAt(303));

    expect(screen.getByTestId("era-slider")).not.toHaveAttribute(
      "data-dragging",
    );
  });

  it("ポインタを離すと、離した位置を渡し、ドラッグ中でなくなる", () => {
    const { onPositionChange } = renderAt(0);
    const track = laidOutTrack();

    fireEvent.pointerDown(track, primaryPointerAt(300));
    fireEvent.pointerMove(track, primaryPointerAt(450));
    fireEvent.pointerUp(track, primaryPointerAt(450));

    expect(onPositionChange).toHaveBeenLastCalledWith(0.5);
    expect(screen.getByTestId("era-slider")).not.toHaveAttribute(
      "data-dragging",
    );
  });

  it("ポインタを離した後に動かしても、onPositionChange を呼ばない", () => {
    const { onPositionChange } = renderAt(0);
    const track = laidOutTrack();

    fireEvent.pointerDown(track, primaryPointerAt(300));
    fireEvent.pointerUp(track, primaryPointerAt(300));
    onPositionChange.mockClear();
    fireEvent.pointerMove(track, primaryPointerAt(450));

    expect(onPositionChange).not.toHaveBeenCalled();
  });

  it("ブラウザがポインタの追跡を打ち切ったら、位置を変えずに追うのをやめる", () => {
    const { onPositionChange } = renderAt(0);
    const track = laidOutTrack();

    fireEvent.pointerDown(track, primaryPointerAt(300));
    fireEvent.pointerCancel(track, primaryPointerAt(300));
    onPositionChange.mockClear();
    fireEvent.pointerMove(track, primaryPointerAt(450));

    expect(onPositionChange).not.toHaveBeenCalled();
  });

  it("マウスの副ボタンでトラックを押しても、onPositionChange を呼ばない", () => {
    const { onPositionChange } = renderAt(0);

    fireEvent.pointerDown(laidOutTrack(), {
      ...primaryPointerAt(450),
      button: 2,
    });

    expect(onPositionChange).not.toHaveBeenCalled();
  });

  it("トラックを押すと、続けて矢印キーで動かせるようスライダーにフォーカスが移る", () => {
    renderAt(0);

    fireEvent.pointerDown(laidOutTrack(), primaryPointerAt(450));

    expect(screen.getByRole("slider", { name: "時代" })).toHaveFocus();
  });

  it("スライダーを動かすと、値を 0..1 の位置に直して onPositionChange へ渡す", () => {
    const { onPositionChange } = renderAt(0);
    const slider = screen.getByRole<HTMLInputElement>("slider", {
      name: "時代",
    });

    fireEvent.change(slider, { target: { value: slider.max } });

    expect(onPositionChange).toHaveBeenCalledWith(1);
  });
});
