/**
 * 詳細カードの代表点の地名を文字で描く部品を置く。
 * 地名の取得と、行の並びと区切りは持たない。
 */

type SeriesPlaceProps = {
  name: string;
};

/** 代表点の事物の日本語の地名 `name` を、加工せずに描く。 */
export default function SeriesPlace({ name }: SeriesPlaceProps) {
  return <span>{name}</span>;
}
