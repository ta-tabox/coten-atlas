"use client";

/**
 * スマホの幅で、era スライダーと一覧・詳細カードを画面の下から引き出す 1 枚のシートの枠を描く。
 * 枠は取っ手の行・era スライダーを入れる領域・`children` を入れるスクロールの領域で構成する。
 *
 * 段（`SheetStage`）と era スライダーを出すかは保持しない。
 * どちらも props で受け取り、取っ手のタップとスワイプが決めた段を `onStageChange`、era スライダーの出し入れを `onEraSliderShownChange` で返す。
 * 取っ手の行だけがタッチを受けるので、地図の上のパンとピンチは地図が受ける。
 *
 * スワイプは、指が `SWIPE_THRESHOLD_PX` を超えて動いた時点で、動いた向きの隣の段へ移す。
 * 開きたい高さまで指を運ばなくても、短い移動で次の段へ届く。
 * 出さない領域は、取っ手の下に隠れた中身へフォーカスが移らないよう、高さを 0 にして見えなくする。
 */

import {
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useId,
  useRef,
} from "react";
import {
  nextSheetStage,
  SHEET_FULL_RATIO,
  SHEET_LIST_RATIO,
  type SheetStage,
  stepSheetStage,
} from "@/lib/map/sheet";

/** 指がこの距離（px）以上動いたら、スワイプとして扱い、段を移す。 */
const SWIPE_THRESHOLD_PX = 24;

/** 指がこの距離（px）を超えて動いたら、離してもタップとして扱わない。 */
const TAP_SLOP_PX = 6;

type SeriesSheetProps = {
  stage: SheetStage;
  onStageChange: (stage: SheetStage) => void;
  /** 画面には出さず、シートの名前として読み上げに使う。 */
  heading: string;
  /** `era` の段と、`list` の段で出す設定のときに、取っ手の下へ出す era スライダー。 */
  eraSlider: ReactNode;
  /**
   * `list` の段で era スライダーを出すか。
   * `era` の段では常に出し、`closed` と `full` の段では出さない。
   */
  isEraSliderShown: boolean;
  onEraSliderShownChange: (isShown: boolean) => void;
  children: ReactNode;
};

/** 押してから、タップかスワイプかが決まるまでの間に覚えておく値。 */
type PressState = {
  pointerId: number;
  startY: number;
  hasMoved: boolean;
};

/**
 * シートの `height` に渡す値を返す。
 * `closed` と `era` の段は、中身の高さに合わせる。
 */
function heightStyleOf(stage: SheetStage): string {
  if (stage === "list") {
    return `${SHEET_LIST_RATIO * 100}dvh`;
  }

  return stage === "full" ? `${SHEET_FULL_RATIO * 100}dvh` : "auto";
}

/**
 * 取っ手の行・era スライダー・中身の領域を縦に並べたシートを描く。
 * 取っ手のタップで次の段へ、上下のスワイプで隣の段へ移す。
 */
export default function SeriesSheet({
  stage,
  onStageChange,
  heading,
  eraSlider,
  isEraSliderShown,
  onEraSliderShownChange,
  children,
}: SeriesSheetProps) {
  const bodyId = useId();
  const press = useRef<PressState | null>(null);

  const isListShown = stage === "list" || stage === "full";
  const isEraShown = stage === "era" || (stage === "list" && isEraSliderShown);

  /** 主ボタン・指・ペンで取っ手の行を押したら、そのポインタを追い始める。 */
  function startPress(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    press.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      hasMoved: false,
    };
  }

  /**
   * 押しているポインタが `SWIPE_THRESHOLD_PX` 以上動いたら、動いた向きの隣の段へ移し、そのポインタを追うのをやめる。
   * 追うのをやめるので、離したときにタップとして扱わず、同じ操作で段が 2 つ進まない。
   */
  function continuePress(event: ReactPointerEvent<HTMLDivElement>) {
    const state = press.current;

    if (state === null || event.pointerId !== state.pointerId) {
      return;
    }

    const moved = state.startY - event.clientY;

    if (Math.abs(moved) > TAP_SLOP_PX) {
      state.hasMoved = true;
    }

    if (Math.abs(moved) < SWIPE_THRESHOLD_PX) {
      return;
    }

    press.current = null;
    onStageChange(stepSheetStage(stage, moved > 0 ? "up" : "down"));
  }

  /**
   * 押しているポインタが、`TAP_SLOP_PX` を超えて動かずに離れたらタップとして次の段へ移す。
   * 動いてから離れたときと、打ち切られたときは、何もしない。
   */
  function finishPress(event: ReactPointerEvent<HTMLDivElement>) {
    const state = press.current;

    if (state === null || event.pointerId !== state.pointerId) {
      return;
    }

    press.current = null;

    if (event.type === "pointerup" && !state.hasMoved) {
      onStageChange(nextSheetStage(stage));
    }
  }

  return (
    <aside
      aria-label={heading}
      data-testid="series-sheet"
      data-stage={stage}
      style={{ height: heightStyleOf(stage) }}
      className="flex min-h-0 flex-col overflow-hidden rounded-t-box border border-b-0 border-rule bg-paper font-body text-ink shadow-sm"
    >
      {/* touch-none は、取っ手の行の上のタッチをブラウザのスクロールと拡大へ渡さず、スワイプとして受けるための指定。 */}
      <div
        data-testid="series-sheet-heading"
        className="relative flex-none touch-none"
        onPointerDown={startPress}
        onPointerMove={continuePress}
        onPointerUp={finishPress}
        onPointerCancel={finishPress}
      >
        {/* ポインタの操作は上の行が受けるので、ボタンの click はキーボードと読み上げの操作（`detail` が 0）だけを段の移動に使う。 */}
        <button
          type="button"
          aria-expanded={stage !== "closed"}
          aria-controls={bodyId}
          onClick={(event) => {
            if (event.detail === 0) {
              onStageChange(nextSheetStage(stage));
            }
          }}
          className="flex min-h-11 w-full items-center justify-center px-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-point"
        >
          <span aria-hidden="true" className="h-1 w-10 rounded-full bg-rule" />
          <span className="sr-only">{heading}</span>
        </button>

        {/* 押しても行のスワイプとタップを始めないよう、ポインタの押下を行へ伝えない。 */}
        {stage === "list" && !isEraSliderShown && (
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onEraSliderShownChange(true)}
            className="absolute top-1.5 right-3 rounded-full border border-rule px-3 py-1.5 text-[0.8rem] text-ink hover:bg-rule/40 focus-visible:outline-2 focus-visible:outline-point"
          >
            時代を変える
          </button>
        )}
      </div>

      <div
        className={`relative ${isEraShown ? "flex-none" : "invisible h-0 overflow-hidden"}`}
      >
        <div className="px-4 pb-3">{eraSlider}</div>

        {/* era スライダーの年の範囲の文字は右寄せなので、空いている左上へ置く。 */}
        {stage === "list" && isEraSliderShown && (
          <button
            type="button"
            aria-label="時代スライダーを閉じる"
            onClick={() => onEraSliderShownChange(false)}
            className="absolute top-2 left-7 rounded-control px-1.5 text-[1.1rem] text-ink-muted hover:bg-rule/40 hover:text-ink focus-visible:outline-2 focus-visible:outline-point"
          >
            ×
          </button>
        )}
      </div>

      {/* touch-pan-y は、シートの上のピンチでページが拡大されないよう、縦のスクロール以外のタッチの動作を外す指定。 */}
      <div
        id={bodyId}
        className={`flex min-h-0 touch-pan-y flex-col overflow-hidden border-t border-rule ${isListShown ? "flex-1" : "invisible h-0"}`}
      >
        {children}
      </div>
    </aside>
  );
}
