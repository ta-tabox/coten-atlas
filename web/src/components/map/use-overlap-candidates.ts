"use client";

/**
 * 地図のクリックで重なった代表点を候補のシリーズに決め、候補の一覧が指す代表点の状態を持つフックを置く。
 *
 * 重なった点を押すと、その点を地図の中央より少し下へ動かす。
 * 候補の一覧が点の上に出ても、ヘッダーに隠れず、スマホの幅のシートにも重ならない高さを空けるためである。
 */

import { type RefObject, useCallback, useEffect, useState } from "react";
import type {
  MapLayerMouseEvent,
  MapRef,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import { SERIES_CIRCLE_LAYER } from "@/lib/map/layers/shared";
import {
  type CandidatePoint,
  candidateSeriesIdsOf,
  type ScreenPoint,
} from "@/lib/map/overlap-candidates";
import type { Series, SeriesList } from "@/lib/schema/series";

/**
 * タッチの入力で、押した位置の周りの判定の範囲の一辺の半分（px）。
 * 一辺 44px は Apple HIG の最小のタップ領域で、見える円（半径 6px）は変えない。
 */
const TOUCH_HIT_HALF_SIZE_PX = 22;

/**
 * 重なった代表点を地図の中央から下へずらして置く距離（px）。
 * 代表点の上に出る候補の一覧が収まる高さを空ける。
 */
const OVERLAP_POINT_OFFSET_PX = 100;

/** 重なった代表点へ地図の中心を移すのにかける時間（ミリ秒）。 */
const OVERLAP_PAN_DURATION_MS = 400;

/** 地図のクリックが当たった代表点の、画面上の位置・シリーズ・経度と緯度。 */
type PointUnder = CandidatePoint & { coordinates: [number, number] };

/**
 * 候補の一覧が指す重なった代表点。
 * `anchor` は代表点の画面上の位置で、地図が動くたびに更新する。
 */
type OverlapState = {
  seriesIds: string[];
  coordinates: [number, number];
  anchor: ScreenPoint;
};

/** 候補の一覧を描くのに要る値。 */
export type OverlapView = {
  /** 押した位置に近い順の候補。 */
  candidates: Series[];
  /** 候補の一覧が指す代表点の、画面上の位置。 */
  anchor: ScreenPoint;
};

type UseOverlapCandidatesArgs = {
  mapRef: RefObject<MapRef | null>;
  seriesList: SeriesList;
};

/**
 * 地図のクリックが当たった代表点の、画面上の位置とシリーズを返す。
 *
 * タッチの入力は押した位置の周り 44px 四方、それ以外は押した位置の点だけを調べる。
 * `PointerEvent.pointerType` を持たないクリックはマウスとして扱うので、そのような端末のタッチは判定が円の大きさに留まる。
 */
function pointsUnder(map: MapRef, event: MapLayerMouseEvent): PointUnder[] {
  const original = event.originalEvent;
  const isTouch =
    original !== undefined &&
    "pointerType" in original &&
    original.pointerType === "touch";
  const { x, y } = event.point;
  const features = isTouch
    ? map.queryRenderedFeatures(
        [
          [x - TOUCH_HIT_HALF_SIZE_PX, y - TOUCH_HIT_HALF_SIZE_PX],
          [x + TOUCH_HIT_HALF_SIZE_PX, y + TOUCH_HIT_HALF_SIZE_PX],
        ],
        { layers: [SERIES_CIRCLE_LAYER.id] },
      )
    : event.features;

  return (features ?? []).flatMap((feature) => {
    const { seriesId } = feature.properties;

    if (typeof seriesId !== "string" || feature.geometry.type !== "Point") {
      return [];
    }

    const [longitude, latitude] = feature.geometry.coordinates;
    const screen = map.project([longitude, latitude]);

    return [
      {
        x: screen.x,
        y: screen.y,
        seriesId,
        coordinates: [longitude, latitude],
      },
    ];
  });
}

/**
 * 重なった代表点の候補の状態を持ち、地図のクリックと移動から更新する。
 * `view` は候補の一覧を出すときだけ値を持ち、閉じているときは null である。
 */
export function useOverlapCandidates({
  mapRef,
  seriesList,
}: UseOverlapCandidatesArgs) {
  const [overlap, setOverlap] = useState<OverlapState | null>(null);
  const close = useCallback(() => setOverlap(null), []);
  const isOpen = overlap !== null;

  // 吹き出しの水平位置は画面の幅から決まるので、幅が変わる回転やリサイズで閉じる。
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    window.addEventListener("resize", close);

    return () => window.removeEventListener("resize", close);
  }, [isOpen, close]);

  /**
   * クリックが当たった代表点のシリーズ id を、押した位置に近い順で返す。
   * 2 件以上なら、候補の一覧を開いて重なった点を中央より少し下へ動かす。
   * 1 件以下なら、開いている候補の一覧を閉じる。
   */
  function openCandidatesAt(event: MapLayerMouseEvent): string[] {
    const map = mapRef.current;
    const points = map === null ? [] : pointsUnder(map, event);
    const seriesIds = candidateSeriesIdsOf(event.point, points);
    const nearest = points.find((point) => point.seriesId === seriesIds[0]);

    if (seriesIds.length < 2 || map === null || nearest === undefined) {
      setOverlap(null);

      return seriesIds;
    }

    setOverlap({
      seriesIds,
      coordinates: nearest.coordinates,
      anchor: { x: nearest.x, y: nearest.y },
    });
    map.easeTo({
      center: nearest.coordinates,
      offset: [0, OVERLAP_POINT_OFFSET_PX],
      duration: OVERLAP_PAN_DURATION_MS,
    });

    return seriesIds;
  }

  /**
   * 利用者の操作で地図が動き始めたとき、候補の一覧を閉じる。
   * コードからの移動（余白の調整・選択の移動）では閉じない。
   */
  function closeOnUserMove(event: ViewStateChangeEvent): void {
    if (event.originalEvent !== undefined) {
      close();
    }
  }

  /** 地図が動くたびに、候補の一覧が指す代表点の画面上の位置を取り直す。 */
  function updateAnchor(): void {
    const map = mapRef.current;

    if (map === null) {
      return;
    }

    setOverlap((current) => {
      if (current === null) {
        return null;
      }

      const { x, y } = map.project(current.coordinates);

      return { ...current, anchor: { x, y } };
    });
  }

  const view: OverlapView | null =
    overlap === null
      ? null
      : {
          candidates: overlap.seriesIds.flatMap((seriesId) => {
            const found = seriesList.find((series) => series.id === seriesId);

            return found === undefined ? [] : [found];
          }),
          anchor: overlap.anchor,
        };

  return { view, openCandidatesAt, close, closeOnUserMove, updateAnchor };
}
