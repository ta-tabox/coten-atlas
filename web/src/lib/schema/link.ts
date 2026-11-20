/**
 * 配信リンク（`links`）の zod スキーマと、配信基盤の取りうる値を置く。
 * シリーズのページとエピソード（各回のページ）が同じ形を共有する。
 *
 * 配信リンクは基盤を鍵、URL を値にしたオブジェクトで持つ（例: `{ "apple-podcasts": "https://podcasts.apple.com/…" }`）。
 * 鍵を `platformSchema` に閉じてあるので、未知の基盤の鍵はスキーマが拒否し、基盤を足すときに直すのは `platformSchema` だけになる。
 */

import * as z from "zod";

/**
 * 配信基盤の取りうる値で、配信リンクのキーに置ける値。
 *
 * 並び順は、詳細カードが各回のボタンを並べる順でもある。
 */
const platformSchema = z.enum(["spotify", "apple-podcasts"]);

export const PLATFORMS = platformSchema.options;

export type Platform = z.infer<typeof platformSchema>;

/**
 * 一つのシリーズ、または一つのエピソードが持つ配信リンク全部。
 * 各基盤の値は、その基盤でこの回、またはこのシリーズを開くページの URL で、URL を持たない基盤は鍵ごと持たない。
 */
export const linksSchema = z.partialRecord(platformSchema, z.url());

export type Links = z.infer<typeof linksSchema>;
