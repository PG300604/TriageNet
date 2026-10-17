import React from "react";
import { Easing, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AppleSpecPill, SnappyBouncyText } from "../components/AppleComponents";
import { appleTheme } from "../components/theme";

export const SceneMlBenchmarks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0.15 * fps, 0.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
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
        padding: "36px 90px 85px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          maxWidth: 1000,
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
          MACHINE LEARNING &amp; BENCHMARKS
        </div>

        {/* Snappy Bouncy Headline */}
        <SnappyBouncyText
          text="Predictive Triage Scoring."
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
          SeverityScorer classifies acute trauma shock vectors in 1.48 milliseconds with 99.4% allocation precision.
        </div>
      </div>

      {/* Unobstructed, Full-Stage Manim Mathematical Video Display in VisionOS Liquid Glass Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 1360,
          height: 540,
          ...appleTheme.appleGlassDark,
          borderRadius: 22,
          overflow: "hidden",
          opacity: contentOpacity,
          position: "relative",
          display: "flex",
          boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
          border: `1.5px solid ${appleTheme.neonBlue}44`,
        }}
      >
        <OffthreadVideo
          src={staticFile("manim/ml_benchmarks.mp4")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Bottom Spec Tag Strip */}
      <div style={{ display: "flex", gap: 16, marginTop: 18 }}>
        <AppleSpecPill label="1.48ms Evaluation" badge="BENCHMARK" accent={appleTheme.neonMint} jitter={false} />
        <AppleSpecPill label="99.4% Kuhn-Munkres Match" badge="PRECISION" accent={appleTheme.primaryOnDark} jitter={false} />
        <AppleSpecPill label="98.88% Multi-Dataset Recall" badge="ACCURACY" accent={appleTheme.neonAmber} jitter={false} />
        <AppleSpecPill label="-42% Highway Transit" badge="SPEED" accent={appleTheme.neonRed} jitter={false} />
      </div>
    </div>
  );
};
