"use client";

/**
 * ベースマップを画面いっぱいに描き、その上へシリーズのレイヤ・era スライダー・詳細カードを載せる。
 *
 * 選択されたシリーズを保持するのは、このコンポーネントの `selectedSeriesId` だけである。
 * S5（一覧パネルとの双方向同期）が同じ state を読むので、子コンポーネントに複製すると同期が state の突き合わせになる。
 * 位置を読む `SeriesLayers` と `EraSlider` はどちらも `MapLibreMap` の子で、`page.tsx` との間に client wrapper を挟んでも位置はこのコンポーネントを props で通り抜けるだけなので、era スライダーの位置 `eraPosition` もこのコンポーネントに置く。
 *
 * エピソードはマウント直後に `fetchEpisodes` で取得する（docs/ARCHITECTURE.md §3「配り方」）。
 * `SeriesDetailCard` を開いてから取得を始めると、クリックのたびに 750 件を超える JSON の到着を待つ。
 *
 * react-map-gl は maplibre 本体を実行時に動的 import するので、プリレンダでは空のコンテナだけが出る。
 * この層を `next/dynamic` の `ssr: false` で包む必要は無い。
 * worker の在り処は `workerUrl` で名指す。
 * 渡さないと maplibre はバンドル後のチャンク URL からの相対で worker を探し、404 の HTML を掴んで地図だけが描画されなくなる（docs/adr/0013-maplibre-worker-self-hosted.md）。
 * attributionControl は渡さない。
 * OpenFreeMap は `OpenFreeMap © OpenMapTiles Data from OpenStreetMap` の表示を利用条件にしており、false を渡すと既定の AttributionControl ごと表示が消えて規約違反になる。
 * style で寸法を渡す。
 * スタイルは Tailwind のユーティリティで書く決まりだが（docs/adr/0021-tailwind-v4.md）、MapLibreMap は container の `style` しか公開せず `className` を持たないので、寸法だけはここに残る。
 * built-in control（Navigation・Scale 等）はここへ足さない。
 * MapLibre が吐く DOM は `maplibre-gl.css` が素のカスケードで押さえており、レイヤに入った Tailwind のユーティリティが負けるので、当てても効かない（docs/adr/0022-map-dom-boundary.md）。
 * 地図の上に置くものは React 側の overlay として書く。
 */

import { useEffect, useState } from "react";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import MapLibreMap from "react-map-gl/maplibre";
import EraSlider from "@/components/EraSlider";
import SeriesDetailCard from "@/components/SeriesDetailCard";
import SeriesLayers from "@/components/SeriesLayers";
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
import type { MapLocusCollection } from "@/lib/map/loci";
import { SERIES_CIRCLE_LAYER } from "@/lib/map/series-layer";
import type { EraList } from "@/lib/schema/era";
import type { Series, SeriesList } from "@/lib/schema/series";

/**
 * 地図を開いたときに、era スライダーが指す era の id。
 * 値の選び方は docs/adr/0040-era-fade-wiring.md が正。
 */
const INITIAL_ERA_ID = "ancient";

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

export default function MapCanvas({
  loci,
  series,
  eras,
  presentEnd,
}: MapCanvasProps) {
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [eraPosition, setEraPosition] = useState(() =>
    initialEraPositionOf(eras),
  );
  const [episodes, setEpisodes] = useState<EpisodesState>({ kind: "loading" });
  const [isHoveringLocus, setIsHoveringLocus] = useState(false);

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

  return (
    <MapLibreMap
      mapStyle={BASEMAP_STYLE_URL}
      initialViewState={INITIAL_VIEW_STATE}
      workerUrl={MAP_WORKER_URL}
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
        currentWindow={currentWindow({
          position: eraPosition,
          eras,
          presentEnd,
        })}
      />
      <EraSlider
        eras={eras}
        presentEnd={presentEnd}
        position={eraPosition}
        onPositionChange={setEraPosition}
      />
      {selectedSeries !== null && (
        <SeriesDetailCard
          series={selectedSeries}
          episodes={episodesOf(episodes, selectedSeries.id)}
          onClose={() => setSelectedSeriesId(null)}
        />
      )}
    </MapLibreMap>
  );
}
