/**
 * @vitest-environment node
 *
 * 既定の jsdom では import.meta.url が file スキームにならず、ファイルの実体を辿れない。
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const publicWorker = fileURLToPath(
  new URL("../public/maplibre-gl-worker.mjs", import.meta.url),
);
const packagedWorker = fileURLToPath(
  new URL(
    "../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs",
    import.meta.url,
  ),
);

function relativeImportsOf(filePath: string): string[] {
  const source = readFileSync(filePath, "utf8");

  return [...source.matchAll(/from\s*"(\.\/[^"]+)"/g)].map((match) => match[1]);
}

describe("MapLibre の worker", () => {
  it("依存と同じ中身で public/ に置かれている", () => {
    expect(readFileSync(publicWorker)).toEqual(readFileSync(packagedWorker));
  });

  it("import している相手も public/ に揃っている", () => {
    const missing = relativeImportsOf(publicWorker).filter(
      (specifier) => !existsSync(resolve(dirname(publicWorker), specifier)),
    );

    expect(missing).toEqual([]);
  });
});
