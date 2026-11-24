/**
 * 出典表記が、どの幅でも、画面の端で字が欠けずに全文を出すことを見る。
 * スマホの幅での位置とシートとの関係は `mobile-sheet.spec.ts` が見る。
 */

import { expect, test } from "@playwright/test";
import { exportRoot, openExport } from "@scripts/smoke";

test("出典表記は、行の高さと下の余白を持ち、画面の端で下の字が欠けない", async ({
  page,
}) => {
  const server = await openExport(page, exportRoot(), { pagePath: "/" });

  try {
    const attribution = page.locator(".maplibregl-ctrl-attrib");

    await expect(attribution).toContainText("OpenFreeMap");

    const style = await attribution.evaluate((element) => {
      const computed = getComputedStyle(element);

      return {
        fontSize: Number.parseFloat(computed.fontSize),
        lineHeight: Number.parseFloat(computed.lineHeight),
        paddingBottom: Number.parseFloat(computed.paddingBottom),
      };
    });

    // 行の高さが文字の高さぎりぎりだと、画面の下端で p や g の下が欠ける。
    expect(style.lineHeight / style.fontSize).toBeGreaterThanOrEqual(1.3);
    expect(style.paddingBottom).toBeGreaterThanOrEqual(3);
  } finally {
    server.close();
  }
});
