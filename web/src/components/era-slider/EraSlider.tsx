"use client";

/**
 * 時代区分を等幅のセルに並べ、現在窓の位置を選ばせる era スライダーの部品を置く。
 * 操作の形が画面の幅で分かれる。
 * デスクトップの幅は、全 era を一列に収め、トラックを指した位置へ現在窓を動かす。
 * スマホの幅は、一度に 3 つの era だけを見せ、現在窓を画面の中央に留めたまま、指を動かした量だけ帯を動かす。
 * 現在窓の中心が乗る era はセルの幅を変えずに強調し、その era の始まりと終わりの年だけを出す。
 *
 * 位置を保持しない。
 * 表示するのは props で受け取った `position` で、動かされた位置は `onPositionChange` で返す。
 * 位置から現在窓への変換は `@/lib/era/window` が、指の座標から位置への変換は `@/lib/era/pointer` が担当する。
 * 年の数値を「前800年」「550年」の形の文字列にする処理は `@/lib/format` が担当する。
 *
 * ポインタ（マウス・指・ペン）の操作はトラックの要素のポインタのイベントで受け、`<input type="range">` はキーボードの操作と読み上げだけを受ける。
 * iOS の Safari では `<input type="range">` のつまみの上から始めたスワイプで値が動かないので、ポインタの操作を `<input>` に任せない。
 *
 * MapLibre の DOM へ入れない理由は docs/adr/20260831-map-dom-boundary.md が正。
 */

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useRef,
} from "react";
import EraJumpButton from "@/components/era-slider/EraJumpButton";
import { clientXToPosition, dragToPosition } from "@/lib/era/pointer";
import { eraIndexAt, STEPS_PER_ERA } from "@/lib/era/scale";
import { currentWindow, currentWindowPositions } from "@/lib/era/window";
import { formatTimeRange, formatYearWithoutUnit } from "@/lib/format";
import { ERA_END_PRESENT, type EraList } from "@/lib/schema/era";

/** スマホの幅で、画面に一度に見せる era の数。 */
const VISIBLE_ERA_COUNT = 3;

/**
 * スマホの幅で、押してから指がこの距離（px）より動かなければ、タップとみなす。
 * 指は押しただけでも数 px ずれるので、0 にするとタップが帯の移動になる。
 */
const TAP_SLOP_PX = 8;

/**
 * `<label>` の `htmlFor` が参照する、`<input>` の id。
 * 画面に置くスライダーは 1 本なので固定値でよい。
 */
const SLIDER_ID = "era-slider";

/**
 * era のセルの列の下端の帯に重ねる `<input type="range">` の className。
 * トラックを透明にしてセルの列を見せ、つまみは帯より少し高い細い縦棒にする。
 * セルの era 名はセルの上寄せに置くので、つまみを下端の帯に限ると era 名の文字に重ならない。
 *
 * `<input>` はポインタのイベントを受けず、ポインタの操作は `<input>` を包むトラックの要素が受ける。
 * `range-track:` と `range-thumb:` は、`globals.css` の `@custom-variant` が定義する、トラックとつまみの擬似要素へ当てるバリアントである。
 */
const RANGE_CLASS = [
  "pointer-events-none absolute inset-x-0 bottom-0 m-0 h-3 w-full appearance-none bg-transparent",
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-point",
  "range-track:h-full range-track:bg-transparent",
  "range-thumb:h-5 range-thumb:w-1 range-thumb:appearance-none range-thumb:rounded-full range-thumb:border-0 range-thumb:bg-point",
  // WebKit はつまみの上端をトラックの上端に揃え、Firefox は上下の中央に置く。
  // 帯より高いつまみを WebKit でも上下に均等にはみ出させるので、WebKit のつまみだけを上へずらす。
  "[&::-webkit-slider-thumb]:-mt-1",
].join(" ");

type EraSliderProps = {
  eras: EraList;
  /** `end` が `ERA_END_PRESENT` の era の右端に置く年。 */
  presentEnd: number;
  /** スライダーが指す era 空間の位置（0..1）。 */
  position: number;
  /** スライダーが動かされたときに、新しい位置（0..1）を渡して呼ぶ。 */
  onPositionChange: (position: number) => void;
  /** true ならスマホの幅の形で一度に 3 つの era だけを見せ、false ならデスクトップの幅の形で全 era を一列に収める。 */
  isCompact: boolean;
};

/** スマホの幅で、押した位置から指が動いているかを追うために、押している間だけ持つ値。 */
type Gesture = {
  pointerId: number;
  startClientX: number;
  startPosition: number;
  isDragging: boolean;
};

/**
 * スマホの幅で、現在窓を画面の中央に置くための帯の幅と平行移動を返す。
 * 帯の端（位置 0 と 1）では、帯が画面の端より内側へ入らないよう、平行移動を止める。
 *
 * 平行移動は帯自身の幅に対する割合で書くので、画面の幅を測らずに済む。
 * era が `VISIBLE_ERA_COUNT` 以下なら、帯は画面の幅に収まるので動かさない。
 */
function beltStyleOf(position: number, eraCount: number): CSSProperties {
  const beltScale = Math.max(eraCount / VISIBLE_ERA_COUNT, 1);
  const centered = 0.5 / beltScale - position;
  const shift = Math.min(Math.max(centered, 1 / beltScale - 1), 0);

  return {
    width: `${beltScale * 100}%`,
    transform: `translateX(${shift * 100}%)`,
  };
}

/**
 * `eras` の区間の境目の年を、左端から右端までの順に返す。
 * 最後の区間の `end` が `ERA_END_PRESENT` なら、右端には `presentEnd` を置く。
 */
function boundaryYearsOf(eras: EraList, presentEnd: number): number[] {
  const last = eras[eras.length - 1];
  const rightEnd = last.end === ERA_END_PRESENT ? presentEnd : last.end;

  return [...eras.map((era) => era.start), rightEnd];
}

/** 描く境目の年 1 つと、帯の上での位置（左端から数えた境目の番号）と寄せ方。 */
type BoundaryLabel = {
  year: number;
  index: number;
  alignClass: string;
};

/**
 * デスクトップの幅で描く境目の年を、全件返す。
 * 両端の年は枠の外へはみ出さないよう内側へ寄せ、それ以外は境目を中心に置く。
 */
function allBoundaryLabelsOf(boundaryYears: number[]): BoundaryLabel[] {
  const lastIndex = boundaryYears.length - 1;

  return boundaryYears.map((year, index) => {
    if (index === 0) {
      return { year, index, alignClass: "" };
    }

    return {
      year,
      index,
      alignClass:
        index === lastIndex ? "-translate-x-full" : "-translate-x-1/2",
    };
  });
}

/** スマホの幅で描く境目の年を、強調する era の始まりと終わりの 2 つだけ返す。 */
function emphasizedBoundaryLabelsOf(
  boundaryYears: number[],
  emphasizedIndex: number,
): BoundaryLabel[] {
  return [
    {
      year: boundaryYears[emphasizedIndex],
      index: emphasizedIndex,
      alignClass: "",
    },
    {
      year: boundaryYears[emphasizedIndex + 1],
      index: emphasizedIndex + 1,
      alignClass: "-translate-x-full",
    },
  ];
}

/**
 * `eras` の区間を等幅のセルに並べ、`position` の周りの現在窓を帯で重ねたスライダー。
 * 現在窓は、年の範囲の文字とセルの上の帯の 2 つで示し、スライダーが指している 1 年は表示しない。
 *
 * 地図に描かれるのは現在窓と重なるシリーズなので、指している 1 年だけを出すと、その年を含まないシリーズが描かれて表示と食い違って見える。
 * キーボードの操作（矢印キー・Home・End・PageUp・PageDown）は `<input type="range">` のブラウザ既定の挙動が担う。
 */
export default function EraSlider({
  eras,
  presentEnd,
  position,
  onPositionChange,
  isCompact,
}: EraSliderProps) {
  const maxStep = eras.length * STEPS_PER_ERA;
  const windowYears = formatTimeRange(
    currentWindow({ position, eras, presentEnd }),
  );
  const windowPositions = currentWindowPositions({ position, eras });
  const boundaryYears = boundaryYearsOf(eras, presentEnd);
  const emphasizedIndex = eraIndexAt(
    (windowPositions.start + windowPositions.end) / 2,
    eras,
  );
  const boundaryLabels = isCompact
    ? emphasizedBoundaryLabelsOf(boundaryYears, emphasizedIndex)
    : allBoundaryLabelsOf(boundaryYears);
  const beltStyle = isCompact ? beltStyleOf(position, eras.length) : undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  const beltRef = useRef<HTMLDivElement>(null);

  // 押していなければ null。
  const gesture = useRef<Gesture | null>(null);

  /** `event` のポインタがトラックの上で指す位置を、`onPositionChange` へ渡す。 */
  function changePositionAt(event: ReactPointerEvent<HTMLDivElement>) {
    // スマホの幅では帯がトラックより広く、トラックの外へ延びるので、位置は帯の矩形から求める。
    const rectSource = isCompact ? beltRef.current : null;
    const rect = (rectSource ?? event.currentTarget).getBoundingClientRect();

    onPositionChange(
      clientXToPosition({
        clientX: event.clientX,
        trackLeft: rect.left,
        trackWidth: rect.width,
        stepCount: maxStep,
      }),
    );
  }

  /**
   * 主ボタン・指・ペンでトラックを押したら、押したポインタを追い始める。
   * デスクトップの幅では、押した位置を `onPositionChange` へ渡す。
   * スマホの幅では、タップか帯の移動かが指を離すか動かすまで決まらないので、ここでは位置を変えない。
   * 続けて矢印キーで動かせるよう、`<input>` へフォーカスを移し、フォーカスの枠はキーボードで移したときだけ出す。
   *
   * 既定の動作を止めないと、マウスで押した後にフォーカスが `<body>` へ移る。
   */
  function startDragging(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startPosition: position,
      isDragging: false,
    };
    inputRef.current?.focus({ focusVisible: false });

    if (!isCompact) {
      changePositionAt(event);
    }
  }

  /**
   * 押しているポインタが動いたら、動いた先の位置を `onPositionChange` へ渡す。
   * 押していないポインタの移動は無視する。
   * スマホの幅では、押した位置から `TAP_SLOP_PX` を越えて動くまでは何もせず、越えてからは指を動かした量で位置を決める。
   *
   * 押したときに `setPointerCapture` するので、トラックの外へ出た後の移動もここへ届く。
   */
  function continueDragging(event: ReactPointerEvent<HTMLDivElement>) {
    const current = gesture.current;

    if (current === null || event.pointerId !== current.pointerId) {
      return;
    }

    if (!isCompact) {
      changePositionAt(event);

      return;
    }

    const movedPx = Math.abs(event.clientX - current.startClientX);

    if (!current.isDragging && movedPx < TAP_SLOP_PX) {
      return;
    }

    current.isDragging = true;
    onPositionChange(
      dragToPosition({
        startPosition: current.startPosition,
        startClientX: current.startClientX,
        clientX: event.clientX,
        beltWidth: beltRef.current?.getBoundingClientRect().width ?? 1,
        stepCount: maxStep,
      }),
    );
  }

  /**
   * 押しているポインタが離れたら、ポインタを追うのをやめる。
   * スマホの幅で一度も動かさずに離れたなら、タップなので、離れた位置へ現在窓を移す。
   */
  function finishDragging(event: ReactPointerEvent<HTMLDivElement>) {
    const current = gesture.current;

    if (current === null || event.pointerId !== current.pointerId) {
      return;
    }

    gesture.current = null;

    if (isCompact && !current.isDragging) {
      changePositionAt(event);
    }
  }

  /** ブラウザがポインタの追跡を打ち切ったら、位置を変えずにポインタを追うのをやめる。 */
  function cancelDragging(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerId === gesture.current?.pointerId) {
      gesture.current = null;
    }
  }

  return (
    <div
      data-testid="era-slider"
      className="rounded-box border border-rule bg-paper px-4 pt-2.5 pb-1.5 font-body text-ink shadow-sm"
    >
      {/* 画面にはスライダーの見出しを出さないが、スクリーンリーダーにはスライダーの名前として読ませる。 */}
      <label htmlFor={SLIDER_ID} className="sr-only">
        時代
      </label>

      <div className="flex items-center justify-between gap-2">
        {isCompact && (
          <EraJumpButton onClick={() => onPositionChange(0)}>
            {eras[0].label}の始まりへ
          </EraJumpButton>
        )}

        {/* スライダーの aria-valuetext が同じ範囲を読み上げるので、スクリーンリーダーには重ねて読ませない。 */}
        <p
          aria-hidden="true"
          className={`min-w-0 flex-1 text-[0.8rem] tracking-[0.02em] text-ink-muted tabular-nums ${isCompact ? "text-center" : "text-right"}`}
        >
          {windowYears}
        </p>

        {isCompact && (
          <EraJumpButton onClick={() => onPositionChange(1)}>
            {eras[eras.length - 1].label}の終わりへ
          </EraJumpButton>
        )}
      </div>

      {/* ブラウザがトラックの上のタッチをスクロールや拡大に使うと pointercancel が届いて位置が止まるので、touch-none でタッチの既定の動作を止める。 */}
      {/* つまみはセルの列の下端より 4px はみ出して描かれ、`<input>` はポインタのイベントを受けないので、ポインタを受ける範囲を before 擬似要素で下へ 4px 広げる。 */}
      {/* スマホの幅の帯は画面より広いので、横だけを切る。縦を切るとはみ出したつまみが欠ける。 */}
      <div
        data-testid="era-slider-track"
        className={`relative mt-1.5 cursor-ew-resize touch-none before:absolute before:inset-x-0 before:top-0 before:-bottom-1 ${isCompact ? "overflow-x-clip" : ""}`}
        onPointerDown={startDragging}
        onPointerMove={continueDragging}
        onPointerUp={finishDragging}
        onPointerCancel={cancelDragging}
      >
        <div
          ref={beltRef}
          data-testid="era-slider-belt"
          className="relative"
          style={beltStyle}
        >
          <ol className="flex h-11 overflow-hidden rounded-control border border-rule">
            {eras.map((era, index) => {
              const isEmphasized = isCompact && index === emphasizedIndex;

              return (
                <li
                  key={era.id}
                  data-emphasized={isEmphasized ? "true" : undefined}
                  className={`flex flex-1 justify-center border-l pt-1 border-rule text-[0.75rem] whitespace-nowrap first:border-l-0 ${isEmphasized ? "bg-rule/60 font-bold text-ink" : "text-ink-muted"}`}
                >
                  {era.label}
                </li>
              );
            })}
          </ol>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div
              data-testid="era-window-band"
              className="absolute inset-y-0 border-x border-point/50 bg-point/10"
              // 帯の位置と幅は position に応じて連続に変わるので、Tailwind のユーティリティでなく style で渡す。
              style={{
                left: `${windowPositions.start * 100}%`,
                width: `${(windowPositions.end - windowPositions.start) * 100}%`,
              }}
            />
          </div>

          <input
            ref={inputRef}
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
      </div>

      {/* 境目の年は era 名のセルと同じ区間を別の形で示すだけなので、スクリーンリーダーには読ませない。 */}
      <div
        aria-hidden="true"
        className={`mt-1 h-4 ${isCompact ? "overflow-x-clip" : ""}`}
      >
        <div className="relative h-full" style={beltStyle}>
          {boundaryLabels.map(({ year, index, alignClass }) => (
            <span
              key={index}
              data-testid="era-boundary-year"
              className={`absolute top-0 text-[0.65rem] whitespace-nowrap text-ink-muted tabular-nums ${alignClass}`}
              style={{ left: `${(index / eras.length) * 100}%` }}
            >
              {formatYearWithoutUnit(year)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
