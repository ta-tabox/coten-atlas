/**
 * `catalog/` の現物へ読み込みの関数が届くかと、事物の全件の保存が検査に通った値だけを書くかを見る。
 *
 * 現物がスキーマに合っているかは `tests/catalog.test.ts` が持つ。
 * 保存のテストは現物を一時ディレクトリへ複製して書くので、`catalog/` を書き換えない。
 *
 * @vitest-environment node
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadEras, loadLoci, loadSeries, saveLoci } from "@/lib/catalog-dir";
import type { LocusCollection } from "@/lib/schema/locus";

describe("loadSeries", () => {
  it("現物を読んで検査に通す", () => {
    expect(loadSeries().length).toBeGreaterThan(0);
  });
});

describe("loadLoci", () => {
  it("現物を読んで検査に通す", () => {
    expect(loadLoci().features.length).toBeGreaterThan(0);
  });
});

describe("loadEras", () => {
  it("現物を読んで検査に通す", () => {
    expect(loadEras().length).toBeGreaterThan(0);
  });
});

describe("saveLoci", () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "coten-atlas-catalog-"));

    for (const fileName of ["series.json", "loci.geojson"]) {
      fs.copyFileSync(
        path.join(process.cwd(), "..", "catalog", fileName),
        path.join(dir, fileName),
      );
    }
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true });
  });

  /** 一時ディレクトリの `loci.geojson` を文字列のまま読む。 */
  function readLociText(): string {
    return fs.readFileSync(path.join(dir, "loci.geojson"), "utf8");
  }

  /** 一時ディレクトリの事物の全件のうち、先頭の 1 件の座標を `coordinates` にした全件を返す。 */
  function withFirstCoordinates(
    coordinates: [number, number],
  ): LocusCollection {
    const loci = loadLoci(dir);
    const [first, ...rest] = loci.features;

    return {
      ...loci,
      features: [
        { ...first, geometry: { ...first.geometry, coordinates } },
        ...rest,
      ],
    };
  }

  it("検査に通る全件を保存すると、読み直した先頭の事物の座標が書き換わっている", () => {
    expect(saveLoci(withFirstCoordinates([131.5, 34.5]), dir)).toEqual([]);

    expect(loadLoci(dir).features[0].geometry.coordinates).toEqual([
      131.5, 34.5,
    ]);
  });

  it("1 件の座標を書き換えて保存すると、ファイルの差分はその座標の 1 行だけになる", () => {
    const before = readLociText().split("\n");

    saveLoci(withFirstCoordinates([131.5, 34.5]), dir);

    const after = readLociText().split("\n");
    const changedLines = after.filter((line, index) => line !== before[index]);

    expect(after.length).toBe(before.length);
    expect(changedLines).toEqual([
      '      "geometry": { "type": "Point", "coordinates": [131.5, 34.5] },',
    ]);
  });

  it("緯度が範囲外の全件は書かず、理由を返す", () => {
    const before = readLociText();

    const problems = saveLoci(withFirstCoordinates([131.5, 95]), dir);

    expect(problems.join("\n")).toMatch(/緯度/);
    expect(readLociText()).toBe(before);
  });

  it("どのシリーズも指さない事物を含む全件は書かず、理由を返す", () => {
    const before = readLociText();
    const loci = loadLoci(dir);
    const [first, ...rest] = loci.features;
    const orphan = {
      ...first,
      properties: { ...first.properties, seriesId: "no-such-series" },
    };

    const problems = saveLoci({ ...loci, features: [orphan, ...rest] }, dir);

    expect(problems.join("\n")).toMatch(/no-such-series/);
    expect(readLociText()).toBe(before);
  });
});
