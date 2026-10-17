import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  AnamorphicLensFlare,
  GlassCardWithFlare,
  JitterText,
  SnappyBouncyText,
} from "../components/AppleComponents";
import { PatientFigurine } from "../components/Figurines";
import { appleTheme } from "../components/theme";

export const Scene1Vision: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0.2 * fps, 0.7 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const contentOpacity = interpolate(frame, [0.4 * fps, 0.9 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Jharkhand crisis infographic entrance
  const jharkhandInfographicProgress = interpolate(frame, [3.8 * fps, 4.8 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Animated ticking clock for Golden Hour
  const secondsLeft = Math.max(0, 60 - Math.floor((frame / fps) * 2));
  const clockText = `00:${secondsLeft < 10 ? "0" : ""}${secondsLeft}:24`;

  // Heartbeat pulse wave
  const ecgProgress = (frame % (2 * fps)) / (2 * fps);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: appleTheme.canvasParchment,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "36px 90px 90px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Cinematic Anamorphic Lens Flare Sweep on Entrance */}
      <AnamorphicLensFlare color={appleTheme.neonRed} triggerFrame={6} duration={48} />

      {/* Header */}
      <div
        style={{
          textAlign: "center",
          maxWidth: 1100,
          opacity: titleOpacity,
          marginBottom: 26,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
          <span
            style={{
              fontFamily: appleTheme.fontFamily,
              fontSize: 13,
              fontWeight: 700,
              color: appleTheme.primary,
              letterSpacing: 2.2,
              textTransform: "uppercase",
            }}
          >
            THE GOLDEN HOUR CRISIS
          </span>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "rgba(255, 255, 255, 0.88)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              padding: "5px 16px",
              borderRadius: 9999,
              border: "1px solid rgba(0, 0, 0, 0.08)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: appleTheme.neonRed,
                boxShadow: `0 0 10px ${appleTheme.neonRed}`,
              }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: appleTheme.ink,
                fontFamily: appleTheme.monoFamily,
              }}
            >
              COUNTDOWN: <JitterText intensity={0.4} chromatic={true}>{clockText}</JitterText>
            </span>
          </div>
        </div>

        {/* Snappy Bouncy Stretch Title */}
        <SnappyBouncyText
          text="In critical trauma, minutes decide mortality."
          fontSize={52}
          fontWeight={800}
          color={appleTheme.ink}
          delayFrames={10}
          bouncyPeriod={false}
          style={{
            lineHeight: 1.05,
            letterSpacing: -0.4,
            marginBottom: 10,
          }}
        />

        <div
          style={{
            fontFamily: appleTheme.fontFamily,
            fontSize: 20,
            fontWeight: 400,
            color: appleTheme.inkMuted80,
            lineHeight: 1.4,
            maxWidth: 960,
          }}
        >
          Across Jharkhand’s rural highway corridors, fragmented telephone handoffs and delayed triage response create life-threatening bottlenecks.
        </div>
      </div>

      {/* 3-Column Motion Infographic Grid: Patient Vitals + 24-District Jharkhand Crisis Radar + Impact Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1.15fr 0.95fr",
          gap: 28,
          width: "100%",
          maxWidth: 1380,
          opacity: contentOpacity,
          alignItems: "center",
        }}
      >
        {/* Left Column: Story-Driven Patient on Gurney & Rural Bystander Calling 108 */}
        <GlassCardWithFlare
          dark={false}
          accentGlow="rgba(255, 69, 58, 0.25)"
          style={{
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: appleTheme.ink,
                fontFamily: appleTheme.fontFamily,
                letterSpacing: 0.5,
              }}
            >
              PATIENT INTAKE #JH-108-782
            </span>
            <JitterText chromatic={true}>
              <span
                style={{
                  fontSize: 11,
                  color: appleTheme.neonRed,
                  fontWeight: 700,
                  fontFamily: appleTheme.fontFamily,
                }}
              >
                ● LEVEL 1 ACUTE HYPOXIA
              </span>
            </JitterText>
          </div>

          {/* Patient on Gurney with SpO2 Telemetry */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 165,
              padding: "10px 0",
            }}
          >
            <PatientFigurine scale={0.95} heartRateBeat={1} showNarrativeBubble={false} />
          </div>

          {/* Animated SVG Oscilloscope */}
          <div
            style={{
              height: 38,
              backgroundColor: "#1d1d1f",
              borderRadius: 10,
              padding: "3px 12px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg width="100%" height="28" viewBox="0 0 500 28" fill="none">
              <path
                d="M 0 14 L 120 14 L 140 14 L 150 4 L 160 24 L 170 6 L 180 18 L 190 14 L 500 14"
                stroke={appleTheme.neonMint}
                strokeWidth="2.5"
                strokeDasharray="500"
                strokeDashoffset={500 * (1 - ecgProgress)}
              />
            </svg>
          </div>
        </GlassCardWithFlare>

        {/* Center Column: Jharkhand 24-District Motion Infographic Radar */}
        <GlassCardWithFlare
          dark={false}
          accentGlow="rgba(220, 80, 0, 0.3)"
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  backgroundColor: appleTheme.neonRed,
                  boxShadow: `0 0 8px ${appleTheme.neonRed}`,
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: appleTheme.ink,
                  fontFamily: appleTheme.fontFamily,
                  letterSpacing: 0.5,
                }}
              >
                24 RURAL DISTRICTS AT RISK
              </span>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: appleTheme.neonRed,
                backgroundColor: "rgba(255, 69, 58, 0.14)",
                padding: "3px 8px",
                borderRadius: 6,
                fontFamily: appleTheme.monoFamily,
              }}
            >
              STATEWIDE TRAUMA DESERT
            </span>
          </div>

          {/* Jharkhand Silhouette Map with 24 Pulsing Distress Nodes */}
          <div
            style={{
              width: "100%",
              height: 180,
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 380 200" fill="none">
              {/* Silhouette State Boundary */}
              <path
                d="M 60 70 L 110 40 L 190 30 L 290 45 L 340 100 L 310 160 L 250 180 L 160 175 L 80 150 L 50 110 Z"
                fill="rgba(29, 29, 31, 0.06)"
                stroke="rgba(29, 29, 31, 0.25)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />

              {/* Pulsing Radar Ring */}
              <circle
                cx="190"
                cy="110"
                r={40 + 40 * ((frame % 60) / 60)}
                fill="none"
                stroke={appleTheme.neonRed}
                strokeWidth="1.5"
                opacity={1 - ((frame % 60) / 60)}
              />

              {/* High-Risk District Distress Nodes */}
              {[
                { name: "Palamu", x: 90, y: 80, delay: 0 },
                { name: "Garhwa", x: 70, y: 60, delay: 5 },
                { name: "Gumla", x: 120, y: 140, delay: 10 },
                { name: "Simdega", x: 100, y: 160, delay: 15 },
                { name: "Deoghar", x: 270, y: 70, delay: 20 },
                { name: "Dumka", x: 300, y: 85, delay: 25 },
                { name: "Giridih", x: 230, y: 75, delay: 12 },
                { name: "Hazaribagh", x: 170, y: 80, delay: 18 },
                { name: "Dhanbad", x: 260, y: 120, delay: 22 },
                { name: "Ranchi (Apex)", x: 190, y: 110, delay: 0, isApex: true },
              ].map((d, i) => {
                const pulse = Math.sin((frame + d.delay * 4) * 0.15) * 0.5 + 0.5;
                const nodeColor = d.isApex ? appleTheme.neonMint : appleTheme.neonRed;
                return (
                  <g key={i}>
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r={d.isApex ? 7 : 4.5}
                      fill={nodeColor}
                      opacity={0.85 + pulse * 0.15}
                    />
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r={(d.isApex ? 14 : 9) * (0.8 + pulse * 0.4)}
                      fill="none"
                      stroke={nodeColor}
                      strokeWidth="1.2"
                      opacity={1 - pulse}
                    />
                    <text
                      x={d.x}
                      y={d.y - (d.isApex ? 10 : 7)}
                      textAnchor="middle"
                      fill={d.isApex ? appleTheme.ink : appleTheme.inkMuted80}
                      fontSize={d.isApex ? "10" : "8"}
                      fontWeight={d.isApex ? "800" : "600"}
                      fontFamily={appleTheme.fontFamily}
                    >
                      {d.name}
                    </text>
                  </g>
                );
              })}

              {/* Delayed Corridor Flow Arrow to Ranchi */}
              <path
                d="M 90 80 Q 140 90 190 110"
                stroke={appleTheme.neonRed}
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeDashoffset={-frame * 1.5}
                opacity="0.8"
              />
              <path
                d="M 270 70 Q 230 90 190 110"
                stroke={appleTheme.neonRed}
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeDashoffset={-frame * 1.5}
                opacity="0.8"
              />
            </svg>
          </div>

          {/* Subtitle Telemetry Pill */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 6,
              opacity: jharkhandInfographicProgress,
              transform: `translateY(${(1 - jharkhandInfographicProgress) * 8}px)`,
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(0,0,0,0.04)",
                padding: "4px 10px",
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 600,
                color: appleTheme.ink,
                fontFamily: appleTheme.fontFamily,
              }}
            >
              Tribal Corridors: <b>68% Delayed</b>
            </div>
            <div
              style={{
                backgroundColor: "rgba(0,0,0,0.04)",
                padding: "4px 10px",
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 600,
                color: appleTheme.ink,
                fontFamily: appleTheme.fontFamily,
              }}
            >
              Manual Dispatch: <b>No Pre-Alert</b>
            </div>
          </div>
        </GlassCardWithFlare>

        {/* Right Column: 3 Apple VisionOS Light Spec Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            {
              metric: "42 min",
              label: "Average Rural Transit Delay",
              desc: "Unpaved forest corridors delay access to level-1 trauma surgical care.",
              accent: appleTheme.neonRed,
            },
            {
              metric: "0 sec",
              label: "Hospital Pre-Alert Notice",
              desc: "Traditional phone dispatch lacks live physiological vitals telemetry.",
              accent: appleTheme.ink,
            },
            {
              metric: "58%",
              label: "Preventable Trauma Mortality",
              desc: "Direct result of uncoordinated hospital selection during golden hour.",
              accent: appleTheme.neonAmber,
            },
          ].map((item, idx) => (
            <GlassCardWithFlare
              key={idx}
              dark={false}
              style={{
                padding: "16px 20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: appleTheme.fontFamily,
                    fontSize: 28,
                    fontWeight: 800,
                    color: item.accent,
                    letterSpacing: -0.5,
                  }}
                >
                  {item.metric}
                </span>
                <span
                  style={{
                    fontFamily: appleTheme.fontFamily,
                    fontSize: 13,
                    fontWeight: 700,
                    color: appleTheme.ink,
                  }}
                >
                  {item.label}
                </span>
              </div>
              <div
                style={{
                  fontFamily: appleTheme.fontFamily,
                  fontSize: 12,
                  color: appleTheme.inkMuted80,
                  lineHeight: 1.35,
                }}
              >
                {item.desc}
              </div>
            </GlassCardWithFlare>
          ))}
        </div>
      </div>
    </div>
  );
};
