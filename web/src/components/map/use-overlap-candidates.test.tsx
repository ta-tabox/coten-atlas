/**
 * 地図の実物を使わず、`queryRenderedFeatures`・`project`・`easeTo` だけを持つ偽の地図を `mapRef` に渡して、フックの振る舞いを見る。
 * 偽の地図の `project` は経度と緯度をそのまま画面の位置（px）にするので、テストは座標の値で画面上の距離を決められる。
 */

import { act, renderHook } from "@testing-library/react";
import type {
  MapLayerMouseEvent,
  MapRef,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOverlapCandidates } from "@/components/map/use-overlap-candidates";
import { SERIES_CIRCLE_LAYER } from "@/lib/map/layers/shared";
import type { Series, SeriesList } from "@/lib/schema/series";

const queryRenderedFeatures = vi.fn();
const easeTo = vi.fn();
/** 経度と緯度をそのまま画面の位置にする。 */
const project = vi.fn(([x, y]: [number, number]) => ({ x, y }));

const SPARTA: Series = {
  id: "sparta",
  title: "スパルタ",
  anchor: "sparta-city",
  timeRange: { start: -900, end: -200 },
  region: "ヨーロッパ",
  season: 2,
  links: {},
  tags: [],
};

const ATHENS: Series = { ...SPARTA, id: "athens", title: "アテネ" };

const SERIES: SeriesList = [SPARTA, ATHENS];

/** 画面の位置 (`x`, `y`) にある `seriesId` の代表点の feature。 */
function featureAt(seriesId: string, x = 0, y = 0) {
  return {
    properties: { seriesId },
    geometry: { type: "Point", coordinates: [x, y] },
  };
}

/**
 * 画面の位置 (`x`, `y`) のクリックのイベントを作る。
 * `features` はマウスの入力で MapLibre が押した位置の点として渡す値で、`pointerType` を渡すと `originalEvent` にその入力の種類を持たせる。
 */
function clickAt(
  features: ReturnType<typeof featureAt>[],
  options: { x?: number; y?: number; pointerType?: string } = {},
): MapLayerMouseEvent {
  const { x = 0, y = 0, pointerType } = options;

  return {
    point: { x, y },
    features,
    originalEvent: pointerType === undefined ? undefined : { pointerType },
  } as unknown as MapLayerMouseEvent;
}

/** 偽の地図を `mapRef` に持つフックを描画して、その結果を返す。 */
function renderOverlapHook() {
  const mapRef = {
    current: { queryRenderedFeatures, project, easeTo } as unknown as MapRef,
  };

  return renderHook(() => useOverlapCandidates({ mapRef, seriesList: SERIES }));
}

describe("useOverlapCandidates", () => {
  beforeEach(() => {
    queryRenderedFeatures.mockReset();
    easeTo.mockClear();
  });

  it("同じ座標の 2 シリーズを押すと、候補の一覧を開き、その点を地図の中央より少し下へ動かす", () => {
    const { result } = renderOverlapHook();

    act(() => {
      result.current.openCandidatesAt(
        clickAt([featureAt("sparta", 30, 40), featureAt("athens", 30, 40)], {
          x: 30,
          y: 40,
        }),
      );
    });

    expect(result.current.view?.candidates.map(({ id }) => id)).toEqual([
      "sparta",
      "athens",
    ]);
    expect(easeTo).toHaveBeenCalledWith(
      expect.objectContaining({ center: [30, 40], offset: [0, 100] }),
    );
  });

  it("1 シリーズだけを押したときは、候補の一覧を開かず、地図も動かさず、その id を返す", () => {
    const { result } = renderOverlapHook();
    let seriesIds: string[] = [];

    act(() => {
      seriesIds = result.current.openCandidatesAt(
        clickAt([featureAt("sparta")]),
      );
    });

    expect(seriesIds).toEqual(["sparta"]);
    expect(result.current.view).toBeNull();
    expect(easeTo).not.toHaveBeenCalled();
  });

  it("基準の点から 12px を超えて離れた点は、判定の範囲に入っていても候補に入れない", () => {
    const { result } = renderOverlapHook();

    act(() => {
      result.current.openCandidatesAt(
        clickAt([featureAt("sparta"), featureAt("athens", 13, 0)]),
      );
    });

    expect(result.current.view).toBeNull();
  });

  it("点に当たらないクリックは、開いている候補の一覧を閉じて、空配列を返す", () => {
    const { result } = renderOverlapHook();
    act(() => {
      result.current.openCandidatesAt(
        clickAt([featureAt("sparta"), featureAt("athens")]),
      );
    });
    let seriesIds: string[] = ["x"];

    act(() => {
      seriesIds = result.current.openCandidatesAt(clickAt([]));
    });

    expect(seriesIds).toEqual([]);
    expect(result.current.view).toBeNull();
  });

  it("タッチの入力では、押した位置の周り 44px 四方を調べ、点の中心から 20px 離れた点も拾う", () => {
    queryRenderedFeatures.mockReturnValue([featureAt("sparta", 20, 0)]);
    const { result } = renderOverlapHook();
    let seriesIds: string[] = [];

    act(() => {
      seriesIds = result.current.openCandidatesAt(
        clickAt([], { pointerType: "touch" }),
      );
    });

    expect(queryRenderedFeatures).toHaveBeenCalledWith(
      [
        [-22, -22],
        [22, 22],
      ],
      { layers: [SERIES_CIRCLE_LAYER.id] },
    );
    expect(seriesIds).toEqual(["sparta"]);
  });

  it.each(["mouse", undefined])(
    "pointerType が %s のクリックは、押した位置の点だけを使い、広げた範囲を調べない",
    (pointerType) => {
      queryRenderedFeatures.mockReturnValue([featureAt("sparta", 20, 0)]);
      const { result } = renderOverlapHook();
      let seriesIds: string[] = ["x"];

      act(() => {
        seriesIds = result.current.openCandidatesAt(
          clickAt([], { pointerType }),
        );
      });

      expect(queryRenderedFeatures).not.toHaveBeenCalled();
      expect(seriesIds).toEqual([]);
    },
  );

  it("利用者の操作で地図が動き始めると候補の一覧を閉じ、コードからの移動では閉じない", () => {
    const { result } = renderOverlapHook();
    act(() => {
      result.current.openCandidatesAt(
        clickAt([featureAt("sparta"), featureAt("athens")]),
      );
    });

    act(() =>
      result.current.closeOnUserMove({
        originalEvent: undefined,
      } as ViewStateChangeEvent),
    );

    expect(result.current.view).not.toBeNull();

    act(() =>
      result.current.closeOnUserMove({
        originalEvent: new MouseEvent("mousedown"),
      } as ViewStateChangeEvent),
    );

    expect(result.current.view).toBeNull();
  });

  it("地図が動くと、候補の一覧が指す位置を代表点の画面上の位置へ取り直す", () => {
    const { result } = renderOverlapHook();
    act(() => {
      result.current.openCandidatesAt(
        clickAt([featureAt("sparta", 10, 40), featureAt("athens", 10, 40)], {
          x: 10,
          y: 40,
        }),
      );
    });

    project.mockReturnValueOnce({ x: 60, y: 80 });
    act(() => result.current.updateAnchor());

    expect(result.current.view?.anchor).toEqual({ x: 60, y: 80 });
  });

  it("画面の幅が変わると、開いている候補の一覧を閉じる", () => {
    const { result } = renderOverlapHook();
    act(() => {
      result.current.openCandidatesAt(
        clickAt([featureAt("sparta"), featureAt("athens")]),
      );
    });

    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current.view).toBeNull();
  });

  it("close を呼ぶと、候補の一覧を閉じる", () => {
    const { result } = renderOverlapHook();
    act(() => {
      result.current.openCandidatesAt(
        clickAt([featureAt("sparta"), featureAt("athens")]),
      );
    });

    act(() => result.current.close());

    expect(result.current.view).toBeNull();
  });
});
