/**
 * スライダーが指す時代に、各シリーズがどれだけ当てはまるかを扱う。
 * スライダーの位置の周りに年の範囲（現在窓）を取り、シリーズの `timeRange` と比べて 0..1 の値にする。
 *
 * 現在窓の取り方、窓とシリーズの重なり、重なりから表示の濃さへの変換はこのモジュールに置く。
 * 現在窓でシリーズを絞る処理や並べる処理も、窓とシリーズの比較なのでこのモジュールに置く。
 * 窓もシリーズの `timeRange` も、両端の年を含む範囲として比べる。
 *
 * 位置と年の対応は `scale.ts` に置き、描画（React・MapLibre）はどちらのモジュールにも置かない。
 * 窓の幅・重なり率の分母・重なり率から濃さへの変換を変えるときは、採らなかった案とその理由を `docs/adr/0038-era-space-window.md` で先に確かめる。
 */

import { type EraSpacePosition, positionToYear } from "@/lib/era/scale";
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

/** 現在窓の両端を、era 空間の位置（0..1）で表したもの。 */
export type CurrentWindowPositions = {
  start: number;
  end: number;
};

/**
 * `position` の周りに取る現在窓の両端を、era 空間の位置（0..1）で返す。
 *
 * 幅は era 空間で `WINDOW_WIDTH_IN_ERAS` 区間ぶんである。
 * `position` が 0 や 1 に近いと窓の端が era 空間の外へ出るので、その端は 0 と 1 へ丸める。
 */
export function currentWindowPositions({
  position,
  eras,
}: Pick<EraSpacePosition, "position" | "eras">): CurrentWindowPositions {
  const eraWidthInPosition = 1 / eras.length;
  const windowWidthInPosition = WINDOW_WIDTH_IN_ERAS * eraWidthInPosition;
  const halfWindowWidth = windowWidthInPosition / 2;

  return {
    start: Math.max(position - halfWindowWidth, 0),
    end: Math.min(position + halfWindowWidth, 1),
  };
}

/**
 * `position` の周りに取る現在窓の、両端の年を返す。
 *
 * `currentWindowPositions` が返す両端を、`positionToYear` で年へ変換する。
 * `position` が 0 や 1 に近いと窓の端が 0 と 1 へ丸められるぶん、窓が狭くなる。
 */
export function currentWindow({
  position,
  eras,
  presentEnd,
}: EraSpacePosition): CurrentWindow {
  const positions = currentWindowPositions({ position, eras });

  return {
    start: positionToYear({ position: positions.start, eras, presentEnd }),
    end: positionToYear({ position: positions.end, eras, presentEnd }),
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
