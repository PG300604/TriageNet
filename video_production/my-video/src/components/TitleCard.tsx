import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AmbulanceFigurine, ParamedicFigurine } from "./Figurines";
import { theme } from "./theme";

export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Grid line animation
  const gridAlpha = interpolate(frame, [0, 1.2 * fps], [0, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Badge animation
  const badgeOpacity = interpolate(frame, [0.3 * fps, 1.2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const badgeTranslateY = interpolate(
    frame,
    [0.3 * fps, 1.2 * fps],
    [-20, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  // Main Title scale & opacity
  const titleOpacity = interpolate(frame, [0.6 * fps, 1.8 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const titleScale = interpolate(frame, [0.6 * fps, 1.8 * fps], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 15, mass: 0.8 }),
    output: "perceptual-scale",
  });

  // Subtitle reveal
  const subtitleOpacity = interpolate(frame, [1.4 * fps, 2.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const subtitleTranslateY = interpolate(
    frame,
    [1.4 * fps, 2.4 * fps],
    [20, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  // Left Figurine Entrance (Paramedic)
  const paramedicX = interpolate(frame, [1.0 * fps, 2.2 * fps], [-160, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 16 }),
  });
  const paramedicOpacity = interpolate(frame, [1.0 * fps, 2.0 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Right Figurine Entrance (Ambulance)
  const ambulanceX = interpolate(frame, [1.2 * fps, 2.6 * fps], [200, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 16 }),
  });
  const ambulanceOpacity = interpolate(frame, [1.2 * fps, 2.2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ECG Pulse Line Reveal
  const ecgProgress = interpolate(frame, [0.8 * fps, 3.0 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });

  // Glow pulse
  const glowIntensity =
    interpolate(Math.sin((frame / fps) * 4), [-1, 1], [0.3, 0.7]) *
    titleOpacity;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: theme.bgGradient,
        overflow: "hidden",
      }}
    >
      {/* Background Animated SVG Coordinate Grid */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: gridAlpha,
          pointerEvents: "none",
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="titleGrid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="0.8"
            />
            <circle cx="60" cy="60" r="1.5" fill="#00F0FF" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#titleGrid)" />

        {/* Animated ECG Pulse Path across the center */}
        <path
          d="M 0 540 L 400 540 L 480 540 L 510 490 L 540 600 L 570 450 L 600 570 L 630 530 L 660 540 L 1920 540"
          stroke="#00F0FF"
          strokeWidth="3.5"
          fill="none"
          strokeDasharray="1920"
          strokeDashoffset={1920 * (1 - ecgProgress)}
          style={{
            filter: "drop-shadow(0 0 10px #00F0FF)",
          }}
        />
      </svg>

      {/* Decorative Top Coordinates Tag */}
      <div
        style={{
          position: "absolute",
          top: 60,
          display: "flex",
          gap: 36,
          opacity: badgeOpacity,
          fontFamily: theme.monoFamily,
          fontSize: 13,
          color: theme.slate400,
          letterSpacing: 2,
        }}
      >
        <span>SYS: 24-DISTRICT EMERGENCY MESH</span>
        <span>LATENCY: &lt; 280MS</span>
        <span>STATUS: ACTIVE GRID</span>
      </div>

      {/* Center Content Group */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 5,
          textAlign: "center",
          maxWidth: 1200,
        }}
      >
        {/* Top Glowing Badge */}
        <div
          style={{
            opacity: badgeOpacity,
            translate: `0px ${badgeTranslateY}px`,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 24px",
            borderRadius: 9999,
            backgroundColor: "rgba(0, 240, 255, 0.1)",
            border: "1.5px solid rgba(0, 240, 255, 0.45)",
            boxShadow: "0 0 24px rgba(0, 240, 255, 0.25)",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: theme.crimson,
              boxShadow: "0 0 10px #FF3366",
            }}
          />
          <span
            style={{
              fontFamily: theme.monoFamily,
              fontSize: 15,
              fontWeight: 700,
              color: theme.cyan,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            JHARKHAND STATE TRAUMA COORDINATION NETWORK
          </span>
        </div>

        {/* Hero Title */}
        <div
          style={{
            opacity: titleOpacity,
            scale: titleScale,
            fontFamily: theme.fontFamily,
            fontSize: 128,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: -3,
            background: "linear-gradient(135deg, #FFFFFF 20%, #00F0FF 75%, #05D69E 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: `drop-shadow(0 0 ${40 * glowIntensity}px rgba(0, 240, 255, 0.5))`,
            marginBottom: 24,
          }}
        >
          TriageNet
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: subtitleOpacity,
            translate: `0px ${subtitleTranslateY}px`,
            fontFamily: theme.fontFamily,
            fontSize: 32,
            fontWeight: 500,
            color: theme.slate300,
            letterSpacing: 0.5,
            maxWidth: 960,
            lineHeight: 1.4,
            marginBottom: 32,
          }}
        >
          Real-Time Distributed Emergency Response &amp; Golden Hour Orchestration
        </div>

        {/* Core Pillars / Hand-Implemented Algorithms Badges */}
        <div
          style={{
            opacity: subtitleOpacity,
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            { label: "Sigmoid SeverityScorer", color: theme.crimson },
            { label: "Bipartite HungarianMatcher", color: theme.cyan },
            { label: "Dijkstra Green Wave GIS", color: theme.emerald },
            { label: "Specialist Paging Mesh", color: theme.amber },
          ].map((pill, i) => (
            <div
              key={i}
              style={{
                fontFamily: theme.monoFamily,
                fontSize: 14,
                fontWeight: 600,
                color: pill.color,
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                border: `1.5px solid ${pill.color}44`,
                padding: "8px 18px",
                borderRadius: 8,
                boxShadow: `0 4px 15px rgba(0, 0, 0, 0.4)`,
              }}
            >
              {pill.label}
            </div>
          ))}
        </div>
      </div>

      {/* Flanking 2D Illustrated Figurines */}
      {/* Left: 108 Paramedic Figurine */}
      <div
        style={{
          position: "absolute",
          left: 120,
          bottom: 70,
          opacity: paramedicOpacity,
          translate: `${paramedicX}px 0px`,
          zIndex: 6,
        }}
      >
        <ParamedicFigurine scale={1.1} armAngle={-10} isReporting={true} />
      </div>

      {/* Right: 108 ALS Ambulance Figurine */}
      <div
        style={{
          position: "absolute",
          right: 90,
          bottom: 80,
          opacity: ambulanceOpacity,
          translate: `${ambulanceX}px 0px`,
          zIndex: 6,
        }}
      >
        <AmbulanceFigurine
          scale={1.05}
          lightPhase={frame / fps}
          wheelRotation={frame * 12}
        />
      </div>
    </div>
  );
};
