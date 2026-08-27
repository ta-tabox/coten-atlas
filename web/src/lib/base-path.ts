/**
 * 公開先のパスの接頭辞。
 *
 * GitHub Pages はリポジトリ名を挟んだ場所へ配信する（docs/adr/0007-github-pages.md）ので、ルート直下を前提に組み立てた URL は公開後に 404 になる。
 * Next の `basePath` と、クライアントが自分で組み立てる URL の両方がここを見る。
 * 片方だけを直すと、手元では通って本番だけ落ちる。
 *
 * next.config.ts はここを相対パスで読む。
 * Next はビルドの前に config を読むので、tsconfig の `@/` はまだ解決されない。
 */

export const BASE_PATH = "/coten-atlas";
