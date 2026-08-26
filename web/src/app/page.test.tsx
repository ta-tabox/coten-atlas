/**
 * トップページがベースマップを置くことを固定する。
 *
 * MapLibre 本体は jsdom で描画できないので、MapCanvas はモックへ差し替える。
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Page from "@/app/page";

vi.mock("@/components/MapCanvas", () => ({
  default: () => <div data-testid="map-canvas" />,
}));

describe("Page", () => {
  it("ベースマップを描画する", () => {
    render(<Page />);

    expect(screen.getByTestId("map-canvas")).toBeInTheDocument();
  });
});
