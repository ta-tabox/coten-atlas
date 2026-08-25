import type { NextConfig } from "next";

/**
 * デプロイ先は GitHub Pages（docs/plan.md §1）。
 * `https://ta-tabox.github.io/coten-atlas/` の下に置かれるので、リポジトリ名を basePath に載せないと公開後にアセットが 404 になる。
 */
const nextConfig: NextConfig = {
	output: "export",
	// static export では next/image の最適化サーバが居ない。無効化しないとビルドが落ちる。
	images: { unoptimized: true },
	basePath: "/coten-atlas",
	assetPrefix: "/coten-atlas",
};

export default nextConfig;
