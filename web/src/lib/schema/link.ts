/**
 * 配信リンク 1 本の形。
 * シリーズのページとエピソード（各回のページ）が同じ形を共有する。
 *
 * `platform` を enum に閉じてあるので、配信基盤が増えたときに直す場所はここだけになる。
 * 生の URL 文字列へ緩めると、増えた基盤を見分ける手が消える。
 */

import * as z from "zod";
import { duplicatesOf } from "@/lib/duplicates";

/**
 * 配信基盤。
 * RSS の `<link>` が指す先は Spotify のページである（docs/adr/0006-rss-link-as-episode-url.md）。
 */
const platformSchema = z.enum(["spotify"]);

/** 配信リンク 1 本。 */
export const linkSchema = z.object({
  /**
   * どの配信基盤のリンクか。
   * 読み出す側はこれで 1 本を選ぶ。
   */
  platform: platformSchema,

  /**
   * その基盤でこの回、またはこのシリーズを開くページの URL。
   * 詳細カードの「Spotify で聴く」の飛び先になる。
   */
  url: z.url(),
});

/**
 * 一つのシリーズ、または一つのエピソードが持つ配信リンク全部。
 *
 * 同じ基盤のリンクを 2 本持てない。
 * 読み出す側は `links.find((link) => link.platform === "spotify")` の形で 1 本を取り出す想定で、詳細カードの「Spotify で聴く」がその 1 本を指す。
 * 2 本あると、どちらがボタンに出るかが `find` の走査順という実装の都合で決まってしまう。
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
