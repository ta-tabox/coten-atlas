/**
 * MapLibre 本体は jsdom で描画できないので、地図コンポーネントはモックへ差し替える。
 * ここで見るのは配線であって地図ではない。
 *
 * 子は描かれないので、置いたかどうかは MapLibreMap が受け取った children を見て判定する。
 */

import { act, render } from "@testing-library/react";
import { Children, isValidElement, type ReactNode } from "react";
import type { MapLayerMouseEvent, MapProps } from "react-map-gl/maplibre";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MapCanvas from "@/components/MapCanvas";
import SeriesDetailCard from "@/components/SeriesDetailCard";
import SeriesLayers from "@/components/SeriesLayers";
import {
  BASEMAP_STYLE_URL,
  INITIAL_VIEW_STATE,
  MAP_WORKER_URL,
} from "@/lib/map/config";
import type { MapLocusCollection } from "@/lib/map/loci";
import { SERIES_CIRCLE_LAYER } from "@/lib/map/series-layer";
import type { Series, SeriesList } from "@/lib/schema/series";

const map = vi.hoisted(() => vi.fn<(props: MapProps) => null>(() => null));

vi.mock("react-map-gl/maplibre", () => ({ default: map }));

// 取得は解決させない。
// 解決すると act の外で state が動き、配線だけを見たいこのテストが取得の完了待ちになる。
vi.mock("@/lib/episodes", () => ({
  fetchEpisodes: () => new Promise(() => {}),
  episodesForSeries: () => [],
}));

/**
 * 地図へ渡す事物。
 * MapCanvas は中身を読まずに SeriesLayers へ渡すだけなので、空で足りる。
 */
const LOCI: MapLocusCollection = { type: "FeatureCollection", features: [] };

const SPARTA: Series = {
  id: "sparta",
  title: "スパルタ",
  kind: "place",
  anchor: "sparta-city",
  timeRange: { start: -900, end: -200 },
  summary: "",
  region: "ギリシア",
  season: 2,
  links: [],
  tags: [],
};

const SERIES: SeriesList = [SPARTA];

/** 直近の描画で MapLibreMap が受け取った props。 */
function lastProps(): MapProps {
  const [props] = map.mock.calls[map.mock.calls.length - 1];

  return props;
}

/** 地図の子に置かれた、その型の要素。 */
function childOfType(type: unknown): ReactNode | undefined {
  return Children.toArray(lastProps().children).find(
    (child) => isValidElement(child) && child.type === type,
  );
}

/**
 * 事物を 1 件返すクリック。
 * MapCanvas が読むのは最前面の feature の `seriesId` だけなので、埋めるのはそこに限る。
 */
function clickOn(seriesId: string): MapLayerMouseEvent {
  return {
    features: [{ properties: { seriesId } }],
  } as unknown as MapLayerMouseEvent;
}

/** 事物の無い所のクリック。 */
function clickOnBlank(): MapLayerMouseEvent {
  return { features: [] } as unknown as MapLayerMouseEvent;
}

describe("MapCanvas", () => {
  beforeEach(() => {
    map.mockClear();
  });

  it("OpenFreeMap のスタイルと初期表示位置を渡す", () => {
    render(<MapCanvas loci={LOCI} series={SERIES} />);

    expect(lastProps().mapStyle).toBe(BASEMAP_STYLE_URL);
    expect(lastProps().initialViewState).toEqual(INITIAL_VIEW_STATE);
  });

  it("worker の在り処を渡す", () => {
    render(<MapCanvas loci={LOCI} series={SERIES} />);

    expect(lastProps().workerUrl).toBe(MAP_WORKER_URL);
  });

  it("シリーズのレイヤへ事物を渡して子に置く", () => {
    render(<MapCanvas loci={LOCI} series={SERIES} />);

    expect(childOfType(SeriesLayers)).toMatchObject({ props: { loci: LOCI } });
  });

  it("attributionControl を無効にしない", () => {
    render(<MapCanvas loci={LOCI} series={SERIES} />);

    expect(lastProps().attributionControl).not.toBe(false);
  });

  it("クリックを拾う相手を代表点のレイヤに限る", () => {
    render(<MapCanvas loci={LOCI} series={SERIES} />);

    expect(lastProps().interactiveLayerIds).toEqual([SERIES_CIRCLE_LAYER.id]);
  });

  it("選択が無いうちは詳細カードを置かない", () => {
    render(<MapCanvas loci={LOCI} series={SERIES} />);

    expect(childOfType(SeriesDetailCard)).toBeUndefined();
  });

  it("事物のクリックで、その seriesId のシリーズを詳細カードへ渡す", () => {
    render(<MapCanvas loci={LOCI} series={SERIES} />);

    act(() => lastProps().onClick?.(clickOn("sparta")));

    expect(childOfType(SeriesDetailCard)).toMatchObject({
      props: { series: SPARTA },
    });
  });

  it("事物の無い所のクリックで選択を外す", () => {
    render(<MapCanvas loci={LOCI} series={SERIES} />);

    act(() => lastProps().onClick?.(clickOn("sparta")));
    act(() => lastProps().onClick?.(clickOnBlank()));

    expect(childOfType(SeriesDetailCard)).toBeUndefined();
  });
});
