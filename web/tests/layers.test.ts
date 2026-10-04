/**
 * `web/src` の追跡しているファイルがすべて `.claude/rules/layers.md` の表に置き場を持つことのテストを置く。
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = spawnSync("git", ["rev-parse", "--show-toplevel"], {
  cwd: import.meta.dirname,
  encoding: "utf8",
}).stdout.trim();

/** 置き場を読み取る `layers.md` の節の見出し。 */
const PLACEMENT_SECTIONS = [
  "## 境界を閉じるモジュール",
  "## 層と、import してよい相手",
];

/**
 * `markdown` の見出しが `heading` の節の本文を返す。
 *
 * 見出しが無ければ throw する。
 */
function sectionOf(markdown: string, heading: string): string {
  const start = markdown.indexOf(`${heading}\n`);

  if (start === -1) {
    throw new Error(`layers.md に節が無い: ${heading}`);
  }

  const next = markdown.indexOf("\n## ", start + heading.length);

  return markdown.slice(start, next === -1 ? undefined : next);
}

/**
 * `markdown` の置き場の節の表の行から、バッククォートで囲んだ語を `web/` からの相対の glob として返す。
 */
function listPlacementGlobs(markdown: string): string[] {
  const tableRows = PLACEMENT_SECTIONS.flatMap((heading) =>
    sectionOf(markdown, heading)
      .split("\n")
      .filter((line) => line.startsWith("|")),
  );

  return tableRows.flatMap((row) =>
    [...row.matchAll(/`([^`]+)`/g)].map((match) => match[1]),
  );
}

/**
 * `files` のうち、どの glob（`globs`）にも当たらないファイルを返す。
 *
 * 全件が当たれば空配列を返す。
 */
function listUnplacedFiles(files: string[], globs: string[]): string[] {
  return files.filter(
    (file) => !globs.some((glob) => path.matchesGlob(file, glob)),
  );
}

const layersGlobs = listPlacementGlobs(
  readFileSync(path.join(repositoryRoot, ".claude/rules/layers.md"), "utf8"),
);

describe("layers.md の置き場", () => {
  it("web/src の追跡しているファイルは、どれも層の表か境界の表の置き場に当たる", () => {
    const sourceFiles = spawnSync("git", ["ls-files"], {
      cwd: path.join(repositoryRoot, "web/src"),
      encoding: "utf8",
    })
      .stdout.split("\n")
      .filter((file) => file !== "")
      .map((file) => `src/${file}`);

    expect(sourceFiles).not.toEqual([]);
    expect(listUnplacedFiles(sourceFiles, layersGlobs)).toEqual([]);
  });

  it("どの glob にも当たらないファイルは、未配置として返る", () => {
    const unplaced = listUnplacedFiles(
      ["src/lib/schema/series.ts", "src/lib/nope.ts"],
      ["src/lib/schema/**"],
    );

    expect(unplaced).toEqual(["src/lib/nope.ts"]);
  });

  it("層の表の glob は、実在しないファイルまで置き場に含めるほど広くない", () => {
    expect(listUnplacedFiles(["src/lib/nope.ts"], layersGlobs)).toEqual([
      "src/lib/nope.ts",
    ]);
  });
});
