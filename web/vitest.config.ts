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
    // ブラウザを立てる検証は playwright が回す（playwright.config.ts）。
    // vitest の既定は *.spec.ts も拾うので、外さないと同じ spec を二重に走らせる。
    exclude: ["node_modules/**", "tests/e2e/**"],
  },
});
