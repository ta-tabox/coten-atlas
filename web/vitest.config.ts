/// <reference types="vitest" />
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// 設定ファイルは `@/` の別名が解決される前に読まれるので、ここだけは相対パスで綴る。
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@scripts": fileURLToPath(new URL("./scripts", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest-setup.ts"],
    // 綴りで分担する。
    // `.test.ts` が vitest、`.spec.ts` は playwright（playwright.config.ts）。
    // 既定は *.spec.ts も拾うので、絞らないと playwright の担当分まで走らせる。
    include: ["**/*.test.?(c|m)[jt]s?(x)"],
  },
});
