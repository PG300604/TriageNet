<div align="center">

# 🏥 TriageNet
### AI-powered state-wide hospital emergency triage platform targeting Jharkhand government hospitals

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-6DB33F?logo=spring-boot)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/Python-ML_Pipeline-3776AB?logo=python)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Autonomous AI Agents](#autonomous-ai-agents)
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

## 🌍 Overview

**TriageNet** is a full-stack healthcare operations platform designed as a **Final Year CSBS Project (PG300604)**. It currently connects **4 regional hospitals** via a weighted graph network, enabling Dijkstra shortest-path referrals when a facility faces capacity overflow.

**Vision:** Scale to state-wide deployment across Jharkhand (24 districts, 500+ government health facilities).

The system uses **machine learning severity scoring**, **graph-based regional load balancing (Dijkstra)**, **multi-resource clinical compatibility matching (Hungarian matching)**, and **autonomous AI agents** to optimize patient intake, bed assignments, and inter-hospital referrals across the connected network.

---

## ✨ Key Features

### 🧠 AI & ML Engine
| Feature | Description |
|---------|-------------|
| **ML Severity Scorer** | Logistic Regression model trained on clinical vitals (SpO₂, HR, BP, Temp, Resp Rate, Age) producing real-time 0–100 severity scores with Sigmoid(W·X + b) |
| **Sepsis Early Warning** | Automatic detection when SpO₂ < 90% and HR > 110 bpm with clinical alert propagation |
| **Explainable AI** | Top risk factor attribution with percentage breakdowns per patient |
| **Priority Decay** | Dynamic priority escalation combining acuity score with wait-time degradation |

### 🤖 Autonomous AI Supply Demand & Dispatcher Engine
| Feature | Description |
|---------|-------------|
| **Autonomous 24/7 Telemetry** | Continuously monitors regional hospital bed and ICU capacity loads without requiring manual button triggers |
| **Dynamic Need Calculator** | Computes exact dynamic deficits based on situation severity (Mass Casualty vs Regional Surge vs Steady State) |
| **Darkroom Terminal CLI** | Interactive macOS/Linux terminal streaming 100% live computed telemetry, bottleneck metrics, AI solutions, and embedded operator permission controls |
| **Dynamic Need Flagging** | Automatically raises live supply flags for strained facilities (Load ≥ 70%) with one-click live approval |

### 💰 AI Financial & Equipment Cost Management Agent (Indian Rupees ₹)
| Feature | Description |
|---------|-------------|
| **Rupees (₹) Denomination** | Managed in Indian Rupees (₹) across ₹12.80 Crore total regional operating budget |
| **Equipment Asset Ledger** | Capital asset and maintenance expense tracking for Ventilators (₹15.20 L), ICU Beds (₹4.80 L), General Beds (₹1.10 L), O₂ Generators (₹2.45 L), and Trauma Kits (₹65k) |
| **Net Cost Recovery Surplus** | Computes `Gross Recovered Care Revenue - Equipment Maintenance Expenses` (+₹1.46 Cr Surplus) with a **142.7% Cost Recovery Ratio** |
| **Financial Terminal CLI** | Interactive darkroom terminal streaming live financial telemetry, asset valuations, and budget health diagnostics |

### 🔗 Algorithmic Core
| Feature | Description |
|---------|-------------|
| **Dijkstra Regional Referrals** | Graph-weighted shortest-path inter-hospital transfers with real-time travel time computation |
| **Multi-Resource Clinical Matching** | 3-way verification: `Open Beds ∧ Equipment Match ∧ Specialist Available` before any assignment |
| **Hungarian Bed Assignment** | Optimal patient-to-bed matching considering severity and resource compatibility |
| **Auto-Play Simulation** | Continuous stress testing with random arrivals, preemption cycles, discharge events, and anomaly detection |

### 🖥️ Operations Dashboard & Telemetry
| Feature | Description |
|---------|-------------|
| **12 Operational Pages** | Dashboard, Patients, Triage Queue, Regional Network, AI CDS, Appointments, Clinical Operations, Billing & Revenue, Medical Records, Inventory & Supplies, Reports & Analytics, Communications |
| **Zero Emoji Enterprise UI** | 100% emoji-purged serious clinical interface with Lucide iconography and monospace bracketed tags |
| **Live Risk Analytics** | Severe Preemption Risk Index, Specialist Matching Donut Gauge, SVG Wait Latency Trend Chart, and Realtime Financial Cost vs Recovery Bar Graph |
| **Supply Reallocation** | Inter-hospital equipment transfer with one-click coordinator approval and terminal streaming |
| **Dynamic Calendar** | Real-time date-aware appointment booking with future scheduling |

---

## 🤖 Autonomous AI Agents

| Agent Name | Primary Responsibility | Telemetry Output |
|------------|------------------------|------------------|
| **AI Supply Demand Agent** | Analyzes hospital surge loads, calculates dynamic bed & ventilator deficits, streams CLI terminal telemetry, and dispatches equipment upon human operator authorization | Live macOS/Linux CLI Terminal (`ai-supply-terminal-modal.tsx`) |
| **AI Financial Cost Recovery Agent** | Tracks equipment asset valuations, manages ₹12.80 Cr operating budget, calculates maintenance costs, and auto-reallocates revenue recovery surpluses (+₹1.46 Cr) | Live macOS/Linux CLI Terminal (`ai-financial-terminal-modal.tsx`) |
| **Dijkstra Regional Overflow Agent** | Evaluates weighted network graph to route patient overflow to non-congested facilities with matching equipment & specialist physicians | Real-Time Routing Latency Trend Chart (`reports-view.tsx`) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (Turbopack) · React 19 · Tailwind CSS v4 · Framer Motion · Lucide React |
| **Backend** | Spring Boot 3.4 · Java 21 · Spring Security + JWT Auth |
| **ML Pipeline** | Python · scikit-learn · Logistic Regression |
| **Routing** | OpenRouteService (Planned) |
| **Database** | PostgreSQL 16 (H2 in-memory for local dev) |
| **Infrastructure** | Docker Compose · Multi-container orchestration |
| **Design System** | Panacea Healthcare SaaS — Walnut Shadow & Warm Cream Canvas |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TriageNet Architecture                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐    REST API    ┌──────────────┐          │
│  │ Next.js  │ ◄────────────► │ Spring Boot  │          │
│  │ Frontend │    JWT Auth    │   Backend    │          │
│  │ (React)  │                │  (Java 21)   │          │
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
│  │     Weighted Regional Hospital Graph     │           │
│  │                                          │           │
│  │   City General ◄───8min───► Riverside    │           │
│  │       ▲                      ▲           │           │
│  │       │                      │           │           │
│  │     15min                  10min         │           │
│  │       │                      │           │           │
│  │       ▼                      ▼           │           │
│  │  St. Mary's ◄─12min─► North District    │           │
│  └──────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.x
- **Java** 21+
- **Python** 3.10+ (for ML training only)
- **Docker** & **Docker Compose** (optional, for full stack)

### Quick Start (Frontend Only)

```bash
# Clone the repository
git clone https://github.com/PG300604/TriageNet.git
cd TriageNet

# Install frontend dependencies
cd frontend
npm install

# Create local environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page and [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the operational console.

### Full Stack (Docker Compose)

```bash
# From project root
docker-compose up --build
```

This starts PostgreSQL, Spring Boot backend, and Next.js frontend.

### Backend Only

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

---

## 📂 Project Structure

```
TriageNet/
├── frontend/                    # Next.js 16 Dashboard & Landing Page
│   ├── app/                     # App Router pages & layouts
│   ├── components/
│   │   ├── landing/             # Landing page components (Hero, Navbar, Features)
│   │   ├── triagenet/           # Dashboard components (12 operational views + AI Terminals)
│   │   └── ui/                  # Reusable UI primitives (Button, Card, etc.)
│   └── lib/
│       ├── triage-data.ts       # Domain model, Dijkstra referrals, simulation engine, dynamic supply need
│       ├── ml-severity-scorer.ts # ML Logistic Regression severity scorer (TypeScript)
│       └── utils.ts             # Utility functions
│
├── backend/                     # Spring Boot 3.4 REST API
│   └── src/main/java/com/triagenet/
│       ├── config/              # Spring Security + JWT filters
│       ├── controller/          # REST controllers (Auth, Patients, Hospitals)
│       ├── entity/              # JPA entities (Patient, Hospital, Resource, etc.)
│       ├── repository/          # Spring Data JPA repositories
│       ├── service/             # Business logic services
│       └── util/                # JWT utility
│
├── ml/                          # Python ML Training Pipeline
│   ├── train_severity_model.py  # Logistic Regression model training script
│   ├── benchmark/               # Multi-dataset benchmarking files
│   └── README.md                # ML pipeline documentation
│
├── Essentials/                  # Project Documentation
│   ├── PRD.md                   # Product Requirements Document
│   ├── TRD.md                   # Technical Requirements Document
│   ├── ERD.md                   # Entity Relationship Diagram
│   ├── brain.md                 # AI Architecture & Algorithm Design
│   └── instructions.md          # Development workflow instructions
│
├── docker-compose.yml           # Multi-container orchestration
├── DESIGN.md                    # UI/UX Design System Documentation
├── DECISIONS.md                 # Architecture Decision Records
└── .gitignore                   # Comprehensive ignore rules
```

---

## 📊 ML Pipeline

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

### Training
```bash
cd ml
pip install scikit-learn pandas numpy
python train_severity_model.py
```

---

## 🔬 ML Research & Multi-Dataset Benchmarking

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

**Strengths Identified:**
- Emergency detection recall near-perfect (98.88% cross-system)
- Works across ESI, KTAS, SIRS scales without retraining
- Logistic Regression runs in O(d) time, suitable for edge deployment

**Weaknesses Identified:**
- Moderate-severity middle tier has lower precision (~85%)
- Single-feature reliance (SpO2 dominates 40%+ weight)
- No temporal/longitudinal patient history modeling yet

---

## 🗺️ State-Wide Scaling Vision

- **Target:** Jharkhand (24 districts, 500+ government health facilities)
- **4-Layer Architecture:** Edge ML → Traffic-Aware Router → Fleet Load Balancer → State Command Center
- **Self-hosted OpenRouteService** for live traffic-aware ambulance routing
- **6 User Roles:** Super Admin, State Health Dept, District CMO, Hospital Admin, Triage Nurse, Ambulance Dispatch
- **Deployment:** Vercel (frontend) + Render.com (backend) — zero cloud cost

---

## 📈 Development Progress

### ✅ Phase 1 — Frontend & ML Engine (Complete)
- [x] Panacea Healthcare SaaS design system (light clinical canvas & Walnut Shadow theme)
- [x] Stylized TriageNet v2.0 branding
- [x] ML Severity Scorer (Logistic Regression)
- [x] All 12 sidebar operational pages
- [x] Dijkstra regional load-balancing referrals
- [x] Multi-resource clinical compatibility matching (Beds + Equipment + Specialists)
- [x] Continuous auto-play simulation with random arrivals & discharges
- [x] Interactive global search, notification center, and date-scoped calendar
- [x] React duplicate key fix with timestamp-anchored unique IDs

### ✅ Phase 2 — Backend Scaffolding & Auth (Complete)
- [x] Spring Boot 3.4 project structure with JPA entities
- [x] PostgreSQL schema (Patient, Hospital, Resource, TransferRequest, etc.)
- [x] Spring Security + JWT authentication (register/login)
- [x] Docker Compose multi-container setup

### ✅ Phase 3 — Java Backend Core Engine (Complete)
- [x] `SeverityScorer.java` — Java ML Logistic Regression model ($\text{Sigmoid}(W \cdot X + b)$) with risk factor attributions
- [x] `DijkstraRouter.java` — Graph shortest-path referral routing across regional hospital nodes
- [x] `HungarianMatcher.java` — 3-way multi-resource clinical compatibility evaluator ($\text{Beds} \land \text{Equipment} \land \text{Specialist}$)
- [x] `TriageQueueService.java` — Priority heap queue with dynamic priority decay ($E = S + \lambda \cdot W$)
- [x] `PatientService`, `HospitalService`, `ReferralService` — Full JPA persistence & business logic services
- [x] REST API Controllers (`/api/patients`, `/api/hospitals`, `/api/triage-queue`, `/api/resources`)
- [x] Automated Maven test suite (8 test suites passed, 100% success)
- [x] Bed Stratification (ICU Beds vs General Ward Beds)
- [x] Disease-Specific ICU Recovery Thresholds ($S < 65$ Respiratory, $S < 70$ Cardiac, $S < 74$ Trauma)
- [x] Non-Preemptible Critical Occupancy Lock ($S \ge 85$) & Emergency Overflow Holding
- [x] Automatic Bed Release & Re-Assignment on Discharge
- [x] On-Call Specialist Doctor Availability Rosters (Pulmonologist, Cardiologist, Trauma Surgeon)
- [x] High-Contrast Accessible UI Styling for System Banners & Triage Action Controls

### ✅ Phase 4 — Autonomous AI Agents & Telemetry (Complete)
- [x] **Autonomous 24/7 AI Supply Demand Agent**: Situational dynamic need calculator, automated hospital capacity flagging, and darkroom CLI terminal modal
- [x] **AI Financial Cost Recovery Agent**: Equipment asset ledger, maintenance expense tracking, ₹12.80 Cr regional budget management, and net surplus auto-reallocation (+₹1.46 Cr) in Indian Rupees (₹)
- [x] **Realtime Telemetry Dashboards**: SVG Queue Wait Latency Trend, Regional Acuity Distribution, Specialist Matching Donut, and Realtime Financial Cost vs Recovery Bar Graph
- [x] **100% Zero Emoji Enterprise UI Overhaul**: Complete purge of casual emojis for serious enterprise clinical Lucide iconography and monospace bracketed tags

### ✅ Phase 5 — ML Research & Multi-Dataset Benchmarking (Complete)
- [x] 4-dataset Kaggle benchmarking across 4,000+ patient records
- [x] 5 ML algorithm comparison (LogReg, RF, GBT, MLP, KNN)
- [x] Cross-dataset transfer validation (98.88% emergency recall)
- [x] Strengths/weaknesses analysis and model selection report
- [x] Production model weight export and validation

### ✅ Phase 6 — State-Wide Scaling Architecture & Planning (Complete)
- [x] Jharkhand state-wide deployment architecture design
- [x] Self-hosted OpenRouteService integration plan
- [x] 6-role RBAC access control design
- [x] Free-tier deployment strategy (Vercel + Render.com)
- [x] Phase-wise implementation roadmap (18-week plan)

### 🔲 Phase 7 — Production Backend & Database Integration (Planned)
- [ ] PostgreSQL + Redis database integration
- [ ] Frontend-Backend REST API wiring
- [ ] OpenRouteService self-hosted Docker setup
- [ ] WebSocket real-time capacity telemetry
- [ ] Jharkhand hospital data scraping & seeding
- [ ] Render.com + Vercel deployment

---

## 🔒 Environment Variables

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

## 📄 License

This project is released under the [MIT License](LICENSE). 

Built by **Priyanshu Ghosh**, CSBS Batch 2027, Final Year Project (PG300604).
