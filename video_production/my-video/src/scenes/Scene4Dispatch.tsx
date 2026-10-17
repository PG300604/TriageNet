import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  AppleSpecPill,
  GlassCardWithFlare,
  SnappyBouncyText,
} from "../components/AppleComponents";
import { DeviceMockup } from "../components/DeviceMockup";
import { DispatcherFigurine } from "../components/Figurines";
import { appleTheme } from "../components/theme";

export const Scene4Dispatch: React.FC = () => {
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
            color: appleTheme.primaryOnDark,
            letterSpacing: 2.2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          AUTOMATED RESOURCE ORCHESTRATION &amp; DISPATCH
        </div>

        {/* Snappy Bouncy Stretch Headline */}
        <SnappyBouncyText
          text="Intelligent Hospital Assignment."
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
          Kuhn-Munkres bipartite matching eliminates phone bottlenecks, allocating patients to open ICU beds and surgeons.
        </div>
      </div>

      {/* Grid: Living Dispatcher Figurine & Enlarged Command Center Display */}
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
        {/* Left: Dispatcher & Live Hospital Glass Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <GlassCardWithFlare
            dark={true}
            accentGlow="rgba(41, 151, 255, 0.3)"
            style={{
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            {/* Living Dispatcher with Swiveling Head, Typing Hands, Radar Displays */}
            <DispatcherFigurine scale={0.88} showNarrativeBubble={false} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#ffffff", fontFamily: appleTheme.fontFamily }}>
                State Command Deck
              </div>
              <div style={{ fontSize: 12, color: appleTheme.bodyMuted, fontFamily: appleTheme.fontFamily, marginTop: 4, lineHeight: 1.4 }}>
                Real-time visibility over 24 districts, dynamically balancing queue loads with verified on-duty surgical teams.
              </div>
            </div>
          </GlassCardWithFlare>

          {/* 4 Hospital Live Capacity Glass Badges with Light Sweep Sheen */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { name: "RIMS Ranchi", beds: "14 ICU Beds Open", status: "Active Intake", color: appleTheme.neonMint },
              { name: "MGM Jamshedpur", beds: "6 Ventilators Open", status: "Critical Ready", color: appleTheme.neonMint },
              { name: "SNMMCH Dhanbad", beds: "4 Blood Units Ready", status: "Available", color: appleTheme.primaryOnDark },
              { name: "Sadar Network", beds: "24 Districts Linked", status: "Synchronized", color: appleTheme.neonAmber },
            ].map((h, i) => (
              <GlassCardWithFlare
                key={i}
                dark={true}
                style={{
                  padding: "12px 14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", fontFamily: appleTheme.fontFamily }}>
                    {h.name}
                  </span>
                  <span style={{ fontSize: 10, color: h.color, fontWeight: 700, fontFamily: appleTheme.fontFamily }}>
                    ● {h.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: appleTheme.bodyMuted, fontFamily: appleTheme.fontFamily, marginTop: 3 }}>
                  {h.beds}
                </div>
              </GlassCardWithFlare>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <AppleSpecPill label="O(V³) Hungarian Algorithm" badge="OPTIMAL" accent={appleTheme.neonMint} jitter={false} />
            <AppleSpecPill label="99.4% Match Accuracy" badge="AI MATCH" accent={appleTheme.primaryOnDark} jitter={false} />
          </div>
        </div>

        {/* Right: Enlarged Screen Recording of Priority Heap (Width: 780, Height: 480) */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <DeviceMockup
            src="screens/clip_03_web_triage_heap.mp4"
            type="laptop"
            width={780}
            height={480}
            title="Triage Priority Queue • Command Console"
            badge="LIVE PRIORITY QUEUE"
            darkSurface={true}
          />
        </div>
      </div>
    </div>
  );
};
