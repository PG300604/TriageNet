import React from "react";
import { Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { AppleCaptions } from "./components/AppleCaptions";
import { Scene1Vision } from "./scenes/Scene1Vision";
import { Scene2Reveal } from "./scenes/Scene2Reveal";
import { SceneTechArchitecture } from "./scenes/SceneTechArchitecture";
import { SceneMlBenchmarks } from "./scenes/SceneMlBenchmarks";
import { SceneDfdFlow } from "./scenes/SceneDfdFlow";
import { Scene3Telemetry } from "./scenes/Scene3Telemetry";
import { Scene4Dispatch } from "./scenes/Scene4Dispatch";
import { Scene5CorridorMap } from "./scenes/Scene5CorridorMap";
import { Scene6Specialist } from "./scenes/Scene6Specialist";
import { Scene7Governance } from "./scenes/Scene7Governance";
import { Scene8Finale } from "./scenes/Scene8Finale";

// Exactly 1:53 = 113.0 seconds = 6,780 frames @ 60fps
export const KEYNOTE_1M53S_FRAMES_60FPS = 6780;

export const PromoVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Background music volume automation (ducked to ~18% during voiceover speech)
  const musicVolume = interpolate(
    frame,
    [0, 60, 180, KEYNOTE_1M53S_FRAMES_60FPS - 120, KEYNOTE_1M53S_FRAMES_60FPS],
    [0, 0.40, 0.18, 0.18, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "#000000",
        overflow: "hidden",
      }}
    >
      {/* Background Sound Track (Rise Up) */}
      <Audio
        src={staticFile("audio/Rise_Up.mp3")}
        volume={musicVolume}
      />

      {/* Synchronized Master Voiceover (113s) */}
      <Audio
        src={staticFile("audio/voiceover.mp3")}
        volume={1.0}
      />

      {/* 11-Act Continuous Keynote Presentation with Dynamic Slide & Fade Transitions */}
      {/* 10 transitions @ 24 frames = 240 overlap frames. Sum = 7020 - 240 = 6780 frames (1:53 @ 60fps) */}
      <TransitionSeries>
        {/* Act 1: The Golden Hour Crisis (0s - 10.6s) [Parchment Tile] */}
        <TransitionSeries.Sequence durationInFrames={660}>
          <Scene1Vision />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 16 }, durationInFrames: 24 })}
        />

        {/* Act 2: Introducing TriageNet (10.6s - 19.2s) [Pure Black Tile] */}
        <TransitionSeries.Sequence durationInFrames={540}>
          <Scene2Reveal />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 24 })}
        />

        {/* Act 3: Distributed DevOps Architecture & Multi-Tier Stack (19.2s - 30.8s) [Near-Black Tile 1] */}
        <TransitionSeries.Sequence durationInFrames={720}>
          <SceneTechArchitecture />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 16 }, durationInFrames: 24 })}
        />

        {/* Act 4: Predictive Machine Learning & Acuity Benchmarks (30.8s - 41.4s) [Near-Black Tile 2] */}
        <TransitionSeries.Sequence durationInFrames={660}>
          <SceneMlBenchmarks />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 16 }, durationInFrames: 24 })}
        />

        {/* Act 5: Level 1 Data Flow Diagram (DFD) Vector Engine (41.4s - 50.0s) [Near-Black Tile 1] */}
        <TransitionSeries.Sequence durationInFrames={540}>
          <SceneDfdFlow />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 24 })}
        />

        {/* Act 6: 108 Ambulance Field Telemetry & Digital Voucher (50.0s - 61.6s) [Pure White Tile] */}
        <TransitionSeries.Sequence durationInFrames={720}>
          <Scene3Telemetry />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 16 }, durationInFrames: 24 })}
        />

        {/* Act 7: Intelligent Hospital Assignment & Max-Heap Queue (61.6s - 72.2s) [Near-Black Tile 1] */}
        <TransitionSeries.Sequence durationInFrames={660}>
          <Scene4Dispatch />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 16 }, durationInFrames: 24 })}
        />

        {/* Act 8: Highway Corridor Navigation & Green Wave Map (72.2s - 83.8s) [Near-Black Tile 2] */}
        <TransitionSeries.Sequence durationInFrames={720}>
          <Scene5CorridorMap />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 16 }, durationInFrames: 24 })}
        />

        {/* Act 9: Zero-Minute Door-to-OR ED Specialist Reception (83.8s - 94.4s) [Parchment Tile] */}
        <TransitionSeries.Sequence durationInFrames={660}>
          <Scene6Specialist />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 16 }, durationInFrames: 24 })}
        />

        {/* Act 10: Statewide Governance, Liquidity & Ayushman Sync (94.4s - 104.0s) [Near-Black Tile 1] */}
        <TransitionSeries.Sequence durationInFrames={600}>
          <Scene7Governance />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 24 })}
        />

        {/* Act 11: Keynote Finale & Built for 39M Citizens (104.0s - 113.0s) [Pure Black Tile] */}
        <TransitionSeries.Sequence durationInFrames={540}>
          <Scene8Finale />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Word-by-Word Animated Subtitles Overlay */}
      <AppleCaptions />
    </div>
  );
};
