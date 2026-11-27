/**
 * 左へずらすと示す、二重の山形のアイコンを置く。
 *
 * 線で描くので、太さは stroke-width が持つ。
 * 大きさは className で外から与える。
 * 色は currentColor がボタンの文字色から継ぐので、ここでは決めない。
 */

/**
 * 左へずらすと示す、二重の山形のアイコンを置く。
 * `aria-hidden` で隠すので、ボタンの名前は呼ぶ側が文字で渡す。
 */
export default function ChevronsLeftIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="11 17 6 12 11 7" />
        <polyline points="18 17 13 12 18 7" />
      </g>
    </svg>
  );
}
