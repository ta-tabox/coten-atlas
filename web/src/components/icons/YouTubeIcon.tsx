/**
 * YouTube のマークを、色版のアイコン（赤地に白い三角）で描く部品を置く。
 *
 * 形は Simple Icons 16.34.0（CC0）が配る 24x24 のパスで、YouTube の規定が改変を禁じているので d 属性は編集しない。
 * 赤は brand.youtube が配る色版のアイコンの画像から読んだ値で、YouTube の規定は色版の三角を常に白にするよう求めるので、三角は背景の色に関わらず白で塗る。
 * 大きさは className で外から与える。
 *
 * @see https://brand.youtube/ 利用の規定（色版・最小の大きさ・余白・改変の禁止）。
 * @see https://www.youtube.com/howyoutubeworks/resources/brand-resources/ マークのリンク先をチャンネルに限る規定（旧ページ）。
 * @see https://developers.google.com/youtube/terms/branding-guidelines API の利用者に当たる規定（マークのリンク先は YouTube のコンテンツ）。
 */

/** YouTube のマークを描く。 */
export default function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#FF0033"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      />
      <path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
