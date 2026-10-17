import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DeviceMockup } from "../components/DeviceMockup";
import { DispatcherFigurine } from "../components/Figurines";
import { theme } from "./../components/theme";

export const Scene3BipartiteMatching: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animations
  const headerOpacity = interpolate(frame, [0, 0.8 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const leftX = interpolate(frame, [0.3 * fps, 1.2 * fps], [-60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 16 }),
  });
  const leftOpacity = interpolate(frame, [0.3 * fps, 1.0 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rightX = interpolate(frame, [0.6 * fps, 1.5 * fps], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 16 }),
  });
  const rightOpacity = interpolate(frame, [0.6 * fps, 1.2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Bipartite edge matching reveal
  const matchPhase = interpolate(frame, [1.0 * fps, 2.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
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
              color: theme.cyan,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            MODULE 02 • DISPATCH OPTIMIZATION &amp; RESOURCE ALLOCATION
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
            Bipartite Hospital Assignment &amp; Max-Heap Queue
          </div>
        </div>

        <div
          style={{
            fontFamily: theme.monoFamily,
            fontSize: 13,
            color: theme.emerald,
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            padding: "6px 16px",
            borderRadius: 6,
          }}
        >
          ALGORITHM: HungarianMatcher.java (O(V³))
        </div>
      </div>

      {/* Main Grid */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          alignItems: "center",
        }}
      >
        {/* Left Section: Dispatcher 2D Figurine + Bipartite Graph Architecture */}
        <div
          style={{
            opacity: leftOpacity,
            translate: `${leftX}px 0px`,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            height: "100%",
            justifyContent: "center",
          }}
        >
          {/* Dispatcher Command Center Box */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              borderRadius: 20,
              border: `1.5px solid ${theme.cardBorder}`,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <DispatcherFigurine scale={0.78} />
            <div>
              <div
                style={{
                  fontFamily: theme.monoFamily,
                  fontSize: 11,
                  color: theme.cyan,
                  fontWeight: "bold",
                  letterSpacing: 1,
                }}
              >
                108 EMERGENCY DISPATCH
              </div>
              <div
                style={{
                  fontFamily: theme.fontFamily,
                  fontSize: 22,
                  fontWeight: 800,
                  color: theme.white,
                  marginTop: 4,
                }}
              >
                Statewide Resource Broker
              </div>
              <div
                style={{
                  fontFamily: theme.fontFamily,
                  fontSize: 13,
                  color: theme.slate300,
                  marginTop: 6,
                  lineHeight: 1.4,
                }}
              >
                Monitors ICU beds, ventilator availability, and distance matrices across all 24 districts in real time.
              </div>
            </div>
          </div>

          {/* Bipartite Matching Graph SVG */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              borderRadius: 18,
              border: `1.5px solid rgba(0, 240, 255, 0.25)`,
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
                fontFamily: theme.monoFamily,
                fontSize: 11,
                color: theme.slate400,
              }}
            >
              <span>IN-FLIGHT AMBULANCES (SET U)</span>
              <span>HOSPITAL ED BAYS (SET V)</span>
            </div>

            <svg width="100%" height="150" viewBox="0 0 460 150">
              {/* Left Ambulance Nodes */}
              <g transform="translate(40, 30)">
                <circle cx="0" cy="0" r="14" fill="#0284C7" />
                <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">A-108</text>
              </g>
              <g transform="translate(40, 75)">
                <circle cx="0" cy="0" r="14" fill="#0284C7" />
                <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">A-112</text>
              </g>
              <g transform="translate(40, 120)">
                <circle cx="0" cy="0" r="14" fill="#0284C7" />
                <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">A-204</text>
              </g>

              {/* Right Hospital Nodes */}
              <g transform="translate(420, 30)">
                <circle cx="0" cy="0" r="14" fill="#10B981" />
                <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">RIMS</text>
              </g>
              <g transform="translate(420, 75)">
                <circle cx="0" cy="0" r="14" fill="#10B981" />
                <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">MGM</text>
              </g>
              <g transform="translate(420, 120)">
                <circle cx="0" cy="0" r="14" fill="#10B981" />
                <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">SADAR</text>
              </g>

              {/* Optimal Matching Edges (Computed by HungarianMatcher) */}
              <line
                x1="54"
                y1="30"
                x2={54 + (406 - 54) * matchPhase}
                y2={30 + (30 - 30) * matchPhase}
                stroke={theme.emerald}
                strokeWidth="3.5"
              />
              <line
                x1="54"
                y1="75"
                x2={54 + (406 - 54) * matchPhase}
                y2={75 + (120 - 75) * matchPhase}
                stroke={theme.cyan}
                strokeWidth="3.5"
              />
              <line
                x1="54"
                y1="120"
                x2={54 + (406 - 54) * matchPhase}
                y2={120 + (75 - 120) * matchPhase}
                stroke={theme.amber}
                strokeWidth="3.5"
              />

              {matchPhase > 0.8 && (
                <text
                  x="230"
                  y="75"
                  textAnchor="middle"
                  fill="#10B981"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily={theme.monoFamily}
                  style={{
                    backgroundColor: "#020617",
                  }}
                >
                  ✓ GLOBAL MIN-COST ASSIGNMENT
                </text>
              )}
            </svg>
          </div>
        </div>

        {/* Right Section: Real Screen Recording Embedded in 2D Laptop Mockup */}
        <div
          style={{
            opacity: rightOpacity,
            translate: `${rightX}px 0px`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <DeviceMockup
            src="screens/clip_03_web_triage_heap.mp4"
            type="laptop"
            width={720}
            height={460}
            title="Triage Priority Max-Heap Queue • Web Command Console"
            badge="PRIORITY MAX-HEAP"
            glowColor={theme.cyan}
          />
        </div>
      </div>
    </div>
  );
};
