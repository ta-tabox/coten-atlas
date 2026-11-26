"use client";

/**
 * 地図のマウスイベントが当たった代表点を、画面上の位置とシリーズに直す関数を置く。
 * 当たった点からどのシリーズを候補にするかは持たず、`@/lib/map/overlap-candidates` が持つ。
 */

import type { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import { SERIES_CIRCLE_LAYER } from "@/lib/map/layers/shared";
import type { CandidatePoint } from "@/lib/map/overlap-candidates";

/**
 * タッチの入力で、押した位置の周りの判定の範囲の一辺の半分（px）。
 * 一辺 44px は Apple HIG の最小のタップ領域で、見える円（半径 6px）は変えない。
 */
const TOUCH_HIT_HALF_SIZE_PX = 22;

/** 地図のクリックが当たった代表点の、画面上の位置・シリーズ・経度と緯度。 */
type PointUnder = CandidatePoint & { coordinates: [number, number] };

/**
 * 地図のクリックが当たった代表点の、画面上の位置とシリーズを返す。
 *
 * タッチの入力は押した位置の周り 44px 四方、それ以外は押した位置の点だけを調べる。
 * `PointerEvent.pointerType` を持たないクリックはマウスとして扱うので、そのような端末のタッチは判定が円の大きさに留まる。
 */
export function pointsUnder(
  map: MapRef,
  event: MapLayerMouseEvent,
): PointUnder[] {
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
