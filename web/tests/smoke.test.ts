/**
 * 見るのは `scripts/smoke.ts` のうちブラウザを立てずに済む関数で、ここ（L2）で回す。
 * 観測から違反を出す `violationsOf`、配信してよいパスを決める `resolveWithinRoot`、管理画面の混入を探す `listAdminPaths` である。
 *
 * ブラウザが要る側は `tests/smoke/` の spec が持つ。
 * 観測層が事故を拾えるかは `observation.spec.ts` の陽性対照が見る。
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  listAdminPaths,
  type PageObservation,
  resolveWithinRoot,
  violationsOf,
} from "@scripts/smoke.ts";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

/** smoke の project が使う viewport（playwright.config.ts）。 */
const VIEWPORT = { width: 1280, height: 800 };

const HEALTHY: PageObservation = {
  failedRequests: [],
  consoleErrors: [],
  canvasSize: { width: 1280, height: 800 },
};

describe("violationsOf", () => {
  it("四点そろっていれば違反を出さない", () => {
    expect(violationsOf(HEALTHY, VIEWPORT)).toEqual([]);
  });

  it("同一オリジンへの 4xx を違反にする", () => {
    const observation = {
      ...HEALTHY,
      failedRequests: ["404 /coten-atlas/maplibre-gl-worker.mjs"],
    };

    expect(violationsOf(observation, VIEWPORT)).toHaveLength(1);
    expect(violationsOf(observation, VIEWPORT)[0]).toContain(
      "maplibre-gl-worker.mjs",
    );
  });

  it("実行時エラーを違反にする", () => {
    const observation = { ...HEALTHY, consoleErrors: ["Uncaught TypeError"] };

    expect(violationsOf(observation, VIEWPORT)).toEqual([
      "実行時エラー: Uncaught TypeError",
    ]);
  });

  it("canvas が立たなければ違反にする", () => {
    expect(violationsOf({ ...HEALTHY, canvasSize: null }, VIEWPORT)).toEqual([
      "地図の canvas が立たなかった",
    ]);
  });

  it("canvas の高さが 0 なら違反にする", () => {
    const observation = { ...HEALTHY, canvasSize: { width: 1280, height: 0 } };

    expect(violationsOf(observation, VIEWPORT)).toHaveLength(1);
    expect(violationsOf(observation, VIEWPORT)[0]).toContain(
      "viewport 大でない",
    );
  });

  it("canvas が viewport より大きいのは違反にしない", () => {
    const retina = { ...HEALTHY, canvasSize: { width: 2560, height: 1600 } };

    expect(violationsOf(retina, VIEWPORT)).toEqual([]);
  });

  it("canvas が立たなかったときは寸法の違反を重ねない", () => {
    const observation = { ...HEALTHY, canvasSize: null };

    expect(violationsOf(observation, VIEWPORT)).toHaveLength(1);
  });

  it("違反が複数あればすべて出す", () => {
    const observation: PageObservation = {
      failedRequests: ["404 /coten-atlas/maplibre-gl-worker.mjs"],
      consoleErrors: ["Uncaught TypeError"],
      canvasSize: null,
    };

    expect(violationsOf(observation, VIEWPORT)).toHaveLength(3);
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

describe("listAdminPaths", () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "coten-atlas-out-"));
    fs.writeFileSync(path.join(root, "index.html"), "");
    fs.mkdirSync(path.join(root, "about"));
    fs.writeFileSync(path.join(root, "about", "index.html"), "");
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true });
  });

  it("名前に admin を含むものが無ければ空配列を返す", () => {
    expect(listAdminPaths(root)).toEqual([]);
  });

  it("名前に admin を含むディレクトリとファイルを、root からの相対パスで返す", () => {
    fs.mkdirSync(path.join(root, "admin"));
    fs.writeFileSync(path.join(root, "admin", "index.html"), "");
    fs.writeFileSync(path.join(root, "admin.txt"), "");

    expect(listAdminPaths(root)).toEqual(["admin", "admin.txt"]);
  });
});
