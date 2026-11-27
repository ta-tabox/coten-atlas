/**
 * era スライダーの目盛りの位置（era 空間）から西暦の年を求める純関数を置く。
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

type EraYears = {
  start: number;
  end: number;
};

/**
 * 矢印キー 1 回で動く幅を決める、era 1 つあたりの目盛りの数。
 * `<input type="range">` は整数の目盛りで値を持ち、矢印キー 1 回で 1 目盛り進む。
 */
export const STEPS_PER_ERA = 100;

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
 * `era` の区間を、終わっていない era の右端を `presentEnd` で埋めて、両端とも年で持つ形にして返す。
 *
 * `era.end` が `ERA_END_PRESENT` で、`presentEnd` が `era.start` 以下なら throw する。
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
 * `position`（0..1）が `eras` の上で指す era の添字を返す。
 * 境目は後ろの era に属し、`position` が 1 なら最後の era を返す。
 * `position` が 0..1 の外なら、最も近い端の era を返す。
 */
export function eraIndexAt(position: number, eras: EraList): number {
  const clamped = Math.min(Math.max(position, 0), 1);

  // `clamped` が 1 のとき添字が `eras.length` になるので、最後の要素へ丸める。
  return Math.min(Math.floor(clamped * eras.length), eras.length - 1);
}

/**
 * `position`（0..1）が `eras` の上で指す西暦の年を、整数で返す。
 * `position` が 0 未満なら `eras` の最初の年を、1 を超えるなら最後の年を返す。
 *
 * 区間を等幅に並べ、区間の中は線形補間する。
 * 年は `catalog/` のどの欄も整数なので、補間の結果も四捨五入する。
 */
export function positionToYear({
  position,
  eras,
  presentEnd,
}: EraSpacePosition): number {
  const clamped = Math.min(Math.max(position, 0), 1);
  const index = eraIndexAt(clamped, eras);
  const withinEra = clamped * eras.length - index;
  const { start, end } = yearsOf(eras[index], presentEnd);

  return Math.round(start + (end - start) * withinEra);
}

/**
 * 西暦の年（`year`）を、`eras` の上の era 空間の位置（0..1）にして返す。
 * `year` が最初の era より前なら 0 を、最後の era の右端以降なら 1 を返す。
 *
 * `positionToYear` の逆の写像で、区間の中は線形に割り振る。
 */
export function yearToPosition({
  year,
  eras,
  presentEnd,
}: Omit<EraSpacePosition, "position"> & { year: number }): number {
  const index = eras.findIndex((era) => year < yearsOf(era, presentEnd).end);

  if (index === -1) {
    return 1;
  }

  const { start, end } = yearsOf(eras[index], presentEnd);
  const withinEra = Math.max(year - start, 0) / (end - start);

  return (index + withinEra) / eras.length;
}
