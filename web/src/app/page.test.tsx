/**
 * MapLibre は WebGL で描くので、jsdom には地図を描画する手立てが無い。
 * ここが見るのは MapCanvas を置いたかどうかまでで、地図が出ているかは実機の目視が持つ（HARNESS.md「1. 検証の層構造」）。
 *
 * `data/` の読み込み口も差し替える。
 * ここが見るのは配線であって現物ではなく、現物へ届くかは `src/lib/data-dir.test.ts` が持つ。
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Page from "@/app/page";

vi.mock("@/components/MapCanvas", () => ({
  default: () => <div data-testid="map-canvas" />,
}));

vi.mock("@/lib/data-dir", () => ({
  loadSeries: () => [],
  loadLoci: () => ({ type: "FeatureCollection", features: [] }),
}));

describe("Page", () => {
  it("MapCanvas を置く", () => {
    render(<Page />);

    expect(screen.getByTestId("map-canvas")).toBeInTheDocument();
  });
});
