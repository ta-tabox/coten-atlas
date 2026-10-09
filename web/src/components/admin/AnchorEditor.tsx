"use client";

/**
 * 管理画面の画面を組み立てる部品を置く。
 * シリーズの一覧で選んだシリーズの代表点へ地図を寄せ、地図で動かした代表点の座標を保存の API へ送って、結果を画面に出す。
 *
 * 事物の全件は、保存に成功した座標だけを反映した値をこの部品の state に持つ。
 * 保存に失敗したら state を変えないので、地図の円は動かす前の位置へ戻る。
 */

import { useState } from "react";
import AdminSeriesList from "@/components/admin/AdminSeriesList";
import AnchorDragMap, {
  type PanTarget,
} from "@/components/admin/AnchorDragMap";
import { postLocusMove } from "@/lib/admin-api";
import { updateLocusCoordinates } from "@/lib/catalog-edit/locus-coordinates";
import type { LocusCollection } from "@/lib/schema/locus";
import type { LocusMove } from "@/lib/schema/locus-move";
import type { SeriesList } from "@/lib/schema/series";

type AnchorEditorProps = {
  /** 一覧に並べるシリーズの全件。 */
  series: SeriesList;
  /** 管理画面を開いた時点の事物の全件。 */
  initialLoci: LocusCollection;
};

/** 最後の保存の状態。 */
type SaveStatus =
  | { kind: "idle" }
  | { kind: "saving"; id: string }
  | { kind: "saved"; id: string }
  | { kind: "failed"; id: string; problems: string[] };

/** 保存の状態（`status`）を、画面に出す文にする。 */
function messageOf(status: SaveStatus): string {
  switch (status.kind) {
    case "idle":
      return "シリーズを選び、地図の代表点をドラッグすると座標を保存する。";
    case "saving":
      return `${status.id} の座標を保存している。`;
    case "saved":
      return `${status.id} の座標を保存した。git diff catalog/ で差分を確かめる。`;
    case "failed":
      return `${status.id} の座標を保存しなかった。\n${status.problems.join("\n")}`;
  }
}

/** シリーズの一覧・代表点を動かす地図・保存の結果を重ねて描く。 */
export default function AnchorEditor({
  series,
  initialLoci,
}: AnchorEditorProps) {
  const [loci, setLoci] = useState(initialLoci);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [panTarget, setPanTarget] = useState<PanTarget | null>(null);
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });

  /** `seriesId` のシリーズを選び、代表点を持つならそこへ地図を寄せる。 */
  function select(seriesId: string): void {
    setSelectedSeriesId(seriesId);

    const anchorId = series.find((one) => one.id === seriesId)?.anchor;
    const anchor = loci.features.find(
      (feature) => feature.properties.id === anchorId,
    );

    if (anchor !== undefined) {
      setPanTarget({ coordinates: anchor.geometry.coordinates });
    }
  }

  /** 動かした座標（`move`）を保存の API へ送り、保存できたら事物の全件へ反映する。 */
  async function save(move: LocusMove): Promise<void> {
    setStatus({ kind: "saving", id: move.id });

    const problems = await postLocusMove(move);

    if (problems.length > 0) {
      setStatus({ kind: "failed", id: move.id, problems });
      return;
    }

    setLoci((current) => updateLocusCoordinates(current, move) ?? current);
    setStatus({ kind: "saved", id: move.id });
  }

  return (
    <main className="relative">
      <AnchorDragMap
        loci={loci}
        selectedSeriesId={selectedSeriesId}
        panTarget={panTarget}
        onDrop={(move) => void save(move)}
      />
      {/* 一覧は地図の左上に置き、高さを画面の下の結果の欄の上端までに収める。 */}
      <div className="absolute top-4 left-4 z-10 flex max-h-[calc(100dvh-10rem)] w-64 flex-col rounded-lg bg-white/85 p-2 shadow">
        <AdminSeriesList
          series={series}
          selectedSeriesId={selectedSeriesId}
          onSelect={select}
        />
      </div>
      {/* 保存の結果は地図の下部の中央に置く。 */}
      <p
        role="status"
        data-save-status={status.kind}
        className="absolute bottom-10 left-1/2 z-10 w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg bg-white/90 px-4 py-2 text-[0.85rem] whitespace-pre-line shadow"
      >
        {messageOf(status)}
      </p>
    </main>
  );
}
