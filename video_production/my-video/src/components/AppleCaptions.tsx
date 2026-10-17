import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import captionsData from "../captions.json";
import { appleTheme } from "./theme";

interface WordTiming {
  word: string;
  startMs: number;
  endMs: number;
}

interface SentenceCue {
  text: string;
  startMs: number;
  endMs: number;
  words: WordTiming[];
}

const captions: SentenceCue[] = captionsData;

export const AppleCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentMs = (frame / fps) * 1000;

  // Find active sentence
  const activeSentence = captions.find(
    (c) => currentMs >= c.startMs - 200 && currentMs <= c.endMs + 300
  );

  if (!activeSentence) {
    return null;
  }

  // Fade in / out
  const fadeIn = interpolate(
    currentMs,
    [activeSentence.startMs - 200, activeSentence.startMs],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const fadeOut = interpolate(
    currentMs,
    [activeSentence.endMs, activeSentence.endMs + 300],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 100,
        pointerEvents: "none",
        opacity,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(14, 14, 16, 0.94)",
          backdropFilter: "blur(30px) saturate(200%)",
          WebkitBackdropFilter: "blur(30px) saturate(200%)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          borderRadius: 9999,
          padding: "10px 32px",
          display: "inline-flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          maxWidth: 1200,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
          willChange: "opacity",
        }}
      >
        {activeSentence.words.map((w, idx) => {
          const isSpoken = currentMs >= w.startMs;
          const isCurrent = currentMs >= w.startMs && currentMs <= w.endMs;

          let color = "#a6a6b0"; // upcoming word
          let fontWeight = 500;
          let textShadow = "none";

          if (isCurrent) {
            color = appleTheme.primaryOnDark; // bright Sky Blue
            fontWeight = 700;
            textShadow = "0 0 16px rgba(41, 151, 255, 0.85)";
          } else if (isSpoken) {
            color = "#ffffff"; // pure white
            fontWeight = 600;
          }

          return (
            <span
              key={idx}
              style={{
                fontFamily: appleTheme.fontFamily,
                fontSize: 22,
                fontWeight,
                letterSpacing: -0.28,
                color,
                textShadow,
                display: "inline-block",
                WebkitFontSmoothing: "antialiased",
                textRendering: "geometricPrecision",
                transition: "color 0.1s ease, text-shadow 0.1s ease",
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
