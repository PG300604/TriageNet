# PRD — TriageNet
### Intelligent Healthcare Resource Allocation System
**Author:** Priyanshu Ghosh | **Version:** 1.0 | **Timeline:** 5 weeks (solo, final year project)

---

## 1. Problem Statement

Hospitals frequently face a mismatch between patient need and available resources — one hospital
runs out of ICU beds or ventilators while a nearby facility has spare capacity, and there is no
systematic, automated way to:

1. Score and prioritize patients by clinical urgency as conditions change over time.
2. Assign scarce resources (beds, ventilators, specialists) fairly and optimally when multiple
   patients compete for them.
3. Route overflow patients to the best available hospital in a region when the local facility is full.

This is a well-documented operational failure (surge events, monsoon-season trauma spikes, mass
casualty incidents) and is a real, explainable problem — not a toy CRUD scenario.

## 2. Goals

- Build a system that models patient intake, triage, resource assignment, and regional overflow
  routing using real algorithms (not just database lookups).
- Demonstrate depth across four algorithmic domains: priority scheduling, bipartite matching,
  graph shortest-path, and lightweight ML-based scoring.
- Ship a deployable, demoable product (not just source code) with a live dashboard and a
  scenario simulator, since real hospital data will not be available.
- Produce a system that is defensible and explainable in a technical interview.

## 3. Non-Goals

- Not a real production hospital system — no real patient data, no regulatory (HIPAA/DISHA)
  compliance work.
- Not attempting a full deep-learning pipeline. The ML component is a small, offline-trained
  severity scoring model, not a live-training system.
- No live integration with real hospital APIs. All hospital/resource data is simulated.
- No mobile app in MVP scope.

## 4. Target Users (personas, for demo/framing purposes)

| Persona | Role | Key need |
|---|---|---|
| Hospital Staff | Front-desk / triage nurse | Register patients, see live triage queue, assign resources |
| Hospital Administrator | Manages one hospital's capacity | View resource utilization, approve transfers |
| Regional Coordinator | Oversees multiple hospitals | View regional capacity map, trigger/approve overflow routing |

## 5. Core Features (MVP — must ship in 5 weeks)

### F1 — Patient Intake & Severity Scoring
- Register a patient with vitals/symptoms.
- System computes a severity score (0–100) using a small offline-trained model
  (logistic regression / decision tree, coefficients embedded in the Java service).
- Score is explainable: show which factors drove the score.

### F2 — Dynamic Triage Queue
- Per-hospital priority queue ordering patients by severity score with wait-time decay
  (a patient waiting longer becomes relatively higher priority even without severity change).
- Real-time reordering as new patients arrive or scores change.

### F3 — Resource Assignment Engine
- When a bed/ventilator/specialist frees up, optimally match it against waiting patients using
  the Hungarian algorithm (bipartite matching) rather than simple first-come-first-served,
  accounting for resource-type compatibility (e.g., blood type, specialty required).

### F4 — Regional Overflow Routing
- Model hospitals in a region as a graph (nodes = hospitals, edges = transfer time/distance).
- When a hospital is at capacity, compute the nearest hospital with available capacity via
  Dijkstra's algorithm.
- Stretch: model multiple simultaneous overflow patients as a min-cost max-flow problem to
  minimize total regional transfer distance.

### F5 — Scenario Simulator
- Since real data isn't available, build a data generator that can simulate:
  - Steady-state daily admissions
  - A "mass casualty event" (spike in high-severity patients)
  - A "monsoon-season surge" (gradual capacity depletion across the region)
- This is the centerpiece of the live demo.

### F6 — Live Dashboard
- Hospital capacity view (beds/ventilators/specialists, live occupancy).
- Live triage queue view per hospital.
- Regional map/graph view showing hospitals and active transfers.
- Role-based views (Hospital Staff vs Regional Coordinator).

## 6. Stretch Goals (only if time remains after MVP)

- Min-cost max-flow for full regional optimization (vs. single-hospital Dijkstra routing).
- Historical analytics dashboard (average wait time, resource utilization trends).
- Notification/alert system for critical capacity thresholds.

## 7. Success Metrics (for report/demo, not real-world KPIs)

- Correctness: triage queue always reflects current priority ordering; assignment engine never
  produces an invalid match (resource-type mismatch).
- Performance: assignment/routing computations complete in well under 1 second for a simulated
  region of 10–15 hospitals and 100+ patients.
- Demo clarity: a mass-casualty simulation visibly shows overflow routing kick in and resolve.

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| No real dataset for ML scoring | Use a public Kaggle ICU-admission/triage dataset for offline training |
| Hungarian algorithm / MCMF complexity underestimated | Timebox Week 3–4; fall back to simpler greedy matching if needed, document the tradeoff |
| Dashboard scope creep | Keep dashboard to 3 views only (capacity, queue, regional map); resist adding extra screens |
| Running out of time before deployment | Docker + deploy by end of Week 4, leave Week 5 fully for polish/demo, not new features |

## 9. Out of Scope for Report/Viva Framing

Be explicit in the final report that this is a simulation/demonstration system built to showcase
algorithmic problem-solving applied to a real operational domain, not a clinically validated or
production-ready hospital system.
