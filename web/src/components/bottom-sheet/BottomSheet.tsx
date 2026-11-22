"use client";

/**
 * 画面の下から引き出す 1 枚のシートの枠を描く。
 * 枠は取っ手の行・era スライダーを入れる領域・`children` を入れるスクロールの領域で構成し、`children` の中身は知らない。
 *
 * 段（`SheetStage`）と era スライダーを出すかは保持しない。
 * どちらも props で受け取り、取っ手のタップとスワイプが決めた段を `onStageChange`、era スライダーの出し入れを `onEraSliderShownChange` で返す。
 * 取っ手の行だけがタッチを受けるので、地図の上のパンとピンチは地図が受ける。
 * `list` と `full` の段では、取っ手の行の右端の閉じるボタンが、段をいくつ上げていても `era` の段へ一度で戻す。
 *
 * スワイプは、指が `SWIPE_THRESHOLD_PX` を超えて動いた時点で、動いた向きの隣の段へ移す。
 * 開きたい高さまで指を運ばなくても、短い移動で次の段へ届く。
 *
 * 段が変わると、シートの高さが CSS の transition で動く。
 * 高さは `auto` からは動かせないので、`closed` と `era` の段の高さも、取っ手と era スライダーを測った数値で持つ。
 * 隠れる領域は、動き終わってから見えなくする（`globals.css`）ので、縮むシートの中が先に空にならず、隠れた中身へフォーカスも移らない。
 */

import {
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  fullHeightPx,
  listHeightPx,
  nextSheetStage,
  SHEET_FULL_TOP_REM,
  SHEET_LIST_RATIO,
  SHEET_STAGE,
  type SheetStage,
  stepSheetStage,
} from "@/lib/map/sheet";

/** 指がこの距離（px）以上動いたら、スワイプとして扱い、段を移す。 */
const SWIPE_THRESHOLD_PX = 48;

/** 指がこの距離（px）を超えて動いたら、離してもタップとして扱わない。 */
const TAP_SLOP_PX = 6;

type BottomSheetProps = {
  stage: SheetStage;
  onStageChange: (stage: SheetStage) => void;
  /** 画面には出さず、シートの名前として読み上げに使う。 */
  label: string;
  /** `era` の段と、`list` の段で出す設定のときに、取っ手の下へ出す era スライダー。 */
  eraSlider: ReactNode;
  /**
   * `list` の段で era スライダーを出すか。
   * `era` の段では常に出し、`closed` と `full` の段では出さない。
   */
  isEraSliderShown: boolean;
  onEraSliderShownChange: (isShown: boolean) => void;
  /**
   * 段が変わった後にシートが取る高さ（px）を、段が変わるたびに渡して呼ぶ。
   * 高さの動きの途中の値ではなく、動き終わった後の値を渡す。
   */
  onTargetHeightChange: (height: number) => void;
  children: ReactNode;
};

/** 押してから、タップかスワイプかが決まるまでの間に覚えておく値。 */
type PressState = {
  pointerId: number;
  startY: number;
  hasMoved: boolean;
};

/** `closed` と `era` の段のシートの高さ（px）。 */
type MeasuredHeights = { closed: number; era: number };

/**
 * `stage` の段のシートの高さ（px）を返す。
 * `list` と `full` の段は画面の高さから求める。
 */
function targetHeightOf(stage: SheetStage, measured: MeasuredHeights): number {
  if (stage === SHEET_STAGE.list) {
    return listHeightPx(window.innerHeight);
  }

  if (stage === SHEET_STAGE.full) {
    return fullHeightPx(
      window.innerHeight,
      Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
    );
  }

  return stage === SHEET_STAGE.era ? measured.era : measured.closed;
}

/**
 * シートの `height` に渡す値を返す。
 * `list` と `full` の段は、端末の画面の高さの変化に追従するよう `dvh` で渡す。
 */
function heightStyleOf(stage: SheetStage, measured: MeasuredHeights): string {
  if (stage === SHEET_STAGE.list) {
    return `${SHEET_LIST_RATIO * 100}dvh`;
  }

  if (stage === SHEET_STAGE.full) {
    return `calc(100dvh - ${SHEET_FULL_TOP_REM}rem)`;
  }

  return `${targetHeightOf(stage, measured)}px`;
}

/**
 * 取っ手の行・era スライダー・中身の領域を縦に並べたシートを描く。
 * 取っ手のタップで次の段へ、上下のスワイプで隣の段へ移す。
 */
export default function BottomSheet({
  stage,
  onStageChange,
  label,
  eraSlider,
  isEraSliderShown,
  onEraSliderShownChange,
  onTargetHeightChange,
  children,
}: BottomSheetProps) {
  const bodyId = useId();
  const press = useRef<PressState | null>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const handleRowRef = useRef<HTMLDivElement>(null);
  const eraContentRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<MeasuredHeights>({
    closed: 0,
    era: 0,
  });

  // 最初の高さを測るまでは動かさない。
  // 動かすと、最初の描画で高さ 0 から伸びる。
  const [isAnimated, setIsAnimated] = useState(false);

  const isListShown = stage === SHEET_STAGE.list || stage === SHEET_STAGE.full;
  const isEraShown =
    stage === SHEET_STAGE.era ||
    (stage === SHEET_STAGE.list && isEraSliderShown);

  // `closed` の段は取っ手の行の高さ、`era` の段はそれに era スライダーの高さを足した高さにする。
  // 枠線の太さは、シートの外形と内側の差で測る。
  function measure() {
    const sheet = sheetRef.current;
    const handleRow = handleRowRef.current;
    const eraContent = eraContentRef.current;

    if (sheet === null || handleRow === null || eraContent === null) {
      return;
    }

    const closed =
      handleRow.offsetHeight + sheet.offsetHeight - sheet.clientHeight;

    const era = closed + eraContent.offsetHeight;

    setMeasured((previous) =>
      previous.closed === closed && previous.era === era
        ? previous
        : { closed, era },
    );
  }

  // 測った値が変わらなければ state を変えないので、描画のたびに測っても再描画を繰り返さない。
  useLayoutEffect(measure);

  // biome-ignore lint/correctness/useExhaustiveDependencies: measure は毎回作り直す関数で、画面の大きさが変わるたびに測り直す。
  useEffect(() => {
    setIsAnimated(true);
    window.addEventListener("resize", measure);

    return () => window.removeEventListener("resize", measure);
  }, []);

  useLayoutEffect(() => {
    onTargetHeightChange(targetHeightOf(stage, measured));
  }, [stage, measured, onTargetHeightChange]);

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
      ref={sheetRef}
      aria-label={label}
      data-testid="bottom-sheet"
      data-stage={stage}
      style={{ height: heightStyleOf(stage, measured) }}
      className={`flex min-h-0 flex-col overflow-hidden rounded-t-box border border-b-0 border-rule bg-paper font-body text-ink shadow-sm ${isAnimated ? "transition-[height] duration-300 ease-out motion-reduce:transition-none" : ""}`}
    >
      {/* touch-none は、取っ手の行の上のタッチをブラウザのスクロールと拡大へ渡さず、スワイプとして受けるための指定。 */}
      <div
        ref={handleRowRef}
        data-testid="bottom-sheet-handle"
        className="relative flex-none touch-none"
        onPointerDown={startPress}
        onPointerMove={continuePress}
        onPointerUp={finishPress}
        onPointerCancel={finishPress}
      >
        {/* ポインタの操作は上の行が受けるので、ボタンの click はキーボードと読み上げの操作（`detail` が 0）だけを段の移動に使う。 */}
        <button
          type="button"
          aria-expanded={stage !== SHEET_STAGE.closed}
          aria-controls={bodyId}
          onClick={(event) => {
            if (event.detail === 0) {
              onStageChange(nextSheetStage(stage));
            }
          }}
          className="flex min-h-11 w-full items-center justify-center px-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-point"
        >
          <span aria-hidden="true" className="h-1 w-10 rounded-full bg-rule" />
          <span className="sr-only">{label}</span>
        </button>

        {/* 右端のボタンは、押しても行のスワイプとタップを始めないよう、ポインタの押下を行へ伝えない。 */}
        {isListShown && (
          <div className="absolute inset-y-0 right-3 flex items-center gap-2">
            {stage === SHEET_STAGE.list && !isEraSliderShown && (
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onEraSliderShownChange(true)}
                className="rounded-full border border-rule px-3 py-1.5 text-[0.8rem] text-ink hover:bg-rule/40 focus-visible:outline-2 focus-visible:outline-point"
              >
                時代を変える
              </button>
            )}

            {/* 下向きの山形は、シートを下へ戻すことを示す。era スライダーの × と取り違えない形にする。 */}
            <button
              type="button"
              aria-label="一覧を閉じる"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onStageChange(SHEET_STAGE.era)}
              className="flex size-9 items-center justify-center rounded-full text-ink-muted hover:bg-rule/40 hover:text-ink focus-visible:outline-2 focus-visible:outline-point"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5 fill-none stroke-current stroke-2"
              >
                <path
                  d="M6 9l6 6 6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* `full` の段と、`list` の段で隠す設定のときは、領域の高さを 0 にする。
          `closed` の段は 0 にせず、シートの高さが隠す。 */}
      <div
        data-sheet-region
        data-sheet-era
        data-open={isEraShown}
        data-expanded={
          stage !== SHEET_STAGE.full &&
          !(stage === SHEET_STAGE.list && !isEraSliderShown)
        }
      >
        <div className="min-h-0 overflow-hidden">
          <div ref={eraContentRef} className="relative px-4 pb-3">
            {eraSlider}

            {/* era スライダーの年の範囲の文字は右寄せなので、空いている左上へ置く。 */}
            {stage === SHEET_STAGE.list && isEraSliderShown && (
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
        </div>
      </div>

      {/* touch-pan-y は、シートの上のピンチでページが拡大されないよう、縦のスクロール以外のタッチの動作を外す指定。 */}
      <div
        id={bodyId}
        data-sheet-region
        data-open={isListShown}
        className="flex min-h-0 flex-1 touch-pan-y flex-col overflow-hidden border-t border-rule"
      >
        {children}
      </div>
    </aside>
  );
}
