/**
 * ADR-0008 の4点と ADR-0011 のライセンスの範囲が、文言としてページに載っているかを固定する。
 * どの語を落とすと表記が成り立たなくなるかを、観点ごとに 1 本ずつ置く。
 *
 * 見るのは文言だけで、`out/about/index.html` として書き出されるかは L4 の `tests/smoke/about.spec.ts` が見る。
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutPage from "@/app/about/page";

/**
 * 描画した /about の全文。
 * 一つの文が複数の要素へ分かれても拾えるように textContent を見る。
 */
function renderedText(): string {
  const { container } = render(<AboutPage />);

  return container.textContent ?? "";
}

describe("出典と引用の範囲", () => {
  it("非公式のファンサイトである旨を書く", () => {
    expect(renderedText()).toContain("非公式のファンサイト");
  });

  it("番組の権利が制作元へ帰属する旨を書く", () => {
    expect(renderedText()).toContain("権利は制作元の COTEN に帰属する");
  });

  it("地図と時代区分への整理が独自である旨を書く", () => {
    expect(renderedText()).toContain(
      "独自に行ったものであって、番組の見解ではない",
    );
  });

  it("番組公式へ導線を持つ", () => {
    render(<AboutPage />);

    expect(screen.getByRole("link", { name: /COTEN RADIO/ })).toHaveAttribute(
      "href",
      "https://coten.co.jp/services/cotenradio/",
    );
  });
});

describe("ライセンス", () => {
  it("コードは MIT と書く", () => {
    expect(renderedText()).toContain("コードは MIT");
  });

  it("キュレーション層は CC BY 4.0 と書く", () => {
    expect(renderedText()).toContain(
      "キュレーション層（series.geojson・eras.json）は CC BY 4.0",
    );
  });

  it("episodes.json はライセンスが及ばないと書く", () => {
    expect(renderedText()).toContain(
      "episodes.json は番組の RSS 由来なので、このリポジトリのライセンスは及ばない",
    );
  });

  it("番組由来の要素は範囲外だと書く", () => {
    expect(renderedText()).toContain(
      "シリーズ名・エピソードタイトル・配信リンクも同じく範囲外",
    );
  });
});
