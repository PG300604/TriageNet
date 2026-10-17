import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";

interface NodeProps {
  title: string;
  subtitle: string;
  iconText: string;
  color: string;
  x: number;
  y: number;
  active?: boolean;
}

export const ArchNode: React.FC<NodeProps> = ({
  title,
  subtitle,
  iconText,
  color,
  x,
  y,
  active = true,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 22px",
        borderRadius: 14,
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        border: `2px solid ${active ? color : "rgba(255, 255, 255, 0.15)"}`,
        boxShadow: active
          ? `0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px ${color}33`
          : "0 8px 20px rgba(0, 0, 0, 0.5)",
        zIndex: 5,
        minWidth: 260,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          backgroundColor: `${color}22`,
          border: `1.5px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: theme.monoFamily,
          fontSize: 16,
          fontWeight: "bold",
          color,
        }}
      >
        {iconText}
      </div>

      <div>
        <div
          style={{
            fontFamily: theme.fontFamily,
            fontSize: 16,
            fontWeight: 700,
            color: theme.white,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: theme.monoFamily,
            fontSize: 12,
            color: theme.slate400,
            marginTop: 2,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
};

// Animated Flow Connector Wire with traveling data packet pulses
export const FlowCable: React.FC<{
  from: { x: number; y: number };
  to: { x: number; y: number };
  color?: string;
  label?: string;
}> = ({ from, to, color = theme.cyan, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Control points for smooth bezier curve
  const midX = (from.x + to.x) / 2;
  const pathD = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;

  // Pulse position along cable
  const pulseT = (frame % (1.5 * fps)) / (1.5 * fps);
  // Point along bezier
  const u = 1 - pulseT;
  const px =
    u * u * u * from.x +
    3 * u * u * pulseT * midX +
    3 * u * pulseT * pulseT * midX +
    pulseT * pulseT * pulseT * to.x;
  const py =
    u * u * u * from.y +
    3 * u * u * pulseT * from.y +
    3 * u * pulseT * pulseT * to.y +
    pulseT * pulseT * pulseT * to.y;

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <defs>
        <filter id="cableGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background wire */}
      <path
        d={pathD}
        stroke="rgba(255, 255, 255, 0.12)"
        strokeWidth="4"
        fill="none"
      />
      {/* Active colored line */}
      <path
        d={pathD}
        stroke={color}
        strokeWidth="2.5"
        strokeDasharray="8 8"
        strokeDashoffset={-frame * 2}
        fill="none"
        opacity="0.8"
      />

      {/* Traveling Data Packet Pulse */}
      <circle
        cx={px}
        cy={py}
        r="6"
        fill="#FFFFFF"
        stroke={color}
        strokeWidth="2"
        filter="url(#cableGlow)"
      />

      {/* Midpoint Label Tag */}
      {label && (
        <text
          x={midX}
          y={(from.y + to.y) / 2 - 12}
          textAnchor="middle"
          fill={color}
          fontSize="11"
          fontWeight="bold"
          fontFamily={theme.monoFamily}
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
        >
          {label}
        </text>
      )}
    </svg>
  );
};
