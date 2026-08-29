/**
 * 配信リンク 1 本の形。
 * テーマ（シリーズのページ）とエピソード（各回のページ）が同じ形を共有する。
 *
 * `platform` を enum に閉じてあるので、配信基盤が増えたときに直す場所はここだけになる。
 * 生の URL 文字列へ緩めると、増えた基盤を見分ける手が消える。
 *
 * このディレクトリのスキーマは互いを相対パスで参照する。
 * `scripts/validate-data.ts` を素の node が実行し、node は tsconfig の `@/` を解決しないため（biome.json の overrides が同じ範囲を免除している）。
 */

import * as z from "zod";

/**
 * 配信基盤。
 * RSS の `<link>` が指す先は Spotify のページである（docs/adr/0006-rss-link-as-episode-url.md）。
 */
const platformSchema = z.enum(["spotify"]);

/** 配信リンク 1 本。 */
export const linkSchema = z.object({
  platform: platformSchema,
  url: z.url(),
});

export type Link = z.infer<typeof linkSchema>;
