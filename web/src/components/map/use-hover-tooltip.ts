"use client";

/**
 * マウスを載せた代表点のシリーズと、ツールチップが指す画面上の位置の状態を持つフックを置く。
 * タッチの入力は載せたことにしないので、スマホの幅ではツールチップが出ない。
 *
 * 重なった代表点の選び分けは持たない。
 * 載せた位置で重なる点は、クリックと同じ関数（`candidateSeriesIdsOf`）で候補に決める。
 */

import { type RefObject, useState } from "react";
import type {
  MapLayerMouseEvent,
  MapRef,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import { isTouchEvent, pointsUnder } from "@/components/map/points-under";
import {
  candidateSeriesIdsOf,
  type ScreenPoint,
} from "@/lib/map/overlap-candidates";
import type { Series, SeriesList } from "@/lib/schema/series";

/**
 * マウスを載せた代表点。
 * `anchor` は代表点の画面上の位置で、地図が動くたびに更新する。
 */
type HoverState = {
  seriesIds: string[];
  coordinates: [number, number];
  anchor: ScreenPoint;
};

/** ツールチップを描くのに要る値。 */
export type HoverView = {
  /** 載せた位置に近い順のシリーズ。 */
  series: Series[];
  /** ツールチップが指す代表点の、画面上の位置。 */
  anchor: ScreenPoint;
};

type UseHoverTooltipArgs = {
  mapRef: RefObject<MapRef | null>;
  seriesList: SeriesList;
};

/**
 * マウスを載せた代表点の状態を持ち、地図のマウスの移動と地図の移動から更新する。
 * `view` はツールチップを出すときだけ値を持ち、出さないときは null である。
 */
export function useHoverTooltip({ mapRef, seriesList }: UseHoverTooltipArgs) {
  const [hover, setHover] = useState<HoverState | null>(null);

  /** ツールチップを消す。 */
  function clear(): void {
    setHover(null);
  }

  /**
   * マウスの位置の代表点を、ツールチップに出す対象にする。
   * 代表点が無い位置と、タッチの入力では、ツールチップを消す。
   */
  function updateAt(event: MapLayerMouseEvent): void {
    const map = mapRef.current;
    const points =
      map === null || isTouchEvent(event) ? [] : pointsUnder(map, event);
    const seriesIds = candidateSeriesIdsOf(event.point, points);
    const nearest = points.find((point) => point.seriesId === seriesIds[0]);

    if (nearest === undefined) {
      clear();

      return;
    }

    setHover((current) => {
      const isSame =
        current !== null &&
        current.anchor.x === nearest.x &&
        current.anchor.y === nearest.y &&
        current.seriesIds.join() === seriesIds.join();

      return isSame
        ? current
        : {
            seriesIds,
            coordinates: nearest.coordinates,
            anchor: { x: nearest.x, y: nearest.y },
          };
    });
  }

  /** 利用者の操作で地図が動き始めたとき、ツールチップを消す。 */
  function clearOnUserMove(event: ViewStateChangeEvent): void {
    if (event.originalEvent !== undefined) {
      clear();
    }
  }

  /** 地図が動くたびに、ツールチップが指す代表点の画面上の位置を取り直す。 */
  function updateAnchor(): void {
    const map = mapRef.current;

    if (map === null) {
      return;
    }

    setHover((current) => {
      if (current === null) {
        return null;
      }

      const { x, y } = map.project(current.coordinates);

      return { ...current, anchor: { x, y } };
    });
  }

  const view: HoverView | null =
    hover === null
      ? null
      : {
          series: hover.seriesIds.flatMap((seriesId) => {
            const found = seriesList.find((series) => series.id === seriesId);

            return found === undefined ? [] : [found];
          }),
          anchor: hover.anchor,
        };

  return { view, updateAt, clear, clearOnUserMove, updateAnchor };
}
