"use client";

/**
 * 管理画面のベースマップを描き、編集の機能ごとのレイヤを子に重ねる部品を置く。
 *
 * 事物の描き方とマウスの操作は持たず、子に置く各機能のレイヤ（例えば代表点をドラッグする `AnchorDragLayer`）が `useMap` で地図を受け取って持つ。
 * 機能を足すときは、この部品を変えずに子のレイヤを足すか差し替える。
 */

import { type ReactNode, useEffect, useRef } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import MapLibreMap from "react-map-gl/maplibre";
import {
  BASEMAP_STYLE_URL,
  INITIAL_VIEW_STATE,
  MAP_WORKER_URL,
} from "@/lib/map/config";

/** 地図の中心を移すのにかける時間（ミリ秒）。 */
const PAN_DURATION_MS = 800;

/**
 * 地図の中心を移す先。
 * 同じ座標へもう一度移せるよう、移すたびに新しいオブジェクトを渡す。
 */
export type PanTarget = { coordinates: [number, number] };

type EditorMapProps = {
  /**
   * 地図の中心を移す先。
   * 移さないなら null。
   */
  panTarget: PanTarget | null;
  /** 地図に重ねる編集の機能のレイヤ。 */
  children: ReactNode;
};

/** ベースマップを描き、`panTarget` が変わるたびにそこへ中心を移し、子のレイヤを重ねる。 */
export default function EditorMap({ panTarget, children }: EditorMapProps) {
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (panTarget === null) {
      return;
    }

    mapRef.current?.panTo(panTarget.coordinates, {
      duration: PAN_DURATION_MS,
    });
  }, [panTarget]);

  // attributionControl は渡さない。
  // OpenFreeMap は出典の表示を利用条件にしており、false を渡すと既定の AttributionControl ごと表示が消える。
  // cursor も渡さない。
  // 渡すと react-map-gl が canvas のポインタの形を上書きし、子のレイヤが設定した形が消える。
  return (
    <MapLibreMap
      ref={mapRef}
      mapStyle={BASEMAP_STYLE_URL}
      initialViewState={INITIAL_VIEW_STATE}
      workerUrl={MAP_WORKER_URL}
      // MapLibreMap は container の `className` を受け取らないので、寸法は style で渡す。
      style={{ width: "100%", height: "100dvh" }}
    >
      {children}
    </MapLibreMap>
  );
}
