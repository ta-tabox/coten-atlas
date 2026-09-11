/**
 * MapLibre 本体は jsdom で描画できないので、`react-map-gl/maplibre` をモックに差し替える。
 * 検証するのは props の受け渡しであって、地図の描画ではない。
 *
 * モックは children を描画しないので、子コンポーネントの有無は MapLibreMap が受け取った `children` で判定する。
 */

import { act, render } from "@testing-library/react";
import {
  Children,
  type ComponentProps,
  isValidElement,
  type ReactNode,
} from "react";
import type { MapLayerMouseEvent, MapProps } from "react-map-gl/maplibre";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EraSlider from "@/components/EraSlider";
import MapCanvas from "@/components/MapCanvas";
import SeriesDetailCard from "@/components/SeriesDetailCard";
import SeriesLayers from "@/components/SeriesLayers";
import { currentWindow } from "@/lib/era/window";
import {
  BASEMAP_STYLE_URL,
  INITIAL_VIEW_STATE,
  MAP_WORKER_URL,
} from "@/lib/map/config";
import type { MapLocusCollection } from "@/lib/map/loci";
import { SERIES_CIRCLE_LAYER } from "@/lib/map/series-layer";
import type { EraList } from "@/lib/schema/era";
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

/**
 * 3 区間の時代区分。
 * 古代は 2 番目なので、その中央は era 空間の 0.5 に当たる。
 */
const ERAS: EraList = [
  { id: "prehistory", label: "先史", start: -10000, end: -800 },
  { id: "ancient", label: "古代", start: -800, end: 550 },
  { id: "medieval", label: "中世", start: 550, end: 1450 },
];

const PRESENT_END = 2026;

/** `eras` を時代区分に持つ MapCanvas を描画する。 */
function renderMapCanvas(eras: EraList = ERAS): void {
  render(
    <MapCanvas
      loci={LOCI}
      series={SERIES}
      eras={eras}
      presentEnd={PRESENT_END}
    />,
  );
}

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
 * 地図の children にある EraSlider の props を返す。
 * EraSlider が無ければ throw する。
 */
function eraSliderProps(): ComponentProps<typeof EraSlider> {
  const slider = childOfType(EraSlider);

  if (!isValidElement<ComponentProps<typeof EraSlider>>(slider)) {
    throw new Error("地図の children に EraSlider が無い");
  }

  return slider.props;
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
    renderMapCanvas();

    expect(lastProps().mapStyle).toBe(BASEMAP_STYLE_URL);
    expect(lastProps().initialViewState).toEqual(INITIAL_VIEW_STATE);
  });

  it("worker の在り処を渡す", () => {
    renderMapCanvas();

    expect(lastProps().workerUrl).toBe(MAP_WORKER_URL);
  });

  it("シリーズのレイヤへ事物を渡して子に置く", () => {
    renderMapCanvas();

    expect(childOfType(SeriesLayers)).toMatchObject({ props: { loci: LOCI } });
  });

  it("attributionControl を無効にしない", () => {
    renderMapCanvas();

    expect(lastProps().attributionControl).not.toBe(false);
  });

  it("クリックを拾う相手を代表点のレイヤに限る", () => {
    renderMapCanvas();

    expect(lastProps().interactiveLayerIds).toEqual([SERIES_CIRCLE_LAYER.id]);
  });

  it("Locus に入ったときだけ cursor を pointer にする", () => {
    renderMapCanvas();

    expect(lastProps().cursor).not.toBe("pointer");

    act(() => lastProps().onMouseEnter?.(mouseEventOn("sparta")));

    expect(lastProps().cursor).toBe("pointer");

    act(() => lastProps().onMouseLeave?.(mouseEventOnBlank()));

    expect(lastProps().cursor).not.toBe("pointer");
  });

  it("選択が無いうちは詳細カードを置かない", () => {
    renderMapCanvas();

    expect(childOfType(SeriesDetailCard)).toBeUndefined();
  });

  it("事物のクリックで、その seriesId のシリーズを詳細カードへ渡す", () => {
    renderMapCanvas();

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));

    expect(childOfType(SeriesDetailCard)).toMatchObject({
      props: { series: SPARTA },
    });
  });

  it("事物の無い所のクリックで選択を外す", () => {
    renderMapCanvas();

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));
    act(() => lastProps().onClick?.(mouseEventOnBlank()));

    expect(childOfType(SeriesDetailCard)).toBeUndefined();
  });

  it("era スライダーは古代の区間の中央から始まる", () => {
    renderMapCanvas();

    expect(eraSliderProps()).toMatchObject({
      eras: ERAS,
      presentEnd: PRESENT_END,
      position: 0.5,
    });
  });

  it("スライダーの位置から求めた現在窓を、シリーズのレイヤへ渡す", () => {
    renderMapCanvas();

    expect(childOfType(SeriesLayers)).toMatchObject({
      props: {
        currentWindow: currentWindow({
          position: 0.5,
          eras: ERAS,
          presentEnd: PRESENT_END,
        }),
      },
    });
  });

  it("スライダーが動くと、シリーズのレイヤへ渡す現在窓が変わる", () => {
    renderMapCanvas();

    act(() => eraSliderProps().onPositionChange(0.9));

    expect(eraSliderProps().position).toBe(0.9);
    expect(childOfType(SeriesLayers)).toMatchObject({
      props: {
        currentWindow: currentWindow({
          position: 0.9,
          eras: ERAS,
          presentEnd: PRESENT_END,
        }),
      },
    });
  });

  it("時代区分に古代が無ければ throw する", () => {
    // React は描画中の throw を console.error にも書くので、テストの出力に載せない。
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderMapCanvas(ERAS.slice(2))).toThrow("ancient");
  });
});
