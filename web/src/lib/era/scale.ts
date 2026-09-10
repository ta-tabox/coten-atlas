/**
 * era スライダーの目盛りを扱う。
 * 目盛りは era の列（`EraList`）の各区間を年の幅によらず等幅に並べた 0..1 の数直線（era 空間）で、区間の中は年を線形に割り振る。
 *
 * era 空間の位置・西暦の年・era の三つのうち、どれかから別のどれかを求める処理はこのモジュールに置く。
 * 区間は `start` を含み `end` を含まないので、境目は後ろの era に属する。
 * 終わっていない era の右端の年（`presentEnd`）は目盛りの定義に含まれるので、このモジュールで扱う。
 *
 * シリーズと現在窓は `window.ts` に置き、描画（React・MapLibre）はどちらのモジュールにも置かない。
 */

import { ERA_END_PRESENT, type Era, type EraList } from "@/lib/schema/era";

/**
 * `positionToYear` と `currentWindow` が受け取る、era 空間の位置と変換に要る値の組。
 *
 * `position` は 0..1 の位置で、`presentEnd` は `end` が `ERA_END_PRESENT` の era の右端に置く年。
 */
export type EraSpacePosition = {
  position: number;
  eras: EraList;
  presentEnd: number;
};

/** 両端とも年で持つ区間。 */
type EraYears = {
  start: number;
  end: number;
};

/**
 * `presentDate` の西暦年を返す。
 *
 * `end` が `ERA_END_PRESENT` の era の右端に当たる年で、`positionToYear` と `currentWindow` へ渡す。
 * 日付を引数で受け取るのは、同じ引数へ常に同じ年を返すため。
 */
export function presentEndOf(presentDate: Date): number {
  return presentDate.getFullYear();
}

/**
 * `era` の区間を、両端とも年で持つ形にして返す。
 *
 * `era.end` が `ERA_END_PRESENT` なら `presentEnd` を右端に置き、`presentEnd` が `era.start` 以下なら throw する。
 * 年で書かれた区間の幅は `eraListSchema` が検証するが、`presentEnd` はどの検証も通っていない。
 */
function yearsOf(era: Era, presentEnd: number): EraYears {
  if (era.end !== ERA_END_PRESENT) {
    return { start: era.start, end: era.end };
  }

  if (presentEnd <= era.start) {
    throw new Error(
      `presentEnd=${presentEnd} が era ${era.id} の始まり（${era.start}）より後ろに無い`,
    );
  }

  return { start: era.start, end: presentEnd };
}

/**
 * `position`（0..1）が `eras` の上で指す西暦の年を、整数で返す。
 *
 * 区間を等幅に並べ、区間の中は線形補間する。
 * 年は `catalog/` のどの欄も整数なので、補間の結果も四捨五入する。
 * `position` が 0 未満なら `eras` の最初の年を、1 を超えるなら最後の年を返す。
 */
export function positionToYear({
  position,
  eras,
  presentEnd,
}: EraSpacePosition): number {
  const clamped = Math.min(Math.max(position, 0), 1);

  // `clamped` が 1 のとき添字が `eras.length` になるので、最後の要素へ丸める。
  const index = Math.min(Math.floor(clamped * eras.length), eras.length - 1);
  const withinEra = clamped * eras.length - index;
  const { start, end } = yearsOf(eras[index], presentEnd);

  return Math.round(start + (end - start) * withinEra);
}
