import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("renders an accessible button with a semantic variant class", () => {
    render(<Button intent="secondary">View source</Button>);

    const button = screen.getByRole("button", { name: "View source" });

    expect(button).toHaveClass("button", "button--secondary");
  });

  it("supports disabled states", () => {
    render(<Button disabled>Unavailable</Button>);

    expect(screen.getByRole("button", { name: "Unavailable" })).toBeDisabled();
  });
});
