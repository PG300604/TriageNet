import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const PaperCrumpleOverlay: React.FC<{
  opacity?: number;
  unfoldProgress?: number;
}> = ({ opacity = 0.25, unfoldProgress = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle breathing / paper texture motion
  const turbulenceFreq = 0.035 + 0.005 * Math.sin(frame / (2 * fps));
  const creaseOpacity = interpolate(unfoldProgress, [0, 0.5, 1], [0.45, 0.25, 0.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
        zIndex: 1,
        mixBlendMode: "overlay",
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id="paperCrumpleFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={turbulenceFreq}
            numOctaves="4"
            result="noise"
          />
          <feDiffuseLighting
            in="noise"
            lightingColor="#ffffff"
            surfaceScale="2"
            result="light"
          >
            <feDistantLight azimuth="45" elevation="60" />
          </feDiffuseLighting>
          <feBlend mode="multiply" in="SourceGraphic" in2="light" />
        </filter>

        {/* Paper Background Fill with Filter */}
        <rect width="100%" height="100%" fill="#ffffff" filter="url(#paperCrumpleFilter)" opacity={creaseOpacity} />

        {/* Organic Crumple Crease Lines (Diagonal & Faceted folds) */}
        <g stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.2" fill="none">
          <path d="M 0 120 Q 340 180 620 90 T 1280 240 T 1920 160" />
          <path d="M 0 460 Q 480 380 960 520 T 1540 420 T 1920 480" />
          <path d="M 0 820 Q 520 740 1100 860 T 1720 780 T 1920 840" />
          <path d="M 280 0 Q 360 420 310 800 T 360 1080" />
          <path d="M 840 0 Q 890 380 820 720 T 880 1080" />
          <path d="M 1420 0 Q 1380 460 1460 760 T 1410 1080" />
        </g>

        {/* Fold Shadow Facets */}
        <polygon points="0,0 320,160 180,420 0,280" fill="rgba(0,0,0,0.18)" opacity={creaseOpacity} />
        <polygon points="620,90 980,240 840,540 520,380" fill="rgba(255,255,255,0.06)" opacity={creaseOpacity} />
        <polygon points="1280,240 1680,180 1540,580 1180,480" fill="rgba(0,0,0,0.14)" opacity={creaseOpacity} />
        <polygon points="340,680 820,620 740,980 280,1020" fill="rgba(255,255,255,0.05)" opacity={creaseOpacity} />
      </svg>
    </div>
  );
};
