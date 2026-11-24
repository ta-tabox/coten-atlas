/**
 * 押した位置で重なる代表点から、選び分ける候補のシリーズを決める関数を置く。
 * 画面座標への変換と、点の取得は持たず、`@/components/map/MapCanvas` が持つ。
 */

/** 画面上の位置（px）。 */
export type ScreenPoint = { x: number; y: number };

/** 判定の範囲に入った代表点 1 件の、画面上の位置とシリーズ。 */
export type CandidatePoint = ScreenPoint & { seriesId: string };

/**
 * 候補に入れる点を、基準の点からの中心間の距離（px）で区切る値。
 * 円の直径（半径 6px の 2 倍）で、これより近い点は円が重なって指でも狙い分けられない。
 */
export const CANDIDATE_DISTANCE_PX = 12;

/** 2 点の画面上の距離（px）を返す。 */
function distanceBetween(a: ScreenPoint, b: ScreenPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * 押した位置（`pressed`）に最も近い点を基準に、中心間が `CANDIDATE_DISTANCE_PX` 以内の点のシリーズを、押した位置に近い順で返す。
 * `points` が空なら空配列を返す。
 *
 * 同じシリーズの点が複数あるときは、押した位置に最も近い点だけを数え、`seriesId` を重複させない。
 * 判定の範囲を広げた入力（タッチ）で、遠くの点が候補に混ざるのを止めるために、基準の点からの距離で区切る。
 */
export function candidateSeriesIdsOf(
  pressed: ScreenPoint,
  points: readonly CandidatePoint[],
): string[] {
  const byDistance = points
    .map((point) => ({ point, distance: distanceBetween(pressed, point) }))
    .sort((a, b) => a.distance - b.distance);

  if (byDistance.length === 0) {
    return [];
  }

  const base = byDistance[0].point;
  const near = byDistance.filter(
    ({ point }) => distanceBetween(base, point) <= CANDIDATE_DISTANCE_PX,
  );

  return [...new Set(near.map(({ point }) => point.seriesId))];
}
