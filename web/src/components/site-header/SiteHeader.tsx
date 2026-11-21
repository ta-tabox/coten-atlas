/**
 * 画面上端のヘッダーを置く。
 * サイト名と非公式の副題の表題・番組公式と `/about` へのリンクを載せ、出典表記の全文は持たず `/about` が持つ。
 *
 * 副題 `AN UNOFFICIAL FAN ATLAS` を、どの幅でも名前と対で出す。
 * 番組名を含む名前は番組公式のサービスと取り違えられうるので、副題を省くと非公式であることが画面から消える。
 * 名前・副題・二つのリンクは、狭い幅でも省かず一行に収める。
 * 360px の幅に収めるため、`sm` 未満では名前を小さくし、外部リンクの矢印を隠す。
 *
 * 高さは `--spacing-header` で、ヘッダーの下へ寄せる部品が同じトークンを参照する。
 */

import Link from "next/link";
import ExternalLinkIcon from "@/components/icons/ExternalLinkIcon";
import { OFFICIAL_SITE_URL } from "@/lib/links/official-url";
import { SITE_TITLE } from "@/lib/site/title";

/** ヘッダーを描く。 */
export default function SiteHeader() {
  return (
    <header
      data-site-header
      className="flex h-header items-center justify-between gap-2 border-b border-rule bg-paper px-3 pt-2 font-body text-ink sm:px-5"
    >
      <div className="flex-none">
        <h1 className="font-heading text-base leading-tight font-bold tracking-normal text-heading sm:text-lg sm:tracking-wide">
          <Link
            href="/"
            className="transition-opacity duration-300 hover:opacity-70"
          >
            {SITE_TITLE.name}
          </Link>
        </h1>
        <p className="text-[0.5625rem] leading-tight tracking-[0.12em] text-ink-muted">
          {SITE_TITLE.subtitle}
        </p>
      </div>

      <nav className="flex flex-none items-center gap-2 text-xs sm:gap-3 sm:text-sm">
        <a
          href={OFFICIAL_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="header-link inline-flex items-center gap-1 whitespace-nowrap"
        >
          番組公式
          <ExternalLinkIcon className="hidden size-3 sm:block" />
        </a>
        <Link
          href="/about"
          className="header-link inline-flex items-center gap-1 whitespace-nowrap"
        >
          このサイトについて
        </Link>
      </nav>
    </header>
  );
}
