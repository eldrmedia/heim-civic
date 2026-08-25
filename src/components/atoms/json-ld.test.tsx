import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JsonLd } from "@/components/atoms/json-ld";

describe("JsonLd", () => {
  it("escapes source text that could otherwise close the script element", () => {
    const { container } = render(
      <JsonLd
        data={{
          "@context": "https://schema.org",
          name: "Official title </script><script>alert(1)</script>",
        }}
      />,
    );
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );

    expect(script?.innerHTML).toContain("\\u003c/script>");
    expect(container.querySelectorAll("script")).toHaveLength(1);
  });
});
