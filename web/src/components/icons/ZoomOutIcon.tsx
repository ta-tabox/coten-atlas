/**
 * 表示を全体へ戻すと示す、マイナスの付いた虫眼鏡のアイコンを置く。
 *
 * 線で描くので、太さは stroke-width が持つ。
 * 大きさは className で外から与える。
 * 色は currentColor がボタンの文字色から継ぐので、ここでは決めない。
 */

/**
 * 表示を全体へ戻すと示す、マイナスの付いた虫眼鏡のアイコンを置く。
 * `aria-hidden` で隠すので、ボタンの名前は呼ぶ側が文字で渡す。
 */
export default function ZoomOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35M8 11h6" />
      </g>
    </svg>
  );
}
