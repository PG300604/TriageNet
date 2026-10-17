import React from "react";
import { Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AppleSpecPill, SnappyBouncyText } from "../components/AppleComponents";
import { PaperCrumpleOverlay } from "../components/PaperCrumpleOverlay";
import { appleTheme } from "../components/theme";

interface TechNodeProps {
  icon: string;
  name: string;
  role: string;
  badge: string;
  accent: string;
  delayFrame: number;
}

const TechCard: React.FC<TechNodeProps> = ({
  icon,
  name,
  role,
  badge,
  accent,
  delayFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [delayFrame, delayFrame + 0.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const scale = interpolate(frame, [delayFrame, delayFrame + 0.4 * fps], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 14 }),
    output: "perceptual-scale",
  });

  return (
    <div
      style={{
        opacity,
        scale,
        ...appleTheme.appleGlassDark,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        position: "relative",
      }}
    >
      {/* Tech SVG Logo Container */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 7,
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <img
          src={staticFile(`tech/${icon}`)}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          alt={name}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", fontFamily: appleTheme.fontFamily }}>
            {name}
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: accent,
              backgroundColor: `${accent}18`,
              padding: "2px 6px",
              borderRadius: 4,
              fontFamily: appleTheme.fontFamily,
              letterSpacing: 0.5,
            }}
          >
            {badge}
          </span>
        </div>
        <div style={{ fontSize: 11, color: appleTheme.bodyMuted, fontFamily: appleTheme.fontFamily, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {role}
        </div>
      </div>
    </div>
  );
};

export const SceneTechArchitecture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0.2 * fps, 0.7 * fps], [0, 1], {
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
        padding: "36px 90px 85px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Tactile Paper Crumpled Animation SVG Layer */}
      <PaperCrumpleOverlay opacity={0.3} unfoldProgress={titleOpacity} />

      {/* Header */}
      <div
        style={{
          textAlign: "center",
          maxWidth: 960,
          marginBottom: 20,
          opacity: titleOpacity,
          zIndex: 2,
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
          ENGINEERING ARCHITECTURE &amp; DEVOPS
        </div>
        <SnappyBouncyText
          text="Distributed Microservices Architecture."
          fontSize={48}
          fontWeight={800}
          color={appleTheme.bodyOnDark}
          delayFrames={6}
          bouncyPeriod={false}
          style={{
            lineHeight: 1.05,
            letterSpacing: -0.4,
            marginBottom: 8,
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
          High-throughput reactive Spring Boot 3, Nginx reverse proxy, and multi-tier containerized deployment.
        </div>
      </div>

      {/* 3-Column Architecture Tier Diagram with 11 Tech SVGs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 22,
          maxWidth: 1380,
          width: "100%",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Tier 1: Field & Mobility */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: appleTheme.primaryOnDark, fontFamily: appleTheme.fontFamily, letterSpacing: 1.5 }}>
            TIER 1 • FIELD INTAKE &amp; CLIENTS
          </div>
          <TechCard
            icon="android.svg"
            name="Android ALS App"
            role="Offline-first Kotlin & Room SQLite client"
            badge="KOTLIN"
            accent={appleTheme.neonMint}
            delayFrame={6}
          />
          <TechCard
            icon="leaflet.svg"
            name="Leaflet GIS Engine"
            role="Highway GPS vector telematics & waypoints"
            badge="GIS MAPPING"
            accent={appleTheme.primaryOnDark}
            delayFrame={12}
          />
          <TechCard
            icon="typescript.svg"
            name="TypeScript Engine"
            role="Strongly-typed shared trauma protocols"
            badge="TYPESCRIPT"
            accent="#3178c6"
            delayFrame={18}
          />
        </div>

        {/* Tier 2: Cloud Engine & State Queue */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: appleTheme.neonAmber, fontFamily: appleTheme.fontFamily, letterSpacing: 1.5 }}>
            TIER 2 • REACTIVE BACKEND &amp; QUEUES
          </div>
          <TechCard
            icon="spring-boot.svg"
            name="Spring Boot 3 Core"
            role="Java 17 reactive microservices & WebFlux"
            badge="REACTIVE API"
            accent={appleTheme.neonMint}
            delayFrame={10}
          />
          <TechCard
            icon="redis.svg"
            name="Redis Max-Heap"
            role="Sub-millisecond priority triage queue"
            badge="IN-MEMORY"
            accent={appleTheme.neonRed}
            delayFrame={16}
          />
          <TechCard
            icon="postgresql.svg"
            name="PostgreSQL Ledger"
            role="Cryptographic patient audit & JPA records"
            badge="PERSISTENCE"
            accent={appleTheme.primaryOnDark}
            delayFrame={22}
          />
          <TechCard
            icon="nginx.svg"
            name="Nginx Reverse Proxy"
            role="High-concurrency SSL termination & proxy"
            badge="GATEWAY"
            accent="#009639"
            delayFrame={28}
          />
        </div>

        {/* Tier 3: Command & Deployment */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: appleTheme.neonMint, fontFamily: appleTheme.fontFamily, letterSpacing: 1.5 }}>
            TIER 3 • COMMAND &amp; DEPLOYMENT
          </div>
          <TechCard
            icon="nextjs.svg"
            name="Next.js 15 Hub"
            role="TypeScript single pane of glass command deck"
            badge="REACT 19"
            accent="#ffffff"
            delayFrame={14}
          />
          <TechCard
            icon="docker.svg"
            name="Docker Production"
            role="Multi-container orchestrated deployment"
            badge="COMPOSE"
            accent={appleTheme.primaryOnDark}
            delayFrame={20}
          />
          <TechCard
            icon="python.svg"
            name="ML & Telemetry"
            role="Preemption simulation & training pipeline"
            badge="DATA MODEL"
            accent={appleTheme.neonAmber}
            delayFrame={26}
          />
          <TechCard
            icon="tailwind.svg"
            name="Tailwind Design"
            role="VisionOS glassmorphic component tokens"
            badge="DESIGN SYSTEM"
            accent="#38bdf8"
            delayFrame={32}
          />
        </div>
      </div>

      {/* Bottom Architectural Spec Pills */}
      <div
        style={{
          marginTop: 22,
          display: "flex",
          gap: 16,
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <AppleSpecPill label="End-to-End Latency: < 280ms" badge="SPEED" accent={appleTheme.neonMint} />
        <AppleSpecPill label="Resilience: Offline Sync Guaranteed" badge="MESH" accent={appleTheme.primaryOnDark} />
        <AppleSpecPill label="Standard: FHIR & Ayushman Bharat Ready" badge="HEALTH" accent={appleTheme.neonAmber} />
      </div>
    </div>
  );
};
