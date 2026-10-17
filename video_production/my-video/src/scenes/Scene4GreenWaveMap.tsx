import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DeviceMockup } from "../components/DeviceMockup";
import { JharkhandMap } from "../components/JharkhandMap";
import { theme } from "../components/theme";

export const Scene4GreenWaveMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header animation
  const headerOpacity = interpolate(frame, [0, 0.8 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Transit progress across NH-33 corridor: smooth travel from 0 to 1 over the scene
  const transitProgress = interpolate(frame, [0.5 * fps, 10 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 1, 0.5, 1),
  });

  const mapScale = interpolate(frame, [0, 1.2 * fps], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    output: "perceptual-scale",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: theme.bgGradient,
        overflow: "hidden",
        padding: "50px 80px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Scene Header */}
      <div
        style={{
          opacity: headerOpacity,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          borderBottom: "1.5px solid rgba(255, 255, 255, 0.12)",
          paddingBottom: 18,
          marginBottom: 30,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: theme.monoFamily,
              fontSize: 13,
              fontWeight: "bold",
              color: theme.emerald,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            MODULE 03 • GEOSPATIAL TRANSIT &amp; GREEN WAVE PREEMPTION
          </div>
          <div
            style={{
              fontFamily: theme.fontFamily,
              fontSize: 38,
              fontWeight: 800,
              color: theme.white,
              letterSpacing: -0.5,
            }}
          >
            NH-33 Highway Corridor &amp; Traffic Preemption
          </div>
        </div>

        <div
          style={{
            fontFamily: theme.monoFamily,
            fontSize: 13,
            color: theme.cyan,
            backgroundColor: "rgba(0, 240, 255, 0.1)",
            border: "1px solid rgba(0, 240, 255, 0.3)",
            padding: "6px 16px",
            borderRadius: 6,
          }}
        >
          ALGORITHM: DijkstraRouter.java
        </div>
      </div>

      {/* Main Grid: Left (Jharkhand Vector GIS Map) / Right (Real Screen Recording) */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          gap: 40,
          alignItems: "center",
        }}
      >
        {/* Left: 2D Vector Topographic Map with moving Ambulance */}
        <div
          style={{
            height: "100%",
            borderRadius: 20,
            overflow: "hidden",
            border: `2px solid ${theme.cardBorder}`,
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
            position: "relative",
            scale: mapScale,
          }}
        >
          <JharkhandMap
            progress={transitProgress}
            greenWaveActive={transitProgress > 0.3}
          />
        </div>

        {/* Right: Embedded Real Screen Recording in 2D Dashboard Window */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <DeviceMockup
            src="screens/clip_04_web_gis_highway_siren.mp4"
            type="laptop"
            width={680}
            height={440}
            title="NH-33 GIS Corridor &amp; Siren Preemption • Live Web Console"
            badge="LIVE PREEMPTION FEED"
            glowColor={theme.emerald}
          />
        </div>
      </div>
    </div>
  );
};
