/**
 * Next.js のビルド設定。
 * static export の出力と、GitHub Pages の下に置くための basePath と、開発サーバでだけ読むファイルの拡張子を決める。
 * basePath の値そのものは `src/lib/base-path.ts` が持つ。
 */

import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import { BASE_PATH } from "./src/lib/base-path";

/**
 * Next が既定でページとして読む拡張子。
 * `pageExtensions` を渡すと既定の並びが置き換わるので、足すときは既定の並びごと書く。
 */
const PAGE_EXTENSIONS = ["tsx", "ts", "jsx", "js"];

/**
 * `next dev` のときだけページとして読む拡張子。
 * 管理画面のページと Route Handler をこの拡張子で置くと、`next build` の成果物（`out/`）に入らない。
 */
const DEV_ONLY_PAGE_EXTENSIONS = ["dev.tsx", "dev.ts"];

/**
 * デプロイ先は GitHub Pages。
 * `https://ta-tabox.github.io/coten-atlas/` の下に置かれるので、リポジトリ名を basePath に載せないと公開後にアセットが 404 になる。
 *
 * 開発サーバかどうかを環境変数の NODE_ENV でなく Next のフェーズ（`phase`）で見る。
 * NODE_ENV に development を入れて `next build` を打っても、管理画面は成果物に入らない。
 */
export default function nextConfig(phase: string): NextConfig {
  const isDevelopmentServer = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    output: "export",
    // static export では next/image の最適化サーバが居ない。
    // 無効化しないとビルドが落ちる。
    images: { unoptimized: true },
    basePath: BASE_PATH,
    assetPrefix: BASE_PATH,
    pageExtensions: isDevelopmentServer
      ? [...DEV_ONLY_PAGE_EXTENSIONS, ...PAGE_EXTENSIONS]
      : PAGE_EXTENSIONS,
    // `CLAUDE.md` は追跡しているファイルなので、`next dev` がエージェントを検出したときに規約のブロックを書き足さないようにする。
    agentRules: false,
  };
}
