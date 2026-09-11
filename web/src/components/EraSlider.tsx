"use client";

/**
 * era スライダーを、地図の下部に重ねて表示する。
 *
 * 位置を保持しない。
 * 表示するのは props で受け取った `position` で、動かされた位置は `onPositionChange` で返す。
 * 位置から現在窓への変換は `@/lib/era/window` が担当する。
 * 年の数値を「前800年」「550年」の形の文字列にする処理は `@/lib/format` が担当する。
 *
 * MapLibre の DOM へ入れない理由は docs/adr/0022-map-dom-boundary.md が正。
 */

import { currentWindow, currentWindowPositions } from "@/lib/era/window";
import { formatTimeRange, formatYearWithoutUnit } from "@/lib/format";
import { ERA_END_PRESENT, type EraList } from "@/lib/schema/era";

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

/**
 * era のセルの列に重ねる `<input type="range">` の className。
 * トラックを透明にしてセルの列を見せ、つまみはセルより少し高い細い縦棒にする。
 *
 * つまみとトラックの擬似要素はブラウザごとに名前が違うので、WebKit と Firefox の両方へ同じ指定を書く。
 */
const RANGE_CLASS = [
  "absolute inset-0 m-0 h-full w-full cursor-ew-resize appearance-none bg-transparent",
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-500",
  "[&::-webkit-slider-runnable-track]:h-full [&::-webkit-slider-runnable-track]:bg-transparent",
  "[&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:h-12 [&::-webkit-slider-thumb]:w-1 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-800",
  "[&::-moz-range-track]:h-full [&::-moz-range-track]:bg-transparent",
  "[&::-moz-range-thumb]:h-12 [&::-moz-range-thumb]:w-1 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-zinc-800",
].join(" ");

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
 * `eras` の区間の境目の年を、左端から右端までの順に返す。
 * 最後の区間の `end` が `ERA_END_PRESENT` なら、右端には `presentEnd` を置く。
 */
function boundaryYearsOf(eras: EraList, presentEnd: number): number[] {
  const last = eras[eras.length - 1];
  const rightEnd = last.end === ERA_END_PRESENT ? presentEnd : last.end;

  return [...eras.map((era) => era.start), rightEnd];
}

/**
 * `index` 番目の境目の年の文字を、境目の位置に対して揃える className を返す。
 * 両端の年は枠の外へはみ出さないよう内側へ寄せ、それ以外は境目を中心に置く。
 */
function boundaryAlignClassOf(index: number, lastIndex: number): string {
  if (index === 0) {
    return "";
  }

  if (index === lastIndex) {
    return "-translate-x-full";
  }

  return "-translate-x-1/2";
}

/**
 * `eras` の区間を等幅のセルに並べ、`position` の周りの現在窓を帯で重ねたスライダー。
 * 現在窓は、年の範囲の文字とセルの上の帯の 2 つで示し、スライダーが指している 1 年は表示しない。
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
  const boundaryYears = boundaryYearsOf(eras, presentEnd);

  return (
    <div className="absolute bottom-10 left-1/2 z-10 w-[min(48rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-white/50 bg-white/45 px-4 pt-2.5 pb-1.5 font-sans text-zinc-800 shadow-lg shadow-black/5 backdrop-blur-md backdrop-saturate-150">
      {/* 画面にはスライダーの見出しを出さないが、スクリーンリーダーにはスライダーの名前として読ませる。 */}
      <label htmlFor={SLIDER_ID} className="sr-only">
        時代
      </label>

      {/* スライダーの aria-valuetext が同じ範囲を読み上げるので、スクリーンリーダーには重ねて読ませない。 */}
      <p
        aria-hidden="true"
        className="text-right text-[0.8rem] tracking-[0.02em] text-zinc-600 tabular-nums"
      >
        {windowYears}
      </p>

      <div className="relative mt-1.5">
        <ol className="flex h-10 overflow-hidden rounded-md border border-zinc-900/10 bg-white/30">
          {eras.map((era) => (
            <li
              key={era.id}
              className="grid flex-1 place-items-center border-l border-zinc-900/10 text-[0.75rem] whitespace-nowrap text-zinc-600 first:border-l-0"
            >
              {era.label}
            </li>
          ))}
        </ol>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div
            data-testid="era-window-band"
            className="absolute inset-y-0 border-x border-sky-900/50 bg-sky-900/10"
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
          className={RANGE_CLASS}
        />
      </div>

      {/* 境目の年は era 名のセルと同じ区間を別の形で示すだけなので、スクリーンリーダーには読ませない。 */}
      <div aria-hidden="true" className="relative mt-1 h-4">
        {boundaryYears.map((year, index) => (
          <span
            key={year}
            data-testid="era-boundary-year"
            className={`absolute top-0 text-[0.65rem] whitespace-nowrap text-zinc-500 tabular-nums ${boundaryAlignClassOf(index, boundaryYears.length - 1)}`}
            style={{ left: `${(index / eras.length) * 100}%` }}
          >
            {formatYearWithoutUnit(year)}
          </span>
        ))}
      </div>
    </div>
  );
}
