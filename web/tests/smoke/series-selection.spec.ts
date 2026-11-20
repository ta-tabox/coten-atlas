/**
 * 公開画面でシリーズを選ぶ二つの操作（一覧パネルの行を押す・地図の円を押す）で、詳細カードが開くかを見る。
 * 相手は `next build` が吐いた `out/` の実物なので、`pnpm build` の後でしか回せない。
 *
 * 円の画面上の位置は、カメラ位置や地図の `padding` から計算せず、スクリーンショットの画素から探す。
 * 計算で求めると、初期のカメラ位置・`padding`・era スライダーの初期位置のどれかを変えた回に、押す位置が円から外れる。
 */

import type http from "node:http";
import { expect, type Page, test } from "@playwright/test";
import { exportRoot, openExport } from "@scripts/smoke";

/** CSS ピクセルで表した、ページの中の一点。 */
type Point = { x: number; y: number };

let server: http.Server | undefined;

test.beforeEach(async ({ page }, testInfo) => {
  // 操作の手順はデスクトップの幅の一覧パネルに合わせてあるので、デスクトップの条件でだけ回す。
  test.skip(
    testInfo.project.name !== "smoke-desktop",
    "スマホの幅の一覧パネルを押す手順はまだ無い",
  );

  server = await openExport(page, exportRoot());
});

test.afterEach(() => {
  server?.close();
  server = undefined;
});

/**
 * 地図の canvas の画素のうち、最も多い色（地図の背景）と最も離れた色の画素を、背景から遠い順に見て、canvas が最前面にある最初の位置を返す。
 * 背景と違う色の画素が無いか、どれも一覧パネルや詳細カードの下にあれば null を返す。
 *
 * スクリーンショットは地図の上に重なる要素を隠して撮るので、画素の色は canvas の色だけになる。
 * 押す前には隠さないので、重なる要素の下の円は `elementFromPoint` で候補から除く。
 */
async function findCirclePoint(page: Page): Promise<Point | null> {
  const screenshot = await page.screenshot({
    style:
      ".maplibregl-map > :not(.maplibregl-canvas-container) { visibility: hidden !important; }",
  });

  return page.evaluate(async (base64) => {
    const response = await fetch(`data:image/png;base64,${base64}`);
    const bitmap = await createImageBitmap(await response.blob());
    const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext(
      "2d",
    );

    if (context === null) {
      throw new Error("スクリーンショットを読む 2d の context を作れなかった");
    }

    context.drawImage(bitmap, 0, 0);

    const { data, width } = context.getImageData(
      0,
      0,
      bitmap.width,
      bitmap.height,
    );
    // スクリーンショットは端末の画素比で撮られるので、CSS ピクセルへ戻す比を持つ。
    const scale = width / window.innerWidth;
    const pixels = Array.from({ length: data.length / 4 }, (_, pixel) => ({
      pixel,
      rgb: [data[pixel * 4], data[pixel * 4 + 1], data[pixel * 4 + 2]],
    }));

    const counts = new Map<string, number>();

    for (const { rgb } of pixels) {
      const key = rgb.join(",");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const background = [...counts]
      .reduce((most, entry) => (entry[1] > most[1] ? entry : most))[0]
      .split(",")
      .map(Number);

    const candidates = pixels
      .map(({ pixel, rgb }) => ({
        pixel,
        distance: rgb.reduce(
          (sum, channel, index) => sum + Math.abs(channel - background[index]),
          0,
        ),
      }))
      .filter((candidate) => candidate.distance > 0)
      .sort((a, b) => b.distance - a.distance);

    const mapCanvas = document.querySelector("canvas.maplibregl-canvas");

    for (const { pixel } of candidates) {
      const point = {
        x: (pixel % width) / scale,
        y: Math.floor(pixel / width) / scale,
      };

      if (document.elementFromPoint(point.x, point.y) === mapCanvas) {
        return point;
      }
    }

    return null;
  }, screenshot.toString("base64"));
}

test("一覧パネルでシリーズを押すと、そのシリーズの詳細カードが開き、行が選択中になる", async ({
  page,
}) => {
  const item = page
    .getByRole("region", { name: /^地図に出ているシリーズ/ })
    .getByRole("listitem")
    .first()
    .getByRole("button");

  await item.click();

  // 詳細カードの見出しはシリーズ名だけで、一覧の行はシリーズ名の後に年代を並べる。
  const cardTitle = page
    .getByRole("complementary")
    .filter({ has: page.getByRole("button", { name: "詳細を閉じる" }) })
    .getByRole("heading", { level: 2 });

  await expect(cardTitle).toBeVisible();

  const title = (await cardTitle.textContent()) ?? "";

  expect(title).not.toBe("");
  await expect(item).toContainText(title);
  await expect(item).toHaveAttribute("aria-current", "true");
});

test("地図の円を押すと、詳細カードが開く", async ({ page }) => {
  // 円は地図の load の後に描かれるので、見つかるまで撮り直す。
  await expect.poll(() => findCirclePoint(page)).not.toBeNull();

  const point = await findCirclePoint(page);

  if (point === null) {
    throw new Error("地図の円が見つからなかった");
  }

  await page.mouse.click(point.x, point.y);

  await expect(
    page.getByRole("button", { name: "詳細を閉じる" }),
  ).toBeVisible();
});
