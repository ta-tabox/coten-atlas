/**
 * 一意であるべき値の重複を拾う。
 * 鍵の重複を落とす検査が `schema/` に 4 つあり、どれも同じ数え方をする。
 *
 * 比較は `Set` と同じ同値性なので、扱えるのはプリミティブ型（文字列・数値など）だけである。
 * オブジェクトを渡すと、中身が同じでも参照が違えば別物として数える。
 */

/**
 * 同じ値を二度以上使っている要素を、渡された順のまま拾う。
 * 重複が無ければ空。
 */
export function duplicatesOf<T>(values: readonly T[]): T[] {
  const seen = new Set<T>();

  return values.filter((value) => {
    const isRepeat = seen.has(value);
    seen.add(value);

    return isRepeat;
  });
}
