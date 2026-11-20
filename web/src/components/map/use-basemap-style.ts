"use client";

/**
 * ベースマップのスタイルを取得し、地名を日本語にして地図の `mapStyle` へ渡す値にするフックを置く。
 * 地名の書き換えは持たず、`@/lib/map/basemap-labels` が持つ。
 *
 * 地図を描く部品は `BASEMAP_STYLE_URL` を `mapStyle` に直に渡さず、このフックの値を渡す。
 * 直に渡した地図だけが英語の地名で描かれる。
 */

import { useEffect, useState } from "react";
import type { StyleSpecification } from "react-map-gl/maplibre";
import { toJapaneseLabelStyle } from "@/lib/map/basemap-labels";
import { BASEMAP_STYLE_URL } from "@/lib/map/config";

/**
 * `BASEMAP_STYLE_URL` のスタイルを取得し、地名を日本語にしたスタイルを返す。
 * 取得か書き換えに失敗したら throw せず `BASEMAP_STYLE_URL` を返し、`console.error` に理由を出力する。
 *
 * URL を返すと MapLibre が同じスタイルを取得し直して英語の地名のまま描くので、スタイルの取得の失敗で地図が消えない。
 * 応答の形はスキーマで検査せず、MapLibre の検証に任せる。
 */
async function fetchJapaneseLabelStyle(): Promise<StyleSpecification | string> {
  try {
    const response = await fetch(BASEMAP_STYLE_URL);

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const style: StyleSpecification = await response.json();

    return toJapaneseLabelStyle(style);
  } catch (cause) {
    console.error(
      `ベースマップのスタイルの取得に失敗した: ${BASEMAP_STYLE_URL}`,
      cause,
    );

    return BASEMAP_STYLE_URL;
  }
}

/**
 * 地図の `mapStyle` へ渡すスタイルを返す。
 * 取得が終わるまでは null を返し、終わった後は地名を日本語にしたスタイルか、取得に失敗したときの `BASEMAP_STYLE_URL` を返す。
 *
 * null の間に地図を描くと、英語の地名のスタイルで描き始めてから差し替わるので、呼ぶ側は null の間は地図を描かない。
 */
export function useBasemapStyle(): StyleSpecification | string | null {
  const [mapStyle, setMapStyle] = useState<StyleSpecification | string | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    void fetchJapaneseLabelStyle().then((fetched) => {
      if (mounted) {
        setMapStyle(fetched);
      }
    });

    // アンマウント後に setMapStyle を呼ばない。
    return () => {
      mounted = false;
    };
  }, []);

  return mapStyle;
}
