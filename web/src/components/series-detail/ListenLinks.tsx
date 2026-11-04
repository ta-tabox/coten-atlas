/**
 * エピソード 1 回を、配信基盤ごとに別タブで開くリンクの並びを描く部品を置く。
 *
 * 開く URL は `listenUrlOf` が決め、この部品は `PLATFORMS` の順にリンクを描くだけにする。
 * マークは 3 基盤とも黒の単色で描く。
 * Apple Podcasts の規定は、形と大きさの揃ったアイコンの並びの中でだけアイコン単体を認めるので、色を基盤ごとに変えて並びを崩さない。
 * マークは 24px、リンクは 36px 四方にして、Spotify の最小 21px と、マークの高さの半分の余白を満たす。
 */

import PlatformIcon from "@/components/icons/PlatformIcon";
import { listenUrlOf } from "@/lib/links/listen-url";
import type { Episode } from "@/lib/schema/episode";
import { PLATFORMS, type Platform } from "@/lib/schema/link";

/** 配信基盤ごとの、リンクの名前に使う基盤名。 */
const PLATFORM_NAMES: Record<Platform, string> = {
  spotify: "Spotify",
  "apple-podcasts": "Apple Podcasts",
  youtube: "YouTube",
};

/** エピソード（`episode`）を配信基盤ごとに開くリンクを、横一列に描く。 */
export default function ListenLinks({
  episode,
}: {
  episode: Pick<Episode, "links">;
}) {
  return (
    <ul className="flex flex-none items-center">
      {PLATFORMS.map((platform) => (
        <li key={platform}>
          <a
            href={listenUrlOf(episode, platform)}
            title={`${PLATFORM_NAMES[platform]} で開く`}
            // 地図の選択状態を残すため、配信基盤のページは別タブで開く。
            // noopener は開いたページに window.opener を渡さず、noreferrer は配信基盤へ Referer ヘッダを送らない。
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-9 items-center justify-center rounded-md text-black hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <PlatformIcon platform={platform} className="size-6" />
            {/* PlatformIcon は aria-hidden なので、基盤名と別タブで開くことをスクリーンリーダーには文字で伝える。 */}
            <span className="sr-only">
              {PLATFORM_NAMES[platform]}（新しいタブで開く）
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
