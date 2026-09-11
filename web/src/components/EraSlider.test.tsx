/**
 * 検証するのは、props の位置から何が表示され、スライダーの操作で何が返るかである。
 * 位置を保持して地図のレイヤへ渡す配線は `MapCanvas.test.tsx` が検証する。
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EraSlider from "@/components/EraSlider";
import type { EraList } from "@/lib/schema/era";

const ERAS: EraList = [
  { id: "ancient", label: "古代", start: -800, end: 550 },
  { id: "medieval", label: "中世", start: 550, end: 1450 },
];

const PRESENT_END = 2026;

/** `position` を指す EraSlider を描画し、スライダーの要素を返す。 */
function renderAt(
  position: number,
  onPositionChange: (position: number) => void = () => {},
): HTMLInputElement {
  render(
    <EraSlider
      eras={ERAS}
      presentEnd={PRESENT_END}
      position={position}
      onPositionChange={onPositionChange}
    />,
  );

  return screen.getByRole<HTMLInputElement>("slider", { name: "時代" });
}

describe("EraSlider", () => {
  it("era の名前を区間の順に並べる", () => {
    renderAt(0);

    const labels = screen
      .getAllByRole("listitem")
      .map((item) => item.textContent);

    expect(labels).toEqual(["古代", "中世"]);
  });

  it("position が指す年を整形して表示し、読み上げの値にも使う", () => {
    // 0.25 は古代の区間の中央で、-800 年と 550 年の中間の -125 年を指す。
    const slider = renderAt(0.25);

    expect(screen.getByText("前125年")).toBeInTheDocument();
    expect(slider).toHaveAttribute("aria-valuetext", "前125年");
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
});
