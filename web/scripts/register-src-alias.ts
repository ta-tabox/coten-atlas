/**
 * `@/` で始まる import を `web/src/` の下へ解決できるようにする。
 *
 * `tsconfig.json` の `paths` は型検査にしか効かず、Node の実行時の解決には届かない。
 * `src/` の中は互いを `@/lib/...` で指しているので、この別名を教えないとスクリプトからアプリのソースを呼べない。
 *
 * 拡張子を補うのも同じ理由である。
 * `@/lib/duplicates` のように拡張子を持たない import を Node はそのままファイル名として探しにいく。
 *
 * 使うのは `node --import` の引数としてで、直接呼ぶ関数は持たない。
 * scripts 自身がアプリのソースを指すときは相対パスで書く（`../src/...`）ので、ここが要るのはソース側の書き方のためだけである。
 */

import fs from "node:fs";
import module from "node:module";
import { fileURLToPath } from "node:url";

/** `@/` が指す先。 */
const SRC_DIR = new URL("../src/", import.meta.url);

/** import に拡張子が無いときに試す順。 */
const SOURCE_EXTENSIONS = [".ts", ".tsx"];

/**
 * 実在するファイルを指す URL を返す。
 * どれも実在しなければ、元の URL のまま Node に報せさせる。
 */
function resolveExtension(target: URL): URL {
  if (fs.existsSync(fileURLToPath(target))) {
    return target;
  }

  for (const extension of SOURCE_EXTENSIONS) {
    const candidate = new URL(target.href + extension);

    if (fs.existsSync(fileURLToPath(candidate))) {
      return candidate;
    }
  }

  return target;
}

module.registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith("@/")) {
      return nextResolve(specifier, context);
    }

    const target = resolveExtension(new URL(specifier.slice(2), SRC_DIR));

    return nextResolve(target.href, context);
  },
});
