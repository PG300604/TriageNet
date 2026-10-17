import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  AppleSpecPill,
  GlassCardWithFlare,
  SnappyBouncyText,
} from "../components/AppleComponents";
import { DeviceMockup } from "../components/DeviceMockup";
import { DoctorFigurine, HospitalFigurine } from "../components/Figurines";
import { appleTheme } from "../components/theme";

export const Scene6Specialist: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0.15 * fps, 0.7 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const contentOpacity = interpolate(frame, [0.3 * fps, 0.9 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
            color: appleTheme.primary,
            letterSpacing: 2.2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          HOSPITAL INTAKE &amp; ED READINESS
        </div>

        {/* Snappy Bouncy Headline */}
        <SnappyBouncyText
          text="Zero-Minute Door-to-OR."
          fontSize={48}
          fontWeight={800}
          color={appleTheme.ink}
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
            color: appleTheme.inkMuted80,
            lineHeight: 1.4,
          }}
        >
          Specialist trauma surgeons, anesthesiologists, and blood banks are mobilized before the ambulance arrives at the emergency bay.
        </div>
      </div>

      {/* Grid: Living Doctor & Hospital Figurines + Enlarged Doctor Paging Screen */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "0.85fr 1.15fr",
          gap: 36,
          alignItems: "center",
          maxWidth: 1380,
          width: "100%",
          opacity: contentOpacity,
        }}
      >
        {/* Left: 2D Hospital & Living Doctor Figurine in Glass Card with Light-Sweep Sheen */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <GlassCardWithFlare
            dark={false}
            accentGlow="rgba(255, 69, 58, 0.25)"
            style={{
              padding: "16px 20px",
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 16,
              minHeight: 220,
            }}
          >
            <HospitalFigurine scale={0.62} glow={false} />
            <div style={{ width: 1, height: 160, backgroundColor: "rgba(0, 0, 0, 0.08)", marginBottom: 10 }} />
            {/* Living Doctor with Running Stride, Flaring Coat, Swinging Stethoscope, Vibrating Pager */}
            <DoctorFigurine scale={0.75} pagerAlert={true} showNarrativeBubble={false} />
          </GlassCardWithFlare>

          <GlassCardWithFlare
            dark={false}
            style={{
              padding: "16px 24px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: appleTheme.inkMuted48, fontFamily: appleTheme.fontFamily, fontWeight: 600 }}>
                TRIAGE PROTOCOL
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: appleTheme.ink, fontFamily: appleTheme.fontFamily, marginTop: 2 }}>
                Pre-Arrival Team Activation
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: appleTheme.inkMuted48, fontFamily: appleTheme.fontFamily, fontWeight: 600 }}>
                OR READINESS
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: appleTheme.primary, fontFamily: appleTheme.fontFamily, marginTop: 2 }}>
                15 Mins Lead Time
              </div>
            </div>
          </GlassCardWithFlare>

          <div style={{ display: "flex", gap: 12 }}>
            <AppleSpecPill label="Direct Pager Notification" badge="SPECIALIST" accent={appleTheme.neonRed} jitter={false} dark={false} />
            <AppleSpecPill label="Zero-Minute Handover" badge="OR READINESS" accent={appleTheme.primary} jitter={false} dark={false} />
          </div>
        </div>

        {/* Right: Enlarged Screen Recording of Doctor Paging Console (Width: 780, Height: 480) */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <DeviceMockup
            src="screens/clip_05_web_doctor_paging.mp4"
            type="laptop"
            width={780}
            height={480}
            title="Trauma Specialist Direct Paging • Web ED Console"
            badge="DOCTOR PAGING ACTIVE"
            darkSurface={false}
          />
        </div>
      </div>
    </div>
  );
};
