import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DeviceMockup } from "../components/DeviceMockup";
import { ParamedicFigurine, PatientFigurine } from "../components/Figurines";
import { theme } from "../components/theme";

export const Scene2AcuityScoring: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene Entrance Animations
  const headerOpacity = interpolate(frame, [0, 0.8 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headerY = interpolate(frame, [0, 0.8 * fps], [-20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const leftPanelX = interpolate(frame, [0.3 * fps, 1.2 * fps], [-60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 16 }),
  });
  const leftPanelOpacity = interpolate(frame, [0.3 * fps, 1.0 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rightPanelX = interpolate(frame, [0.6 * fps, 1.5 * fps], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 16 }),
  });
  const rightPanelOpacity = interpolate(frame, [0.6 * fps, 1.2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Sigmoid Curve Draw Animation
  const sigmoidProgress = interpolate(frame, [1.0 * fps, 2.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Patient Heartbeat pulse
  const heartRateBeat = interpolate(
    Math.sin((frame / fps) * 8),
    [-1, 1],
    [0.96, 1.05]
  );

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
          translate: `0px ${headerY}px`,
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
              color: theme.crimson,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            MODULE 01 • FIELD INTAKE &amp; CLINICAL TELEMETRY
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
            Algorithmic Severity Scoring &amp; Real-time Vitals
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
          ALGORITHM: SeverityScorer.java
        </div>
      </div>

      {/* Main Content: Left (2D Figurines + Architecture) / Right (Screen Recording) */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          gap: 48,
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Left Section: 2D Figurines & Sigmoid Architecture */}
        <div
          style={{
            opacity: leftPanelOpacity,
            translate: `${leftPanelX}px 0px`,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            height: "100%",
            justifyContent: "center",
          }}
        >
          {/* 2D Figurines Stage */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.7)",
              borderRadius: 20,
              border: `1.5px solid ${theme.cardBorder}`,
              padding: "24px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* Paramedic Figurine */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <ParamedicFigurine scale={0.78} isReporting={true} />
              <div
                style={{
                  fontFamily: theme.monoFamily,
                  fontSize: 12,
                  fontWeight: "bold",
                  color: theme.cyan,
                  marginTop: 6,
                }}
              >
                108 ALS PARAMEDIC
              </div>
            </div>

            {/* Connecting Telemetry Cable */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontFamily: theme.monoFamily,
                  fontSize: 11,
                  color: theme.crimson,
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontWeight: "bold",
                }}
              >
                SYNC: SpO2, GCS, BP
              </div>
              <svg width="120" height="24">
                <line
                  x1="0"
                  y1="12"
                  x2="120"
                  y2="12"
                  stroke={theme.crimson}
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  strokeDashoffset={-frame * 2}
                />
                <circle cx={60} cy={12} r={5} fill="#FFFFFF" />
              </svg>
              <div style={{ fontSize: 10, color: theme.slate400, fontFamily: theme.monoFamily }}>
                OFFLINE SQLITE -&gt; REST API
              </div>
            </div>

            {/* Patient Figurine on Gurney */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <PatientFigurine scale={0.82} heartRateBeat={heartRateBeat} />
              <div
                style={{
                  fontFamily: theme.monoFamily,
                  fontSize: 12,
                  fontWeight: "bold",
                  color: theme.slate300,
                  marginTop: 6,
                }}
              >
                CRITICAL TRAUMA PATIENT
              </div>
            </div>
          </div>

          {/* Mathematical Sigmoid Architecture Diagram Card */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              borderRadius: 18,
              border: `1.5px solid rgba(239, 68, 68, 0.35)`,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: theme.monoFamily,
                  fontSize: 11,
                  color: theme.slate400,
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                HAND-IMPLEMENTED ALGORITHM
              </div>
              <div
                style={{
                  fontFamily: theme.fontFamily,
                  fontSize: 22,
                  fontWeight: 800,
                  color: theme.crimson,
                }}
              >
                Sigmoid Severity Formula
              </div>
              <div
                style={{
                  fontFamily: theme.monoFamily,
                  fontSize: 14,
                  color: theme.white,
                  marginTop: 6,
                  backgroundColor: "#020617",
                  padding: "6px 12px",
                  borderRadius: 6,
                  display: "inline-block",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                S(v) = 1 / (1 + e^-k(v - v0))
              </div>
            </div>

            {/* Animated S-Curve Visual */}
            <div style={{ width: 180, height: 90, position: "relative" }}>
              <svg width="180" height="90" viewBox="0 0 180 90">
                {/* Axes */}
                <line x1="15" y1="80" x2="170" y2="80" stroke="#334155" strokeWidth="1.5" />
                <line x1="15" y1="10" x2="15" y2="80" stroke="#334155" strokeWidth="1.5" />
                {/* Sigmoid Path */}
                <path
                  d="M 20 75 Q 80 75 90 45 T 165 15"
                  stroke={theme.crimson}
                  strokeWidth="3.5"
                  fill="none"
                  strokeDasharray="200"
                  strokeDashoffset={200 * (1 - sigmoidProgress)}
                />
                {/* Acuity Critical threshold dot */}
                {sigmoidProgress > 0.8 && (
                  <circle cx="140" cy="22" r="5" fill="#EF4444" />
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* Right Section: Real Screen Recording Embedded in 2D Laptop Mockup */}
        <div
          style={{
            opacity: rightPanelOpacity,
            translate: `${rightPanelX}px 0px`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <DeviceMockup
            src="screens/clip_02_web_acuity_sliders.mp4"
            type="laptop"
            width={720}
            height={460}
            title="TriageNet Acuity Telemetry Console • Web Dashboard"
            badge="LIVE PATIENT TELEMETRY"
            glowColor={theme.crimson}
          />
        </div>
      </div>
    </div>
  );
};
