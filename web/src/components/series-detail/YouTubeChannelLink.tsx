/**
 * 番組の YouTube 公式チャンネルを別タブで開くリンクを描く部品を置く。
 *
 * YouTube の規定は、マークをリンクにしてよい行き先を YouTube のチャンネルに限るので、回ごとの動画でなくチャンネルを 1 つだけ開く。
 * 規定はチャンネルをマークとハンドル名の並びで示すよう求めるので、文字はハンドル名（`@cotenradio`）にする。
 */

import YouTubeIcon from "@/components/icons/YouTubeIcon";

/** 番組の YouTube 公式チャンネルの URL。 */
const CHANNEL_URL = "https://www.youtube.com/@cotenradio";

/** 番組の YouTube 公式チャンネルを開くリンクを描く。 */
export default function YouTubeChannelLink() {
  return (
    <a
      href={CHANNEL_URL}
      // 地図の選択状態を残すため、YouTube は別タブで開く。
      // noopener は開いたページに window.opener を渡さず、noreferrer は YouTube へ Referer ヘッダを送らない。
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[0.8rem] text-zinc-700 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
    >
      <YouTubeIcon className="h-5 w-5 flex-none" />
      <span>@cotenradio</span>
      <span className="sr-only">
        （YouTube の公式チャンネルを新しいタブで開く）
      </span>
    </a>
  );
}
