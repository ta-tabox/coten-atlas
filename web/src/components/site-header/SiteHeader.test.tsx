/**
 * 帯に載る文言とリンクの先を固定する。
 * 幅による一文の出し入れは CSS の担当なので、見るのは Playwright のスモーク（`tests/smoke/site-header.spec.ts`）である。
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SiteHeader from "@/components/site-header/SiteHeader";

describe("SiteHeader", () => {
  it("/about へのリンクを持つ", () => {
    render(<SiteHeader />);

    expect(
      screen.getByRole("link", { name: "このサイトについて" }),
    ).toHaveAttribute("href", "/about");
  });

  it("番組公式へのリンクを持つ", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "番組公式" })).toHaveAttribute(
      "href",
      "https://coten.co.jp/services/cotenradio/",
    );
  });

  it("サイト名を見出しに、非公式の副題をそのすぐ下に出す", () => {
    render(<SiteHeader />);

    const heading = screen.getByRole("heading", { name: "COTEN RADIO MAP" });

    expect(heading.nextElementSibling).toHaveTextContent(
      "AN UNOFFICIAL FAN ATLAS",
    );
  });

  it("何のサイトかの一文を出す", () => {
    render(<SiteHeader />);

    expect(
      screen.getByText(
        "歴史を語るポッドキャスト「コテンラジオ」のシリーズを、世界地図と年表の上に並べたサイト",
      ),
    ).toBeInTheDocument();
  });
});
