/**
 * 画面上端のヘッダーが、どの幅でも、サイト名と副題が見え、一覧パネルと詳細カードに重ならないことを見る。
 *
 * 幅は project の viewport に頼らず `VIEWPORTS` の二つを spec が指す。
 * スマホの条件は `smoke-iphone`・`smoke-android` の project が持つので、ブラウザを増やさず `smoke-desktop` の上で viewport だけを切り替える。
 */

import { expect, type Page, test } from "@playwright/test";
import { exportRoot, observe } from "@scripts/smoke";

const VIEWPORTS = [
  { name: "デスクトップ", width: 1440, height: 900 },
  { name: "スマホ", width: 390, height: 844 },
];

/**
 * ヘッダーと矩形を比べる相手の要素（一覧パネルと詳細カード）を返す。
 */
function overlappingSurfaces(page: Page) {
  return {
    seriesPanel: page.getByRole("complementary", {
      name: "コテンラジオのシリーズ",
    }),
    detailCard: page.locator("aside:has(#series-detail-title)"),
  };
}

/**
 * 要素の矩形を返す。
 * 要素が描かれていなければ throw する。
 */
async function rectOf(target: ReturnType<Page["locator"]>) {
  const box = await target.boundingBox();

  if (box === null) {
    throw new Error("要素が描かれていない");
  }

  return box;
}

test.beforeEach(({ browserName }, testInfo) => {
  test.skip(
    testInfo.project.name !== "smoke-desktop",
    `viewport を spec が指すので、project ごとには回さない（${browserName}）`,
  );
});

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name}（${viewport.width}×${viewport.height}）`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("サイト名と副題が見える", async ({ page }) => {
      await observe(page, exportRoot());

      await expect(page.getByText("COTEN RADIO MAP")).toBeVisible();
      await expect(page.getByText("AN UNOFFICIAL FAN ATLAS")).toBeVisible();
    });

    test("ヘッダーが右の余白へ食い込まず、一覧パネルと詳細カードに重ならない", async ({
      page,
    }) => {
      await observe(page, exportRoot());

      const header = page.locator("[data-site-header]");
      const { seriesPanel, detailCard } = overlappingSurfaces(page);

      // 子が余白へ食い込んでも scrollWidth は増えないので、右端の子と右の余白の端を比べる。
      const intrusion = await header.evaluate((element) => {
        const rightEdge = element.getBoundingClientRect().right;
        const padding = Number.parseFloat(
          getComputedStyle(element).paddingRight,
        );
        const lastRight = Math.max(
          ...Array.from(
            element.children,
            (child) => child.getBoundingClientRect().right,
          ),
        );

        return lastRight - (rightEdge - padding);
      });

      expect(intrusion).toBeLessThanOrEqual(0);

      await seriesPanel.locator("li button:visible").first().click();
      await expect(detailCard).toBeVisible();

      const headerBottom =
        (await rectOf(header)).y + (await rectOf(header)).height;

      expect((await rectOf(seriesPanel)).y).toBeGreaterThanOrEqual(
        headerBottom,
      );
      expect((await rectOf(detailCard)).y).toBeGreaterThanOrEqual(headerBottom);
    });
  });
}
