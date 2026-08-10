<div align="center">

# 🏥 TriageNet
### AI-powered state-wide emergency triage & spatial resource allocation platform for Jharkhand government healthcare

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?logo=spring-boot)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/Python-ML_Pipeline-3776AB?logo=python)](https://python.org/)
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
- [ML Research & Benchmarking](#ml-research--multi-dataset-benchmarking)
- [Development Progress](#development-progress)
- [License](#license)

---

## Overview

**TriageNet** is a state-wide emergency triage and hospital load-balancing platform designed as a **Final Year CSBS Project (PG300604)**. It connects **79 government healthcare facilities across all 24 districts of Jharkhand** (*Medical Colleges, Sadar Hospitals, Sub-Divisional Referral Centers, and CHCs*), enabling live spatial Dijkstra routing and traffic-aware ambulance dispatching when regional facilities face surge capacity overflow.

The platform combines **machine learning clinical severity scoring**, **Haversine & OpenRouteService (ORS) spatial distance matrices**, **Dijkstra shortest-path referral routing**, **Hungarian multi-resource compatibility matching**, and **6-role RBAC security controls**.

---

## Key Features

### 🧮 AI & ML Clinical Severity Engine
| Feature | Description |
|---------|-------------|
| **ML Severity Scorer** | Logistic Regression model trained on clinical vitals (SpO₂, HR, BP, Temp, Resp Rate, Age) producing real-time 0–100 severity scores with $\text{Sigmoid}(W \cdot X + b)$ |
| **Sepsis Early Warning** | Automatic alert triggering when SpO₂ < 90% and HR > 110 bpm with clinical risk propagation |
| **Explainable AI** | Top factor attribution with exact clinical weight contribution percentages per patient |
| **Dynamic Priority Heap** | Acuity score combined with wait-time decay ($E = S + \lambda \cdot W$) preventing queue starvation |

### 🗺️ OpenRouteService & Leaflet Spatial Routing
| Feature | Description |
|---------|-------------|
| **Haversine & ORS Distance Matrix** | Calculates real road driving distances (km) and travel durations (minutes) between patient/ambulance GPS coordinates and candidate hospitals |
| **Interactive Leaflet Map** | OpenStreetMap tile layer rendering color-coded hospital capacity markers (🟢 <60%, 🟡 60–80%, 🔴 >80% surge) across all 24 districts |
| **108 Ambulance Dispatcher** | Live ambulance location pin and animated polyline road routing to optimal referral destination |
| **24-District Segregation** | Statewide overview mode or district-specific filtering with facility tier locks (*TERTIARY, DISTRICT, SUB_DIVISIONAL, CHC*) |

### 🤖 Autonomous AI Agents & Financial Ledger
| Feature | Description |
|---------|-------------|
| **Autonomous 24/7 Telemetry** | Continuously monitors regional hospital bed and ICU capacity loads |
| **AI Supply Demand Agent** | Calculates dynamic equipment deficits during Mass Casualty vs Regional Surge scenarios |
| **AI Financial Recovery Agent** | Asset ledger tracking, maintenance expenses, and ₹12.80 Cr regional budget auto-reallocation in Indian Rupees (₹) |

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

- **Frontend**: Next.js 16 (Turbopack), React 19, TypeScript, TailwindCSS, Leaflet.js, Framer Motion, Anime.js, Lucide Icons
- **Backend**: Spring Boot 3.2.5, Java 17, Spring Data JPA, Spring Security, JWT, Jackson JSON Parser
- **Spatial Routing**: OpenRouteService (ORS) Matrix API, Haversine Geodesic Math, Dijkstra Shortest-Path Graph Engine
- **Database**: PostgreSQL (Production) / H2 In-Memory (Development & Test Profile)
- **Testing**: JUnit 5, MockMvc, Maven Surefire (14/14 passing integration test suites)

---

## Development Progress

### ✅ Phase 1 — Java Backend Core Engine & Jharkhand Data Seeding (Complete)
- [x] Java ML Severity Scorer ($\text{Sigmoid}(W \cdot X + b)$) with risk factor attributions
- [x] Dijkstra Router & Hungarian Multi-Resource Compatibility Matcher
- [x] Seeded 79 real government hospitals across all 24 districts of Jharkhand (`jharkhand-hospitals.json`)
- [x] JPA entities `District.java` and `Hospital.java` with facility tiers (*TERTIARY, DISTRICT, SUB_DIVISIONAL, CHC*)
- [x] REST APIs `/api/dashboard/state-overview` and `/api/dashboard/district/{name}`

### ✅ Phase 2 — Frontend Integration & 6-Role RBAC Portal (Complete)
- [x] Type-safe REST client (`frontend/lib/api-client.ts`)
- [x] 6-Role RBAC React AuthContext (`frontend/lib/auth-context.tsx`) with instant one-click demo presets
- [x] Panacea SaaS login portal (`frontend/app/login/page.tsx`) with light warm linen canvas and Walnut Shadow theme
- [x] RBAC navigation filtering (`sidebar.tsx`) and role context banner headers

### ✅ Phase 3 — OpenRouteService Spatial Routing & Interactive Maps (Complete)
- [x] `SpatialRoutingService.java` — Haversine road matrix + travel time estimation formula
- [x] `RoutingController.java` — `POST /api/routing/optimal` returning ranked hospital ETA, distance, and suitability score
- [x] `RoutingControllerTest.java` integration test suite (14/14 tests passing)
- [x] `leaflet-map.tsx` — Interactive OpenStreetMap with color-coded hospital markers and 108 ambulance dispatch overlays
- [x] 24-District Scope Selector & Block/Tier Filter bar with RBAC scope locks (`top-bar.tsx` & `regional-network-view.tsx`)

---

## Getting Started

### 1. Run Spring Boot Backend (Port 8080)
```powershell
cd backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

### 2. Run Next.js Frontend (Port 3000)
```powershell
cd frontend
npm run dev
```

### 🌐 Browser Links:
- **Panacea Login Portal**: [http://localhost:3000/login](http://localhost:3000/login)
- **TriageNet Command Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Spring Boot State Overview API**: [http://localhost:8080/api/dashboard/state-overview](http://localhost:8080/api/dashboard/state-overview)
- **H2 Web Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)

---

## License

This project is released under the [MIT License](LICENSE). Built by **Priyanshu Ghosh**, CSBS Batch 2027, Final Year CSBS Project (PG300604).
