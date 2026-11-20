/**
 * 地図の円と輪の色の表 `MAP_COLORS` が、`globals.css` の `@theme` の同じ名前のトークンと同じ値を持つかを見る。
 *
 * MapLibre の paint は CSS 変数を読めないので、同じ値を TypeScript と CSS の 2 箇所に持ち、食い違いをこのテストで止める。
 * jsdom では `import.meta.url` が file URL にならないので、環境を node に指定してある。
 *
 * @vitest-environment node
 */

import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { MAP_COLORS } from "@/lib/map/layers/shared";

const GLOBALS_CSS = fileURLToPath(
  new URL("../src/app/globals.css", import.meta.url),
);

describe("MAP_COLORS", () => {
  const css = fs.readFileSync(GLOBALS_CSS, "utf8");

  it.each(Object.entries(MAP_COLORS))(
    "%s は globals.css の同じ名前のトークンと同じ値を持つ",
    (name, value) => {
      const token = new RegExp(`--color-${name}:\\s*([^;]+);`).exec(css);

      expect(token?.[1].trim()).toBe(value);
    },
  );
});
