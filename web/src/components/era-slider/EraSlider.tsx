"use client";

/**
 * 時代区分を 1 本のトラックに並べ、現在窓の位置を選ばせる era スライダーの部品を置く。
 * 拡大すると、一部の era（`zoomedEraCount` 個）だけがトラックに入り、左右のボタンと指の送りで表示範囲をずらして細かく選べる。
 *
 * 位置を保持しない。
 * 表示するのは props で受け取った `position` で、動かされた位置は `onPositionChange` で返す。
 * 拡大しているか・表示範囲の左端だけを、この部品が持つ。
 * 現在窓の求め方は `@/lib/era/window`、表示範囲の求め方は `@/lib/era/view`、指の操作の受け方は `./use-era-track-gesture` が担当する。
 *
 * 現在窓の中心が乗る era は、セルの幅を変えずに背景と太字で強調する。
 * セルの幅を変えると、指を止めていても下のセルが動き、指の位置と年の対応が崩れる。
 * `<input type="range">` はキーボードの操作と読み上げだけを受け、画面には出さない。
 *
 * MapLibre の DOM へ入れない理由は docs/adr/20260831-map-dom-boundary.md が正。
 */

import { useRef, useState } from "react";
import EraSliderIconButton from "@/components/era-slider/EraSliderIconButton";
import EraSliderPanButton from "@/components/era-slider/EraSliderPanButton";
import { useEraTrackGesture } from "@/components/era-slider/use-era-track-gesture";
import ChevronsLeftIcon from "@/components/icons/ChevronsLeftIcon";
import ChevronsRightIcon from "@/components/icons/ChevronsRightIcon";
import CloseIcon from "@/components/icons/CloseIcon";
import ZoomInIcon from "@/components/icons/ZoomInIcon";
import ZoomOutIcon from "@/components/icons/ZoomOutIcon";
import { eraIndexAt, positionToYear, STEPS_PER_ERA } from "@/lib/era/scale";
import {
  FULL_VIEW,
  keepWindowInView,
  panStepOf,
  panViewMinBy,
  type ViewRange,
  viewMinCenteredOn,
  viewPercentOf,
  zoomedSpanOf,
} from "@/lib/era/view";
import {
  currentWindow,
  currentWindowPositions,
  WINDOW_WIDTH_IN_ERAS,
} from "@/lib/era/window";
import { formatTimeRange, formatYearWithoutUnit } from "@/lib/format";
import { ERA_END_PRESENT, type EraList } from "@/lib/schema/era";

const SLIDER_ID = "era-slider";

type EraSliderProps = {
  eras: EraList;
  presentEnd: number;
  position: number;
  onPositionChange: (position: number) => void;
  /** 拡大したときにトラックへ入れる era の数。 */
  zoomedEraCount: number;
  /** 閉じる操作を持たせるときだけ渡し、渡すと拡大のボタンの隣に閉じるボタンを置く。 */
  onClose?: () => void;
};

/** 描く境目の年 1 つと、トラックの左端から測った、その年を中心に置く位置。 */
type BoundaryLabel = {
  key: string;
  year: number;
  leftPercent: number;
};

/** `eras` の `index` 番目の始まりの年を返す。 */
function startYearOf(eras: EraList, index: number): number {
  return eras[index].start;
}

/** `eras` の `index` 番目の終わりの年を返し、終わっていない era なら `presentEnd` を返す。 */
function endYearOf(eras: EraList, index: number, presentEnd: number): number {
  const { end } = eras[index];

  return end === ERA_END_PRESENT ? presentEnd : end;
}

/** 全体を映しているとき、強調した era の始まりと終わりの年を、そのセルの両端の縦線を中心に置く境目の年として返す。 */
function emphasizedEraLabelsOf(
  eras: EraList,
  emphasizedIndex: number,
  presentEnd: number,
): BoundaryLabel[] {
  return [
    {
      key: "start",
      year: startYearOf(eras, emphasizedIndex),
      leftPercent: (emphasizedIndex / eras.length) * 100,
    },
    {
      key: "end",
      year: endYearOf(eras, emphasizedIndex, presentEnd),
      leftPercent: ((emphasizedIndex + 1) / eras.length) * 100,
    },
  ];
}

/** 拡大しているとき、表示範囲の左端と右端の年を、トラックの両端の縦線を中心に置く境目の年として返す。 */
function viewEdgeLabelsOf(
  view: ViewRange,
  eras: EraList,
  presentEnd: number,
): BoundaryLabel[] {
  const yearAt = (position: number) =>
    positionToYear({ position, eras, presentEnd });

  return [
    { key: "start", year: yearAt(view.min), leftPercent: 0 },
    { key: "end", year: yearAt(view.min + view.span), leftPercent: 100 },
  ];
}

/**
 * `eras` の区間を 1 本のトラックに等幅で並べ、`position` の周りの現在窓を帯で重ねたスライダー。
 * 現在窓は、年の範囲の文字とトラックの上の帯の 2 つで示し、`position` が指す 1 点はつまみで示す。
 */
export default function EraSlider({
  eras,
  presentEnd,
  position,
  onPositionChange,
  zoomedEraCount,
  onClose,
}: EraSliderProps) {
  const eraCount = eras.length;
  const maxStep = eraCount * STEPS_PER_ERA;
  const zoomSpan = zoomedSpanOf(eraCount, zoomedEraCount);
  const windowPositions = currentWindowPositions({ position, eras });
  const windowYears = formatTimeRange(
    currentWindow({ position, eras, presentEnd }),
  );
  const emphasizedIndex = eraIndexAt(
    (windowPositions.start + windowPositions.end) / 2,
    eras,
  );

  const [isZoomed, setIsZoomed] = useState(false);
  const [viewMin, setViewMin] = useState(0);
  const [syncedPosition, setSyncedPosition] = useState(position);

  // キーボードや外部の操作で位置が動いたとき、拡大した表示範囲が現在窓を見失わないよう左端を直す。
  // 左右のボタンは位置を動かさないので、窓を範囲の外へずらして見ることはできる。
  if (syncedPosition !== position) {
    setSyncedPosition(position);
    setViewMin(keepWindowInView(viewMin, windowPositions, zoomSpan));
  }

  const view: ViewRange = isZoomed
    ? { min: viewMin, span: zoomSpan }
    : FULL_VIEW;
  const inputRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { isDragging, trackHandlers } = useEraTrackGesture({
    trackRef,
    inputRef,
    eraCount,
    stepCount: maxStep,
    view,
    isZoomed,
    windowHalfWidth: WINDOW_WIDTH_IN_ERAS / eraCount / 2,
    onPositionChange,
    onViewMinChange: setViewMin,
  });

  const bandLeft = Math.min(
    Math.max(viewPercentOf(windowPositions.start, view), 0),
    100,
  );
  const bandRight = Math.min(
    Math.max(viewPercentOf(windowPositions.end, view), 0),
    100,
  );
  const thumbPercent = viewPercentOf(position, view);
  const isThumbVisible = thumbPercent >= 0 && thumbPercent <= 100;
  const boundaryLabels = isZoomed
    ? viewEdgeLabelsOf(view, eras, presentEnd)
    : emphasizedEraLabelsOf(eras, emphasizedIndex, presentEnd);

  function toggleZoom() {
    if (!isZoomed) {
      setViewMin(viewMinCenteredOn(position, zoomSpan));
    }

    setIsZoomed(!isZoomed);
  }

  return (
    <div
      data-testid="era-slider"
      data-dragging={isDragging ? "true" : undefined}
      className="group font-body text-ink"
    >
      {/* 画面にはスライダーの見出しを出さないが、スクリーンリーダーにはスライダーの名前として読ませる。 */}
      <label htmlFor={SLIDER_ID} className="sr-only">
        時代
      </label>

      <div className="mb-2 flex min-h-6.5 items-center justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-1.5">
          {/* 右の年の範囲が、トラックの上の青い帯で示す範囲であることを、帯と同じ形の見本で結ぶ。 */}
          <span
            aria-hidden="true"
            className="h-2.75 w-3 shrink-0 self-center rounded-xs border-x-2 border-point bg-point/15"
          />
          <span className="text-[0.75rem] whitespace-nowrap text-ink-muted md:text-[0.8125rem]">
            表示中
          </span>
          {/* スライダーの aria-valuetext が同じ範囲を読み上げるので、スクリーンリーダーには重ねて読ませない。 */}
          <p
            aria-hidden="true"
            className="text-[0.8125rem] font-medium whitespace-nowrap text-ink tabular-nums md:text-[0.9375rem]"
          >
            {windowYears}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <EraSliderIconButton
            label="表示範囲を拡大して細かく調整する"
            isPressed={isZoomed}
            onClick={toggleZoom}
            icon={
              isZoomed ? (
                <ZoomOutIcon className="size-3.5" />
              ) : (
                <ZoomInIcon className="size-3.5" />
              )
            }
          />

          {onClose !== undefined && (
            <EraSliderIconButton
              label="時代スライダーを閉じる"
              onClick={onClose}
              icon={<CloseIcon className="size-3.5" />}
            />
          )}
        </div>
      </div>

      {/* つまみと境目の年は、枠の外へはみ出して描くので、トラックの枠とは別の層に置く。 */}
      <div className="relative pb-4.5">
        <div
          className={`relative flex h-11.5 items-stretch md:h-12.5 overflow-hidden rounded-md border bg-paper transition-[border-color,box-shadow] duration-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-point ${isZoomed ? "border-point/40 ring-2 ring-point/10" : "border-rule"}`}
        >
          <EraSliderPanButton
            label="表示範囲を過去の方向へずらす"
            isShown={isZoomed}
            isDisabled={viewMin <= 0}
            edge="start"
            icon={<ChevronsLeftIcon className="size-3" />}
            onClick={() =>
              setViewMin(panViewMinBy(viewMin, -panStepOf(eraCount), zoomSpan))
            }
          />

          <div className="relative h-full min-w-0 flex-1">
            {/* ブラウザがトラックの上のタッチをスクロールや拡大に使うと pointercancel が届いて位置が止まるので、touch-none でタッチの既定の動作を止める。 */}
            <div
              ref={trackRef}
              data-testid="era-slider-track"
              className="relative size-full cursor-pointer touch-none overflow-hidden bg-paper select-none"
              {...trackHandlers}
            >
              <ol className="absolute inset-0 m-0 list-none p-0">
                {eras.map((era, index) => {
                  const isEmphasized = index === emphasizedIndex;

                  return (
                    <li
                      key={era.id}
                      data-emphasized={isEmphasized ? "true" : undefined}
                      // 拡大の範囲に応じて位置と幅が連続に変わるので、Tailwind のユーティリティでなく style で渡す。
                      style={{
                        left: `${viewPercentOf(index / eraCount, view)}%`,
                        width: `${100 / eraCount / view.span}%`,
                      }}
                      className={`absolute inset-y-0 flex items-center justify-center overflow-hidden border-r border-rule px-0.5 whitespace-nowrap transition-[left,width,background-color,color] duration-250 ease-out-expo group-data-[dragging=true]:transition-none ${isZoomed ? "text-[0.75rem] md:text-[0.9375rem]" : "text-[0.6875rem] md:text-[0.875rem]"} ${isEmphasized ? "bg-rule/50 font-bold text-ink shadow-[inset_0_-2px_0_var(--color-ink-muted)]" : "font-medium text-ink-muted"}`}
                    >
                      {era.label}
                    </li>
                  );
                })}
              </ol>

              <div
                aria-hidden="true"
                data-testid="era-window-band"
                style={{
                  left: `${bandLeft}%`,
                  width: `${Math.max(0, bandRight - bandLeft)}%`,
                }}
                className="pointer-events-none absolute inset-y-0 z-10 border-x-2 border-point bg-point/15 transition-[left,width] duration-200 ease-out-expo group-data-[dragging=true]:transition-none"
              />

              <input
                ref={inputRef}
                id={SLIDER_ID}
                type="range"
                min={0}
                max={maxStep}
                step={1}
                value={Math.round(position * maxStep)}
                aria-valuetext={windowYears}
                onChange={(event) => {
                  const next = Number(event.target.value) / maxStep;

                  if (isZoomed) {
                    setViewMin(viewMinCenteredOn(next, zoomSpan));
                  }

                  onPositionChange(next);
                }}
                className="pointer-events-none absolute inset-0 m-0 size-full opacity-0"
              />
            </div>
          </div>

          <EraSliderPanButton
            label="表示範囲を未来の方向へずらす"
            isShown={isZoomed}
            isDisabled={viewMin >= 1 - zoomSpan}
            edge="end"
            icon={<ChevronsRightIcon className="size-3" />}
            onClick={() =>
              setViewMin(panViewMinBy(viewMin, panStepOf(eraCount), zoomSpan))
            }
          />
        </div>

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute top-0 z-20 h-11.5 md:h-12.5 transition-[left,right] duration-200 ease-out-expo ${isZoomed ? "inset-x-6" : "inset-x-0"}`}
        >
          {/* つまみは枠の外へはみ出すので、つまみ自身もトラックと同じポインタの操作を受ける。before 擬似要素は、つまみより広く押せる範囲を足す。 */}
          <div
            data-testid="era-slider-thumb"
            // つまみがトラックの両端で枠の外へはみ出さないよう、中心を両端から幅の半分（0.3125rem）より内側に留める。
            style={{
              left: `clamp(0.3125rem, ${thumbPercent}%, calc(100% - 0.3125rem))`,
            }}
            className={`absolute -bottom-1 h-4 w-2.5 -translate-x-1/2 touch-none rounded-full border-2 border-paper bg-point shadow-sm transition-[left,opacity] duration-200 ease-out-expo before:absolute before:-inset-2 before:content-[''] group-data-[dragging=true]:transition-none ${isThumbVisible ? "pointer-events-auto cursor-pointer opacity-100" : "opacity-0"}`}
            {...trackHandlers}
          />
        </div>

        {/* 境目の年は era 名のセルと同じ区間を別の形で示すだけなので、スクリーンリーダーには読ませない。 */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-0 h-3 text-[0.5625rem] font-medium text-ink-muted/70 tabular-nums md:text-[0.6875rem] transition-[left,right] duration-200 ease-out-expo ${isZoomed ? "inset-x-6" : "inset-x-0"}`}
        >
          {boundaryLabels.map(({ key, year, leftPercent }) => (
            <span
              key={key}
              data-testid="era-boundary-year"
              style={{ left: `${leftPercent}%` }}
              className="absolute top-0 -translate-x-1/2 leading-none whitespace-nowrap transition-[left] duration-200 ease-out-expo group-data-[dragging=true]:transition-none"
            >
              {formatYearWithoutUnit(year)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
