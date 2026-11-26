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
import BottomSheet from "@/components/bottom-sheet/BottomSheet";
import EraSlider from "@/components/era-slider/EraSlider";
import MapCanvas from "@/components/map/MapCanvas";
import { PANEL_RIGHT_EDGE_PX } from "@/components/map/panel-layout";
import SeriesLayers from "@/components/map/SeriesLayers";
import {
  TOOLTIP_SHOW_DELAY_MS,
  TOOLTIP_SKIP_WINDOW_MS,
} from "@/components/map/use-hover-tooltip";
import SeriesCandidateOverlay from "@/components/series-candidates/SeriesCandidateOverlay";
import SeriesDetailBody from "@/components/series-detail/SeriesDetailBody";
import SeriesDetailCard from "@/components/series-detail/SeriesDetailCard";
import SeriesPanel from "@/components/series-panel/SeriesPanel";
import SeriesPanelBody from "@/components/series-panel/SeriesPanelBody";
import SeriesTooltip from "@/components/series-tooltip/SeriesTooltip";
import { currentWindow } from "@/lib/era/window";
import { toJapaneseLabelStyle } from "@/lib/map/basemap-labels";
import {
  BASEMAP_STYLE_URL,
  INITIAL_VIEW_STATE,
  MAP_WORKER_URL,
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
 * MapLibreMap のモックが `ref` に入れる地図の `queryRenderedFeatures`。
 * タッチの押下が使う範囲の検索の結果を、テストが決める。
 */
const queryRenderedFeatures = vi.hoisted(() => vi.fn(() => []));

/**
 * MapLibreMap のモックが `ref` に入れる地図の `project`。
 * 座標をそのまま画面の位置（px）として返し、テストが経度・緯度の値で画面上の距離を決められるようにする。
 */
const project = vi.hoisted(() =>
  vi.fn(([x, y]: [number, number]) => ({ x, y })),
);

/**
 * `react-map-gl/maplibre` の既定の export と差し替えるモック関数。
 * 受け取った props を記録し、`ref` がオブジェクトなら `panTo`・`easeTo`・`project`・`queryRenderedFeatures` を持つ地図を入れて、null を返す。
 */
const map = vi.hoisted(() =>
  vi.fn<(props: MockMapProps) => null>((props) => {
    if (typeof props.ref === "object" && props.ref !== null) {
      props.ref.current = {
        panTo,
        easeTo,
        project,
        queryRenderedFeatures,
      } as unknown as MapRef;
    }

    return null;
  }),
);

vi.mock("react-map-gl/maplibre", () => ({ default: map }));

// fetchEpisodes の Promise を解決させない。
// 解決すると act の外で setEpisodes が走り、props の受け渡しだけを検証するテストが取得の完了待ちになる。
vi.mock("@/lib/episodes", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/episodes")>()),
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
        name: "スパルタ",
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

/** スパルタと同じ座標に代表点を持つシリーズ。 */
const ATHENS: Series = { ...SPARTA, id: "athens", title: "アテネ" };

/** 重なる代表点を持つシリーズを含む、シリーズの全件。 */
const OVERLAPPING_SERIES: SeriesList = [SPARTA, ATHENS, OKANE];

/**
 * 19 世紀の区間の中央が era 空間の `INITIAL_POSITION` に当たる時代区分。
 * 19 世紀は末尾の区間なので、`INITIAL_POSITION` は区間を足したときに合わせて直す。
 */
const ERAS: EraList = [
  { id: "prehistory", label: "先史", start: -10000, end: -800 },
  { id: "ancient", label: "古代", start: -800, end: 550 },
  { id: "medieval", label: "中世", start: 550, end: 1800 },
  { id: "modern19", label: "19世紀", start: 1800, end: 1900 },
];

const INITIAL_POSITION = 0.875;

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
async function renderMapCanvas(
  eras: EraList = ERAS,
  seriesList: SeriesList = SERIES,
): Promise<void> {
  await act(async () => {
    render(
      <MapCanvas
        loci={LOCI}
        seriesList={seriesList}
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
 * `seriesIds` の代表点を同じ座標に持つ、地図のクリックのイベントを作る。
 * MapCanvas が読むのは feature の `seriesId` と座標だけなので、他の欄は埋めない。
 */
function mouseEventOn(...seriesIds: string[]): MapLayerMouseEvent {
  return {
    point: { x: 0, y: 0 },
    features: seriesIds.map((seriesId) => ({
      properties: { seriesId },
      geometry: { type: "Point", coordinates: [0, 0] },
    })),
  } as unknown as MapLayerMouseEvent;
}

/** `Locus` が無い地点のマウスイベントを作る。 */
function mouseEventOnBlank(): MapLayerMouseEvent {
  return {
    point: { x: 0, y: 0 },
    features: [],
  } as unknown as MapLayerMouseEvent;
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

  it("出典表記を、幅の狭い地図でもボタンに隠さず全文で出す", async () => {
    await renderMapCanvas();

    expect(lastProps().attributionControl).toEqual({ compact: false });
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

  it("era スライダーは 19 世紀の区間の中央から始まる", async () => {
    await renderMapCanvas();

    expect(eraSliderProps()).toMatchObject({
      eras: ERAS,
      presentEnd: PRESENT_END,
      position: INITIAL_POSITION,
    });
  });

  it("スライダーの位置から求めた現在窓を、シリーズのレイヤへ渡す", async () => {
    await renderMapCanvas();

    expect(childOfType(SeriesLayers)).toMatchObject({
      props: {
        currentWindow: currentWindow({
          position: INITIAL_POSITION,
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

  it("時代区分に 19 世紀が無ければ throw する", async () => {
    // React は描画中の throw を console.error にも書くので、テストの出力に載せない。
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(renderMapCanvas(ERAS.slice(0, 3))).rejects.toThrow("modern19");
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
            position: INITIAL_POSITION,
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
          position: INITIAL_POSITION,
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

/** 地図の children にある BottomSheet の props を返す。 */
function bottomSheetProps(): ComponentProps<typeof BottomSheet> {
  return childPropsOf(BottomSheet);
}

describe("MapCanvas（スマホの幅）", () => {
  beforeEach(() => {
    map.mockClear();
    stubDesktop(false);
    stubFetch({ ok: true, json: () => Promise.resolve(BASEMAP_STYLE) });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("一覧と詳細カードを 1 枚のシートに置き、一覧パネルと詳細カードの枠を置かない", async () => {
    await renderMapCanvas();

    expect(childOfType(BottomSheet)).toBeDefined();
    expect(childOfType(SeriesPanel)).toBeUndefined();
    expect(childOfType(SeriesDetailCard)).toBeUndefined();
  });

  it("シートは初期で era の段にして、一覧の見出しを出す", async () => {
    await renderMapCanvas();

    expect(bottomSheetProps()).toMatchObject({
      stage: "era",
      label: "シリーズ一覧",
    });
  });

  it("スマホの幅では、era スライダーをシートへ渡し、初期で出す設定にする", async () => {
    await renderMapCanvas();

    expect(bottomSheetProps().isEraSliderShown).toBe(true);
    expect(
      (bottomSheetProps().eraSlider as ReactElement<{ eras: EraList }>).props
        .eras,
    ).toBe(ERAS);
  });

  it("地図の点を押すと、シートを list の段にして詳細カードの中身を置く", async () => {
    await renderMapCanvas();

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));

    expect(bottomSheetProps().stage).toBe("list");
    expect(
      findElementOfType(bottomSheetProps().children, SeriesDetailBody),
    ).toBeDefined();
    expect(
      findElementOfType(bottomSheetProps().children, SeriesPanelBody),
    ).toBeUndefined();
  });

  it("詳細カードを閉じると、シートの段は変えず一覧の中身へ戻る", async () => {
    await renderMapCanvas();

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));

    act(() => childPropsOf(SeriesDetailBody).onClose());

    expect(bottomSheetProps().stage).toBe("list");
    expect(
      findElementOfType(bottomSheetProps().children, SeriesPanelBody),
    ).toBeDefined();
  });

  it("一覧でシリーズを選ぶと、シートを list の段にする", async () => {
    await renderMapCanvas();

    act(() => childPropsOf(SeriesPanelBody).onSelect("sparta"));

    expect(bottomSheetProps().stage).toBe("list");
  });
});

/**
 * シートが `list` の段の高さを報告したことにする。
 * 地図の部品のモックはシートを描かないので、シートが段の変更ごとに渡す高さを、ここで渡す。
 */
function reportListHeight(): void {
  act(() => bottomSheetProps().onTargetHeightChange(400));

  // 高さを報告した余白の同期は、選択の移動の検査の対象でないので、呼び出しの記録から外す。
  easeTo.mockClear();
}

describe("MapCanvas（スマホの幅の選択と段）", () => {
  beforeEach(() => {
    map.mockClear();
    panTo.mockClear();
    easeTo.mockClear();
    stubDesktop(false);
    stubFetch({ ok: true, json: () => Promise.resolve(BASEMAP_STYLE) });
    vi.stubGlobal("innerHeight", 800);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("full の段で一覧からシリーズを選ぶと、list の段へ縮む", async () => {
    await renderMapCanvas();

    act(() => bottomSheetProps().onStageChange("full"));
    act(() => childPropsOf(SeriesPanelBody).onSelect("sparta"));

    expect(bottomSheetProps().stage).toBe("list");
  });

  it("一覧でシリーズを選ぶと、代表点を list の段のシートに隠れない領域の中央へ移す", async () => {
    await renderMapCanvas();
    reportListHeight();

    act(() => childPropsOf(SeriesPanelBody).onSelect("sparta"));

    expect(easeTo).toHaveBeenLastCalledWith(
      expect.objectContaining({
        center: SPARTA_COORDINATES,
        padding: expect.objectContaining({ bottom: 400 }),
      }),
    );
    expect(panTo).not.toHaveBeenCalled();
  });

  it("地図の点を押すと、代表点を list の段のシートに隠れない領域の中央へ移す", async () => {
    await renderMapCanvas();
    reportListHeight();

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));

    expect(easeTo).toHaveBeenLastCalledWith(
      expect.objectContaining({
        center: SPARTA_COORDINATES,
        padding: expect.objectContaining({ bottom: 400 }),
      }),
    );
  });

  it("選択で list の段へ移った後に、余白だけの移動で選択の移動を打ち切らない", async () => {
    await renderMapCanvas();
    reportListHeight();

    act(() => childPropsOf(SeriesPanelBody).onSelect("sparta"));

    expect(easeTo).toHaveBeenCalledTimes(1);
  });
});

describe("MapCanvas（スマホの幅の余白の追随）", () => {
  beforeEach(() => {
    map.mockClear();
    easeTo.mockClear();
    stubDesktop(false);
    stubFetch({ ok: true, json: () => Promise.resolve(BASEMAP_STYLE) });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("シートの目標の高さが変わると、段が同じままでも、下端の余白をその高さに合わせる", async () => {
    await renderMapCanvas();

    act(() => bottomSheetProps().onTargetHeightChange(300));

    expect(easeTo).toHaveBeenLastCalledWith(
      expect.objectContaining({
        padding: expect.objectContaining({ bottom: 300 }),
      }),
    );

    act(() => bottomSheetProps().onTargetHeightChange(250));

    expect(easeTo).toHaveBeenLastCalledWith(
      expect.objectContaining({
        padding: expect.objectContaining({ bottom: 250 }),
      }),
    );
  });
});

describe("MapCanvas（重なった代表点の選び分け）", () => {
  beforeEach(() => {
    map.mockClear();
    stubDesktop(true);
    stubFetch({ ok: true, json: () => Promise.resolve(BASEMAP_STYLE) });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("同じ座標の事物を押すと、候補の一覧に 2 シリーズが並び、選択はまだ変わらない", async () => {
    await renderMapCanvas(ERAS, OVERLAPPING_SERIES);

    act(() => lastProps().onClick?.(mouseEventOn("sparta", "athens")));

    expect(
      childPropsOf(SeriesCandidateOverlay).candidates.map(({ id }) => id),
    ).toEqual(["sparta", "athens"]);
    expect(childOfType(SeriesDetailCard)).toBeUndefined();
    expect(seriesLayersProps().selectedSeries).toBeNull();
  });

  it.each(["sparta", "athens"])(
    "候補の一覧で %s の行を押すと、そのシリーズを選択して詳細カードを出し、候補の一覧を閉じる",
    async (seriesId) => {
      await renderMapCanvas(ERAS, OVERLAPPING_SERIES);
      act(() => lastProps().onClick?.(mouseEventOn("sparta", "athens")));

      act(() => childPropsOf(SeriesCandidateOverlay).onSelect(seriesId));

      expect(childOfType(SeriesCandidateOverlay)).toBeUndefined();
      expect(childPropsOf(SeriesDetailCard).series.id).toBe(seriesId);
    },
  );

  it("重ならない点を押すと、候補の一覧を出さずにそのまま選択する", async () => {
    await renderMapCanvas(ERAS, OVERLAPPING_SERIES);

    act(() => lastProps().onClick?.(mouseEventOn("sparta")));

    expect(childOfType(SeriesCandidateOverlay)).toBeUndefined();
    expect(childPropsOf(SeriesDetailCard).series.id).toBe("sparta");
  });

  it("候補が 0 件のクリックで、候補の一覧を閉じて選択を外す", async () => {
    await renderMapCanvas(ERAS, OVERLAPPING_SERIES);
    act(() => lastProps().onClick?.(mouseEventOn("sparta", "athens")));

    act(() => lastProps().onClick?.(mouseEventOnBlank()));

    expect(childOfType(SeriesCandidateOverlay)).toBeUndefined();
    expect(childOfType(SeriesDetailCard)).toBeUndefined();
  });
});

describe("MapCanvas（スマホの幅の重なった代表点の選び分け）", () => {
  beforeEach(() => {
    map.mockClear();
    stubDesktop(false);
    stubFetch({ ok: true, json: () => Promise.resolve(BASEMAP_STYLE) });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("同じ座標の事物を押すと、シートの段を変えず、地図の上の候補の一覧に 2 シリーズを並べる", async () => {
    await renderMapCanvas(ERAS, OVERLAPPING_SERIES);
    const stage = bottomSheetProps().stage;

    act(() => lastProps().onClick?.(mouseEventOn("sparta", "athens")));

    expect(bottomSheetProps().stage).toBe(stage);
    expect(
      childPropsOf(SeriesCandidateOverlay).candidates.map(({ id }) => id),
    ).toEqual(["sparta", "athens"]);
  });

  it("候補の一覧の行を押すと、そのシリーズの詳細カードの中身をシートに置く", async () => {
    await renderMapCanvas(ERAS, OVERLAPPING_SERIES);
    act(() => lastProps().onClick?.(mouseEventOn("sparta", "athens")));

    act(() => childPropsOf(SeriesCandidateOverlay).onSelect("athens"));

    expect(childOfType(SeriesCandidateOverlay)).toBeUndefined();
    expect(childPropsOf(SeriesDetailBody).series.id).toBe("athens");
  });
});

describe("MapCanvas（代表点へのホバー）", () => {
  /** `pointerType` の入力から来た、`seriesIds` の代表点の上のマウスイベントを作る。 */
  function moveOn(
    pointerType: string | undefined,
    ...seriesIds: string[]
  ): MapLayerMouseEvent {
    return {
      ...mouseEventOn(...seriesIds),
      originalEvent: pointerType === undefined ? undefined : { pointerType },
    } as unknown as MapLayerMouseEvent;
  }

  /** `ms` ミリ秒だけ時間を進める。 */
  function wait(ms: number): void {
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  }

  /** マウスを `seriesIds` の代表点に載せ、札が出るまでの待ちを明けさせる。 */
  function hoverAndWait(...seriesIds: string[]): void {
    act(() => lastProps().onMouseMove?.(moveOn("mouse", ...seriesIds)));
    wait(TOOLTIP_SHOW_DELAY_MS);
  }

  /**
   * 地図の children にある札が並べているシリーズの id を返す。
   * 札が無ければ undefined を返す。
   */
  function tooltipIds(): string[] | undefined {
    return childOfType(SeriesTooltip) === undefined
      ? undefined
      : childPropsOf(SeriesTooltip).series.map(({ id }) => id);
  }

  beforeEach(() => {
    map.mockClear();
    stubDesktop(true);
    stubFetch({ ok: true, json: () => Promise.resolve(BASEMAP_STYLE) });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // 描画の完了を待つ act は実時間の待ちを使うので、時間を止めるのは描画の後にする。
  async function renderWithFakeTimers(
    seriesList: SeriesList = SERIES,
  ): Promise<void> {
    await renderMapCanvas(ERAS, seriesList);
    vi.useFakeTimers();
  }

  it("マウスを代表点に載せても待ちが明けるまでは札を出さず、明けるとそのシリーズの札を出し、選択は変えない", async () => {
    await renderWithFakeTimers();

    act(() => lastProps().onMouseMove?.(moveOn("mouse", "sparta")));
    wait(TOOLTIP_SHOW_DELAY_MS - 1);

    expect(tooltipIds()).toBeUndefined();

    wait(1);

    expect(tooltipIds()).toEqual(["sparta"]);
    expect(seriesLayersProps().selectedSeries).toBeNull();
  });

  it("同じ代表点の上でマウスが動き続けても、待ちを延ばさず札を出す", async () => {
    await renderWithFakeTimers();

    act(() => lastProps().onMouseMove?.(moveOn("mouse", "sparta")));
    wait(TOOLTIP_SHOW_DELAY_MS - 100);
    act(() => lastProps().onMouseMove?.(moveOn("mouse", "sparta")));
    wait(100);

    expect(tooltipIds()).toEqual(["sparta"]);
  });

  it("待ちが明ける前に代表点から離れると、札を出さない", async () => {
    await renderWithFakeTimers();
    act(() => lastProps().onMouseMove?.(moveOn("mouse", "sparta")));
    wait(TOOLTIP_SHOW_DELAY_MS - 1);

    act(() => lastProps().onMouseMove?.(moveOn("mouse")));
    wait(TOOLTIP_SHOW_DELAY_MS);

    expect(tooltipIds()).toBeUndefined();
  });

  it("札が出た後に離すと、すぐに消す", async () => {
    await renderWithFakeTimers();
    hoverAndWait("sparta");

    act(() => lastProps().onMouseLeave?.(moveOn("mouse")));

    expect(tooltipIds()).toBeUndefined();
  });

  it("札が出ている間に別の代表点へ移ると、待たずにその札へ替える", async () => {
    await renderWithFakeTimers(OVERLAPPING_SERIES);
    hoverAndWait("sparta");

    act(() => lastProps().onMouseMove?.(moveOn("mouse", "okane-no-rekishi")));

    expect(tooltipIds()).toEqual(["okane-no-rekishi"]);
  });

  it("札が消えてから待たずに出せる時間の内に別の代表点へ載せると、待たずに出す", async () => {
    await renderWithFakeTimers();
    hoverAndWait("sparta");
    act(() => lastProps().onMouseMove?.(moveOn("mouse")));
    wait(TOOLTIP_SKIP_WINDOW_MS - 1);

    act(() => lastProps().onMouseMove?.(moveOn("mouse", "okane-no-rekishi")));

    expect(tooltipIds()).toEqual(["okane-no-rekishi"]);
  });

  it("札が消えてから待たずに出せる時間を過ぎると、また待ってから出す", async () => {
    await renderWithFakeTimers();
    hoverAndWait("sparta");
    act(() => lastProps().onMouseMove?.(moveOn("mouse")));
    wait(TOOLTIP_SKIP_WINDOW_MS);

    act(() => lastProps().onMouseMove?.(moveOn("mouse", "sparta")));

    expect(tooltipIds()).toBeUndefined();
  });

  it("重なった代表点に載せると、重なったシリーズを全部札に並べる", async () => {
    await renderWithFakeTimers(OVERLAPPING_SERIES);

    hoverAndWait("sparta", "athens");

    expect(tooltipIds()).toEqual(["sparta", "athens"]);
  });

  it("タッチの入力では札を出さず、押した代表点のシリーズを選択する", async () => {
    await renderWithFakeTimers();
    const touched = moveOn("touch", "sparta");

    queryRenderedFeatures.mockReturnValueOnce(touched.features as never);
    act(() => lastProps().onMouseMove?.(touched));
    wait(TOOLTIP_SHOW_DELAY_MS);
    act(() => lastProps().onClick?.(touched));

    expect(tooltipIds()).toBeUndefined();
    expect(seriesLayersProps().selectedSeries?.id).toBe("sparta");
  });

  it("候補の一覧が開いている間は、札を出さない", async () => {
    await renderWithFakeTimers(OVERLAPPING_SERIES);
    hoverAndWait("sparta", "athens");

    act(() => lastProps().onClick?.(moveOn("mouse", "sparta", "athens")));

    expect(childOfType(SeriesCandidateOverlay)).toBeDefined();
    expect(tooltipIds()).toBeUndefined();
  });
});
