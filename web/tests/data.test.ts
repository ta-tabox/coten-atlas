/**
 * `data/` の現物が `src/lib/schema/` のスキーマに合っているかを見る。
 *
 * 型検査は `data/` を見ない（`tsconfig.json` の `include` が `web/` 配下しか見ない）ので、JSON がスキーマから外れても型では赤くならない。
 * 人手で書く層（`series.json`・`eras.json`）を持つ以上、書き間違いを機械で拾う場所がどこかに要る。
 *
 * ここが読むのは現物だけで、対応表と漏れの判定は `@/lib/schema/data-files` が、ファイルをまたぐ参照の判定は `@/lib/schema/references` が持つ。
 * jsdom では `import.meta.url` が file URL にならないので、環境を node に指定してある。
 *
 * @vitest-environment node
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DATA_VALIDATORS, unvalidatedNames } from "@/lib/schema/data-files";
import { parseEpisodes } from "@/lib/schema/episode";
import { parseEras } from "@/lib/schema/era";
import { parseInbox } from "@/lib/schema/inbox";
import {
  brokenSeriesReferences,
  seriesOutsideEraSpace,
} from "@/lib/schema/references";
import { parseSeries } from "@/lib/schema/series";

/**
 * データ層の置き場。
 * リポジトリのルート直下で、`web/` の外にある。
 */
const DATA_DIR = fileURLToPath(new URL("../../data", import.meta.url));

/**
 * `data/` 直下のファイル名。
 * ディレクトリへは降りない。
 * `inbox/` の中は日付ごとに増えていくので、対応表でなく下の走査が受け持つ。
 */
function dataFileNames(): string[] {
  return fs
    .readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
}

/** 未割当スタブの置き場。 */
const INBOX_DIR = path.join(DATA_DIR, "inbox");

/**
 * `data/inbox/` の JSON のファイル名。
 * ディレクトリごと無い間は空なので、検査は 1 件も生えない。
 */
function inboxFileNames(): string[] {
  if (!fs.existsSync(INBOX_DIR)) {
    return [];
  }

  return fs
    .readdirSync(INBOX_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort();
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

  // inbox は日付ごとにファイルが増えるので、名前を対応表へ書けない。
  // 人間が開いて編集する唯一の生成物なので、編集で形が崩れたまま気付かない経路を残さない。
  for (const fileName of inboxFileNames()) {
    it(`inbox/${fileName} がスキーマに合う`, () => {
      expect(() =>
        parseInbox(
          JSON.parse(fs.readFileSync(path.join(INBOX_DIR, fileName), "utf8")),
        ),
      ).not.toThrow();
    });
  }

  const episodesFile = path.join(DATA_DIR, "episodes.json");
  const seriesFile = path.join(DATA_DIR, "series.json");
  const erasFile = path.join(DATA_DIR, "eras.json");

  // 片方でも無いうちは、ファイルをまたぐ参照がまだ生まれていない。
  it.skipIf(!fs.existsSync(episodesFile) || !fs.existsSync(seriesFile))(
    "episodes.json の seriesId が series.json の実在する id と season を指す",
    () => {
      const episodes = parseEpisodes(
        JSON.parse(fs.readFileSync(episodesFile, "utf8")),
      );
      const series = parseSeries(
        JSON.parse(fs.readFileSync(seriesFile, "utf8")),
      );

      expect(brokenSeriesReferences(episodes, series)).toEqual([]);
    },
  );

  // series.json が無いうちは、era 空間と突き合わせる相手が居ない。
  it.skipIf(!fs.existsSync(seriesFile) || !fs.existsSync(erasFile))(
    "series.json の timeRange が eras.json の era 空間と重なる",
    () => {
      const series = parseSeries(
        JSON.parse(fs.readFileSync(seriesFile, "utf8")),
      );
      const eras = parseEras(JSON.parse(fs.readFileSync(erasFile, "utf8")));

      expect(seriesOutsideEraSpace(series, eras)).toEqual([]);
    },
  );
});
