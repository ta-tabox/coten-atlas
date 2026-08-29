/**
 * L4 スモークの実行設定。
 *
 * ブラウザを立てる検証はすべてここが回す（`tests/e2e/`）。
 * 純関数の単体テストは vitest 側に残るので、あちらの include からこのディレクトリを外してある。
 *
 * `webServer` は使わない。
 * 配信は spec の中で立てる（BASE_PATH の下へ出す必要があり、ポートも OS に選ばせるため）。
 * 詳細は `scripts/smoke.ts`。
 */

import { defineConfig } from "@playwright/test";
import { VIEWPORT } from "@scripts/smoke";

export default defineConfig({
  testDir: "./tests/e2e",

  // 落ちたら落ちたままにする。再試行で緑になる層は、緑の意味が薄まる。
  retries: 0,

  // 判定の口は pnpm check の一本なので、失敗を握り潰す報告器を挟まない。
  reporter: [["list"]],

  use: {
    viewport: VIEWPORT,
  },
});
