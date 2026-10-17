import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AmbulanceFigurine } from "./Figurines";
import { appleTheme } from "./theme";

export const JharkhandMap: React.FC<{
  progress: number;
  greenWaveActive?: boolean;
}> = ({ progress, greenWaveActive = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pulse effect for hospital beacon nodes
  const pulseScale = interpolate(
    Math.sin((frame / fps) * 6),
    [-1, 1],
    [0.92, 1.15]
  );

  // Highway NH-33 coordinates waypoints:
  const pA = { x: 180, y: 440 };
  const pB = { x: 420, y: 340 };
  const pC = { x: 740, y: 220 };

  const t = Math.min(1, Math.max(0, progress));
  const ambX =
    Math.pow(1 - t, 2) * pA.x + 2 * (1 - t) * t * pB.x + Math.pow(t, 2) * pC.x;
  const ambY =
    Math.pow(1 - t, 2) * pA.y + 2 * (1 - t) * t * pB.y + Math.pow(t, 2) * pC.y;

  const dx = 2 * (1 - t) * (pB.x - pA.x) + 2 * t * (pC.x - pB.x);
  const dy = 2 * (1 - t) * (pB.y - pA.y) + 2 * t * (pC.y - pB.y);
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: appleTheme.tileDark1,
        overflow: "hidden",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Jharkhand State Boundary Polygon */}
        <path
          d="M 120 180 L 260 120 L 450 100 L 680 90 L 880 140 L 920 280 L 840 460 L 690 540 L 460 560 L 240 510 L 100 380 Z"
          fill="#1f1f21"
          stroke="#38383a"
          strokeWidth="2"
        />

        {/* 24 District Internal Boundaries */}
        <path
          d="
            M 260 120 L 320 260 L 240 510
            M 450 100 L 460 270 L 460 560
            M 680 90 L 630 260 L 690 540
            M 320 260 L 460 270 L 630 260 L 840 460
            M 120 180 L 320 260
            M 460 270 L 420 340 L 680 230
          "
          stroke="#2d2d30"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* District Labels */}
        <text x="210" y="240" fill="#7a7a7a" fontSize="13" fontFamily={appleTheme.fontFamily}>PALAMU</text>
        <text x="360" y="190" fill="#7a7a7a" fontSize="13" fontFamily={appleTheme.fontFamily}>HAZARIBAGH</text>
        <text x="560" y="170" fill="#7a7a7a" fontSize="13" fontFamily={appleTheme.fontFamily}>GIRIDIH</text>
        <text x="760" y="180" fill="#7a7a7a" fontSize="13" fontFamily={appleTheme.fontFamily}>DEOGHAR</text>
        <text x="780" y="320" fill="#7a7a7a" fontSize="13" fontFamily={appleTheme.fontFamily}>DHANBAD</text>
        <text x="690" y="440" fill="#7a7a7a" fontSize="13" fontFamily={appleTheme.fontFamily}>JAMSHEDPUR</text>
        <text x="490" y="320" fill="#ffffff" fontSize="16" fontWeight="600" fontFamily={appleTheme.fontFamily}>RANCHI</text>
        <text x="280" y="440" fill="#7a7a7a" fontSize="13" fontFamily={appleTheme.fontFamily}>GUMLA</text>

        {/* NH-33 Emergency Corridor (Apple Keynote Neon Blue/Mint) */}
        <path
          d={`M ${pA.x} ${pA.y} Q ${pB.x} ${pB.y} ${pC.x} ${pC.y}`}
          stroke={greenWaveActive ? appleTheme.neonMint : appleTheme.neonBlue}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          style={{
            filter: `drop-shadow(0 0 10px ${greenWaveActive ? appleTheme.neonMint : appleTheme.neonBlue})`,
          }}
        />
        {/* Animated Dashed Stripe */}
        <path
          d={`M ${pA.x} ${pA.y} Q ${pB.x} ${pB.y} ${pC.x} ${pC.y}`}
          stroke="#ffffff"
          strokeWidth="2"
          strokeDasharray="10 10"
          strokeDashoffset={-frame * 3}
          fill="none"
        />

        {/* Point A: Incident Location */}
        <g transform={`translate(${pA.x}, ${pA.y})`}>
          <circle cx="0" cy="0" r="10" fill={appleTheme.neonRed} />
          <text x="0" y="24" textAnchor="middle" fill={appleTheme.neonRed} fontSize="11" fontWeight="600" fontFamily={appleTheme.fontFamily}>
            INCIDENT ORIGIN
          </text>
        </g>

        {/* Point B: Ramgarh Intersection */}
        <g transform={`translate(${pB.x}, ${pB.y})`}>
          <circle cx="0" cy="0" r="8" fill={greenWaveActive ? appleTheme.neonMint : appleTheme.neonAmber} />
          <text x="0" y="-14" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily={appleTheme.fontFamily}>
            RAMGARH INTERCHANGE
          </text>
        </g>

        {/* Point C: RIMS Apex Trauma Center */}
        <g transform={`translate(${pC.x}, ${pC.y})`}>
          <circle
            cx="0"
            cy="0"
            r={20 * pulseScale}
            fill={appleTheme.neonMint}
            opacity="0.3"
          />
          <circle cx="0" cy="0" r="12" fill={appleTheme.neonMint} />
          <text x="0" y="-22" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="600" fontFamily={appleTheme.fontFamily}>
            RIMS APEX TRAUMA
          </text>
          <text x="0" y="26" textAnchor="middle" fill="#cccccc" fontSize="11" fontFamily={appleTheme.fontFamily}>
            OR-3 RESERVED
          </text>
        </g>

        {/* Other Hospitals */}
        <g transform="translate(800, 420)">
          <circle cx="0" cy="0" r="8" fill="#555555" />
          <text x="0" y="20" textAnchor="middle" fill="#7a7a7a" fontSize="11" fontFamily={appleTheme.fontFamily}>MGM JAMSHEDPUR</text>
        </g>
        <g transform="translate(820, 260)">
          <circle cx="0" cy="0" r="8" fill="#555555" />
          <text x="0" y="20" textAnchor="middle" fill="#7a7a7a" fontSize="11" fontFamily={appleTheme.fontFamily}>SNMMCH DHANBAD</text>
        </g>
        {/* Ambulance moving precisely ON TOP of the highway line in SVG coordinate space */}
        <g transform={`translate(${ambX}, ${ambY}) rotate(${angleDeg}) scale(0.35)`}>
          <AmbulanceFigurine
            x={-210}
            y={-195}
            lightPhase={frame / fps}
            wheelRotation={frame * 25}
          />
        </g>
      </svg>

      {/* Minimal Apple Keynote Pill HUD */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 28,
          backgroundColor: "rgba(30, 30, 32, 0.9)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 14,
          padding: "10px 20px",
          display: "flex",
          gap: 28,
          alignItems: "center",
          boxShadow: appleTheme.productShadowDark,
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: appleTheme.bodyMuted, fontFamily: appleTheme.fontFamily }}>
            TRANSIT CORRIDOR
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", fontFamily: appleTheme.fontFamily }}>
            National Highway 33
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, color: appleTheme.bodyMuted, fontFamily: appleTheme.fontFamily }}>
            TRAFFIC PREEMPTION
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: appleTheme.neonMint, fontFamily: appleTheme.fontFamily }}>
            ● 4 Green Waves Active
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, color: appleTheme.bodyMuted, fontFamily: appleTheme.fontFamily }}>
            OPTIMAL HOSPITAL MATCH
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: appleTheme.neonMint, fontFamily: appleTheme.fontFamily }}>
            Dijkstra + Hungarian Engine
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, color: appleTheme.bodyMuted, fontFamily: appleTheme.fontFamily }}>
            TIME SAVED
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: appleTheme.primaryOnDark, fontFamily: appleTheme.fontFamily }}>
            18 Minutes
          </div>
        </div>
      </div>
    </div>
  );
};
