import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DeviceMockup } from "../components/DeviceMockup";
import { DoctorFigurine, HospitalFigurine } from "../components/Figurines";
import { theme } from "../components/theme";

export const Scene5SpecialistReception: React.FC = () => {
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
              color: theme.amber,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            MODULE 04 • HOSPITAL INTAKE &amp; SPECIALIST ACTIVATION
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
            Zero-Minute Triage &amp; Direct Trauma Team Paging
          </div>
        </div>

        <div
          style={{
            fontFamily: theme.monoFamily,
            fontSize: 13,
            color: theme.amber,
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            padding: "6px 16px",
            borderRadius: 6,
          }}
        >
          RECEPTION: Zero Latency Pre-Alert
        </div>
      </div>

      {/* Main Grid: Left (Hospital + Doctor Figurines) / Right (Screen Recording) */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          alignItems: "center",
        }}
      >
        {/* Left Section: 2D Hospital & Doctor Figurines */}
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
          {/* Hospital & Doctor Visual Card */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              borderRadius: 20,
              border: `1.5px solid ${theme.cardBorder}`,
              padding: "24px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            {/* 2D Hospital Building */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <HospitalFigurine scale={0.78} glow={true} />
              <div
                style={{
                  fontFamily: theme.monoFamily,
                  fontSize: 12,
                  fontWeight: "bold",
                  color: theme.cyan,
                  marginTop: 6,
                }}
              >
                RIMS TRAUMA CENTER
              </div>
            </div>

            {/* Pulsing Pre-Alert Arrow */}
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
                  color: theme.amber,
                  backgroundColor: "rgba(245, 158, 11, 0.15)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontWeight: "bold",
                }}
              >
                DIRECT PAGER ALERT
              </div>
              <svg width="100" height="20">
                <line
                  x1="0"
                  y1="10"
                  x2="100"
                  y2="10"
                  stroke={theme.amber}
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  strokeDashoffset={-frame * 2}
                />
              </svg>
              <div style={{ fontSize: 10, color: theme.slate400, fontFamily: theme.monoFamily }}>
                OR-3 PRE-RESERVED
              </div>
            </div>

            {/* 2D Doctor Figurine */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <DoctorFigurine scale={0.8} pagerAlert={true} />
              <div
                style={{
                  fontFamily: theme.monoFamily,
                  fontSize: 12,
                  fontWeight: "bold",
                  color: theme.slate300,
                  marginTop: 6,
                }}
              >
                TRAUMA SURGEON
              </div>
            </div>
          </div>

          {/* Key Advantages Pill Card */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              borderRadius: 18,
              border: `1.5px solid rgba(245, 158, 11, 0.3)`,
              padding: "20px 24px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: theme.slate400, fontFamily: theme.monoFamily }}>
                PRE-ALERT PROTOCOL
              </div>
              <div style={{ fontSize: 16, fontWeight: "bold", color: theme.white, marginTop: 4 }}>
                Instant Digital Voucher
              </div>
              <div style={{ fontSize: 12, color: theme.slate300, marginTop: 2 }}>
                Patient vitals &amp; GCS score broadcast 15 mins before arrival.
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: theme.slate400, fontFamily: theme.monoFamily }}>
                CLINICAL READINESS
              </div>
              <div style={{ fontSize: 16, fontWeight: "bold", color: theme.emerald, marginTop: 4 }}>
                Zero-Minute Door-to-OR
              </div>
              <div style={{ fontSize: 12, color: theme.slate300, marginTop: 2 }}>
                Blood units cross-matched and surgical team scrubbed in advance.
              </div>
            </div>
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
            src="screens/clip_05_web_doctor_paging.mp4"
            type="laptop"
            width={720}
            height={460}
            title="Doctor Specialist Direct Trauma Paging • Web ED Console"
            badge="DIRECT DOCTOR PAGING"
            glowColor={theme.amber}
          />
        </div>
      </div>
    </div>
  );
};
