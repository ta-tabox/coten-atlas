"use client";

/**
 * 管理画面の地図に事物の全件を円で描き、円のドラッグで事物の座標を書き換える機能のレイヤを置く。
 * `EditorMap` の子に置き、地図は `useMap` で受け取る。
 *
 * 保存は持たず、動かして離した位置を `onDrop` で返す。
 * ドラッグの間だけ動かした座標をこの部品の state に持ち、事物の全件（`loci`）は書き換えない。
 */

import type { MapMouseEvent } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";
import type { LocusCollection } from "@/lib/schema/locus";
import type { LocusPatch } from "@/lib/schema/locus-patch";

/** 事物を載せる source の id。 */
const LOCI_SOURCE_ID = "admin-loci";

/** 事物を描く円のレイヤの id。 */
const LOCI_CIRCLE_LAYER_ID = "admin-loci-circle";

type AnchorDragLayerProps = {
  /** 地図に描く事物の全件。 */
  loci: LocusCollection;
  /**
   * 色を変えて描くシリーズの id。
   * 選択が無ければ null。
   */
  selectedSeriesId: string | null;
  /** 円を動かして離したときに、事物の `id` と離した位置を渡して呼ぶ。 */
  onDrop: (patch: LocusPatch) => void;
};

/**
 * 掴んでいる事物の状態。
 * `offset` は掴んだ点から円の中心までの `[経度, 緯度]` の差で、動かしても円がポインタの位置へ跳ばないように保つ。
 * `hasMoved` は掴んでから一度でも動かしたかで、押して離しただけの操作を保存しないために見る。
 */
type Dragging = LocusPatch & {
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
 * 事物の全件（`loci`）を円で描き、選択中のシリーズの円を色を変えて描く。
 * 円を掴んで動かす間は地図のパンを止め、動かして離したら `onDrop` を呼ぶ。
 */
export default function AnchorDragLayer({
  loci,
  selectedSeriesId,
  onDrop,
}: AnchorDragLayerProps) {
  const { current: mapRef } = useMap();
  const [dragging, setDragging] = useState<Dragging | null>(null);

  // 地図のイベントの購読は地図ごとに一度だけ張るので、購読の中からは props と state の最新の値を ref で読む。
  const draggingRef = useRef<Dragging | null>(null);
  const lociRef = useRef(loci);
  const onDropRef = useRef(onDrop);

  useEffect(() => {
    lociRef.current = loci;
    onDropRef.current = onDrop;
  }, [loci, onDrop]);

  useEffect(() => {
    const map = mapRef?.getMap();

    if (map === undefined) {
      return;
    }

    const canvas = map.getCanvas();

    /** 掴んでいる事物の状態を、描画用の state と購読用の ref の両方へ書く。 */
    function setCurrentDragging(next: Dragging | null): void {
      draggingRef.current = next;
      setDragging(next);
    }

    /** `event` の位置にある事物の `id` を返し、円が無い位置か円のレイヤがまだ無いときは null を返す。 */
    function locusIdAt(event: MapMouseEvent): string | null {
      if (
        map === undefined ||
        map.getLayer(LOCI_CIRCLE_LAYER_ID) === undefined
      ) {
        return null;
      }

      const [feature] = map.queryRenderedFeatures(event.point, {
        layers: [LOCI_CIRCLE_LAYER_ID],
      });
      const id = feature?.properties.id;

      return typeof id === "string" ? id : null;
    }

    /** 円の上で押されたら、その事物を、掴んだ点と円の中心の差を覚えて掴む。 */
    function grab(event: MapMouseEvent): void {
      const id = locusIdAt(event);
      const locus = lociRef.current.features.find(
        (feature) => feature.properties.id === id,
      );

      if (id === null || locus === undefined) {
        return;
      }

      // mousedown の既定の動作は地図のパンなので、止めないと円と一緒に地図も動く。
      event.preventDefault();
      canvas.style.cursor = "grabbing";

      const [longitude, latitude] = locus.geometry.coordinates;

      setCurrentDragging({
        id,
        coordinates: locus.geometry.coordinates,
        offset: [longitude - event.lngLat.lng, latitude - event.lngLat.lat],
        hasMoved: false,
      });
    }

    /** 掴んでいれば事物の中心を掴んだ点との差を保って動かし、掴んでいなければ円の上でだけポインタを grab の形にする。 */
    function move(event: MapMouseEvent): void {
      const current = draggingRef.current;

      if (current === null) {
        canvas.style.cursor = locusIdAt(event) === null ? "" : "grab";
        return;
      }

      const [offsetLongitude, offsetLatitude] = current.offset;

      setCurrentDragging({
        ...current,
        coordinates: [
          event.lngLat.lng + offsetLongitude,
          event.lngLat.lat + offsetLatitude,
        ],
        hasMoved: true,
      });
    }

    /** 掴んでいる事物を放し、動かしていれば中心の位置を `onDrop` へ渡す。 */
    function drop(): void {
      const current = draggingRef.current;

      if (current === null) {
        return;
      }

      setCurrentDragging(null);
      canvas.style.cursor = "";

      if (current.hasMoved) {
        onDropRef.current({ id: current.id, coordinates: current.coordinates });
      }
    }

    map.on("mousedown", grab);
    map.on("mousemove", move);
    map.on("mouseup", drop);

    return () => {
      map.off("mousedown", grab);
      map.off("mousemove", move);
      map.off("mouseup", drop);
    };
  }, [mapRef]);

  return (
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
  );
}
