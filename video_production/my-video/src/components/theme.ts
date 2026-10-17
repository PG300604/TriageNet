import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadRobotoMono } from "@remotion/google-fonts/RobotoMono";

export const interFont = loadInter("normal", {
  subsets: ["latin"],
  weights: ["400", "500", "600", "700", "800", "900"],
});

export const monoFont = loadRobotoMono("normal", {
  subsets: ["latin"],
  weights: ["400", "500", "700"],
});

export const appleTheme = {
  // Brand & Accent Colors
  primary: "#0066cc",          // Action Blue - universal interactive CTA
  primaryFocus: "#0071e3",     // Focus Blue
  primaryOnDark: "#2997ff",    // Sky Link Blue on dark surfaces
  
  // Apple Surface Hierarchy
  canvas: "#ffffff",           // Pure White
  canvasParchment: "#f5f5f7",  // Signature Apple Parchment off-white
  surfacePearl: "#fafafc",     // Pearl surface fill
  tileDark1: "#1d1d1f",        // Near-Black Tile 1
  tileDark2: "#242426",        // Near-Black Tile 2
  tileDark3: "#18181a",        // Near-Black Tile 3
  surfaceBlack: "#0d0d0f",     // Pure Black
  surfaceChip: "rgba(210, 210, 215, 0.64)", // Translucent gray chip

  // Text Tokens
  ink: "#1d1d1f",              // Near-Black Ink for light surfaces
  body: "#1d1d1f",             // Default body copy
  bodyOnDark: "#ffffff",       // Text on dark surfaces
  bodyMuted: "#a1a1a6",        // Secondary text on dark surfaces
  inkMuted80: "#3a3a3c",       // Muted text on pearl
  inkMuted48: "#86868b",       // Disabled / fine-print

  // Hairlines & Borders
  dividerSoft: "rgba(0, 0, 0, 0.06)",
  hairline: "#e5e5ea",
  hairlineDark: "rgba(255, 255, 255, 0.14)",

  // Apple Keynote Neon Accents
  neonBlue: "#2997ff",
  neonMint: "#30d158",
  neonRed: "#ff453a",
  neonAmber: "#ffd60a",

  // Drop Shadow - The single Apple product shadow
  productShadow: "rgba(0, 0, 0, 0.18) 0px 20px 40px -10px",
  productShadowDark: "rgba(0, 0, 0, 0.70) 0px 30px 60px -15px",

  // Typography Settings - Ultra-crisp geometric display font
  fontFamily: `"${interFont.fontFamily}", -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro", "Helvetica Neue", sans-serif`,
  monoFamily: `"${monoFont.fontFamily}", SFMono-Regular, Menlo, Monaco, Consolas, monospace`,

  // Apple Liquid Glass / VisionOS Frosted Glassmorphism
  appleGlassDark: {
    backgroundColor: "rgba(28, 28, 30, 0.78)",
    backdropFilter: "blur(40px) saturate(210%)",
    WebkitBackdropFilter: "blur(40px) saturate(210%)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.22), 0 25px 50px -12px rgba(0, 0, 0, 0.75)",
    borderRadius: 22,
  },
  appleGlassLight: {
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    backdropFilter: "blur(40px) saturate(210%)",
    WebkitBackdropFilter: "blur(40px) saturate(210%)",
    border: "1px solid rgba(255, 255, 255, 0.7)",
    boxShadow: "inset 0 1px 1px 0 #ffffff, 0 20px 40px -10px rgba(0, 0, 0, 0.08)",
    borderRadius: 22,
  },
  appleGlassAccent: {
    backgroundColor: "rgba(41, 151, 255, 0.12)",
    backdropFilter: "blur(40px) saturate(210%)",
    WebkitBackdropFilter: "blur(40px) saturate(210%)",
    border: "1px solid rgba(41, 151, 255, 0.35)",
    boxShadow: "inset 0 1px 1px 0 rgba(41, 151, 255, 0.3), 0 20px 40px -10px rgba(0, 102, 204, 0.25)",
    borderRadius: 22,
  },

  // Compatibility aliases
  cyan: "#2997ff",
  emerald: "#30d158",
  crimson: "#ff453a",
  amber: "#ffd60a",
  white: "#ffffff",
  slate100: "#f5f5f7",
  slate300: "#a1a1a6",
  slate400: "#86868b",
  bgGradient: "#18181a",
  cardBorder: "rgba(255, 255, 255, 0.14)",
};

export const theme = appleTheme;
