/**
 * MapLibre 本体は jsdom で描画できないので、`react-map-gl/maplibre` をモックに差し替える。
 * 検証するのは props の受け渡しであって、地図の描画ではない。
 *
 * モックは children を描画しないので、子コンポーネントの有無は MapLibreMap が受け取った `children` で判定する。
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

// fetchEpisodes の Promise を解決させない。
// 解決すると act の外で setEpisodes が走り、props の受け渡しだけを検証するテストが取得の完了待ちになる。
vi.mock("@/lib/episodes", () => ({
  fetchEpisodes: () => new Promise(() => {}),
  episodesForSeries: () => [],
}));

/**
 * 地図に渡す `Locus` の全件。
 * MapCanvas は中身を読まずに SeriesLayers へ渡すだけなので、空配列で足りる。
 */
const LOCI: MapLocusCollection = { type: "FeatureCollection", features: [] };

const SPARTA: Series = {
  id: "sparta",
  title: "スパルタ",
  kind: "place",
  anchor: "sparta-city",
  timeRange: { start: -900, end: -200 },
  summary: "",
  region: "ヨーロッパ",
  season: 2,
  links: [],
  tags: ["集団"],
};

const SERIES: SeriesList = [SPARTA];

/** 直近のレンダリングで MapLibreMap が受け取った props を返す。 */
function lastProps(): MapProps {
  const [props] = map.mock.calls[map.mock.calls.length - 1];

  return props;
}

/**
 * 地図の children から `type` の要素を 1 つ返す。
 * 無ければ undefined を返す。
 */
function childOfType(type: unknown): ReactNode | undefined {
  return Children.toArray(lastProps().children).find(
    (child) => isValidElement(child) && child.type === type,
  );
}

/**
 * `seriesId` を持つ `Locus` を 1 件返すマウスイベントを作る。
 * MapCanvas が読むのは最前面の feature の `seriesId` だけなので、他の欄は埋めない。
 */
function mouseEventOn(seriesId: string): MapLayerMouseEvent {
  return {
    features: [{ properties: { seriesId } }],
  } as unknown as MapLayerMouseEvent;
}

/** `Locus` が無い地点のマウスイベントを作る。 */
function mouseEventOnBlank(): MapLayerMouseEvent {
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

  it("Locus に入ったときだけ cursor を pointer にする", () => {
    render(<MapCanvas loci={LOCI} series={SERIES} />);

    expect(lastProps().cursor).not.toBe("pointer");

    act(() => lastProps().onMouseEnter?.(mouseEventOn("sparta")));

    expect(lastProps().cursor).toBe("pointer");

    act(() => lastProps().onMouseLeave?.(mouseEventOnBlank()));

    expect(lastProps().cursor).not.toBe("pointer");
  });

  it("選択が無いうちは詳細カードを置かない", () => {
    render(<MapCanvas loci={LOCI} series={SERIES} />);

    expect(childOfType(SeriesDetailCard)).toBeUndefined();
  });

  it("事物のクリックで、その seriesId のシリーズを詳細カードへ渡す", () => {
    render(<MapCanvas loci={LOCI} series={SERIES} />);

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));

    expect(childOfType(SeriesDetailCard)).toMatchObject({
      props: { series: SPARTA },
    });
  });

  it("事物の無い所のクリックで選択を外す", () => {
    render(<MapCanvas loci={LOCI} series={SERIES} />);

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));
    act(() => lastProps().onClick?.(mouseEventOnBlank()));

    expect(childOfType(SeriesDetailCard)).toBeUndefined();
  });
});
