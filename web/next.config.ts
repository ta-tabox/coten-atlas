import type { NextConfig } from "next";
import { BASE_PATH } from "./src/lib/base-path";

/**
 * デプロイ先は GitHub Pages（docs/adr/0007-github-pages.md）。
 * `https://ta-tabox.github.io/coten-atlas/` の下に置かれるので、リポジトリ名を basePath に載せないと公開後にアセットが 404 になる。
 */
const nextConfig: NextConfig = {
  output: "export",
  // static export では next/image の最適化サーバが居ない。無効化しないとビルドが落ちる。
  images: { unoptimized: true },
  basePath: BASE_PATH,
  assetPrefix: BASE_PATH,
};

export default nextConfig;
