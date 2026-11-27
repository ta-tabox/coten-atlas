/**
 * era スライダーの境目の年が互いに重ならず、スライダーが画面の内側に収まることを、どの端末の条件でも見る。
 * 全体を映した初期の状態と、拡大して表示範囲を未来の端までずらした状態の 2 つで見る。
 *
 * 相手は `next build` が吐いた `out/` の実物なので、`pnpm build` の後でしか回せない。
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

test("初期表示と、拡大して未来の端までずらした状態で、境目の年が重ならず、era スライダーが画面の内側にある", async ({
  page,
}) => {
  const size = viewportOf(page);

  const server = await openExport(page, exportRoot(), { pagePath: "/" });

  try {
    const slider = page.getByTestId("era-slider");
    const years = page.getByTestId("era-boundary-year");

    for (const isZoomed of [false, true]) {
      if (isZoomed) {
        await page
          .getByRole("button", { name: "表示範囲を拡大して細かく調整する" })
          .click();

        const next = page.getByRole("button", {
          name: "表示範囲を未来の方向へずらす",
        });

        // 端に着くとボタンが押せなくなる。
        while (await next.isEnabled()) {
          await next.click();
        }
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

test("先史を選んだとき、境目の年「前10000」と「前800」が重ならず、画面の内側にある", async ({
  page,
}) => {
  const server = await openExport(page, exportRoot(), { pagePath: "/" });

  try {
    // 全体を映すトラックの左端から 8px 以内を押すと、位置 0（先史の始まり）を選ぶ。
    await page
      .getByTestId("era-slider-track")
      .click({ position: { x: 4, y: 20 } });

    const years = page.getByTestId("era-boundary-year");

    await expect(years).toHaveText(["前10000", "前800"]);

    // 年の位置は 0.2 秒かけて動くので、動き終わって重ならなくなるまで待つ。
    await expect
      .poll(
        async () => {
          const boxes = await boxesOf(years);

          return isOverlapping(boxes[0], boxes[1]);
        },
        { message: "境目の年の重なり" },
      )
      .toBe(false);

    const [first, last] = await boxesOf(years);

    expect(first.x, "始まりの年の左端").toBeGreaterThanOrEqual(0);
    expect(last.x + last.width, "終わりの年の右端").toBeLessThanOrEqual(
      viewportOf(page).width,
    );
  } finally {
    server.close();
  }
});
