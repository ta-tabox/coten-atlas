/**
 * 静的成果物が自足しているかを見る検査器（L4）。
 *
 * `next build` が吐いた `out/` を BASE_PATH 込みで配信し、ヘッドレスの Chromium で開いて、同一オリジンへの 4xx / 5xx・実行時エラー・地図の canvas の寸法の三点だけを見る。
 * L2 は jsdom に WebGL が無いので地図を描けず、L3 はビルドの成否しか見ないので、「ビルドは通るがアセットへ到達できない」形はここでしか捕まらない（docs/adr/0014-e2e-offline-smoke.md）。
 *
 * **地図の絵が正しいかは見ない**。
 * それは人間の目視（L5）が持つ。
 * 外部（タイル・グリフ・スプライト）へは出さず、スタイルだけを合成のもので返す。
 * 実タイルを引くと、テストが外部の可用性で赤くなる（HARNESS.md「6. 意図的にやらないこと」）。
 *
 * 判定に canvas の寸法を入れているのは、CSS で高さが 0 になる失敗に効かせるため。
 * worker が 404 になる形は寸法では捕まらない（壊れていても viewport 大で立つ）ので、そちらは 4xx が見る。
 *
 * 入口は violationsOf（観測から違反を出す純関数）と main（CLI）。
 * CLI は node scripts/smoke.ts [outDir]。
 */

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { BASE_PATH } from "../src/lib/base-path.ts";

/**
 * 描画領域の大きさ。
 * canvas の寸法と突き合わせる。
 */
type Viewport = {
  width: number;
  height: number;
};

/**
 * ページを開いて観測できた事実。
 * 判定はここに入っているものだけを見る。
 */
export type PageObservation = {
  /** 同一オリジンへのリクエストのうち 4xx / 5xx になったもの。 */
  failedRequests: string[];
  /** console.error として出た実行時エラー。 */
  consoleErrors: string[];
  /**
   * 地図の canvas の描画バッファの寸法。
   * canvas 自体が無ければ null。
   */
  canvasSize: Viewport | null;
};

const VIEWPORT: Viewport = { width: 1280, height: 800 };

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain",
};

/**
 * タイルサーバの代わりに返すスタイル。
 * ソースを持たないので外部への二次リクエストが発生しない。
 * maplibre はソースが無くても worker を要求するため、worker の 404 はこれでも残る。
 */
const FIXTURE_STYLE = {
  version: 8,
  name: "smoke-fixture",
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#8aa" },
    },
  ],
};

const TILE_SERVER_PATTERN = "**://tiles.openfreemap.org/**";

/**
 * 観測から違反の一覧を出す。
 * 空なら緑。
 */
export function violationsOf(
  observation: PageObservation,
  viewport: Viewport = VIEWPORT,
): string[] {
  const violations: string[] = [];

  if (observation.failedRequests.length > 0) {
    violations.push(
      `配信物へ到達できていない: ${observation.failedRequests.join(", ")}`,
    );
  }

  if (observation.consoleErrors.length > 0) {
    violations.push(`実行時エラー: ${observation.consoleErrors.join(" / ")}`);
  }

  if (observation.canvasSize === null) {
    violations.push("地図の canvas が立たなかった");

    return violations;
  }

  const { width, height } = observation.canvasSize;

  if (width < viewport.width || height < viewport.height) {
    violations.push(
      `canvas が viewport 大でない: ${width}x${height}（期待は ${viewport.width}x${viewport.height} 以上）`,
    );
  }

  return violations;
}

/**
 * `out/` を BASE_PATH の下へ配信する。
 * ポートは OS に選ばせる。
 */
function serveExport(root: string): Promise<http.Server> {
  const server = http.createServer((request, response) => {
    const url = decodeURIComponent((request.url ?? "/").split("?")[0]);

    if (!url.startsWith(BASE_PATH)) {
      response.writeHead(404).end("outside basePath");

      return;
    }

    let file = path.join(root, url.slice(BASE_PATH.length) || "/");

    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      file = path.join(file, "index.html");
    }

    if (!fs.existsSync(file)) {
      response.writeHead(404).end("not found");

      return;
    }

    response.writeHead(200, {
      "content-type":
        CONTENT_TYPES[path.extname(file)] ?? "application/octet-stream",
    });
    fs.createReadStream(file).pipe(response);
  });

  return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

function portOf(server: http.Server): number {
  const address = server.address();

  if (address === null || typeof address === "string") {
    throw new Error("配信サーバのポートを取れなかった");
  }

  return address.port;
}

/**
 * ページを開いて観測を集める。
 * 判定はしない。
 */
async function observe(root: string): Promise<PageObservation> {
  const server = await serveExport(root);
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({ viewport: VIEWPORT });

    await page.route(TILE_SERVER_PATTERN, (route) =>
      route.request().url().includes("/styles/")
        ? route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(FIXTURE_STYLE),
          })
        : route.abort(),
    );

    const failedRequests: string[] = [];
    const consoleErrors: string[] = [];

    page.on("response", (response) => {
      if (response.status() >= 400) {
        failedRequests.push(
          `${response.status()} ${new URL(response.url()).pathname}`,
        );
      }
    });
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await page.goto(`http://localhost:${portOf(server)}${BASE_PATH}/`, {
      waitUntil: "networkidle",
    });

    const canvasSize = await page.evaluate(() => {
      const canvas = document.querySelector("canvas.maplibregl-canvas");

      return canvas instanceof HTMLCanvasElement
        ? { width: canvas.width, height: canvas.height }
        : null;
    });

    return { failedRequests, consoleErrors, canvasSize };
  } finally {
    await browser.close();
    server.close();
  }
}

async function main(argv: string[]): Promise<number> {
  const root = argv[0] ?? fileURLToPath(new URL("../out", import.meta.url));

  if (!fs.existsSync(path.join(root, "index.html"))) {
    console.error(`${root} に静的成果物が無い。先に pnpm build を回す。`);

    return 1;
  }

  const violations = violationsOf(await observe(root));

  for (const violation of violations) {
    console.error(`  - ${violation}`);
  }

  console.error(
    violations.length === 0
      ? "Smoke passed. 配信物は自足している。"
      : `Smoke failed. ${violations.length} violations.`,
  );

  return violations.length === 0 ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(await main(process.argv.slice(2)));
}
