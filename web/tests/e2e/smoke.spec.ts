/**
 * 相手は `next build` が吐いた `out/` の実物なので、`pnpm build` の後でしか回せない。
 * 見るのは同一オリジンへの 4xx / 5xx・実行時エラー・地図の canvas の寸法の三点だけで、地図の絵が正しいかは見ない（docs/adr/0014-e2e-offline-smoke.md）。
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { observe, violationsOf } from "@scripts/smoke";

const EXPORT_ROOT = fileURLToPath(new URL("../../out", import.meta.url));

test("配信物が自足している", async () => {
  expect(
    existsSync(path.join(EXPORT_ROOT, "index.html")),
    `${EXPORT_ROOT} に静的成果物が無い。先に pnpm build を回す。`,
  ).toBe(true);

  expect(violationsOf(await observe(EXPORT_ROOT))).toEqual([]);
});
