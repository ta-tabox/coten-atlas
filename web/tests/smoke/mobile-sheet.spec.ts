/**
 * スマホの幅で、一覧と詳細カードを 1 枚のシートに置いた画面の配置を見る。
 * 見るのは、閉じた段・開いた段・詳細カードの段の要素の出入りと、シート・era スライダー・出典表記の矩形の位置関係である。
 *
 * 相手は `next build` が吐いた `out/` の実物なので、`pnpm build` の後でしか回せない。
 * デスクトップの幅ではシートを置かないので、`smoke-desktop` では飛ばす。
 */

import { expect, type Locator, type Page, test } from "@playwright/test";
import { exportRoot, openExport, viewportOf } from "@scripts/smoke";

/** 開いた段のシートの上端が、画面の高さの半分から外れてよい幅（px）。 */
const OPEN_TOP_TOLERANCE_PX = 16;

/** `locator` の矩形を返す。要素が画面に無ければ throw する。 */
async function rectOf(locator: Locator) {
  const box = await locator.boundingBox();

  if (box === null) {
    throw new Error("矩形を取れない");
  }

  return box;
}

/**
 * スマホの幅の画面を開き、`run` へシートの要素を渡して、終わったら配信を止める。
 * スマホの幅でなければ、テストを飛ばす。
 */
async function withSheetPage(
  page: Page,
  run: (parts: {
    size: { width: number; height: number };
    sheet: Locator;
    listItem: Locator;
  }) => Promise<void>,
): Promise<void> {
  const size = viewportOf(page);

  test.skip(size.width >= 768, "シートはスマホの幅だけに置く");

  const server = await openExport(page, exportRoot(), { pagePath: "/" });

  try {
    const sheet = page.getByTestId("series-sheet");
    const listItem = sheet
      .getByRole("region", { name: /地図に出ているシリーズ/ })
      .locator("li button")
      .first();

    await run({ size, sheet, listItem });
  } finally {
    server.close();
  }
}

test("初期表示で、シートの見出しだけが出て、一覧の項目は画面に出ていない", async ({
  page,
}) => {
  await withSheetPage(page, async ({ listItem }) => {
    await expect(page.getByTestId("series-sheet-heading")).toBeVisible();
    await expect(listItem).toBeHidden();
  });
});

test("見出しを押すと一覧の項目が出て、シートの上端が画面の高さの半分の付近に来る", async ({
  page,
}) => {
  await withSheetPage(page, async ({ size, sheet, listItem }) => {
    await page.getByTestId("series-sheet-heading").click();
    await expect(listItem).toBeVisible();

    const openSheet = await rectOf(sheet);

    expect(
      Math.abs(openSheet.y - size.height / 2),
      `シートの上端 ${openSheet.y}`,
    ).toBeLessThanOrEqual(OPEN_TOP_TOLERANCE_PX);
  });
});

test("開いた段で、era スライダーはシートの上端より上にあり、出典表記は era スライダーと重ならない", async ({
  page,
}) => {
  await withSheetPage(page, async ({ sheet }) => {
    await page.getByTestId("series-sheet-heading").click();
    await expect(sheet).toHaveAttribute("data-stage", "open");

    const openSheet = await rectOf(sheet);
    const slider = await rectOf(page.getByTestId("era-slider"));
    const attribution = await rectOf(page.locator(".maplibregl-ctrl-attrib"));

    expect(slider.y + slider.height).toBeLessThanOrEqual(openSheet.y);
    expect(attribution.y + attribution.height).toBeLessThanOrEqual(slider.y);
  });
});

test("閉じた段でも、出典表記は era スライダーと重ならない", async ({
  page,
}) => {
  await withSheetPage(page, async ({ sheet }) => {
    const closedSheet = await rectOf(sheet);
    const slider = await rectOf(page.getByTestId("era-slider"));
    const attribution = await rectOf(page.locator(".maplibregl-ctrl-attrib"));

    expect(slider.y + slider.height).toBeLessThanOrEqual(closedSheet.y);
    expect(attribution.y + attribution.height).toBeLessThanOrEqual(slider.y);
  });
});

test("一覧から 1 件選ぶと、詳細カードがシートに出て、一覧の項目は同時には出ない", async ({
  page,
}) => {
  await withSheetPage(page, async ({ sheet, listItem }) => {
    await page.getByTestId("series-sheet-heading").click();
    await listItem.click();

    await expect(
      sheet.getByRole("button", { name: "詳細を閉じる" }),
    ).toBeVisible();
    await expect(
      sheet.getByRole("button", { name: /地図に出ているシリーズ/ }),
    ).toHaveCount(0);
  });
});

test("詳細カードを閉じると、シートは一覧へ戻る", async ({ page }) => {
  await withSheetPage(page, async ({ sheet, listItem }) => {
    await page.getByTestId("series-sheet-heading").click();
    await listItem.click();
    await sheet.getByRole("button", { name: "詳細を閉じる" }).click();

    await expect(listItem).toBeVisible();
  });
});
