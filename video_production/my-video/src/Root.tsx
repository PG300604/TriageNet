import React from "react";
import { Composition, Folder } from "remotion";
import { calculateMetadata } from "./calculate-metadata/calculate-metadata";
import { schema } from "./calculate-metadata/schema";
import { Main } from "./Main";
import { KEYNOTE_1M53S_FRAMES_60FPS, PromoVideo } from "./PromoVideo";
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

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Master 1:53 Apple Keynote Presentation (1080p @ 60 FPS = 6,780 frames) */}
      <Composition
        id="TriageNetAppleKeynote"
        component={PromoVideo}
        durationInFrames={KEYNOTE_1M53S_FRAMES_60FPS}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 4K 60FPS Composition Variant */}
      <Composition
        id="TriageNetAppleKeynote4K"
        component={PromoVideo}
        durationInFrames={KEYNOTE_1M53S_FRAMES_60FPS}
        fps={60}
        width={3840}
        height={2160}
      />

      {/* 11 Chapters for Studio Scrubbing and Frame-by-Frame Verification */}
      <Folder name="Keynote-Chapters">
        <Composition
          id="Ch01-GoldenHourCrisis"
          component={Scene1Vision}
          durationInFrames={660}
          fps={60}
          width={1920}
          height={1080}
        />
        <Composition
          id="Ch02-IntroducingTriageNet"
          component={Scene2Reveal}
          durationInFrames={540}
          fps={60}
          width={1920}
          height={1080}
        />
        <Composition
          id="Ch03-DevOpsTechArchitecture"
          component={SceneTechArchitecture}
          durationInFrames={720}
          fps={60}
          width={1920}
          height={1080}
        />
        <Composition
          id="Ch04-MlAcuityBenchmarks"
          component={SceneMlBenchmarks}
          durationInFrames={660}
          fps={60}
          width={1920}
          height={1080}
        />
        <Composition
          id="Ch05-DfdDataFlowDiagram"
          component={SceneDfdFlow}
          durationInFrames={540}
          fps={60}
          width={1920}
          height={1080}
        />
        <Composition
          id="Ch06-108FieldTelemetry"
          component={Scene3Telemetry}
          durationInFrames={720}
          fps={60}
          width={1920}
          height={1080}
        />
        <Composition
          id="Ch07-HospitalBipartiteDispatch"
          component={Scene4Dispatch}
          durationInFrames={660}
          fps={60}
          width={1920}
          height={1080}
        />
        <Composition
          id="Ch08-CorridorGreenWaveNavigation"
          component={Scene5CorridorMap}
          durationInFrames={720}
          fps={60}
          width={1920}
          height={1080}
        />
        <Composition
          id="Ch09-SpecialistDoorToOrReception"
          component={Scene6Specialist}
          durationInFrames={660}
          fps={60}
          width={1920}
          height={1080}
        />
        <Composition
          id="Ch10-StatewideGovernanceLiquidity"
          component={Scene7Governance}
          durationInFrames={600}
          fps={60}
          width={1920}
          height={1080}
        />
        <Composition
          id="Ch11-KeynoteFinale39M"
          component={Scene8Finale}
          durationInFrames={540}
          fps={60}
          width={1920}
          height={1080}
        />
      </Folder>

      {/* Code Transition Main Composition */}
      <Composition
        id="Main"
        component={Main}
        defaultProps={{
          steps: null,
          themeColors: null,
          theme: "github-dark" as const,
          codeWidth: null,
          width: {
            type: "auto",
          },
        }}
        fps={30}
        height={1080}
        calculateMetadata={calculateMetadata}
        schema={schema}
      />
    </>
  );
};
