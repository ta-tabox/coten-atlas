/**
 * ブラウザを立てる検証の実行設定。
 *
 * project ごとに走らせる範囲と viewport を分ける。
 * スモークと E2E は深さが違うので、同じ条件で回すと片方の都合がもう片方へ漏れる。
 * スモーク（`tests/smoke/`）が見るのは配信物が自足しているかだけで、E2E（`tests/e2e/`）が見るのは画面の操作と配置である。
 * どちらも実物の `out/` を相手にする。
 *
 * 端末の条件（`DEVICES`）ごとに、スモークと E2E の project を一つずつ持ち、名前を `smoke-` と `e2e-` で始める。
 * `pnpm smoke` は `--project=smoke-*`、`pnpm e2e` は `--project=e2e-*` で名指すので、条件を足せば両方に入り、片方へ spec を足してももう片方の範囲は動かない。
 * 端末の条件ごとのブラウザと viewport はその project の `use` が持ち、spec は `page.viewportSize()` で受け取る。
 *
 * `testMatch` を `*.spec.ts` に絞るのは、既定が `*.test.ts` も拾うから。
 * 絞らないと Vitest の担当分まで Playwright が走らせる。
 * ファイル名の分担は `*.spec.ts` が Playwright、`*.test.ts` が Vitest。
 *
 * Playwright の webServer の設定は使わない。
 * 配信は `scripts/smoke.ts` が spec の中で立てる（BASE_PATH の下へ出す必要があり、ポートも OS に選ばせるため）。
 */

import { defineConfig, devices, type Project } from "@playwright/test";

/** 端末の条件の名前と、その条件で開くブラウザと viewport。 */
const DEVICES: Record<string, Project["use"]> = {
  // 一覧パネルが地図の左に開いたままの幅（`md` 以上）で、全画面の地図が入る大きさ。
  desktop: { viewport: { width: 1440, height: 900 } },
  // iPhone の Safari と同じエンジン（WebKit）で開く。
  iphone: { ...devices["iPhone 13"] },
  android: { ...devices["Pixel 7"] },
};

/** 検査の層の project 名の接頭辞と、その層の spec の置き場。 */
const LAYERS = { smoke: "./tests/smoke", e2e: "./tests/e2e" };

export default defineConfig({
  testMatch: "**/*.spec.ts",

  // 落ちたら落ちたままにする。
  // 再試行で緑になる層は、緑の意味が薄まる。
  retries: 0,

  // 判定の口は pnpm check の一本なので、失敗を握り潰すレポータを挟まない。
  reporter: [["list"]],

  // spec は canvas がその条件の viewport の寸法で立つことを判定に使う。
  projects: Object.entries(LAYERS).flatMap(([layer, testDir]) =>
    Object.entries(DEVICES).map(([device, use]) => ({
      name: `${layer}-${device}`,
      testDir,
      use,
    })),
  ),
});
