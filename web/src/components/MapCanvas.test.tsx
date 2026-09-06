/**
 * MapLibre 本体は jsdom で描画できないので、地図コンポーネントはモックへ差し替える。
 * ここで見るのは配線であって地図ではない。
 */

import { render } from "@testing-library/react";
import type { MapProps } from "react-map-gl/maplibre";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MapCanvas from "@/components/MapCanvas";
import SeriesLayers from "@/components/SeriesLayers";
import {
  BASEMAP_STYLE_URL,
  INITIAL_VIEW_STATE,
  MAP_WORKER_URL,
} from "@/lib/map-config";
import type { MapLocusCollection } from "@/lib/map-loci";

const map = vi.hoisted(() => vi.fn<(props: MapProps) => null>(() => null));

vi.mock("react-map-gl/maplibre", () => ({ default: map }));

/**
 * 地図へ渡す事物。
 * MapCanvas は中身を読まずに SeriesLayers へ渡すだけなので、空で足りる。
 */
const LOCI: MapLocusCollection = { type: "FeatureCollection", features: [] };

describe("MapCanvas", () => {
  beforeEach(() => {
    map.mockClear();
  });

  it("OpenFreeMap のスタイルと初期表示位置を渡す", () => {
    render(<MapCanvas loci={LOCI} />);

    const [props] = map.mock.calls[0];

    expect(props.mapStyle).toBe(BASEMAP_STYLE_URL);
    expect(props.initialViewState).toEqual(INITIAL_VIEW_STATE);
  });

  it("worker の在り処を渡す", () => {
    render(<MapCanvas loci={LOCI} />);

    const [props] = map.mock.calls[0];

    expect(props.workerUrl).toBe(MAP_WORKER_URL);
  });

  it("シリーズのレイヤへ事物を渡して子に置く", () => {
    render(<MapCanvas loci={LOCI} />);

    const [props] = map.mock.calls[0];

    expect(props.children).toMatchObject({
      type: SeriesLayers,
      props: { loci: LOCI },
    });
  });

  it("attributionControl を無効にしない", () => {
    render(<MapCanvas loci={LOCI} />);

    const [props] = map.mock.calls[0];

    expect(props.attributionControl).not.toBe(false);
  });
});
