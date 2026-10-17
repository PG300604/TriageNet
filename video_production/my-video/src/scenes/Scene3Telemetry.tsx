import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  AppleSpecPill,
  GlassCardWithFlare,
  SnappyBouncyText,
} from "../components/AppleComponents";
import { DeviceMockup } from "../components/DeviceMockup";
import { ParamedicFigurine, PatientFigurine } from "../components/Figurines";
import { appleTheme } from "../components/theme";

export const Scene3Telemetry: React.FC = () => {
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
        backgroundColor: appleTheme.canvas,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "36px 90px 85px",
        boxSizing: "border-box",
      }}
    >
      {/* Tile Header */}
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
          108 ALS AMBULANCE FLEET &amp; TELEMETRY
        </div>

        {/* Snappy Bouncy Headline */}
        <SnappyBouncyText
          text="Field Telemetry. Reimagined."
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
          Paramedics capture critical physiological vitals and broadcast trauma pre-alerts before transport begins.
        </div>
      </div>

      {/* Side-by-Side: Living Paramedic & Patient Story + Phone Mockup */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          gap: 36,
          alignItems: "center",
          maxWidth: 1320,
          width: "100%",
          opacity: contentOpacity,
        }}
      >
        {/* Left Column: Living Ambulance Interior Scene with Paramedic & Patient on Gurney */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <GlassCardWithFlare
            dark={false}
            accentGlow="rgba(48, 209, 88, 0.3)"
            style={{
              padding: "16px 20px",
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 16,
              minHeight: 190,
            }}
          >
            {/* Paramedic tapping tablet */}
            <ParamedicFigurine scale={0.72} isReporting={true} armMode="tablet" showNarrativeBubble={false} />
            <div style={{ width: 1, height: 140, backgroundColor: "rgba(0, 0, 0, 0.08)", marginBottom: 10 }} />
            {/* Patient breathing on gurney with falling saline drip */}
            <PatientFigurine scale={0.64} heartRateBeat={1} showNarrativeBubble={false} />
          </GlassCardWithFlare>

          {/* 3 Apple VisionOS Feature Cards with Light-Sweep Sheen */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              {
                title: "Offline SQLite",
                desc: "Captures full vital sets in remote valleys; auto-syncs online.",
                badge: "OFFLINE",
                color: appleTheme.neonMint,
              },
              {
                title: "QR Voucher",
                desc: "Tamper-proof token linked to Ayushman Bharat records.",
                badge: "SECURITY",
                color: appleTheme.primary,
              },
              {
                title: "5G Stream",
                desc: "Continuous SpO2, blood pressure, and GCS neural telemetry.",
                badge: "REAL-TIME",
                color: appleTheme.neonAmber,
              },
            ].map((f, i) => (
              <GlassCardWithFlare
                key={i}
                dark={false}
                style={{
                  padding: "14px 16px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: appleTheme.ink, fontFamily: appleTheme.fontFamily }}>
                    {f.title}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: f.color,
                      backgroundColor: `${f.color}15`,
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontFamily: appleTheme.fontFamily,
                    }}
                  >
                    {f.badge}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: appleTheme.inkMuted80, fontFamily: appleTheme.fontFamily, marginTop: 4, lineHeight: 1.35 }}>
                  {f.desc}
                </div>
              </GlassCardWithFlare>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <AppleSpecPill label="Offline SQLite Mesh" badge="STORAGE" accent={appleTheme.neonMint} jitter={false} dark={false} />
            <AppleSpecPill label="Ayushman QR Voucher" badge="SECURITY" accent={appleTheme.primary} jitter={false} dark={false} />
          </div>
        </div>

        {/* Right Column: Apple Phone Frame with Screen Recording + Android & iOS Companion Badge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <DeviceMockup
            src="screens/clip_09_mobile_paramedic_gps.mp4"
            type="phone"
            width={310}
            height={550}
            darkSurface={false}
          />

          {/* Mobile Companion App Available for Android and iOS badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              backgroundColor: "rgba(29, 29, 31, 0.08)",
              border: "1px solid rgba(0, 0, 0, 0.12)",
              borderRadius: 9999,
              padding: "6px 18px",
            }}
          >
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {/* Apple icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#1d1d1f">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.05-.03.07-.42 1.44-1.38 2.82M15.97 6.37c.63-.76 1.05-1.83.93-2.9-.9.04-2 .6-2.65 1.36-.58.67-.99 1.77-.85 2.81 1.01.08 2.05-.51 2.57-1.27z" />
              </svg>
              {/* Android icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#30d158">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.0854 12 8.0854c-1.8533 0-3.5902.3262-5.1368.8643L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
              </svg>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: appleTheme.ink, fontFamily: appleTheme.fontFamily }}>
              Mobile Companion App Available for Android &amp; iOS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
