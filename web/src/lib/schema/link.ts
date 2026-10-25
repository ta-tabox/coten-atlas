/**
 * 配信リンク 1 本の形。
 * シリーズのページとエピソード（各回のページ）が同じ形を共有する。
 *
 * `platform` を enum に閉じてあるので、配信基盤が増えたときに直す場所はここだけになる。
 * 生の URL 文字列へ緩めると、増えた基盤を見分ける手が消える。
 * 表示名などの欄を黙って受けると、増えた形が検査に映らないので、スキーマに無いキーは落とす。
 */

import * as z from "zod";
import { duplicatesOf } from "@/lib/schema/duplicates";

/**
 * 配信基盤の並び。
 *
 * 詳細カードは各回のボタンをこの順に並べる。
 */
export const PLATFORMS = ["spotify", "apple-podcasts", "youtube"] as const;

/** 配信基盤。 */
const platformSchema = z.enum(PLATFORMS);

/** 配信リンク 1 本。 */
export const linkSchema = z.strictObject({
  platform: platformSchema,

  /** その基盤でこの回、またはこのシリーズを開くページの URL。 */
  url: z.url(),
});

/**
 * 一つのシリーズ、または一つのエピソードが持つ配信リンク全部。
 *
 * 同じ基盤のリンクを 2 本持てない。
 * 詳細カードは基盤ごとに `links.find` で 1 本を取り出すので、2 本あるとボタンが開く 1 本が配列の並び順で決まる。
 */
export const linksSchema = z.array(linkSchema).superRefine((links, ctx) => {
  const platforms = links.map((link) => link.platform);

  for (const platform of duplicatesOf(platforms)) {
    ctx.addIssue({
      code: "custom",
      message: `同じ配信基盤のリンクが 2 本ある: ${platform}`,
    });
  }
});

export type Link = z.infer<typeof linkSchema>;

export type Platform = z.infer<typeof platformSchema>;
