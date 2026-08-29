/**
 * トップページがベースマップの層を置くことを固定する。
 *
 * MapLibre は WebGL で描くので、jsdom には地図を描画する手立てが無い。
 * ここが見るのは MapCanvas を置いたかどうかまでで、地図が出ているかは実機の目視が持つ（HARNESS.md「1. 検証の層構造」）。
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Page from "@/app/page";

vi.mock("@/components/MapCanvas", () => ({
  default: () => <div data-testid="map-canvas" />,
}));

describe("Page", () => {
  it("MapCanvas を置く", () => {
    render(<Page />);

    expect(screen.getByTestId("map-canvas")).toBeInTheDocument();
  });
});
