import { ImageResponse } from "next/og";

export const contentType = "image/png";
export const size = {
  width: 180,
  height: 180,
};

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#0b1220",
          borderRadius: 36,
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%",
          border: "2px solid #1f2a3d",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 22,
            height: 124,
            background: "#60a5fa",
            transform: "translateX(-25px) rotate(17deg)",
            borderRadius: 10,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 22,
            height: 124,
            background: "#22d3ee",
            transform: "translateX(5px) rotate(17deg)",
            borderRadius: 10,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderTop: "13px solid transparent",
            borderBottom: "13px solid transparent",
            borderLeft: "18px solid #e2e8f0",
            transform: "translate(38px, -6px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            borderRadius: 999,
            background: "#67e8f9",
            transform: "translate(38px, -45px)",
          }}
        />
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  );
}
