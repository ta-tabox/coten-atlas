"use client";

/**
 * スマホの幅で、era スライダーと一覧・詳細カードを画面の下から引き出す 1 枚のシートの枠を描く。
 * 枠は見出しの行・era スライダーを入れる領域・`children` を入れるスクロールの領域で構成する。
 *
 * 段（`SheetStage`）と era スライダーを出すかは保持しない。
 * どちらも props で受け取り、見出しのタップとドラッグが決めた段を `onStageChange`、era スライダーの出し入れを `onEraSliderShownChange` で返す。
 * 見出しの行だけがタッチを受けるので、地図の上のパンとピンチは地図が受ける。
 *
 * 出さない領域は、見出しの下に隠れた中身へフォーカスが移らないよう、高さを 0 にして見えなくする。
 * era スライダーの領域は隠している間も描いておくので、`era` の段の高さをドラッグの開始時に測れる。
 */

import {
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useId,
  useRef,
  useState,
} from "react";
import {
  nextSheetStage,
  SHEET_FULL_RATIO,
  SHEET_LIST_RATIO,
  type SheetStage,
  sheetStageOf,
} from "@/lib/map/sheet";

/** 指がこの距離（px）より動かなければ、ドラッグでなくタップとして扱う。 */
const TAP_SLOP_PX = 6;

type SeriesSheetProps = {
  stage: SheetStage;
  onStageChange: (stage: SheetStage) => void;
  heading: string;
  /** `era` の段と、`list` の段で出す設定のときに、見出しの下へ出す era スライダー。 */
  eraSlider: ReactNode;
  /**
   * `list` の段で era スライダーを出すか。
   * `era` の段では常に出し、`closed` と `full` の段では出さない。
   */
  isEraSliderShown: boolean;
  onEraSliderShownChange: (isShown: boolean) => void;
  children: ReactNode;
};

/** 押してから離すまでの間に、ドラッグの計算が使う値。 */
type DragState = {
  pointerId: number;
  startY: number;
  startHeight: number;
  stageHeights: Record<SheetStage, number>;
  isDragging: boolean;
};

/** ドラッグしている間のシートの高さと、その高さに最も近い段。 */
type DragPosition = { height: number; stage: SheetStage };

/**
 * `state` の最も低い段と最も高い段の範囲に収めた、指が `clientY` にあるときのシートの高さを返す。
 * 指を上へ動かすほどシートは高くなる。
 */
function heightAt(state: DragState, clientY: number): number {
  const height = state.startHeight + (state.startY - clientY);

  return Math.min(
    state.stageHeights.full,
    Math.max(state.stageHeights.closed, height),
  );
}

/**
 * シートの `height` に渡す値を返す。
 * ドラッグ中（`dragHeight` が数値）は指の位置の高さ、そうでなければ段の高さにする。
 * `closed` と `era` の段は、中身の高さに合わせる。
 */
function heightStyleOf(stage: SheetStage, dragHeight: number | null): string {
  if (dragHeight !== null) {
    return `${dragHeight}px`;
  }

  if (stage === "list") {
    return `${SHEET_LIST_RATIO * 100}dvh`;
  }

  return stage === "full" ? `${SHEET_FULL_RATIO * 100}dvh` : "auto";
}

/**
 * 見出しの行・era スライダー・中身の領域を縦に並べたシートを描く。
 * 見出しをドラッグしている間は、指の位置に合わせた高さにし、中身は指の位置に最も近い段のものを出す。
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
  const sheetRef = useRef<HTMLElement>(null);
  const headingRowRef = useRef<HTMLDivElement>(null);
  const eraContentRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);
  const [dragPosition, setDragPosition] = useState<DragPosition | null>(null);

  const shownStage = dragPosition === null ? stage : dragPosition.stage;
  const isListShown = shownStage === "list" || shownStage === "full";
  const isEraShown =
    shownStage === "era" || (shownStage === "list" && isEraSliderShown);

  /**
   * 主ボタン・指・ペンで見出しの行を押したら、そのポインタを追い始める。
   * 各段の高さは、この時点の画面の高さと、見出しの行・era スライダーの高さから求める。
   */
  function startDragging(event: ReactPointerEvent<HTMLDivElement>) {
    const sheet = sheetRef.current;
    const headingRow = headingRowRef.current;
    const eraContent = eraContentRef.current;

    if (
      sheet === null ||
      headingRow === null ||
      eraContent === null ||
      !event.isPrimary ||
      event.button !== 0
    ) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    // シートの枠線の太さ（外形と内側の差）を、見出しの行の高さへ足して閉じた段の高さにする。
    const closedHeight =
      headingRow.offsetHeight + sheet.offsetHeight - sheet.clientHeight;

    drag.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startHeight: sheet.offsetHeight,
      stageHeights: {
        closed: closedHeight,
        era: closedHeight + eraContent.offsetHeight,
        list: window.innerHeight * SHEET_LIST_RATIO,
        full: window.innerHeight * SHEET_FULL_RATIO,
      },
      isDragging: false,
    };
  }

  /** 押しているポインタが動いたら、`TAP_SLOP_PX` を超えた時点からシートの高さを指に合わせる。 */
  function continueDragging(event: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current;

    if (state === null || event.pointerId !== state.pointerId) {
      return;
    }

    if (Math.abs(state.startY - event.clientY) > TAP_SLOP_PX) {
      state.isDragging = true;
    }

    if (state.isDragging) {
      const height = heightAt(state, event.clientY);

      setDragPosition({
        height,
        stage: sheetStageOf({
          releasedHeight: height,
          stageHeights: state.stageHeights,
        }),
      });
    }
  }

  /**
   * 押しているポインタが離れるか打ち切られたら、追うのをやめて段を決める。
   * 動いていなければタップとして次の段へ移し、動いていれば離した高さに近い段へ移す。
   */
  function finishDragging(event: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current;

    if (state === null || event.pointerId !== state.pointerId) {
      return;
    }

    drag.current = null;
    setDragPosition(null);

    if (!state.isDragging) {
      onStageChange(nextSheetStage(stage));

      return;
    }

    onStageChange(
      sheetStageOf({
        releasedHeight: heightAt(state, event.clientY),
        stageHeights: state.stageHeights,
      }),
    );
  }

  return (
    <aside
      ref={sheetRef}
      aria-label={heading}
      data-testid="series-sheet"
      data-stage={stage}
      style={{ height: heightStyleOf(stage, dragPosition?.height ?? null) }}
      className="flex min-h-0 flex-col overflow-hidden rounded-t-box border border-b-0 border-rule bg-paper font-body text-ink shadow-sm"
    >
      {/* touch-none は、見出しの行の上のタッチをブラウザのスクロールと拡大へ渡さず、ドラッグとして受けるための指定。 */}
      <div
        ref={headingRowRef}
        data-testid="series-sheet-heading"
        className="relative flex-none touch-none"
        onPointerDown={startDragging}
        onPointerMove={continueDragging}
        onPointerUp={finishDragging}
        onPointerCancel={finishDragging}
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
          className="flex w-full flex-col items-center gap-1.5 px-4 pt-2 pb-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-point"
        >
          <span aria-hidden="true" className="h-1 w-10 rounded-full bg-rule" />
          <span className="font-heading text-[1.05rem] font-bold text-heading">
            {heading}
          </span>
        </button>

        {/* 押しても行のドラッグとタップを始めないよう、ポインタの押下を行へ伝えない。 */}
        {shownStage === "list" && (
          <button
            type="button"
            aria-pressed={isEraSliderShown}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onEraSliderShownChange(!isEraSliderShown)}
            className={`absolute top-2 right-3 rounded-full border border-rule px-3 py-1 text-[0.8rem] focus-visible:outline-2 focus-visible:outline-point ${isEraSliderShown ? "bg-rule/60 text-ink" : "text-ink-muted"}`}
          >
            時代
          </button>
        )}
      </div>

      <div
        className={isEraShown ? "flex-none" : "invisible h-0 overflow-hidden"}
      >
        <div ref={eraContentRef} className="px-4 pt-1 pb-3">
          {eraSlider}
        </div>
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
