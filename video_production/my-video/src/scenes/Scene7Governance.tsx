import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  AppleSpecPill,
  GlassCardWithFlare,
  SnappyBouncyText,
} from "../components/AppleComponents";
import { DeviceMockup } from "../components/DeviceMockup";
import { HealthDirectorFigurine } from "../components/Figurines";
import { appleTheme } from "../components/theme";

export const Scene7Governance: React.FC = () => {
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
        backgroundColor: appleTheme.tileDark1,
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
            color: appleTheme.neonAmber,
            letterSpacing: 2.2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          ACCOUNTABILITY &amp; FINANCIAL INTEGRITY
        </div>

        {/* Snappy Bouncy Headline */}
        <SnappyBouncyText
          text="Statewide Governance."
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
          Transparent emergency contingency grants, clinician verification, and automated Ayushman Bharat reimbursement.
        </div>
      </div>

      {/* Grid: Living Health Director Figurine + 4 Governance Glass Cards + Screen Recording */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 36,
          alignItems: "center",
          maxWidth: 1380,
          width: "100%",
          opacity: contentOpacity,
        }}
      >
        {/* Left Column: Living Health Director + 4 Minimal Apple Glass Dark Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Living Health Director Figurine Card */}
          <GlassCardWithFlare
            dark={true}
            accentGlow="rgba(48, 209, 88, 0.3)"
            style={{
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <HealthDirectorFigurine scale={0.76} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", fontFamily: appleTheme.fontFamily }}>
                State Health Commissioner &amp; Audit Directorate
              </div>
              <div style={{ fontSize: 12, color: appleTheme.bodyMuted, fontFamily: appleTheme.fontFamily, marginTop: 3, lineHeight: 1.35 }}>
                Real-time cryptographic audit trail across all 24 districts with automated grant disbursements and zero claim leakage.
              </div>
            </div>
          </GlassCardWithFlare>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              {
                badge: "LIQUIDITY",
                title: "Contingency Fund",
                desc: "Instant disbursement for critical consumable supplies without procurement delays.",
                accent: appleTheme.neonMint,
              },
              {
                badge: "RECOVERY",
                title: "Ayushman Sync",
                desc: "Automated digital trauma billing with zero lost claims across state hospitals.",
                accent: appleTheme.primaryOnDark,
              },
              {
                badge: "SECURITY",
                title: "Clinician Roster",
                desc: "Cryptographically verified medical credentials and duty shifts across all 24 districts.",
                accent: appleTheme.neonAmber,
              },
              {
                badge: "AUDIT",
                title: "100% Traceability",
                desc: "Every triage score, ambulance dispatch, and surgeon activation permanently logged.",
                accent: appleTheme.neonRed,
              },
            ].map((item, idx) => (
              <GlassCardWithFlare
                key={idx}
                dark={true}
                style={{
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    fontFamily: appleTheme.fontFamily,
                    fontSize: 11,
                    fontWeight: 700,
                    color: item.accent,
                    letterSpacing: 1.2,
                    marginBottom: 4,
                  }}
                >
                  ● {item.badge}
                </div>
                <div
                  style={{
                    fontFamily: appleTheme.fontFamily,
                    fontSize: 15,
                    fontWeight: 700,
                    color: appleTheme.bodyOnDark,
                    marginBottom: 3,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontFamily: appleTheme.fontFamily,
                    fontSize: 11,
                    color: appleTheme.bodyMuted,
                    lineHeight: 1.35,
                  }}
                >
                  {item.desc}
                </div>
              </GlassCardWithFlare>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <AppleSpecPill label="ABDM NHCX Protocol" badge="STANDARD" accent={appleTheme.neonMint} jitter={false} />
            <AppleSpecPill label="PostgreSQL Audit Ledger" badge="DATABASE" accent={appleTheme.primaryOnDark} jitter={false} />
          </div>
        </div>

        {/* Right Column: Enlarged Screen Recording of Directorate Emergency Grant (Width: 760, Height: 470) */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <DeviceMockup
            src="screens/clip_07_web_contingency_grant.mp4"
            type="laptop"
            width={760}
            height={470}
            title="State Directorate Contingency Console • Web Portal"
            badge="GOVERNANCE AUDIT"
            darkSurface={true}
          />
        </div>
      </div>
    </div>
  );
};
