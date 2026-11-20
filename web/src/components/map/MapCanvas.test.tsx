/**
 * MapLibre 本体は jsdom で描画できないので、`react-map-gl/maplibre` をモックに差し替える。
 * 検証するのは props の受け渡しであって、地図の描画ではない。
 * ベースマップのスタイルの取得は、グローバルの `fetch` を差し替えて応答を決める。
 *
 * モックは children を描画しないので、子コンポーネントの有無は MapLibreMap が受け取った `children` とその子孫の要素で判定する。
 * モックは受け取った `ref` に `panTo` と `easeTo` を持つ地図を入れるので、カメラの移動は `panTo`、視野のずらしは `easeTo` の呼び出しで判定する。
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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EraSlider from "@/components/era-slider/EraSlider";
import MapCanvas from "@/components/map/MapCanvas";
import SeriesLayers from "@/components/map/SeriesLayers";
import SeriesDetailCard from "@/components/series-detail/SeriesDetailCard";
import SeriesPanel from "@/components/series-panel/SeriesPanel";
import { currentWindow } from "@/lib/era/window";
import { toJapaneseLabelStyle } from "@/lib/map/basemap-labels";
import {
  BASEMAP_STYLE_URL,
  INITIAL_VIEW_STATE,
  MAP_WORKER_URL,
  PANEL_RIGHT_EDGE_PX,
} from "@/lib/map/config";
import { SERIES_CIRCLE_LAYER } from "@/lib/map/layers/shared";
import type { MapLocusCollection } from "@/lib/map/loci";
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

/** MapLibreMap のモックが `ref` に入れる地図の `easeTo`。 */
const easeTo = vi.hoisted(() => vi.fn());

/**
 * `react-map-gl/maplibre` の既定の export と差し替えるモック関数。
 * 受け取った props を記録し、`ref` がオブジェクトなら `panTo` と `easeTo` を持つ地図を入れて、null を返す。
 */
const map = vi.hoisted(() =>
  vi.fn<(props: MockMapProps) => null>((props) => {
    if (typeof props.ref === "object" && props.ref !== null) {
      props.ref.current = { panTo, easeTo } as unknown as MapRef;
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
  region: "ヨーロッパ",
  season: 2,
  links: {},
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

/** ベースマップのスタイルの取得が返す、国名のレイヤ 1 つだけを持つスタイル。 */
const BASEMAP_STYLE = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "label_country_1",
      type: "symbol",
      source: "openmaptiles",
      layout: {
        "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
      },
    },
  ],
};

/** グローバルの `fetch` を、`response` を返すモックに差し替える。 */
function stubFetch(response: Partial<Response>): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(response as Response)),
  );
}

/** グローバルの `matchMedia` を、デスクトップの幅の条件に当たるかが `matches` のモックに差し替える。 */
function stubDesktop(matches: boolean): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  );
}

/**
 * `eras` を時代区分に持つ MapCanvas を描画し、ベースマップのスタイルの取得が終わるまで待つ。
 * 取得が終わるまで MapCanvas は地図を描かないので、待たないと MapLibreMap のモックが呼ばれない。
 */
async function renderMapCanvas(eras: EraList = ERAS): Promise<void> {
  await act(async () => {
    render(
      <MapCanvas
        loci={LOCI}
        seriesList={SERIES}
        eras={eras}
        presentEnd={PRESENT_END}
      />,
    );
  });
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
    easeTo.mockClear();
    stubDesktop(true);
    stubFetch({ ok: true, json: () => Promise.resolve(BASEMAP_STYLE) });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("OpenFreeMap から取得したスタイルを、地名を日本語にしてから渡す", async () => {
    await renderMapCanvas();

    expect(fetch).toHaveBeenCalledWith(BASEMAP_STYLE_URL);
    expect(lastProps().mapStyle).toEqual(toJapaneseLabelStyle(BASEMAP_STYLE));
  });

  it("スタイルの取得に失敗すると、書き換えないスタイルの URL を渡す", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    stubFetch({ ok: false, status: 503, statusText: "Service Unavailable" });

    await renderMapCanvas();

    expect(lastProps().mapStyle).toBe(BASEMAP_STYLE_URL);
  });

  it("スタイルの取得が終わるまで地図を描かない", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );

    render(
      <MapCanvas
        loci={LOCI}
        seriesList={SERIES}
        eras={ERAS}
        presentEnd={PRESENT_END}
      />,
    );

    expect(map).not.toHaveBeenCalled();
  });

  it("デスクトップの幅で一覧パネルが開いていれば、初期の視野の左の padding に一覧パネルの右端までの幅を渡す", async () => {
    await renderMapCanvas();

    expect(lastProps().initialViewState).toEqual({
      ...INITIAL_VIEW_STATE,
      padding: { top: 0, bottom: 0, right: 0, left: PANEL_RIGHT_EDGE_PX },
    });
  });

  it("デスクトップの幅でなければ、初期の視野の左の padding を 0 にする", async () => {
    stubDesktop(false);
    await renderMapCanvas();

    expect(lastProps().initialViewState).toEqual({
      ...INITIAL_VIEW_STATE,
      padding: { top: 0, bottom: 0, right: 0, left: 0 },
    });
  });

  it("一覧パネルを閉じると左の padding を 0 へ、開き直すと一覧パネルの右端までの幅へ戻す", async () => {
    await renderMapCanvas();

    act(() => seriesPanelProps().onOpenChange(false));

    expect(easeTo).toHaveBeenLastCalledWith(
      expect.objectContaining({
        padding: expect.objectContaining({ left: 0 }),
      }),
    );

    act(() => seriesPanelProps().onOpenChange(true));

    expect(easeTo).toHaveBeenLastCalledWith(
      expect.objectContaining({
        padding: expect.objectContaining({ left: PANEL_RIGHT_EDGE_PX }),
      }),
    );
  });

  it("拡大の上限にズーム 10 を渡す", async () => {
    await renderMapCanvas();

    expect(lastProps().maxZoom).toBe(10);
  });

  it("worker の在り処を渡す", async () => {
    await renderMapCanvas();

    expect(lastProps().workerUrl).toBe(MAP_WORKER_URL);
  });

  it("シリーズのレイヤへ事物を渡して子に置く", async () => {
    await renderMapCanvas();

    expect(childOfType(SeriesLayers)).toMatchObject({ props: { loci: LOCI } });
  });

  it("attributionControl を無効にしない", async () => {
    await renderMapCanvas();

    expect(lastProps().attributionControl).not.toBe(false);
  });

  it("クリックを拾う相手を代表点のレイヤに限る", async () => {
    await renderMapCanvas();

    expect(lastProps().interactiveLayerIds).toEqual([SERIES_CIRCLE_LAYER.id]);
  });

  it("Locus に入ったときだけ cursor を pointer にする", async () => {
    await renderMapCanvas();

    expect(lastProps().cursor).not.toBe("pointer");

    act(() => lastProps().onMouseEnter?.(mouseEventOn("sparta")));

    expect(lastProps().cursor).toBe("pointer");

    act(() => lastProps().onMouseLeave?.(mouseEventOnBlank()));

    expect(lastProps().cursor).not.toBe("pointer");
  });

  it("選択が無いうちは詳細カードを置かない", async () => {
    await renderMapCanvas();

    expect(childOfType(SeriesDetailCard)).toBeUndefined();
  });

  it("事物のクリックで、その seriesId のシリーズを詳細カードへ渡す", async () => {
    await renderMapCanvas();

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));

    expect(childOfType(SeriesDetailCard)).toMatchObject({
      props: { series: SPARTA },
    });
  });

  it("事物の無い所のクリックで選択を外す", async () => {
    await renderMapCanvas();

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));
    act(() => lastProps().onClick?.(mouseEventOnBlank()));

    expect(childOfType(SeriesDetailCard)).toBeUndefined();
  });

  it("era スライダーは古代の区間の中央から始まる", async () => {
    await renderMapCanvas();

    expect(eraSliderProps()).toMatchObject({
      eras: ERAS,
      presentEnd: PRESENT_END,
      position: 0.5,
    });
  });

  it("スライダーの位置から求めた現在窓を、シリーズのレイヤへ渡す", async () => {
    await renderMapCanvas();

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

  it("スライダーが動くと、シリーズのレイヤへ渡す現在窓が変わる", async () => {
    await renderMapCanvas();

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

  it("時代区分に古代が無ければ throw する", async () => {
    // React は描画中の throw を console.error にも書くので、テストの出力に載せない。
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(renderMapCanvas(ERAS.slice(2))).rejects.toThrow("ancient");
  });

  it("スライダーの現在窓で分けた区画を、一覧パネルへ渡す", async () => {
    await renderMapCanvas();

    act(() => eraSliderProps().onPositionChange(0.9));

    expect(seriesPanelProps().sections).toEqual(
      seriesPanelSectionsOf({
        seriesList: SERIES,
        loci: LOCI,
        currentWindow: currentWindow({
          position: 0.9,
          eras: ERAS,
          presentEnd: PRESENT_END,
        }),
      }),
    );
  });

  it("選択が無いうちは、一覧パネルとシリーズのレイヤへ null を渡す", async () => {
    await renderMapCanvas();

    expect(seriesPanelProps().selectedSeriesId).toBeNull();
    expect(seriesLayersProps().selectedSeries).toBeNull();
  });

  it("事物のクリックで選んだシリーズの id を、一覧パネルとシリーズのレイヤへ渡す", async () => {
    await renderMapCanvas();

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));

    expect(seriesPanelProps().selectedSeriesId).toBe("sparta");
    expect(seriesLayersProps().selectedSeries?.id).toBe("sparta");
  });

  it("一覧パネルで選んだシリーズを、詳細カードへ渡し、シリーズのレイヤと一覧パネルへ同じ id で渡す", async () => {
    await renderMapCanvas();

    act(() => seriesPanelProps().onSelect("sparta"));

    expect(childOfType(SeriesDetailCard)).toMatchObject({
      props: { series: SPARTA },
    });
    expect(seriesLayersProps().selectedSeries?.id).toBe("sparta");
    expect(seriesPanelProps().selectedSeriesId).toBe("sparta");
  });

  it("一覧パネルで選んだ後に事物の無い所をクリックすると、一覧パネルの選択も外れる", async () => {
    await renderMapCanvas();

    act(() => seriesPanelProps().onSelect("sparta"));
    act(() => lastProps().onClick?.(mouseEventOnBlank()));

    expect(seriesPanelProps().selectedSeriesId).toBeNull();
  });

  it("詳細カードを閉じると、一覧パネルとシリーズのレイヤの選択も外れる", async () => {
    await renderMapCanvas();

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));
    act(() =>
      childPropsOf<ComponentProps<typeof SeriesDetailCard>>(
        SeriesDetailCard,
      ).onClose(),
    );

    expect(seriesPanelProps().selectedSeriesId).toBeNull();
    expect(seriesLayersProps().selectedSeries).toBeNull();
  });

  it("一覧パネルで代表点を持つシリーズを選ぶと、その代表点へ panTo する", async () => {
    await renderMapCanvas();

    act(() => seriesPanelProps().onSelect("sparta"));

    expect(panTo).toHaveBeenCalledExactlyOnceWith(
      SPARTA_COORDINATES,
      expect.anything(),
    );
  });

  it("一覧パネルで位置なしのシリーズを選んでも panTo しない", async () => {
    await renderMapCanvas();

    act(() => seriesPanelProps().onSelect("okane-no-rekishi"));

    expect(childOfType(SeriesDetailCard)).toMatchObject({
      props: { series: OKANE },
    });
    expect(panTo).not.toHaveBeenCalled();
  });

  it("事物のクリックで選んでも panTo しない", async () => {
    await renderMapCanvas();

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));

    expect(panTo).not.toHaveBeenCalled();
  });

  it("絞り込んでいなければ、区画のシリーズから数えたタグを一覧パネルへ渡す", async () => {
    await renderMapCanvas();

    expect(seriesPanelProps().tags).toEqual(
      panelTagsOf(
        seriesPanelSectionsOf({
          seriesList: SERIES,
          loci: LOCI,
          currentWindow: currentWindow({
            position: 0.5,
            eras: ERAS,
            presentEnd: PRESENT_END,
          }),
        }),
        [],
      ),
    );
  });

  it("一覧パネルでタグを選ぶと、シリーズのレイヤへ渡す事物と一覧パネルの区画が、そのタグを持つシリーズに絞られる", async () => {
    await renderMapCanvas();

    act(() => seriesPanelProps().onSelectedTagsChange(["経済"]));

    expect(seriesPanelProps().selectedTags).toEqual(["経済"]);
    expect(seriesLayersProps().loci.features).toEqual([]);
    expect(seriesPanelProps().sections).toEqual({
      onMap: [],
      unlocated: [OKANE],
    });
  });

  it("一覧パネルでタグを 2 つ選ぶと、両方を持つシリーズだけに絞られる", async () => {
    await renderMapCanvas();

    act(() => seriesPanelProps().onSelectedTagsChange(["経済", "集団"]));

    expect(seriesLayersProps().loci.features).toEqual([]);
    expect(seriesPanelProps().sections).toEqual({ onMap: [], unlocated: [] });
  });

  it("タグを選ぶと、一覧パネルへ渡すタグが、選んだタグと一緒に持たれているタグだけになる", async () => {
    await renderMapCanvas();

    act(() => seriesPanelProps().onSelectedTagsChange(["経済"]));

    expect(seriesPanelProps().tags.map(({ tag }) => tag)).toEqual([
      "経済",
      "概念史",
    ]);
  });

  it("絞り込みを解除すると、シリーズのレイヤへ渡す事物と一覧パネルの区画が絞る前に戻る", async () => {
    await renderMapCanvas();

    act(() => seriesPanelProps().onSelectedTagsChange(["経済"]));
    act(() => seriesPanelProps().onSelectedTagsChange([]));

    expect(seriesPanelProps().selectedTags).toEqual([]);
    expect(seriesLayersProps().loci).toEqual(LOCI);
    expect(seriesPanelProps().sections).toEqual(
      seriesPanelSectionsOf({
        seriesList: SERIES,
        loci: LOCI,
        currentWindow: currentWindow({
          position: 0.5,
          eras: ERAS,
          presentEnd: PRESENT_END,
        }),
      }),
    );
  });

  it("選択中のシリーズが絞り込みで一覧パネルと地図から消えても、選択は外れず詳細カードを開いたままにする", async () => {
    await renderMapCanvas();

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));
    act(() => seriesPanelProps().onSelectedTagsChange(["経済"]));

    expect(seriesPanelProps().selectedSeriesId).toBe("sparta");
    expect(seriesLayersProps().selectedSeries?.id).toBe("sparta");
    expect(childOfType(SeriesDetailCard)).toMatchObject({
      props: { series: SPARTA },
    });
  });

  it("絞り込み中に選択を移しても、絞り込みは外れない", async () => {
    await renderMapCanvas();

    act(() => seriesPanelProps().onSelectedTagsChange(["経済"]));
    act(() => seriesPanelProps().onSelect("okane-no-rekishi"));

    expect(seriesPanelProps().selectedTags).toEqual(["経済"]);
  });
});
