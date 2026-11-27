/**
 * 右へずらすと示す、二重の山形のアイコンを置く。
 *
 * 線で描くので、太さは stroke-width が持つ。
 * 大きさは className で外から与える。
 * 色は currentColor がボタンの文字色から継ぐので、ここでは決めない。
 */

/**
 * 右へずらすと示す、二重の山形のアイコンを置く。
 * `aria-hidden` で隠すので、ボタンの名前は呼ぶ側が文字で渡す。
 */
export default function ChevronsRightIcon({
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
        <polyline points="13 17 18 12 13 7" />
        <polyline points="6 17 11 12 6 7" />
      </g>
    </svg>
  );
}
