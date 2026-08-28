/**
 * L4 スモークの判定を固定する。
 *
 * ブラウザを立てる側は観測を集めるだけなので、ここで見るのは観測から違反を出す純関数のほう。
 * 実際に事故を捕まえるかは陽性テスト（worker を退避して赤になること）が見る。
 */

import { type PageObservation, violationsOf } from "@scripts/smoke.ts";
import { describe, expect, it } from "vitest";

const HEALTHY: PageObservation = {
  failedRequests: [],
  consoleErrors: [],
  canvasSize: { width: 1280, height: 800 },
};

describe("violationsOf", () => {
  it("四点そろっていれば違反を出さない", () => {
    expect(violationsOf(HEALTHY)).toEqual([]);
  });

  it("同一オリジンへの 4xx を違反にする", () => {
    const observation = {
      ...HEALTHY,
      failedRequests: ["404 /coten-atlas/maplibre-gl-worker.mjs"],
    };

    expect(violationsOf(observation)).toHaveLength(1);
    expect(violationsOf(observation)[0]).toContain("maplibre-gl-worker.mjs");
  });

  it("実行時エラーを違反にする", () => {
    const observation = { ...HEALTHY, consoleErrors: ["Uncaught TypeError"] };

    expect(violationsOf(observation)).toEqual([
      "実行時エラー: Uncaught TypeError",
    ]);
  });

  it("canvas が立たなければ違反にする", () => {
    expect(violationsOf({ ...HEALTHY, canvasSize: null })).toEqual([
      "地図の canvas が立たなかった",
    ]);
  });

  it("canvas の高さが 0 なら違反にする", () => {
    const observation = { ...HEALTHY, canvasSize: { width: 1280, height: 0 } };

    expect(violationsOf(observation)).toHaveLength(1);
    expect(violationsOf(observation)[0]).toContain("viewport 大でない");
  });

  it("canvas が viewport より大きいのは違反にしない", () => {
    const retina = { ...HEALTHY, canvasSize: { width: 2560, height: 1600 } };

    expect(violationsOf(retina)).toEqual([]);
  });

  it("canvas が立たなかったときは寸法の違反を重ねない", () => {
    const observation = { ...HEALTHY, canvasSize: null };

    expect(violationsOf(observation)).toHaveLength(1);
  });

  it("違反が複数あればすべて出す", () => {
    const observation: PageObservation = {
      failedRequests: ["404 /coten-atlas/maplibre-gl-worker.mjs"],
      consoleErrors: ["Uncaught TypeError"],
      canvasSize: null,
    };

    expect(violationsOf(observation)).toHaveLength(3);
  });
});
