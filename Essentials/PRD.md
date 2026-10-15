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

---

## 5. Success Metrics

1. **Algorithmic Correctness**: 100% adherence of queue ordering to priority equations; zero invalid resource assignments (hard constraints strictly respected).
2. **Sub-Second Execution**: Hungarian assignment and Dijkstra routing execution under **50 ms** for state-wide facility queries.
3. **Explainability**: 100% of triage scores and transfer routing suggestions provide detailed contributing factor breakdowns.
4. **State-Wide Coverage**: Complete 24-district representation of Jharkhand healthcare infrastructure.

---

## 6. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| OpenRouteService network latency | Precompute distance matrices for 79 Jharkhand facilities into local database cache; use ORS API for fallback recalculations. |
| Queue starvation for moderate patients | Enforce wait-time decay parameter $\lambda = 0.5$ pts/min so long-waiting patients reliably elevate. |
| Incompatible resource matching | Hard-code high penalty matrix costs ($+10,000$) for resource mismatch in Hungarian matcher. |
| User interface clutter across 6 roles | Enforce RBAC navigation filtering (`AuthContext`), showing only role-relevant tools and views. |
