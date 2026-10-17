import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { appleTheme } from "./theme";

// ==========================================
// 1. Apple Spec Pill Badge
// ==========================================
export const AppleSpecPill: React.FC<{
  label: string;
  badge?: string;
  accent?: string;
  jitter?: boolean;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({ label, badge, accent = appleTheme.primaryOnDark, jitter = false, dark = true, style }) => {
  const frame = useCurrentFrame();
  const jx = jitter ? Math.sin(frame * 31.7) * 0.5 : 0;
  const jy = jitter ? Math.cos(frame * 43.1) * 0.5 : 0;

  const bg = dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)";
  const border = dark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.12)";
  const textColor = dark ? "#ffffff" : appleTheme.ink;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 16px",
        borderRadius: 9999,
        backgroundColor: bg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border,
        boxShadow: dark ? "inset 0 1px 0 rgba(255, 255, 255, 0.18)" : "0 2px 8px rgba(0, 0, 0, 0.04)",
        transform: jitter ? `translate(${jx}px, ${jy}px)` : "none",
        ...style,
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: accent,
          boxShadow: `0 0 8px ${accent}`,
        }}
      />
      {badge && (
        <span
          style={{
            fontFamily: appleTheme.fontFamily,
            fontSize: 11,
            fontWeight: 700,
            color: accent,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {badge}
        </span>
      )}
      <span
        style={{
          fontFamily: appleTheme.fontFamily,
          fontSize: 13,
          fontWeight: 500,
          color: textColor,
          letterSpacing: -0.2,
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ==========================================
// 2. VisionOS Frosted Glass Card
// ==========================================
export const AppleGlassCard: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({ children, dark = true, style }) => {
  const glassStyle = dark ? appleTheme.appleGlassDark : appleTheme.appleGlassLight;
  return (
    <div
      style={{
        ...glassStyle,
        padding: "24px",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ==========================================
// 3. Glass Card With Animated Light-Sweep Flare
// ==========================================
export const GlassCardWithFlare: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  accentGlow?: string;
  style?: React.CSSProperties;
}> = ({ children, dark = true, accentGlow, style }) => {
  const frame = useCurrentFrame();
  const glassStyle = dark ? appleTheme.appleGlassDark : appleTheme.appleGlassLight;

  // Periodic light sweep sheen every 140 frames (~2.3s)
  const sweepCycle = (frame % 140) / 140;
  const sweepX = interpolate(sweepCycle, [0, 0.45], [-120, 220], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sweepOpacity = interpolate(sweepCycle, [0, 0.22, 0.45], [0, 0.35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        ...glassStyle,
        position: "relative",
        padding: "24px",
        boxSizing: "border-box",
        overflow: "hidden",
        border: accentGlow ? `1px solid ${accentGlow}` : glassStyle.border,
        boxShadow: accentGlow
          ? `${glassStyle.boxShadow}, 0 0 20px -4px ${accentGlow}`
          : glassStyle.boxShadow,
        ...style,
      }}
    >
      {/* Light Sweep Flare Sheen */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: `${sweepX}%`,
          width: 80,
          height: "260%",
          transform: "rotate(25deg)",
          background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent)",
          opacity: sweepOpacity,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          display: style?.display || "block",
          flexDirection: style?.flexDirection,
          alignItems: style?.alignItems,
          justifyContent: style?.justifyContent,
          gap: style?.gap,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ==========================================
// 4. Snappy Text Stretch (Smooth Entrance, Rock-Solid Landing)
// ==========================================
export const SnappyBouncyText: React.FC<{
  text: string;
  fontSize?: number;
  fontWeight?: number | string;
  color?: string;
  delayFrames?: number;
  bouncyPeriod?: boolean;
  staggerWords?: boolean;
  style?: React.CSSProperties;
}> = ({
  text,
  fontSize = 48,
  fontWeight = 800,
  color = "#ffffff",
  delayFrames = 0,
  bouncyPeriod = false,
  staggerWords = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Butter-smooth spring entrance with Apple keynote physics
  const springProgress = spring({
    frame: frame - delayFrames,
    fps,
    config: {
      damping: 16,
      mass: 0.75,
      stiffness: 140,
    },
  });

  // Snappy stretch: subtle squash and stretch on entrance only, perfectly lands at 1.0
  const stretchX = interpolate(springProgress, [0, 0.45, 0.8, 1], [0.88, 1.05, 0.98, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stretchY = interpolate(springProgress, [0, 0.45, 0.8, 1], [0.88, 0.96, 1.02, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(springProgress, [0, 0.35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const periodicBounce = bouncyPeriod
    ? Math.sin(((frame - delayFrames) / fps) * Math.PI * 2) * 1.2
    : 0;

  if (staggerWords) {
    const words = text.split(" ");
    return (
      <div
        style={{
          display: "inline-flex",
          flexWrap: "wrap",
          gap: "0.25em",
          alignItems: "center",
          ...style,
        }}
      >
        {words.map((w, i) => {
          const wordDelay = delayFrames + i * 3;
          const wordSpring = spring({
            frame: frame - wordDelay,
            fps,
            config: { damping: 16, mass: 0.6, stiffness: 160 },
          });
          const wx = interpolate(wordSpring, [0, 0.5, 1], [0.9, 1.04, 1]);
          const wy = interpolate(wordSpring, [0, 0.5, 1], [0.9, 0.96, 1]);
          const wBounce = bouncyPeriod
            ? Math.sin(((frame - wordDelay) / fps) * Math.PI * 2 + i * 0.4) * 1.0
            : 0;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontFamily: appleTheme.fontFamily,
                fontSize,
                fontWeight,
                color,
                opacity: interpolate(wordSpring, [0, 0.3], [0, 1]),
                transform: `scale(${wx}, ${wy}) translateY(${wBounce}px)`,
                transformOrigin: "center bottom",
                WebkitFontSmoothing: "antialiased",
                textRendering: "geometricPrecision",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: appleTheme.fontFamily,
        fontSize,
        fontWeight,
        color,
        opacity,
        transform: `scale(${stretchX}, ${stretchY}) translateY(${periodicBounce}px)`,
        transformOrigin: "center center",
        WebkitFontSmoothing: "antialiased",
        textRendering: "geometricPrecision",
        ...style,
      }}
    >
      {text}
    </div>
  );
};

// ==========================================
// 5. Kinetic Jitter Text (Strictly for Highlighted Emphasis)
// ==========================================
export const JitterText: React.FC<{
  children: React.ReactNode;
  intensity?: number;
  chromatic?: boolean;
  style?: React.CSSProperties;
}> = ({ children, intensity = 0.45, chromatic = false, style }) => {
  const frame = useCurrentFrame();

  // Subtle micro-shake ONLY on chromatic/colored emphasis elements
  const shouldShake = chromatic && intensity > 0;
  const jx = shouldShake ? Math.sin(frame * 43.17) * intensity : 0;
  const jy = shouldShake ? Math.cos(frame * 57.81) * intensity : 0;

  const chromaticShadow = chromatic
    ? "-1px 0 rgba(255, 69, 58, 0.65), 1px 0 rgba(41, 151, 255, 0.65)"
    : "none";

  return (
    <span
      style={{
        display: "inline-block",
        transform: shouldShake ? `translate(${jx}px, ${jy}px)` : "none",
        textShadow: chromaticShadow,
        WebkitFontSmoothing: "antialiased",
        textRendering: "geometricPrecision",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// ==========================================
// 6. Kinetic Rolling Counter (Crisp & Stable)
// ==========================================
export const JitterCounter: React.FC<{
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  durationFrames?: number;
  jitterOnFinish?: boolean;
  style?: React.CSSProperties;
}> = ({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  durationFrames = 60,
  jitterOnFinish = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 16, mass: 0.8, stiffness: 120 },
  });

  const currentVal = (progress * value).toFixed(decimals);

  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", ...style }}>
      {prefix}
      <span>{currentVal}</span>
      {suffix}
    </span>
  );
};

// ==========================================
// 7. Round Logo Concentric Ripple Reveal
// ==========================================
export const LogoRippleReveal: React.FC<{
  logoSrc: string;
  size?: number;
  delayFrames?: number;
}> = ({ logoSrc, size = 68, delayFrames = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo drop with snappy overshoot
  const logoProgress = spring({
    frame: frame - delayFrames,
    fps,
    config: { damping: 11, mass: 0.7, stiffness: 180 },
  });

  const logoScale = interpolate(logoProgress, [0, 0.6, 1], [0.3, 1.15, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoOpacity = interpolate(logoProgress, [0, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Concentric ripple rings (4 ripples staggered by 6 frames each)
  const ripples = [0, 6, 12, 18].map((stagger) => {
    const rFrame = Math.max(0, frame - delayFrames - stagger);
    const rProgress = spring({
      frame: rFrame,
      fps,
      config: { damping: 16, mass: 1, stiffness: 90 },
    });
    const scale = interpolate(rProgress, [0, 1], [0.8, 3.8]);
    const opacity = interpolate(rProgress, [0, 0.2, 0.75, 1], [0, 0.85, 0.2, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { scale, opacity };
  });

  // Continuous subtle rotating radar glint
  const radarAngle = (frame * 3) % 360;

  return (
    <div
      style={{
        position: "relative",
        width: size * 3.8,
        height: size * 3.8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Concentric Expanding Shockwave Ripples */}
      {ripples.map((r, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: "50%",
            border: `2px solid ${i % 2 === 0 ? appleTheme.neonMint : appleTheme.neonBlue}`,
            boxShadow: `0 0 18px ${i % 2 === 0 ? appleTheme.neonMint : appleTheme.neonBlue}`,
            transform: `scale(${r.scale})`,
            opacity: r.opacity,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Rotating Radar Glint Beam */}
      <div
        style={{
          position: "absolute",
          width: size * 2.2,
          height: size * 2.2,
          borderRadius: "50%",
          transform: `rotate(${radarAngle}deg)`,
          background: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(48, 209, 88, 0.35) 360deg)`,
          pointerEvents: "none",
          opacity: logoOpacity * 0.7,
        }}
      />

      {/* Center Round Logo */}
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: size * 0.26,
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          boxShadow: `0 8px 32px rgba(48, 209, 88, 0.5), 0 0 24px rgba(41, 151, 255, 0.4)`,
          overflow: "hidden",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0d0d0f",
          zIndex: 5,
        }}
      >
        <img
          src={logoSrc}
          alt="Logo"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </div>
  );
};

// ==========================================
// 8. Cinematic Anamorphic Lens Flare
// ==========================================
export const AnamorphicLensFlare: React.FC<{
  color?: string;
  triggerFrame?: number;
  duration?: number;
}> = ({ color = appleTheme.neonBlue, triggerFrame = 0, duration = 40 }) => {
  const frame = useCurrentFrame();
  const relFrame = frame - triggerFrame;

  if (relFrame < 0 || relFrame > duration) {
    return null;
  }

  const progress = relFrame / duration;
  const opacity = interpolate(progress, [0, 0.15, 0.6, 1], [0, 0.95, 0.4, 0]);
  const scaleX = interpolate(progress, [0, 0.2, 1], [0.3, 1.4, 2.2]);
  const sweepX = interpolate(progress, [0, 1], [-20, 120]);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: "50%",
        height: 120,
        transform: "translateY(-50%)",
        pointerEvents: "none",
        zIndex: 90,
        overflow: "hidden",
        opacity,
      }}
    >
      {/* Horizontal Anamorphic Light Beam */}
      <div
        style={{
          position: "absolute",
          left: "-20%",
          width: "140%",
          height: 2,
          top: "50%",
          transform: `scaleX(${scaleX})`,
          background: `linear-gradient(90deg, transparent, ${color}, #ffffff, ${appleTheme.neonMint}, transparent)`,
          boxShadow: `0 0 16px 2px ${color}, 0 0 30px 4px ${appleTheme.neonMint}`,
        }}
      />
      {/* Moving Lens Hotspot */}
      <div
        style={{
          position: "absolute",
          left: `${sweepX}%`,
          top: "50%",
          width: 240,
          height: 80,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle, #ffffff 0%, ${color} 40%, transparent 75%)`,
          filter: "blur(6px)",
        }}
      />
    </div>
  );
};

// ==========================================
// 9. Live Radar Scanner UI Widget
// ==========================================
export const LiveRadarScanner: React.FC<{
  size?: number;
  accent?: string;
}> = ({ size = 160, accent = appleTheme.neonMint }) => {
  const frame = useCurrentFrame();
  const sweepAngle = (frame * 4) % 360;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        border: "1.5px solid rgba(255, 255, 255, 0.15)",
        backgroundColor: "rgba(10, 10, 12, 0.75)",
        backdropFilter: "blur(20px)",
        overflow: "hidden",
        boxShadow: `inset 0 0 20px rgba(0, 0, 0, 0.8), 0 0 16px ${accent}22`,
      }}
    >
      {/* Concentric Range Rings */}
      <div
        style={{
          position: "absolute",
          inset: size * 0.18,
          borderRadius: "50%",
          border: "1px dashed rgba(255, 255, 255, 0.15)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: size * 0.36,
          borderRadius: "50%",
          border: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      />
      {/* Crosshairs */}
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255, 255, 255, 0.1)" }} />

      {/* Rotating Radar Sweep Beam */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          transform: `rotate(${sweepAngle}deg)`,
          background: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, ${accent}55 360deg)`,
        }}
      />

      {/* Live Detection Blips */}
      <div
        style={{
          position: "absolute",
          top: "32%",
          left: "64%",
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: accent,
          boxShadow: `0 0 8px ${accent}`,
          opacity: (Math.sin(frame * 0.15) + 1) / 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "68%",
          left: "38%",
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: appleTheme.neonBlue,
          boxShadow: `0 0 8px ${appleTheme.neonBlue}`,
          opacity: (Math.cos(frame * 0.18) + 1) / 2,
        }}
      />
    </div>
  );
};

// Backward-compatible alias
export const ApplePillButton: React.FC<{
  label: string;
  variant?: "primary" | "secondary" | "onDark";
  style?: React.CSSProperties;
}> = ({ label, variant = "primary", style }) => {
  const accent = variant === "primary" ? appleTheme.neonMint : appleTheme.primaryOnDark;
  return <AppleSpecPill label={label} accent={accent} style={style} />;
};
