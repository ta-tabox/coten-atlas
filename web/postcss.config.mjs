/**
 * PostCSS のプラグイン構成。
 * Tailwind v4 のユーティリティ生成をビルドへ挿す一点だけを持つ。
 *
 * v4 は CLI でも Next の loader でもなく PostCSS プラグインとして走るので、この設定ファイルが無いと `@import "tailwindcss"` が素の CSS import として素通りし、クラスが一つも生成されない。
 * 生成は `next build` の中で閉じるため `output: "export"`（docs/adr/0001-nextjs-static-export.md）と衝突しない。
 */

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
