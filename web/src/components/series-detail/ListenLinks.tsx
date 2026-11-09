/**
 * エピソード 1 回を、配信基盤ごとに別タブで開くリンクの並びを描く部品を置く。
 *
 * 開く URL は `listenUrlOf` が決め、この部品は `PLATFORMS` の順にリンクを描くだけにする。
 * Apple Podcasts の規定は、形と大きさの揃ったアイコンの並びの中でだけアイコン単体を認めるので、マークはどの基盤も同じ 32px の角丸の四角で描く。
 * 32px は、Spotify の四角の中のマークが規定の最小の 21px になる大きさである。
 */

import type { ComponentType } from "react";
import ApplePodcastsIcon from "@/components/icons/ApplePodcastsIcon";
import SpotifyIcon from "@/components/icons/SpotifyIcon";
import { listenUrlOf } from "@/lib/links/listen-url";
import type { Episode } from "@/lib/schema/episode";
import { PLATFORMS, type Platform } from "@/lib/schema/link";

/** 配信基盤ごとの、リンクの名前に使う基盤名。 */
const PLATFORM_NAMES: Record<Platform, string> = {
  spotify: "Spotify",
  "apple-podcasts": "Apple Podcasts",
};

/** 配信基盤ごとの、マークを描く部品。 */
const PLATFORM_ICONS: Record<
  Platform,
  ComponentType<{ className?: string }>
> = {
  spotify: SpotifyIcon,
  "apple-podcasts": ApplePodcastsIcon,
};

/** エピソード（`episode`）を配信基盤ごとに開くリンクを、横一列に描く。 */
export default function ListenLinks({
  episode,
}: {
  episode: Pick<Episode, "links">;
}) {
  return (
    <ul className="flex flex-none items-center">
      {PLATFORMS.map((platform) => {
        const Icon = PLATFORM_ICONS[platform];

        return (
          <li key={platform}>
            <a
              href={listenUrlOf(episode, platform)}
              title={`${PLATFORM_NAMES[platform]} で開く`}
              // 地図の選択状態を残すため、配信基盤のページは別タブで開く。
              // noopener は開いたページに window.opener を渡さず、noreferrer は配信基盤へ Referer ヘッダを送らない。
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-10 items-center justify-center rounded-md hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <Icon className="size-8" />
              {/* マークは aria-hidden なので、基盤名と別タブで開くことをスクリーンリーダーには文字で伝える。 */}
              <span className="sr-only">
                {PLATFORM_NAMES[platform]}（新しいタブで開く）
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
