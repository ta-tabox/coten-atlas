"use client";

/**
 * ベースマップを画面いっぱいに描き、その上へシリーズのレイヤと詳細カードを載せる。
 *
 * **選択の正はここ 1 箇所に置く**。
 * パネルとの双方向同期（S5）が同じ state を読むので、コンポーネントごとに持たせると同期が state の突き合わせになる。
 * 選択で保つのは `seriesId` だけで、シリーズの属性は渡された全件から引く。
 *
 * エピソードは初期表示に要らないので、地図と同時にビルドへ取り込まず実行時に取ってくる（docs/ARCHITECTURE.md §3「配り方」）。
 * 取得は載った直後に始める。
 * 詳細カードを開いてから引き始めると、クリックのたびに 750 件超の JSON を待つことになる。
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
import SeriesDetailCard from "@/components/SeriesDetailCard";
import SeriesLayers from "@/components/SeriesLayers";
import { episodesForSeries, fetchEpisodes } from "@/lib/episodes";
import {
  BASEMAP_STYLE_URL,
  INITIAL_VIEW_STATE,
  MAP_WORKER_URL,
} from "@/lib/map/config";
import type { MapLocusCollection } from "@/lib/map/loci";
import { SERIES_CIRCLE_LAYER } from "@/lib/map/series-layer";
import type { Episode } from "@/lib/schema/episode";
import type { SeriesList } from "@/lib/schema/series";

type MapCanvasProps = {
  /** 地図へ渡す形に組んだ事物の全件。 */
  loci: MapLocusCollection;
  /**
   * シリーズの全件。
   * 地図が返すのは事物なので、選ばれた `seriesId` からカードへ渡す 1 件をここで引く。
   */
  series: SeriesList;
};

/**
 * クリックされた地点にある事物が指すシリーズ。
 * 事物の無い所を押したときは null。
 *
 * MapLibre は properties の値を `any` で返すので、文字列でなければ選択しない。
 */
function selectedSeriesIdOf(event: MapLayerMouseEvent): string | null {
  const seriesId = event.features?.[0]?.properties.seriesId;

  return typeof seriesId === "string" ? seriesId : null;
}

export default function MapCanvas({ loci, series }: MapCanvasProps) {
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    let mounted = true;

    void fetchEpisodes().then((fetched) => {
      if (mounted) {
        setEpisodes(fetched);
      }
    });

    // 取得の途中で外されたら、返ってきた値を捨てる。
    return () => {
      mounted = false;
    };
  }, []);

  const selectedSeries = series.find((one) => one.id === selectedSeriesId);

  return (
    <MapLibreMap
      mapStyle={BASEMAP_STYLE_URL}
      initialViewState={INITIAL_VIEW_STATE}
      workerUrl={MAP_WORKER_URL}
      style={{ width: "100%", height: "100dvh" }}
      interactiveLayerIds={[SERIES_CIRCLE_LAYER.id]}
      onClick={(event) => setSelectedSeriesId(selectedSeriesIdOf(event))}
    >
      <SeriesLayers loci={loci} />
      {selectedSeries !== undefined && (
        <SeriesDetailCard
          series={selectedSeries}
          episodes={episodesForSeries(episodes, selectedSeries.id)}
          onClose={() => setSelectedSeriesId(null)}
        />
      )}
    </MapLibreMap>
  );
}
