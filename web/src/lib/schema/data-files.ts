/**
 * `data/` のどのファイルを、どのスキーマで検査するかの対応。
 *
 * 検査を回すのは `tests/data.test.ts` で、こちらはファイルを読まない。
 * 対応表と「検査されないファイルはどれか」の判定だけを持つので、fs を触らずに単体で試せる。
 *
 * ここに無いデータファイルが `data/` へ増えたら、それは検査の網から漏れている。
 * 黙って見送ると「全部検査した」と「見つけられなかった」が同じ緑になるので、漏れを名指しで返す。
 */

import { parseEpisodes } from "@/lib/schema/episode";
import { parseEras } from "@/lib/schema/era";
import { parseLoci } from "@/lib/schema/locus";
import { parseSeries } from "@/lib/schema/series";

/**
 * ファイル名と、それを検査する入口の対応。
 * `episodes.json` は同期が初めて書くので、それまでは実在しない。
 */
export const DATA_VALIDATORS = new Map<string, (input: unknown) => unknown>([
  ["eras.json", parseEras],
  ["series.json", parseSeries],
  ["loci.geojson", parseLoci],
  ["episodes.json", parseEpisodes],
]);

/**
 * 検査の対象と見なす拡張子。
 * `LICENSE` のような添え物はデータではないので数えない。
 */
const DATA_EXTENSIONS = [".json", ".geojson"];

/**
 * 渡したファイル名のうち、検査する口を持たないデータファイルを返す。
 * 対応表に載っているものと、データでない添え物は落とす。
 */
export function unvalidatedNames(fileNames: readonly string[]): string[] {
  return fileNames
    .filter((name) => DATA_EXTENSIONS.some((ext) => name.endsWith(ext)))
    .filter((name) => !DATA_VALIDATORS.has(name))
    .sort();
}
