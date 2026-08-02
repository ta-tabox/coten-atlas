# S1: Next.js static export の足場と判定の口を立てる
labels: claude,tooling

**前提**: なし ／ **担当**: Claude ／ **参照**: `docs/plan.md` §1（決定事項）、`fermentary/playbooks/toolchain.md`、`CODING.md`

## 目的
以降の全 issue が前提にする「ビルドと機械判定が通る器」を用意する。判定の口を
`mise run check` 一本に集約し、各 issue の完了条件がこのコマンドだけで閉じる状態を作る。

## 作るもの
- `mise.toml`
  - `[tools] node = "22"`（LTS を固定。pnpm も mise 管理）
  - `[tasks]` — `dev` = `pnpm dev` / `build` = `pnpm build` /
    `check` = `pnpm biome ci . && pnpm tsc --noEmit && pnpm vitest run` /
    `test` = `pnpm vitest`
- `package.json` — pnpm。Next.js（App Router）+ React + TypeScript の最新安定版
- `next.config.ts` — `output: 'export'`、`images: { unoptimized: true }`
  （static export では next/image の最適化が使えない。設定しないとビルドが落ちる）
- `biome.json` — Biome の既定に乗る。ルールを盛らない（YAGNI）
- `tsconfig.json` — `strict: true`
- `vitest.config.ts` — `environment: 'jsdom'`、`setupFiles` に
  `@testing-library/jest-dom` を読ませる。`vitest-setup.ts` も置く
- `src/app/layout.tsx` / `src/app/page.tsx` — 最小。`page.tsx` は
  `<h1>coten-atlas</h1>` だけでよい（地図は #02）
- `src/app/page.test.tsx` — RTL で `<h1>` の描画を検証するスモークテスト
  （テストが 0 件だと `vitest run` が失敗し、判定の口が最初から赤になる）
- `.gitignore` — `node_modules` / `.next` / `out` / `.DS_Store`

## 触らないもの
`data/`、`scripts/`、`src/components/`、`docs/plan.md`（地図の改訂はこの issue の範囲外）

## 完了条件（機械判定）
- `mise run check` が緑
- `mise run build` が `out/index.html` を生成する

## 人間の判定（別トラック）
なし（見えるものは #02 から）
