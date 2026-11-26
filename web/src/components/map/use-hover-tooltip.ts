"use client";

/**
 * マウスを載せた代表点のシリーズと、ツールチップが指す画面上の位置の状態を持つフックを置く。
 * タッチの入力は載せたことにしないので、スマホの幅ではツールチップが出ない。
 *
 * 重なった代表点の選び分けは持たない。
 * 載せた位置で重なる点は、クリックと同じ関数（`candidateSeriesIdsOf`）で候補に決める。
 *
 * マウスが通り過ぎるだけで札が出続けないよう、代表点に載せてから `TOOLTIP_SHOW_DELAY_MS` 待って出す。
 * 札が出ている間と、消えてから `TOOLTIP_SKIP_WINDOW_MS` 以内は、隣の代表点へ移ったときに待たず出す。
 * 点を見比べる操作で、点ごとに待たされないためである。
 */

import { type RefObject, useEffect, useRef, useState } from "react";
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
 * 代表点に載せてから札を出すまで待つ時間（ミリ秒）。
 * 150 未満だと通り過ぎるだけのマウスで札が開き、250 を超えると意図して載せたときの反応が鈍い。
 */
export const TOOLTIP_SHOW_DELAY_MS = 200;

/**
 * 札が消えてから、待たずに次の札を出せる時間（ミリ秒）。
 * 隣の点へ移る操作には足りる長さで、別の操作のあとには待ちへ戻る長さである。
 */
export const TOOLTIP_SKIP_WINDOW_MS = 300;

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

  // 待っている札の対象。
  // 同じ代表点の上でマウスが動くたびに待ち直すと、動き続ける限り札が出ないので、対象が変わるまで待ちを続ける。
  const pending = useRef<HoverState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hiddenAt = useRef<number | null>(null);

  function cancelPending(): void {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    pending.current = null;
  }

  // アンマウント後に待ちが明けて setHover を呼ばない。
  useEffect(
    () => () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  /** 待っている札を取りやめ、出ている札を消す。 */
  function clear(): void {
    cancelPending();

    if (hover !== null) {
      hiddenAt.current = Date.now();
    }

    setHover(null);
  }

  /** `target` の札を出し、`target` の代表点の位置を地図から取り直す。 */
  function show(target: HoverState): void {
    cancelPending();

    const map = mapRef.current;
    const projected = map?.project(target.coordinates);

    setHover({
      ...target,
      anchor:
        projected === undefined
          ? target.anchor
          : { x: projected.x, y: projected.y },
    });
  }

  function isSkippingDelay(): boolean {
    return (
      hover !== null ||
      (hiddenAt.current !== null &&
        Date.now() - hiddenAt.current < TOOLTIP_SKIP_WINDOW_MS)
    );
  }

  /**
   * マウスの位置の代表点を、ツールチップに出す対象にする。
   * 代表点が無い位置と、タッチの入力では、ツールチップを消す。
   * 札が出ていないときは、`TOOLTIP_SHOW_DELAY_MS` 待ってから出す。
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

    const target: HoverState = {
      seriesIds,
      coordinates: nearest.coordinates,
      anchor: { x: nearest.x, y: nearest.y },
    };
    const key = seriesIds.join();

    if (isSkippingDelay()) {
      if (
        hover?.seriesIds.join() !== key ||
        hover.anchor.x !== nearest.x ||
        hover.anchor.y !== nearest.y
      ) {
        show(target);
      }

      return;
    }

    if (pending.current?.seriesIds.join() === key) {
      pending.current = target;

      return;
    }

    cancelPending();
    pending.current = target;
    timer.current = setTimeout(() => {
      if (pending.current !== null) {
        show(pending.current);
      }
    }, TOOLTIP_SHOW_DELAY_MS);
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
