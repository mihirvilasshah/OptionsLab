import { ImageResponse } from "next/og";

export const alt = "Options Lab — an interactive options trading university";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #060a13 0%, #0b1224 55%, #07141a 100%)",
          padding: "68px 76px",
          color: "#eef2fb",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -80,
            width: 520,
            height: 520,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(99,102,241,0.42), rgba(99,102,241,0))",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: 180,
            width: 520,
            height: 520,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(52,211,153,0.20), rgba(52,211,153,0))",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #6366f1, #10b981)",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            ↗
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1 }}>Options Lab</div>
            <div style={{ fontSize: 15, letterSpacing: 4, color: "#94a3b8" }}>LEARN · SIMULATE</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0 14px",
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.06,
              maxWidth: 900,
            }}
          >
            <span>Master options trading.</span>
            <span style={{ color: "#8b9cff" }}>One concept at a time.</span>
          </div>
          <div style={{ marginTop: 22, fontSize: 25, color: "#a9b7cc", maxWidth: 780, lineHeight: 1.4 }}>
            Visual lessons, interactive payoff charts, Greeks, strategies and a paper-trading
            simulator — built for beginners.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, fontSize: 19, color: "#cbd5e1" }}>
          {["28 guided lessons", "16 strategies", "5 calculators", "No sign-up"].map((item) => (
            <div
              key={item}
              style={{
                padding: "11px 18px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.28)",
                background: "rgba(15,23,42,0.55)",
                display: "flex",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
