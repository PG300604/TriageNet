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
| **Java 17 LTS & Spring Boot 3.3** | Core REST backend & algorithmic execution services | Spring Boot 3.3.13 |
| **Spring Security + JJWT**| Role-Based Access Control, CSP, Cookie Auth | JJWT 0.12.5 (256-bit CSPRNG entropy) |
| **Spring Data JPA & Hibernate**| Object-Relational Mapping & PostgreSQL persistence | JPA 3.x / Hibernate 6.x |
| **PostgreSQL 16** | Relational data storage for state infrastructure & triage entities | PostgreSQL 16-alpine |
| **Redis 7** | In-memory telemetry cache & golden-hour ambulance GPS buffer | Redis 7-alpine |
| **Nginx** | Unified edge reverse proxy, SSL/TLS termination, static caching | Nginx alpine |
| **React 19 & Next.js 16** | Frontend application framework (App Router + Turbopack) | Next.js 16.4.1 |
| **Tailwind CSS & Lucide** | Styling system & icon architecture (`Walnut Shadow`, `#491205` palette) | Tailwind CSS 4.x + Plus Jakarta Sans |
| **Leaflet & React-Leaflet** | Interactive spatial map visualization with real GPS coordinates | Leaflet 1.9 |
| **OpenRouteService (ORS)** | Real road network travel distance & time matrix calculation | Self-hosted / Geofabrik extract |
| **Python 3.11 & Scikit-Learn**| Offline ML training & 4-dataset triage benchmarking | Python 3.11 |
| **Flutter & Dart (Phase 3)**| Dedicated mobile apps (108 Ambulance, Bedside, Command) | Flutter 3.24+ / Dart 3.5+ |
| **Docker & Docker Compose** | Hardened non-root containerization (`UID 1001`), fail-fast env vars | Compose v2.x / Multi-stage |
| **Aqua Security Trivy & CI** | Automated container, secret, and misconfig auditing in GitHub Actions | Trivy 0.76.0 (0 Findings) |

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
- **Data Footprint**: 111 facilities across all 24 districts of Jharkhand (Medical Colleges, District Hospitals, Community Health Centres) with exact GPS coordinates, tier ratings, blood bank, oxygen generation, trauma surgery flags, and default capacity metrics.

---

## 4. Complete API Surface Specification

| Method | Endpoint | Description & Access Scope |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate with Staff ID/email + password, issue 2FA challenge |
| `POST` | `/api/auth/logout` | Clear `triagenet_jwt` HttpOnly cookie & refresh token revocation |
| `POST` | `/api/auth/register` | Register new user account; returns cryptographic onboarding packet |
| `GET` | `/api/auth/status/{staffId}` | Public zero-email status probe for registration approval |
| `POST` | `/api/auth/2fa/verify-and-start-shift` | Verify RFC 6238 TOTP, start 8h/12h duty shift with PIN |
| `POST` | `/api/auth/refresh` | Rotate 15-minute access token via 7-day refresh cookie |
| `GET` | `/api/auth/me` | Authoritatively return current user profile and scoped permissions |
| `GET` | `/api/admin/staff/pending` | Scoped pending staff queue for Medical Superintendents & CMOs |
| `POST` | `/api/admin/staff/{id}/approve` | Approve staff account according to 3-tier precedence rules |
| `POST` | `/api/admin/staff/{id}/reject` | Reject fraudulent registration |
| `GET` | `/api/hospitals` | List all hospitals (supports district filtering & multi-tenant checks) |
| `GET` | `/api/hospitals/{id}` | Get hospital details (multi-tenant tenant isolation asserted) |
| `GET` | `/api/hospitals/districts` | Get summary of all 24 Jharkhand districts |
| `POST` | `/api/patients` | Register patient (vitals clamped to physiological bounds), score ML |
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

## 5. Non-Functional & Security Specifications

- **Latency**: ML scoring $< 5\text{ ms}$, Hungarian assignment $< 30\text{ ms}$, Dijkstra routing $< 40\text{ ms}$.
- **Security & Hardening (Sprint 10 Compliant)**:
  - Strict Content-Security-Policy (CSP) headers: `default-src 'self'`, `frame-ancestors 'none'`, restricted connect sources.
  - Ephemeral 256-bit CSPRNG dev secret auto-generation if `JWT_SECRET` is unset in development profile.
  - Granular multi-tenant hospital scoping on `/api/hospitals/{id}` (`hospitalAuthService.assertCanAccessHospital`).
  - RFC 6238 TOTP engine with $\pm 1$ time-step clock drift compensation.
  - BIP-39 12-word mnemonic phrase generation with CSPRNG entropy; salted SHA-256 hash storage.
  - 8 single-use emergency recovery codes burned upon use.
  - 8h/12h clinical shift sessions with 4-digit PIN quick-lock after 20-minute idle timeouts.
  - JWT authentication with dual-engine extraction (HttpOnly `triagenet_jwt` cookie + `Authorization: Bearer` header).
  - Method-level RBAC enforcement (`@PreAuthorize("hasRole(...)")`) across all REST controllers.
  - Brute-force lockout (`LoginAttemptService` — 5 attempts $\to$ 15-minute lock with strict 10k capacity bound).
  - Centralized CORS configuration without wildcards.
  - Fail-fast JWT startup entropy guard ($\ge 256$ bits) rejecting default secrets in production.
  - Security audit logging with CRLF/control-character sanitization, quote escaping, and email PII masking.
  - Non-root container execution (`USER 1001:1001`) in Dockerfiles.
  - 71/71 automated backend unit & integration tests passing (100% BUILD SUCCESS).
- **Explainability**: Every API response for scoring, queue ranking, resource matching, and spatial routing includes human-readable factor attributes.

---

## 6. Frontend Architecture & Enterprise SEO / PWA Stack

- **Framework**: Next.js 16.2.6 (App Router + Turbopack) & React 19.
- **Enterprise SEO & Structured Data (JSON-LD)**:
  - Schema.org graphs for `GovernmentOrganization` (Department of Health Jharkhand), `WebApplication` (TriageNet), `GovernmentService` (108 Emergency Dispatch), and `SoftwareApplication`.
  - Multi-lingual emergency contact schemas (`Hindi, English, Santhali, Ho, Mundari`) with 108 and 104 helplines.
  - Dynamic OpenGraph and Twitter Cards (`summary_large_image`) across landing, command dashboard, and login routes.
  - Robots configuration (`robots.ts`) with crawler directives protecting `/api/`, `/dashboard/`, and `/login/`.
  - Dynamic XML sitemap generation (`sitemap.ts`).
- **HTTP Security Headers (`next.config.mjs`)**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
- **PWA & Performance Capabilities**:
  - Web App Manifest (`manifest.ts`) with shortcuts, medical categories, icons, and display modes.
  - Preconnect & DNS-prefetching for CartoCDN map tiles (`basemaps.cartocdn.com`) and Leaflet CDNs.
  - Modern image optimization formats (`image/avif`, `image/webp`).

---

## 7. Hospital Financial ERP & HMS Gateway Integration

- **Accounting Interfaces**:
  - **NIC e-Hospital HMS Finance v4.2**: REST/FHIR R4 financial settlement for apex medical colleges (`/api/v2/finance/claims`).
  - **ABDM National Health Claims Exchange (NHCX)**: Automated PM-JAY claim settlement gateway (`/gateway/snmmch/claims`).
  - **SAP Healthcare IS-H**: OData v4 / HL7 FHIR financial protocol for corporate/subsidized facilities (`/odata/v4/BillingService`).
  - **Jharkhand Health Cloud / JPFMS**: State treasury public financial management XML bridge (`/gateway/v1`).
- **Telemetry & Controls**: Live status pills (`[LIVE 24/7 AUTO-SYNC]`), latency ping tracker (19ms–38ms), real-time sync trigger (`handleTriggerErpSync`), and ERP configuration modal with live handshake testing.

---

## 8. Uber-Style 3D GIS Fleet CAD & Dijkstra Shortest Path Engine

- **3D Isometric Vehicle Animation**: Continuous 1.2s ticker calculating vehicle waypoint coordinates, directional heading (`Math.atan2(dLng, dLat)`), speed badges (54–68 km/h), roof emergency strobe lightbars, and radar halos.
- **Camera Auto-Framing**: `L.latLngBounds(routePolyline)` automatically fits map bounds with 65px padding whenever the active route updates.
- **Dijkstra Highway Corridor HUD**: Live telemetry strip displaying route coordinates, green wave signal preemption, distance, ETA, and ICU bed reservation status.

---

## 9. Role-Based Manual Data Entry Architecture (GitHub Release Ready)

- Equips TriageNet for public open-source distribution without pre-fetched mocks:
  - **Super Admin**: Register GeM bulk procurement rate contracts and adjust district budget allocations.
  - **District CMO**: Submit district emergency requisitions with P1/P2/P3 urgency and clinical justifications.
  - **Medical Superintendent**: Add and reconfigure hospital care ward bays and dedicated ventilator stations.
  - **Ambulance Dispatcher**: Manual 108 emergency call logger and vehicle dispatch console.

---

## 10. AI Automated Accident Hotspot Telemetry & Doctor Roster Matching Engine

- **Module**: `frontend/lib/accident-hotspots.ts`
- **Data Model**:
  - `AccidentHotspot`: Represents real-world high-collision zones (`lat, lng, monthlyAccidents, blackspotRanking, defaultIncident, defaultVitals, baseCorridorKm, defaultTrafficDelayMin, defaultTrafficLevel`).
  - `DoctorDutyInfo`: Details live surgeon roster state (`doctorName, specialty, department, status: 'READY_TRAUMA_BAY' | 'OCCUPIED_IN_OT' | 'NOT_AVAILABLE', experienceYears, pagerExtension, statusNote`).
  - `CandidateHospitalEvaluation`: Full multi-criteria evaluation object (`compositeScore, rankTier: 'FIRST_BEST' | 'SECOND_BEST' | 'THIRD_BEST' | 'ALTERNATIVE', effectiveEtaMin, doctorInfo, clinicalRationale`).
- **Scoring Weights Formula**:
  $$\text{CompositeScore} = \text{DoctorScore} (40\text{ pts}) + \text{ICUScore} (25\text{ pts}) + \text{ETAScore} (25\text{ pts}) + \text{LoadScore} (10\text{ pts})$$
  - Doctor Score: Ready = 40, Occupied in OT = 18, Unavailable = 5.
  - ICU Score: $\ge 3$ open = 25, 2 open = 18, 1 open = 10, 0 open = 0.
  - ETA Score: $\max(0, 25 - \text{effectiveEtaMin} \times 0.45)$.
  - Load Score: $\max(0, (\text{availGen} / \text{totalGen}) \times 10)$.

---

## 11. 108 Ambulance EMT In-Transit Mobile Architecture & Telemetry Bridge

- **Mobile Web App Route**: `frontend/app/ambulance/page.tsx` (`/ambulance`).
- **State Telemetry Bridge**: `frontend/lib/director-bridge.ts` using native browser `BroadcastChannel` (`triagenet_director_bridge`).
- **Supported Event Protocol**:
  - `TRIGGER_ACCIDENT_HOTSPOT`: Coordinates, incident nature, required specialist, traffic conditions, default vitals.
  - `UPDATE_PATIENT_VITALS`: In-transit telemetry stream (`spo2, heartRate, systolicBp, gcs, patientName, incidentNature`).
  - `SELECT_DESTINATION_HOSPITAL`: Locks selected route to target facility (`hospitalId, hospitalName, ambulanceNumber`).
  - `DISPATCH_AMBULANCE_FROM_MOBILE`: Authorizes ambulance mobilization and creates emergency token (`JH-108-MOBILE-XXXX`).
  - `TOGGLE_GREEN_WAVE`: Preempts traffic corridor signals to green, zeroing traffic delay factor and accelerating 3D vehicle progression.

## 12. Spatial Road-Snapped Vehicle Interpolation, Multi-Corridor Bypass & SVG Flow Waves

- **3D Isometric Van Geometry**: Rendered as a 28x54px isometric vector SVG in `leaflet-map.tsx`:
  - Aerodynamic cab hood, chassis shadow offset (`filter: drop-shadow(0 14px 10px rgba(0,0,0,0.45))`).
  - Roof lightbar with dual alternating red/blue high-intensity LED beacons and radial light halos.
  - Forward-facing parabolic headlight beams with amber/white gradient fill projected directly onto road geometry.
- **Swiggy / Domino's Road Path Splitting**:
  - Waypoints sourced from `primaryRouteWaypoints` and `bypassRouteWaypoints` in `accident-hotspots.ts`.
  - Polyline dynamically sliced at current vehicle position into `traveledPts` (rendered as dimmed `#94a3b8` 3px dashed line with 0.45 opacity) and `remainingPts` (rendered as 5px solid traffic-colored line with pulsing radiant glow).
- **Multi-Corridor Highway Bypass & Specialist Diversion Algorithms**:
  - `evaluateCandidateOptions` computes dual routes (Primary Highway vs Express Bypass), calculating distance and ETA delta.
  - When primary route delay exceeds 10 minutes, the algorithm evaluates secondary facilities with active ready specialist rosters, returning `diversionHospitalId`, `diversionHospitalName`, and `diversionTimeSavingsMin`.
- **Hardware-Accelerated SVG Dijkstra Topology Patient Flow**:
  - Active transfers and shortest paths utilize SVG `<animateMotion>` with staggered start times (`begin="0s"`, `begin="1.4s"`) to animate patient wave particles along transfer vectors without JavaScript main-thread re-render overhead.


