/**
 * ブラウザを立てる検証の実行設定（[ADR-0016](docs/adr/0016-playwright-runner.md)）。
 *
 * **project ごとに走らせる範囲と viewport を分ける。**
 * スモークと E2E は深さが違うので、同じ条件で回すと片方の都合がもう片方へ漏れる。
 * スモークが見るのは配信物が自足しているかだけで、実物の `out/` を相手にする。
 *
 * 操作を伴う E2E を足すときは、`tests/e2e/` を作って project をもう一つ並べる。
 * `pnpm smoke` は `--project=smoke` で名指しているので、増やしてもスモークの範囲は動かない。
 * 端末ごとの検証（スマホ幅など）はその project の `use` が持ち、ここには持ち込まない。
 *
 * `testMatch` を `*.spec.ts` に絞るのは、既定が `*.test.ts` も拾うから。
 * 絞らないと Vitest の担当分まで Playwright が走らせる。
 * 綴りの分担は `.spec.ts` が Playwright、`.test.ts` が Vitest。
 *
 * `webServer` は使わない。
 * 配信は `scripts/smoke.ts` が spec の中で立てる（BASE_PATH の下へ出す必要があり、ポートも OS に選ばせるため）。
 */

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testMatch: "**/*.spec.ts",

  // 落ちたら落ちたままにする。再試行で緑になる層は、緑の意味が薄まる。
  retries: 0,

  // 判定の口は pnpm check の一本なので、失敗を握り潰す報告器を挟まない。
  reporter: [["list"]],

  projects: [
    {
      name: "smoke",
      testDir: "./tests/smoke",
      // 全画面の地図が入る大きさ。canvas がこの寸法で立つことを判定に使う。
      use: { viewport: { width: 1280, height: 800 } },
    },
  ],
});
