/**
 * 静的成果物が自足しているかを見る検査（L4）。
 *
 * `next build` が吐いた `out/` を BASE_PATH 込みで配信し、ヘッドレスの Chromium で開いて、同一オリジンへの 4xx / 5xx・実行時エラー・地図の canvas の寸法の三点だけを見る。
 * L2 は jsdom に WebGL が無いので地図を描けず、L3 はビルドの成否しか見ないので、「ビルドは通るがアセットへ到達できない」形はここでしか捕まらない（docs/adr/0014-e2e-offline-smoke.md）。
 *
 * **地図の絵が正しいかは見ない**。
 * それは人間の目視が持つ。
 * 外部（タイル・グリフ・スプライト）へは出さず、スタイルだけを合成のもので返す。
 * 実タイルを引くと、テストが外部の可用性で赤くなる（docs/HARNESS.md「6. 意図的にやらないこと」）。
 *
 * 判定に canvas の寸法を入れているのは、CSS で高さが 0 になる失敗に効かせるため。
 * worker が 404 になる形は寸法では捕まらない（壊れていても viewport 大で立つ）ので、そちらは 4xx が見る。
 *
 * ここが持つのは機構だけで、判定を回すのは `tests/smoke/` の spec である。
 * ブラウザの寿命も viewport も Playwright の project が持つので、この層は渡された page を使うだけにする。
 * 入口は observe（配信物を開いて観測を集める）と violationsOf（観測から違反を出す純関数）。
 */

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";
import { BASE_PATH } from "@/lib/base-path";

/**
 * `next build` が吐いた静的成果物の置き場。
 * 配信するディレクトリを知っているのはこの層なので、spec ごとに書き直さない。
 *
 * 定数でなく関数なのは、L2 の `tests/smoke.test.ts` がこのモジュールを jsdom で読むため。
 * jsdom の `import.meta.url` は file スキームにならないので、読み込み時に解決すると、純関数を見るだけのテストがそこで落ちる。
 */
export function exportRoot(): string {
  return fileURLToPath(new URL("../out", import.meta.url));
}

/**
 * 描画領域の大きさ。
 * canvas の寸法と突き合わせる。
 */
export type Viewport = {
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

/**
 * ブラウザから外へ出るリクエストのうち、横取りする相手を選ぶ glob（Playwright の書式で `**` は任意の階層に当たる）。
 * ここに当たったものはネットワークへ出ない。
 */
const TILE_SERVER_PATTERN = "**://tiles.openfreemap.org/**";

/**
 * page が実際に使っている viewport を出す。
 * 設定されていなければ投げる。
 *
 * 判定は canvas がこの寸法で立ったかを見るので、既定値で埋めると寸法の検査が黙って無効になる。
 */
export function viewportOf(page: Page): Viewport {
  const viewport = page.viewportSize();

  if (viewport === null) {
    throw new Error("project の use.viewport が設定されていない");
  }

  return viewport;
}

/**
 * 観測から違反の一覧を出す。
 * 空なら緑。
 */
export function violationsOf(
  observation: PageObservation,
  viewport: Viewport,
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
 * URL のパス部を復号する。
 * 復号できない文字列は投げずに null を返す。
 *
 * `decodeURIComponent` は `%` 単体のような壊れた percent encoding で URIError を投げる。
 * リクエストハンドラの中で投げるとスモークが応答を返さないままプロセスごと落ち、`pnpm check` が緑でも赤でもない形で終わる。
 */
function decodePathname(pathname: string): string | null {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return null;
  }
}

/**
 * 配信してよいファイルの絶対パスを出す。
 * 配信してはいけないものは null。
 *
 * **この関数の役目はパストラバーサルを止めること**。
 * `path.join` も `path.resolve` も `..` を正規化するだけで root の外へ出ることは防がないので、素通しにすると `/coten-atlas/../../../etc/hosts` が root の外のファイルを配信する。
 *
 * 引数は別々の空間を指す。
 * `url` は配信側のパスで `BASE_PATH` を接頭辞に持ち、`root` はファイル側のディレクトリ（`out/` の実体）である。
 * ここがその二つを繋ぐ唯一の場所なので、境界の判定も全部ここへ置く。
 */
export function resolveWithinRoot(root: string, url: string): string | null {
  const decoded = decodePathname(url.split("?")[0]);

  if (decoded === null) {
    return null;
  }

  // BASE_PATH ちょうどか、その下（`/` 区切り）だけを受ける。
  // startsWith(BASE_PATH) だけで見ると、`/coten-atlas-evil/...` という別の名前空間まで自分のものとして扱う。
  if (decoded !== BASE_PATH && !decoded.startsWith(`${BASE_PATH}/`)) {
    return null;
  }

  const rootDir = path.resolve(root);
  const relative = decoded.slice(BASE_PATH.length) || "/";

  // 先頭へ `.` を足して相対パスに落とす。
  // `/etc/passwd` のような絶対パスをそのまま渡すと、path.resolve は rootDir を捨ててそちらを返す。
  const resolved = path.resolve(rootDir, `.${relative}`);

  // 区切り文字まで含めて前方一致を見る。
  // rootDir だけで見ると `/srv/out-evil` が `/srv/out` の配下として通る。
  // 区切りを path.sep で書くのは、path.resolve が返すのが実行環境の区切り文字だから。
  if (resolved !== rootDir && !resolved.startsWith(rootDir + path.sep)) {
    return null;
  }

  return resolved;
}

/**
 * `out/` を BASE_PATH の下へ配信するサーバを立て、待ち受けが始まるまで待つ。
 *
 * 返す Promise が解決するのは listen が始まった時点で、リクエストが来たときではない。
 * サーバは閉じるまで動き続け、ページが要求する HTML・JS・CSS・worker を何度でも返す。
 * 閉じるのは observe の finally。
 *
 * ポートは 0 を渡して OS に選ばせる。
 * 固定すると、その番号が塞がっている環境でスモークが立たない。
 *
 * **待ち受けはループバックだけに閉じる**。
 * host を渡さないと全インターフェースへ bind し、同じネットワークに繋がっている別のホストからこのサーバを叩けてしまう。
 */
function serveExport(root: string): Promise<http.Server> {
  const server = http.createServer((request, response) => {
    let file = resolveWithinRoot(root, request.url ?? "/");

    if (file === null) {
      response.writeHead(404).end("outside export root");

      return;
    }

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

  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve(server)),
  );
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
 *
 * `pagePath` は BASE_PATH の下のパス。
 * この層のサーバはディレクトリにしか index.html を補わないので、トップ以外は拡張子まで書く。
 */
export async function observe(
  page: Page,
  root: string,
  pagePath = "/",
): Promise<PageObservation> {
  const server = await serveExport(root);

  try {
    // 外部への通信はここで止まる。
    // スタイルだけフィクスチャで応答し、タイル・グリフ・スプライトは中断する。
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

    await page.goto(
      `http://localhost:${portOf(server)}${BASE_PATH}${pagePath}`,
      {
        waitUntil: "networkidle",
      },
    );

    const canvasSize = await page.evaluate(() => {
      const canvas = document.querySelector("canvas.maplibregl-canvas");

      return canvas instanceof HTMLCanvasElement
        ? { width: canvas.width, height: canvas.height }
        : null;
    });

    return { failedRequests, consoleErrors, canvasSize };
  } finally {
    server.close();
  }
}
