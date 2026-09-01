/**
 * JSON ファイルの読み書き。
 * どちらも、素の `JSON.parse` や `fs.writeFileSync` では黙って通ってしまう壊れ方を潰すためにある。
 *
 * 読みは、構文が壊れていたときにどのファイルかを添えて投げ直す。
 * `JSON.parse` の SyntaxError は位置しか言わないので、同じ形のファイルが複数あると直す先が分からない。
 *
 * 書きは、一時ファイルへ書いてから rename する。
 * 直接書くと、途中で落ちたときに中途半端な JSON がその名前で残る。
 *
 * データの中身は見ない。
 * どのファイルがどのスキーマに従うかは呼ぶ側が決める。
 */

import fs from "node:fs";
import path from "node:path";

/**
 * ファイルを読んで JSON として解釈する。
 * 構文が壊れていれば、どのファイルかを添えた例外を投げる。
 *
 * 中身の形は見ないので、返り値の絞り込みは呼ぶ側が行う。
 */
export function readJsonFile(file: string): unknown {
  const text = fs.readFileSync(file, "utf8");

  try {
    return JSON.parse(text);
  } catch (cause) {
    throw new Error(`JSON として読めない: ${file}`, { cause });
  }
}

/**
 * JSON を整形し、末尾の改行を付けて書く。
 * 生成物も人間が読む差分に出るので、1 行へ詰めない。
 *
 * 書き込みの途中で落ちても壊れたファイルが残らないよう、一時ファイルを経由する。
 * rename が atomic なのは同じファイルシステムの上だけなので、一時ファイルは書き込み先と同じディレクトリへ置く。
 */
export function writeJsonFile(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const temporary = `${file}.tmp`;

  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temporary, file);
}
