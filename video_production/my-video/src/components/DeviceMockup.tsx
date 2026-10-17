import React from "react";
import { OffthreadVideo, staticFile } from "remotion";
import { appleTheme } from "./theme";

interface DeviceMockupProps {
  src: string;
  type?: "laptop" | "phone" | "tablet";
  width?: number;
  height?: number;
  title?: string;
  badge?: string;
  darkSurface?: boolean;
  glowColor?: string;
}

export const DeviceMockup: React.FC<DeviceMockupProps> = ({
  src,
  type = "laptop",
  width = 840,
  height = 500,
  title = "TriageNet Command Console",
  badge = "LIVE TELEMETRY",
  darkSurface = true,
}) => {
  if (type === "phone") {
    const phoneWidth = width === 840 ? 340 : width;
    const phoneHeight = height === 500 ? 620 : height;
    return (
      <div
        style={{
          width: phoneWidth,
          height: phoneHeight,
          backgroundColor: "#18181a",
          borderRadius: 44,
          padding: 12,
          border: "1px solid rgba(255, 255, 255, 0.16)",
          boxShadow: darkSurface
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
            : appleTheme.productShadow,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            width: 88,
            height: 22,
            backgroundColor: "#000000",
            borderRadius: 14,
            zIndex: 20,
          }}
        />

        {/* Screen Container */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 34,
            overflow: "hidden",
            position: "relative",
            backgroundColor: "#000000",
          }}
        >
          <OffthreadVideo
            src={staticFile(src)}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    );
  }

  // MacBook / Studio Display Frame
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: "#1d1d1f",
        borderRadius: 18,
        border: darkSurface
          ? "1px solid rgba(255, 255, 255, 0.12)"
          : "1px solid rgba(0, 0, 0, 0.08)",
        boxShadow: darkSurface
          ? "0 30px 60px -15px rgba(0, 0, 0, 0.85)"
          : appleTheme.productShadow,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Studio Header Bar */}
      <div
        style={{
          height: 38,
          backgroundColor: "#272729",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
        }}
      >
        {/* Mac Window Controls */}
        <div style={{ display: "flex", gap: 7 }}>
          <div style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#ff5f57" }} />
          <div style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#febc2e" }} />
          <div style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#28c840" }} />
        </div>

        {/* Console Title */}
        <div
          style={{
            fontFamily: appleTheme.fontFamily,
            fontSize: 13,
            fontWeight: 400,
            color: "rgba(255, 255, 255, 0.75)",
            letterSpacing: -0.2,
          }}
        >
          {title}
        </div>

        {/* Minimalist Badge */}
        <div
          style={{
            fontFamily: appleTheme.fontFamily,
            fontSize: 11,
            color: appleTheme.primaryOnDark,
            backgroundColor: "rgba(41, 151, 255, 0.15)",
            padding: "2px 8px",
            borderRadius: 6,
            fontWeight: 500,
          }}
        >
          {badge}
        </div>
      </div>

      {/* Screen Area */}
      <div
        style={{
          flex: 1,
          width: "100%",
          position: "relative",
          backgroundColor: "#000000",
          overflow: "hidden",
        }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
};
