import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("Page", () => {
	it("見出しを描画する", () => {
		render(<Page />);

		expect(
			screen.getByRole("heading", { name: "coten-atlas" }),
		).toBeInTheDocument();
	});
});
