/**
 * `positionToYear` が返す年を検証する。
 *
 * 期待値は `docs/ARCHITECTURE.md` §3 が挙げている実例をそのまま使う。
 * 区間を等幅に並べて中を線形補間するので、区間内の同じ割合を指しても進む年数は区間ごとに違う。
 */

import { describe, expect, it } from "vitest";
import { positionToYear, presentEndOf } from "@/lib/era/space";
import { ERA_END_PRESENT, parseEras } from "@/lib/schema/era";

/** `docs/ARCHITECTURE.md` §3 が挙げている 7 区分。 */
const ERAS = parseEras([
  { id: "prehistory", label: "先史", start: -10000, end: -800 },
  { id: "ancient", label: "古代", start: -800, end: 550 },
  { id: "medieval", label: "中世", start: 550, end: 1450 },
  { id: "earlymodern", label: "近世", start: 1450, end: 1800 },
  { id: "modern19", label: "19世紀", start: 1800, end: 1900 },
  { id: "modern20a", label: "〜WWII", start: 1900, end: 1945 },
  { id: "modern20b", label: "戦後", start: 1945, end: ERA_END_PRESENT },
]);

/** `modern20b`（戦後）の右端に置く年。 */
const PRESENT_END = 2026;

/** `ERAS` の `index` 番目の区間を `within` の割合だけ進んだ、era 空間の位置を返す。 */
function positionIn(index: number, within: number): number {
  return (index + within) / ERAS.length;
}

/** `position` が指す年を、`ERAS` と `PRESENT_END` で求めて返す。 */
function yearAt(position: number): number {
  return positionToYear({ position, eras: ERAS, presentEnd: PRESENT_END });
}

describe("positionToYear", () => {
  it("区間の 4 割の位置は、19 世紀なら 1840 年を指す", () => {
    expect(yearAt(positionIn(4, 0.4))).toBe(1840);
  });

  it("同じ 4 割でも、先史なら -6320 年を指す", () => {
    expect(yearAt(positionIn(0, 0.4))).toBe(-6320);
  });

  it("両端は era 空間の最初の年と最後の年を指す", () => {
    expect(yearAt(0)).toBe(-10000);
    expect(yearAt(1)).toBe(PRESENT_END);
  });

  it("0..1 の外を渡したら era 空間の最初の年と最後の年を返す", () => {
    expect(yearAt(-0.5)).toBe(-10000);
    expect(yearAt(1.5)).toBe(PRESENT_END);
  });

  it("境目の年は後ろの era に属する", () => {
    // 中世（550〜1450）と近世（1450〜1800）の境目。
    expect(yearAt(positionIn(3, 0))).toBe(1450);

    // 境目の手前は中世の 900 年幅、後ろは近世の 350 年幅で刻む。
    expect(yearAt(positionIn(2, 0.9))).toBe(1360);
    expect(yearAt(positionIn(3, 0.1))).toBe(1485);
  });

  it("終わっていない era は presentEnd を右端にして補間する", () => {
    expect(yearAt(positionIn(6, 0))).toBe(1945);
    expect(yearAt(positionIn(6, 0.5))).toBe(1986);
  });

  it("presentEnd が末尾の era の始まりより後ろに無ければ throw する", () => {
    expect(() =>
      positionToYear({ position: 1, eras: ERAS, presentEnd: 1900 }),
    ).toThrow(/modern20b/);
  });
});

describe("presentEndOf", () => {
  it("渡した時刻の年を返す", () => {
    expect(presentEndOf(new Date(2026, 5, 15))).toBe(2026);
  });
});
