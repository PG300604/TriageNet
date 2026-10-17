# 🎬 TriageNet — DaVinci Resolve Master Production Timeline & Explainer Script
**Target Duration:** 01:52.62 (112.6 seconds) · **Frame Rate:** 60.00 FPS · **Resolution:** 3840×2160 (4K UHD) or 1920×1080 (FHD)  
**Soundtrack:** *"Rise Up"* by Aylex (`p:\TriageNet\video_production\audio\Rise_Up.wav`)  
**Project Directory:** `p:\TriageNet\video_production\`

---

## 1. DaVinci Resolve Track Architecture (Layering Guide)

| Track | Type | Purpose | Blend Mode / Effect |
| :--- | :--- | :--- | :--- |
| **V4** | Title / Text+ | **Kinetic Typography & Lower-Third Tech Badges** | Normal, Drop Shadow, Amber/Neon Glow |
| **V3** | Video / Graphic | **HUD Overlays, Animated Reticles & Callouts** (`motion_04_hud_telemetry_overlay.mp4`) | Screen / Add (Transparent Alpha) |
| **V2** | Video | **Motion Graphics Explainer Clips** (`motion_01` – `motion_05`) | Normal |
| **V1** | Video | **Curated Screen Snippets** (`clip_01` – `clip_14` Web & Mobile) | Normal (Subtle 1.05x Slow Push-in) |
| **A1** | Stereo Audio | **Master Music Soundtrack** (`Rise_Up.wav`) | Master Music Track (-2.0 dB Peak) |
| **A2** | Stereo Audio | **SFX / Risers / Whooshes / Hospital Sirens** | Accent Audio (-8.0 dB) |

---

## 2. Second-by-Second Master Storyboard & Edit Decision List

```
[00:00 - 00:12] ACT I: THE GOLDEN HOUR CRISIS (Atmospheric Ambient Intro)
---------------------------------------------------------------------------------------
00:00 - 00:04 | V2: motion_01_intro_hook.mp4 [00:00 - 00:04]
              | Caption: "IN ACUTE TRAUMA, 60 MINUTES DECIDES LIFE OR DEATH."
              | Visual: Deep charcoal space, pulsing orange ECG heartbeat line.
              | Audio: Ambient synth pad building up in "Rise Up".

00:04 - 00:07 | V2: motion_01_intro_hook.mp4 [00:04 - 00:07]
              | Caption: "79 HOSPITALS ACROSS 24 DISTRICTS · OPERATING IN SILOED ISOLATION"
              | Visual: Neon warning red flash, fragmented connection nodes.

00:07 - 00:12 | V2: motion_01_intro_hook.mp4 [00:07 - 00:12]
              | V4: "TRIAGENET" Grand Title Reveal + "Autonomous Golden-Hour Clinical OS"
              | Visual: Glowing amber aura burst, state crest badge reveal.
              | Beat Cue: Percussion begins ticking; snare roll approaching the drop!

[00:12 - 00:32] ACT II: DISTRIBUTED ARCHITECTURE & TECH STACK (THE BEAT DROP!)
---------------------------------------------------------------------------------------
00:12 - 00:18 | V2: motion_02_system_architecture.mp4 [00:00 - 00:06]
              | V4: "DUAL-BUS REACTIVE PIPELINE · SUB-50MS STATE SYNCHRONIZATION"
              | Visual: Android 108 App <-> Spring Boot 3 Engine <-> Next.js 15 Console.
              | Audio: 💥 THE MAIN DRUM DROP HITS (00:12.5s)! Maximum kinetic energy!

00:18 - 00:24 | V2: motion_02_system_architecture.mp4 [00:06 - 00:12]
              | V4: Tech Badges: Redis Pub/Sub · PostgreSQL + PostGIS · Docker
              | Visual: Glowing animated data packets stream across reactive buses.

00:24 - 00:32 | V1: clip_01_web_analytics_gauge.mp4 [00:00 - 00:08]
              | V3: motion_04_hud_telemetry_overlay.mp4 [00:00 - 00:08] (Screen Blend)
              | Caption: "STATEWIDE SINGLE PANE OF GLASS · 2,027 BEDS MONITORED LIVE"
              | Transition: Fast Zoom Punch-in on Beat 00:24s.

[00:32 - 00:56] ACT III: 4 HAND-IMPLEMENTED ALGORITHMS (DRIVING BEAT)
---------------------------------------------------------------------------------------
00:32 - 00:38 | V2: motion_03_algorithmic_core.mp4 [00:00 - 00:06]
              | V4: "ALGO 1: SeverityScorer · Sigmoid Acuity Logistic Regression"
              | Visual: P(S) = 1 / (1 + exp(-z)), animated S-curve graph.
              | Cut into ->
              | V1: clip_02_web_acuity_sliders.mp4 [00:00 - 00:06]
              | Caption: "Real-time SpO2, GCS, MAP, and Shock Index Recalculation"

00:38 - 00:44 | V2: motion_03_algorithmic_core.mp4 [00:06 - 00:11]
              | V4: "ALGO 2: HungarianMatcher · Optimal Bipartite Assignment in O(V^3)"
              | Visual: Bipartite graph K_M,N pairing patients to on-duty trauma surgeons.
              | Cut into ->
              | V1: clip_03_web_triage_heap.mp4 [00:00 - 00:06]
              | Caption: "Triage Priority Max-Heap Queue with Emergency Preemption"

00:44 - 00:50 | V2: motion_03_algorithmic_core.mp4 [00:11 - 00:16]
              | V4: "ALGO 3: DijkstraRouter · Highway Congestion Penalty & Green Wave"
              | Visual: Dynamic road graph (V+E)log V minimizing highway transit delays.
              | Cut into ->
              | V1: clip_04_web_gis_highway_siren.mp4 [00:00 - 00:06]
              | Caption: "NH-33 Highway Corridor Telemetry & Signal Preemption"

00:50 - 00:56 | V1: clip_05_web_doctor_paging.mp4 [00:00 - 00:06]
              | V4: "ALGO 4: TriageQueueService · Sub-Millisecond Bed Allocation"
              | Caption: "Verified Specialist Doctor Roster & Direct Trauma Paging"

[00:56 - 01:20] ACT IV: MOBILE 108 AMBULANCE FLEET & CLINICAL SURGE (CLIMAX)
---------------------------------------------------------------------------------------
00:56 - 01:02 | V1: clip_09_mobile_paramedic_gps.mp4 [00:00 - 00:06]
              | V3: motion_04_hud_telemetry_overlay.mp4 [00:00 - 00:06]
              | Caption: "ANDROID COMPANION: 108 ALS UNIT 1081 EN-ROUTE ON NH-33"
              | Visual: Live GPS ticking, real-time speed 76 km/h, ETA countdown.

01:02 - 01:08 | V1: clip_10_mobile_prealert_voucher.mp4 [00:00 - 00:06]
              | Caption: "DIGITAL TRAUMA VOUCHER · PRE-ALERT DISPATCHED (ETA: 19:40)"
              | Visual: Surgical handover checklist: C-Spine, 16G IV lines, 15 L/min O2.

01:08 - 01:14 | V1: clip_11_mobile_green_wave_active.mp4 [00:00 - 00:06]
              | Caption: "⚡ 108 GREEN WAVE ACTIVE ON HIGHWAY (ALL SIGNALS GREEN)"
              | Visual: Flashing green pulse banner, traffic signals synchronized.

01:14 - 01:20 | V1: clip_12_mobile_triage_nurse_intake.mp4 [00:02 - 00:08]
              | Cut into ->
              | V1: clip_13_mobile_superintendent_reconcile.mp4 [00:00 - 00:06]
              | Caption: "NURSE ED RAPID INTAKE & NIC E-HOSPITAL 100% CLAIM RECONCILIATION"

[01:20 - 01:38] ACT V: AI CDS GOVERNANCE & REVENUE RECOVERY
---------------------------------------------------------------------------------------
01:20 - 01:26 | V1: clip_06_web_ai_cds_sigmoid.mp4 [00:00 - 00:06]
              | Caption: "AI CLINICAL DECISION SUPPORT · LOGISTIC REGRESSION AUDIT"
              | Visual: Diagnostic differential engine & clinical compatibility audit.

01:26 - 01:32 | V1: clip_07_web_contingency_grant.mp4 [00:00 - 00:06]
              | Caption: "STATE HEALTH DIRECTORATE · ₹6.40 CR EMERGENCY CONTINGENCY"
              | Visual: Requisition authorization review modal, ₹1.50 Cr grant disbursed.

01:32 - 01:38 | V1: clip_08_web_staff_verification.mp4 [00:00 - 00:06]
              | Caption: "DUAL-CONTROL CLINICIAN VERIFICATION & AUTHORIZATION QUEUE"

[01:38 - 01:52.6] ACT VI: MEASURABLE IMPACT & GRAND FINALE
---------------------------------------------------------------------------------------
01:38 - 01:46 | V2: motion_05_statewide_impact_outro.mp4 [00:00 - 00:08]
              | V4: "18.4 MIN LATENCY REDUCED · 99.4% MATCH ACCURACY · 79 FACILITIES"
              | Visual: Big glowing numeric stat cards, emerald/cyan accents.

01:46 - 01:52.6| V2: motion_05_statewide_impact_outro.mp4 [00:08 - 00:14]
              | V4: "TRIAGENET — THE FUTURE OF EMERGENCY CARE IS HERE"
              | Subtitle: "Zero Black-Box Dependencies · Built for Jharkhand State"
              | Audio: Music reverb tail fades out cleanly to 01:52.62.
```

---

## 3. DaVinci Resolve Quick Setup Steps
1. **Open DaVinci Resolve** $\rightarrow$ Create a new project: `TriageNet_Explainer_Video`.
2. **Project Settings**: Set Timeline resolution to `1920x1080` or `3840x2160`, Frame rate to `60.00 fps`.
3. **Import Media**:
   - Drag `p:\TriageNet\video_production\audio\Rise_Up.wav` into **Audio Track 1**.
   - Drag `p:\TriageNet\video_production\motion_clips\*.mp4` into the Media Pool.
   - Drag `p:\TriageNet\video_production\screen_snippets\*.mp4` into the Media Pool.
   - Drag `p:\TriageNet\video_production\assets\svgs\*.svg` into the Media Pool.
4. **Import Markers (1-Click)**:
   - In DaVinci Resolve: **`Edit Page`** $\rightarrow$ Right-click Timeline $\rightarrow$ **`Timelines`** $\rightarrow$ **`Import`** $\rightarrow$ **`Timeline Markers from EDL/CSV`** $\rightarrow$ Select `p:\TriageNet\video_production\davinci_resolve\triagenet_timeline_markers.csv`.
   - *Instantly, all 18 colored beat markers and chapter labels will appear across your timeline!*
5. **Color Grading & Fusion**:
   - Apply a clean Rec.709 LUT or increase contrast (+15) and saturation (+10).
   - Set Track V3 (`motion_04_hud_telemetry_overlay.mp4`) composite mode to **`Screen`** or **`Add`**.
