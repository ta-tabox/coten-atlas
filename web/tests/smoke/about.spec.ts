/**
 * 相手は `next build` が吐いた `out/` の実物なので、`pnpm build` の後でしか回せない。
 * 見るのは `/about` が静的なページとして書き出されたかだけで、載っている文言は L2 の `src/app/about/page.test.tsx` が見る。
 *
 * 書き出し先は `about/index.html` ではなく `about.html`。
 * `trailingSlash` が既定（false）なので、export はページ 1 枚を拡張子付きのファイルで出し、`about/` の下には RSC のペイロードしか置かない。
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const EXPORT_ROOT = fileURLToPath(new URL("../../out", import.meta.url));

test("/about が static export に出る", () => {
  const page = path.join(EXPORT_ROOT, "about.html");

  expect(existsSync(page), `${page} が無い。先に pnpm build を回す。`).toBe(
    true,
  );
});
