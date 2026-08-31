/**
 * 出典表記とライセンスの全文を置くページ。
 * 番組の権利がどこにあり、このリポジトリのライセンスがどこまで及ぶかを、公開と同時に読める場所へ集める。
 *
 * 同じことを言う文書が README の「出典と引用の範囲」「ライセンス」にある。
 * 読み手が違う（あちらはリポジトリを開いた人、ここはサイトを見た人）ので二つ在るが、片方だけ直すと食い違うため、変えるときは両方を変える。
 *
 * 画面の側で全文を持つのはこの 1 枚だけにする。
 * フッタが担うのは公式への導線とこのページへの到達で、表記の全文は持たない（ADR-0011「コードは MIT、データは CC BY 4.0」の帰結）。
 *
 * 見出しの `font-bold` とリンクの色・下線は飾りではない。
 * Tailwind の preflight が `h1`〜`h6` の font-size / font-weight と `a` の color / text-decoration を inherit へ倒すので、書かないと素の文と同じ見た目になる。
 */

import type { Metadata } from "next";
import Link from "next/link";
import ExternalLinkIcon from "@/components/icons/ExternalLinkIcon";
import GitHubIcon from "@/components/icons/GitHubIcon";

export const metadata: Metadata = {
  title: "このサイトについて | coten-atlas",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[38rem] px-6 pt-12 pb-20 font-sans leading-[1.85] text-zinc-900">
      <nav className="mb-8 text-sm">
        <Link
          href="/"
          className="text-zinc-500 hover:text-zinc-900 hover:underline"
        >
          ← 地図へ戻る
        </Link>
      </nav>

      <header className="border-b border-zinc-200 pb-7">
        <h1 className="mb-2.5 text-[1.6rem] font-bold tracking-[0.01em]">
          このサイトについて
        </h1>

        <p className="text-[0.95rem] text-zinc-500">
          コテンラジオ（COTEN
          RADIO）の各シリーズが「いつ・どこの話か」を、世界地図と時系列の上へ置いて一望するサイト。
        </p>
      </header>

      <section className="mt-11 border-l-2 border-zinc-200 pl-5">
        <h2 className="mb-3.5 text-[1.05rem] font-bold tracking-[0.04em]">
          出典と引用の範囲
        </h2>

        <p className="mt-3.5">
          番組公式とは関係の無い、非公式のファンサイトである。
        </p>

        <p className="mt-3.5">
          番組そのものの権利は制作元の COTEN に帰属する。
        </p>

        <p className="mt-3.5">
          地図と時代区分の上への整理はこのプロジェクトが独自に行ったものであって、番組の見解ではない。
        </p>

        <p className="mt-3.5">
          載せるのはシリーズ名とエピソードタイトルだけで、番組の説明文・ロゴ・カバーアート・出演者画像は使わない。
        </p>

        <p className="mt-6 flex items-baseline gap-3 rounded-md border border-zinc-200 px-3.5 py-2.5 text-[0.95rem] max-[30rem]:flex-col max-[30rem]:items-start max-[30rem]:gap-1.5">
          <span className="flex-none text-[0.8rem] tracking-[0.04em] text-zinc-500">
            番組公式
          </span>
          <a
            href="https://coten.co.jp/services/cotenradio/"
            className="inline-flex items-center gap-1.5 text-blue-700 underline underline-offset-2"
          >
            <ExternalLinkIcon className="mt-[0.4em] size-[1.05em] flex-none self-start" />
            COTEN RADIO（制作元 COTEN）
          </a>
        </p>
      </section>

      <section className="mt-11 border-l-2 border-zinc-200 pl-5">
        <h2 className="mb-3.5 text-[1.05rem] font-bold tracking-[0.04em]">
          ライセンス
        </h2>

        <p className="mt-3.5">コードは MIT。</p>

        <p className="mt-3.5">
          <code className="font-mono text-[0.85em]">data/</code>{" "}
          のキュレーション層（
          <code className="font-mono text-[0.85em]">series.geojson</code>・
          <code className="font-mono text-[0.85em]">eras.json</code>）は CC BY
          4.0 で、再利用には帰属表示が要る。
        </p>

        <p className="mt-3.5">
          同じ <code className="font-mono text-[0.85em]">data/</code> でも{" "}
          <code className="font-mono text-[0.85em]">episodes.json</code>{" "}
          は番組の RSS 由来なので、このリポジトリのライセンスは及ばない。
        </p>

        <p className="mt-3.5">
          シリーズ名・エピソードタイトル・配信リンクも同じく範囲外で、権利は上の「出典と引用の範囲」のとおり制作元に帰属する。
        </p>

        <p className="mt-6 flex items-baseline gap-3 rounded-md border border-zinc-200 px-3.5 py-2.5 text-[0.95rem] max-[30rem]:flex-col max-[30rem]:items-start max-[30rem]:gap-1.5">
          <span className="flex-none text-[0.8rem] tracking-[0.04em] text-zinc-500">
            リポジトリ
          </span>
          <a
            href="https://github.com/ta-tabox/coten-atlas"
            className="inline-flex items-center gap-1.5 text-blue-700 underline underline-offset-2"
          >
            <GitHubIcon className="mt-[0.4em] size-[1.05em] flex-none self-start" />
            ta-tabox/coten-atlas
          </a>
        </p>
      </section>
    </main>
  );
}
