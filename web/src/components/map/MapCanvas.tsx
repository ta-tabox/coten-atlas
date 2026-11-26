"use client";

/**
 * 地図の画面を組み立てる。
 * ベースマップを画面いっぱいに描き、その上に重ねる部品を子に並べる。
 *
 * 画面の複数の部品が読む状態はこのコンポーネントが持ち、子へは props で渡す。
 */

import { type ReactNode, useEffect, useRef, useState } from "react";
import type {
  MapLayerMouseEvent,
  MapRef,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import MapLibreMap from "react-map-gl/maplibre";
import BottomSheet from "@/components/bottom-sheet/BottomSheet";
import EraSlider from "@/components/era-slider/EraSlider";
import { PANEL_RIGHT_EDGE_PX } from "@/components/map/panel-layout";
import SeriesLayers from "@/components/map/SeriesLayers";
import { useBasemapStyle } from "@/components/map/use-basemap-style";
import { useHoverTooltip } from "@/components/map/use-hover-tooltip";
import { useIsDesktop } from "@/components/map/use-is-desktop";
import { useOverlapCandidates } from "@/components/map/use-overlap-candidates";
import SeriesCandidateOverlay from "@/components/series-candidates/SeriesCandidateOverlay";
import SeriesDetailBody from "@/components/series-detail/SeriesDetailBody";
import SeriesDetailCard from "@/components/series-detail/SeriesDetailCard";
import SeriesPanel from "@/components/series-panel/SeriesPanel";
import SeriesPanelBody from "@/components/series-panel/SeriesPanelBody";
import SeriesTooltipOverlay from "@/components/series-tooltip/SeriesTooltipOverlay";
import SiteHeader from "@/components/site-header/SiteHeader";
import {
  EPISODES_KIND,
  type EpisodesState,
  episodesForSeries,
  fetchEpisodes,
} from "@/lib/episodes";
import { ZOOMED_ERA_COUNT } from "@/lib/era/view";
import { currentWindow, positionShowing } from "@/lib/era/window";
import {
  INITIAL_VIEW_STATE,
  MAP_WORKER_URL,
  PUBLIC_MAP_MAX_ZOOM,
} from "@/lib/map/config";
import { SERIES_CIRCLE_LAYER } from "@/lib/map/layers/shared";
import {
  findAnchorLocus,
  lociForSeries,
  type MapLocusCollection,
} from "@/lib/map/loci";
import { relatedSeriesOf } from "@/lib/map/related-series";
import { seriesPanelSectionsOf } from "@/lib/map/series-panel";
import { listHeightPx, SHEET_STAGE, type SheetStage } from "@/lib/map/sheet";
import { panelTagsOf, taggedSeriesOf } from "@/lib/map/tag-filter";
import type { EraList } from "@/lib/schema/era";
import {
  type Series,
  type SeriesList,
  TIME_RANGE_UNTIMED,
} from "@/lib/schema/series";

/**
 * 地図を開いたときに、era スライダーが指す era の id。
 * 地図に出るシリーズが最も多く重なる区間を選ぶ。
 * 基準の理由は docs/adr/20260911-era-fade-window-only.md が持つ。
 */
const INITIAL_ERA_ID = "modern19";

/** 一覧パネルで選んだシリーズの代表点へ、地図の中心を移すのにかける時間（ミリ秒）。 */
const PAN_DURATION_MS = 1200;

/** 一覧パネルの開閉に合わせて地図の視野をずらすのにかける時間（ミリ秒）。 */
const PADDING_DURATION_MS = 300;

type MapCanvasProps = {
  loci: MapLocusCollection;
  /**
   * シリーズの全件。
   * 地図のクリックが返すのは `Locus` なので、`seriesId` に一致する `Series` をこの配列から検索する。
   */
  seriesList: SeriesList;
  eras: EraList;
  /** `end` が `ERA_END_PRESENT` の era の右端に置く年。 */
  presentEnd: number;
};

/**
 * `series` の代表点の事物の地名を返す。
 * 位置なしのシリーズには null を返す。
 */
function placeNameOf(loci: MapLocusCollection, series: Series): string | null {
  return findAnchorLocus(loci, series)?.properties.name ?? null;
}

/**
 * `state` を `seriesId` に割り当てられたエピソードだけに絞り込んで返す。
 * `loading` と `error` はそのまま返す。
 *
 * 絞り込めるのは `loaded` になった後だけである。
 */
function episodesOf(state: EpisodesState, seriesId: string): EpisodesState {
  if (state.kind !== EPISODES_KIND.loaded) {
    return state;
  }

  return {
    kind: EPISODES_KIND.loaded,
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

/** スマホの幅のシートが `list` の段にいるときだけ、era スライダーを閉じる操作（`close`）を返し、それ以外は undefined を返す。 */
function eraSliderCloseOf({
  isDesktop,
  sheetStage,
  close,
}: {
  isDesktop: boolean;
  sheetStage: SheetStage;
  close: () => void;
}): (() => void) | undefined {
  return !isDesktop && sheetStage === SHEET_STAGE.list ? close : undefined;
}

/** ベースマップの上に、上端のヘッダー・`loci` の代表点・`seriesList` の一覧・`eras` の era スライダー・選択したシリーズの詳細カードを重ねて描く。 */
export default function MapCanvas({
  loci,
  seriesList,
  eras,
  presentEnd,
}: MapCanvasProps) {
  const mapRef = useRef<MapRef>(null);
  const mapStyle = useBasemapStyle();
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);

  // 絞り込みに使うタグは、選択中のシリーズと別の state に持ち、どちらを変えてももう片方は変えない。
  // 絞り込みで選択中のシリーズが地図と一覧パネルから消えても選択は外さず詳細カードも開いたままなので、選択を移す操作は、移す先のシリーズが `selectedTags` のタグを持つかを確かめなくてよい。
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [eraPosition, setEraPosition] = useState(() =>
    initialEraPositionOf(eras),
  );
  const [episodes, setEpisodes] = useState<EpisodesState>({
    kind: EPISODES_KIND.loading,
  });
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [sheetStage, setSheetStage] = useState<SheetStage>(SHEET_STAGE.era);
  const [isEraSliderShown, setIsEraSliderShown] = useState(true);
  const [sheetTargetHeight, setSheetTargetHeight] = useState(0);
  const isDesktop = useIsDesktop();
  const [isHoveringLocus, setIsHoveringLocus] = useState(false);
  const overlap = useOverlapCandidates({ mapRef, seriesList });
  const hover = useHoverTooltip({ mapRef, seriesList });

  // 一覧パネルに隠れる左の幅と、シートに隠れる下の高さを地図の視野から除き、点が隠れない領域に描かれるようにする。
  const paddingLeft = isDesktop && isPanelOpen ? PANEL_RIGHT_EDGE_PX : 0;
  const initialPadding = { top: 0, bottom: 0, right: 0, left: paddingLeft };

  // 視野へ最後に渡した余白。
  // 選択の移動が余白を渡した後に、同じ余白だけの移動が重なって選択の移動を打ち切るのを避ける。
  const appliedPadding = useRef({ left: paddingLeft, bottom: 0 });

  /** 現在の幅と段に合う余白が、最後に視野へ渡した余白と違えば、`duration` ミリ秒かけて視野へ渡す。 */
  function syncPadding(duration: number): void {
    const next = {
      left: paddingLeft,
      bottom: isDesktop ? 0 : sheetTargetHeight,
    };

    if (
      next.left === appliedPadding.current.left &&
      next.bottom === appliedPadding.current.bottom
    ) {
      return;
    }

    appliedPadding.current = next;
    mapRef.current?.easeTo({
      padding: { top: 0, right: 0, ...next },
      duration,
    });
  }

  // initialViewState は最初の描画にしか効かないので、一覧パネルの開閉・シートの段・幅の変化は easeTo で視野へ渡す。
  // biome-ignore lint/correctness/useExhaustiveDependencies: syncPadding は毎回作り直す関数で、余白を決める値を依存に並べる。
  useEffect(() => {
    syncPadding(PADDING_DURATION_MS);
  }, [paddingLeft, isDesktop, sheetTargetHeight]);

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
    seriesList.find((series) => series.id === selectedSeriesId) ?? null;
  const eraWindow = currentWindow({ position: eraPosition, eras, presentEnd });

  const taggedSeries = taggedSeriesOf(seriesList, selectedTags);
  const taggedLoci = lociForSeries(loci, taggedSeries);
  const taggedSections = seriesPanelSectionsOf({
    seriesList: taggedSeries,
    loci: taggedLoci,
    currentWindow: eraWindow,
  });

  /**
   * `seriesId` のシリーズを選び、選びを外すなら null を渡す。
   * スマホの幅では、シリーズを選ぶとシートを `list` の段にして詳細カードを見せる。
   * `full` の段で選んだときも `list` の段へ縮み、地図が見える領域を広げる。
   */
  function select(seriesId: string | null): void {
    setSelectedSeriesId(seriesId);

    if (seriesId !== null && !isDesktop) {
      setSheetStage(SHEET_STAGE.list);
    }
  }

  /**
   * `seriesId` のシリーズを選択し、代表点を持つならその代表点へ地図の中心を移す。
   * スマホの幅では、`list` の段のシートに隠れない領域の中央へ移す。
   *
   * デスクトップの幅の地図のクリックで選んだ事物は既に画面に在るので、デスクトップの幅で呼ぶのは一覧からの選択だけにする。
   * スマホの幅では、選択でシートが高くなって事物を覆うので、地図のクリックでも呼ぶ。
   */
  function selectAndPan(seriesId: string): void {
    select(seriesId);

    const clicked = seriesList.find((series) => series.id === seriesId);
    const anchor =
      clicked === undefined ? undefined : findAnchorLocus(loci, clicked);

    if (anchor === undefined) {
      return;
    }

    if (isDesktop) {
      mapRef.current?.panTo(anchor.geometry.coordinates, {
        duration: PAN_DURATION_MS,
      });

      return;
    }

    const bottom = listHeightPx(window.innerHeight);

    appliedPadding.current = { left: paddingLeft, bottom };
    mapRef.current?.easeTo({
      center: anchor.geometry.coordinates,
      padding: { top: 0, right: 0, left: paddingLeft, bottom },
      duration: PAN_DURATION_MS,
    });
  }

  /**
   * 地図のクリックが当たった代表点が 1 シリーズなら、そのシリーズを選ぶ。
   * 2 シリーズ以上が重なっていれば、選択を変えず候補の一覧を出す。
   * 当たらなければ選択を外す。
   * デスクトップの幅では地図を動かさず、スマホの幅ではシートに隠れない位置へ動かす。
   */
  function selectFromMap(event: MapLayerMouseEvent): void {
    const seriesIds = overlap.openCandidatesAt(event);

    if (seriesIds.length >= 2) {
      return;
    }

    const seriesId = seriesIds[0] ?? null;

    if (seriesId !== null && !isDesktop) {
      selectAndPan(seriesId);

      return;
    }

    select(seriesId);
  }

  /** 利用者の操作で地図が動き始めたとき、地図に重ねた候補の一覧とツールチップを閉じる。 */
  function closeOverlaysOnUserMove(event: ViewStateChangeEvent): void {
    overlap.closeOnUserMove(event);
    hover.clearOnUserMove(event);
  }

  /** 地図が動くたびに、地図に重ねた候補の一覧とツールチップが指す代表点の位置を取り直す。 */
  function updateOverlayAnchors(): void {
    overlap.updateAnchor();
    hover.updateAnchor();
  }

  /** マウスが代表点から離れたとき、カーソルの形を戻してツールチップを消す。 */
  function leaveLocus(): void {
    setIsHoveringLocus(false);
    hover.clear();
  }

  /**
   * 詳細カードの関連シリーズ行で押したシリーズ（`seriesId`）を選び、代表点へ地図の中心を移す。
   * そのシリーズの年が現在窓の外なら、年の中点を指す位置へ era スライダーを動かす。
   *
   * 一覧パネルと地図は現在窓の中のシリーズしか出さないが、関連シリーズ行は窓の外のシリーズも出すので、スライダーを動かさないと移った先の点が地図に描かれない。
   */
  function selectFromRelated(seriesId: string): void {
    const related = seriesList.find((series) => series.id === seriesId);

    if (related !== undefined && related.timeRange !== TIME_RANGE_UNTIMED) {
      setEraPosition(
        positionShowing({
          timeRange: related.timeRange,
          position: eraPosition,
          eras,
          presentEnd,
        }),
      );
    }

    selectAndPan(seriesId);
  }

  /** 候補の一覧の行で選んだシリーズを選択し、候補の一覧を閉じる。 */
  function selectFromCandidates(seriesId: string): void {
    overlap.close();

    if (isDesktop) {
      select(seriesId);

      return;
    }

    selectAndPan(seriesId);
  }

  if (mapStyle === null) {
    return null;
  }

  let sheetContent: ReactNode;

  if (selectedSeries === null) {
    sheetContent = (
      <div className="flex min-h-0 flex-1 flex-col pt-1 leading-[1.6]">
        <SeriesPanelBody
          sections={taggedSections}
          selectedSeriesId={selectedSeriesId}
          onSelect={selectAndPan}
          tags={panelTagsOf(taggedSections, selectedTags)}
          selectedTags={selectedTags}
          onSelectedTagsChange={setSelectedTags}
        />
      </div>
    );
  } else {
    sheetContent = (
      <div className="flex min-h-0 flex-1 flex-col px-5 py-4 leading-[1.7]">
        <SeriesDetailBody
          series={selectedSeries}
          placeName={placeNameOf(loci, selectedSeries)}
          episodes={episodesOf(episodes, selectedSeries.id)}
          relatedSeries={relatedSeriesOf(seriesList, selectedSeries)}
          onSelect={selectFromRelated}
          onClose={() => setSelectedSeriesId(null)}
        />
      </div>
    );
  }

  const eraSlider = (
    <EraSlider
      eras={eras}
      presentEnd={presentEnd}
      position={eraPosition}
      onPositionChange={setEraPosition}
      zoomedEraCount={
        isDesktop ? ZOOMED_ERA_COUNT.desktop : ZOOMED_ERA_COUNT.mobile
      }
      onClose={eraSliderCloseOf({
        isDesktop,
        sheetStage,
        close: () => setIsEraSliderShown(false),
      })}
    />
  );

  // react-map-gl は maplibre 本体を実行時に動的 import するので、プリレンダでは空のコンテナだけが出る。
  // MapLibreMap を next/dynamic の ssr: false で包まなくてよい。
  return (
    <MapLibreMap
      ref={mapRef}
      // attributionControl に false を渡さない。
      // OpenFreeMap は `OpenFreeMap © OpenMapTiles Data from OpenStreetMap` の表示を利用条件にしており、false を渡すと AttributionControl ごと表示が消えて規約違反になる。
      // compact を false にして、幅の狭い地図でも、ⓘ のボタンに隠さず全文を常に出す。
      attributionControl={{ compact: false }}
      mapStyle={mapStyle}
      initialViewState={{ ...INITIAL_VIEW_STATE, padding: initialPadding }}
      maxZoom={PUBLIC_MAP_MAX_ZOOM}
      workerUrl={MAP_WORKER_URL}
      // MapLibreMap は container の `className` を受け取らないので、寸法だけは Tailwind のユーティリティでなく style で渡す。
      style={{ width: "100%", height: "100dvh" }}
      interactiveLayerIds={[SERIES_CIRCLE_LAYER.id]}
      onClick={selectFromMap}
      onMoveStart={closeOverlaysOnUserMove}
      onMove={updateOverlayAnchors}
      onMouseMove={hover.showTooltipAt}
      onLoad={() => syncPadding(0)}
      // onMouseEnter と onMouseLeave は、interactiveLayerIds のレイヤの Locus に入った時と出た時にだけ呼ばれる。
      // cursor を undefined にすると、react-map-gl は canvas の style.cursor を空にし、MapLibre の既定の grab に戻す。
      cursor={isHoveringLocus ? "pointer" : undefined}
      onMouseEnter={() => setIsHoveringLocus(true)}
      onMouseLeave={leaveLocus}
    >
      <SeriesLayers
        loci={taggedLoci}
        currentWindow={eraWindow}
        selectedSeries={selectedSeries}
      />
      {/* ヘッダーは地図の上端の全幅に置く。デスクトップの幅の一覧パネルと詳細カードはヘッダーの下から並べる。 */}
      {/* パネルとカードの上端と最大の高さは、ヘッダーの高さのトークン `--spacing-header` を参照する。 */}
      <div className="absolute inset-x-0 top-0 z-20">
        <SiteHeader />
      </div>
      {isDesktop ? (
        <>
          {/* 一覧パネルはヘッダーの下の左に置き、高さを画面の下に重なる era スライダーの上端までに収める。 */}
          <div className="absolute top-header left-4 z-10 mt-4 flex max-h-[calc(100dvh-var(--spacing-header)-12rem)] max-w-[calc(100vw-2rem)] flex-col">
            <SeriesPanel
              sections={taggedSections}
              selectedSeriesId={selectedSeriesId}
              onSelect={selectAndPan}
              tags={panelTagsOf(taggedSections, selectedTags)}
              selectedTags={selectedTags}
              onSelectedTagsChange={setSelectedTags}
              isOpen={isPanelOpen}
              onOpenChange={setIsPanelOpen}
            />
          </div>
          {/* 包みは左端を left-1/2 で画面の中央に置くので、幅を包みに書かないと、包みの幅は画面の幅の半分を上限に縮む。 */}
          <div className="absolute bottom-10 left-1/2 z-10 w-[min(48rem,calc(100vw-2rem))] -translate-x-1/2 rounded-box border border-rule bg-paper px-4 py-3 shadow-sm">
            {eraSlider}
          </div>
          {selectedSeries !== null && (
            <div className="absolute top-header right-4 z-10 mt-4 flex max-h-[calc(100dvh-var(--spacing-header)-2rem)] max-w-[calc(100vw-2rem)] flex-col">
              <SeriesDetailCard
                series={selectedSeries}
                placeName={placeNameOf(loci, selectedSeries)}
                episodes={episodesOf(episodes, selectedSeries.id)}
                relatedSeries={relatedSeriesOf(seriesList, selectedSeries)}
                onSelect={selectFromRelated}
                onClose={() => setSelectedSeriesId(null)}
              />
            </div>
          )}
        </>
      ) : (
        // era スライダーはシートの中に置く。
        <div className="absolute inset-x-0 bottom-0 z-10">
          <BottomSheet
            stage={sheetStage}
            onStageChange={setSheetStage}
            label={selectedSeries === null ? "シリーズ一覧" : "シリーズの詳細"}
            eraSlider={eraSlider}
            isEraSliderShown={isEraSliderShown}
            onEraSliderShownChange={setIsEraSliderShown}
            onTargetHeightChange={setSheetTargetHeight}
          >
            {sheetContent}
          </BottomSheet>
        </div>
      )}
      {/* ツールチップは代表点の上に置き、候補の一覧が開いている間は出さない。 */}
      {hover.view !== null && overlap.view === null && (
        <SeriesTooltipOverlay
          series={hover.view.series}
          anchor={hover.view.anchor}
        />
      )}
      {/* 候補の一覧は、重なった代表点の上に、どの幅でもシートの上へ重ねる。 */}
      {overlap.view !== null && (
        <SeriesCandidateOverlay
          candidates={overlap.view.candidates}
          anchor={overlap.view.anchor}
          onSelect={selectFromCandidates}
          onClose={overlap.close}
        />
      )}
    </MapLibreMap>
  );
}
