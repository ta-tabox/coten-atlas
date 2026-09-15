/**
 * MapLibre 本体は jsdom で描画できないので、`react-map-gl/maplibre` をモックに差し替える。
 * 検証するのは props の受け渡しであって、地図の描画ではない。
 *
 * モックは children を描画しないので、子コンポーネントの有無は MapLibreMap が受け取った `children` とその子孫の要素で判定する。
 * モックは受け取った `ref` に `panTo` だけを持つ地図を入れるので、カメラの移動は `panTo` の呼び出しで判定する。
 */

import { act, render } from "@testing-library/react";
import {
  Children,
  type ComponentProps,
  isValidElement,
  type JSXElementConstructor,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import type {
  MapLayerMouseEvent,
  MapProps,
  MapRef,
} from "react-map-gl/maplibre";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EraSlider from "@/components/era-slider/EraSlider";
import MapCanvas from "@/components/map/MapCanvas";
import SeriesLayers from "@/components/map/SeriesLayers";
import SeriesDetailCard from "@/components/series-detail/SeriesDetailCard";
import SeriesPanel from "@/components/series-panel/SeriesPanel";
import { currentWindow } from "@/lib/era/window";
import {
  BASEMAP_STYLE_URL,
  INITIAL_VIEW_STATE,
  MAP_WORKER_URL,
} from "@/lib/map/config";
import type { MapLocusCollection } from "@/lib/map/loci";
import { SERIES_CIRCLE_LAYER } from "@/lib/map/series-layer";
import { seriesPanelSectionsOf } from "@/lib/map/series-panel";
import { panelTagsOf } from "@/lib/map/tag-filter";
import type { EraList } from "@/lib/schema/era";
import {
  ANCHOR_UNLOCATED,
  type Series,
  type SeriesList,
  TIME_RANGE_UNTIMED,
} from "@/lib/schema/series";

/** MapLibreMap のモックが受け取る props。 */
type MockMapProps = MapProps & { ref?: Ref<MapRef> };

/** MapLibreMap のモックが `ref` に入れる地図の `panTo`。 */
const panTo = vi.hoisted(() => vi.fn());

/**
 * `react-map-gl/maplibre` の既定の export と差し替えるモック関数。
 * 受け取った props を記録し、`ref` がオブジェクトなら `panTo` だけを持つ地図を入れて、null を返す。
 */
const map = vi.hoisted(() =>
  vi.fn<(props: MockMapProps) => null>((props) => {
    if (typeof props.ref === "object" && props.ref !== null) {
      props.ref.current = { panTo } as unknown as MapRef;
    }

    return null;
  }),
);

vi.mock("react-map-gl/maplibre", () => ({ default: map }));

// fetchEpisodes の Promise を解決させない。
// 解決すると act の外で setEpisodes が走り、props の受け渡しだけを検証するテストが取得の完了待ちになる。
vi.mock("@/lib/episodes", () => ({
  fetchEpisodes: () => new Promise(() => {}),
  episodesForSeries: () => [],
}));

/** スパルタの代表点の座標。 */
const SPARTA_COORDINATES: [number, number] = [22.43, 37.08];

/** スパルタの代表点 1 件だけを持つ、地図に渡す `Locus` の全件。 */
const LOCI: MapLocusCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: SPARTA_COORDINATES },
      properties: {
        id: "sparta-city",
        seriesId: "sparta",
        timeStart: -900,
        timeEnd: -200,
      },
    },
  ],
};

const SPARTA: Series = {
  id: "sparta",
  title: "スパルタ",
  anchor: "sparta-city",
  timeRange: { start: -900, end: -200 },
  summary: "",
  region: "ヨーロッパ",
  season: 2,
  links: [],
  tags: ["集団"],
};

/** 位置なしで時期を持たないシリーズ。 */
const OKANE: Series = {
  ...SPARTA,
  id: "okane-no-rekishi",
  title: "お金の歴史",
  anchor: ANCHOR_UNLOCATED,
  timeRange: TIME_RANGE_UNTIMED,
  region: "地域なし",
  season: 12,
  tags: ["経済", "概念史"],
};

const SERIES: SeriesList = [SPARTA, OKANE];

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
function lastProps(): MockMapProps {
  const [props] = map.mock.calls[map.mock.calls.length - 1];

  return props;
}

/**
 * `children` とその子孫の要素から、`type` の要素を先に見つかった 1 つだけ返す。
 * 無ければ undefined を返す。
 */
function findElementOfType(
  children: ReactNode,
  type: unknown,
): ReactElement | undefined {
  for (const child of Children.toArray(children)) {
    if (!isValidElement<{ children?: ReactNode }>(child)) {
      continue;
    }

    if (child.type === type) {
      return child;
    }

    const nested = findElementOfType(child.props.children, type);

    if (nested !== undefined) {
      return nested;
    }
  }

  return undefined;
}

/**
 * 地図の children とその子孫の要素から `type` の要素を 1 つ返す。
 * 無ければ undefined を返す。
 */
function childOfType(type: unknown): ReactElement | undefined {
  return findElementOfType(lastProps().children, type);
}

/**
 * 地図の children にある `type` の要素の props を返す。
 * `type` の要素が無ければ throw する。
 */
function childPropsOf<P extends object>(type: JSXElementConstructor<P>): P {
  const child = childOfType(type);

  if (!isValidElement<P>(child)) {
    throw new Error(`地図の children に ${type.name} が無い`);
  }

  return child.props;
}

/** 地図の children にある EraSlider の props を返す。 */
function eraSliderProps(): ComponentProps<typeof EraSlider> {
  return childPropsOf(EraSlider);
}

/** 地図の children にある SeriesPanel の props を返す。 */
function seriesPanelProps(): ComponentProps<typeof SeriesPanel> {
  return childPropsOf(SeriesPanel);
}

/** 地図の children にある SeriesLayers の props を返す。 */
function seriesLayersProps(): ComponentProps<typeof SeriesLayers> {
  return childPropsOf(SeriesLayers);
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
    panTo.mockClear();
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

  it("スライダーの現在窓で分けた区画を、一覧パネルへ渡す", () => {
    renderMapCanvas();

    act(() => eraSliderProps().onPositionChange(0.9));

    expect(seriesPanelProps().sections).toEqual(
      seriesPanelSectionsOf({
        series: SERIES,
        loci: LOCI,
        currentWindow: currentWindow({
          position: 0.9,
          eras: ERAS,
          presentEnd: PRESENT_END,
        }),
      }),
    );
  });

  it("選択が無いうちは、一覧パネルとシリーズのレイヤへ null を渡す", () => {
    renderMapCanvas();

    expect(seriesPanelProps().selectedSeriesId).toBeNull();
    expect(seriesLayersProps().selectedSeriesId).toBeNull();
  });

  it("事物のクリックで選んだシリーズの id を、一覧パネルとシリーズのレイヤへ渡す", () => {
    renderMapCanvas();

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));

    expect(seriesPanelProps().selectedSeriesId).toBe("sparta");
    expect(seriesLayersProps().selectedSeriesId).toBe("sparta");
  });

  it("一覧パネルで選んだシリーズを、詳細カードへ渡し、シリーズのレイヤと一覧パネルへ同じ id で渡す", () => {
    renderMapCanvas();

    act(() => seriesPanelProps().onSelect("sparta"));

    expect(childOfType(SeriesDetailCard)).toMatchObject({
      props: { series: SPARTA },
    });
    expect(seriesLayersProps().selectedSeriesId).toBe("sparta");
    expect(seriesPanelProps().selectedSeriesId).toBe("sparta");
  });

  it("一覧パネルで選んだ後に事物の無い所をクリックすると、一覧パネルの選択も外れる", () => {
    renderMapCanvas();

    act(() => seriesPanelProps().onSelect("sparta"));
    act(() => lastProps().onClick?.(mouseEventOnBlank()));

    expect(seriesPanelProps().selectedSeriesId).toBeNull();
  });

  it("詳細カードを閉じると、一覧パネルとシリーズのレイヤの選択も外れる", () => {
    renderMapCanvas();

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));
    act(() =>
      childPropsOf<ComponentProps<typeof SeriesDetailCard>>(
        SeriesDetailCard,
      ).onClose(),
    );

    expect(seriesPanelProps().selectedSeriesId).toBeNull();
    expect(seriesLayersProps().selectedSeriesId).toBeNull();
  });

  it("一覧パネルで代表点を持つシリーズを選ぶと、その代表点へ panTo する", () => {
    renderMapCanvas();

    act(() => seriesPanelProps().onSelect("sparta"));

    expect(panTo).toHaveBeenCalledExactlyOnceWith(
      SPARTA_COORDINATES,
      expect.anything(),
    );
  });

  it("一覧パネルで位置なしのシリーズを選んでも panTo しない", () => {
    renderMapCanvas();

    act(() => seriesPanelProps().onSelect("okane-no-rekishi"));

    expect(childOfType(SeriesDetailCard)).toMatchObject({
      props: { series: OKANE },
    });
    expect(panTo).not.toHaveBeenCalled();
  });

  it("事物のクリックで選んでも panTo しない", () => {
    renderMapCanvas();

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));

    expect(panTo).not.toHaveBeenCalled();
  });

  it("絞り込む前の区画から数えたタグを、一覧パネルへ渡す", () => {
    renderMapCanvas();

    expect(seriesPanelProps().tags).toEqual(
      panelTagsOf(
        seriesPanelSectionsOf({
          series: SERIES,
          loci: LOCI,
          currentWindow: currentWindow({
            position: 0.5,
            eras: ERAS,
            presentEnd: PRESENT_END,
          }),
        }),
      ),
    );
  });

  it("一覧パネルでタグを選ぶと、シリーズのレイヤへ渡す事物と一覧パネルの区画が、そのタグを持つシリーズに絞られる", () => {
    renderMapCanvas();

    act(() => seriesPanelProps().onSelectedTagChange("経済"));

    expect(seriesPanelProps().selectedTag).toBe("経済");
    expect(seriesLayersProps().loci.features).toEqual([]);
    expect(seriesPanelProps().sections).toEqual({
      onMap: [],
      unlocated: [OKANE],
    });
  });

  it("タグを選んでも、一覧パネルへ渡すタグは絞り込む前のまま変わらない", () => {
    renderMapCanvas();
    const before = seriesPanelProps().tags;

    act(() => seriesPanelProps().onSelectedTagChange("経済"));

    expect(seriesPanelProps().tags).toEqual(before);
  });

  it("絞り込みを解除すると、シリーズのレイヤへ渡す事物と一覧パネルの区画が絞る前に戻る", () => {
    renderMapCanvas();

    act(() => seriesPanelProps().onSelectedTagChange("経済"));
    act(() => seriesPanelProps().onSelectedTagChange(null));

    expect(seriesPanelProps().selectedTag).toBeNull();
    expect(seriesLayersProps().loci).toEqual(LOCI);
    expect(seriesPanelProps().sections).toEqual(
      seriesPanelSectionsOf({
        series: SERIES,
        loci: LOCI,
        currentWindow: currentWindow({
          position: 0.5,
          eras: ERAS,
          presentEnd: PRESENT_END,
        }),
      }),
    );
  });

  it("選択中のシリーズが絞り込みで一覧パネルと地図から消えても、選択は外れず詳細カードを開いたままにする", () => {
    renderMapCanvas();

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));
    act(() => seriesPanelProps().onSelectedTagChange("経済"));

    expect(seriesPanelProps().selectedSeriesId).toBe("sparta");
    expect(seriesLayersProps().selectedSeriesId).toBe("sparta");
    expect(childOfType(SeriesDetailCard)).toMatchObject({
      props: { series: SPARTA },
    });
  });

  it("絞り込み中に選択を移しても、絞り込みは外れない", () => {
    renderMapCanvas();

    act(() => seriesPanelProps().onSelectedTagChange("経済"));
    act(() => seriesPanelProps().onSelect("okane-no-rekishi"));

    expect(seriesPanelProps().selectedTag).toBe("経済");
  });
});
