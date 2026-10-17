# PRD — TriageNet
### State-Wide Intelligent Healthcare Resource Allocation & Spatial Overflow Routing System
**Author:** Priyanshu Ghosh | **Version:** 2.0 (Phase 7 Enterprise Release) | **Target Region:** Jharkhand, India

---

## 1. Executive Summary & Problem Statement

Public healthcare systems during crisis events (monsoon trauma spikes, mass casualty incidents, epidemic surges) face severe resource imbalances. In the state of **Jharkhand, India**, tertiary medical centers like **RIMS Ranchi** or **MGM Jamshedpur** frequently hit 100%+ bed and ICU occupancy while surrounding District Hospitals or Community Health Centres (CHCs) retain underutilized capacity.

Without automated state-wide coordination:
1. **ClinicalUrgency Misclassification**: Patients are triaged statically without continuous re-scoring as wait times increase.
2. **Suboptimal Resource Allocation**: Scarce ICU beds, ventilators, and specialists are assigned on a First-Come-First-Served (FCFS) basis rather than matching patient urgency and medical compatibility.
3. **Uncoordinated Patient Overflow Transfers**: Ambulances transfer critical patients blindly without real-time bed pre-booking or road-distance spatial shortest-path calculation.

**TriageNet** solves this problem by uniting **real-world Jharkhand public health infrastructure (111 facilities across 24 districts)** with four production algorithmic engines: multi-dataset ML vital sign scoring, dynamic priority queues with wait-time decay, Hungarian bipartite matching, and Dijkstra spatial road routing.

---

## 2. System Scope & Non-Goals

### A. Goals & Core Deliverables
- **State-Wide Healthcare Mapping**: Model 111 authentic Jharkhand facilities across 24 districts and 3 infrastructure tiers (Tertiary Medical Colleges, District Hospitals, Community Health Centres).
- **4 Real Algorithmic Engines**:
  1. Multi-factor ML severity scoring (Logistic Regression trained offline across 4 public triage datasets, 98.88% emergency recall).
  2. Custom priority queue with continuous wait-time decay (`effectivePriority = baseSeverity + λ * waitTimeMinutes`).
  3. $O(n^3)$ Hungarian algorithm for bipartite patient-resource matching (ICU Beds, Ventilators, Oxygen Beds, Specialists).
  4. Dijkstra graph shortest path spatial routing across Jharkhand road network matrices (OpenRouteService).
- **6-Role Enterprise RBAC System**: Role-tailored dashboards and permission controls for state directors, district CMOs, hospital administrators, triage nurses, and 108 ambulance dispatchers.
- **108 Ambulance Tactical Command Console**: Real-time bed pre-booking, multi-criteria hospital matching, and in-flight fleet telemetry tracking.
- **Enterprise SEO & PWA Platform**: Schema.org JSON-LD structured data with multi-lingual emergency schemas (`Hindi, English, Santhali, Ho, Mundari`), OpenGraph/Twitter social cards, crawler access rules, and offline-capable PWA manifest.
- **Scenario Simulator**: Live interactive testing engine simulating steady-state admissions, mass casualty events, and monsoon surge spikes.

### B. Non-Goals
- **Not a Live Clinical EHR/EMR**: Designed as an operational resource allocation, triage, and regional transfer orchestration platform, not a patient health record storage engine.
- **No Heavy Live Python Microservice**: ML model coefficients are trained offline and embedded directly into backend (`SeverityScorer.java`) and frontend (`ml-severity-scorer.ts`) for zero-latency execution.

---

## 3. Persona Definitions & User Roles (6-Role RBAC Architecture)

| Role Code | Role Title | Key Responsibilities & View Scope |
|---|---|---|
| `SUPER_ADMIN` | System Super Admin | Master state configuration, system dataset seed controls, global audit logs, full access. |
| `STATE_HEALTH_DEPT` | State Health Department Director | State-wide read-only command telemetry across all 24 districts of Jharkhand; aggregate capacity monitoring. |
| `DISTRICT_CMO` | District Chief Medical Officer | District emergency health officer; scope-locked to monitoring and directing care within a specific district (e.g., Ranchi). |
| `HOSPITAL_ADMIN` | Medical Superintendent | Facility-level administrator (e.g., RIMS Ranchi); manages hospital capacity, bed allocations, and staff resources. |
| `TRIAGE_NURSE` | Emergency Triage Nurse | Front-desk ED intake nurse; registers incoming patients, inputs vitals, and triggers ML severity scoring. |
| `AMBULANCE_DISPATCH` | 108 Ambulance Dispatcher | Tactical command controller; manages 108 emergency referrals, performs hospital matching, pre-books beds, and tracks fleet telemetry. |

---

## 4. Feature Specifications

### Module F1 — Rapid Patient Intake & Multi-Factor ML Severity Scoring
- **Vitals Input**: Heart Rate, Systolic BP, SpO2, Temperature (°C), Glasgow Coma Scale (GCS), Respiratory Rate, Age, Comorbidities, Presenting Complaint.
- **ML Engine**: Production Logistic Regression model benchmarked across 4 public triage datasets (**ESI**, **KTAS**, **MIMIC-IV ED**, **SIRS/Lactate**) achieving **98.88% emergency recall**.
- **Explainable Output**: Generates a 0–100 severity score, assigns a risk tier (`CRITICAL`, `HIGH`, `MODERATE`, `LOW`), and details top contributing vital factors (e.g., *SpO2 < 88% (+35 pts)*).

### Module F2 — Dynamic Triage Queue Engine
- **Priority Calculation**: 
  $$\text{Effective Priority} = \text{Base Severity Score} + \lambda \times \text{Wait Time (minutes)}$$
- **Preventing Starvation**: Scheduled background job continuously updates wait times and re-sorts priority queues so long-waiting moderate patients elevate before deteriorating.
- **Real-Time Reordering**: Instant re-heapification upon arrival of new critical patients.

### Module F3 — Bipartite Resource Assignment Engine (Hungarian Algorithm)
- **Problem Formulation**: Matches $N$ waiting triage patients to $M$ available scarce resources (ICU Beds, Ventilators, Oxygen Beds, Specialists).
- **Cost Matrix Penalty Function**: Combines clinical urgency cost with resource-type compatibility penalties and blood-type matching constraints.
- **Algorithmic Guarantee**: Uses a hand-coded $O(n^3)$ Kuhn-Munkres (Hungarian) algorithm to minimize total system cost and maximize patient utility.

### Module F4 — Spatial Routing Engine & Dijkstra Network Graph
- **Road Network Graph**: Nodes = 79 Jharkhand government facilities, Edges = authentic road travel times and highway distances precomputed via OpenRouteService (ORS).
- **Automatic Overflow Triggering**: When a target hospital reaches 100% capacity, Dijkstra's algorithm evaluates nearby facilities in the district/state to compute the optimal transfer destination minimizing travel time and ensuring bed availability.
- **Topology Visualization**: [`RegionalNetworkView`](file:///p:/TriageNet/frontend/components/triagenet/regional-network-view.tsx) renders interactive graph nodes with bed occupancy indicators, travel time tags, and route path highlighting.

### Module F5 — 108 Ambulance Tactical Command Console
- **Multi-Criteria Hospital Matching**: Evaluates distance, bed availability, specialist availability, and road traffic time to recommend optimal receiving hospitals.
- **Real Bed Pre-Booking**: Allows 108 dispatchers to lock and pre-book an ICU or Oxygen bed while the patient is in transit.
- **In-Flight Telemetry**: Live telemetry tracking for active ambulance transfers.

### Module F6 — Authentic Jharkhand Healthcare Infrastructure Dataset
- **Coverage**: 79 facilities across all 24 districts of Jharkhand (Ranchi, East Singhbhum, Dhanbad, Hazaribagh, Palamu, Bokaro, etc.).
- **Tiers**: Tertiary Medical Colleges (RIMS, MGM, SNMMCH), 24 District Hospitals, and 50+ Community Health Centres.
- **Data Scraping Pipeline**: Built via [`scrape_jharkhand_hospitals.py`](file:///p:/TriageNet/scripts/scrape_jharkhand_hospitals.py) combining NHM Jharkhand portal and OpenStreetMap Overpass API.

### Module F7 — Scenario Simulator
- **Simulated Event Triggers**:
  1. *Steady State*: Normal baseline admission rates.
  2. *Mass Casualty Event*: Sudden high-severity surge (e.g. major highway collision or industrial accident).
  3. *Monsoon Trauma Spike*: Regional capacity depletion across multiple districts.

### Module F8 — Panacea Healthcare SaaS Design System
- Modern visual aesthetics: `Walnut Shadow` tone, `#491205` brand palette, official logo & favicon lockups, crisp cards, zero generic placeholders or emojis.
- Full Enterprise SEO architecture, PWA capabilities, and font display swap optimizations.

### Module F9 — Doctor & Specialist Availability Roster
- Dynamic on-duty specialist tracking across emergency medicine, trauma surgery, anesthesiology, intensive care, and pediatrics.
- Direct clinician lookup with shift indicators, emergency paging, and readiness verification.

### Module F10 — AI Predictive Supply Engine & 3-Tier Governance
- **Bottom-Up Shortage Reporting**: Frontline triage nurses and ward officers log local deficits with `#SHORT-2026-XXXX` tokens.
- **AI Pre-Fetch Recommendations**: Predictive algorithm correlates shortage telemetry with incoming 108 ambulance admissions, calculating which reserves to pre-fetch via Dijkstra transit routing before hospital stockouts occur.
- **3-Tier Role Governance**: State Command bulk contracts, District CMO share rebalancing, Hospital Admin department allocations with modern pill approval modals.

### Module F11 — Real GIS Spatial Map & Multi-Ambulance Fleet Command
- Real GPS coordinate mapping of all 79/111 facilities (eliminating circular layout).
- 3-tier surge capacity coloring (Crimson Red $\ge 80\%$, Amber $60-80\%$, Emerald Green $<60\%$).
- 6-unit multi-ambulance fleet (ALS/BLS) with 20–35 km coverage zones and interactive telemetry drawers.

### Module F12 — Cryptographic Zero-Email Onboarding & 3-Tier Approval Precedence
- Official `JH-STF-XXXX` Staff ID credentials with public status probe (`GET /api/auth/status/{staffId}`).
- Offline RFC 6238 TOTP engine + 12-word BIP-39 mnemonic phrase self-recovery.
- 8h/12h clinical shift sessions with 4-digit PIN quick-lock.
- 3-tier approval hierarchy: State Command (`SUPER_ADMIN`) $\to$ Intermediate Leadership (`DISTRICT_CMO`, `HOSPITAL_ADMIN`) $\to$ Ground Operational Staff.

### Module F13 — Phase 10: Pure Motion Graphics & Product Launch Showcase (Silent Keynote Style)
- **Concept & Format**: Zero-voiceover, high-energy product launch video (60–90 seconds) following the modern Silicon Valley "Silent Tech Reel" style (Linear / Raycast / Supabase aesthetic).
- **Core Narrative Flow**:
  1. *Hook & 3D Perspective Reveal (0–8s)*: Floating 3D dark laptop mockup displaying the amber `#100904` TriageNet command HUD with kinetic typography.
  2. *Intake & Priority Queue (8–22s)*: High-fps OBS screen capture of emergency patient intake, vital sliders moving, and dynamic priority min-heap recalculation.
  3. *Algorithm Explainer (22–42s)*: Programmatic vector animation of Jharkhand's 24-district network graph with Dijkstra shortest-path calculations and Hungarian bipartite bed allocation.
  4. *108 Tactical Dispatch & Referral (42–52s)*: In-flight ambulance telemetry, 1-click bed pre-booking, and Clinician Profile multi-role switching.
  5. *Architecture & Production Metrics (52–60s)*: Kinetic counter animations (111+ Hospitals, 24 Districts, 71/71 Tests Green, Spring Boot 3.3.13 + Next.js 16.4.1) leading to open-source GitHub callout.
- **Production Toolchain (100% Free & Zero Watermark)**:
  - **Screen Recording**: OBS Studio (1080p / 60 FPS lossless) + ShareX.
  - **Algorithm Motion Graphics**: Motion Canvas (TypeScript + browser interactive scrubber) / Remotion (React + TS for animated UI counters and telemetry cards).
  - **3D Device Framing**: Web-based Animockup / Figma Perspective Mockups + DaVinci Resolve 3D DVE camera tilts.
  - **Master Assembly & Sound Design**: DaVinci Resolve Free (up to 4K 60fps, Text+ titles with motion blur, no watermarks) paired with electronic synth soundtrack and UI micro-SFX (clicks, swooshes, chimes).

### Module F14 — Hospital Financial ERP & HMS Gateway Integration
- **Bidirectional Accounting Gateway**: Connects TriageNet's equipment capitalization and care recovery engine to each hospital's respective financial software (NIC e-Hospital HMS v4.2, ABDM NHCX Gateway, SAP Healthcare IS-H, JPFMS / Tally Cloud).
- **Automated 24/7 Reconciliation**: Ingests billing vouchers and Ayushman Bharat PM-JAY recovery claims automatically, updating facility operating budgets and state contingency reserve ledgers.
- **Interactive Configuration Console**: Allows operators to customize REST/FHIR endpoints, authentication secret tokens, sync cadences (real-time webhook vs batch), and execute live API handshake tests.

### Module F15 — Uber-Style 3D GIS Fleet CAD & Dijkstra Shortest Path Telemetry
- **Uber 3D Vehicle Simulation**: Continuous 1.2s animation ticker driving 3D isometric vehicles with heading rotation (`transform: rotate`), emergency roof strobe lightbars, speed badges (54–68 km/h), and radar pulse rings.
- **Camera Auto-Framing (`fitBounds`)**: Map automatically centers and frames the entire Dijkstra route corridor between the incident pickup scene and target hospital whenever the selection updates.
- **Live Dijkstra Shortest-Path Route HUD**: Floating telemetry strip detailing optimal highway corridor (NH-33 / NH-20), green wave signal preemption, distance, real-time ETA, and ICU bed hold status.

### Module F16 — Role-Based Manual Data Entry Infrastructure (Public GitHub Release Ready)
- **Zero-Mock Production Mode**: Prepares TriageNet for public open-source deployment, ensuring every metric and record can be entered manually by designated leadership roles rather than relying on pre-fetched mock data:
  - **Super Admin**: Register GeM bulk procurement master contracts and adjust district contingency pool allocations.
  - **District CMO**: Submit emergency supply requisitions with P1/P2/P3 priorities and clinical justifications.
  - **Medical Superintendent**: Add and reconfigure hospital department care bays and dedicated ventilator stations.
  - **Ambulance Dispatcher**: Manual 108 emergency call intake and vehicle dispatch.

### Module F17 — AI Automated Accident Hotspot Detection & Multi-Criteria Doctor Roster Matching
- **Automated Collision Cluster Identification**: Maps 5 real-world Jharkhand highway blackspots (Ormanjhi NH-33, Jharia Colliery, Barhi GT Road, Bundu Valley, Adityapur Industrial) identifying incident clusters, collision frequencies, and default trauma mechanisms.
- **Dynamic Doctor Duty Roster Telemetry**: Direct query of surgical specialist rosters across RIMS Ranchi, Sadar Hospital Ranchi, SNMMCH Dhanbad, and MGM Jamshedpur to determine whether the required specialist (Neurosurgeon, Pulmonologist, Trauma Surgeon, Burns/Plastic, Ortho) is `READY_TRAUMA_BAY`, `OCCUPIED_IN_OT`, or `NOT_AVAILABLE`.
- **3-Tiered Casualty Destination Recommendations**:
  - **1st Best (Recommended Apex Facility)**: Definitive tertiary care with on-duty specialist present & ready in trauma bay.
  - **2nd Best (Immediate Airway/Shock Stabilization Fallback)**: Physically closer intermediate facility (e.g. Sadar Hospital Ranchi) for rapid intubation, chest tube, or fluid resuscitation if patient decompensates in transit.
  - **3rd Best (Alternative Apex Standby)**: Comprehensive secondary tertiary center with dedicated backup surgical roster and open ICU beds.
- **Highway Traffic Congestion Integration**: Real road distances and traffic delay factors (+6m to +22m) factoring into effective ETA, with one-touch 108 Green Wave Signal Preemption clearing delays to 0m and accelerating transit.

### Module F18 — 108 Ambulance EMT In-Transit Mobile Companion App (`/ambulance`)
- **Paramedic Field Interface**: Mobile-first application designed for 108 EMT Paramedics and drivers in transit across Jharkhand.
- **Live Patient Telemetry Entry**: Real-time onboard entry of patient vitals (GCS slider 3-15, SpO2 % hypoxia monitor, Systolic BP shock indicator, Heart Rate) and injury mechanism.
- **Real-Time Cross-Device Synchronization**: Built on the browser BroadcastChannel API (`directorBridge`), telemetry entered on the paramedic's phone immediately synchronizes with the State Command Dashboard (`/dashboard`) and Director Control Center (`/control`) with zero latency.
- **Field Navigation & Pre-Alert**: Lock destination routes, activate Green Wave sirens, and broadcast pre-arrival alerts directly to hospital trauma bays.

### Module F19 — 3D Isometric Ambulance Van Model & Swiggy-Style Road-Snapped Dynamic Pathing
- **3D Isometric Van Marker**: High-fidelity 28x54px emergency vehicle SVG with aerodynamic cab hood, Battenburg yellow/green retroreflective check livery, dual alternating red/blue LED strobe lightbars, forward-projecting headlight cones illuminating the asphalt, medical cross `+`, 108 ALS badging, and realistic asphalt drop shadow.
- **Swiggy / Domino's Style Road Snapping**: Replaced linear flight with authentic Jharkhand highway road waypoints (NH-33, GT Road, NH-20, Subarnarekha Expressway).
- **Dynamic Path Splitting**: The traveled corridor behind the moving vehicle dims to slate gray dashed vectors (`#94a3b8`), while the remaining path ahead pulses with emergency traffic-colored glows and directional chevrons.

### Module F20 — Multi-Corridor Bypass Routing, AI Specialist Traffic Diversion & SVG Topology Patient Flow
- **Multi-Corridor Highway Selection**: Real-time toggle between Route 1 (Primary Highway) and Route 2 (Express Bypass), with live calculation of distance and delay deltas.
- **Dynamic Specialist Traffic Diversion**: When severe gridlock (+10m delay) blocks the primary apex facility, the AI dynamically evaluates alternative hospitals with verified on-duty specialists, presenting an urgent diversion recommendation banner with a 1-click divert action.
#### Module F21 — Phase 9.7: Inter-District Patient Referral & Cross-Boundary Transfer Protocol
- **Cross-District Bed Hold TTL Engine**: 45-minute automatic reservation TTL (`autoReleaseExpiredReferrals`) preventing resource starvation at receiving tertiary trauma facilities. If an ambulance is delayed or fails to arrive, the bed reservation is auto-released back to general availability, transitioning transfer request status to `REJECTED` and reverting the patient to `WAITING` status at the originating hospital.
- **Automated Sweep & Manual Override**: 60-second `@Scheduled` background worker continually enforces TTL expiration across all active transfers (`PROPOSED`, `IN_TRANSIT`), paired with an authorized REST endpoint (`POST /api/referrals/auto-release`) for on-demand audit and triage reconciliation.
- **Frontend ApiClient & Multi-Tenant Support**: Full integration in frontend `ApiClient.autoReleaseExpiredReferrals()` and role-based permissions (`AMBULANCE_DISPATCH`, `HOSPITAL_ADMIN`, `DISTRICT_CMO`, `STATE_HEALTH_DEPT`, `SUPER_ADMIN`).

### Module F22 — Phase 11: Real-Time Bed & PSA Oxygen Plant IoT Telemetry Monitor
- **PSA Generator & Cryogenic LMO Tank Telemetry**: Ingests high-frequency IoT sensor telemetry (`psaOxygenPurity`, `lmoTankPressureBar`, `flowRateLpm`, `capacityPercent`) with automatic threshold evaluation.
- **Dynamic Clinical Severity Alerts**:
  - `CRITICAL`: Purity $< 90\%$ or Pressure $< 4.2\text{ bar}$.
  - `WARNING`: Purity $< 93\%$ or Pressure $< 4.5\text{ bar}$.
  - `NORMAL`: Purity $\ge 93\%$ and Pressure $\ge 4.5\text{ bar}$.
- **Interactive UI Dashboard**: Embedded in `CapacityView` (`frontend/components/triagenet/capacity-view.tsx`) with dynamic purity progress meters, cryogenic tank level visualizers, nominal/critical pulse simulation, and real-time audio cues.

### Module F23 — Phase 13: Acoustic Siren & Sound Beacon (Native Web Audio API Synthesizer)
- **Zero MP3 / Zero External Asset Synthesizer**: Pure native Web Audio API synthesizer (`frontend/lib/sound-beacon.ts`) producing crisp, latency-free tactical audio cues:
  - *108 Emergency Dual-Tone Siren*: 750 Hz / 960 Hz alternating square wave for ambulance mobilization and traffic preemption.
  - *SpO2 Critical Vitals Warning Chime*: 1200 Hz pulsed warning tone for rapid patient crash identification.
  - *Hungarian Match Harmonic Triad Arpeggio*: C5-E5-G5 sine wave chord progression celebrating optimal bipartite bed allocation.
  - *Tactical Radio PTT Click*: Quick radio squelch burst confirming dispatcher commands.
- **Universal TopBar Mute Controller**: Accessible from header across all roles with persistent `localStorage` audio preference state.

### Module F24 — Phase 14: Ayushman Bharat Digital Mission (ABDM) / ABHA Patient Intake Integration
- **National ABHA Verification Engine**: REST endpoints (`POST /api/abdm/verify-abha`, `GET /patient/{abhaNumber}`) validating 14-digit citizen ABHA health IDs against India's digital health stack.
- **Pre-Configured Jharkhand Cultural Preset**: Built-in 1-click test preset for legendary tribal leader **Birsa Munda** (`12-3456-7890-1234`) with complete verified clinical profile and Ayushman Bharat PM-JAY gold card coverage.
- **Automated Clinical Intake Prefill**: Directly injects patient demographics, age, gender, blood group, chronic conditions, and known allergies into frontline nurse intake vitals.

### Module F25 — Phase 12: Municipal ITMS & Police Interceptor Road Clearance Preemption System
- **NTCIP 1202 & SCATS Preemption Protocol**: High-speed traffic signal preemption gateway (`TrafficControlGatewayService`, `TrafficControlController`) establishing automated corridor locks for 108 ALS ambulances.
- **Dynamic Green Wave Corridor Signal Overriding**: Overrides traffic light phases along the Ranchi trauma route (Ormanjhi NH-33, Mesra Ring Road, Booty More, Kanta Toli Flyover, Bariatu Road, RIMS Trauma Bay) to `SOLID_GREEN` on the transit street while enforcing `ALL_RED_HOLD` on conflicting cross-streets.
- **Electronic Variable Message Sign (VMS) Uplink**: Broadcasts emergency vehicle warnings to roadway gantries ahead of the ambulance to clear civilian traffic to the left lane.
- **Police Interceptor & PCR Wireless Dispatch**: Automatically notifies the Ranchi Traffic Police Control Room and stations highway patrol PCR interceptors at key junctions for hands-on intersection clearance.
- **Real-Time Paramedic Radar HUD**: Dedicated live corridor radar feed embedded in `/ambulance` with real-time ETA countdowns, distance meters, and signal lock statuses.

### Module F26 — Phase 15: Production Hardening, System Resilience & Compliance
- **Sliding-Window IP Rate Limiter**: 150 req/min per IP threshold implemented via `RateLimitingFilter.java` returning HTTP 429 Too Many Requests with standard `Retry-After`, `X-RateLimit-Limit`, and `X-RateLimit-Remaining` headers to mitigate DDoS and brute-force abuse.
- **Automated Disaster Recovery Backups**: Automated PostgreSQL dump and gzip compression script (`scripts/backup_db.sh`) with SHA-256 verification and 7-day retention cleanup.
- **Multi-Tenant Row-Level Security (RLS)**: PostgreSQL schema security policies (`scripts/apply_rls.sql`) restricting clinician visibility strictly to their hospital's patient records.
- **Render Cloud Deployment Manifest**: Infrastructure-as-code specification (`render.yaml`) defining web services, environment configurations, and managed database provisioning.
- **Automated Keep-Alive Infrastructure**: GitHub Actions scheduled workflow (`.github/workflows/keep-alive.yml`) and healthcheck pinger (`scripts/keep_alive.py`) preventing cold starts on Render free tier.
- **Clinical Frontend Error Boundaries & Custom 404**: Healthcare-specific fallback UI (`frontend/app/error.tsx`) with crash report generation and triage redirect 404 handler (`frontend/app/not-found.tsx`).
- **Healthcare Legal & Compliance Portals**: DISHA & ABDM aligned privacy policy (`/privacy`) and clinical decision-support terms of service (`/terms`).
- **Mobile OTA Version Manifest Engine**: Server-driven version manifest endpoint (`/api/app/version`) returning version v1.3.0, release notes, and direct APK download URL.

---

## 5. Success Metrics

1. **Algorithmic Correctness**: 100% adherence of queue ordering to priority equations; zero invalid resource assignments (hard constraints strictly respected).
2. **Sub-Second Execution**: Hungarian assignment and Dijkstra routing execution under **50 ms** for state-wide facility queries.
3. **Explainability**: 100% of triage scores and transfer routing suggestions provide detailed contributing factor breakdowns.
4. **State-Wide Coverage**: Complete 24-district representation of Jharkhand healthcare infrastructure (111 seeded facilities).

---

## 6. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| OpenRouteService network latency | Precompute distance matrices for 111 Jharkhand facilities into local database cache; use ORS API for fallback recalculations. |
| Queue starvation for moderate patients | Enforce wait-time decay parameter $\lambda = 0.5$ pts/min so long-waiting patients reliably elevate. |
| Incompatible resource matching | Hard-code high penalty matrix costs ($+10,000$) for resource mismatch in Hungarian matcher. |
| User interface clutter across 6 roles | Enforce RBAC navigation filtering (`AuthContext`), showing only role-relevant tools and views. |
| IDE Java compiler version mismatches | Explicitly map Eclipse JDT LS to Temurin JDK 17 in `.vscode/settings.json` and `backend/.settings/` to eliminate ECJ syntax false positives. |

---

## 9. Launch & Shipping Readiness Status

- **Promotional Artifacts**: Master 4K 60FPS Apple Keynote Explainer Video (`video_production/my-video/out/TRIAGENET_APPLE_KEYNOTE_4K_60FPS.mp4`, 3840x2160 @ 60 FPS, 113.00s) verified and ready for public showcase.
- **Production DevOps Target**: Multi-tier Docker Compose containerization across Spring Boot 3.3 (Java 17), Next.js 16, PostgreSQL 16, Redis 7, and Nginx reverse proxy.
- **Phases 1-15 Complete**: Core algorithms, 108 CAD, Motion Graphics, PSA Oxygen IoT, Sound Beacon, ABDM, Municipal ITMS, and Production Resilience verified with 86/86 backend tests passing and 22/22 frontend routes cleanly compiled.


