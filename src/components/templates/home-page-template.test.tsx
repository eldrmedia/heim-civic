import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomePageTemplate } from "./home-page-template";

describe("HomePageTemplate", () => {
  it("communicates the product, privacy boundary, and enables lookup", () => {
    render(<HomePageTemplate />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Understand who represents you.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Product commitments")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Find who represents you" }),
    ).toBeEnabled();
    expect(
      screen.getByText(/not written to our database/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Three boundaries, one answer" }),
    ).toBeInTheDocument();
  });
});
