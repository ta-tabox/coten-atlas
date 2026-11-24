/**
 * 相手は `next build` が吐いた `out/` の実物なので、`pnpm build` の後でしか回せない。
 * 見るのは `/about` を開けること——同一オリジンへの 4xx / 5xx と実行時エラーが無いこと——だけで、載っている文言は単体テスト（`src/app/about/page.test.tsx`）が見る。
 *
 * 開く先は `about/`。
 * `next.config.ts` が trailingSlash を有効にして、export はページを `about/index.html` で出すので、この層の配信がディレクトリの `index.html` を返す規則だけで開ける。
 * 書き出されていなければ、その 404 が `failedRequests` に出る。
 *
 * canvas は見ないので `violationsOf` は通さない。
 * 地図を持たないページなので、寸法の判定が「立たなかった」を返す。
 */

import { expect, test } from "@playwright/test";
import { exportRoot, observe } from "@scripts/smoke";

test("/about が static export に出て、開ける", async ({ page }) => {
  const observation = await observe(page, exportRoot(), "/about/");

  expect(observation.failedRequests).toEqual([]);
  expect(observation.consoleErrors).toEqual([]);
});
