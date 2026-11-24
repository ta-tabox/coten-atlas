/**
 * 画面の操作と配置を見る E2E（`tests/e2e/` の Playwright の spec）が、ブラウザで開いた配信物から観測を集める関数と、地図の点の画面座標を求める純関数を置く。
 * 配信物を開く機構（配信・外部への通信の遮断・ページの遷移）は持たず、`scripts/smoke.ts` の `openExport` が持つ。
 *
 * 判定を回すのは `tests/e2e/` の spec で、このモジュールは判定しない。
 */

import type { Page } from "@playwright/test";
import { openExport, type Viewport } from "@scripts/smoke";

/** 画面上の矩形（CSS ピクセル）。 */
export type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

/**
 * 初期表示の一覧パネルと、地図に出ているシリーズの区画に並ぶシリーズの名前。
 *
 * 名前の並びは、地図に点が描かれているシリーズと一致する。
 */
export type PanelObservation = {
  /**
   * 一覧パネルの枠線を含む外形の矩形。
   * パネルが無ければ null。
   */
  panelRect: Rect | null;
  onMapSeriesTitles: string[];
};

/**
 * ページを開いて、初期表示の一覧パネルの矩形と、地図に出ているシリーズの名前を集める。
 * 判定はしない。
 */
export async function observePanel(
  page: Page,
  root: string,
): Promise<PanelObservation> {
  const server = await openExport(page, root, { pagePath: "/" });

  try {
    return await page.evaluate(() => {
      const rect = document
        .querySelector("[data-series-panel]")
        ?.getBoundingClientRect();

      return {
        panelRect: rect
          ? {
              left: rect.left,
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom,
            }
          : null,
        onMapSeriesTitles: Array.from(
          document.querySelectorAll(
            '[data-section="on-map"] [data-series-title]',
          ),
        ).map((title) => title.textContent ?? ""),
      };
    });
  } finally {
    server.close();
  }
}

/** 経度・緯度（度）の点を、`view` の視野で描いた画面上の座標（CSS ピクセル、左上が原点）。 */
export type ScreenPoint = { x: number; y: number };

/**
 * `view` の中心と `padding` を持つ `size` の地図に、`point` が描かれる画面上の座標を返す。
 * Web メルカトルで、MapLibre の既定の 512px のタイルを使う。
 *
 * 中心は `padding` を除いた領域の中央に描かれる。
 */
export function screenPointOf(
  point: { longitude: number; latitude: number },
  view: {
    longitude: number;
    latitude: number;
    zoom: number;
    paddingLeft: number;
  },
  size: Viewport,
): ScreenPoint {
  const worldSize = 512 * 2 ** view.zoom;
  const mercator = (longitude: number, latitude: number) => {
    const radians = (latitude * Math.PI) / 180;

    return {
      x: ((longitude + 180) / 360) * worldSize,
      y:
        ((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) /
          2) *
        worldSize,
    };
  };
  const center = mercator(view.longitude, view.latitude);
  const target = mercator(point.longitude, point.latitude);

  return {
    x: (view.paddingLeft + size.width) / 2 + target.x - center.x,
    y: size.height / 2 + target.y - center.y,
  };
}
