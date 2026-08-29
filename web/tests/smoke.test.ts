// @vitest-environment node
// 既定の jsdom では import.meta.url が file スキームにならず、フィクスチャの実体を辿れない。

/**
 * L4 スモーク（`scripts/smoke.ts`）を固定する。
 *
 * 見るのは三つ。
 * 観測から違反を出す `violationsOf`、配信するパスを決める `resolveWithinRoot`、そして配信物の欠けを実際に拾えるかを見る `observe` である。
 *
 * `observe` の二本だけは Chromium を立て、`tests/fixtures/` の小さな配信物を相手にする。
 * ここが緑でないと、`violationsOf` がどれだけ正しくても事故が観測へ乗らないまま素通りする。
 * 実物の `out/` を使う陽性テスト（worker を退避して赤になること）は `pnpm build` を先に要求するので、こちらでは代わりにフィクスチャで同じ形を作る。
 */

import { fileURLToPath } from "node:url";
import {
  observe,
  type PageObservation,
  resolveWithinRoot,
  violationsOf,
} from "@scripts/smoke.ts";
import { describe, expect, it } from "vitest";

function fixture(name: string): string {
  return fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));
}

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

describe("resolveWithinRoot", () => {
  const ROOT = "/srv/out";

  it("BASE_PATH の直下を root の下へ写す", () => {
    expect(resolveWithinRoot(ROOT, "/coten-atlas/index.html")).toBe(
      "/srv/out/index.html",
    );
  });

  it("BASE_PATH ちょうどは root 自身を指す", () => {
    expect(resolveWithinRoot(ROOT, "/coten-atlas")).toBe("/srv/out");
  });

  it("クエリを落とす", () => {
    expect(resolveWithinRoot(ROOT, "/coten-atlas/index.html?v=1")).toBe(
      "/srv/out/index.html",
    );
  });

  it("BASE_PATH の外は null", () => {
    expect(resolveWithinRoot(ROOT, "/other/index.html")).toBeNull();
  });

  it("BASE_PATH に前方一致するだけの別のパスは null", () => {
    expect(resolveWithinRoot(ROOT, "/coten-atlas-evil/index.html")).toBeNull();
  });

  it("root の外へ出る .. は null", () => {
    expect(
      resolveWithinRoot(ROOT, `/coten-atlas/${"../".repeat(20)}etc/hosts`),
    ).toBeNull();
  });

  it("percent encoding で隠した .. も null", () => {
    expect(
      resolveWithinRoot(ROOT, "/coten-atlas/%2e%2e/%2e%2e/etc/hosts"),
    ).toBeNull();
  });

  it("壊れた percent encoding は投げずに null", () => {
    expect(resolveWithinRoot(ROOT, "/coten-atlas/%")).toBeNull();
    expect(resolveWithinRoot(ROOT, "/coten-atlas/%zz")).toBeNull();
  });

  it("root の中へ戻る .. は通す", () => {
    expect(resolveWithinRoot(ROOT, "/coten-atlas/a/../index.html")).toBe(
      "/srv/out/index.html",
    );
  });
});

describe("observe", () => {
  it("配信物に欠けがあれば failedRequests に出る", async () => {
    const observation = await observe(fixture("export-missing-asset"));

    expect(observation.failedRequests).toEqual(["404 /coten-atlas/missing.js"]);
  });

  it("自足した配信物なら failedRequests は空", async () => {
    const observation = await observe(fixture("export-self-contained"));

    expect(observation.failedRequests).toEqual([]);
  });
});
