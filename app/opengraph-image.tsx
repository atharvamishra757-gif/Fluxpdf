import { ImageResponse } from "next/og";

export default async function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "630px",
          width: "1200px",
          background: "linear-gradient(135deg, #635BFF 0%, #8B5CF6 50%, #D946EF 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "24px",
            padding: "48px",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1 style={{
            fontSize: "56px",
            fontWeight: "800",
            color: "white",
            margin: "0 0 16px 0",
            lineHeight: "1.2",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            textAlign: "center",
          }}>
            FluxPDF
          </h1>
          <p style={{
            fontSize: "24px",
            color: "rgba(255, 255, 255, 0.9)",
            margin: "0 0 24px 0",
            fontWeight: "400",
            textAlign: "center",
          }}>
            Everything you need to work with PDFs
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
