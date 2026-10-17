import React from "react";
import { Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  AnamorphicLensFlare,
  AppleSpecPill,
  LogoRippleReveal,
  SnappyBouncyText,
} from "../components/AppleComponents";
import { appleTheme } from "../components/theme";

export const Scene2Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0.15 * fps, 0.7 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const subtitleOpacity = interpolate(frame, [0.4 * fps, 0.9 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animated laser beam scan
  const laserProgress = interpolate(frame, [0.3 * fps, 1.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: appleTheme.surfaceBlack,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 100px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Cinematic Anamorphic Lens Flare Sweep on TriageNet Reveal */}
      <AnamorphicLensFlare color={appleTheme.neonMint} triggerFrame={10} duration={50} />

      {/* Background Subtle Tech Mesh Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* Top Tagline */}
      <div
        style={{
          opacity: subtitleOpacity,
          display: "flex",
          gap: 28,
          alignItems: "center",
          fontFamily: appleTheme.fontFamily,
          fontSize: 13,
          fontWeight: 700,
          color: appleTheme.bodyMuted,
          letterSpacing: 2.5,
          textTransform: "uppercase",
          marginBottom: 36,
          zIndex: 10,
        }}
      >
        <span>DISTRIBUTED TRAUMA GRID</span>
        <span>•</span>
        <span>SUB-SECOND DISPATCH</span>
        <span>•</span>
        <span>ZERO PAPERWORK</span>
      </div>

      {/* Hero Center Section with Concentric Logo Shockwave Ripple */}
      <div
        style={{
          textAlign: "center",
          maxWidth: 1200,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Round Logo Ripple Reveal with Expanding Shockwave Rings */}
        <div style={{ marginBottom: 6 }}>
          <LogoRippleReveal
            logoSrc={staticFile("triagenet-logo.png")}
            size={76}
            delayFrames={8}
          />
        </div>

        {/* Introducing Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
            opacity: subtitleOpacity,
          }}
        >
          <span
            style={{
              fontFamily: appleTheme.fontFamily,
              fontSize: 14,
              fontWeight: 700,
              color: appleTheme.primaryOnDark,
              letterSpacing: 3.0,
              textTransform: "uppercase",
            }}
          >
            INTRODUCING
          </span>
        </div>

        {/* Wordmark with Smooth Snappy Stretch */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            lineHeight: 1.0,
            letterSpacing: -2.0,
            marginBottom: 20,
            opacity: titleOpacity,
          }}
        >
          <SnappyBouncyText
            text="Triage"
            fontSize={104}
            fontWeight={800}
            color="#ffffff"
            delayFrames={10}
            bouncyPeriod={false}
          />
          <SnappyBouncyText
            text="Net"
            fontSize={104}
            fontWeight={800}
            color={appleTheme.neonMint}
            delayFrames={12}
            bouncyPeriod={false}
          />
          <span
            style={{
              fontFamily: appleTheme.fontFamily,
              fontSize: 104,
              fontWeight: 800,
              color: "#ffffff",
              display: "inline-block",
            }}
          >
            .
          </span>
        </div>

        {/* Animated Neon Laser Scan Line */}
        <div
          style={{
            width: 580,
            height: 2.5,
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            position: "relative",
            overflow: "hidden",
            marginBottom: 24,
            borderRadius: 2,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: `${laserProgress * 100}%`,
              backgroundColor: appleTheme.neonMint,
              boxShadow: `0 0 16px ${appleTheme.neonMint}`,
            }}
          />
        </div>

        {/* Stable Subtitle */}
        <div
          style={{
            fontFamily: appleTheme.fontFamily,
            fontSize: 26,
            fontWeight: 400,
            color: appleTheme.bodyMuted,
            letterSpacing: -0.3,
            marginBottom: 28,
            opacity: subtitleOpacity,
            lineHeight: 1.3,
          }}
        >
          The unified emergency trauma and critical care grid.
        </div>

        {/* Authentic Apple Hardware/Software Spec Pills */}
        <div style={{ display: "flex", gap: 16, opacity: subtitleOpacity }}>
          <AppleSpecPill label="24 Districts Unified" badge="NETWORK" accent={appleTheme.neonMint} jitter={false} />
          <AppleSpecPill label="1.48ms Inference" badge="ML CORE" accent={appleTheme.primaryOnDark} jitter={false} />
          <AppleSpecPill label="Zero-Minute Pre-Alert" badge="PROTOCOL" accent={appleTheme.neonAmber} jitter={false} />
        </div>
      </div>
    </div>
  );
};
