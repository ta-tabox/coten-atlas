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
      <p className={styles.back}>
        <Link href="/">← 地図へ戻る</Link>
      </p>

      <h1>このサイトについて</h1>

      <p>
        コテンラジオ（COTEN
        RADIO）の各シリーズが「いつ・どこの話か」を、世界地図と時系列の上へ置いて一望するサイト。
      </p>

      <h2>出典と引用の範囲</h2>

      <p>番組公式とは関係の無い、非公式のファンサイトである。</p>

      <p>番組そのものの権利は制作元の COTEN に帰属する。</p>

      <p>
        地図と時代区分の上への整理はこのプロジェクトが独自に行ったものであって、番組の見解ではない。
      </p>

      <p>
        載せるのはシリーズ名とエピソードタイトルだけで、番組の説明文・ロゴ・カバーアート・出演者画像は使わない。
      </p>

      <p>
        番組公式:{" "}
        <a href="https://coten.co.jp/services/cotenradio/">
          COTEN RADIO（制作元 COTEN）
        </a>
      </p>

      <h2>ライセンス</h2>

      <p>コードは MIT。</p>

      <p>
        <code>data/</code> のキュレーション層（<code>series.geojson</code>・
        <code>eras.json</code>）は CC BY 4.0 で、再利用には帰属表示が要る。
      </p>

      <p>
        同じ <code>data/</code> でも <code>episodes.json</code> は番組の RSS
        由来なので、このリポジトリのライセンスは及ばない。
      </p>

      <p>
        シリーズ名・エピソードタイトル・配信リンクも同じく範囲外で、権利は上の「出典と引用の範囲」のとおり制作元に帰属する。
      </p>
    </main>
  );
}
