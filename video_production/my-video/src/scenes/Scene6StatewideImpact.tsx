import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  DispatcherFigurine,
  DoctorFigurine,
  ParamedicFigurine,
} from "../components/Figurines";
import { theme } from "../components/theme";

export const Scene6StatewideImpact: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 0.8 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleScale = interpolate(frame, [0, 0.8 * fps], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 14 }),
    output: "perceptual-scale",
  });

  const cardsOpacity = interpolate(frame, [0.4 * fps, 1.2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardsY = interpolate(frame, [0.4 * fps, 1.2 * fps], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const teamOpacity = interpolate(frame, [0.8 * fps, 1.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const metrics = [
    { value: "-42%", label: "Golden Hour Latency", color: theme.emerald },
    { value: "24", label: "Districts Synchronized", color: theme.cyan },
    { value: "10K+", label: "Digital Pre-Alerts", color: theme.amber },
    { value: "100%", label: "Real-time Traceability", color: theme.crimson },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: theme.bgGradient,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "60px 80px 40px",
        boxSizing: "border-box",
      }}
    >
      {/* Top Finale Banner */}
      <div
        style={{
          opacity: titleOpacity,
          scale: titleScale,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: theme.monoFamily,
            fontSize: 14,
            fontWeight: "bold",
            color: theme.cyan,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          MEASURABLE STATEWIDE OUTCOMES
        </div>
        <div
          style={{
            fontFamily: theme.fontFamily,
            fontSize: 54,
            fontWeight: 800,
            background: "linear-gradient(135deg, #FFFFFF 20%, #00F0FF 80%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: -1,
          }}
        >
          Transforming Trauma Care Across Jharkhand
        </div>
      </div>

      {/* 4 Impact Stat Cards */}
      <div
        style={{
          opacity: cardsOpacity,
          translate: `0px ${cardsY}px`,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 28,
          width: "100%",
          maxWidth: 1300,
        }}
      >
        {metrics.map((m, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              borderRadius: 20,
              border: `1.5px solid ${m.color}44`,
              padding: "24px 20px",
              textAlign: "center",
              boxShadow: `0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${m.color}20`,
            }}
          >
            <div
              style={{
                fontFamily: theme.fontFamily,
                fontSize: 52,
                fontWeight: 800,
                color: m.color,
                lineHeight: 1.1,
              }}
            >
              {m.value}
            </div>
            <div
              style={{
                fontFamily: theme.monoFamily,
                fontSize: 13,
                color: theme.slate300,
                marginTop: 8,
                fontWeight: 600,
              }}
            >
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* Figurines Lineup: Paramedic, Dispatcher, Doctor united */}
      <div
        style={{
          opacity: teamOpacity,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 60,
          marginTop: 10,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <ParamedicFigurine scale={0.72} armAngle={0} />
          <span style={{ fontSize: 11, fontFamily: theme.monoFamily, color: theme.cyan, marginTop: 4 }}>
            108 Paramedic
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <DispatcherFigurine scale={0.72} />
          <span style={{ fontSize: 11, fontFamily: theme.monoFamily, color: theme.cyan, marginTop: 4 }}>
            Command Dispatcher
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <DoctorFigurine scale={0.72} pagerAlert={false} />
          <span style={{ fontSize: 11, fontFamily: theme.monoFamily, color: theme.cyan, marginTop: 4 }}>
            Trauma Surgeon
          </span>
        </div>
      </div>

      {/* Footer Callout */}
      <div
        style={{
          opacity: titleOpacity,
          fontFamily: theme.monoFamily,
          fontSize: 14,
          color: theme.slate400,
          letterSpacing: 1.5,
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          paddingTop: 16,
          width: "100%",
          textAlign: "center",
        }}
      >
        TRIAGENET • PRODUCTION EMERGENCY TRAUMA INFRASTRUCTURE • OPEN SOURCE
      </div>
    </div>
  );
};
