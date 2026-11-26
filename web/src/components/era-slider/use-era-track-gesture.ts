/**
 * era スライダーのトラックを指で押して動かす操作を受け、押した位置と動かした先の位置を返すフックを置く。
 * 拡大中に指がトラックの端に寄っている間は、表示範囲を自動で送り、送った先の位置も返す。
 *
 * 位置と表示範囲の値は持たず、呼び出し側から受け取り、変えたい値を `onPositionChange` と `onViewMinChange` で返す。
 * 指の座標から位置への変換は `@/lib/era/pointer`、表示範囲の求め方は `@/lib/era/view` が担当する。
 * トラックはタッチの既定の動作（スクロール・拡大）を止めてから使い、止めないとブラウザが `pointercancel` を送って操作が途切れる。
 */

import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { clientXToPosition } from "@/lib/era/pointer";
import {
  autoPanDirection,
  clampPositionToViewWindow,
  clampViewMin,
  type ViewRange,
} from "@/lib/era/view";

/** 押した位置からこの距離（px）を越えて動いたら、押している間の操作をドラッグとみなす。 */
const DRAG_SLOP_PX = 4;

/** 全体を映すトラックで、両端からこの距離（px）以内を押すと、0 と 1 を選んだものとして扱う。 */
const EDGE_SNAP_PX = 8;

/** 拡大中に指が端に寄っている間、表示範囲が動く速さ（1 秒あたりの era の区間の数）。 */
const AUTO_PAN_ERAS_PER_SECOND = 0.8;

/**
 * 端で指を押したまま、この時間（ms）が過ぎるまでは、表示範囲を送らない。
 * 位置を選ぶつもりのタップや、押した指の小さな揺れで、範囲が動き出さないようにする。
 */
const AUTO_PAN_HOLD_MS = 250;

/** タブの切り替えなどでフレームの間隔が空いても、表示範囲が飛ばないよう、1 フレームで進める時間の上限（秒）。 */
const MAX_FRAME_SECONDS = 0.05;

type EraTrackGestureParams = {
  trackRef: RefObject<HTMLDivElement | null>;
  /** 押したときにフォーカスを移し、続けて矢印キーで動かせるようにする `<input type="range">`。 */
  inputRef: RefObject<HTMLInputElement | null>;
  eraCount: number;
  stepCount: number;
  view: ViewRange;
  isZoomed: boolean;
  /** 現在窓の幅の半分を、era 空間の位置（0..1）の差で表した値。 */
  windowHalfWidth: number;
  onPositionChange: (position: number) => void;
  onViewMinChange: (viewMin: number) => void;
};

/** 押している指の ID と、押した位置・いまの位置・押した時刻（`performance.now()`、ms）。 */
type ActivePointer = {
  id: number;
  downX: number;
  lastX: number;
  downTime: number;
};

/** トラックの要素へ渡すポインタのハンドラと、押している指がドラッグ中かの値を返す。 */
export function useEraTrackGesture({
  trackRef,
  inputRef,
  eraCount,
  stepCount,
  view,
  isZoomed,
  windowHalfWidth,
  onPositionChange,
  onViewMinChange,
}: EraTrackGestureParams) {
  const [isDragging, setIsDragging] = useState(false);
  const pointer = useRef<ActivePointer | null>(null);
  const frameId = useRef<number | null>(null);
  const lastFrameTime = useRef(0);

  // 自動送りは次のフレームで動くので、そのときの最新の表示範囲を読めるよう、描画のたびに置く。
  const latest = useRef({ view, isZoomed });
  latest.current = { view, isZoomed };

  useEffect(() => {
    return () => {
      if (frameId.current !== null) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, []);

  /** `clientX` がトラックの上で指す位置を、`atView` の範囲で求め、トラックが無ければ undefined を返す。 */
  function positionAt(clientX: number, atView: ViewRange): number | undefined {
    const rect = trackRef.current?.getBoundingClientRect();

    if (rect === undefined) {
      return undefined;
    }

    const position = clientXToPosition({
      clientX,
      trackLeft: rect.left,
      trackWidth: rect.width,
      stepCount,
      view: atView,
      edgeSnapPx: latest.current.isZoomed ? 0 : EDGE_SNAP_PX,
    });

    return latest.current.isZoomed
      ? clampPositionToViewWindow(position, atView, windowHalfWidth)
      : position;
  }

  function updateFromClientX(clientX: number) {
    const position = positionAt(clientX, latest.current.view);

    if (position !== undefined) {
      onPositionChange(position);
    }
  }

  /** 指が `clientX` にあるとき、表示範囲を送る向きを返し、トラックが無ければ 0 を返す。 */
  function autoPanDirectionAt(clientX: number): -1 | 0 | 1 {
    const rect = trackRef.current?.getBoundingClientRect();

    if (rect === undefined) {
      return 0;
    }

    return autoPanDirection({
      ratio: (clientX - rect.left) / rect.width,
      edgeRatio: windowHalfWidth / latest.current.view.span,
      view: latest.current.view,
    });
  }

  function stopAutoPan() {
    if (frameId.current !== null) {
      cancelAnimationFrame(frameId.current);
      frameId.current = null;
    }
  }

  function autoPanStep(now: number) {
    const active = pointer.current;
    const direction =
      active === null || !latest.current.isZoomed
        ? 0
        : autoPanDirectionAt(active.lastX);

    if (active === null || direction === 0) {
      frameId.current = null;

      return;
    }

    if (now - active.downTime < AUTO_PAN_HOLD_MS) {
      lastFrameTime.current = now;
      frameId.current = requestAnimationFrame(autoPanStep);

      return;
    }

    const seconds = Math.min(
      MAX_FRAME_SECONDS,
      (now - lastFrameTime.current) / 1000,
    );
    const { span } = latest.current.view;
    const speed = AUTO_PAN_ERAS_PER_SECOND / eraCount;
    const nextView = {
      min: clampViewMin(
        latest.current.view.min + direction * speed * seconds,
        span,
      ),
      span,
    };
    const position = positionAt(active.lastX, nextView);

    lastFrameTime.current = now;
    latest.current.view = nextView;
    onViewMinChange(nextView.min);

    if (position !== undefined) {
      onPositionChange(position);
    }

    frameId.current = requestAnimationFrame(autoPanStep);
  }

  function startAutoPanIfNeeded() {
    const active = pointer.current;

    if (
      active === null ||
      !latest.current.isZoomed ||
      frameId.current !== null
    ) {
      return;
    }

    if (autoPanDirectionAt(active.lastX) === 0) {
      return;
    }

    lastFrameTime.current = performance.now();
    frameId.current = requestAnimationFrame(autoPanStep);
  }

  function finish() {
    stopAutoPan();
    setIsDragging(false);
    pointer.current = null;
  }

  /**
   * 主ボタン・指・ペンでトラックを押したら、押したポインタを追い始め、押した位置を返す。
   * 拡大中に端で押したままにすると、`AUTO_PAN_HOLD_MS` の後から表示範囲を送る。
   * 続けて矢印キーで動かせるよう、`<input>` へフォーカスを移し、フォーカスの枠はキーボードで移したときだけ出す。
   *
   * 既定の動作を止めないと、マウスで押した後にフォーカスが `<body>` へ移る。
   */
  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointer.current = {
      id: event.pointerId,
      downX: event.clientX,
      lastX: event.clientX,
      downTime: performance.now(),
    };
    inputRef.current?.focus({ focusVisible: false });
    updateFromClientX(event.clientX);
    startAutoPanIfNeeded();
  }

  /** 押しているポインタが動いたら、動いた先の位置を返し、拡大中に端へ寄っていれば表示範囲の送りを始める。 */
  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const active = pointer.current;

    if (active === null || event.pointerId !== active.id) {
      return;
    }

    active.lastX = event.clientX;

    if (Math.abs(event.clientX - active.downX) > DRAG_SLOP_PX) {
      setIsDragging(true);
    }

    updateFromClientX(event.clientX);
    startAutoPanIfNeeded();
  }

  /** 押しているポインタが離れたら、離れた位置を返して、ポインタを追うのをやめる。 */
  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerId !== pointer.current?.id) {
      return;
    }

    updateFromClientX(event.clientX);
    finish();
  }

  /** ブラウザがポインタの追跡を打ち切ったら、位置を変えずにポインタを追うのをやめる。 */
  function onPointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerId === pointer.current?.id) {
      finish();
    }
  }

  return {
    isDragging,
    trackHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
  };
}
