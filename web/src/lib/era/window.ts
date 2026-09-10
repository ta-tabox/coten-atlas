/**
 * 現在窓とシリーズの `timeRange` の重なりから、表示 opacity を求める。
 * 現在窓は、スライダーが指す位置の周りに取る年の範囲を指す。
 *
 * 窓の幅は年でなく era 空間の位置で決める。
 * 窓も `timeRange` も両端を含む閉区間で扱い、era の半開区間は `space.ts` の中で閉じている。
 * 幅の決め方と採らなかった案は `docs/adr/0038-era-space-window.md` にある。
 *
 * MapLibre の paint を組み立てない。
 * `circle-opacity` へ配線するのは `web/src/lib/map/series-layer.ts` で、このモジュールは 0..1 の数値を返すまでを担当する。
 */

import { positionToYear } from "@/lib/era/space";
import type { EraList } from "@/lib/schema/era";
import type { SeriesTimeRange } from "@/lib/schema/series";

/**
 * 現在窓の幅。
 * era 空間の 1 区間の幅を 1.0 とした割合で持つので、`eras` の区間を細かく割れば窓が跨る年数も細かくなる。
 */
export const WINDOW_WIDTH_IN_ERAS = 0.5;

/** 現在窓の年範囲（両端を含む）。 */
export type CurrentWindow = {
  start: number;
  end: number;
};

/**
 * `position` の周りに取る現在窓の、両端の年を返す。
 *
 * era 空間で `WINDOW_WIDTH_IN_ERAS` ぶんの幅を取り、両端を `positionToYear` で年へ変換する。
 * `position` が 0 や 1 に近いと窓の端が era 空間の外へ出て、`positionToYear` が 0 と 1 へ丸めるぶん窓が狭くなる。
 */
export function currentWindow(
  position: number,
  eras: EraList,
  presentEnd: number,
): CurrentWindow {
  const halfWidth = WINDOW_WIDTH_IN_ERAS / eras.length / 2;

  return {
    start: positionToYear(position - halfWidth, eras, presentEnd),
    end: positionToYear(position + halfWidth, eras, presentEnd),
  };
}

/**
 * `window` と `timeRange` が重なる年数の割合を、0..1 で返す。
 *
 * どちらも両端を含む閉区間なので、年数は `end - start + 1` で数える。
 * 分母は `window` と `timeRange` のうち年数が短い方なので、1 年のシリーズが `window` に収まれば 1 を、`window` を覆い尽くすシリーズも 1 を返す。
 * 重なる年が 1 年も無ければ 0 を返す。
 */
export function overlapRatio(
  window: CurrentWindow,
  timeRange: SeriesTimeRange,
): number {
  const start = Math.max(window.start, timeRange.start);
  const end = Math.min(window.end, timeRange.end);
  const overlapYears = end - start + 1;

  if (overlapYears <= 0) {
    return 0;
  }

  const shorterYears = Math.min(
    window.end - window.start + 1,
    timeRange.end - timeRange.start + 1,
  );

  return overlapYears / shorterYears;
}

/**
 * 重なり率 `ratio` を smoothstep（`r² (3 - 2r)`）へ通した opacity を、0..1 で返す。
 *
 * 0 と 1 で傾きが 0 になるので、シリーズが窓へ入る瞬間と窓から出る瞬間に濃さが跳ねない。
 * `ratio` が 0..1 の外なら 0 と 1 へ丸める。
 */
export function fadeOpacity(ratio: number): number {
  const clamped = Math.min(Math.max(ratio, 0), 1);

  return clamped * clamped * (3 - 2 * clamped);
}
