/**
 * ブラウザを立てる検証の実行設定。
 *
 * project ごとに走らせる範囲と viewport を分ける。
 * スモークと E2E は深さが違うので、同じ条件で回すと片方の都合がもう片方へ漏れる。
 * スモークが見るのは配信物が自足しているかだけで、実物の `out/` を相手にする。
 *
 * スモークは端末の条件ごとに project を一つ持ち、名前を `smoke-` で始める。
 * `pnpm smoke` は `--project=smoke-*` で名指すので、条件を足せばスモークに入り、操作を伴う E2E の project（`tests/e2e/`）を足してもスモークの範囲は動かない。
 * 端末の条件ごとのブラウザと viewport はその project の `use` が持ち、spec は `page.viewportSize()` で受け取る。
 *
 * `testMatch` を `*.spec.ts` に絞るのは、既定が `*.test.ts` も拾うから。
 * 絞らないと Vitest の担当分まで Playwright が走らせる。
 * ファイル名の分担は `*.spec.ts` が Playwright、`*.test.ts` が Vitest。
 *
 * Playwright の webServer の設定は使わない。
 * 配信は `scripts/smoke.ts` が spec の中で立てる（BASE_PATH の下へ出す必要があり、ポートも OS に選ばせるため）。
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testMatch: "**/*.spec.ts",

  // 落ちたら落ちたままにする。
  // 再試行で緑になる層は、緑の意味が薄まる。
  retries: 0,

  // 判定の口は pnpm check の一本なので、失敗を握り潰すレポータを挟まない。
  reporter: [["list"]],

  // spec は canvas がその条件の viewport の寸法で立つことを判定に使う。
  projects: [
    {
      name: "smoke-desktop",
      testDir: "./tests/smoke",
      // 全画面の地図が入る大きさ。
      use: { viewport: { width: 1280, height: 800 } },
    },
    {
      name: "smoke-iphone",
      testDir: "./tests/smoke",
      // iPhone の Safari と同じエンジン（WebKit）で開く。
      use: { ...devices["iPhone 13"] },
    },
    {
      name: "smoke-android",
      testDir: "./tests/smoke",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
