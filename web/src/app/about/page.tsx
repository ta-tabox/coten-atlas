/**
 * 出典表記とライセンスの全文を置くページ。
 * 番組の権利がどこにあり、このリポジトリのライセンスがどこまで及ぶかを、公開と同時に読める場所へ集める。
 *
 * 文面は README の「出典と引用の範囲」「ライセンス」と同じことを言う。
 * 片方だけ直すと二つの表記が食い違うので、変えるときは両方を変える。
 *
 * 全文を持つのはこの 1 枚だけにする。
 * 二箇所へ置くと、更新のたびに食い違う。
 */

import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

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
            <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 3h7v7M21 3l-9 9M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"
              />
            </svg>
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
            <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
            ta-tabox/coten-atlas
          </a>
        </p>
      </section>
    </main>
  );
}
