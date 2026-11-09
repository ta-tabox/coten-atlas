/**
 * 配信リンクの形と、配信基盤の取りうる値を置く。
 * シリーズのページとエピソード（各回のページ）が同じ形を共有する。
 *
 * 配信リンクは基盤を鍵、URL を値にしたオブジェクトで持つ（例: `{ "apple-podcasts": "https://podcasts.apple.com/…" }`）。
 * 鍵を基盤に閉じてあるので、1 つの基盤に 2 本の URL を持つ形と、未知の基盤の鍵は、どちらもスキーマが拒否する。
 */

import * as z from "zod";

/**
 * 配信基盤の並び。
 *
 * 詳細カードは各回のボタンをこの順に並べる。
 */
export const PLATFORMS = ["spotify", "apple-podcasts"] as const;

/** 配信基盤。 */
export type Platform = (typeof PLATFORMS)[number];

/**
 * 一つのシリーズ、または一つのエピソードが持つ配信リンク全部。
 * 各基盤の値は、その基盤でこの回、またはこのシリーズを開くページの URL で、URL を持たない基盤は鍵ごと持たない。
 *
 * `satisfies` は、鍵が `PLATFORMS` と過不足なく一致することを型検査で確かめる。
 */
export const linksSchema = z.strictObject({
  spotify: z.url().optional(),
  "apple-podcasts": z.url().optional(),
} satisfies Record<Platform, z.ZodOptional<z.ZodURL>>);

export type Links = z.infer<typeof linksSchema>;
