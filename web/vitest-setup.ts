import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// RTL の自動 cleanup は vitest の globals が無いと登録されないので、ここで掛ける。
// 掛けないと 1 ファイル内の render が document.body へ積み上がり、2 回目以降の getBy* が「複数見つかった」で落ちる。
afterEach(cleanup);
