/**
 * `data/` の現物が `src/lib/schema/` の契約に合っているかを見る検査（L3）。
 *
 * 型検査は `data/` を見ない（`tsconfig.json` の `include` が `web/` 配下しか見ない）ので、JSON が契約から外れても L0〜L2 はどれも赤くならない。
 * 人手で書く層（`themes.geojson`・`eras.json`）を持つ以上、書き間違いを機械で拾う場所がどこかに要る。
 *
 * まだ生成されていないファイルは飛ばす。
 * `themes.geojson` は #4、`episodes.json` は #27 が初めて書くので、それまで赤で埋めても報せる中身が無い。
 * 逆に、**検査する口を持たないデータファイルが増えたら落とす**。
 * 黙って見送ると「全部検査した」と「見つけられなかった」が同じ緑になる。
 *
 * 各ファイルの契約そのものはここが持たない。
 * ここが持つのは、どのファイルをどの入口へ渡すかの対応だけである。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseEpisodes } from "../src/lib/schema/episode.ts";
import { parseEras } from "../src/lib/schema/era.ts";
import { parseThemes } from "../src/lib/schema/theme.ts";

/**
 * データ層の置き場。
 * リポジトリのルート直下で、`web/` の外にある。
 */
const DATA_DIR = fileURLToPath(new URL("../../data", import.meta.url));

/**
 * ファイル名と、それを検査する入口の対応。
 * ここに無いデータファイルは検査されないので、増えたら落とす側に回る。
 */
const VALIDATORS = new Map<string, (input: unknown) => unknown>([
  ["eras.json", parseEras],
  ["themes.geojson", parseThemes],
  ["episodes.json", parseEpisodes],
]);

/**
 * 検査の対象と見なす拡張子。
 * `LICENSE` のような添え物はデータではないので数えない。
 */
const DATA_EXTENSIONS = [".json", ".geojson"];

/**
 * 1 ファイルの検査結果。
 * 違反が無ければ null。
 */
function violationOf(
  fileName: string,
  parse: (input: unknown) => unknown,
): string | null {
  const file = path.join(DATA_DIR, fileName);
  const source = fs.readFileSync(file, "utf8");

  try {
    parse(JSON.parse(source));

    return null;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);

    return `${fileName}\n  ${detail.split("\n").join("\n  ")}`;
  }
}

/**
 * `data/` 直下にあって、検査する口を持たないデータファイルを拾う。
 *
 * ディレクトリへは降りない。
 * 入れ子のデータは `inbox/` だけで、あれは RSS 同期が排出する未割当スタブの置き場であり、形が決まるのは #27 である。
 */
function unvalidatedFiles(): string[] {
  return fs
    .readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => DATA_EXTENSIONS.some((ext) => name.endsWith(ext)))
    .filter((name) => !VALIDATORS.has(name))
    .sort();
}

/**
 * CLI の本体。
 * 違反を標準エラーへ書き、件数を終了コードへ畳む。
 */
function main(): number {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`${DATA_DIR} が無い`);

    return 1;
  }

  const violations: string[] = [];
  const checked: string[] = [];
  const skipped: string[] = [];

  for (const [fileName, parse] of VALIDATORS) {
    if (!fs.existsSync(path.join(DATA_DIR, fileName))) {
      skipped.push(fileName);
      continue;
    }

    checked.push(fileName);
    const violation = violationOf(fileName, parse);

    if (violation !== null) {
      violations.push(violation);
    }
  }

  for (const fileName of unvalidatedFiles()) {
    violations.push(
      `${fileName}\n  このファイルを検査する口が VALIDATORS に無い`,
    );
  }

  for (const violation of violations) {
    console.error(violation);
  }

  const skippedNote =
    skipped.length === 0 ? "" : `（未生成で飛ばした: ${skipped.join(", ")}）`;

  console.error(
    violations.length === 0
      ? `Checked ${checked.length} files. No data violations.${skippedNote}`
      : `Checked ${checked.length} files. Found ${violations.length} data violations.${skippedNote}`,
  );

  return violations.length === 0 ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(main());
}
