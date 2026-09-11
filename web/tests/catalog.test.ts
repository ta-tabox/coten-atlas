/**
 * `catalog/` の現物が `src/lib/schema/` のスキーマに合っているかを見る。
 *
 * 型検査は `catalog/` を見ない（`tsconfig.json` の `include` が `web/` 配下しか見ない）ので、JSON がスキーマから外れても型では赤くならない。
 * 人手で書く層（`series.json`・`eras.json`）を持つ以上、書き間違いを機械で拾う場所がどこかに要る。
 *
 * ここが読むのは現物だけで、対応表と漏れの判定は `@/lib/schema/catalog-files` が、ファイルをまたぐ参照の判定は `@/lib/schema/references` が持つ。
 * jsdom では `import.meta.url` が file URL にならないので、環境を node に指定してある。
 *
 * @vitest-environment node
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { presentEndOf } from "@/lib/era/scale";
import {
  CATALOG_VALIDATORS,
  unvalidatedNames,
} from "@/lib/schema/catalog-files";
import { parseEpisodes } from "@/lib/schema/episode";
import { parseEras } from "@/lib/schema/era";
import { parseLoci } from "@/lib/schema/locus";
import {
  brokenAnchors,
  brokenLocusSeriesReferences,
  brokenSeriesReferences,
  lociOutsideSeriesTimeRange,
  seriesOutsideEraSpace,
} from "@/lib/schema/references";
import { parseSeries } from "@/lib/schema/series";

/**
 * 目録（`catalog/`）の置き場。
 * リポジトリのルート直下で、`web/` の外にある。
 */
const CATALOG_DIR = fileURLToPath(new URL("../../catalog", import.meta.url));

/** `catalog/` 直下の 1 本を読んで JSON へ直す。 */
function readCatalogFile(fileName: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(CATALOG_DIR, fileName), "utf8"));
}

/**
 * `catalog/` 直下のファイル名。
 * ディレクトリへは降りない。
 */
function catalogFileNames(): string[] {
  return fs
    .readdirSync(CATALOG_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
}

describe("catalog/", () => {
  for (const [fileName, parse] of CATALOG_VALIDATORS) {
    const file = path.join(CATALOG_DIR, fileName);

    // まだ生成されていないファイルは飛ばす。
    // 実在しないものを赤にしても、報せる中身が無い。
    it.skipIf(!fs.existsSync(file))(`${fileName} がスキーマに合う`, () => {
      expect(() => parse(readCatalogFile(fileName))).not.toThrow();
    });
  }

  it("検査する口を持たないデータファイルが増えていない", () => {
    expect(unvalidatedNames(catalogFileNames())).toEqual([]);
  });

  const episodesFile = path.join(CATALOG_DIR, "episodes.json");
  const seriesFile = path.join(CATALOG_DIR, "series.json");
  const lociFile = path.join(CATALOG_DIR, "loci.geojson");
  const erasFile = path.join(CATALOG_DIR, "eras.json");

  // 片方でも無いうちは、ファイルをまたぐ参照がまだ生まれていない。
  it.skipIf(!fs.existsSync(episodesFile) || !fs.existsSync(seriesFile))(
    "episodes.json の seriesId が series.json の実在する id と season を指す",
    () => {
      const episodes = parseEpisodes(readCatalogFile("episodes.json"));
      const series = parseSeries(readCatalogFile("series.json"));

      expect(brokenSeriesReferences(episodes, series)).toEqual([]);
    },
  );

  // 片方でも無いうちは、シリーズと事物の対応がまだ生まれていない。
  const withoutSeriesAndLoci =
    !fs.existsSync(seriesFile) || !fs.existsSync(lociFile);

  it.skipIf(withoutSeriesAndLoci)(
    "series.json の anchor が loci.geojson の実在する代表点を指す",
    () => {
      const series = parseSeries(readCatalogFile("series.json"));
      const loci = parseLoci(readCatalogFile("loci.geojson"));

      expect(brokenAnchors(series, loci)).toEqual([]);
    },
  );

  it.skipIf(withoutSeriesAndLoci)(
    "loci.geojson の seriesId が series.json の実在するシリーズを指す",
    () => {
      const series = parseSeries(readCatalogFile("series.json"));
      const loci = parseLoci(readCatalogFile("loci.geojson"));

      expect(brokenLocusSeriesReferences(loci, series)).toEqual([]);
    },
  );

  it.skipIf(withoutSeriesAndLoci)(
    "loci.geojson の timeRange が series.json の timeRange に収まる",
    () => {
      const series = parseSeries(readCatalogFile("series.json"));
      const loci = parseLoci(readCatalogFile("loci.geojson"));

      expect(lociOutsideSeriesTimeRange(loci, series)).toEqual([]);
    },
  );

  // series.json が無いうちは、era 空間と突き合わせる相手が居ない。
  it.skipIf(!fs.existsSync(seriesFile) || !fs.existsSync(erasFile))(
    "series.json の timeRange が eras.json の era 空間に収まる",
    () => {
      const series = parseSeries(readCatalogFile("series.json"));
      const eras = parseEras(readCatalogFile("eras.json"));
      const presentEnd = presentEndOf(new Date());

      expect(seriesOutsideEraSpace({ series, eras, presentEnd })).toEqual([]);
    },
  );
});
