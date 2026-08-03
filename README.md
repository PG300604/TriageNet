<div align="center">

# 🏥 TriageNet

### AI-Powered Regional Hospital Triage & Resource Optimization System

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-6DB33F?logo=spring-boot)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/Python-ML_Pipeline-3776AB?logo=python)](https://python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An intelligent healthcare triage platform that uses **machine learning severity scoring**, **graph-based regional load balancing (Dijkstra)**, and **multi-resource clinical compatibility matching** to optimize patient intake, bed assignments, and inter-hospital referrals across a connected regional hospital network.

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [ML Pipeline](#ml-pipeline)
- [Screenshots](#screenshots)
- [Development Progress](#development-progress)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**TriageNet** is a full-stack healthcare operations platform designed as a **Final Year CSBS Project (PG300604)**. It simulates a regional hospital network where AI-driven algorithms autonomously manage patient triage, resource allocation, and inter-hospital transfers in real time.

The system connects **4 regional hospitals** via a weighted graph network, enabling Dijkstra shortest-path referrals when a facility faces capacity overflow — while simultaneously verifying that the destination hospital has the right **equipment** (ventilators, ICU beds) and **specialist physicians** (pulmonologist, cardiologist, trauma surgeon) for each patient's condition.

---

## Key Features

### 🧠 AI & ML Engine
| Feature | Description |
|---------|-------------|
| **ML Severity Scorer** | Logistic Regression model trained on clinical vitals (SpO₂, HR, BP, Temp, Resp Rate, Age) producing real-time 0–100 severity scores with Sigmoid(W·X + b) |
| **Sepsis Early Warning** | Automatic detection when SpO₂ < 90% and HR > 110 bpm with clinical alert propagation |
| **Explainable AI** | Top risk factor attribution with percentage breakdowns per patient |
| **Priority Decay** | Dynamic priority escalation combining acuity score with wait-time degradation |

### 🔗 Algorithmic Core
| Feature | Description |
|---------|-------------|
| **Dijkstra Regional Referrals** | Graph-weighted shortest-path inter-hospital transfers with real-time travel time computation |
| **Multi-Resource Clinical Matching** | 3-way verification: `Open Beds ∧ Equipment Match ∧ Specialist Available` before any assignment |
| **Hungarian Bed Assignment** | Optimal patient-to-bed matching considering severity and resource compatibility |
| **Auto-Play Simulation** | Continuous stress testing with random arrivals, preemption cycles, discharge events, and anomaly detection |

### 🖥️ Operations Dashboard
| Feature | Description |
|---------|-------------|
| **12 Operational Pages** | Dashboard, Patients, Triage Queue, Regional Network, AI CDS, Appointments, Clinical Operations, Billing & Revenue, Medical Records, Inventory & Supplies, Reports & Analytics, Communications |
| **Live Search & Notifications** | Global patient search with dropdown results + telemetry notification center |
| **Insurance Claims Workflow** | One-click claim approval with real-time revenue tracking |
| **Supply Reallocation** | Inter-hospital equipment transfer with one-click coordinator approval |
| **Dynamic Calendar** | Real-time date-aware appointment booking with future scheduling |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 · React 19 · Tailwind CSS v4 · GSAP · Lenis |
| **Backend** | Spring Boot 3.4 · Java 21 · Spring Security + JWT Auth |
| **ML Pipeline** | Python · scikit-learn · Logistic Regression |
| **Database** | PostgreSQL 16 (H2 in-memory for local dev) |
| **Infrastructure** | Docker Compose · Multi-container orchestration |
| **Design System** | Panacea Healthcare SaaS — Light clinical canvas with pastel risk badges |

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
│  │ (React)  │                │  (Java 21)   │          │
│  └────┬─────┘                └──────┬───────┘          │
│       │                             │                   │
│       │  ML Severity               │  JPA/Hibernate    │
│       │  Scorer (TS)               │                   │
│       │                       ┌────▼──────┐            │
│       │                       │ PostgreSQL │            │
│       │                       │   (prod)   │            │
│  ┌────▼─────────┐             │  H2 (dev)  │            │
│  │ Python ML    │             └────────────┘            │
│  │ Training     │                                       │
│  │ Pipeline     │                                       │
│  └──────────────┘                                       │
│                                                         │
│  ┌──────────────────────────────────────────┐           │
│  │     Regional Hospital Network Graph      │           │
│  │  City General ◄─8min─► Riverside Medical │           │
│  │       ▲                      ▲           │           │
│  │    15min                   10min         │           │
│  │       ▼                      ▼           │           │
│  │  St. Mary's ◄─12min─► North District    │           │
│  └──────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20.x
- **Java** 21+
- **Python** 3.10+ (for ML training only)
- **Docker** & **Docker Compose** (optional, for full stack)

### Quick Start (Frontend Only)

```bash
# Clone the repository
git clone https://github.com/<your-username>/TriageNet.git
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

## Project Structure

```
TriageNet/
├── frontend/                    # Next.js 16 Dashboard & Landing Page
│   ├── app/                     # App Router pages & layouts
│   ├── components/
│   │   ├── landing/             # Landing page components (Hero, Navbar, Features)
│   │   ├── triagenet/           # Dashboard components (12 operational views)
│   │   └── ui/                  # Reusable UI primitives (Button, Card, etc.)
│   └── lib/
│       ├── triage-data.ts       # Domain model, Dijkstra referrals, simulation engine
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

### Training
```bash
cd ml
pip install scikit-learn pandas numpy
python train_severity_model.py
```

---

## Development Progress

### ✅ Phase 1 — Frontend & ML Engine (Complete)
- [x] Panacea Healthcare SaaS design system (light clinical canvas)
- [x] Stylized TriageNet v2.0 branding
- [x] ML Severity Scorer (Logistic Regression)
- [x] All 12 sidebar operational pages
- [x] Dijkstra regional load-balancing referrals
- [x] Multi-resource clinical compatibility matching (Beds + Equipment + Specialists)
- [x] Continuous auto-play simulation with random arrivals & discharges
- [x] Interactive global search, notification center, and date-scoped calendar
- [x] One-click insurance claim approval & inter-hospital supply transfer
- [x] React duplicate key fix with timestamp-anchored unique IDs

### ✅ Phase 2 — Backend Scaffolding & Auth (Complete)
- [x] Spring Boot 3.4 project structure with JPA entities
- [x] PostgreSQL schema (Patient, Hospital, Resource, TransferRequest, etc.)
- [x] Spring Security + JWT authentication (register/login)
- [x] Docker Compose multi-container setup

### ✅ Phase 3 — Java Backend Core Engine & Advanced Algorithmic Triage (Complete)
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

### 🔲 Phase 4 — Production & Deployment
- [ ] End-to-End REST Client Integration (`frontend/lib/api.ts`)
- [ ] CI/CD pipeline
- [ ] Cloud deployment (AWS/GCP)
- [ ] Performance testing & optimization
- [ ] Final documentation & presentation

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

This project is developed as a Final Year CSBS Project (**PG300604**).

---

<div align="center">

**Built with ❤️ by Priyanshu Ghosh**

*CSBS Batch 2027 · Final Year Project*

</div>
