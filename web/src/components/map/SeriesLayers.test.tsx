/**
 * MapLibre 本体は jsdom で描画できないので、`react-map-gl/maplibre` の `Source` と `Layer` をモックに差し替える。
 * 検証するのは現在窓と選択から組んだレイヤの定義を `Layer` へ渡すことであって、地図の描画ではない。
 *
 * 現在窓と選択からレイヤを組む規則そのものは `@/lib/map/series-layer.test.ts` が検証する。
 */

import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import type { LayerProps } from "react-map-gl/maplibre";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SeriesLayers from "@/components/map/SeriesLayers";
import type { CurrentWindow } from "@/lib/era/window";
import type { MapLocusCollection } from "@/lib/map/loci";
import {
  CONTEMPORARY_SERIES_RING_LAYER,
  contemporarySeriesRingLayerIn,
  SELECTED_SERIES_RING_LAYER,
  SERIES_CIRCLE_LAYER,
  selectedSeriesRingLayerIn,
  seriesCircleLayerIn,
} from "@/lib/map/series-layer";
import type { Series } from "@/lib/schema/series";

/** `react-map-gl/maplibre` の `Layer` と差し替えるモック関数で、受け取った props を記録して null を返す。 */
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
        timeStart: -900,
        timeEnd: -200,
      },
    },
  ],
};

/** `LOCI` の事物が指すスパルタのシリーズ。 */
const SPARTA: Series = {
  id: "sparta",
  title: "スパルタ",
  season: 1,
  anchor: "sparta-city",
  timeRange: { start: -900, end: -200 },
  summary: "",
  region: "ヨーロッパ",
  links: [],
  tags: ["古代ギリシア"],
};

/** スパルタの年に収まる現在窓。 */
const WINDOW_INSIDE: CurrentWindow = { start: -500, end: -300 };

/** スパルタの終わりの年を跨ぐ現在窓。 */
const WINDOW_ACROSS_END: CurrentWindow = { start: -250, end: -150 };

/**
 * 直近のレンダリングで、id が `id` の Layer が受け取った props を返す。
 * 一度も受け取っていなければ throw する。
 */
function lastLayerPropsOf(id: string): LayerProps {
  const calls = layer.mock.calls.filter(([props]) => props.id === id);

  if (calls.length === 0) {
    throw new Error(`id が ${id} の Layer が描かれていない`);
  }

  const [props] = calls[calls.length - 1];

  return props;
}

describe("SeriesLayers", () => {
  beforeEach(() => {
    layer.mockClear();
  });

  it("現在窓から組んだ円のレイヤを Layer へ渡す", () => {
    render(
      <SeriesLayers
        loci={LOCI}
        currentWindow={WINDOW_INSIDE}
        selectedSeries={null}
      />,
    );

    expect(lastLayerPropsOf(SERIES_CIRCLE_LAYER.id)).toEqual(
      seriesCircleLayerIn(WINDOW_INSIDE, LOCI),
    );
  });

  it("現在窓が動くと、Layer へ渡す circle-opacity が変わる", () => {
    const { rerender } = render(
      <SeriesLayers
        loci={LOCI}
        currentWindow={WINDOW_INSIDE}
        selectedSeries={null}
      />,
    );
    const before = seriesCircleLayerIn(WINDOW_INSIDE, LOCI).paint?.[
      "circle-opacity"
    ];

    rerender(
      <SeriesLayers
        loci={LOCI}
        currentWindow={WINDOW_ACROSS_END}
        selectedSeries={null}
      />,
    );

    const after = seriesCircleLayerIn(WINDOW_ACROSS_END, LOCI).paint?.[
      "circle-opacity"
    ];

    expect(after).not.toEqual(before);
    expect(lastLayerPropsOf(SERIES_CIRCLE_LAYER.id)).toMatchObject({
      paint: { "circle-opacity": after },
    });
  });

  it("選択中のシリーズから組んだ輪のレイヤを Layer へ渡す", () => {
    render(
      <SeriesLayers
        loci={LOCI}
        currentWindow={WINDOW_INSIDE}
        selectedSeries={SPARTA}
      />,
    );

    expect(lastLayerPropsOf(SELECTED_SERIES_RING_LAYER.id)).toEqual(
      selectedSeriesRingLayerIn({
        currentWindow: WINDOW_INSIDE,
        loci: LOCI,
        selectedSeriesId: "sparta",
      }),
    );
  });

  it("選択中のシリーズから組んだ同時代の輪のレイヤを Layer へ渡す", () => {
    render(
      <SeriesLayers
        loci={LOCI}
        currentWindow={WINDOW_INSIDE}
        selectedSeries={SPARTA}
      />,
    );

    expect(lastLayerPropsOf(CONTEMPORARY_SERIES_RING_LAYER.id)).toEqual(
      contemporarySeriesRingLayerIn({
        currentWindow: WINDOW_INSIDE,
        loci: LOCI,
        selectedSeries: SPARTA,
      }),
    );
  });
});
