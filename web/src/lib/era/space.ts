/**
 * era 空間の位置（0..1）を西暦の年へ写す。
 *
 * 区間は年の幅が違うまま等幅に並ぶので、同じだけ動かしても進む年数が era ごとに変わる（docs/ARCHITECTURE.md §3）。
 * 区間は `start` を含み `end` を含まない半開区間で、境目の位置は後ろの era に属する。
 * 半開の扱いはこのモジュールの内側で閉じており、返る年から先は端の扱いが一つになる。
 *
 * 終わっていない末尾の era は右端の年を持たないので、呼ぶ側が `presentEnd` で渡す（docs/adr/0035-era-space-window.md）。
 * 時計を読むのは `presentEndOf` の 1 箇所だけで、写像そのものは同じ引数へ同じ年を返す。
 *
 * fs も React も MapLibre も持ち込まない。
 */

import { ERA_END_PRESENT, type Era, type EraList } from "@/lib/schema/era";

/** 両端とも年で持つ区間。 */
type EraYears = {
  start: number;
  end: number;
};

/**
 * `"present"` の右端に当たる年（docs/adr/0035-era-space-window.md）。
 * 写像の側が時計を読むと同じ位置が別の年を指しうるので、時刻は引数で受ける。
 */
export function presentEndOf(now: Date): number {
  return now.getFullYear();
}

/**
 * era 1 件の区間を、両端とも年で持つ形へ均す。
 *
 * 年で書かれた区間に幅があることは `eraListSchema` が見るが、`presentEnd` はどの検査も通っていない値である。
 * 幅が無いまま補間すると、末尾の era のどの位置も同じ年を指す。
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
 * era 空間の位置（0..1）から西暦の年へ。
 *
 * 区間を等幅に並べ、区間の中は線形補間する。
 * 年はモデルの全部が整数で持つので、補間の結果も整数へ丸める。
 * 0..1 の外を指したら両端へ寄せる。
 */
export function positionToYear(
  position: number,
  eras: EraList,
  presentEnd: number,
): number {
  const clamped = Math.min(Math.max(position, 0), 1);

  // 位置 1 は最後の区間の右端で、そこだけ index が列の外へ出る。
  const index = Math.min(Math.floor(clamped * eras.length), eras.length - 1);
  const withinEra = clamped * eras.length - index;
  const { start, end } = yearsOf(eras[index], presentEnd);

  return Math.round(start + (end - start) * withinEra);
}
