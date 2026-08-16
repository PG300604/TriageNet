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
- [`DECISIONS.md`](file:///p:/TriageNet/DECISIONS.md) — Architectural decision log (Jharkhand dataset selection, Render/Vercel deployment, self-hosted OpenRouteService, 4-dataset ML benchmark).

---

## 3. Key Operational Systems & Real Data Integration

### A. Authentic Jharkhand Healthcare Infrastructure (79 Facilities across 24 Districts)
- **Real-World Scraped Dataset**: TriageNet uses 100% authentic public health infrastructure data from Jharkhand, India across 3 tiers:
  - **Tier 1 — Tertiary Medical Colleges**: RIMS Ranchi, MGM Medical College Jamshedpur, SNMMCH Dhanbad, Phulo Jhano Medical College Dumka, Medinirai Medical College Palamu.
  - **Tier 2 — District Hospitals**: 24 District Hospitals (DH Ranchi, DH Hazaribagh, DH Bokaro, DH Giridih, DH Chaibasa, etc.).
  - **Tier 3 — Community Health Centres (CHCs)**: 50+ CHC block-level facilities across Jharkhand (CHC Kanke, CHC Ormanjhi, CHC Namkum, etc.).
- Data generation/scraping pipeline: [`scrape_jharkhand_hospitals.py`](file:///p:/TriageNet/scripts/scrape_jharkhand_hospitals.py) + [`build_real_jharkhand_dataset.js`](file:///p:/TriageNet/scripts/build_real_jharkhand_dataset.js). Seeded into Spring Boot via [`HospitalSeedService.java`](file:///p:/TriageNet/backend/src/main/java/com/triagenet/service/HospitalSeedService.java).

### B. Spatial Routing Engine & Interactive Leaflet Maps
- Real-world geospatial coordinate mapping for all 79 facilities.
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

### E. Panacea Healthcare SaaS Design System
- Visual design language: `Walnut Shadow` palette, `#491205` brand accent, official TriageNet logo and favicons, crisp cards, zero generic emojis.
- Full Enterprise SEO architecture, PWA capabilities, and font display swap optimizations.

---

## 4. Non-Negotiable Core Engineering Principles

1. **Core Algorithms Must Be Real & Hand-Implemented**:
   - `SeverityScorer.java` — Logistic Regression vital sign scoring.
   - `TriageQueueService.java` — Priority queue with time-decay reordering (`effectivePriority = baseSeverity + λ * waitTimeMinutes`).
   - `HungarianMatcher.java` — $O(n^3)$ Kuhn-Munkres bipartite matching for optimal patient-resource allocation.
   - `DijkstraRouter.java` — Shortest path spatial graph routing over Jharkhand road network graph.
2. **Explainability**: Every score, queue re-ranking, resource assignment, and spatial routing decision must return a clear, human-readable breakdown of contributing factors.
3. **RBAC Scope Locking**: Ensure role boundaries are enforced strictly across both UI navigation and backend API endpoints.
4. **Deployability & Parity**: Maintain Docker container parity for Spring Boot backend and Next.js frontend deployment.

---

## 5. Technology Stack & Directory Structure

```
TriageNet/
├── Essentials/               # Source-of-truth project documentation (PRD, TRD, ERD, brain, instructions)
├── backend/                  # Java 17 + Spring Boot 3.x backend
│   └── src/main/java/com/triagenet/
│       ├── config/           # SecurityConfig, JwtAuthenticationFilter, CustomUserDetails
│       ├── controller/       # Auth, Patient, Hospital, Resource, TriageQueue, Routing, Referral, Dashboard
│       ├── dto/              # Login, Register, User, Response DTOs
│       ├── engine/           # SeverityScorer, HungarianMatcher, DijkstraRouter
│       ├── entity/           # District, Hospital, Patient, SeverityScore, TriageQueueEntry, Resource, etc.
│       ├── repository/       # Spring Data JPA Repositories
│       └── service/          # Patient, Hospital, TriageQueue, SpatialRouting, Referral, Seed services
├── frontend/                 # React 19 + Next.js 15 (App Router) + Tailwind CSS + Lucide icons + Leaflet
│   ├── app/                  # Route handlers, login portal, state dashboard
│   ├── components/triagenet/ # Capacity, Queue, Regional Network, ED Intake, 108 Command, SEO, TopBar, Sidebar
│   └── lib/                  # api-client, auth-context, jharkhand-data, ml-severity-scorer, triage-data
├── ml/                       # Python ML training & 4-dataset benchmarking scripts
├── scripts/                  # Scraping pipeline & Jharkhand JSON/TS data builders
└── graphify-out/             # Knowledge Graph index & AST relationship network
```

---

## 6. What Should NOT Change Without Explicit Decision

- The 4 core algorithm implementations in `com.triagenet.engine`.
- The 79 authentic Jharkhand facilities across 24 districts.
- The 6 RBAC user roles and their security permission model.
- The Panacea SaaS design aesthetic and `#491205` brand palette.
