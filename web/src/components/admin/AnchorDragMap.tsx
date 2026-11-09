"use client";

/**
 * 管理画面の地図に事物の全件を円で描き、円のドラッグで座標を書き換える部品を置く。
 *
 * 保存は持たず、動かして離した位置を `onDrop` で返す。
 * ドラッグの間だけ動かした座標をこの部品の state に持ち、事物の全件（`loci`）は書き換えない。
 * 円は `<Marker>` でなく円のレイヤで描き、レイヤの mousedown・mousemove・mouseup でドラッグを組む。
 */

import { useEffect, useRef, useState } from "react";
import type { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import MapLibreMap, { Layer, Source } from "react-map-gl/maplibre";
import {
  BASEMAP_STYLE_URL,
  INITIAL_VIEW_STATE,
  MAP_WORKER_URL,
} from "@/lib/map/config";
import type { LocusCollection } from "@/lib/schema/locus";
import type { LocusMove } from "@/lib/schema/locus-move";

/** 事物を載せる source の id。 */
const LOCI_SOURCE_ID = "admin-loci";

/** 事物を描く円のレイヤの id。 */
const LOCI_CIRCLE_LAYER_ID = "admin-loci-circle";

/** 選択中のシリーズの事物へ、地図の中心を移すのにかける時間（ミリ秒）。 */
const PAN_DURATION_MS = 800;

/**
 * 地図の中心を移す先。
 * 同じ座標へもう一度移せるよう、選ぶたびに新しいオブジェクトを渡す。
 */
export type PanTarget = { coordinates: [number, number] };

type AnchorDragMapProps = {
  /** 地図に描く事物の全件。 */
  loci: LocusCollection;
  /**
   * 色を変えて描くシリーズの id。
   * 選択が無ければ null。
   */
  selectedSeriesId: string | null;
  /**
   * 地図の中心を移す先。
   * 移さないなら null。
   */
  panTarget: PanTarget | null;
  /** 円を動かして離したときに、事物の `id` と離した位置を渡して呼ぶ。 */
  onDrop: (move: LocusMove) => void;
};

/**
 * `event` の最前面にある事物の `id` を返す。
 * 事物が無い地点なら null を返す。
 *
 * MapLibre は `properties` の値を `any` で返すので、文字列でなければ null にする。
 */
function locusIdOf(event: MapLayerMouseEvent): string | null {
  const id = event.features?.[0]?.properties.id;

  return typeof id === "string" ? id : null;
}

/**
 * 掴んでいる事物の状態。
 * `offset` は掴んだ点から円の中心までの `[経度, 緯度]` の差で、動かしても円がポインタの位置へ跳ばないように保つ。
 * `hasMoved` は掴んでから一度でも動かしたかで、押して離しただけの操作を保存しないために見る。
 */
type Dragging = LocusMove & {
  offset: [number, number];
  hasMoved: boolean;
};

/** 事物の全件（`loci`）のうち、ドラッグ中の事物（`dragging`）の座標だけを動かした全件を返す。 */
function withDragging(
  loci: LocusCollection,
  dragging: Dragging | null,
): LocusCollection {
  if (dragging === null) {
    return loci;
  }

  return {
    ...loci,
    features: loci.features.map((feature) =>
      feature.properties.id === dragging.id
        ? {
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: dragging.coordinates,
            },
          }
        : feature,
    ),
  };
}

/**
 * 地図の上のポインタの形を返す。
 * 掴んでいる間は grabbing、円の上では grab で、それ以外は undefined を返して MapLibre の既定に任せる。
 */
function cursorOf(
  isDragging: boolean,
  isHoveringLocus: boolean,
): string | undefined {
  if (isDragging) {
    return "grabbing";
  }

  return isHoveringLocus ? "grab" : undefined;
}

/**
 * ベースマップの上に事物の全件（`loci`）を円で描き、選択中のシリーズの円を色を変えて描く。
 * 円を掴んで動かす間は地図のパンを止め、離したら `onDrop` を呼ぶ。
 */
export default function AnchorDragMap({
  loci,
  selectedSeriesId,
  panTarget,
  onDrop,
}: AnchorDragMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [dragging, setDragging] = useState<Dragging | null>(null);
  const [isHoveringLocus, setIsHoveringLocus] = useState(false);

  useEffect(() => {
    if (panTarget === null) {
      return;
    }

    mapRef.current?.panTo(panTarget.coordinates, {
      duration: PAN_DURATION_MS,
    });
  }, [panTarget]);

  /** 円の上で押されたら、その事物を、掴んだ点と円の中心の差を覚えて掴む。 */
  function grab(event: MapLayerMouseEvent): void {
    const id = locusIdOf(event);
    const locus = loci.features.find((feature) => feature.properties.id === id);

    if (id === null || locus === undefined) {
      return;
    }

    // mousedown の既定の動作は地図のパンなので、止めないと円と一緒に地図も動く。
    event.preventDefault();

    const [longitude, latitude] = locus.geometry.coordinates;

    setDragging({
      id,
      coordinates: locus.geometry.coordinates,
      offset: [longitude - event.lngLat.lng, latitude - event.lngLat.lat],
      hasMoved: false,
    });
  }

  /** 掴んでいる事物の中心を、掴んだ点との差を保ったままポインタに合わせて動かす。 */
  function drag(event: MapLayerMouseEvent): void {
    if (dragging === null) {
      return;
    }

    const [offsetLongitude, offsetLatitude] = dragging.offset;

    setDragging({
      ...dragging,
      coordinates: [
        event.lngLat.lng + offsetLongitude,
        event.lngLat.lat + offsetLatitude,
      ],
      hasMoved: true,
    });
  }

  /**
   * 掴んでいる事物を放し、動かしていれば中心の位置を `onDrop` へ渡す。
   * 押して離しただけなら `onDrop` を呼ばない。
   */
  function drop(): void {
    if (dragging === null) {
      return;
    }

    setDragging(null);

    if (dragging.hasMoved) {
      onDrop({ id: dragging.id, coordinates: dragging.coordinates });
    }
  }

  // attributionControl は渡さない。
  // OpenFreeMap は出典の表示を利用条件にしており、false を渡すと既定の AttributionControl ごと表示が消える。
  return (
    <MapLibreMap
      ref={mapRef}
      mapStyle={BASEMAP_STYLE_URL}
      initialViewState={INITIAL_VIEW_STATE}
      workerUrl={MAP_WORKER_URL}
      // MapLibreMap は container の `className` を受け取らないので、寸法は style で渡す。
      style={{ width: "100%", height: "100dvh" }}
      interactiveLayerIds={[LOCI_CIRCLE_LAYER_ID]}
      cursor={cursorOf(dragging !== null, isHoveringLocus)}
      onMouseEnter={() => setIsHoveringLocus(true)}
      onMouseLeave={() => setIsHoveringLocus(false)}
      onMouseDown={grab}
      onMouseMove={drag}
      onMouseUp={drop}
    >
      <Source
        id={LOCI_SOURCE_ID}
        type="geojson"
        data={withDragging(loci, dragging)}
      >
        <Layer
          id={LOCI_CIRCLE_LAYER_ID}
          type="circle"
          paint={{
            "circle-radius": 7,
            // 選択中のシリーズの円は、一覧の選択中の行の左の太線（Tailwind の `orange-700`）と同じ色にする。
            "circle-color": [
              "case",
              ["==", ["get", "seriesId"], selectedSeriesId ?? ""],
              "#c2410c",
              "#1f5673",
            ],
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#ffffff",
          }}
        />
      </Source>
    </MapLibreMap>
  );
}
