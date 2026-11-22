/**
 * 初期表示で、地図に描かれた点が一覧パネルの下に隠れていないかを見る。
 * 一覧パネルを開いたまま地図の視野を一覧パネルの幅だけずらす実装（`MapCanvas` の `padding`）が、一覧パネルの実際の位置と合っているかも、ここで見る。
 *
 * 地図の点の画面座標は MapLibre から取れないので、初期の視野の式（`screenPointOf`）で求める。
 * 点が描かれるシリーズは、一覧パネルの「地図に出ているシリーズ」の区画に並ぶシリーズに等しい。
 */

import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  exportRoot,
  observePanel,
  screenPointOf,
  viewportOf,
} from "@scripts/smoke";
import { PANEL_RIGHT_EDGE_PX } from "@/components/map/panel-layout";
import { INITIAL_VIEW_STATE } from "@/lib/map/config";

const CATALOG = path.join(exportRoot(), "../../catalog");

type SeriesRow = { id: string; title: string };
type LocusFeature = {
  geometry: { coordinates: [number, number] };
  properties: { seriesId: string };
};

test("初期表示で、地図に描かれたどの点も一覧パネルの外にある", async ({
  page,
}) => {
  const series: SeriesRow[] = JSON.parse(
    fs.readFileSync(path.join(CATALOG, "series.json"), "utf8"),
  );
  const loci: { features: LocusFeature[] } = JSON.parse(
    fs.readFileSync(path.join(CATALOG, "loci.geojson"), "utf8"),
  );
  const observation = await observePanel(page, exportRoot());
  const size = viewportOf(page);

  test.skip(
    size.width < 768,
    "一覧パネルを開いたまま視野をずらすのはデスクトップの幅だけ",
  );

  expect(observation.panelRect).not.toBeNull();
  expect(observation.onMapSeriesTitles.length).toBeGreaterThan(0);

  const panel = observation.panelRect;
  const seriesIds = new Set(
    series
      .filter((row) => observation.onMapSeriesTitles.includes(row.title))
      .map((row) => row.id),
  );
  const points = loci.features
    .filter((feature) => seriesIds.has(feature.properties.seriesId))
    .map((feature) => feature.geometry.coordinates);

  expect(points.length).toBeGreaterThan(0);
  expect(panel?.right).toBeCloseTo(PANEL_RIGHT_EDGE_PX, 0);

  for (const [longitude, latitude] of points) {
    const { x, y } = screenPointOf(
      { longitude, latitude },
      { ...INITIAL_VIEW_STATE, paddingLeft: PANEL_RIGHT_EDGE_PX },
      size,
    );
    const isInsidePanel =
      panel !== null &&
      x >= panel.left &&
      x <= panel.right &&
      y >= panel.top &&
      y <= panel.bottom;

    expect(isInsidePanel, `(${longitude}, ${latitude}) → (${x}, ${y})`).toBe(
      false,
    );
  }
});
