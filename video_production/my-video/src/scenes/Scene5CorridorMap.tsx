import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  AppleSpecPill,
  GlassCardWithFlare,
  SnappyBouncyText,
} from "../components/AppleComponents";
import { DeviceMockup } from "../components/DeviceMockup";
import { JharkhandMap } from "../components/JharkhandMap";
import { appleTheme } from "../components/theme";

export const Scene5CorridorMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0.15 * fps, 0.7 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const transitProgress = interpolate(frame, [0.4 * fps, 24 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 1, 0.5, 1),
  });

  const contentOpacity = interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: appleTheme.tileDark2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "36px 80px 85px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          maxWidth: 960,
          marginBottom: 16,
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            fontFamily: appleTheme.fontFamily,
            fontSize: 13,
            fontWeight: 700,
            color: appleTheme.neonMint,
            letterSpacing: 2.2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          CORRIDOR NAVIGATION &amp; HIGHWAY TELEMATICS
        </div>

        {/* Snappy Bouncy Headline */}
        <SnappyBouncyText
          text="Green Wave Navigation."
          fontSize={48}
          fontWeight={800}
          color={appleTheme.bodyOnDark}
          delayFrames={6}
          bouncyPeriod={false}
          style={{
            lineHeight: 1.05,
            letterSpacing: -0.4,
            marginBottom: 6,
          }}
        />

        <div
          style={{
            fontFamily: appleTheme.fontFamily,
            fontSize: 18,
            fontWeight: 400,
            color: appleTheme.bodyMuted,
            lineHeight: 1.4,
          }}
        >
          Dijkstra’s shortest path algorithm and Hungarian matching operate together to locate and route to the best hospital, while Green Wave preemption clears traffic lights.
        </div>
      </div>

      {/* Map & Enlarged Live Radar Screen */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
          alignItems: "center",
          maxWidth: 1380,
          width: "100%",
          opacity: contentOpacity,
        }}
      >
        {/* Apple Keynote GIS Map with Frosted Glass Border (Height: 480) */}
        <GlassCardWithFlare
          dark={true}
          accentGlow={appleTheme.neonMint}
          style={{
            height: 480,
            borderRadius: 22,
            overflow: "hidden",
            position: "relative",
            padding: 0,
          }}
        >
          <JharkhandMap progress={transitProgress} greenWaveActive={transitProgress > 0.25} />
        </GlassCardWithFlare>

        {/* Real Highway Siren Telemetry Screen Recording (Enlarged: 760x470) */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <DeviceMockup
            src="screens/clip_04_web_gis_highway_siren.mp4"
            type="laptop"
            width={760}
            height={470}
            title="NH-33 Highway Siren Telematics • Web Console"
            badge="GREEN WAVE FEED"
            darkSurface={true}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <AppleSpecPill label="Dijkstra Router + Hungarian Matcher" badge="ALGORITHM DUAL" accent={appleTheme.neonMint} jitter={false} />
            <AppleSpecPill label="Best Hospital Found: RIMS OR-3" badge="OPTIMAL" accent={appleTheme.primaryOnDark} jitter={false} />
            <AppleSpecPill label="4 Traffic Lights Cleared" badge="GREEN WAVE" accent={appleTheme.neonAmber} jitter={false} />
            <AppleSpecPill label="18 Minutes Reclaimed" badge="TIME SAVED" accent={appleTheme.neonMint} jitter={false} />
          </div>
        </div>
      </div>
    </div>
  );
};
