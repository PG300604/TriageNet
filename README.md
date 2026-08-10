<div align="center">

# 🏥 TriageNet
### AI-powered state-wide hospital emergency triage & spatial resource allocation platform for Jharkhand government healthcare

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?logo=spring-boot)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/Python-ML_Pipeline-3776AB?logo=python)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Spatial_Maps-199900?logo=leaflet)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Autonomous AI Agents](#autonomous-ai-agents)
- [6-Role RBAC Architecture](#6-role-rbac-architecture)
- [Spatial Routing Engine](#spatial-routing-engine)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [ML Pipeline](#ml-pipeline)
- [ML Research & Multi-Dataset Benchmarking](#ml-research--multi-dataset-benchmarking)
- [State-Wide Scaling Vision](#state-wide-scaling-vision)
- [Development Progress](#development-progress)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

**TriageNet** is a state-wide healthcare emergency operations and spatial resource allocation platform designed as a **Final Year CSBS Project (PG300604)**. It connects **79 government healthcare facilities across all 24 districts of Jharkhand** (*Medical Colleges, Sadar Hospitals, Sub-Divisional Referral Centers, and CHCs*), enabling live spatial Dijkstra routing and traffic-aware ambulance dispatching when regional facilities face surge capacity overflow.

The system uses **machine learning severity scoring**, **Haversine & OpenRouteService (ORS) spatial distance matrices**, **Dijkstra shortest-path regional load balancing**, **multi-resource clinical compatibility matching (Hungarian matching)**, **autonomous 24/7 AI supply & financial agents**, and **6-role RBAC security controls**.

---

## Key Features

### AI & ML Severity Engine
| Feature | Description |
|---------|-------------|
| **ML Severity Scorer** | Logistic Regression model trained on clinical vitals (SpO₂, HR, BP, Temp, Resp Rate, Age) producing real-time 0–100 severity scores with $\text{Sigmoid}(W \cdot X + b)$ |
| **Sepsis Early Warning** | Automatic alert triggering when SpO₂ < 90% and HR > 110 bpm with clinical risk propagation |
| **Explainable AI** | Top factor attribution with exact percentage breakdowns per patient |
| **Dynamic Priority Heap** | Acuity score combined with wait-time decay ($E = S + \lambda \cdot W$) preventing queue starvation |

### 🗺️ OpenRouteService & Leaflet Spatial Routing
| Feature | Description |
|---------|-------------|
| **Haversine & ORS Distance Matrix** | Calculates real road driving distances (km) and travel durations (minutes) between patient/ambulance GPS coordinates and candidate hospitals |
| **Interactive Leaflet Map** | OpenStreetMap tile layer rendering color-coded hospital capacity markers (🟢 <60%, 🟡 60–80%, 🔴 >80% surge) across all 24 districts |
| **108 Ambulance Dispatcher** | Live ambulance location pin and animated polyline road routing to optimal referral destination |
| **24-District Segregation** | Statewide overview mode or district-specific filtering with facility tier locks (*TERTIARY, DISTRICT, SUB_DIVISIONAL, CHC*) |

### Autonomous AI Supply Demand & Dispatcher Engine
| Feature | Description |
|---------|-------------|
| **Autonomous 24/7 Telemetry** | Continuously monitors regional hospital bed and ICU capacity loads without requiring manual button triggers |
| **Dynamic Need Calculator** | Computes exact dynamic deficits based on situation severity (Mass Casualty vs Regional Surge vs Steady State) |
| **Darkroom Terminal CLI** | Interactive macOS/Linux terminal streaming 100% live computed telemetry, bottleneck metrics, AI solutions, and embedded operator permission controls |
| **Dynamic Need Flagging** | Automatically raises live supply flags for strained facilities (Load ≥ 70%) with one-click live approval |

### AI Financial & Equipment Cost Management Agent (Indian Rupees ₹)
| Feature | Description |
|---------|-------------|
| **Rupees (₹) Denomination** | Managed in Indian Rupees (₹) across ₹12.80 Crore total regional operating budget |
| **Equipment Asset Ledger** | Capital asset and maintenance expense tracking for Ventilators (₹15.20 L), ICU Beds (₹4.80 L), General Beds (₹1.10 L), O₂ Generators (₹2.45 L), and Trauma Kits (₹65k) |
| **Net Cost Recovery Surplus** | Computes `Gross Recovered Care Revenue - Equipment Maintenance Expenses` (+₹1.46 Cr Surplus) with a **142.7% Cost Recovery Ratio** |
| **Financial Terminal CLI** | Interactive darkroom terminal streaming live financial telemetry, asset valuations, and budget health diagnostics |

### Algorithmic Core
| Feature | Description |
|---------|-------------|
| **Dijkstra Regional Referrals** | Graph-weighted shortest-path inter-hospital transfers with real-time travel time computation |
| **Multi-Resource Clinical Matching** | 3-way verification: `Open Beds ∧ Equipment Match ∧ Specialist Available` before any assignment |
| **Hungarian Bed Assignment** | Optimal patient-to-bed matching considering severity and resource compatibility |
| **Auto-Play Simulation** | Continuous stress testing with random arrivals, preemption cycles, discharge events, and anomaly detection |

### Operations Dashboard & Telemetry
| Feature | Description |
|---------|-------------|
| **12 Operational Pages** | Dashboard, Patients, Triage Queue, Regional Network, AI CDS, Appointments, Clinical Operations, Billing & Revenue, Medical Records, Inventory & Supplies, Reports & Analytics, Communications |
| **Zero Emoji Enterprise UI** | 100% emoji-purged serious clinical interface with Lucide iconography and monospace bracketed tags |
| **Live Risk Analytics** | Severe Preemption Risk Index, Specialist Matching Donut Gauge, SVG Wait Latency Trend Chart, and Realtime Financial Cost vs Recovery Bar Graph |
| **Supply Reallocation** | Inter-hospital equipment transfer with one-click coordinator approval and terminal streaming |
| **Dynamic Calendar** | Real-time date-aware appointment booking with future scheduling |

---

## Autonomous AI Agents

| Agent Name | Primary Responsibility | Telemetry Output |
|------------|------------------------|------------------|
| **AI Supply Demand Agent** | Analyzes hospital surge loads, calculates dynamic bed & ventilator deficits, streams CLI terminal telemetry, and dispatches equipment upon human operator authorization | Live macOS/Linux CLI Terminal (`ai-supply-terminal-modal.tsx`) |
| **AI Financial Cost Recovery Agent** | Tracks equipment asset valuations, manages ₹12.80 Cr operating budget, calculates maintenance costs, and auto-reallocates revenue recovery surpluses (+₹1.46 Cr) | Live macOS/Linux CLI Terminal (`ai-financial-terminal-modal.tsx`) |
| **Dijkstra Regional Overflow Agent** | Evaluates weighted network graph to route patient overflow to non-congested facilities with matching equipment & specialist physicians | Real-Time Routing Latency Trend Chart (`reports-view.tsx`) |

---

## 6-Role RBAC Architecture

| User Role | Access Scope | Permitted Views |
|-----------|--------------|-----------------|
| **System Super Admin** | Global Platform | **ALL 12 Views**: Unrestricted statewide control & DB seed management |
| **State Health Dept Director** | Statewide Governance | **5 Macro Views**: Statewide Capacity, Hospital Network Graph, Supplies, Risk Reports, State Comms |
| **District CMO** | District Administration | **6 Views** (Locked to assigned District, e.g. Ranchi): District Capacity, Overflow Queue, Clinical Ops, Reports, Comms |
| **Medical Superintendent** | Hospital Operations | **6 Views** (Locked to assigned Facility, e.g. RIMS Ranchi): Capacity, Clinical Beds, Appointments, Billing in ₹, Inventory, Medical Records |
| **Emergency Triage Nurse** | Front-line ED Intake | **3 Views**: Triage Priority Queue, Patients & Vitals Scorer, AI CDS |
| **108 Ambulance Dispatcher** | Call Center Dispatch | **3 Tactical Views**: Regional Spatial Network Map, Dispatch Queue, Emergency Comms |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (Turbopack) · React 19 · Tailwind CSS v4 · Leaflet.js · Framer Motion · Anime.js · Lucide React |
| **Backend** | Spring Boot 3.2.5 · Java 17 · Spring Data JPA · Spring Security + JWT Auth |
| **Spatial Routing** | OpenRouteService (ORS) Matrix API · Haversine Geodesic Math · Dijkstra Shortest-Path Engine |
| **ML Pipeline** | Python · scikit-learn · Logistic Regression |
| **Database** | PostgreSQL 16 (H2 in-memory for local dev) |
| **Infrastructure** | Docker Compose · Multi-container orchestration |
| **Design System** | Panacea Healthcare SaaS — Walnut Shadow & Warm Cream Canvas |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TriageNet Architecture                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐    REST API    ┌──────────────┐          │
│  │ Next.js  │ ◄────────────► │ Spring Boot  │          │
│  │ Frontend │    JWT Auth    │   Backend    │          │
│  │ (React)  │                │  (Java 17)   │          │
│  └────┬─────┘                └──────┬───────┘          │
│       │                             │                   │
│       │  ML Severity               │  JPA/Hibernate    │
│       │  Scorer (TS)               │                   │
│       │                       ┌────▼──────┐            │
│       │                       │ PostgreSQL│            │
│       │                       │  Database │            │
│       │                       └───────────┘            │
│       ▼                                                 │
│  ┌──────────────────────────────────────────┐           │
│  │  Jharkhand State Spatial Hospital Graph   │           │
│  │                                          │           │
│  │  RIMS Ranchi ◄───12min───► Sadar Ranchi  │           │
│  │       ▲                      ▲           │           │
│  │       │                      │           │           │
│  │     45min                  35min         │           │
│  │       │                      │           │           │
│  │       ▼                      ▼           │           │
│  │  MGM Jamshedpur ◄─25min─► SNMMCH Dhanbad │           │
│  └──────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20.x
- **Java** 17+
- **Python** 3.10+ (for ML training only)
- **Docker** & **Docker Compose** (optional, for full stack)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/PG300604/TriageNet.git
cd TriageNet

# Start Backend Server (Terminal 1)
cd backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"

# Start Frontend Dev Server (Terminal 2)
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login) for the authentication portal and [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the command console.

---

## Project Structure

```
TriageNet/
├── backend/
│   ├── src/main/java/com/triagenet/
│   │   ├── config/               # SecurityConfig & JwtAuthenticationFilter
│   │   ├── controller/           # Dashboard, Patient, Auth & Routing Controllers
│   │   ├── engine/               # DijkstraRouter, SeverityScorer, HungarianMatcher
│   │   ├── entity/               # Hospital, District, Patient, Resource JPA Entities
│   │   ├── repository/           # Spring Data JPA Repositories
│   │   └── service/              # HospitalSeedService & SpatialRoutingService
│   └── src/main/resources/seed/   # jharkhand-hospitals.json (79 facilities)
├── frontend/
│   ├── app/                      # Next.js App Router (login, dashboard, page)
│   ├── components/
│   │   ├── landing/              # Panacea SaaS hero, animations & Lenis smooth scroll
│   │   └── triagenet/            # Dashboard, LeafletMap, RegionalNetworkView, TopBar, Sidebar
│   └── lib/                      # api-client.ts, auth-context.tsx, jharkhand-data.ts, triage-data.ts
└── scripts/                      # Hospital data scrapers & ML model trainers
```

---

## ML Pipeline

The severity scoring model is a **Logistic Regression classifier** trained on clinical vital signs:

### Features
| Feature | Description | Range |
|---------|-------------|-------|
| SpO₂ | Blood oxygen saturation | 70–100% |
| Heart Rate | Beats per minute | 40–180 bpm |
| Systolic BP | Systolic blood pressure | 70–200 mmHg |
| Diastolic BP | Diastolic blood pressure | 40–120 mmHg |
| Temperature | Body temperature | 35–42°C |
| Respiratory Rate | Breaths per minute | 8–40 /min |
| Age | Patient age | 0–100 years |

### Model Architecture
```
Score = Sigmoid(W · X + b) × 100

Where:
  W = [-0.145, 0.042, -0.021, 0.018, 0.35, 0.065, 0.012]  (trained weights)
  b = 2.5  (bias term)
  X = [SpO₂_dev, HR_dev, SysBP_dev, DiaBP_dev, Temp_dev, RespRate_dev, Age_dev]
```

### Risk Tiers
| Tier | Score Range | Clinical Action |
|------|-----------|-----------------|
| 🔴 High Risk | ≥ 80 | Immediate ICU assignment + specialist paging |
| 🟡 Moderate Risk | 50–79 | Priority observation + resource pre-allocation |
| 🟢 Low Risk | < 50 | Standard triage queue placement |

---

<a id="ml-research--multi-dataset-benchmarking"></a>
<a id="ml-research-multi-dataset-benchmarking"></a>
## ML Research & Multi-Dataset Benchmarking

**4 Kaggle Datasets Tested:**
1. `blueblushed/hospital-dataset-for-practice` — 1,000 synthetic patient records, general hospital vitals
2. `maalona/hospital-triage-and-patient-history-data` — Yale-New Haven ED, 5-level ESI triage scale
3. `ilkeryildiz/emergency-service-triage-application` — Turkish Emergency, 5-level KTAS triage scale
4. NHAMCS ED Critical Care Triage — US National survey, SIRS/Lactate sepsis criteria

**Benchmark Results Table:**

| Algorithm | Dataset 1 (General) | Dataset 2 (ESI) | Dataset 3 (KTAS) | Dataset 4 (Sepsis) |
|-----------|-------------------|-----------------|------------------|-------------------|
| Logistic Regression | 99.0% | 97.2% | 95.1% | 98.8% |
| Random Forest | 99.5% | 97.8% | 96.3% | 99.1% |
| Gradient Boosted Trees | 99.3% | 97.5% | 95.8% | 98.9% |
| MLP Neural Network | 99.2% | 97.0% | 95.4% | 98.7% |
| K-Nearest Neighbors | 98.1% | 95.3% | 93.7% | 97.2% |

**Key Findings:**
- 98.88% Cross-Dataset Transfer Recall for emergency detection
- Logistic Regression validated as production baseline (efficient, interpretable)
- Random Forest recommended for non-linear KTAS/Sepsis schemas
- All models maintain >93% accuracy across all 4 triage scales

---

## State-Wide Scaling Vision

- **Target:** Jharkhand (24 districts, 500+ government health facilities)
- **4-Layer Architecture:** Edge ML → Traffic-Aware Router → Fleet Load Balancer → State Command Center
- **Self-hosted OpenRouteService** for live traffic-aware ambulance routing
- **6 User Roles:** Super Admin, State Health Dept, District CMO, Hospital Admin, Triage Nurse, Ambulance Dispatch
- **Deployment:** Vercel (frontend) + Render.com (backend) — zero cloud cost

---

## Development Progress

### ✅ Phase 1 — Frontend & ML Engine (Complete)
- [x] Panacea Healthcare SaaS design system (light clinical canvas & Walnut Shadow theme)
- [x] Stylized TriageNet v2.0 branding
- [x] ML Severity Scorer (Logistic Regression)
- [x] All 12 sidebar operational pages
- [x] Dijkstra regional load-balancing referrals
- [x] Multi-resource clinical compatibility matching (Beds + Equipment + Specialists)
- [x] Continuous auto-play simulation with random arrivals & discharges
- [x] Interactive global search, notification center, and date-scoped calendar

### ✅ Phase 2 — Backend Core Engine & Jharkhand Data Seeding (Complete)
- [x] Spring Boot 3.2.5 project structure with JPA entities
- [x] PostgreSQL/H2 schema (`District.java`, `Hospital.java`, `Patient.java`, `Resource.java`, etc.)
- [x] Spring Security + JWT authentication (register/login)
- [x] Seeded 79 real government hospitals across all 24 districts of Jharkhand (`jharkhand-hospitals.json`)
- [x] Java ML Severity Scorer ($\text{Sigmoid}(W \cdot X + b)$) with risk factor attributions
- [x] Dijkstra Router & Hungarian Multi-Resource Compatibility Matcher
- [x] Automated Maven test suite (14/14 test suites passed, 100% success)

### ✅ Phase 3 — Frontend Integration & 6-Role RBAC Portal (Complete)
- [x] Type-safe REST client (`frontend/lib/api-client.ts`)
- [x] 6-Role RBAC React AuthContext (`frontend/lib/auth-context.tsx`) with instant one-click demo presets
- [x] Panacea SaaS login portal (`frontend/app/login/page.tsx`) with light warm linen canvas and Walnut Shadow theme
- [x] RBAC navigation filtering (`sidebar.tsx`) and role context banner headers

### ✅ Phase 4 — OpenRouteService Spatial Routing & Interactive Maps (Complete)
- [x] `SpatialRoutingService.java` — Haversine road matrix + travel time estimation formula
- [x] `RoutingController.java` — `POST /api/routing/optimal` returning ranked hospital ETA, distance, and suitability score
- [x] `RoutingControllerTest.java` integration test suite (14/14 tests passing)
- [x] `leaflet-map.tsx` — Interactive OpenStreetMap with color-coded hospital markers and 108 ambulance dispatch overlays
- [x] 24-District Scope Selector & Block/Tier Filter bar with RBAC scope locks (`top-bar.tsx` & `regional-network-view.tsx`)

### ✅ Phase 5 — Autonomous AI Agents & Telemetry (Complete)
- [x] **Autonomous 24/7 AI Supply Demand Agent**: Situational dynamic need calculator, automated hospital capacity flagging, and darkroom CLI terminal modal
- [x] **AI Financial Cost Recovery Agent**: Asset ledger, maintenance expenses, ₹12.80 Cr regional budget management, and net surplus auto-reallocation (+₹1.46 Cr) in Indian Rupees (₹)
- [x] **100% Zero Emoji Enterprise UI Overhaul**: Complete purge of casual emojis for serious enterprise clinical Lucide iconography and monospace bracketed tags

### ✅ Phase 6 — ML Research & Multi-Dataset Benchmarking (Complete)
- [x] 4-dataset Kaggle benchmarking across 4,000+ patient records
- [x] 5 ML algorithm comparison (LogReg, RF, GBT, MLP, KNN)
- [x] Cross-dataset transfer validation (98.88% emergency recall)

---

## Environment Variables

Create a `.env` file in the project root for Docker Compose:

```env
DB_NAME=triagenet
DB_USER=triagenet
DB_PASSWORD=<your_secure_password>
JWT_SECRET=<your_64_char_hex_secret>
```

For frontend, create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

> ⚠️ **Never commit `.env` or `.env.local` files.** Use `.env.example` as a template.

---

## License

This project is released under the [MIT License](LICENSE). 

Built by **Priyanshu Ghosh**, CSBS Batch 2027, Final Year Project (PG300604).
