/**
 * 相手は `next build` が吐いた `out/` の実物なので、`pnpm build` の後でしか回せない。
 * 見るのは同一オリジンへの 4xx / 5xx・実行時エラー・地図の canvas の寸法の三点と、管理画面が混ざっていないことだけで、地図の絵が正しいかは見ない。
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  exportRoot,
  listAdminPaths,
  observe,
  viewportOf,
  violationsOf,
} from "@scripts/smoke";

const EXPORT_ROOT = exportRoot();

test("配信物が自足している", async ({ page }) => {
  expect(
    existsSync(path.join(EXPORT_ROOT, "index.html")),
    `${EXPORT_ROOT} に静的成果物が無い。先に pnpm build を回す。`,
  ).toBe(true);

  const observation = await observe(page, EXPORT_ROOT);

  expect(violationsOf(observation, viewportOf(page))).toEqual([]);
});

test("配信物に管理画面が混ざっていない", () => {
  expect(
    existsSync(path.join(EXPORT_ROOT, "index.html")),
    `${EXPORT_ROOT} に静的成果物が無い。先に pnpm build を回す。`,
  ).toBe(true);

  expect(listAdminPaths(EXPORT_ROOT)).toEqual([]);
});
