/**
 * スマホの幅で、一覧と詳細カードを 1 枚のシートに置いた画面の配置を見る。
 * 見るのは、段ごとの要素の出入りと、シート・era スライダー・出典表記の矩形の位置関係である。
 *
 * 相手は `next build` が吐いた `out/` の実物なので、`pnpm build` の後でしか回せない。
 * デスクトップの幅ではシートを置かないので、`smoke-desktop` では飛ばす。
 */

import { expect, type Locator, type Page, test } from "@playwright/test";
import { exportRoot, openExport, viewportOf } from "@scripts/smoke";

/** シートの上端が、段の高さから外れてよい幅（px）。 */
const TOP_TOLERANCE_PX = 16;

/**
 * `locator` の矩形を返す。
 * 要素が画面に無ければ throw する。
 */
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

/** 見出しの行の中央を押して離す。 */
async function tapHeading(page: Page) {
  await page.getByTestId("series-sheet-heading").click();
}

/**
 * 取っ手の行の中央から縦に `distance`（px、正で下）だけマウスで動かして離す。
 * 動かす距離は、段を移すしきい値より少しだけ大きくする。
 */
async function swipeHeading(page: Page, distance: number) {
  const heading = await rectOf(page.getByTestId("series-sheet-heading"));
  const x = heading.x + heading.width / 2;
  const y = heading.y + heading.height / 2;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + distance, { steps: 4 });
  await page.mouse.up();
}

test("初期表示で、シートに見出しと era スライダーだけが出て、一覧の項目は画面に出ていない", async ({
  page,
}) => {
  await withSheetPage(page, async ({ sheet, listItem }) => {
    await expect(page.getByTestId("series-sheet-heading")).toBeVisible();
    await expect(sheet).toHaveAttribute("data-stage", "era");
    await expect(page.getByTestId("era-slider")).toBeVisible();
    await expect(listItem).toBeHidden();
  });
});

test("era の段で、era スライダーはシートの中にあり、出典表記はシートの上にある", async ({
  page,
}) => {
  await withSheetPage(page, async ({ sheet }) => {
    const sheetRect = await rectOf(sheet);
    const slider = await rectOf(page.getByTestId("era-slider"));
    const attribution = await rectOf(page.locator(".maplibregl-ctrl-attrib"));

    expect(slider.y).toBeGreaterThanOrEqual(sheetRect.y);
    expect(slider.y + slider.height).toBeLessThanOrEqual(
      sheetRect.y + sheetRect.height,
    );
    expect(attribution.y + attribution.height).toBeLessThanOrEqual(sheetRect.y);
  });
});

test("取っ手を押すと一覧の項目が出て、シートの上端が画面の高さの半分の付近に来る", async ({
  page,
}) => {
  await withSheetPage(page, async ({ size, sheet, listItem }) => {
    await tapHeading(page);
    await expect(sheet).toHaveAttribute("data-stage", "list");
    await expect(listItem).toBeVisible();

    const listSheet = await rectOf(sheet);

    expect(
      Math.abs(listSheet.y - size.height / 2),
      `シートの上端 ${listSheet.y}`,
    ).toBeLessThanOrEqual(TOP_TOLERANCE_PX);

    const attribution = await rectOf(page.locator(".maplibregl-ctrl-attrib"));

    expect(attribution.y + attribution.height).toBeLessThanOrEqual(listSheet.y);
  });
});

test("list の段で、閉じるボタンが era スライダーを隠し、「時代を変える」ボタンが戻す", async ({
  page,
}) => {
  await withSheetPage(page, async () => {
    await tapHeading(page);
    await expect(page.getByTestId("era-slider")).toBeVisible();

    await page.getByRole("button", { name: "時代スライダーを閉じる" }).click();
    await expect(page.getByTestId("era-slider")).toBeHidden();

    await page.getByRole("button", { name: "時代を変える" }).click();
    await expect(page.getByTestId("era-slider")).toBeVisible();
  });
});

test("取っ手をもう一度押すと全面の段になり、シートの上端が画面の高さの 1 割の付近に来て、era スライダーは隠れる", async ({
  page,
}) => {
  await withSheetPage(page, async ({ size, sheet }) => {
    await tapHeading(page);
    await tapHeading(page);
    await expect(sheet).toHaveAttribute("data-stage", "full");

    const fullSheet = await rectOf(sheet);

    expect(
      Math.abs(fullSheet.y - size.height * 0.1),
      `シートの上端 ${fullSheet.y}`,
    ).toBeLessThanOrEqual(TOP_TOLERANCE_PX);
    await expect(page.getByTestId("era-slider")).toBeHidden();
  });
});

test("取っ手を短く下へスワイプすると隣の段へ移り、上へスワイプすると戻る", async ({
  page,
}) => {
  await withSheetPage(page, async ({ sheet }) => {
    await swipeHeading(page, 40);
    await expect(sheet).toHaveAttribute("data-stage", "closed");
    await expect(page.getByTestId("era-slider")).toBeHidden();

    await swipeHeading(page, -40);
    await expect(sheet).toHaveAttribute("data-stage", "era");
    await expect(page.getByTestId("era-slider")).toBeVisible();
  });
});

test("一覧から 1 件選ぶと、list の段で詳細カードがシートに出て、一覧の項目は同時には出ない", async ({
  page,
}) => {
  await withSheetPage(page, async ({ sheet, listItem }) => {
    await tapHeading(page);
    await listItem.click();

    await expect(sheet).toHaveAttribute("data-stage", "list");
    await expect(
      sheet.getByRole("button", { name: "詳細を閉じる" }),
    ).toBeVisible();
    await expect(
      sheet.getByRole("button", { name: /地図に出ているシリーズ/ }),
    ).toHaveCount(0);
  });
});

test("全面の段で一覧から選ぶと、list の段へ縮む", async ({ page }) => {
  await withSheetPage(page, async ({ sheet, listItem }) => {
    await tapHeading(page);
    await tapHeading(page);
    await listItem.click();

    await expect(sheet).toHaveAttribute("data-stage", "list");
    await expect(
      sheet.getByRole("button", { name: "詳細を閉じる" }),
    ).toBeVisible();
  });
});

test("詳細カードを閉じると、シートは一覧へ戻る", async ({ page }) => {
  await withSheetPage(page, async ({ sheet, listItem }) => {
    await tapHeading(page);
    await listItem.click();
    await sheet.getByRole("button", { name: "詳細を閉じる" }).click();

    await expect(listItem).toBeVisible();
  });
});
