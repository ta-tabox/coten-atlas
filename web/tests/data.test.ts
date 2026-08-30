/**
 * `data/` の現物が `src/lib/schema/` のスキーマに合っているかを見る。
 *
 * 型検査は `data/` を見ない（`tsconfig.json` の `include` が `web/` 配下しか見ない）ので、JSON が契約から外れても型では赤くならない。
 * 人手で書く層（`themes.geojson`・`eras.json`）を持つ以上、書き間違いを機械で拾う場所がどこかに要る。
 *
 * ここが読むのは現物だけで、対応表と漏れの判定は `@/lib/schema/data-files` が持つ。
 * jsdom では `import.meta.url` が file URL にならないので、環境を node に指定してある。
 *
 * @vitest-environment node
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DATA_VALIDATORS, unvalidatedNames } from "@/lib/schema/data-files";

/**
 * データ層の置き場。
 * リポジトリのルート直下で、`web/` の外にある。
 */
const DATA_DIR = fileURLToPath(new URL("../../data", import.meta.url));

/**
 * `data/` 直下のファイル名。
 * ディレクトリへは降りない（`inbox/` の形は #27 が決める）。
 */
function dataFileNames(): string[] {
  return fs
    .readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
}

describe("data/", () => {
  for (const [fileName, parse] of DATA_VALIDATORS) {
    const file = path.join(DATA_DIR, fileName);

    // まだ生成されていないファイルは飛ばす。
    // 実在しないものを赤にしても、報せる中身が無い。
    it.skipIf(!fs.existsSync(file))(`${fileName} がスキーマに合う`, () => {
      expect(() =>
        parse(JSON.parse(fs.readFileSync(file, "utf8"))),
      ).not.toThrow();
    });
  }

  it("検査する口を持たないデータファイルが増えていない", () => {
    expect(unvalidatedNames(dataFileNames())).toEqual([]);
  });
});
