import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RepresentativeCard } from "@/components/molecules/representative-card";
import type { RepresentationSummary } from "@/domain/officials/types";

const vacantRepresentation: RepresentationSummary = {
  position: {
    id: "state-assembly:nv:1",
    chamber: "state-assembly",
    districtType: "state-assembly",
    districtNumber: "1",
    seatClass: null,
    status: "vacant",
    statusNote: "Vacancy confirmed by the official chamber roster.",
    sourceUrl: "https://example.gov/official-roster",
    lastVerifiedAt: "2026-08-22T00:00:00Z",
  },
  official: null,
};

describe("RepresentativeCard", () => {
  it("represents a vacancy explicitly without inventing an officeholder", () => {
    render(<RepresentativeCard representation={vacantRepresentation} />);

    expect(
      screen.getByRole("heading", { name: "Office currently vacant" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Vacancy confirmed/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Review official status" }),
    ).toHaveAttribute("href", "https://example.gov/official-roster");
  });
});
