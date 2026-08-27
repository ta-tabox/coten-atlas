/**
 * MapCanvas が地図コンポーネントへ渡す値を固定する。
 *
 * MapLibre 本体は jsdom で描画できないので、地図コンポーネントはモックへ差し替える。
 * ここで見るのは配線であって地図ではない。
 */

import { render } from "@testing-library/react";
import type { MapProps } from "react-map-gl/maplibre";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MapCanvas from "@/components/MapCanvas";
import {
  BASEMAP_STYLE_URL,
  INITIAL_VIEW_STATE,
  MAP_WORKER_URL,
} from "@/lib/map-config";

const map = vi.hoisted(() => vi.fn<(props: MapProps) => null>(() => null));

vi.mock("react-map-gl/maplibre", () => ({ default: map }));

describe("MapCanvas", () => {
  beforeEach(() => {
    map.mockClear();
  });

  it("OpenFreeMap のスタイルと初期表示位置を渡す", () => {
    render(<MapCanvas />);

    const [props] = map.mock.calls[0];

    expect(props.mapStyle).toBe(BASEMAP_STYLE_URL);
    expect(props.initialViewState).toEqual(INITIAL_VIEW_STATE);
  });

  it("worker の在り処を渡す", () => {
    render(<MapCanvas />);

    const [props] = map.mock.calls[0];

    expect(props.workerUrl).toBe(MAP_WORKER_URL);
  });

  it("attributionControl を無効にしない", () => {
    render(<MapCanvas />);

    const [props] = map.mock.calls[0];

    expect(props.attributionControl).not.toBe(false);
  });
});
