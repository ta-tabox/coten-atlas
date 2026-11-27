/**
 * 閉じると示す、× のアイコンを置く。
 *
 * 線で描くので、太さは stroke-width が持つ。
 * 大きさは className で外から与える。
 * 色は currentColor がボタンの文字色から継ぐので、ここでは決めない。
 */

/**
 * 閉じると示す、× のアイコンを描く。
 * `aria-hidden` で隠すので、ボタンの名前は呼ぶ側が文字で渡す。
 */
export default function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 6L6 18M6 6l12 12"
      />
    </svg>
  );
}
