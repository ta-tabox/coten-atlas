/**
 * スライダーの位置の周りに現在窓を取り、シリーズの `timeRange` との重なりを表示 opacity へ落とす。
 *
 * 窓の幅は年でなく era 空間の側で固定する（docs/adr/0035-era-space-window.md）。
 * 年で固定すると、先史（9200 年幅）と 19 世紀（100 年幅）で見え方が桁違いになる。
 *
 * 窓は `timeRange` と同じ両端を含む閉区間で持つ。
 * era の半開区間は `space.ts` の内側で閉じているので、ここから先に端の扱いは 1 つしか無い。
 *
 * 描画は持たない。
 * paint への配線は era スライダーを置く側が持つ（docs/adr/0022-map-dom-boundary.md）。
 */

import { positionToYear } from "@/lib/era/space";
import type { EraList } from "@/lib/schema/era";
import type { SeriesTimeRange } from "@/lib/schema/series";

/**
 * 現在窓の幅を、era 空間の 1 区間の幅に対する割合で持つ。
 * era の刻みを細かくすれば窓も一緒に細かくなる（docs/adr/0035-era-space-window.md）。
 */
export const WINDOW_WIDTH_IN_ERAS = 0.5;

/** 現在窓の年範囲（両端を含む）。 */
export type CurrentWindow = {
  start: number;
  end: number;
};

/**
 * 位置の周りに取る現在窓。
 *
 * era 空間で幅を取ってから両端を年へ写すので、窓が跨る年数は era ごとに変わる。
 * era 空間の外に年は無いので、端では外へ出た側が落ちて窓が狭くなる。
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
 * 現在窓と `timeRange` の重なり率（0..1）。
 *
 * どちらも両端を含む閉区間なので、年数は差でなく `end - start + 1` で数える。
 * 差で数えると 1 年のシリーズの幅が 0 になり、重なっていても 0 を返す。
 *
 * 分母は短い方に取る。
 * 窓を分母に固定すると 1 年のシリーズが窓の幅の逆数までしか上がらず、`timeRange` に固定すると era を丸ごと覆うシリーズが薄いまま残る。
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
 * 重なり率から表示 opacity へ。
 *
 * 両端で傾きが 0 になる smoothstep を通し、窓へ入る瞬間と出る瞬間の段差を消す。
 * 重なり率をそのまま使うと、窓の縁でシリーズが現れたり消えたりする。
 */
export function fadeOpacity(ratio: number): number {
  const clamped = Math.min(Math.max(ratio, 0), 1);

  return clamped * clamped * (3 - 2 * clamped);
}
