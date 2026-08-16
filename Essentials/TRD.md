# TRD — TriageNet Technical Requirements Document
**Author:** Priyanshu Ghosh | **Version:** 2.0 (Phase 7 Architecture Release)

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 React 19 / Next.js 15 Frontend                          │
│   (Panacea SaaS Design, Leaflet Map, Regional Dijkstra Graph, 6-RBAC UI) │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ REST JSON APIs + JWT Auth
┌────────────────────────────────────▼────────────────────────────────────┐
│                    Spring Boot 3.x Backend Service                      │
│                                                                         │
│  ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │ Auth & 6-Role RBAC     │  │ ML Severity Scorer Engine            │  │
│  │ (Spring Security + JWT)│  │ (Logistic Regression, 4 Datasets)    │  │
│  └────────────────────────┘  └──────────────────────────────────────┘  │
│  ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │ Triage Queue Engine    │  │ Resource Assignment Engine           │  │
│  │ (Decay Priority Queue) │  │ (O(n³) Hungarian Matcher)            │  │
│  └────────────────────────┘  └──────────────────────────────────────┘  │
│  ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │ Spatial Routing Engine │  │ 108 Tactical Ambulance Dispatch      │  │
│  │ (Dijkstra + ORS Graph) │  │ (Referrals & Bed Pre-Booking)        │  │
│  └────────────────────────┘  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Hospital Seed Service (79 Real Jharkhand Facilities Data)        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Spring Data JPA / Hibernate
┌────────────────────────────────────▼────────────────────────────────────┐
│                    PostgreSQL 16 Database                               │
│ (Districts, Hospitals, Patients, SeverityScores, Queue, Resources, etc.)│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack & Key Dependencies

| Technology / Library | Purpose in TriageNet | Version / Spec |
|---|---|---|
| **Java 17 & Spring Boot** | Core REST backend & algorithmic execution services | Spring Boot 3.2.x |
| **Spring Security + JWT** | Role-Based Access Control (RBAC) & stateless auth | JJWT 0.11.x |
| **Spring Data JPA & Hibernate**| Object-Relational Mapping & PostgreSQL persistence | JPA 3.x |
| **PostgreSQL 16** | Relational data storage for state infrastructure & triage entities | PostgreSQL 16 |
| **React 19 & Next.js 15** | Frontend application framework (App Router) | Next.js 15 (Turbopack) |
| **Tailwind CSS & Lucide** | Styling system & icon architecture (`Walnut Shadow`, `#491205` palette) | Tailwind CSS 3.4 |
| **Leaflet & React-Leaflet** | Interactive spatial map visualization for 79 Jharkhand facilities | Leaflet 1.9 |
| **OpenRouteService (ORS)** | Real road network travel distance & time matrix calculation | Self-hosted / API |
| **Python 3.11 & Scikit-Learn**| Offline ML training & 4-dataset triage benchmarking | Python 3.11 |
| **Docker & Docker Compose** | Containerization for dev & production deployment | Docker Compose v2 |

---

## 3. Module Specifications & Algorithmic Design

### 3.1 Auth & 6-Role RBAC Module
- **Security Chain**: [`SecurityConfig.java`](file:///p:/TriageNet/backend/src/main/java/com/triagenet/config/SecurityConfig.java) + [`JwtAuthenticationFilter.java`](file:///p:/TriageNet/backend/src/main/java/com/triagenet/config/JwtAuthenticationFilter.java).
- **Roles & Permissions**:
  - `SUPER_ADMIN`: Full system access, seed configuration, master data edits.
  - `STATE_HEALTH_DEPT`: Read-only state-wide aggregate telemetry.
  - `DISTRICT_CMO`: Scope-locked to facility operations within their assigned district.
  - `HOSPITAL_ADMIN`: Hospital capacity, staff assignment, local resource management.
  - `TRIAGE_NURSE`: ED patient registration, vital sign input, triage queue view.
  - `AMBULANCE_DISPATCH`: 108 referral creation, hospital matching, bed pre-booking.

### 3.2 ML Severity Scoring Engine
- **Class**: [`SeverityScorer.java`](file:///p:/TriageNet/backend/src/main/java/com/triagenet/engine/SeverityScorer.java) / [`ml-severity-scorer.ts`](file:///p:/TriageNet/frontend/lib/ml-severity-scorer.ts).
- **Offline ML Benchmarking**: Evaluated across 4 public emergency triage datasets (**ESI**, **KTAS**, **MIMIC-IV ED**, **SIRS/Lactate**), achieving **98.88% emergency recall**.
- **Scoring Function**:
  $$\text{Severity Score } S = \sigma\left(w_0 + \sum_{i=1}^{k} w_i x_i\right) \times 100$$
  where features $x_i$ represent normalized vital signs (Heart Rate, Systolic BP, SpO2, Temperature, GCS, Resp Rate, Age, Comorbidities).
- **Risk Tiers**:
  - `CRITICAL`: Score $\ge 80$
  - `HIGH`: $60 \le \text{Score} < 80$
  - `MODERATE`: $40 \le \text{Score} < 60$
  - `LOW`: Score $< 40$

### 3.3 Dynamic Triage Queue Engine
- **Service**: [`TriageQueueService.java`](file:///p:/TriageNet/backend/src/main/java/com/triagenet/service/TriageQueueService.java).
- **Priority Equation with Wait-Time Decay**:
  $$P(t) = S_{\text{base}} + \lambda \cdot t_{\text{wait}}$$
  where $\lambda = 0.5 \text{ pts/minute}$.
- **Scheduled Background Job**: An `@Scheduled` task periodically updates $t_{\text{wait}}$, recomputes $P(t)$, and re-heapifies the queue to prevent long-waiting patients from suffering starvation.

### 3.4 Resource Assignment Engine (Hungarian Algorithm)
- **Class**: [`HungarianMatcher.java`](file:///p:/TriageNet/backend/src/main/java/com/triagenet/engine/HungarianMatcher.java).
- **Bipartite Matching**: Matches $N$ waiting triage patients against $M$ available scarce resources (ICU Beds, Ventilators, Oxygen Beds, Specialists).
- **Cost Matrix Formulation**:
  $$C_{i,j} = (100 - P_i) + \text{Penalty}_{\text{incompatible}}(i, j) + \text{Penalty}_{\text{blood}}(i, j)$$
- **Execution Complexity**: $O(n^3)$ Kuhn-Munkres algorithm implemented in pure Java without external library dependencies.

### 3.5 Spatial Routing Engine & Dijkstra Graph
- **Service & Engine**: [`SpatialRoutingService.java`](file:///p:/TriageNet/backend/src/main/java/com/triagenet/service/SpatialRoutingService.java) & [`DijkstraRouter.java`](file:///p:/TriageNet/backend/src/main/java/com/triagenet/engine/DijkstraRouter.java).
- **Graph Structure**: 79 nodes (Jharkhand hospitals) connected via road distance and travel time edges.
- **Shortest Path Computation**: Calculates the optimal transfer facility with available capacity when the local hospital hits 100% occupancy.

### 3.6 108 Tactical Ambulance Dispatch & Referral Service
- **Service**: [`ReferralService.java`](file:///p:/TriageNet/backend/src/main/java/com/triagenet/service/ReferralService.java).
- **Workflow**:
  1. Dispatcher initiates referral request for patient in transit.
  2. Spatial engine evaluates nearest compatible receiving facilities.
  3. Dispatcher selects target hospital and locks bed (`RESERVED` status).
  4. Real-time telemetry tracks ambulance progress until check-in.

### 3.7 Authentic Jharkhand Healthcare Infrastructure Seeder
- **Service**: [`HospitalSeedService.java`](file:///p:/TriageNet/backend/src/main/java/com/triagenet/service/HospitalSeedService.java).
- **Data Footprint**: 79 facilities across all 24 districts of Jharkhand (Medical Colleges, District Hospitals, CHCs) with exact GPS coordinates and default capacity metrics.

---

## 4. Complete API Surface Specification

| Method | Endpoint | Description & Access Scope |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user, return JWT and role scope |
| `POST` | `/api/auth/register` | Register new user account (Admin only) |
| `GET` | `/api/hospitals` | List all hospitals (supports district filtering) |
| `GET` | `/api/hospitals/{id}` | Get hospital details and live resource capacity |
| `GET` | `/api/hospitals/districts` | Get summary of all 24 Jharkhand districts |
| `POST` | `/api/patients` | Register new patient, trigger ML severity scoring |
| `GET` | `/api/patients/{id}` | Get patient details and vitals history |
| `GET` | `/api/triage-queue/hospital/{hospitalId}` | Get live ordered triage queue for a hospital |
| `POST` | `/api/triage-queue/recompute/{hospitalId}` | Force recomputation of priority decay values |
| `GET` | `/api/resources/hospital/{hospitalId}` | List resource inventory (Beds, Vents, Specialists) |
| `POST` | `/api/resources/assign/{hospitalId}` | Execute Hungarian matcher for freed resources |
| `POST` | `/api/routing/overflow/{patientId}` | Compute Dijkstra spatial overflow destination |
| `GET` | `/api/routing/network-graph` | Fetch graph topology nodes & edges for regional map |
| `POST` | `/api/referrals` | Create 108 ambulance transfer referral & pre-book bed |
| `GET` | `/api/referrals/active` | Get active 108 ambulance transfers |
| `PUT` | `/api/referrals/{id}/status` | Update referral status (`IN_TRANSIT`, `COMPLETED`) |
| `GET` | `/api/dashboard/state-summary` | Aggregate state-wide command telemetry stats |

---

## 5. Non-Functional Specifications

- **Latency**: ML scoring $< 5\text{ ms}$, Hungarian assignment $< 30\text{ ms}$, Dijkstra routing $< 40\text{ ms}$.
- **Security**: JWT validation on all protected endpoints, strict CORS policy, password BCrypt hashing (strength 12).
- **Explainability**: Every API response for scoring, queue ranking, resource matching, and spatial routing includes human-readable factor attributes.
