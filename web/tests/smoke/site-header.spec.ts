/**
 * 画面上端の帯が、どの幅でも一覧パネルと詳細カードに重ならず、狭い幅では一文だけを省くことを見る。
 *
 * 幅は project の viewport に頼らず `VIEWPORTS` の二つを spec が指す。
 * スマホの条件は `smoke-iphone`・`smoke-android` の project が持つので、ブラウザを増やさず `smoke-desktop` の上で viewport だけを切り替える。
 */

import { expect, type Page, test } from "@playwright/test";
import { exportRoot, observe } from "@scripts/smoke";

const VIEWPORTS = [
  { name: "デスクトップ", width: 1440, height: 900, showsSentence: true },
  { name: "スマホ", width: 390, height: 844, showsSentence: false },
];

/**
 * 帯と矩形を比べる相手の要素を返す。
 * 一覧パネルとシートの置き換えは、ここだけを直す。
 */
function overlappingSurfaces(page: Page) {
  return {
    seriesPanel: page.getByRole("complementary", { name: "シリーズ一覧" }),
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

    test("サイト名と副題が見え、一文は幅に応じて出し入れされる", async ({
      page,
    }) => {
      await observe(page, exportRoot());

      await expect(page.getByText("COTEN RADIO MAP")).toBeVisible();
      await expect(page.getByText("AN UNOFFICIAL FAN ATLAS")).toBeVisible();
      await expect(
        page.getByText("世界地図と年表の上に並べたサイト"),
      ).toBeVisible({ visible: viewport.showsSentence });
    });

    test("帯が横に溢れず、一覧パネルと詳細カードに重ならない", async ({
      page,
    }) => {
      await observe(page, exportRoot());

      const header = page.locator("[data-site-header]");
      const { seriesPanel, detailCard } = overlappingSurfaces(page);

      const overflow = await header.evaluate(
        (element) => element.scrollWidth - element.clientWidth,
      );

      expect(overflow).toBeLessThanOrEqual(0);

      await seriesPanel.locator("li button:visible").first().click();
      await expect(detailCard).toBeVisible();

      const bandBottom =
        (await rectOf(header)).y + (await rectOf(header)).height;

      expect((await rectOf(seriesPanel)).y).toBeGreaterThanOrEqual(bandBottom);
      expect((await rectOf(detailCard)).y).toBeGreaterThanOrEqual(bandBottom);
    });
  });
}
