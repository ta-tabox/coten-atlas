/**
 * 出典表記とライセンスの全文を置くページ。
 * 番組の権利がどこにあり、このリポジトリのライセンスがどこまで及ぶかを、公開と同時に読める場所へ集める。
 *
 * 同じことを言う文書が README の「出典と引用の範囲」「ライセンス」にある。
 * 読み手が違う（あちらはリポジトリを開いた人、ここはサイトを見た人）ので二つ在るが、片方だけ直すと食い違うため、変えるときは両方を変える。
 *
 * 画面の側で全文を持つのはこの 1 枚だけにする。
 * フッタが担うのは公式への導線とこのページへの到達で、表記の全文は持たない（ADR-0011「コードは MIT、データは CC BY 4.0」の帰結）。
 */

import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/app/about/page.module.css";
import ExternalLinkIcon from "@/components/icons/ExternalLinkIcon";
import GitHubIcon from "@/components/icons/GitHubIcon";

export const metadata: Metadata = {
  title: "このサイトについて | coten-atlas",
};

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.back}>
        <Link href="/">← 地図へ戻る</Link>
      </nav>

      <header className={styles.header}>
        <h1 className={styles.title}>このサイトについて</h1>

        <p className={styles.lead}>
          コテンラジオ（COTEN
          RADIO）の各シリーズが「いつ・どこの話か」を、世界地図と時系列の上へ置いて一望するサイト。
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.heading}>出典と引用の範囲</h2>

        <p className={styles.statement}>
          番組公式とは関係の無い、非公式のファンサイトである。
        </p>

        <p className={styles.statement}>
          番組そのものの権利は制作元の COTEN に帰属する。
        </p>

        <p className={styles.statement}>
          地図と時代区分の上への整理はこのプロジェクトが独自に行ったものであって、番組の見解ではない。
        </p>

        <p className={styles.statement}>
          載せるのはシリーズ名とエピソードタイトルだけで、番組の説明文・ロゴ・カバーアート・出演者画像は使わない。
        </p>

        <p className={styles.linkRow}>
          <span className={styles.linkLabel}>番組公式</span>
          <a href="https://coten.co.jp/services/cotenradio/">
            <ExternalLinkIcon className={styles.icon} />
            COTEN RADIO（制作元 COTEN）
          </a>
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>ライセンス</h2>

        <p className={styles.statement}>コードは MIT。</p>

        <p className={styles.statement}>
          <code>data/</code> のキュレーション層（<code>series.geojson</code>・
          <code>eras.json</code>）は CC BY 4.0 で、再利用には帰属表示が要る。
        </p>

        <p className={styles.statement}>
          同じ <code>data/</code> でも <code>episodes.json</code> は番組の RSS
          由来なので、このリポジトリのライセンスは及ばない。
        </p>

        <p className={styles.statement}>
          シリーズ名・エピソードタイトル・配信リンクも同じく範囲外で、権利は上の「出典と引用の範囲」のとおり制作元に帰属する。
        </p>

        <p className={styles.linkRow}>
          <span className={styles.linkLabel}>リポジトリ</span>
          <a href="https://github.com/ta-tabox/coten-atlas">
            <GitHubIcon className={styles.icon} />
            ta-tabox/coten-atlas
          </a>
        </p>
      </section>
    </main>
  );
}
