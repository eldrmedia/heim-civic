import { ImageResponse } from "next/og";

export const alt =
  "Heim Civic Nevada — Nevada government, made findable and source-driven";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#f6ecd8",
        color: "#0c4f40",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            display: "flex",
            border: "7px solid #cf6940",
            borderRadius: 5,
            transform: "rotate(45deg)",
          }}
        />
        Heim Civic Nevada
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            maxWidth: 920,
            display: "flex",
            fontSize: 72,
            lineHeight: 1.05,
            fontWeight: 800,
          }}
        >
          Nevada government, made findable.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#33454a",
          }}
        >
          Districts · officials · bills · votes · official sources
        </div>
      </div>
    </div>,
    size,
  );
}
