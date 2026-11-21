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
 * `locator` の矩形を、動きが止まるまで待ってから返す。
 * シートは段が変わると高さが動くので、動いている途中の矩形では位置を比べられない。
 * 要素が画面に無いか、動きが止まらなければ throw する。
 */
async function rectOf(locator: Locator) {
  let previous = await locator.boundingBox();

  for (let attempt = 0; attempt < 30; attempt += 1) {
    await locator.page().waitForTimeout(100);

    const current = await locator.boundingBox();

    if (current === null || previous === null) {
      throw new Error("矩形を取れない");
    }

    if (
      current.x === previous.x &&
      current.y === previous.y &&
      current.width === previous.width &&
      current.height === previous.height
    ) {
      return current;
    }

    previous = current;
  }

  throw new Error("矩形が 3 秒たっても止まらない");
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
    const sheet = page.getByTestId("bottom-sheet");
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
async function tapHandle(page: Page) {
  await page.getByTestId("bottom-sheet-handle").click();
}

/**
 * 取っ手の行の中央から縦に `distance`（px、正で下）だけマウスで動かして離す。
 * 動かす距離は、段を移すしきい値より少しだけ大きくする。
 */
async function swipeHandle(page: Page, distance: number) {
  const heading = await rectOf(page.getByTestId("bottom-sheet-handle"));
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
    await expect(page.getByTestId("bottom-sheet-handle")).toBeVisible();
    await expect(sheet).toHaveAttribute("data-stage", "era");
    await expect(page.getByTestId("era-slider")).toBeVisible();
    await expect(listItem).toBeHidden();
  });
});

test("era の段で、era スライダーはシートの中にある", async ({ page }) => {
  await withSheetPage(page, async ({ sheet }) => {
    const sheetRect = await rectOf(sheet);
    const slider = await rectOf(page.getByTestId("era-slider"));

    expect(slider.y).toBeGreaterThanOrEqual(sheetRect.y);
    expect(slider.y + slider.height).toBeLessThanOrEqual(
      sheetRect.y + sheetRect.height,
    );
  });
});

test("取っ手を押すと一覧の項目が出て、シートの上端が画面の高さの半分の付近に来る", async ({
  page,
}) => {
  await withSheetPage(page, async ({ size, sheet, listItem }) => {
    await tapHandle(page);
    await expect(sheet).toHaveAttribute("data-stage", "list");
    await expect(listItem).toBeVisible();

    const listSheet = await rectOf(sheet);

    expect(
      Math.abs(listSheet.y - size.height / 2),
      `シートの上端 ${listSheet.y}`,
    ).toBeLessThanOrEqual(TOP_TOLERANCE_PX);
  });
});

test("どの段でも、出典表記はヘッダーの下にあり、シートと重ならない", async ({
  page,
}) => {
  await withSheetPage(page, async ({ sheet }) => {
    const attribution = page.locator(".maplibregl-ctrl-attrib");
    const header = await rectOf(page.locator("[data-site-header]"));

    for (const stage of ["era", "list", "full"]) {
      await expect(sheet).toHaveAttribute("data-stage", stage);

      const attributionRect = await rectOf(attribution);
      const sheetRect = await rectOf(sheet);

      expect(
        attributionRect.y,
        `${stage} の出典表記の上端`,
      ).toBeGreaterThanOrEqual(header.y + header.height);
      expect(
        attributionRect.y + attributionRect.height,
        `${stage} の出典表記の下端`,
      ).toBeLessThanOrEqual(sheetRect.y);

      await tapHandle(page);
    }
  });
});

test("list の段で、閉じるボタンが era スライダーを隠し、「時代を変える」ボタンが戻す", async ({
  page,
}) => {
  await withSheetPage(page, async () => {
    await tapHandle(page);
    await expect(page.getByTestId("era-slider")).toBeVisible();

    await page.getByRole("button", { name: "時代スライダーを閉じる" }).click();
    await expect(page.getByTestId("era-slider")).toBeHidden();

    await page.getByRole("button", { name: "時代を変える" }).click();
    await expect(page.getByTestId("era-slider")).toBeVisible();
  });
});

test("取っ手をもう一度押すと全面の段になり、シートの上端がヘッダーと出典表記の下に来て、era スライダーは隠れる", async ({
  page,
}) => {
  await withSheetPage(page, async ({ sheet }) => {
    await tapHandle(page);
    await tapHandle(page);
    await expect(sheet).toHaveAttribute("data-stage", "full");

    const fullSheet = await rectOf(sheet);

    expect(
      Math.abs(fullSheet.y - 5.5 * 16),
      `シートの上端 ${fullSheet.y}`,
    ).toBeLessThanOrEqual(TOP_TOLERANCE_PX);
    await expect(page.getByTestId("era-slider")).toBeHidden();
  });
});

test("取っ手を短く下へスワイプすると隣の段へ移り、上へスワイプすると戻る", async ({
  page,
}) => {
  await withSheetPage(page, async ({ sheet }) => {
    await swipeHandle(page, 70);
    await expect(sheet).toHaveAttribute("data-stage", "closed");
    await expect(page.getByTestId("era-slider")).toBeHidden();

    await swipeHandle(page, -70);
    await expect(sheet).toHaveAttribute("data-stage", "era");
    await expect(page.getByTestId("era-slider")).toBeVisible();
  });
});

test("一覧から 1 件選ぶと、list の段で詳細カードがシートに出て、一覧の項目は同時には出ない", async ({
  page,
}) => {
  await withSheetPage(page, async ({ sheet, listItem }) => {
    await tapHandle(page);
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
    await tapHandle(page);
    await tapHandle(page);
    await listItem.click();

    await expect(sheet).toHaveAttribute("data-stage", "list");
    await expect(
      sheet.getByRole("button", { name: "詳細を閉じる" }),
    ).toBeVisible();
  });
});

test("詳細カードを閉じると、シートは一覧へ戻る", async ({ page }) => {
  await withSheetPage(page, async ({ sheet, listItem }) => {
    await tapHandle(page);
    await listItem.click();
    await sheet.getByRole("button", { name: "詳細を閉じる" }).click();

    await expect(listItem).toBeVisible();
  });
});

test("シートの高さは段が変わると動く", async ({ page }) => {
  await withSheetPage(page, async ({ sheet }) => {
    const transition = await sheet.evaluate((element) => {
      const style = getComputedStyle(element);

      return {
        property: style.transitionProperty,
        duration: style.transitionDuration,
      };
    });

    expect(transition.property).toContain("height");
    expect(transition.duration).toBe("0.3s");
  });
});

test("出典表記は、ボタンに隠さず全文を一行で出し、背景を持たない", async ({
  page,
}) => {
  await withSheetPage(page, async ({ size }) => {
    const attribution = page.locator(".maplibregl-ctrl-attrib");

    await expect(attribution).toContainText("OpenFreeMap");
    await expect(
      attribution.locator(".maplibregl-ctrl-attrib-button"),
    ).toBeHidden();

    const rect = await rectOf(attribution);
    const background = await attribution.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );

    // 一行なら高さは文字 1 行分に収まり、2 行に折り返すとその倍になる。
    expect(rect.height, "出典表記の高さ").toBeLessThan(24);
    expect(rect.x + rect.width, "出典表記の右端").toBeLessThanOrEqual(
      size.width,
    );
    expect(background).toBe("rgba(0, 0, 0, 0)");
  });
});
