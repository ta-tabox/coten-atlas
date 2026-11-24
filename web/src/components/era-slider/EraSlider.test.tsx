/**
 * 検証するのは、props の位置から何が表示され、スライダーの操作で何が返るかである。
 * 位置を保持して地図のレイヤへ渡す配線は `MapCanvas.test.tsx` が検証する。
 *
 * jsdom はレイアウトを持たないので、ポインタの操作のテストはトラックの矩形を横の座標 100 から幅 400 に固定する。
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import EraSlider from "@/components/era-slider/EraSlider";
import { ERA_END_PRESENT, type EraList } from "@/lib/schema/era";

const ERAS: EraList = [
  { id: "ancient", label: "古代", start: -800, end: 550 },
  { id: "medieval", label: "中世", start: 550, end: 1450 },
];

const PRESENT_END = 2026;

/** スマホの幅の検証に使う、7 つの era。 */
const SEVEN_ERAS: EraList = [
  { id: "prehistory", label: "先史", start: -10000, end: -800 },
  { id: "ancient", label: "古代", start: -800, end: 550 },
  { id: "medieval", label: "中世", start: 550, end: 1450 },
  { id: "earlymodern", label: "近世", start: 1450, end: 1800 },
  { id: "modern19", label: "19世紀", start: 1800, end: 1900 },
  { id: "modern20a", label: "〜WWII", start: 1900, end: 1945 },
  { id: "modern20b", label: "戦後", start: 1945, end: ERA_END_PRESENT },
];

/** スマホの幅のテストで、帯に与える幅。 */
const BELT_WIDTH = 700;

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
      isCompact={false}
    />,
  );

  return screen.getByRole<HTMLInputElement>("slider", { name: "時代" });
}

/** スマホの幅（`isCompact`）の EraSlider を `SEVEN_ERAS` で描画し、押した位置を返す関数を受ける。 */
function renderCompactAt(
  position: number,
  onPositionChange: (position: number) => void = () => {},
) {
  render(
    <EraSlider
      eras={SEVEN_ERAS}
      presentEnd={PRESENT_END}
      position={position}
      onPositionChange={onPositionChange}
      isCompact
    />,
  );
}

/** 描画された帯の要素を、矩形を横の座標 `TRACK_LEFT` から幅 `BELT_WIDTH` に固定して返す。 */
function laidOutBelt(): HTMLElement {
  const belt = screen.getByTestId("era-slider-belt");

  vi.spyOn(belt, "getBoundingClientRect").mockReturnValue(
    new DOMRect(TRACK_LEFT, 0, BELT_WIDTH, 40),
  );

  return belt;
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

  describe("スマホの幅", () => {
    /** 強調された era のセルの名前を返す。 */
    function emphasizedLabels(): (string | null)[] {
      return screen
        .getAllByRole("listitem")
        .filter((item) => item.dataset.emphasized === "true")
        .map((item) => item.textContent);
    }

    it("現在窓の中心が乗っている era だけを強調する", () => {
      // 位置 4.5/7 は、7 つ目までのうち 5 つ目の「19世紀」の区間の中央に当たる。
      renderCompactAt(4.5 / 7);

      expect(emphasizedLabels()).toEqual(["19世紀"]);
    });

    it("境目の年は、強調した era の始まりと終わりの 2 つだけ描く", () => {
      renderCompactAt(4.5 / 7);

      expect(boundaryYearTexts()).toEqual(["1800", "1900"]);
    });

    it("デスクトップの幅では、era を強調せず、境目の年を全件描く", () => {
      renderAt(0.25);

      expect(screen.getAllByTestId("era-boundary-year")).toHaveLength(3);
      expect(
        screen
          .getAllByRole("listitem")
          .filter((item) => item.dataset.emphasized !== undefined),
      ).toHaveLength(0);
    });

    it("現在窓の年の範囲を、強調の有無によらず表示する", () => {
      renderCompactAt(4.5 / 7);

      expect(screen.getByText(/^\d+年〜\d+年$/)).toBeInTheDocument();
    });

    it("帯は画面の幅の 7/3 倍の幅を持ち、現在窓を画面の中央に置く", () => {
      renderCompactAt(0.5);

      const belt = screen.getByTestId("era-slider-belt");

      expect(Number.parseFloat(belt.style.width)).toBeCloseTo((7 / 3) * 100);
      // 帯の中央（位置 0.5）が画面の中央に来る平行移動は、帯の幅の -(0.5 - 0.5 / (7/3)) 倍。
      expect(Number.parseFloat(belt.style.transform.slice(11))).toBeCloseTo(
        (0.5 / (7 / 3) - 0.5) * 100,
      );
    });

    it("帯の端では、帯が画面の外まで動かない", () => {
      renderCompactAt(1);

      const belt = screen.getByTestId("era-slider-belt");

      // 帯の右端が画面の右端に揃う平行移動は、帯の幅の 1 - 3/7 倍だけ左。
      expect(Number.parseFloat(belt.style.transform.slice(11))).toBeCloseTo(
        -(1 - 3 / 7) * 100,
      );
    });

    it("位置 0 では、帯の左端が画面の左端に揃う", () => {
      renderCompactAt(0);

      expect(screen.getByTestId("era-slider-belt").style.transform).toBe(
        "translateX(0%)",
      );
    });

    it("左右のボタンを押すと、onPositionChange を 0 と 1 で呼ぶ", () => {
      const onPositionChange = vi.fn();
      renderCompactAt(0.5, onPositionChange);

      fireEvent.click(screen.getByRole("button", { name: "先史の始まりへ" }));
      fireEvent.click(screen.getByRole("button", { name: "戦後の終わりへ" }));

      expect(onPositionChange.mock.calls).toEqual([[0], [1]]);
    });

    it("デスクトップの幅には、端へ移るボタンを置かない", () => {
      renderAt(0.5);

      expect(screen.queryByRole("button")).toBeNull();
    });

    it("指を動かすと、動かした量だけ帯が逆向きに動いたとして位置を求める", () => {
      const onPositionChange = vi.fn();
      renderCompactAt(0.5, onPositionChange);
      const belt = laidOutBelt();

      // 帯の幅 700 の上で 70px 右へ動かすと、位置は 0.1 小さくなる。
      fireEvent.pointerDown(belt, primaryPointerAt(300));
      fireEvent.pointerMove(belt, primaryPointerAt(370));

      expect(onPositionChange).toHaveBeenLastCalledWith(0.4);
    });

    it("指を押した場所が帯のどこでも、同じ動かし方なら同じ位置になる", () => {
      const onPositionChange = vi.fn();
      renderCompactAt(0.5, onPositionChange);
      const belt = laidOutBelt();

      fireEvent.pointerDown(belt, primaryPointerAt(120));
      fireEvent.pointerMove(belt, primaryPointerAt(190));

      expect(onPositionChange).toHaveBeenLastCalledWith(0.4);
    });

    it("指を動かす前に離すと、離した位置へ現在窓を移す（タップ）", () => {
      const onPositionChange = vi.fn();
      renderCompactAt(0, onPositionChange);
      const belt = laidOutBelt();

      fireEvent.pointerDown(belt, primaryPointerAt(450));
      expect(onPositionChange).not.toHaveBeenCalled();

      fireEvent.pointerUp(belt, primaryPointerAt(450));

      // 帯は横の座標 100 から幅 700 なので、450 は帯の中央。
      expect(onPositionChange).toHaveBeenCalledExactlyOnceWith(0.5);
    });

    it("押した位置からのずれが小さいうちは、タップとして扱う", () => {
      const onPositionChange = vi.fn();
      renderCompactAt(0, onPositionChange);
      const belt = laidOutBelt();

      fireEvent.pointerDown(belt, primaryPointerAt(450));
      fireEvent.pointerMove(belt, primaryPointerAt(453));
      fireEvent.pointerUp(belt, primaryPointerAt(453));

      expect(onPositionChange).toHaveBeenCalledExactlyOnceWith(
        Math.round(((453 - 100) / 700) * 700) / 700,
      );
    });

    it("指を動かした後に離しても、タップの位置へは移さない", () => {
      const onPositionChange = vi.fn();
      renderCompactAt(0.5, onPositionChange);
      const belt = laidOutBelt();

      fireEvent.pointerDown(belt, primaryPointerAt(300));
      fireEvent.pointerMove(belt, primaryPointerAt(370));
      fireEvent.pointerUp(belt, primaryPointerAt(370));

      expect(onPositionChange).toHaveBeenCalledTimes(1);
    });
  });
});
