# TRD — TriageNet
### Technical Requirements Document
**Author:** Priyanshu Ghosh | **Version:** 1.0

---

## 1. Architecture Overview

```
┌─────────────────────┐        ┌──────────────────────────────────┐
│   React / Next.js    │◄──────►│        Spring Boot Backend        │
│  (Dashboard, Sim UI)  │  REST  │                                    │
└─────────────────────┘  JSON  │  ┌──────────────────────────────┐  │
                                │  │  Auth Module (Spring Security │  │
                                │  │   + JWT, role-based access)   │  │
                                │  └──────────────────────────────┘  │
                                │  ┌──────────────────────────────┐  │
                                │  │  Patient / Severity Scoring   │  │
                                │  │  (embedded model coefficients)│  │
                                │  └──────────────────────────────┘  │
                                │  ┌──────────────────────────────┐  │
                                │  │  Triage Queue Engine          │  │
                                │  │  (custom priority queue)      │  │
                                │  └──────────────────────────────┘  │
                                │  ┌──────────────────────────────┐  │
                                │  │  Resource Assignment Engine   │  │
                                │  │  (Hungarian Algorithm)        │  │
                                │  └──────────────────────────────┘  │
                                │  ┌──────────────────────────────┐  │
                                │  │  Regional Routing Engine      │  │
                                │  │  (Dijkstra / MCMF on graph)   │  │
                                │  └──────────────────────────────┘  │
                                │  ┌──────────────────────────────┐  │
                                │  │  Scenario Simulator           │  │
                                │  └──────────────────────────────┘  │
                                └──────────────┬───────────────────┘
                                               │ JPA/Hibernate
                                       ┌───────▼────────┐
                                       │   PostgreSQL    │
                                       └────────────────┘
```

Everything is containerized with Docker; backend and frontend deploy the same way ShopFlow does
(backend on Railway/Render, frontend on Vercel), so no new deployment learning curve.

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Backend | Spring Boot 3.x | REST API, layered architecture (controller/service/repository) |
| Security | Spring Security + JWT | Roles: `HOSPITAL_STAFF`, `HOSPITAL_ADMIN`, `REGIONAL_COORDINATOR` |
| Persistence | Spring Data JPA + Hibernate | PostgreSQL as target DB |
| Database | PostgreSQL | See ERD.md for schema |
| Frontend | React (Next.js) | Dashboard, simulator controls, graph/map visualization |
| Visualization | Recharts / D3 (for graph view) | Regional hospital network as a force-directed or fixed-node graph |
| Containerization | Docker + docker-compose | Local dev + deployment parity |
| ML Component | Python (offline, one-time) → coefficients exported into Java | See §5 |

## 3. Module Breakdown

### 3.1 Auth Module
Standard JWT-based auth, reused pattern from ShopFlow/ZeroHour. Roles gate which dashboard views
and endpoints are accessible.

### 3.2 Patient & Severity Scoring Module
- `Patient` entity holds vitals/symptoms fields (age, heart rate, BP, SpO2, presenting complaint
  category, etc.) — keep the feature set small (6–10 features) so the offline model stays simple.
- Severity scoring: train a logistic regression (or small decision tree) offline in Python
  against a public triage/ICU-admission dataset. Export just the learned weights/thresholds as
  constants in a Java `SeverityScorer` service — no live model serving needed.
- Score explainability: return the top 2–3 contributing factors alongside the score (simple
  coefficient × feature-value ranking) for the dashboard to display.

### 3.3 Triage Queue Engine
- Custom priority queue per hospital, ordered by `effectivePriority = severityScore + decayFactor(waitTimeMinutes)`.
- Because priority changes over time even without new events, the queue needs periodic
  re-evaluation (a scheduled job, e.g. every 30 seconds via `@Scheduled`, recomputes effective
  priority and re-heapifies) rather than a static heap.
- Complexity target: O(log n) insert/update per patient event; full re-sort acceptable at small
  simulated scale (dozens of patients per hospital).

### 3.4 Resource Assignment Engine (Hungarian Algorithm)
- Models available resources (beds, ventilators, specialists) against waiting patients as a
  bipartite cost matrix.
- Cost function combines: compatibility (hard constraint — e.g. blood type, specialty match — as
  a very high cost / disqualification if mismatched) and priority (higher-priority unmatched
  patients cost more to leave unassigned).
- Implement Hungarian algorithm (O(n³)) directly in Java — this is the algorithmic centerpiece,
  should be hand-written and well-tested, not a library call.
- Runs whenever a resource frees up or a batch of new patients arrives.

### 3.5 Regional Routing Engine
- Graph: nodes = hospitals (with live capacity as node weight), edges = transfer time/distance
  (static, precomputed from simulated hospital coordinates).
- MVP: Dijkstra's algorithm to find nearest hospital with available capacity when the local
  hospital is full.
- Stretch: model simultaneous overflow of multiple patients across multiple hospitals as a
  min-cost max-flow problem (source → hospitals-with-overflow → hospitals-with-capacity → sink),
  minimizing total transfer distance while maximizing patients served.

### 3.6 Scenario Simulator
- A service that generates synthetic patients/events on demand or on a timer:
  - **Steady state**: low-rate random arrivals across hospitals.
  - **Mass casualty event**: burst of high-severity patients at one hospital.
  - **Regional surge**: gradual capacity depletion across several hospitals over simulated time.
- Exposed via an admin-only API + a "Run Scenario" button in the dashboard.

### 3.7 Dashboard (Frontend)
Three core views only (resist scope creep):
1. **Hospital Capacity View** — beds/ventilators/specialists occupied vs. available, per hospital.
2. **Triage Queue View** — live-ordered patient queue per hospital with severity/wait indicators.
3. **Regional Map/Graph View** — hospitals as nodes, active transfers animated/highlighted as
   edges, capacity color-coded (green/yellow/red).

## 4. API Surface (representative, not exhaustive)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | JWT login |
| POST | `/api/patients` | Register patient, triggers severity scoring |
| GET | `/api/hospitals/{id}/queue` | Live triage queue for a hospital |
| POST | `/api/resources/{id}/assign` | Trigger assignment engine for a freed resource |
| GET | `/api/regional/graph` | Hospital network graph (nodes + edges) for dashboard |
| POST | `/api/regional/route/{patientId}` | Compute overflow routing for an unassignable patient |
| POST | `/api/simulator/run` | Trigger a scenario (steady/mass-casualty/surge) |
| GET | `/api/dashboard/summary` | Aggregated stats for dashboard header |

## 5. ML Component Detail

- **Do this offline, once, in Python** (Jupyter/Colab is fine) against a public dataset
  (e.g. a Kaggle emergency-triage or ICU-admission dataset).
- Train a simple logistic regression or small decision tree — the goal is a small, interpretable
  set of weights, not a state-of-the-art model.
- Export the coefficients (a handful of numbers) and hardcode them into a `SeverityScorer.java`
  class that computes `sigmoid(w·x + b)` — this avoids running a Python inference service
  alongside the Java backend, keeping deployment simple within the 5-week timeline.
- Document in the report: dataset used, features selected, accuracy/AUC on a held-out test split,
  and the honest limitation that this is a simplified proxy for real clinical triage scoring.

## 6. Non-Functional Requirements

- **Performance**: all algorithmic operations (queue update, Hungarian assignment, Dijkstra
  routing) should complete in well under 1 second at simulated scale (≤15 hospitals, ≤200
  concurrent patients).
- **Security**: JWT auth on all endpoints except login; role-based access control enforced at
  the controller layer.
- **Explainability**: every algorithmic decision (score, assignment, routing choice) should be
  inspectable via the API/dashboard — this matters for viva defense.
- **Deployability**: Dockerized, deployed by end of Week 4 (backend Railway/Render, frontend
  Vercel), consistent with prior projects.

## 7. Testing Strategy

- Unit tests for each algorithm module in isolation (severity scoring, priority queue ordering,
  Hungarian assignment correctness on small hand-checked matrices, Dijkstra shortest-path
  correctness on a small known graph).
- Integration test: run a full scenario end-to-end (simulate patients → triage → assign → route)
  and assert no patient is left in an invalid state.

## 8. Deployment Plan

Same pattern as ShopFlow/ZeroHour:
- Backend: Docker container → Railway/Render.
- Frontend: Vercel.
- Environment variables (DB credentials, JWT secret) via environment config, not hardcoded —
  carry over the security hardening practice already applied to ShopFlow.
