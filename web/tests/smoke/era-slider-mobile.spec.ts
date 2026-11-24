/**
 * スマホの幅で、era スライダーの境目の年が互いに重ならず、スライダーが画面の内側に収まることを見る。
 * 初期の位置と、帯を終わりの端まで動かした位置の 2 つで見る。
 *
 * 相手は `next build` が吐いた `out/` の実物なので、`pnpm build` の後でしか回せない。
 * デスクトップの幅では era スライダーが別の形なので、`smoke-desktop` では飛ばす。
 */

import { expect, type Locator, test } from "@playwright/test";
import { exportRoot, openExport, viewportOf } from "@scripts/smoke";

type Box = { x: number; y: number; width: number; height: number };

/** 2 つの矩形が 1px 以上の面積で重なるなら true を返す。 */
function isOverlapping(a: Box, b: Box): boolean {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

/** `locators` の要素の矩形を左から順に返し、画面に無い要素があれば throw する。 */
async function boxesOf(locators: Locator): Promise<Box[]> {
  const boxes: Box[] = [];

  for (const locator of await locators.all()) {
    const box = await locator.boundingBox();

    if (box === null) {
      throw new Error("境目の年の矩形を取れない");
    }

    boxes.push(box);
  }

  return boxes;
}

test("初期表示と帯の終わりで、境目の年が重ならず、era スライダーが画面の内側にある", async ({
  page,
}) => {
  const size = viewportOf(page);

  test.skip(size.width >= 768, "スマホの幅の形だけを見る");

  const server = await openExport(page, exportRoot(), { pagePath: "/" });

  try {
    const slider = page.getByTestId("era-slider");
    const years = page.getByTestId("era-boundary-year");

    for (const jump of [null, "の終わりへ"]) {
      if (jump !== null) {
        await page.getByRole("button", { name: jump }).click();
      }

      await expect(slider).toBeVisible();

      // シートの高さと帯の位置が止まるまで、矩形が画面の内側に入るのを待つ。
      await expect
        .poll(async () => {
          const box = await slider.boundingBox();

          return (
            box !== null &&
            box.x >= 0 &&
            box.x + box.width <= size.width &&
            box.y >= 0 &&
            box.y + box.height <= size.height
          );
        })
        .toBe(true);

      const boxes = await boxesOf(years);

      expect(boxes).toHaveLength(2);
      expect(isOverlapping(boxes[0], boxes[1]), "境目の年の重なり").toBe(false);
    }
  } finally {
    server.close();
  }
});
