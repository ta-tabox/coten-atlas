/**
 * MapLibre 本体は jsdom で描画できないので、`react-map-gl/maplibre` の `Source` と `Layer` をモックに差し替える。
 * 検証するのは現在窓から組んだレイヤの定義を `Layer` へ渡すことであって、地図の描画ではない。
 *
 * 現在窓から濃さの式を組む規則そのものは `@/lib/map/series-layer.test.ts` が検証する。
 */

import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import type { LayerProps } from "react-map-gl/maplibre";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SeriesLayers from "@/components/SeriesLayers";
import type { CurrentWindow } from "@/lib/era/window";
import type { MapLocusCollection } from "@/lib/map/loci";
import { seriesCircleLayerIn } from "@/lib/map/series-layer";

const layer = vi.hoisted(() => vi.fn<(props: LayerProps) => null>(() => null));

vi.mock("react-map-gl/maplibre", () => ({
  Source: ({ children }: { children: ReactNode }) => children,
  Layer: layer,
}));

/**
 * スパルタの代表点 1 件。
 * 年は紀元前 900 年から紀元前 200 年まで。
 */
const LOCI: MapLocusCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [22.43, 37.08] },
      properties: {
        id: "sparta-city",
        seriesId: "sparta",
        kind: "place",
        timeStart: -900,
        timeEnd: -200,
      },
    },
  ],
};

/** スパルタの年に収まる現在窓。 */
const WINDOW_INSIDE: CurrentWindow = { start: -500, end: -300 };

/** スパルタの終わりの年を跨ぐ現在窓。 */
const WINDOW_ACROSS_END: CurrentWindow = { start: -250, end: -150 };

/** 直近のレンダリングで Layer が受け取った props を返す。 */
function lastLayerProps(): LayerProps {
  const [props] = layer.mock.calls[layer.mock.calls.length - 1];

  return props;
}

describe("SeriesLayers", () => {
  beforeEach(() => {
    layer.mockClear();
  });

  it("現在窓から組んだ円のレイヤを Layer へ渡す", () => {
    render(<SeriesLayers loci={LOCI} currentWindow={WINDOW_INSIDE} />);

    expect(lastLayerProps()).toEqual(seriesCircleLayerIn(WINDOW_INSIDE, LOCI));
  });

  it("現在窓が動くと、Layer へ渡す circle-opacity が変わる", () => {
    const { rerender } = render(
      <SeriesLayers loci={LOCI} currentWindow={WINDOW_INSIDE} />,
    );
    const before = seriesCircleLayerIn(WINDOW_INSIDE, LOCI).paint?.[
      "circle-opacity"
    ];

    rerender(<SeriesLayers loci={LOCI} currentWindow={WINDOW_ACROSS_END} />);

    const after = seriesCircleLayerIn(WINDOW_ACROSS_END, LOCI).paint?.[
      "circle-opacity"
    ];

    expect(after).not.toEqual(before);
    expect(lastLayerProps()).toMatchObject({
      paint: { "circle-opacity": after },
    });
  });
});
