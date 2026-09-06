/**
 * 一意であるべき値の重複を拾う。
 * 鍵の重複を落とす検査が同じ階層に 5 本あり、どれも同じ数え方をする。
 *
 * 比較は `Set` と同じ同値性なので、扱えるのはプリミティブ型（文字列・数値など）だけである。
 * オブジェクトを渡すと、中身が同じでも参照が違えば別物として数える。
 */

/**
 * 二度以上使われている値を、重複と分かった順に返す。
 * 出現の数だけ返すと検査の報告が同じ指摘で埋まるので、同じ値は 1 回しか返さない。
 * 重複が無ければ空。
 */
export function duplicatesOf<T>(values: readonly T[]): T[] {
  const seen = new Set<T>();
  const duplicates = new Set<T>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }

    seen.add(value);
  }

  return [...duplicates];
}
