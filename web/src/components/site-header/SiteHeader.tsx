/**
 * 画面上端の帯を置く。
 * サイト名と非公式の副題の表題・何のサイトかの一文・番組公式と `/about` へのリンクを載せ、出典表記の全文は持たず `/about` が持つ。
 *
 * 副題 `AN UNOFFICIAL FAN ATLAS` を、どの幅でも名前と対で出す。
 * 番組名を含む名前は番組公式のサービスと取り違えられうるので、副題を省くと非公式であることが画面から消える。
 * 狭い幅で省いてよいのは一文だけで、名前・副題・二つのリンクは一行に収める。
 *
 * 高さは `--spacing-band` で、帯の下へ寄せる部品が同じトークンを参照する。
 */

import Link from "next/link";
import ExternalLinkIcon from "@/components/icons/ExternalLinkIcon";
import { OFFICIAL_SITE_URL } from "@/lib/links/official-url";

/** 帯を描く。 */
export default function SiteHeader() {
  return (
    <header
      data-site-header
      className="flex h-band items-center justify-between gap-3 border-b border-rule bg-paper px-3 font-body text-ink sm:px-5"
    >
      <div className="flex-none">
        <h1 className="font-heading text-base leading-tight font-bold tracking-wide text-heading">
          COTEN RADIO MAP
        </h1>
        <p className="text-[0.5625rem] leading-tight tracking-[0.12em] text-ink-muted">
          AN UNOFFICIAL FAN ATLAS
        </p>
      </div>

      <p className="hidden min-w-0 text-[0.8rem] lg:block">
        歴史を語るポッドキャスト「コテンラジオ」のシリーズを、世界地図と年表の上に並べたサイト
      </p>

      <nav className="flex flex-none items-center gap-3 text-xs sm:text-sm">
        <a
          href={OFFICIAL_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 whitespace-nowrap underline underline-offset-2 hover:text-selected"
        >
          番組公式
          <ExternalLinkIcon className="size-3" />
        </a>
        <Link
          href="/about"
          className="inline-flex items-center gap-1 whitespace-nowrap underline underline-offset-2 hover:text-selected"
        >
          このサイトについて
        </Link>
      </nav>
    </header>
  );
}
