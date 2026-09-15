"use client";

/**
 * 地図の画面を組み立てる。
 * ベースマップを画面いっぱいに描き、その上に重ねる部品を子に並べる。
 *
 * 画面の複数の部品が読む状態はこのコンポーネントが持ち、子へは props で渡す。
 */

import { useEffect, useRef, useState } from "react";
import type { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import MapLibreMap from "react-map-gl/maplibre";
import EraSlider from "@/components/era-slider/EraSlider";
import SeriesLayers from "@/components/map/SeriesLayers";
import SeriesDetailCard from "@/components/series-detail/SeriesDetailCard";
import SeriesPanel from "@/components/series-panel/SeriesPanel";
import {
  type EpisodesState,
  episodesForSeries,
  fetchEpisodes,
} from "@/lib/episodes";
import { currentWindow } from "@/lib/era/window";
import {
  BASEMAP_STYLE_URL,
  INITIAL_VIEW_STATE,
  MAP_WORKER_URL,
} from "@/lib/map/config";
import { findAnchorLocus, type MapLocusCollection } from "@/lib/map/loci";
import { SERIES_CIRCLE_LAYER } from "@/lib/map/series-layer";
import { seriesPanelSectionsOf } from "@/lib/map/series-panel";
import type { EraList } from "@/lib/schema/era";
import type { Series, SeriesList } from "@/lib/schema/series";

/**
 * 地図を開いたときに、era スライダーが指す era の id。
 * 古代を選んだ理由は docs/adr/0043-era-fade-window-only.md が持つ。
 */
const INITIAL_ERA_ID = "ancient";

/** 一覧パネルで選んだシリーズの代表点へ、地図の中心を移すのにかける時間（ミリ秒）。 */
const PAN_DURATION_MS = 1200;

type MapCanvasProps = {
  /** 地図へ渡す形に組んだ事物の全件。 */
  loci: MapLocusCollection;
  /**
   * シリーズの全件。
   * 地図のクリックが返すのは `Locus` なので、`seriesId` に一致する `Series` をこの配列から検索する。
   */
  series: SeriesList;
  /** era スライダーの目盛りに並べる時代区分の全件。 */
  eras: EraList;
  /** `end` が `ERA_END_PRESENT` の era の右端に置く年。 */
  presentEnd: number;
};

/**
 * `event` の最前面にある `Locus` の `seriesId` を返す。
 * `Locus` が無い地点をクリックしたときは null を返す。
 *
 * MapLibre は `properties` の値を `any` で返すので、文字列でなければ null にする。
 */
function selectedSeriesIdOf(event: MapLayerMouseEvent): string | null {
  const seriesId = event.features?.[0]?.properties.seriesId;

  return typeof seriesId === "string" ? seriesId : null;
}

/**
 * `state` を `seriesId` に割り当てられたエピソードだけに絞り込んで返す。
 * `loading` と `error` はそのまま返す。
 *
 * 絞り込めるのは `loaded` になった後だけである。
 */
function episodesOf(state: EpisodesState, seriesId: string): EpisodesState {
  if (state.kind !== "loaded") {
    return state;
  }

  return {
    kind: "loaded",
    episodes: episodesForSeries(state.episodes, seriesId),
  };
}

/**
 * `eras` のうち id が `INITIAL_ERA_ID` の区間の、中央を指す era 空間の位置を返す。
 * `INITIAL_ERA_ID` の区間が `eras` に無ければ throw する。
 *
 * era 空間は `eras` の各区間を等幅に並べるので（`@/lib/era/scale` が正）、`index` 番目の区間の中央は `(index + 0.5) / eras.length` である。
 */
function initialEraPositionOf(eras: EraList): number {
  const index = eras.findIndex((era) => era.id === INITIAL_ERA_ID);

  if (index === -1) {
    throw new Error(`eras に id が ${INITIAL_ERA_ID} の区間が無い`);
  }

  return (index + 0.5) / eras.length;
}

/** ベースマップの上に、`loci` の代表点・`series` の一覧パネル・`eras` の era スライダー・選択した `series` の詳細カードを重ねて描く。 */
export default function MapCanvas({
  loci,
  series,
  eras,
  presentEnd,
}: MapCanvasProps) {
  const mapRef = useRef<MapRef>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [eraPosition, setEraPosition] = useState(() =>
    initialEraPositionOf(eras),
  );
  const [episodes, setEpisodes] = useState<EpisodesState>({ kind: "loading" });
  const [isHoveringLocus, setIsHoveringLocus] = useState(false);

  // エピソードは詳細カードを開く前の、マウントした直後に取得する。
  // 詳細カードを開いてから取得を始めると、クリックのたびに 750 件を超える JSON の到着を待つ。
  useEffect(() => {
    let mounted = true;

    void fetchEpisodes().then((fetched) => {
      if (mounted) {
        setEpisodes(fetched);
      }
    });

    // アンマウント後に setEpisodes を呼ばない。
    return () => {
      mounted = false;
    };
  }, []);

  // 「選択が無い」を null に統一する。
  // find の undefined をそのまま保持すると、同じ状態が null と undefined の 2 通りで表れる。
  const selectedSeries: Series | null =
    series.find((one) => one.id === selectedSeriesId) ?? null;
  const eraWindow = currentWindow({ position: eraPosition, eras, presentEnd });

  /**
   * 一覧パネルでクリックされた `seriesId` のシリーズを選択し、代表点を持つならその代表点へ地図の中心を移す。
   *
   * 地図のクリックで選んだ事物は既に画面に在るので、`panTo` を呼ぶのはパネルからの選択だけにする。
   */
  function selectFromPanel(seriesId: string): void {
    setSelectedSeriesId(seriesId);

    const clicked = series.find((one) => one.id === seriesId);
    const anchor =
      clicked === undefined ? undefined : findAnchorLocus(loci, clicked);

    if (anchor === undefined) {
      return;
    }

    mapRef.current?.panTo(anchor.geometry.coordinates, {
      duration: PAN_DURATION_MS,
    });
  }

  // react-map-gl は maplibre 本体を実行時に動的 import するので、プリレンダでは空のコンテナだけが出る。
  // MapLibreMap を next/dynamic の ssr: false で包まなくてよい。
  return (
    <MapLibreMap
      ref={mapRef}
      // attributionControl は渡さない。
      // OpenFreeMap は `OpenFreeMap © OpenMapTiles Data from OpenStreetMap` の表示を利用条件にしており、false を渡すと既定の AttributionControl ごと表示が消えて規約違反になる。
      mapStyle={BASEMAP_STYLE_URL}
      initialViewState={INITIAL_VIEW_STATE}
      workerUrl={MAP_WORKER_URL}
      // MapLibreMap は container の `className` を受け取らないので、寸法だけは Tailwind のユーティリティでなく style で渡す。
      style={{ width: "100%", height: "100dvh" }}
      interactiveLayerIds={[SERIES_CIRCLE_LAYER.id]}
      onClick={(event) => setSelectedSeriesId(selectedSeriesIdOf(event))}
      // onMouseEnter と onMouseLeave は、interactiveLayerIds のレイヤの Locus に入った時と出た時にだけ呼ばれる。
      // cursor を undefined にすると、react-map-gl は canvas の style.cursor を空にし、MapLibre の既定の grab に戻す。
      cursor={isHoveringLocus ? "pointer" : undefined}
      onMouseEnter={() => setIsHoveringLocus(true)}
      onMouseLeave={() => setIsHoveringLocus(false)}
    >
      <SeriesLayers
        loci={loci}
        currentWindow={eraWindow}
        selectedSeriesId={selectedSeriesId}
      />
      {/* 一覧パネルは地図の左上に置き、高さを画面の下に重なる era スライダーの上端までに収める。 */}
      <div className="absolute top-4 left-4 z-10 flex max-h-[calc(100dvh-12rem)] max-w-[calc(100vw-2rem)] flex-col">
        <SeriesPanel
          sections={seriesPanelSectionsOf({
            series,
            loci,
            currentWindow: eraWindow,
          })}
          selectedSeriesId={selectedSeriesId}
          onSelect={selectFromPanel}
        />
      </div>
      {/* era スライダーは地図の下部の中央に置く。 */}
      {/* 包みは左端を left-1/2 で画面の中央に置くので、幅を包みに書かないと、包みの幅は画面の幅の半分を上限に縮む。 */}
      <div className="absolute bottom-10 left-1/2 z-10 w-[min(48rem,calc(100vw-2rem))] -translate-x-1/2">
        <EraSlider
          eras={eras}
          presentEnd={presentEnd}
          position={eraPosition}
          onPositionChange={setEraPosition}
        />
      </div>
      {/* 詳細カードは地図の右上に置き、高さを画面の高さから上下の余白を引いた値までに収める。 */}
      {selectedSeries !== null && (
        <div className="absolute top-4 right-4 z-10 flex max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] flex-col">
          <SeriesDetailCard
            series={selectedSeries}
            episodes={episodesOf(episodes, selectedSeries.id)}
            onClose={() => setSelectedSeriesId(null)}
          />
        </div>
      )}
    </MapLibreMap>
  );
}
