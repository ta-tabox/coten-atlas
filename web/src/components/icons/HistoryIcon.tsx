/**
 * 時代の範囲を表す、反時計回りの矢印の付いた時計のアイコンを置く。
 *
 * 線で描くので、太さは stroke-width が持つ。
 * 大きさは className で外から与える。
 * 色は currentColor がボタンの文字色から継ぐので、ここでは決めない。
 */

/**
 * 時代の範囲を表す、反時計回りの矢印の付いた時計のアイコンを描く。
 * `aria-hidden` で隠すので、ボタンの名前は呼ぶ側が文字で渡す。
 */
export default function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M12 7v5l4 2"
      />
    </svg>
  );
}
