/**
 * トップページが描画に成功することを固定する。
 * 見出しが出ることだけを見て、レイアウトや経路の設定は見ない。
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "@/app/page";

describe("Page", () => {
  it("見出しを描画する", () => {
    render(<Page />);

    expect(
      screen.getByRole("heading", { name: "coten-atlas" }),
    ).toBeInTheDocument();
  });
});
