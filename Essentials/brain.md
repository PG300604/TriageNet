# brain.md — Standing Context & Architecture Memory for Antigravity

This file serves as the standing, persistent context for the AI coding agent (**Google Antigravity / Gemini**) working on **TriageNet**. Read this before any coding or architecture session. It must remain synchronized with the codebase to eliminate hallucinations.

---

## 1. Project Identity & Author

- **Author**: Priyanshu Ghosh — final year B.Tech Computer Science & Business Systems (CSBS) student at Asansol Engineering College (2027 batch). Full-Stack Java Developer (Spring Boot, React/Next.js, PostgreSQL, Docker). GitHub: [PG300604](https://github.com/PG300604).
- **Project Goal**: **TriageNet** is a state-wide intelligent healthcare resource allocation and spatial overflow routing system for Jharkhand, India. It demonstrates algorithmic depth — priority scheduling with wait-time decay, bipartite matching (Hungarian algorithm), spatial graph shortest-path routing (Dijkstra algorithm), and offline multi-dataset ML triage scoring.

---

## 2. Core Source-of-Truth Documents

- [`PRD.md`](file:///p:/TriageNet/Essentials/PRD.md) — Product requirements, state-wide 24-district scope, 6-role RBAC, and feature specifications.
- [`TRD.md`](file:///p:/TriageNet/Essentials/TRD.md) — Technical requirements, Spring Boot + Next.js architecture, API contracts, algorithmic formulas, and data models.
- [`ERD.md`](file:///p:/TriageNet/Essentials/ERD.md) — Database schema, JPA entity definitions, foreign keys, and indexes (`DISTRICT`, `HOSPITAL`, `PATIENT`, `SEVERITY_SCORE`, `TRIAGE_QUEUE_ENTRY`, `RESOURCE`, `ALLOCATION_RECORD`, `HOSPITAL_EDGE`, `TRANSFER_REQUEST`, `STAFF_USER`, `ROLE`).
- [`instructions.md`](file:///p:/TriageNet/Essentials/instructions.md) — Operational guidelines, coding standards, and verification steps for Antigravity.
- [`DECISIONS.md`](../.agents/sync/DECISIONS.md) — Architectural decision log (Jharkhand dataset selection, Render/Vercel deployment, self-hosted OpenRouteService, 4-dataset ML benchmark).
- [`DEVOPS_LOG.md`](../.agents/sync/DEVOPS_LOG.md) — Single source of truth for all DevOps actions, Docker configurations, infrastructure setups, and cross-platform synchronization between Linux and Windows agents.
- [`HANDOFF.md`](../.agents/sync/HANDOFF.md) — Active cross-platform task assignment and handoff coordination sheet.

---

## 3. Key Operational Systems & Real Data Integration

### A. Authentic Jharkhand Healthcare Infrastructure (111 Facilities across 24 Districts)
- **Real-World Scraped Dataset**: TriageNet uses 100% authentic public health infrastructure data from Jharkhand, India across 3 tiers:
  - **Tier 1 — Tertiary Medical Colleges**: RIMS Ranchi, MGM Medical College Jamshedpur, SNMMCH Dhanbad, Phulo Jhano Medical College Dumka, Medinirai Medical College Palamu, Sheikh Bhikhari Medical College Hazaribagh.
  - **Tier 2 — District Hospitals**: 24 District Hospitals (DH Ranchi, DH Hazaribagh, DH Bokaro, DH Giridih, DH Chaibasa, DH Dhanbad, etc.).
  - **Tier 3 — Community Health Centres (CHCs)**: 80+ CHC block-level facilities across Jharkhand (CHC Kanke, CHC Ormanjhi, CHC Namkum, etc.).
- Data generation/scraping pipeline: [`scrape_jharkhand_hospitals.py`](file:///p:/TriageNet/scripts/scrape_jharkhand_hospitals.py) + [`build_real_jharkhand_dataset.js`](file:///p:/TriageNet/scripts/build_real_jharkhand_dataset.js). Seeded into Spring Boot via [`HospitalSeedService.java`](file:///p:/TriageNet/backend/src/main/java/com/triagenet/service/HospitalSeedService.java).

### B. Spatial Routing Engine & Interactive Leaflet Maps
- Real-world geospatial coordinate mapping for all 111 facilities.
- Distance & travel time matrix generated via self-hosted **OpenRouteService (ORS)** over Geofabrik Jharkhand OpenStreetMap data.
- **Dijkstra Topology Graph View** ([`regional-network-view.tsx`](file:///p:/TriageNet/frontend/components/triagenet/regional-network-view.tsx)) featuring spaced layout, bed occupancy pills, highway travel time tags, and pre-booking transfer controls.

### C. 6-Role Role-Based Access Control (RBAC) System
1. `SUPER_ADMIN` — Global state configuration, system seed controls, and master data management.
2. `STATE_HEALTH_DEPT` — State Health Department Director; state-wide read-only command telemetry across all 24 districts.
3. `DISTRICT_CMO` — District Chief Medical Officer (e.g. Ranchi); scope-locked to district emergency health management.
4. `HOSPITAL_ADMIN` — Medical Superintendent (e.g. RIMS Ranchi); manages hospital resource capacity and bed allocations.
5. `TRIAGE_NURSE` — Emergency Triage Nurse; handles rapid ED intake & ML vital sign scoring.
6. `AMBULANCE_DISPATCH` — 108 Ambulance Dispatch Controller; tactical referral, multi-criteria hospital matching, bed pre-booking, and in-flight fleet telemetry tracking.

### D. Multi-Dataset ML Severity Scoring Engine
- Trained offline across 4 public emergency/triage datasets (ESI, KTAS, MIMIC-IV ED, SIRS/Lactate) achieving **98.88% emergency recall**.
- Production model: Logistic Regression with explainable vital sign weights (Heart Rate, Systolic BP, SpO2, Temp, Glasgow Coma Scale, Respiratory Rate, Age, Comorbidities).
- Implemented in backend ([`SeverityScorer.java`](file:///p:/TriageNet/backend/src/main/java/com/triagenet/engine/SeverityScorer.java)) and frontend ([`ml-severity-scorer.ts`](file:///p:/TriageNet/frontend/lib/ml-severity-scorer.ts)).

### E. Panacea Healthcare SaaS Design System & Enterprise SEO Architecture
- Visual design language: `Walnut Shadow` palette, `#491205` brand accent, official TriageNet logo and favicons, crisp cards, zero generic emojis.
- Full Enterprise SEO architecture: Schema.org JSON-LD structured data (`GovernmentOrganization`, `WebApplication`, `GovernmentService`, `SoftwareApplication`), multi-lingual emergency contact schemas (`Hindi, English, Santhali, Ho, Mundari`), OpenGraph/Twitter Cards, Next.js HTTP security headers (`nosniff`, `SAMEORIGIN`, `strict-origin-when-cross-origin`), CartoCDN tile prefetching, and PWA capabilities.

### F. Phase 10 — Product Launch Showcase & Motion Graphic Media Architecture (Final Phase)
- **Design Philosophy**: Zero-voiceover, high-velocity "Silent Tech Keynote" style driven by electronic synth soundtrack, UI sound design, kinetic typography, and programmatic motion graphics.
- **Approved 100% Free / Zero-Watermark Toolchain**:
  - **Screen Recording**: OBS Studio (1080p 60fps lossless) + ShareX.
  - **Algorithm Motion Graphics**: Motion Canvas (TypeScript vector animation for 24-district Dijkstra graph & Hungarian bed allocation).
  - **Telemetry Overlays**: Remotion (React/TypeScript component animation for metric counters and live vitals).
  - **Master Assembly**: DaVinci Resolve Free (4K 60fps timeline, Text+ with motion blur, no watermarks, audio mixing).
- **Explicit Non-Adoption**: Commercial watermark tools (e.g. Rotato free tier) are excluded to preserve production polish.

### G. AI Automated Accident Hotspot & Dynamic Casualty Router Telemetry
- **5 Authentic Jharkhand Highway Blackspots**: Ormanjhi NH-33 Toll Plaza (TBI/Neurosurgeon), Jharia Colliery Belt (CO Gas/Pulmonologist), Barhi GT Road Junction (Flail Chest/Trauma Surgeon), Bundu Valley Ghats (Spine Fracture/Ortho), Adityapur Industrial Complex (45% Burns/Plastic Surgeon).
- **Multi-Criteria Doctor & Hospital Matching**: Evaluates on-duty doctor presence (`READY_TRAUMA_BAY`, `OCCUPIED_IN_OT`, `NOT_AVAILABLE`), ICU capacity, and real-time highway congestion delays.
- **Tiered Triage Options**:
  - **1st Best (Recommended Apex Facility)**: Definitive tertiary care with on-duty specialist present & ready in trauma bay.
  - **2nd Best (Immediate Stabilization Fallback)**: Closer intermediate facility for airway, IV resuscitation, or chest tube decompression if patient decompensates in transit.
  - **3rd Best (Alternative Apex Backup)**: Tertiary standby facility with contingency ICU capacity.
- **Highway Traffic & 108 Green Wave Preemption**: Real highway traffic congestion delay modeling with dynamic 3D ambulance movement speeds (74 km/h under Green Wave preemption vs 24 km/h under Heavy gridlock).

### H. 108 Ambulance EMT In-Transit Mobile Companion App (`/ambulance`)
- Dedicated, mobile-optimized live telemetry terminal for 108 EMT Paramedics.
- Live onboard patient vital sign entry (GCS slider, SpO2 %, Systolic BP, Heart Rate) and injury mechanism classification.
- Real-time cross-tab/cross-device synchronization via `directorBridge` (BroadcastChannel API): vitals entered on a smartphone or tablet immediately reflect on the State Command Dashboard (`/dashboard`) and Director's Control (`/control`) in real-time.
- One-touch 108 Green Wave Signal Preemption and Trauma Bay pre-alerting.

### I. 3D Isometric Ambulance Van Model, Swiggy-Style Road Pathing & SVG Topology Flow
- **3D Isometric Emergency Van Vehicle**: Custom 28x54px aerodynamic ambulance van SVG (`leaflet-map.tsx`) with retroreflective Battenburg yellow/green check livery, dual alternating red/blue LED strobe lightbars with pulsing radiant halos, forward-facing headlight cones shining on the road surface, medical cross `+`, 108 ALS badging, and realistic asphalt drop shadow.
- **Swiggy / Domino's Road-Snapped Dynamic Pathing**: Vehicles follow authentic GPS highway coordinates (NH-33, GT Road, NH-20, Subarnarekha Expressway). Path dynamically splits into a dimmed gray dashed traveled trail behind the vehicle and an animated emergency traffic-colored corridor ahead with flowing directional chevrons.
- **Hardware-Accelerated SVG Dijkstra Patient Flow**: Topology graph uses SVG `<animateMotion>` to stream continuous glowing patient flow waves and transfer particles between hospital nodes along active transfers and shortest-path corridors.
- **Multi-Corridor Bypass Selection & AI Specialist Traffic Diversion**:
  - Multi-corridor selection between Primary Highway and Express Ring Road Bypass with live distance/delay delta.
  - Automatic Dynamic Specialist Diversion: If the primary route suffers >=10 min congestion, re-routes to the fastest alternative tertiary hospital with verified ready surgical specialists, saving critical minutes.

---

## 4. Non-Negotiable Core Engineering Principles

1. **Core Algorithms Must Be Real & Hand-Implemented**:
   - `SeverityScorer.java` — Logistic Regression vital sign scoring.
   - `TriageQueueService.java` — Priority queue with time-decay reordering (`effectivePriority = baseSeverity + λ * waitTimeMinutes`).
   - `HungarianMatcher.java` — $O(n^3)$ Kuhn-Munkres bipartite matching for optimal patient-resource allocation.
   - `DijkstraRouter.java` — Shortest path spatial graph routing over Jharkhand road network graph.
2. **Explainability**: Every score, queue re-ranking, resource assignment, and spatial routing decision must return a clear, human-readable breakdown of contributing factors.
3. **RBAC Scope Locking**: Ensure role boundaries are enforced strictly across both UI navigation and backend API endpoints with method-level `@PreAuthorize`.
4. **Deployability & Parity**: Maintain Docker container parity (non-root `1001:1001`) for Spring Boot 3.3.13 backend and Next.js 16.4.1 frontend deployment with Redis 7-alpine and Nginx reverse proxy.
5. **Continuous Integration & Testing Gates**: Enforce 100% passing automated test and security gates in GitHub Actions (`.github/workflows/ci.yml`) covering backend tests (86/86 passing), frontend Turbopack build (20/20 routes), and Trivy offline security scanning.

---

## 5. Technology Stack & Directory Structure

```
TriageNet/
├── Essentials/               # Source-of-truth project documentation (PRD, TRD, ERD, brain, instructions)
├── .agents/                  # Internal agent rules, workflows, and cross-platform sync
│   ├── rules/                # devops-log-synchronization, phase-doc-synchronization, graphify
│   ├── workflows/            # graphify workflow
│   └── sync/                 # DEVOPS_LOG.md, DECISIONS.md, HANDOFF.md, LINUX_STATUS.md, WINDOWS_STATUS.md
├── .github/                  # GitHub Actions CI/CD pipeline (ci.yml) and community profiles
│   └── workflows/ci.yml      # Parallel Backend test, Frontend build, and Trivy security scans
├── nginx/                    # Reverse proxy configuration
│   └── default.conf          # Location routing for /, /api/, /ws/, /_next/static/, /healthz, /v3/api-docs, /swagger-ui
├── backend/                  # Java 17 + Spring Boot 3.3.13 backend (JJWT 0.12.5, non-root Docker UID 1001, 86/86 tests)
│   └── src/main/java/com/triagenet/
│       ├── config/           # SecurityConfig, JwtAuthenticationFilter, RateLimitingFilter, OpenApiConfig, CustomUserDetails
│       ├── controller/       # Auth, Patient, Hospital, Resource, TriageQueue, Routing, Referral, OxygenTelemetry, Abdm, TrafficControl, Dashboard, Admin
│       ├── dto/              # Login, Register, User, Response, Referral, Shortage, OxygenTelemetry, AbdmProfile, TrafficPreemption DTOs
│       ├── engine/           # SeverityScorer, HungarianMatcher, DijkstraRouter
│       ├── entity/           # District, Hospital, Patient, SeverityScore, TriageQueueEntry, Resource, OxygenTelemetry, StaffUser, ShiftSession, RefreshToken
│       ├── repository/       # Spring Data JPA Repositories (including OxygenTelemetryRepository)
│       └── service/          # Patient, Hospital, TriageQueue, SpatialRouting, Referral, OxygenTelemetry, AbdmIntegration, TrafficControlGateway, Seed, Totp, MnemonicRecovery, ShiftSession, HospitalAuth, LoginAttempt, SecurityAudit
├── frontend/                 # React 19 + Next.js 16.4.1 (App Router / Turbopack) + Tailwind CSS + Lucide + Leaflet + PWA
│   ├── app/                  # 22 routes (/ambulance, /portal, /simulator, /downloads, /onboarding, /control, /dashboard, /privacy, /terms, error.tsx, not-found.tsx, etc.)
│   ├── components/triagenet/ # Capacity (PSA Oxygen IoT Monitor), Queue (ABHA Console), Regional Network, Doctors Roster, Supplies Governance, Modals, Empty State, Skeletons
│   └── lib/                  # api-client, auth-context, sound-beacon (Web Audio API), director-bridge, jharkhand-data, predictive-supply-engine, triage-data, validation, analytics, user-config
├── mobile/                   # (Phase 3) Flutter monorepo (108 Ambulance, Bedside Nurse, Command Monitor)
├── android-app/              # Native Android companion wrapper with build-apk.ps1
├── ml/                       # Python ML training & 4-dataset benchmarking scripts
└── scripts/                  # deploy.sh, backup_db.sh, keep_alive.py, test_e2e_flow.py, stress_test_api.py, verify_system_integrity.py, scraping pipeline & Jharkhand builders
```

---

## 6. What Should NOT Change Without Explicit Decision

- The 4 core algorithm implementations in `com.triagenet.engine`.
- The 111 authentic Jharkhand facilities across 24 districts.
- The 6 RBAC user roles and their security permission model.
- The Panacea SaaS design aesthetic and `#491205` brand palette.
- Strict adherence to Java 17 LTS (configured via `.vscode/settings.json`, `backend/.settings/org.eclipse.jdt.core.prefs`, and `backend/pom.xml`).

---

## 7. Current Project State & Shipping Status (October 2026)

- **Apple Keynote Video Release Completed**: Native 4K UHD 60FPS explainer video (`video_production/my-video/out/TRIAGENET_APPLE_KEYNOTE_4K_60FPS.mp4`, 3840x2160, 60 FPS, 1:53 exact duration) with official Spring Boot branding and Java 17 LTS architecture.
- **Phases Completed & Verified**:
  - Phase 1–10: Core Algorithms, RBAC, Emergency Triage, Spatial Map, 108 CAD, Motion Graphics, Staging Automation.
  - Phase 11: Real-Time Bed & PSA Oxygen Plant IoT Telemetry Monitor (Entity, Service, Controller, Live Gauge Monitor).
  - Phase 12: Municipal ITMS & Police Interceptor Telemetry Clearance System (NTCIP 1202 / SCATS Emergency Vehicle Preemption, Highway corridor signal overriding, dynamic VMS alerts, Police PCR dispatch coordination).
  - Phase 13: Acoustic Siren & Sound Beacon (Native Web Audio API synthesizer: 108 emergency sirens, critical vitals chimes, Hungarian chords).
  - Phase 14: Ayushman Bharat Digital Mission (ABDM / ABHA Patient Intake Integration with 14-digit verification & clinical prefill).
  - Phase 15: Production Hardening & Resilience (Sliding-window IP rate limiting with `Retry-After`, automated DB backups with SHA-256 and 7-day retention, RLS policies, Render infrastructure manifest `render.yaml`, GitHub Actions keep-alive cron, clinical error boundaries `error.tsx`, 404 handler `not-found.tsx`, healthcare privacy/terms pages, mobile OTA manifest v1.3.0, and 8/8 automated E2E sanity checks).
  - Phase 16: Complete SEO Suite, Favicons, Public Deployment & Crash Recovery (Dynamic and static `sitemap.xml`, `robots.txt`, `site.webmanifest`, full favicon suite `16x16` to `512x512` + `apple-touch-icon`, `opengraph-image.png`, route-specific `layout.tsx` metadata across 23 routes, descriptive image alt text standardization, and mobile OTA endpoint permissions).
  - Phase 17: Production Cloud Launch on Render.com (100% Live: Managed PostgreSQL 16 DB, Spring Boot 3.3.13 Backend, Next.js 16.4.1 Frontend, cloud JDBC URI normalizer, 24/7 anti-sleep keep-alive workflow).
  - Phase 18: Dual-Mode Architecture (Guest Sandbox & Authenticated Operations) & GitHub Release v1.3.0:
    - Implemented Guest Sandbox Mode with simulated Jharkhand clinical operations, Director's Control Centre access (`/control`), and prominent top warning banner.
    - Sanitized all persona defaults; unauthenticated visitors are safely identified as `Guest Clinical Observer`.
    - Cloud Cross-Origin Sync: dynamic CORS origins, `SameSite=None; Secure` cookie transport, and dual Bearer token transmission.
    - GitHub Release `v1.3.0` published with mobile companion APK, IPA, standalone Spring Boot JAR, and full Flutter source package.
- **Quality & Test Gates**:
  - Backend: **89 / 89 tests PASS** (`BUILD SUCCESS`, 0 failures, 0 errors in 35.9s).
  - Frontend: 0 TypeScript errors (`npx tsc --noEmit`), **23/23 routes** compile cleanly with Turbopack in 9.4s (including dynamic `ƒ /healthz`).
  - Containerization: 5/5 containers running and healthy (`triagenet-backend`, `triagenet-frontend`, `triagenet-db`, `triagenet-redis`, `triagenet-proxy`).
  - Production Deployment: **LIVE ON RENDER** (`https://triagenet-frontend.onrender.com` & `https://triagenet-backend.onrender.com`).
  - 24/7 Keep-Alive Automation: GitHub Actions `keep-alive.yml` pinging frontend & backend every 14 min (60s timeout, automatic `/healthz` -> `/` fallback, verified **100% Green**).
  - Official GitHub Release: **v1.3.0 Published** (`https://github.com/PG300604/TriageNet/releases/tag/v1.3.0`).
  - OpenAPI 3.0 Contract: Documented in `backend/openapi.json` with 50+ REST endpoints.
  - E2E Sanity Flow (`scripts/test_e2e_flow.py`): **8/8 checks PASS** (Healthcheck, State Overview, Severity Scorer, ITMS Gateway, Traffic Preemption, ABDM, IoT Oxygen Telemetry, Mobile OTA).
  - Rate Limiting (`scripts/stress_test_api.py`): **PASS** (HTTP 429 verified with `Retry-After` header).





