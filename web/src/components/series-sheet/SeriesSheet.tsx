"use client";

/**
 * スマホの幅で、一覧と詳細カードを画面の下から引き出す 1 枚のシートの枠を描く。
 * 枠は見出しの行と、`children` を入れるスクロールの領域で構成する。
 *
 * 段（`SheetStage`）は保持しない。
 * 段は props で受け取り、見出しのタップとドラッグが決めた段を `onStageChange` で返す。
 * 見出しの行だけがタッチを受けるので、地図の上のパンとピンチは地図が受ける。
 *
 * 閉じた段では、見出しの下に隠れた中身へフォーカスが移らないようにする。
 */

import {
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useId,
  useRef,
  useState,
} from "react";
import {
  SHEET_OPEN_RATIO,
  type SheetStage,
  sheetStageOf,
} from "@/lib/map/sheet";

/** 指がこの距離（px）より動かなければ、ドラッグでなくタップとして扱う。 */
const TAP_SLOP_PX = 6;

type SeriesSheetProps = {
  stage: SheetStage;
  onStageChange: (stage: SheetStage) => void;
  heading: string;
  children: ReactNode;
};

/** 押してから離すまでの間に、ドラッグの計算が使う値。 */
type DragState = {
  pointerId: number;
  startY: number;
  startHeight: number;
  closedHeight: number;
  openHeight: number;
  isDragging: boolean;
};

/**
 * `state` の範囲に収めた、指が `clientY` にあるときのシートの高さを返す。
 * 指を上へ動かすほどシートは高くなる。
 */
function heightAt(state: DragState, clientY: number): number {
  const height = state.startHeight + (state.startY - clientY);

  return Math.min(state.openHeight, Math.max(state.closedHeight, height));
}

/**
 * シートの `height` に渡す値を返す。
 * ドラッグ中（`dragHeight` が数値）は指の位置の高さ、そうでなければ段の高さにする。
 * 閉じた段は内容の高さ（見出しの行だけ）にする。
 */
function heightStyleOf(stage: SheetStage, dragHeight: number | null): string {
  if (dragHeight !== null) {
    return `${dragHeight}px`;
  }

  return stage === "open" ? `${SHEET_OPEN_RATIO * 100}dvh` : "auto";
}

/**
 * 見出しの行と中身の領域を縦に並べたシートを描く。
 * `stage` が `open` なら高さを画面の高さの半分にし、`closed` なら見出しの行の高さにする。
 * 見出しをドラッグしている間は、指の位置に合わせた高さにする。
 */
export default function SeriesSheet({
  stage,
  onStageChange,
  heading,
  children,
}: SeriesSheetProps) {
  const bodyId = useId();
  const sheetRef = useRef<HTMLElement>(null);
  const headingRowRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);
  const [dragHeight, setDragHeight] = useState<number | null>(null);

  function toggleStage() {
    onStageChange(stage === "open" ? "closed" : "open");
  }

  /**
   * 主ボタン・指・ペンで見出しの行を押したら、そのポインタを追い始める。
   * 閉じた段と開いた段の高さは、この時点の画面の高さと見出しの行の高さから求める。
   */
  function startDragging(event: ReactPointerEvent<HTMLDivElement>) {
    const sheet = sheetRef.current;
    const headingRow = headingRowRef.current;

    if (
      sheet === null ||
      headingRow === null ||
      !event.isPrimary ||
      event.button !== 0
    ) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    // シートの枠線の太さ（外形と内側の差）を、見出しの行の高さへ足して閉じた段の高さにする。
    const borderHeight = sheet.offsetHeight - sheet.clientHeight;

    drag.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startHeight: sheet.offsetHeight,
      closedHeight: headingRow.offsetHeight + borderHeight,
      openHeight: window.innerHeight * SHEET_OPEN_RATIO,
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
      setDragHeight(heightAt(state, event.clientY));
    }
  }

  /**
   * 押しているポインタが離れるか打ち切られたら、追うのをやめて段を決める。
   * 動いていなければタップとして段を入れ替え、動いていれば離した高さに近い段へ移す。
   */
  function finishDragging(event: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current;

    if (state === null || event.pointerId !== state.pointerId) {
      return;
    }

    drag.current = null;
    setDragHeight(null);

    if (!state.isDragging) {
      toggleStage();

      return;
    }

    onStageChange(
      sheetStageOf({
        releasedHeight: heightAt(state, event.clientY),
        closedHeight: state.closedHeight,
        openHeight: state.openHeight,
      }),
    );
  }

  const isOpen = dragHeight !== null || stage === "open";
  const height = heightStyleOf(stage, dragHeight);

  return (
    <aside
      ref={sheetRef}
      aria-label={heading}
      data-testid="series-sheet"
      data-stage={stage}
      style={{ height }}
      className="flex min-h-0 flex-col overflow-hidden rounded-t-box border border-b-0 border-rule bg-paper font-body text-ink shadow-sm"
    >
      {/* touch-none は、見出しの行の上のタッチをブラウザのスクロールと拡大へ渡さず、ドラッグとして受けるための指定。 */}
      <div
        ref={headingRowRef}
        data-testid="series-sheet-heading"
        className="flex-none touch-none"
        onPointerDown={startDragging}
        onPointerMove={continueDragging}
        onPointerUp={finishDragging}
        onPointerCancel={finishDragging}
      >
        {/* ポインタの操作は上の行が受けるので、ボタンの click はキーボードと読み上げの操作（`detail` が 0）だけを段の入れ替えに使う。 */}
        <button
          type="button"
          aria-expanded={stage === "open"}
          aria-controls={bodyId}
          onClick={(event) => {
            if (event.detail === 0) {
              toggleStage();
            }
          }}
          className="flex w-full flex-col items-center gap-1.5 px-4 pt-2 pb-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-point"
        >
          <span aria-hidden="true" className="h-1 w-10 rounded-full bg-rule" />
          <span className="font-heading text-[1.05rem] font-bold text-heading">
            {heading}
          </span>
        </button>
      </div>

      {/* touch-pan-y は、シートの上のピンチでページが拡大されないよう、縦のスクロール以外のタッチの動作を外す指定。 */}
      <div
        id={bodyId}
        className={`flex min-h-0 touch-pan-y flex-col overflow-hidden border-t border-rule ${isOpen ? "flex-1" : "invisible h-0"}`}
      >
        {children}
      </div>
    </aside>
  );
}
