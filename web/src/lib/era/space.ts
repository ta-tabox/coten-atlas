/**
 * era 空間の位置（0..1）を西暦の年へ変換する。
 * era 空間は、`eras` の各区間を等幅に並べた 0..1 の数直線を指す。
 *
 * 区間ごとに年の幅が違うので、位置を同じだけ動かしても進む年数は区間ごとに変わる（`docs/ARCHITECTURE.md` §3）。
 * 各区間は `start` を含み `end` を含まない半開区間で、境目の位置は後ろの区間に属する。
 *
 * `end` が `ERA_END_PRESENT` の era は右端の年を持たないので、呼び出し元が `presentEnd` で渡す。
 * 決定と採らなかった案は `docs/adr/0035-era-space-window.md` にある。
 *
 * `node:fs`・React・MapLibre を import しない。
 */

import { ERA_END_PRESENT, type Era, type EraList } from "@/lib/schema/era";

/** 両端とも年で持つ区間。 */
type EraYears = {
  start: number;
  end: number;
};

/**
 * `now` の西暦年を返す。
 *
 * `end` が `ERA_END_PRESENT` の era の右端に当たる年で、`positionToYear` と `currentWindow` へ渡す。
 * 時刻を引数で受け取るのは、同じ引数へ常に同じ年を返すため。
 */
export function presentEndOf(now: Date): number {
  return now.getFullYear();
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
export function positionToYear(
  position: number,
  eras: EraList,
  presentEnd: number,
): number {
  const clamped = Math.min(Math.max(position, 0), 1);

  // `clamped` が 1 のとき添字が `eras.length` になるので、最後の要素へ丸める。
  const index = Math.min(Math.floor(clamped * eras.length), eras.length - 1);
  const withinEra = clamped * eras.length - index;
  const { start, end } = yearsOf(eras[index], presentEnd);

  return Math.round(start + (end - start) * withinEra);
}
