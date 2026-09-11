"use client";

/**
 * era スライダーを、地図の下部に重ねて表示する。
 *
 * 位置を保持しない。
 * 表示するのは props で受け取った `position` で、動かされた位置は `onPositionChange` で返す。
 * 位置から現在窓への変換は `@/lib/era/window`、年の整形は `@/lib/format` が担当する。
 *
 * MapLibre の DOM へ入れない理由は docs/adr/0022-map-dom-boundary.md が正。
 */

import { currentWindow, currentWindowPositions } from "@/lib/era/window";
import { formatTimeRange } from "@/lib/format";
import type { EraList } from "@/lib/schema/era";

/**
 * 1 つの era に割り当てるスライダーの目盛りの数。
 * `<input type="range">` は整数の目盛りで値を持ち、矢印キー 1 回で 1 目盛り進む。
 */
const STEPS_PER_ERA = 100;

/**
 * `<label>` の `htmlFor` が参照する、`<input>` の id。
 * 画面に置くスライダーは 1 本なので固定値でよい。
 */
const SLIDER_ID = "era-slider";

type EraSliderProps = {
  /** 目盛りに並べる時代区分の全件。 */
  eras: EraList;
  /** `end` が `ERA_END_PRESENT` の era の右端に置く年。 */
  presentEnd: number;
  /** スライダーが指す era 空間の位置（0..1）。 */
  position: number;
  /** スライダーが動かされたときに、新しい位置（0..1）を渡して呼ぶ。 */
  onPositionChange: (position: number) => void;
};

/**
 * `eras` の名前を等幅に並べた目盛りと、`position` の周りの現在窓を表示するスライダー。
 * 現在窓は、年の範囲の文字とトラックの背後の帯の 2 つで示し、スライダーが指している 1 年は表示しない。
 *
 * 地図に描かれるのは現在窓と重なるシリーズなので、指している 1 年だけを出すと、その年を含まないシリーズが描かれて表示と食い違って見える（docs/adr/0040-era-fade-wiring.md）。
 * キーボードの操作（矢印キー・Home・End・PageUp・PageDown）は `<input type="range">` のブラウザ既定の挙動が担う。
 * 遷移のアニメーションを持たないので、`prefers-reduced-motion` で止めるものが無い。
 */
export default function EraSlider({
  eras,
  presentEnd,
  position,
  onPositionChange,
}: EraSliderProps) {
  const maxStep = eras.length * STEPS_PER_ERA;
  const windowYears = formatTimeRange(
    currentWindow({ position, eras, presentEnd }),
  );
  const windowPositions = currentWindowPositions({ position, eras });

  return (
    <div className="absolute bottom-10 left-1/2 z-10 w-[min(48rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg bg-white/95 px-5 py-3 font-sans text-zinc-900 shadow-lg">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={SLIDER_ID}
          className="text-[0.8rem] tracking-[0.04em] text-zinc-500"
        >
          時代
        </label>

        {/* スライダーの aria-valuetext が同じ範囲を読み上げるので、スクリーンリーダーには重ねて読ませない。 */}
        <p
          aria-hidden="true"
          className="text-[0.85rem] text-zinc-700 tabular-nums"
        >
          {windowYears}
        </p>
      </div>

      <div className="relative mt-1">
        {/* つまみの中心はトラックの両端からつまみの幅の半分だけ内側までしか動かないので、帯を置く枠にも左右に同じ幅の余白を置く。 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-2 top-1/2 h-5 -translate-y-1/2"
        >
          <div
            data-testid="era-window-band"
            className="absolute inset-y-0 rounded-full bg-sky-600/30"
            // 帯の位置と幅は position に応じて連続に変わるので、Tailwind のユーティリティでなく style で渡す。
            style={{
              left: `${windowPositions.start * 100}%`,
              width: `${(windowPositions.end - windowPositions.start) * 100}%`,
            }}
          />
        </div>

        <input
          id={SLIDER_ID}
          type="range"
          min={0}
          max={maxStep}
          step={1}
          value={Math.round(position * maxStep)}
          aria-valuetext={windowYears}
          onChange={(event) =>
            onPositionChange(Number(event.target.value) / maxStep)
          }
          className="relative block w-full accent-zinc-700"
        />
      </div>

      {/* era 名の列にも、帯の枠と同じ幅の余白を左右に置く。 */}
      <ol className="flex px-2 text-[0.75rem] text-zinc-700">
        {eras.map((era) => (
          <li key={era.id} className="flex-1 text-center">
            {era.label}
          </li>
        ))}
      </ol>
    </div>
  );
}
