/**
 * 検証するのは、props の位置から何が表示され、スライダーの操作で何が返るかである。
 * 位置を保持して地図のレイヤへ渡す配線は `MapCanvas.test.tsx` が検証する。
 *
 * jsdom はレイアウトを持たないので、ポインタの操作のテストはトラックの矩形を横の座標 100 から幅 400 に固定する。
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import EraSlider from "@/components/EraSlider";
import { ERA_END_PRESENT, type EraList } from "@/lib/schema/era";

const ERAS: EraList = [
  { id: "ancient", label: "古代", start: -800, end: 550 },
  { id: "medieval", label: "中世", start: 550, end: 1450 },
];

const PRESENT_END = 2026;

/** ポインタの操作のテストで、トラックの左端に置く横の座標。 */
const TRACK_LEFT = 100;

/** ポインタの操作のテストで、トラックに与える幅。 */
const TRACK_WIDTH = 400;

/** `position` を指す EraSlider を `eras` で描画し、スライダーの要素を返す。 */
function renderAt(
  position: number,
  onPositionChange: (position: number) => void = () => {},
  eras: EraList = ERAS,
): HTMLInputElement {
  render(
    <EraSlider
      eras={eras}
      presentEnd={PRESENT_END}
      position={position}
      onPositionChange={onPositionChange}
    />,
  );

  return screen.getByRole<HTMLInputElement>("slider", { name: "時代" });
}

/** 描画された境目の年の文字を、左から順に返す。 */
function boundaryYearTexts(): (string | null)[] {
  return screen
    .getAllByTestId("era-boundary-year")
    .map((year) => year.textContent);
}

/** 描画されたトラックの要素を、矩形を横の座標 `TRACK_LEFT` から幅 `TRACK_WIDTH` に固定して返す。 */
function laidOutTrack(): HTMLElement {
  const track = screen.getByTestId("era-slider-track");

  vi.spyOn(track, "getBoundingClientRect").mockReturnValue(
    new DOMRect(TRACK_LEFT, 0, TRACK_WIDTH, 40),
  );

  return track;
}

/** 横の座標 `clientX` にある、主ボタンで押すポインタのイベントの初期値を返す。 */
function primaryPointerAt(clientX: number) {
  return { pointerId: 1, isPrimary: true, button: 0, clientX };
}

describe("EraSlider", () => {
  beforeAll(() => {
    // jsdom は setPointerCapture を実装していないので、トラックを押すテストのために何もしない関数を置く。
    Element.prototype.setPointerCapture = () => {};
  });

  it("era の名前を区間の順に並べる", () => {
    renderAt(0);

    const labels = screen
      .getAllByRole("listitem")
      .map((item) => item.textContent);

    expect(labels).toEqual(["古代", "中世"]);
  });

  it("区間の境目の年を、左端から右端まで並べる", () => {
    renderAt(0);

    expect(boundaryYearTexts()).toEqual(["前800", "550", "1450"]);
  });

  it("終わっていない区間の右端には presentEnd の年を置く", () => {
    renderAt(0, () => {}, [
      { id: "modern20b", label: "戦後", start: 1945, end: ERA_END_PRESENT },
    ]);

    expect(boundaryYearTexts()).toEqual(["1945", "2026"]);
  });

  it("現在窓の年の範囲を表示し、読み上げの値にも使う", () => {
    // 0.25 は古代の区間の中央で、窓は古代の 1/4 から 3/4 まで（前462.5年〜212.5年を四捨五入）を取る。
    const slider = renderAt(0.25);

    expect(screen.getByText("前462年〜213年")).toBeInTheDocument();
    expect(slider).toHaveAttribute("aria-valuetext", "前462年〜213年");
  });

  it("現在窓の両端の位置を、帯の位置と幅にする", () => {
    // 区間が 2 つなので、窓の幅は era 空間の 0.25 で、0.25 を中心に 0.125 から 0.375 までを取る。
    renderAt(0.25);

    const band = screen.getByTestId("era-window-band");

    expect(band.style.left).toBe("12.5%");
    expect(band.style.width).toBe("25%");
  });

  it("position をスライダーの値に反映する", () => {
    const slider = renderAt(0.5);

    expect(Number(slider.value)).toBe(Number(slider.max) / 2);
  });

  it("スライダーを動かすと、値を 0..1 の位置に直して onPositionChange へ渡す", () => {
    const onPositionChange = vi.fn();
    const slider = renderAt(0, onPositionChange);

    fireEvent.change(slider, { target: { value: slider.max } });

    expect(onPositionChange).toHaveBeenCalledWith(1);
  });

  it("トラックを押すと、押した横の位置を 0..1 の位置に直して onPositionChange へ渡す", () => {
    const onPositionChange = vi.fn();
    renderAt(0, onPositionChange);

    fireEvent.pointerDown(laidOutTrack(), primaryPointerAt(300));

    expect(onPositionChange).toHaveBeenCalledWith(0.5);
  });

  it("トラックを押したまま動かすと、動かした先の位置を onPositionChange へ渡す", () => {
    const onPositionChange = vi.fn();
    renderAt(0, onPositionChange);
    const track = laidOutTrack();

    fireEvent.pointerDown(track, primaryPointerAt(100));
    fireEvent.pointerMove(track, primaryPointerAt(400));

    expect(onPositionChange).toHaveBeenLastCalledWith(0.75);
  });

  it("トラックを押さずにポインタを動かしても、onPositionChange を呼ばない", () => {
    const onPositionChange = vi.fn();
    renderAt(0, onPositionChange);

    fireEvent.pointerMove(laidOutTrack(), primaryPointerAt(400));

    expect(onPositionChange).not.toHaveBeenCalled();
  });

  it("ポインタを離した後に動かしても、onPositionChange を呼ばない", () => {
    const onPositionChange = vi.fn();
    renderAt(0, onPositionChange);
    const track = laidOutTrack();

    fireEvent.pointerDown(track, primaryPointerAt(100));
    fireEvent.pointerUp(track, primaryPointerAt(100));
    fireEvent.pointerMove(track, primaryPointerAt(400));

    expect(onPositionChange).toHaveBeenCalledTimes(1);
  });

  it("マウスの副ボタンでトラックを押しても、onPositionChange を呼ばない", () => {
    const onPositionChange = vi.fn();
    renderAt(0, onPositionChange);

    fireEvent.pointerDown(laidOutTrack(), {
      ...primaryPointerAt(300),
      button: 2,
    });

    expect(onPositionChange).not.toHaveBeenCalled();
  });

  it("トラックを押すと、続けて矢印キーで動かせるようスライダーにフォーカスが移る", () => {
    const slider = renderAt(0);

    fireEvent.pointerDown(laidOutTrack(), primaryPointerAt(300));

    expect(slider).toHaveFocus();
  });
});
