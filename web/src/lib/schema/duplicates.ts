/**
 * 一意であるべき値の重複を拾う小さな道具。
 * 鍵の重複を落とす検査がこのディレクトリに 4 つあり、どれも同じ数え方をする。
 *
 * 比較は `Set` と同じ同値性なので、扱えるのは原始値だけである。
 * オブジェクトを渡すと、中身が同じでも別物として数える。
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
