<div align="center">

<img src="frontend/public/triagenet-logo.png" alt="TriageNet Official Logo" width="120" height="120" style="border-radius: 24px;" />

# TriageNet

### AI-powered state-wide hospital emergency triage & spatial resource allocation platform for Jharkhand government healthcare

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.2-6DB33F?logo=spring-boot)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/Python-ML_Pipeline-3776AB?logo=python)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Spatial_Maps-199900?logo=leaflet)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Component Architecture Diagram](#component-architecture-diagram)
- [Data Flow Diagrams](#data-flow-diagrams)
- [Use Case Diagrams](#use-case-diagrams)
- [Autonomous AI Agents](#autonomous-ai-agents)
- [6-Role RBAC Architecture](#6-role-rbac-architecture)
- [Spatial Routing Engine](#spatial-routing-engine)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [ML Pipeline](#ml-pipeline)
- [ML Research & Multi-Dataset Benchmarking](#ml-research--multi-dataset-benchmarking)
- [State-Wide Scaling Vision](#state-wide-scaling-vision)
- [Development Progress](#development-progress)
- [User Onboarding Guide](#user-onboarding-guide)
- [Multi-Phase Strategic Roadmap & Architecture](ROADMAP.md)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

**TriageNet** is an AI-powered emergency triage and spatial resource coordination platform engineered for statewide healthcare operations across Jharkhand. Connecting **111 government healthcare facilities across all 24 districts** (*Medical Colleges, Sadar Hospitals, Sub-Divisional Centers, and CHCs*), it bridges frontline clinical intake with state-level disaster and surge governance.

### Core Capabilities at a Glance
- **AI Clinical Severity Scoring**: Real-time logistic regression inference trained on clinical vitals with explainable factor attribution and sepsis early warning alerts.
- **GIS Spatial Routing & 108 Fleet Command**: Live Dijkstra shortest-path load balancing, authentic GPS hospital positioning, 3-tier surge capacity visual hierarchy, and multi-ambulance fleet tracking with coverage zones.
- **Multi-Resource Clinical Matching**: 3-constraint Hungarian verification (`Available Bed ∧ Equipment Match ∧ Specialist On-Duty`) with 1-click bed pre-booking tokens (`#JH-108-DISPATCH-XXXX`).
- **3-Tier Role-Scoped Governance**: Hierarchical operational workflows and budget allocations tailored for State Health Command, District CMOs, and Hospital Superintendents, supported by zero-email offline cryptographic authentication (TOTP + BIP-39).

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
| **Multi-Ambulance Fleet Command** | 6-unit ALS/BLS fleet with real GPS coordinates, operational coverage circles (20–35 km), status-based coloring, fleet filter pills, and interactive telemetry drawers with vitals HUD and crew roster |
| **24-District Segregation** | Statewide overview mode or district-specific filtering with facility tier locks (*TERTIARY, DISTRICT, SUB_DIVISIONAL, CHC*) |

### 108 Ambulance Tactical Command System
| Feature | Description |
|---------|-------------|
| **Incident Intake Console** | Select incident types (NH-33 collision, coal mine collapse, chemical blast, acute STEMI), patient info, and vehicle units |
| **Multi-Criteria Dijkstra Scoring** | Dynamically scores candidate hospitals on road ETA, ICU beds, ventilators, and trauma surgeons |
| **1-Click Bed Pre-Booking** | Generates dispatch token `#JH-108-DISPATCH-XXXX`, reserves ICU bed, injects patient into receiving triage queue |
| **In-Flight Fleet Telemetry** | Live countdown timer and arrival bed handover action |

### 3-Tier Inventory & Supplies Governance
| Feature | Description |
|---------|-------------|
| **State Health Command Tier** | District-wise budget allocation, bulk GeM procurement contracts, statewide shortage trend aggregation |
| **District CMO Tier** | Equitable hospital share distribution, inter-facility equipment rebalancing, district emergency reserve management |
| **Hospital Admin Tier** | Department-level budget allocation (ICU, Trauma, Wards), equipment maintenance tracking, frontline shortage incident logging |
| **AI Predictive Pre-Fetch Engine** | Correlates shortage reports with incoming 108 admissions and historical patterns to recommend proactive inventory mobilization before bottlenecks |
| **Pill-Based Approval System** | Modern modal-based approval workflow replacing legacy terminal CLI — inspect details and approve/reject with a single click |

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

## System Architecture

### High-Level Architecture Diagram

```mermaid
flowchart TB
    subgraph Client["🖥️ Next.js 16 Frontend — TypeScript / Tailwind CSS v4"]
        Landing["Landing Page<br/>(Hero, ECG Waveform, Algorithm Showcase)"]
        AuthUI["Role-Based Login Portal<br/>(6 Preset RBAC Roles)"]
        Dashboard["Command Dashboard Controller<br/>(dashboard.tsx)"]
        subgraph Views["12 Operational Domain Views"]
            QueueView["Triage Queue<br/>(Priority Heap E=S+λW)"]
            NetView["Regional Network<br/>(Leaflet GIS + Dijkstra SVG)"]
            CapView["Capacity &<br/>Bed Operations"]
            PatView["Patient Records<br/>& ML Scorer"]
            AICDSView["AI Clinical<br/>Decision Support"]
            DispatchView["108 Ambulance<br/>Tactical Command"]
            BillingView["Billing &<br/>Revenue (₹)"]
            ReportsView["Risk Telemetry<br/>& Analytics"]
        end
        ClientLib["Client State Engine<br/>(triage-data.ts / jharkhand-data.ts / api-client.ts)"]
    end

    subgraph Backend["☕ Spring Boot 3.2.5 Backend — Java 17"]
        Security["Spring Security<br/>+ JWT Auth Filter"]
        subgraph Controllers["REST API Controllers"]
            AuthCtrl["/api/auth"]
            QueueCtrl["/api/triage-queue"]
            RoutingCtrl["/api/routing"]
            HospCtrl["/api/hospitals"]
            DashCtrl["/api/dashboard"]
            PatCtrl["/api/patients"]
            ResCtrl["/api/resources"]
        end
        subgraph Engines["⚙️ Algorithmic Engines"]
            MLScorer["SeverityScorer<br/>(Logistic Regression)"]
            HeapEngine["Priority Heap<br/>(S + λ × W)"]
            Dijkstra["DijkstraRouter<br/>(Shortest Path)"]
            Hungarian["HungarianMatcher<br/>(Bed+Equip+Specialist)"]
        end
        subgraph DataLayer["💾 JPA Repositories + PostgreSQL"]
            DistRepo["Districts (24)"]
            HospRepo["Hospitals (111)"]
            PatRepo["Patients & Vitals"]
            EdgeRepo["Hospital Road Edges"]
            ResRepo["Resources & Equipment"]
        end
    end

    Landing --> AuthUI --> Dashboard
    Dashboard --> Views
    Views --> ClientLib
    ClientLib <== "REST API / JSON<br/>Bearer JWT" ==> Security
    Security --> Controllers
    Controllers --> Engines
    Engines --> DataLayer

    style Client fill:#fdf8f0,stroke:#382416,color:#2c1b0e
    style Backend fill:#f0f4f8,stroke:#1e3a5f,color:#1e3a5f
    style Engines fill:#fff3e0,stroke:#dc5000,color:#382416
    style DataLayer fill:#e8f5e9,stroke:#2e7d32,color:#1b5e20
```

---

## Component Architecture Diagram

### Frontend Component Hierarchy

```mermaid
graph TD
    RootLayout["app/layout.tsx<br/>(AuthProvider + ThemeProvider + SEO Metadata)"]

    RootLayout --> LandingPage["app/page.tsx — Landing Page"]
    RootLayout --> LoginPage["app/login/page.tsx — Staff Authentication"]
    RootLayout --> DashPage["app/dashboard/page.tsx — Command Console"]

    LandingPage --> Navbar["navbar.tsx"]
    LandingPage --> Hero["hero.tsx + ECG Waveform"]
    LandingPage --> StatsBand["stats-band.tsx"]
    LandingPage --> ProblemSec["problem-section.tsx"]
    LandingPage --> AlgoShowcase["algorithm-showcase.tsx"]
    LandingPage --> GraphShowcase["interactive-graph-showcase.tsx"]
    LandingPage --> HowItWorks["how-it-works-pinned.tsx"]
    LandingPage --> CTAFooter["cta-footer.tsx"]

    DashPage --> DashController["dashboard.tsx — View Router"]

    DashController --> Sidebar["sidebar.tsx<br/>(RBAC Nav Filter)"]
    DashController --> TopBar["top-bar.tsx<br/>(Scenario Switch + Clock)"]

    DashController --> CapacityView["capacity-view.tsx"]
    DashController --> PatientsView["patients-view.tsx"]
    DashController --> TriageQueue["triage-queue-view.tsx"]
    DashController --> RegionalNet["regional-network-view.tsx"]
    DashController --> AICDSView["aicds-view.tsx"]
    DashController --> AppointView["appointments-view.tsx"]
    DashController --> ClinicalView["clinical-view.tsx"]
    DashController --> BillingView["billing-view.tsx"]
    DashController --> DocsView["docs-view.tsx"]
    DashController --> SuppliesView["supplies-view.tsx"]
    DashController --> ReportsView["reports-view.tsx"]
    DashController --> CommsView["comms-view.tsx"]

    RegionalNet --> LeafletMap["leaflet-map.tsx<br/>(OpenStreetMap + Markers)"]
    RegionalNet --> DijkstraSVG["Dijkstra SVG Topology Graph"]
    RegionalNet --> AmbulanceCmd["108 Tactical Command Console"]

    DashController --> AISupplyModal["ai-supply-terminal-modal.tsx"]
    DashController --> AIFinModal["ai-financial-terminal-modal.tsx"]

    subgraph LibLayer["📚 Core Libraries (frontend/lib/)"]
        TriageData["triage-data.ts<br/>(State Engine + Algorithms)"]
        JharkhandData["jharkhand-data.ts<br/>(111 Hospitals × 24 Districts)"]
        APIClient["api-client.ts<br/>(REST + JWT)"]
        AuthCtx["auth-context.tsx<br/>(6-Role RBAC)"]
        MLScorer["ml-severity-scorer.ts<br/>(Logistic Regression)"]
    end

    DashController --> TriageData
    DashController --> JharkhandData
    DashController --> APIClient
    DashController --> AuthCtx
    TriageQueue --> MLScorer

    style RootLayout fill:#382416,stroke:#382416,color:#ffedd7
    style DashController fill:#dc5000,stroke:#dc5000,color:#fff
    style LibLayer fill:#f5f0e8,stroke:#6c5f51,color:#382416
```

### Backend Package Architecture

```mermaid
graph TD
    App["TriageNetApplication.java<br/>(Spring Boot Entry)"]

    App --> ConfigPkg["config/"]
    App --> CtrlPkg["controller/"]
    App --> EnginePkg["engine/"]
    App --> EntityPkg["entity/"]
    App --> RepoPkg["repository/"]
    App --> ServicePkg["service/"]

    ConfigPkg --> SecConfig["SecurityConfig.java"]
    ConfigPkg --> JWTFilter["JwtAuthenticationFilter.java"]
    ConfigPkg --> UserDetails["CustomUserDetails.java"]

    CtrlPkg --> AuthCtrl["AuthController<br/>/api/auth"]
    CtrlPkg --> DashCtrl["DashboardController<br/>/api/dashboard"]
    CtrlPkg --> HospCtrl["HospitalController<br/>/api/hospitals"]
    CtrlPkg --> PatCtrl["PatientController<br/>/api/patients"]
    CtrlPkg --> RefCtrl["ReferralController<br/>/api/referrals"]
    CtrlPkg --> ResCtrl["ResourceController<br/>/api/resources"]
    CtrlPkg --> RouteCtrl["RoutingController<br/>/api/routing"]
    CtrlPkg --> QueueCtrl["TriageQueueController<br/>/api/triage-queue"]

    EnginePkg --> DijkstraR["DijkstraRouter.java"]
    EnginePkg --> HungarianM["HungarianMatcher.java"]
    EnginePkg --> SevScorer["SeverityScorer.java"]

    ServicePkg --> AuthSvc["AuthService"]
    ServicePkg --> HospSeedSvc["HospitalSeedService"]
    ServicePkg --> HospSvc["HospitalService"]
    ServicePkg --> PatSvc["PatientService"]
    ServicePkg --> RefSvc["ReferralService"]
    ServicePkg --> SpatialSvc["SpatialRoutingService"]
    ServicePkg --> QueueSvc["TriageQueueService"]

    EntityPkg --> Hospital["Hospital.java"]
    EntityPkg --> District["District.java"]
    EntityPkg --> Patient["Patient.java"]
    EntityPkg --> Resource["Resource.java"]
    EntityPkg --> HospEdge["HospitalEdge.java"]
    EntityPkg --> StaffUser["StaffUser.java"]

    CtrlPkg --> ServicePkg
    ServicePkg --> EnginePkg
    ServicePkg --> RepoPkg
    RepoPkg --> EntityPkg

    style App fill:#6DB33F,stroke:#6DB33F,color:#fff
    style EnginePkg fill:#fff3e0,stroke:#dc5000,color:#382416
    style CtrlPkg fill:#e3f2fd,stroke:#1565c0,color:#0d47a1
    style ServicePkg fill:#fce4ec,stroke:#c62828,color:#b71c1c
```

---

## Data Flow Diagrams

### DFD Level 0 — Context Diagram

```mermaid
flowchart LR
    Nurse(("👩‍⚕️ Triage Nurse"))
    CMO(("🏛️ District CMO"))
    Dispatcher(("🚑 108 Dispatcher"))
    Admin(("🔧 Super Admin"))

    System["TriageNet<br/>Healthcare Platform"]

    Nurse -- "Patient Vitals &<br/>Intake Data" --> System
    System -- "ML Severity Score &<br/>Bed Assignment" --> Nurse

    CMO -- "District Filter &<br/>Capacity Query" --> System
    System -- "District Telemetry &<br/>Risk Reports" --> CMO

    Dispatcher -- "Incident Details &<br/>Vehicle Selection" --> System
    System -- "Optimal Hospital Route &<br/>Bed Pre-Booking Token" --> Dispatcher

    Admin -- "Seed Data &<br/>Configuration" --> System
    System -- "System-Wide<br/>Analytics" --> Admin
```

### DFD Level 1 — Major Subsystems

```mermaid
flowchart TB
    ExternalUser(("Staff User"))

    subgraph P1["1.0 Authentication"]
        Auth["JWT Login &<br/>Role Assignment"]
    end

    subgraph P2["2.0 Patient Intake & Triage"]
        Intake["Vitals Collection"]
        ML["ML Severity<br/>Scoring Engine"]
        Heap["Priority Heap<br/>Queue Manager"]
    end

    subgraph P3["3.0 Resource Allocation"]
        Hungarian["Hungarian<br/>Clinical Matcher"]
        BedAssign["Bed & Equipment<br/>Assignment"]
    end

    subgraph P4["4.0 Spatial Routing & Transfer"]
        Dijkstra["Dijkstra<br/>Shortest Path"]
        Dispatch["108 Ambulance<br/>Dispatcher"]
        GIS["Leaflet GIS<br/>Map Renderer"]
    end

    subgraph P5["5.0 Telemetry & Reporting"]
        Supply["AI Supply<br/>Demand Agent"]
        Finance["AI Financial<br/>Recovery Agent"]
        Reports["Risk Analytics<br/>Dashboard"]
    end

    subgraph DS["Data Stores"]
        D1[("D1: Hospitals<br/>(111 Facilities)")]
        D2[("D2: Patients<br/>& Vitals")]
        D3[("D3: District<br/>Graph Edges")]
        D4[("D4: Resources<br/>& Equipment")]
    end

    ExternalUser --> P1
    P1 --> P2
    P2 --> P3
    P3 --> P4
    P4 --> P5

    Intake --> ML --> Heap
    Heap --> Hungarian --> BedAssign

    Heap -- "Overflow" --> Dijkstra
    Dijkstra --> Dispatch --> GIS

    BedAssign --> D4
    ML --> D2
    Dijkstra --> D3
    Dispatch --> D1

    Supply --> D1
    Supply --> D4
    Finance --> D4
    Reports --> D2

    style P2 fill:#fff8e1,stroke:#f57f17,color:#382416
    style P3 fill:#e8f5e9,stroke:#2e7d32,color:#1b5e20
    style P4 fill:#e3f2fd,stroke:#1565c0,color:#0d47a1
    style P5 fill:#fce4ec,stroke:#c62828,color:#b71c1c
```

### DFD Level 2 — Patient Triage Pipeline (Detailed)

```mermaid
sequenceDiagram
    autonumber
    actor Nurse as Triage Nurse / ED Staff
    participant UI as Triage Queue View
    participant ML as ML Severity Engine
    participant Heap as Priority Heap Engine
    participant Hungarian as Hungarian Matcher
    participant Dijkstra as Dijkstra Network Router
    participant Ambulance as 108 Dispatch Console

    Nurse->>UI: Enter Patient Vitals (SpO₂, HR, BP, RR, Temp, Age)
    UI->>ML: Evaluate Vitals Feature Vector
    ML-->>UI: Return Acuity Score (0-100) + Sepsis Alert + Risk Factors

    UI->>Heap: Insert Patient into Priority Heap (E = S + λ × W)
    Note over Heap: Dynamic re-ranking every<br/>simulation tick to prevent<br/>queue starvation

    alt Local Bed & Equipment Available
        Heap->>Hungarian: Verify 3-Constraint Match (Bed ∧ Equipment ∧ Specialist)
        Hungarian-->>UI: ✅ Direct Bed Assignment Confirmed
        UI-->>Nurse: Patient assigned to Bed / ICU
    else Local ED Saturated or Equipment Unavailable
        Heap->>Dijkstra: Calculate Optimal Transfer Target Hospital
        Dijkstra-->>UI: Recommended Facility + ETA + Shortest Route
        UI->>Ambulance: Trigger 108 Dispatch with Bed Pre-Booking
        Ambulance-->>Nurse: Dispatch Token #JH-108-XXXX Generated
    end
```

### 108 Ambulance Dispatch — 4-Stage Golden Hour Flow

```mermaid
flowchart LR
    subgraph Stage1["Stage 1: Incident Intake"]
        S1A["Select Incident Type<br/>(NH-33 Collision, STEMI, etc.)"]
        S1B["Enter Patient Details<br/>& Tune Live Vitals"]
        S1C["Select ALS/BLS<br/>Vehicle Unit"]
    end

    subgraph Stage2["Stage 2: Hospital Scoring"]
        S2A["Dijkstra Multi-Criteria<br/>Score Computation"]
        S2B["Rank Hospitals by<br/>ETA + ICU + Ventilators<br/>+ Trauma Surgeons"]
    end

    subgraph Stage3["Stage 3: Bed Pre-Booking"]
        S3A["Generate Token<br/>#JH-108-DISPATCH-XXXX"]
        S3B["Reserve ICU Bed<br/>at Target Hospital"]
        S3C["Inject Patient into<br/>Receiving Triage Queue"]
    end

    subgraph Stage4["Stage 4: In-Flight Telemetry"]
        S4A["Live ETA<br/>Countdown Timer"]
        S4B["Draw Active<br/>Transfer Route"]
        S4C["⚡ MARK ARRIVED<br/>(Bed Handover)"]
    end

    Stage1 --> Stage2 --> Stage3 --> Stage4

    style Stage1 fill:#fff3e0,stroke:#e65100,color:#382416
    style Stage2 fill:#e3f2fd,stroke:#1565c0,color:#0d47a1
    style Stage3 fill:#e8f5e9,stroke:#2e7d32,color:#1b5e20
    style Stage4 fill:#fce4ec,stroke:#c62828,color:#b71c1c
```

### Secure 108 Referral & Bed Pre-Booking Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Dispatcher as 🚑 108 Dispatcher / Nurse
    participant Frontend as Next.js Dashboard UI
    participant SecFilter as Spring Security & CORS Filter
    participant RefCtrl as ReferralController
    participant RefSvc as ReferralService
    participant Router as Dijkstra Spatial Router
    participant Repo as TransferRequestRepository
    participant RecvHosp as Receiving Hospital Triage

    Dispatcher->>Frontend: Select Target Hospital & Click "Pre-Book Bed & Dispatch"
    Frontend->>SecFilter: POST /api/referrals (Bearer JWT + Payload)
    Note over SecFilter: 1. Validate CORS Origin<br/>2. Authenticate JWT Bearer<br/>3. Verify @PreAuthorize role
    SecFilter->>RefCtrl: Authorized Request Dispatched
    RefCtrl->>RefSvc: executeReferral(request)
    RefSvc->>Router: calculateShortestPath(fromHosp, toHosp)
    Router-->>RefSvc: travelTimeMinutes + shortestPathNodes
    RefSvc->>Repo: save(TransferRequest{status=PROPOSED, token=#JH-108-DISPATCH-XXXX})
    Repo-->>RefSvc: Persisted Entity
    RefSvc-->>RefCtrl: ReferralResponse (Token + ETA + Route)
    RefCtrl-->>Frontend: 200 OK (Dispatch Token + Bed Reservation)
    Frontend->>RecvHosp: Injects In-Flight Patient to Receiving ED Priority Heap
    Frontend-->>Dispatcher: Display Live Telemetry Countdown & Tactical Token

    opt In-Flight Status Updates
        Dispatcher->>Frontend: Mark "Departed" / "Arrived"
        Frontend->>RefCtrl: PUT /api/referrals/{id}/status (status=IN_TRANSIT / COMPLETED)
        RefCtrl->>Repo: updateStatus()
        RefCtrl-->>Frontend: 200 OK (Status Synchronized)
    end
```

---

## Use Case Diagrams

### Primary Use Case Diagram — All Actors

```mermaid
flowchart TB
    subgraph Actors["System Actors"]
        SA(("Super Admin"))
        SHD(("State Health<br/>Dept Director"))
        CMO(("District CMO"))
        HA(("Hospital Admin"))
        TN(("Triage Nurse"))
        AD(("108 Dispatcher"))
    end

    subgraph UseCases["TriageNet Use Cases"]
        UC1["UC1: Authenticate &<br/>Select Role"]
        UC2["UC2: View Statewide<br/>Capacity Dashboard"]
        UC3["UC3: Register Patient<br/>& Score Vitals"]
        UC4["UC4: Manage Triage<br/>Priority Queue"]
        UC5["UC5: Assign Bed via<br/>Hungarian Matcher"]
        UC6["UC6: Request Inter-Hospital<br/>Transfer (Dijkstra)"]
        UC7["UC7: Dispatch 108<br/>Ambulance"]
        UC8["UC8: Pre-Book Receiving<br/>Hospital Bed"]
        UC9["UC9: View District<br/>Risk Reports"]
        UC10["UC10: Manage Appointments<br/>& Calendar"]
        UC11["UC11: Track Billing<br/>& Revenue (₹)"]
        UC12["UC12: Monitor Supply<br/>Inventory"]
        UC13["UC13: AI Clinical<br/>Decision Support"]
        UC14["UC14: Emergency<br/>Communications"]
        UC15["UC15: Seed Hospital<br/>Data & Config"]
    end

    SA --> UC1 & UC2 & UC3 & UC4 & UC5 & UC6 & UC7 & UC8 & UC9 & UC10 & UC11 & UC12 & UC13 & UC14 & UC15
    SHD --> UC1 & UC2 & UC9 & UC12 & UC14
    CMO --> UC1 & UC2 & UC4 & UC6 & UC9 & UC14
    HA --> UC1 & UC2 & UC5 & UC10 & UC11 & UC12
    TN --> UC1 & UC3 & UC4 & UC13
    AD --> UC1 & UC6 & UC7 & UC8 & UC14

    style UseCases fill:#fdf8f0,stroke:#382416,color:#2c1b0e
    style Actors fill:#e3f2fd,stroke:#1565c0,color:#0d47a1
```

### Use Case: Triage Nurse — ED Patient Intake

```mermaid
flowchart LR
    TN(("Triage Nurse"))

    TN --> UC1["Login with<br/>TRIAGE_NURSE Role"]
    TN --> UC2["Enter Patient<br/>Demographics"]
    TN --> UC3["Record Vitals<br/>(SpO₂, HR, BP, Temp, RR)"]
    TN --> UC4["View ML Severity<br/>Score & Risk Factors"]
    TN --> UC5["Insert into<br/>Priority Queue"]
    TN --> UC6["Request AI CDS<br/>Diagnostic Guidance"]

    UC3 -- "includes" --> UC4
    UC4 -- "includes" --> UC5
    UC5 -- "extends" --> UC7["Trigger Sepsis<br/>Early Warning Alert"]
```

### Use Case: 108 Ambulance Dispatcher

```mermaid
flowchart LR
    AD(("108 Dispatcher"))

    AD --> UC1["Login with<br/>AMBULANCE_DISPATCH Role"]
    AD --> UC2["Create New<br/>Incident Report"]
    AD --> UC3["Select Vehicle Unit<br/>(ALS/BLS)"]
    AD --> UC4["View Dijkstra<br/>Hospital Scoring"]
    AD --> UC5["Pre-Book ICU Bed<br/>at Target Hospital"]
    AD --> UC6["Track In-Flight<br/>Ambulance Telemetry"]
    AD --> UC7["Mark Patient Arrived<br/>(Bed Handover)"]

    UC2 -- "includes" --> UC3
    UC4 -- "includes" --> UC5
    UC5 -- "includes" --> UC6
    UC6 -- "extends" --> UC7
```

---

## Autonomous AI Agents

| Agent Name | Primary Responsibility | Telemetry Output |
|------------|------------------------|------------------|
| **AI Supply Demand Agent** | Analyzes hospital surge loads, calculates dynamic bed & ventilator deficits, streams CLI terminal telemetry, and dispatches equipment upon human operator authorization | Live macOS/Linux CLI Terminal (`ai-supply-terminal-modal.tsx`) |
| **AI Financial Cost Recovery Agent** | Tracks equipment asset valuations, manages ₹12.80 Cr operating budget, calculates maintenance costs, and auto-reallocates revenue recovery surpluses (+₹1.46 Cr) | Live macOS/Linux CLI Terminal (`ai-financial-terminal-modal.tsx`) |
| **Dijkstra Regional Overflow Agent** | Evaluates weighted network graph to route patient overflow to non-congested facilities with matching equipment & specialist physicians | Real-Time Routing Latency Trend Chart (`reports-view.tsx`) |

---

## 6-Role RBAC Architecture

```mermaid
flowchart TB
    subgraph RBAC["Role-Based Access Control Matrix"]
        SA["🔧 SUPER_ADMIN<br/>All 12 Views"]
        SHD["🏛️ STATE_HEALTH_DEPT<br/>5 Macro Views"]
        CMO["📋 DISTRICT_CMO<br/>6 District Views"]
        HA["🏥 HOSPITAL_ADMIN<br/>6 Facility Views"]
        TN["👩‍⚕️ TRIAGE_NURSE<br/>3 ED Views"]
        AD["🚑 AMBULANCE_DISPATCH<br/>3 Tactical Views"]
    end

    subgraph Views["Dashboard Views"]
        V1["Capacity"]
        V2["Patients"]
        V3["Triage Queue"]
        V4["Regional Network"]
        V5["AI CDS"]
        V6["Appointments"]
        V7["Clinical Ops"]
        V8["Billing & Revenue"]
        V9["Medical Records"]
        V10["Supplies"]
        V11["Reports"]
        V12["Communications"]
    end

    SA --> V1 & V2 & V3 & V4 & V5 & V6 & V7 & V8 & V9 & V10 & V11 & V12
    SHD --> V1 & V4 & V10 & V11 & V12
    CMO --> V1 & V3 & V4 & V7 & V11 & V12
    HA --> V1 & V7 & V6 & V8 & V10 & V9
    TN --> V3 & V2 & V5
    AD --> V4 & V3 & V12

    style RBAC fill:#fdf8f0,stroke:#382416,color:#2c1b0e
    style Views fill:#e8f5e9,stroke:#2e7d32,color:#1b5e20
```

| User Role | Access Scope | Permitted Views |
|-----------|--------------|-----------------| 
| **System Super Admin** | Global Platform | **ALL 12 Views**: Unrestricted statewide control & DB seed management |
| **State Health Dept Director** | Statewide Governance | **5 Macro Views**: Statewide Capacity, Hospital Network Graph, Supplies, Risk Reports, State Comms |
| **District CMO** | District Administration | **6 Views** (Locked to assigned District, e.g. Ranchi): District Capacity, Overflow Queue, Clinical Ops, Reports, Comms |
| **Medical Superintendent** | Hospital Operations | **6 Views** (Locked to assigned Facility, e.g. RIMS Ranchi): Capacity, Clinical Beds, Appointments, Billing in ₹, Inventory, Medical Records |
| **Emergency Triage Nurse** | Front-line ED Intake | **3 Views**: Triage Priority Queue, Patients & Vitals Scorer, AI CDS |
| **108 Ambulance Dispatcher** | Call Center Dispatch | **3 Tactical Views**: Regional Spatial Network Map, Dispatch Queue, Emergency Comms |

---

## Spatial Routing Engine

```mermaid
graph TD
    PatientLoc["📍 Patient / Ambulance<br/>GPS Coordinates"]
    Haversine["Haversine Geodesic<br/>Distance Calculator"]
    ORS["OpenRouteService<br/>Road Matrix API"]
    GraphDB["Hospital Road<br/>Network Graph"]
    DijkstraAlgo["Dijkstra Shortest<br/>Path Algorithm"]
    Scoring["Multi-Criteria<br/>Hospital Scoring"]
    Result["Optimal Hospital<br/>+ ETA + Route"]

    PatientLoc --> Haversine
    PatientLoc --> ORS
    Haversine --> GraphDB
    ORS --> GraphDB
    GraphDB --> DijkstraAlgo
    DijkstraAlgo --> Scoring
    Scoring --> Result

    Scoring -. "Factors" .-> F1["Road ETA (min)"]
    Scoring -. "Factors" .-> F2["ICU Beds Available"]
    Scoring -. "Factors" .-> F3["Ventilator Count"]
    Scoring -. "Factors" .-> F4["Trauma Surgeons On-Duty"]

    style PatientLoc fill:#e3f2fd,stroke:#1565c0
    style DijkstraAlgo fill:#fff3e0,stroke:#dc5000
    style Result fill:#e8f5e9,stroke:#2e7d32
```

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
| **Design System** | Modern Clinical Workspace — Walnut Shadow & Warm Cream Canvas |
| **SEO & PWA** | Sitemap · Robots.txt · Web Manifest · Schema.org JSON-LD · OpenGraph & Twitter Cards |

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
│   │   ├── TriageNetApplication.java   # Spring Boot entry point
│   │   ├── config/                     # SecurityConfig, JwtAuthenticationFilter, CustomUserDetails
│   │   ├── controller/                 # 7 REST Controllers (Auth, Dashboard, Hospital, Patient,
│   │   │                               #   Resource, Routing, TriageQueue)
│   │   ├── dto/                        # LoginRequest, LoginResponse, RegisterRequest, UserDto
│   │   ├── engine/                     # DijkstraRouter, HungarianMatcher, SeverityScorer
│   │   ├── entity/                     # 15 JPA Entities (Hospital, District, Patient, Resource,
│   │   │                               #   HospitalEdge, StaffUser, Role, TriageQueueEntry, etc.)
│   │   ├── exception/                  # GlobalExceptionHandler
│   │   ├── repository/                 # 11 Spring Data JPA Repositories
│   │   ├── service/                    # 8 Business Services (Auth, HospitalSeed, Hospital,
│   │   │                               #   Patient, Referral, SpatialRouting, TriageQueue)
│   │   └── util/                       # JwtUtil (HMAC-SHA256 token generation)
│   └── src/main/resources/seed/        # jharkhand-hospitals.json (111 facilities)
│
├── frontend/
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx                  # Root layout + SEO metadata + JSON-LD + PWA tags
│   │   ├── page.tsx                    # Landing page compositor
│   │   ├── globals.css                 # Tailwind CSS v4 design tokens
│   │   ├── sitemap.ts                  # Dynamic SEO sitemap generator
│   │   ├── robots.ts                   # SEO crawler rules
│   │   ├── manifest.ts                 # PWA web manifest
│   │   ├── dashboard/page.tsx          # Command dashboard view
│   │   └── login/                      # Login portal (page.tsx + layout.tsx)
│   │
│   ├── components/
│   │   ├── landing/                    # 10 Landing page components + motion primitives
│   │   │   ├── navbar.tsx              # Sticky navigation with official TriageNet logo
│   │   │   ├── hero.tsx                # Animated hero with ECG waveform
│   │   │   ├── algorithm-showcase.tsx  # Algorithm explanation cards
│   │   │   ├── interactive-graph-showcase.tsx  # Dijkstra graph preview
│   │   │   └── cta-footer.tsx          # Call-to-action footer
│   │   │
│   │   └── triagenet/                  # 20 Dashboard operational components
│   │       ├── dashboard.tsx           # Central view router (402 lines)
│   │       ├── sidebar.tsx             # RBAC navigation drawer (185 lines)
│   │       ├── top-bar.tsx             # Scenario switch + simulation clock (365 lines)
│   │       ├── triage-queue-view.tsx   # Priority Heap management (675 lines)
│   │       ├── regional-network-view.tsx  # GIS + Dijkstra + 108 Dispatch (1283 lines)
│   │       ├── leaflet-map.tsx         # OpenStreetMap interactive map (470 lines)
│   │       ├── patients-view.tsx       # Patient registry + ML scorer (292 lines)
│   │       ├── capacity-view.tsx       # Bed & ICU occupancy meters (222 lines)
│   │       ├── billing-view.tsx        # Revenue & PM-JAY claims (533 lines)
│   │       ├── reports-view.tsx        # Risk telemetry analytics (503 lines)
│   │       ├── supplies-view.tsx       # Equipment inventory (680 lines)
│   │       ├── appointments-view.tsx   # Scheduling calendar (334 lines)
│   │       ├── aicds-view.tsx          # AI Clinical Decision Support (180 lines)
│   │       ├── clinical-view.tsx       # Ward operations & shifts (191 lines)
│   │       ├── ai-supply-terminal-modal.tsx    # AI Supply Agent CLI (376 lines)
│   │       └── ai-financial-terminal-modal.tsx # AI Financial Agent CLI (209 lines)
│   │
│   ├── lib/                            # Core TypeScript libraries
│   │   ├── triage-data.ts              # State engine + algorithms (902 lines)
│   │   ├── jharkhand-data.ts           # 111 hospitals × 24 districts (2,835 lines)
│   │   ├── api-client.ts              # REST client + JWT auth (224 lines)
│   │   ├── auth-context.tsx           # 6-role RBAC context (186 lines)
│   │   ├── ml-severity-scorer.ts      # Client-side ML inference (96 lines)
│   │   └── utils.ts                   # Tailwind class combiner (7 lines)
│   │
│   └── public/                         # Static assets
│       ├── triagenet-logo.png          # Official TriageNet brand logo
│       ├── icon.svg                    # Vector favicon
│       └── favicon.ico                 # Browser tab icon
│
├── scripts/                            # Hospital data scrapers & ML model trainers
├── docker-compose.yml                  # Multi-container orchestration
└── README.md                           # This file
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

### ML Severity Scoring Pipeline

```mermaid
flowchart LR
    Input["Patient Vitals<br/>(7 Features)"]
    Norm["Feature<br/>Normalization"]
    Weights["Trained Weights<br/>W = [-0.145, 0.042, ...]"]
    Logit["Linear Combination<br/>z = W·X + b"]
    Sigmoid["Sigmoid Activation<br/>σ(z) = 1/(1+e⁻ᶻ)"]
    Score["Severity Score<br/>(0-100)"]
    Tier["Risk Tier<br/>Assignment"]

    Input --> Norm --> Logit
    Weights --> Logit
    Logit --> Sigmoid --> Score --> Tier

    Tier --> T1["🔴 CRITICAL ≥75<br/>Immediate ICU"]
    Tier --> T2["🟡 URGENT 50-74<br/>Emergent <15min"]
    Tier --> T3["🟢 MODERATE 25-49<br/>Observation <60min"]
    Tier --> T4["⚪ LOW <25<br/>Ambulatory"]

    style Input fill:#e3f2fd,stroke:#1565c0
    style Sigmoid fill:#fff3e0,stroke:#dc5000
    style Score fill:#e8f5e9,stroke:#2e7d32
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
- [x] Modern clinical workspace design system (light clinical canvas & Walnut Shadow theme)
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
- [x] Seeded 111 real government hospitals across all 24 districts of Jharkhand (`jharkhand-hospitals.json`)
- [x] Java ML Severity Scorer ($\text{Sigmoid}(W \cdot X + b)$) with risk factor attributions
- [x] Dijkstra Router & Hungarian Multi-Resource Compatibility Matcher
- [x] Automated Maven test suite (14/14 test suites passed, 100% success)

### ✅ Phase 3 — Frontend Integration & 6-Role RBAC Portal (Complete)
- [x] Type-safe REST client (`frontend/lib/api-client.ts`)
- [x] 6-Role RBAC React AuthContext (`frontend/lib/auth-context.tsx`) with instant one-click demo presets
- [x] Clinical staff login portal (`frontend/app/login/page.tsx`) with light warm linen canvas and Walnut Shadow theme
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

### ✅ Phase 7 — Authentic Data, 108 Dispatch, SEO & Brand Identity (Complete — Aug 16, 2025)
- [x] **100% Authentic Jharkhand Hospital Dataset**: Replaced all generalized placeholders with real-world hospital names, CHC block names, and facility interconnectivity across all 24 districts
- [x] **Dynamic District & Area Switching**: Full 79→111 facility dataset wiring with per-district dynamic road matrix interconnectivity
- [x] **Role-Specific Bespoke Features**: Rapid ED Intake Console (Triage Nurse), 108 Tactical Incident Hotspots (Dispatcher), Live ML Scoring Dashboard
- [x] **Unified Global District Scope**: Single top-bar district selector controlling all dashboard views simultaneously
- [x] **108 Ambulance Tactical Command Console Overhaul**: Full 4-stage Golden Hour system — Incident Intake → Multi-Criteria Dijkstra Hospital Scoring → 1-Click Bed Pre-Booking with dispatch token → In-Flight Fleet Telemetry with live countdown
- [x] **Simulation Engine Null Pointer Fix**: Defensive guards for `state.hospitals` and `targetHosp.id` in continuous auto-play
- [x] **Dijkstra Topology SVG Graph Restoration**: Star/orbit layout with live bed occupancy pills, ICU availability indicators, and travel time tags
- [x] **Enterprise SEO Architecture**: `sitemap.ts`, `robots.ts`, `manifest.ts`, Schema.org JSON-LD (`WebApplication` + `GovernmentService`), OpenGraph, Twitter Cards
- [x] **Root Document Optimization**: Font `display: 'swap'`, `preconnect` to Google Fonts, `dns-prefetch` to CDN tile servers, PWA capability meta tags

### ✅ Phase 8 — 108 Ambulance Referral REST API & Dual-Mode Live/Simulation Sync (Complete — Aug 17, 2026)
- [x] **108 Referral REST Controller**: `ReferralController.java` with 4 endpoints (`POST /api/referrals`, `GET /api/referrals/active`, `PUT /api/referrals/{id}/status`, `GET /api/referrals/recommendation`) with RBAC `@PreAuthorize` security and unique `#JH-108-DISPATCH-XXXXXXXX` token generation
- [x] **Full 21/21 Automated Backend Test Suite**: Unit & integration test coverage across all JPA repositories, algorithmic engines (Dijkstra, Hungarian, SeverityScorer), and REST controllers (100% pass rate)
- [x] **Type-Safe Frontend REST Client**: Added complete referral, queue recomputation, and Hungarian resource assignment API methods with TypeScript interfaces in `api-client.ts`
- [x] **Dual-Mode Live / Simulation Sync Engine**: Non-blocking `useBackendConnection()` hook in `dashboard.tsx` with live REST telemetry probe, visual status badge (`LIVE API` / `CONNECTING…` / `SIMULATED`), and automatic fallback
- [x] **Clean Next.js 16 Production Build**: Verified full Next.js static prerendering across all 11 application routes with zero errors

### ✅ Phase 8.1 — Comprehensive Security Remediation & RBAC Hardening (Complete — Aug 21, 2026)
- [x] **Comprehensive 22-Vector Security Audit**: Analyzed entire attack surface across Auth, RBAC, Data Exposure, Infrastructure, and Supply Chain (`SECURITY_AUDIT_REPORT.md`)
- [x] **Open-Source Hardening Infrastructure**: Created `.github/SECURITY.md`, `.github/ISSUE_TEMPLATE/security_issue.yml`, `.github/ISSUE_TEMPLATE/good_first_issue.yml`, and `.github/SECURITY_AUDIT_TRACKER.md`
- [x] **Automated GitHub Issue Publisher & Closer**: Node.js scripts `scripts/create_audit_report_issues.js` and `scripts/close_fixed_issues.js` for community contributor issue lifecycles
- [x] **CORS Centralization & Wildcard Purge (Fixes Issue #2)**: Replaced all controller-level `@CrossOrigin(origins = "*")` wildcard annotations with a centralized Spring Security `CorsConfigurationSource` restricting access to authorized frontend domains (`http://localhost:3000`, `https://*.vercel.app`, `https://triagenet.dev`)
- [x] **Standard Security Headers**: Enabled `X-Frame-Options: DENY` (and `sameOrigin` only in explicit dev profiles) and `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- [x] **Password Complexity Regex Validation (Fixes Issue #4 / A4)**: Enforced strict `@Pattern` validation on `RegisterRequest.java` requiring minimum 8 characters, uppercase, lowercase, digit, and special character symbols
- [x] **Method-Level RBAC Enforcement (Fixes Issue #3)**: Added granular `@PreAuthorize` role protections across all REST controllers (`PatientController`, `ResourceController`, `RoutingController`, `TriageQueueController`, `HospitalController`, and `ReferralController`)
- [x] **Brute-Force Protection & Lockout Cache (Fixes Issue #6)**: Implemented in-memory `LoginAttemptService` with 5-attempt sliding threshold, 15-minute lockouts, `423 Locked` responses, and strict 10k capacity enforcement
- [x] **Structured Security Audit Logging (Fixes Issue #8 & #9)**: Implemented `SecurityAuditService` emitting audit logs for auth events, transfers, and dispatches with CRLF/control-character sanitization, quote escaping, and email PII masking
- [x] **Hardcoded Secret Purge & Fail-Fast JWT Validation (Fixes Issue #1 / A1)**: Removed hardcoded default secret fallbacks from `JwtUtil.java`, `application.yml`, and `docker-compose.yml`; `@PostConstruct` validation in `JwtUtil` requires $\ge 256$ bits of entropy and fails fast on startup if `JWT_SECRET` is unset
- [x] **Pure HttpOnly SameSite Cookie Migration (Fixes Issue #5 / A3)**: Backend sets `triagenet_jwt` cookie on login (`HttpOnly`, `Path=/`, `SameSite=Lax`); `JwtAuthenticationFilter` supports dual-engine Bearer/Cookie extraction; removed all frontend `localStorage` JWT token access in `api-client.ts` and `auth-context.tsx` in favor of pure browser cookie transport (`credentials: 'include'`)
- [x] **Dev/Local Profile Hardening (Fixes Issue A5)**: Untracked `application-local.yml` from version control, added to `.gitignore`, and provided `application-local.yml.example` template
- [x] **Dependency Upgrades & Hardened Non-Root Container (Fixes Issue #7)**: Upgraded backend to **Spring Boot 3.3.2** with **JJWT 0.12.5**; hardened `backend/Dockerfile` with non-root user `USER 1001:1001`
- [x] **Full 40/40 Automated Test Suite & Next.js Build**: **40/40 backend tests passing (100% BUILD SUCCESS)**, 11/11 Next.js static pages generated cleanly in 3.1s

### ✅ Phase 8.2 — Security Hardening Code-Review Audit (Complete — Aug 23, 2026)
- [x] **Profile-Aware CORS Origin Selection**: `SecurityConfig.corsConfigurationSource()` dynamically selects allowed origins by active Spring profile — dev/test/local allows `localhost:3000`, `127.0.0.1:3000`, `localhost:8080`; production enforces exact domains only (`triagenet.vercel.app`, `triagenet.dev`, `triagenet.gov.in`) with zero wildcards
- [x] **Default Cache-Control Security Headers**: Replaced `cache.disable()` with `Customizer.withDefaults()` in Spring Security headers configuration, ensuring all protected API responses include `Cache-Control: no-cache, no-store, max-age=0, must-revalidate`, `Pragma: no-cache`, and `Expires: 0` to prevent PHI proxy-caching
- [x] **Clinical Vitals Physiological Boundary Sanitization**: Added compile-time constants for physiological bounds (`SpO₂` 50–100, `HR` 20–260, `SBP` 40–300, `DBP` 20–200, `Temp` 30–45°C, `Resp` 4–80, `Age` 0–120) with `ClinicalVitals.sanitized()` clamping in `SeverityScorer.java`; applied at entity write boundaries in `PatientService.registerPatient()` and `evaluateVitals()` before persistence
- [x] **Trusted Proxy X-Forwarded-For Validation**: `AuthService.clientIpOf()` now validates `request.getRemoteAddr()` against a trusted proxy allowlist (RFC 1918 private subnets, loopback) before reading `X-Forwarded-For`; direct non-proxy clients always return `getRemoteAddr()` to prevent IP spoofing of rate-limit bypasses
- [x] **Atomic Discharge & Waiting Patient Promotion**: Rewrote `PatientService.dischargePatient()` with `@Lock(LockModeType.PESSIMISTIC_WRITE)` on both hospital and candidate waiting patients (`SELECT ... FOR UPDATE`); decrements `usedBeds`, promotes exactly one `WAITING → ASSIGNED` patient atomically within a single `@Transactional` boundary, preventing race conditions in concurrent discharges
- [x] **Hibernate DDL-Auto Production Safety**: Changed base `application.yml` default from `update` to `${SPRING_JPA_HIBERNATE_DDL_AUTO:validate}` — missing env var now fails schema validation instead of silently mutating production DDL; dev profile overrides preserved (`create-drop`)
- [x] **Frontend Dependency Hardening**: Updated `hono` override from `4.12.25` to `4.12.34` in `package.json` (both `pnpm.overrides` and root `overrides`); regenerated `pnpm-lock.yaml` with zero residual `4.12.25` resolutions
- [x] **PR #27 Merge Conflict Resolution**: Synchronized `fix/security-hardening-audit-2026-08` branch with `main`, resolving all 7 conflicting files and restoring the V1 critical privilege-escalation block in `AuthService.register()`; fixed missing `+` operator in Haversine formula introduced by CodeRabbit co-authored commit
- [x] **Full 45/45 Automated Test Suite & Builds**: **45/45 backend tests passing (100% BUILD SUCCESS)** including new integration tests for cache-control headers, trusted proxy IP extraction, atomic discharge promotion, and vitals clamping; **11/11 Next.js static pages** generated cleanly

### ✅ Phase 9 — Production Hardening, Multi-Tenant Authorization & Security Remediation (Complete)
- [x] **Multi-Tenant Scoping & IDOR Prevention (V10)**: Implemented `HospitalAuthorizationService` scoping access to hospital staff strictly to their assigned facilities, District CMOs to their respective districts, and statewide oversight roles. Integrated across `PatientService`, `TriageQueueService`, `ReferralService`, `DashboardController`, and `ResourceController`.
- [x] **H2 Console Access Guard (V2)**: Disabled H2 console by default in `application.yml` (`spring.h2.console.enabled: false`) and restricted `/h2-console/**` access strictly to explicit `dev`/`local` profiles. Enforced `X-Frame-Options: DENY` on all non-dev profiles.
- [x] **Cryptographic Randomness & Entropy Verification (V3)**: Integrated Shannon entropy check ($\ge 3.5$ bits/char) in `JwtUtil.java`, failing fast with `IllegalStateException` on startup in production if an insecure secret is supplied.
- [x] **JWT Refresh Token Rotation & Revocation (V4)**: Reduced JWT access token lifespan to 15 minutes (`900,000 ms`). Implemented 7-day HttpOnly refresh token cookie rotation (`RefreshToken` entity, SHA-256 hash storage), `POST /api/auth/refresh` rotation, `POST /api/auth/logout` revocation, and replay attack defense (revokes all user tokens if a revoked refresh token is presented).
- [x] **Strict Exact-Origin CORS Whitelist (V6)**: Replaced origin patterns with strict `setAllowedOrigins` in `SecurityConfig.java`, completely eliminating wildcard permissions for third-party subdomains.
- [x] **PHI Cache-Control Headers (V7)**: Verified Spring Security default cache-control headers (`no-cache, no-store, max-age=0, must-revalidate`) on all authenticated patient and triage endpoints with integration test verification.
- [x] **Next.js 16.3.4 Security Upgrade (V8)**: Upgraded frontend from `16.2.6` to `^16.3.4` (Turbopack) along with `postcss ^8.5.3` and dependency overrides (`nanoid`, `fast-uri`, `qs`), resolving all 9 advisories; `npm audit` reports **0 vulnerabilities**.
- [x] **CSRF Guard for Cookie Authentication (V9)**: Added `CsrfGuardFilter` requiring custom `X-Requested-With` or `X-CSRF-TOKEN` headers on all state-changing endpoints (`POST`, `PUT`, `DELETE`, `PATCH`) authenticated via cookies.
- [x] **Hot-Path Query Optimization & DB Indexing (B7)**: Replaced in-memory `.findAll().stream().filter(...)` pipelines with indexed repository queries (`findByHospitalIdIn`, `findByHospitalIdInAndStatus`, `findByDistrictOrRegionIgnoreCase`). Added DB indexes on `patients(status)` and `hospitals(district_name, region)`.
- [x] **Elimination of Mutable `localStorage` User Profile (B9)**: Refactored `auth-context.tsx` to authenticate session directly with `GET /api/auth/me`, ensuring roles and tenant permissions are authoritatively verified by the server.
- [x] **Standardized Error Taxonomy (B10)**: Created `ResourceNotFoundException`, mapped to 404 in `GlobalExceptionHandler` with consistent JSON error schema (`status`, `error`, `message`, `timestamp`).
- [x] **Full 54/54 Automated Test Suite & Production Builds**: **54/54 backend tests passing (100% BUILD SUCCESS)**; **11/11 Next.js static pages** generated cleanly via Turbopack; Knowledge graph updated to 1,479 nodes and 105 communities.

### ✅ Phase 9.1 — Cryptographic 2FA, Offline Shift Management & Account Recovery (Complete — Sep 3, 2026)
- [x] **Zero-Email, Zero-SMS Offline Cryptographic Engine**: Eliminated third-party authentication services, SMS gateways, and cloud auth vendors to prevent phishing, telecom interception, and credential stuffing on confidential health networks.
- [x] **RFC 6238 HMAC-SHA1 TOTP Engine**: Built native 160-bit Base32 secret generation with Google Authenticator, Aegis, and YubiKey compatibility; implemented $\pm 1$ time-step window ($\pm 30\text{s}$) clock drift compensation in `TotpService.java`.
- [x] **12-Word BIP-39 Mnemonic Recovery System**: Added cryptographic 12-word mnemonic phrase generator (`MnemonicRecoveryService.java`) with 128-bit CSPRNG entropy; stored strictly as SHA-256 hashes (`recovery_phrase_hash`), allowing self-sovereign clinician account recovery without email verification.
- [x] **8 Emergency Single-Use Backup Codes**: Pre-generates 8 collision-free alphanumeric codes (`TR-XXXX-XXXX`), stored as salted SHA-256 hashes (`emergency_codes_hash`) and burned upon consumption.
- [x] **8h / 12h Clinical Shift Sessions with 4-Digit Quick-Lock PIN**: Built `ShiftSessionService.java` managing duty shifts with 20-minute idle auto-locks and instant 4-digit PIN unlock screen; eliminated repetitive 2FA re-authentications during trauma resuscitations.
- [x] **Multi-Tier Account Recovery Portal (`/recovery`)**: Full clinical UI for 12-Word BIP-39 mnemonic recovery, emergency backup codes, and a 15-minute District CMO Escrow Bypass (`AUTH_CMO_ESCROW_OVERRIDE`).
- [x] **62/62 Automated Backend Tests**: Added `ShiftSessionIntegrationTest.java` verifying TOTP, shift creation, PIN unlock, and mnemonic password resets (100% BUILD SUCCESS).

### ✅ Phase 9.2 — Official Staff ID Architecture, Cryptographic Onboarding & 3-Tier Precedence Hierarchy (Complete — Sep 3, 2026)
- [x] **Staff ID Primary Credential (`JH-STF-XXXX`)**: Replaced email login with official state-issued Healthcare Staff IDs (`staffId` column with unique DB index); supported dual identifier lookup (`findByStaffIdOrEmail`) for seamless clinician access.
- [x] **Continuous 4-Stage Onboarding Wizard (`/login`)**:
  1. *Command Station & Role*: Full Name, Staff ID, Official Email, Command Station Role, and Assigned Facility.
  2. *Master Password*: Complexity regex verification (upper, lower, digit, special symbol).
  3. *Cryptographic Packet*: Base32 TOTP secret, QR URI, 12-word BIP-39 mnemonic phrase (with one-click clipboard copy), and 8 single-use emergency backup codes.
  4. *Onboarding Complete*: Summary badge, facility verification notice, and live status probe.
- [x] **Zero-Email Public Real-Time Status Probe (`GET /api/auth/status/{staffId}`)**: Allows clinicians to probe their verification status in real time directly from the login terminal without SMS or email dependencies.
- [x] **Dual-Control Administrative Verification Queue (`/api/admin/staff/**`)**:
  - Unapproved accounts are locked (`PENDING_VERIFICATION`), blocking login with HTTP `423 Locked`.
  - Built `<StaffApprovalModal />` mounted in dashboard with real-time 25s polling and pulsating `[ 👥 STAFF QUEUE (X) ]` badge for Medical Superintendents and District CMOs.
  - Admins inspect requested credentials, adjust assigned RBAC roles, and approve or reject with 1 click.
- [x] **3-Tier Approval Precedence Hierarchy**:
  - `SUPER_ADMIN` (State Health Command — Statewide 24 Districts): Exclusively appoints and approves Tier 2 leadership (`DISTRICT_CMO`, `HOSPITAL_ADMIN`); strictly barred from directly approving Tier 3 ground staff.
  - `DISTRICT_CMO` (District Command): Approves `HOSPITAL_ADMIN` and `AMBULANCE_DISPATCH` stationed within their assigned district.
  - `HOSPITAL_ADMIN` (Medical Superintendent): Approves Tier 3 ground clinical personnel (`TRIAGE_NURSE`, `HOSPITAL_STAFF`, `AMBULANCE_DISPATCH`) for their facility only.
  - Ground Operational Staff: Zero administrative approval permissions.
- [x] **Alignment with the 6 Command Station Leadership Roles**:
  - `SUPER_ADMIN` (State Health Command — Statewide 24 Districts)
  - `DISTRICT_CMO` (District Chief Medical Officer — Single District Command)
  - `HOSPITAL_ADMIN` (Medical Superintendent — Hospital Facility Command)
  - `TRIAGE_NURSE` (Lead Emergency Triage Nurse — ED Triage & MEWS Lead)
  - `AMBULANCE_DISPATCH` (108 Central Ambulance Dispatcher — Fleet & Route Dispatch)
  - `HOSPITAL_STAFF` (Medical Officer — Ward In-Charge & Bed Intake)
- [x] **Full 65/65 Automated Backend Test Suite**: Added `AdminStaffApprovalTest.java` verifying complete registration $\to$ pending lock $\to$ status probe $\to$ hierarchical 3-tier precedence approval $\to$ active login cycle. **65/65 tests passing (100% BUILD SUCCESS), 12/12 Next.js static pages compiled**.

#### 🔐 Core Cryptographic & Architectural Highlights

| Core Innovation | Implementation & Algorithmic Detail |
|---|---|
| **Zero-Email & Zero-SMS Paradigm** | Total elimination of telecom gateways, SMS OTPs, and external mail dependencies to prevent SIM-swapping, phishing, and disaster network blackouts. |
| **Official Staff ID Credentials** | Standardized `JH-STF-XXXX` (healthcare workers) and `JH-SYS-XXXX` (command staff) credentials with dual-identifier Spring Security DB resolution. |
| **Continuous 4-Stage Onboarding** | Step 1 (Identity & Command Role) → Step 2 (Master Password) → Step 3 (Offline Crypto Packet: TOTP + BIP-39 + Backup Codes) → Step 4 (In-Person Verification Notice). |
| **RFC 6238 TOTP Engine** | Native 160-bit Base32 HMAC-SHA1 algorithm with $\pm 1$ time-step ($\pm 30$s) clock drift compensation running 100% offline. |
| **BIP-39 Mnemonic Recovery** | 128-bit CSPRNG entropy + 4-bit SHA-256 checksum mapped to 12 words from the standardized 2048-word dictionary; persisted as SHA-256 hashes. |
| **8 Emergency Backup Codes** | Single-use cryptographically random `TR-XXXX-XXXX` tokens hashed with salted SHA-256 and burned on invocation. |
| **Clinical Shift Session Engine** | 8h/12h bound duty shifts with 20-min idle terminal auto-lock and 4-digit quick PIN unlock (designed for gloved clinicians). |
| **3-Tier Approval Precedence** | State Command (`SUPER_ADMIN`) → Intermediate Leadership (`DISTRICT_CMO`, `HOSPITAL_ADMIN`) → Ground Operational Staff (`TRIAGE_NURSE`, `HOSPITAL_STAFF`, `AMBULANCE_DISPATCH`). High-level admins are strictly prohibited from bypassing local superintendents. |
| **Zero-Email Status Probe API** | `GET /api/auth/status/{staffId}` — Public, real-time cryptographic status check allowing clinicians to probe verification status without SMS/email notifications. |
| **65/65 Backend Tests** | 100% automated test coverage covering full registration → pending lock → hierarchical precedence guards → active shift login. |

### ✅ Phase 9.6 — GIS Spatial Map Overhaul, Multi-Ambulance Fleet Command & 3-Tier Inventory Governance (Complete — Sep 4, 2026)
- [x] **Real GIS Coordinate Hospital Positioning**: Eliminated radial trigonometric circle layout; hospitals now placed at actual GPS lat/lng coordinates from the 79-facility Jharkhand dataset using Haversine-based fuzzy matching.
- [x] **3-Tier Surge Capacity Color Hierarchy**: Hospital markers dynamically colored — Crimson Red (≥80% load, pulsing beacon), Amber (60–80%), Emerald Green (<60%) — with live percentage badges on the Leaflet map.
- [x] **6-Unit Multi-Ambulance Fleet Command**: ALS/BLS fleet deployed with real Jharkhand GPS coordinates, operational coverage circles (20–35 km radius), status-based coloring, fleet filter pills (All / Dispatched / Ready / On-Scene), and interactive telemetry drawers with vitals HUD, crew roster, and equipment badges.
- [x] **3-Tier Inventory & Supplies Governance**: Role-scoped inventory views — State Health Command (district-wise budget allocation & bulk procurement), District CMO (equitable hospital share distribution), Hospital Admin (department-level spend allocation). Replaced terminal CLI with modern pill-based approval modals.
- [x] **District/Hospital Overview Inspect Modals**: Full-viewport portal overlay modals with backdrop blur for inspecting district and hospital inventory details without leaving the current tier.
- [x] **AI Predictive Supply Engine (Phase 9.5 Architecture)**: Bottom-up shortage incident logging by frontline officers, AI-correlated pre-fetch recommendations with Dijkstra transit routing to nearest reserve depots.
- [x] **Inter-District Referral Provision (Architecture Noted)**: Design scaffolding for referring patients to specialized hospitals across district boundaries (e.g., RIMS Ranchi for complex trauma cases).

<details>
<summary><b>🔍 Deep Dive: Cryptographic Onboarding Architecture, Algorithms & Approval Hierarchy</b></summary>

<br/>

#### 1. The Zero-Email / Zero-SMS Imperative in Emergency Triage
During mass-casualty incidents, epidemics, or disasters, reliance on commercial SMS gateways (Twilio, AWS SNS) or third-party email providers (SendGrid) introduces critical failure points:
1. **Rural Telecom Outages**: Emergency wards in rural Jharkhand often operate under zero cellular signal or during regional telecom blackouts.
2. **SIM Swapping & Interception**: SMS OTPs are vulnerable to SS7 exploitation and telecom phishing.
3. **Delivery Latency**: A 2-minute SMS delay during an active golden-hour triage intake costs human lives.

TriageNet operates as a **sovereign cryptographic enclave**: authentication, multi-factor authorization, and disaster recovery keys are generated, verified, and handled entirely offline.

---

#### 2. The Algorithmic Mechanics

##### A. RFC 6238 HMAC-SHA1 TOTP Engine with Drift Compensation
The Time-Based One-Time Password (TOTP) algorithm computes an ephemeral 6-digit code derived from a shared secret $K$ and the current Unix epoch time $t$:

$$\text{Time Step Index: } T = \left\lfloor \frac{t - T_0}{X} \right\rfloor$$

where $T_0 = 0$ and the time-step interval $X = 30\text{ seconds}$.

$$\text{Hash Derivation: } \text{HS} = \text{HMAC-SHA1}(K, T)$$

$$\text{Dynamic Truncation: } \text{Offset} = \text{HS}[19] \land \text{0x0F}$$

$$\text{Binary Code: } P = (\text{HS}[\text{Offset}] \land \text{0x7F}) \ll 24 \mid (\text{HS}[\text{Offset}+1] \land \text{0xFF}) \ll 16 \mid (\text{HS}[\text{Offset}+2] \land \text{0xFF}) \ll 8 \mid (\text{HS}[\text{Offset}+3] \land \text{0xFF})$$

$$\text{Final 6-Digit Code: } \text{TOTP} = P \pmod{10^6}$$

**Clock Drift Compensation**: To accommodate physical workstation clock skew in rural health centers, TriageNet verifies the client-provided code against a window of 3 steps: $T - 1$, $T$, and $T + 1$ ($\pm 30$ seconds tolerance).

##### B. BIP-39 12-Word Mnemonic Recovery Architecture
If a clinician loses their mobile authenticator device, they can self-recover their account using a 12-word cryptographic recovery phrase generated during onboarding:

1. **Entropy Generation**: A cryptographically secure pseudorandom number generator (CSPRNG) produces 128 bits of high-entropy data ($E$).
2. **Checksum Derivation**: Compute the SHA-256 hash of $E$. The first $\frac{128}{32} = 4\text{ bits}$ serve as the checksum ($CS$).
3. **Bit Concatenation**: Concatenate $E \parallel CS$ to yield a 132-bit sequence.
4. **Word Extraction**: Divide the 132 bits into 12 distinct 11-bit chunks ($2^{11} = 2048$).
5. **Dictionary Mapping**: Each 11-bit integer serves as a direct index into the standardized BIP-39 English wordlist of 2048 words.
6. **Zero-Knowledge Persistence**: The plaintext phrase is displayed only once during Stage 3 of onboarding. The backend persists strictly $\text{SHA-256}(\text{phrase})$, making it mathematically impossible for database leaks to compromise recovery keys.

##### C. Emergency Single-Use Recovery Codes
As an auxiliary defense, clinicians are issued 8 pre-generated single-use recovery codes in `TR-XXXX-XXXX` format:
- Generated with CSPRNG uppercase alphanumeric tokens.
- Hashed using salted SHA-256 at rest.
- Once entered, the matching hash is permanently deleted (**burned on use**), preventing replay attacks.

##### D. Clinical Shift Sessions with 4-Digit Quick PIN
Standard web session timeouts (e.g. 15 minutes) interrupt urgent clinical intake. In emergency wards, doctors and triage nurses wear latex gloves and PPE, making continuous re-typing of 16-character master passwords impractical.
- **Shift Duration**: Clinicians select an 8-hour or 12-hour duty shift at authentication.
- **20-Minute Idle Workstation Auto-Lock**: If the workstation detects 20 minutes of user inactivity, the UI enters a secure glassmorphism lockdown overlay.
- **4-Digit Quick PIN**: Clinicians unlock the active terminal in under 2 seconds by entering their 4-digit shift PIN, verified via fast cryptographic hashing, maintaining continuous security without clinical disruption.

---

#### 3. The 3-Tier Approval Precedence Hierarchy

In state healthcare operations, high-level administrative officials should never arbitrarily verify routine hospital staff, nor should facility staff approve regional commanders. TriageNet enforces a strict **3-Tier Precedence Chain**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    TIER 1: STATE COMMAND                        │
│                 SUPER_ADMIN / STATE_HEALTH_DEPT                 │
│                                                                 │
│   CAN APPROVE: Intermediate District & Hospital Leadership      │
│   • DISTRICT_CMO (District Chief Medical Officers - 24 Dists)   │
│   • HOSPITAL_ADMIN (Hospital Medical Superintendents)           │
│                                                                 │
│   BLOCKED FROM APPROVING: Ground Operational Roles              │
│   (TRIAGE_NURSE, HOSPITAL_STAFF, AMBULANCE_DISPATCH)           │
└───────────────────────────────┬─────────────────────────────────┘
                                │ Approves & Appoints
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  TIER 2: INTERMEDIATE LEADERSHIP                │
│                                                                 │
│   A. DISTRICT_CMO (District Headquarters)                       │
│      CAN APPROVE:                                               │
│      • HOSPITAL_ADMIN (Superintendents in district)             │
│      • AMBULANCE_DISPATCH (District 108 fleet dispatchers)      │
│                                                                 │
│   B. HOSPITAL_ADMIN (Hospital Medical Superintendent)           │
│      CAN APPROVE: Facility Ground Operational Staff             │
│      • TRIAGE_NURSE (Emergency Triage Lead Nurses)              │
│      • HOSPITAL_STAFF (Medical Officers / Ward In-Charge)       │
│      • AMBULANCE_DISPATCH (Facility-stationed dispatchers)      │
│                                                                 │
│   BLOCKED FROM APPROVING: Higher or Peer Tiers                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │ Approves & Badges
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│               TIER 3: GROUND OPERATIONAL STAFF                  │
│       TRIAGE_NURSE  •  HOSPITAL_STAFF  •  AMBULANCE_DISPATCH   │
│                                                                 │
│   (Operational roles possess NO staff approval privileges)      │
└─────────────────────────────────────────────────────────────────┘
```

##### Authority Matrix & Jurisdictional Boundaries:
| Approver Role | Allowed Target Roles for Approval | Disallowed Target Roles (Precedence Violation) | Geographic / Facility Scope |
|---|---|---|---|
| **`SUPER_ADMIN`** | `DISTRICT_CMO`, `HOSPITAL_ADMIN` | `TRIAGE_NURSE`, `HOSPITAL_STAFF`, `AMBULANCE_DISPATCH` | Statewide (24 Districts) |
| **`DISTRICT_CMO`** | `HOSPITAL_ADMIN`, `AMBULANCE_DISPATCH` | `SUPER_ADMIN`, `DISTRICT_CMO`, `TRIAGE_NURSE`, `HOSPITAL_STAFF` | Assigned District Only |
| **`HOSPITAL_ADMIN`** | `TRIAGE_NURSE`, `HOSPITAL_STAFF`, `AMBULANCE_DISPATCH` | `SUPER_ADMIN`, `DISTRICT_CMO`, `HOSPITAL_ADMIN` | Assigned Hospital Facility Only |
| **Operational Staff** | None (Access Denied `403`) | All Roles | Zero Administrative Privileges |

---

#### 4. End-to-End Onboarding & Verification Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Clinician as Applicant Clinician
    participant Wizard as Onboarding Wizard (/login)
    participant API as Spring Boot Security API
    participant DB as PostgreSQL / H2
    actor Supt as Hospital Medical Superintendent

    Note over Clinician,Wizard: STAGE 1: Identity & Station Role
    Clinician->>Wizard: Enters Name, Staff ID (JH-STF-8012), Hospital & Desired Role
    
    Note over Clinician,Wizard: STAGE 2: Master Password
    Clinician->>Wizard: Enters strong password (meets complexity policy)
    Wizard->>API: POST /api/auth/register
    API->>API: Compute RFC 6238 Secret, BIP-39 12-word phrase, 8 Backup Codes
    API->>DB: Persist StaffUser (status: PENDING_VERIFICATION, hashes)
    API-->>Wizard: 201 Created + Crypto Packet (Secret, Mnemonic, Backup Codes)
    
    Note over Clinician,Wizard: STAGE 3: Cryptographic Packet Handover
    Wizard-->>Clinician: Displays Base32 Key, QR Code & 12-Word Recovery Phrase
    Clinician->>Wizard: Confirms key backup & clicks "Complete Onboarding"
    
    Note over Clinician,Wizard: STAGE 4: Polite Verification Notice
    Wizard-->>Clinician: Displays badge card: Status = PENDING_VERIFICATION (Account locked 423)
    
    Note over Clinician,API: Zero-Email Public Status Probe
    Clinician->>API: GET /api/auth/status/JH-STF-8012
    API-->>Clinician: Returns status: "PENDING_VERIFICATION"
    
    Note over Supt,DB: Dual-Control In-Person Badge Verification
    Clinician-->>Supt: In-person badge & government ID presentation
    Supt->>API: GET /api/admin/staff/pending (with Supt JWT)
    API->>DB: Scoped query for facility + Tier 3 applicants
    API-->>Supt: Returns [JH-STF-8012 Dr. Ananya Verma - TRIAGE_NURSE]
    Supt->>API: POST /api/admin/staff/{id}/approve {"role": "TRIAGE_NURSE"}
    API->>API: Enforce Precedence Rules (Supt can approve Tier 3)
    API->>DB: Update StaffUser -> status: ACTIVE, role: ROLE_TRIAGE_NURSE
    API-->>Supt: 200 OK Staff Account Activated
    
    Note over Clinician,API: Live Activation & Clinical Duty Shift
    Clinician->>API: GET /api/auth/status/JH-STF-8012 -> Status: "ACTIVE"
    Clinician->>API: POST /api/auth/login (JH-STF-8012 + Password)
    API-->>Clinician: 2FA Challenge Token issued
    Clinician->>API: POST /api/auth/2fa/verify-and-start-shift (TOTP + 8h Shift + 4-digit PIN)
    API-->>Clinician: Sets HttpOnly JWT Cookie & Launches Clinical Dashboard
```

</details>

---

## 🔮 Strategic Master Roadmap & Architectural Separation

For complete technical specifications, see [**ROADMAP.md**](ROADMAP.md).

```mermaid
graph TD
    subgraph CoreBackend ["TriageNet Core Engine (Spring Boot 3.3.2)"]
        AUTH["Zero-Email Auth & Dual-Control Engine"]
        TRIAGE["Dynamic MEWS Triage & Acuity Engine"]
        ROUTING["Statewide Dijkstra Capacity Router"]
        BEDS["ICU & Oxygen Inventory Ledger"]
    end

    subgraph StationWeb ["Stationary Triage Web Workstation (This Web Hub)"]
        WEB["Workstation Command Portal (Next.js 16 + Tailwind)"]
        ADMIN["Medical Superintendent & CMO Command Terminal"]
        ED_TRIAGE["Emergency Department Triage Desk"]
    end

    subgraph FieldCrewMobile ["Dedicated Mobile Apps (Phase 12 — Future Scope)"]
        APP["108 Ambulance Field Crew Mobile App (Flutter / PWA)"]
        BEDSIDE["Bedside Nurse & Doctor Companion App"]
        OFFLINE["SQLite Offline Cache & Sync (< 2KB Payloads)"]
    end

    AUTH --> WEB
    TRIAGE --> WEB
    ROUTING --> WEB
    BEDS --> WEB

    AUTH -.-> APP
    TRIAGE -.-> APP
    ROUTING -.-> APP
    OFFLINE -.-> APP

    WEB ==>|Dispatch Orders & Bed Allocations| CoreBackend
    CoreBackend ==>|Real-Time Web Push & Sync| APP
    APP ==>|Telemetry, Vitals & Arrival Confirmations| CoreBackend
    CoreBackend ==>|Live Command Telemetry| WEB
```

### Summary of Upcoming Phases
- **Phase 10: FIDO2 / WebAuthn Hardware Security Keys**: USB-C/NFC physical YubiKey 5 Series and biometric passkeys for zero-typing emergency resuscitation room logins.
- **Phase 11: Real-Time Bed & Oxygen IoT Telemetry**: PSA generator & LMO tank telemetry ingestion; automated bed pressure-mat sensors.
- **Phase 12: 108 Ambulance Field Crew Dedicated Mobile App**: Lightweight Flutter/PWA application engineered specifically for moving ambulances (high-contrast vibration-resistant UI, `< 2KB` payloads, SQLite offline cache, continuous GPS beaconing). Routine ward nurses, rotating doctors, and ambulance drivers operate this app, which syncs in a closed loop with this central web hub.
- **Phase 13: Zero-Email W3C Web Push & Acoustic Warning Beacons**: Native browser/mobile push via VAPID keys; WebSocket acoustic sirens for mass casualty events within 5km geofences.
- **Phase 14: Ayushman Bharat Digital Mission (ABDM) Integration**: National Health Authority (NHA) 14-digit ABHA ID integration, FHIR/HL7 M1/M2/M3 compliance.

### 🛡️ Security Audit Remediation Tracker (Hermes Agent Audit)
The automated Hermes security audit findings have been cataloged in [`.github/SECURITY_AUDIT_TRACKER.md`](.github/SECURITY_AUDIT_TRACKER.md) with ready-to-implement specifications for the upcoming light sprints:
- `Issue B1 (MEDIUM)`: Remove dev profile JWT secret fallback in `application-dev.yml`.
- `Issue B2 (MEDIUM)`: Enforce Content-Security-Policy (CSP) headers in `SecurityConfig.java`.
- `Issue B3 (MEDIUM)`: Eliminate permissive `permitAll()` endpoints without hospital tenant scoping.
- `Issue B4 (LOW)`: Cleanse template secret in `application-local.yml.example`.
- `Issue B5 (LOW)`: Document test profile fixed CSPRNG secret.

---

## User Onboarding Guide

TriageNet is built for real-world impact — from state health commanders managing 24 districts to triage nurses saving lives in rural emergency departments. This guide explains how each role uses the platform in plain language.

### For Healthcare Officers & Administrators

#### State Health Command (Super Admin)
You oversee the entire state of Jharkhand's healthcare emergency operations from a single dashboard.

| What You Can Do | How |
|-----------------|-----|
| **See the big picture** | Your dashboard shows all 24 districts and 111 hospitals at a glance — bed occupancy, ICU loads, and oxygen levels in real time |
| **Spot trouble early** | Hospitals nearing capacity (80%+) flash red on the live map. Amber means watch closely. Green means capacity is healthy |
| **Allocate district budgets** | In Inventory & Supplies, review district-wise needs and allocate annual budgets for medical equipment and consumables |
| **Approve district officers** | New District CMOs register themselves and appear in your Staff Queue for verification |
| **Track ambulances statewide** | The Regional Network map shows every 108 ambulance — dispatched, en route, or standing by — with coverage zones |

#### District Chief Medical Officer (District CMO)
You manage all hospitals within your assigned district.

| What You Can Do | How |
|-----------------|-----|
| **Monitor your district's hospitals** | Your dashboard filters automatically to show only hospitals in your district — their beds, ICU, equipment, and staff |
| **Balance resources between hospitals** | See which hospitals need more supplies and redistribute budget shares from the Inventory section |
| **Handle emergency overflows** | When a hospital in your district is full, the system suggests the nearest hospital with available capacity |
| **Approve hospital superintendents** | Verify and activate Medical Superintendent accounts for hospitals in your district |
| **View district risk reports** | Access district-level analytics — patient severity trends, admission velocity, and capacity forecasts |

#### Hospital Medical Superintendent (Hospital Admin)
You run the day-to-day operations of your hospital facility.

| What You Can Do | How |
|-----------------|-----|
| **Track bed occupancy in real time** | See exactly how many beds, ICU slots, and ventilators are available right now |
| **Manage department budgets** | Allocate your hospital's budget across departments — Trauma, ICU, Pediatrics, etc. |
| **Approve your clinical staff** | Verify and activate Triage Nurses, Ward Officers, and Dispatchers who register for your hospital |
| **View billing & revenue** | Track PM-JAY (Ayushman Bharat) claims, patient billing, and cost recovery metrics in Indian Rupees (₹) |
| **Check doctor availability** | See which specialists are on duty, on call, or off shift across all departments |

#### Emergency Triage Nurse
You are the first point of contact for patients arriving at the emergency department.

| What You Can Do | How |
|-----------------|-----|
| **Score patient severity instantly** | Enter vitals (oxygen level, heart rate, blood pressure, temperature, breathing rate, age) and get an AI-powered severity score from 0 to 100 |
| **Manage the priority queue** | Patients are automatically ranked by urgency. The sickest patients appear at the top |
| **Get AI clinical guidance** | The AI Clinical Decision Support suggests possible conditions and recommended actions based on vital patterns |
| **Flag shortages** | If your trauma bay is running low on ventilators or ICU beds, log it immediately — the AI will alert your superintendent and recommend pre-fetching supplies |

#### 108 Ambulance Dispatcher
You coordinate emergency ambulance services from the central dispatch desk.

| What You Can Do | How |
|-----------------|-----|
| **Find the best hospital for the patient** | Enter the incident type and patient condition — the system scores all nearby hospitals on travel time, ICU beds, ventilators, and specialist availability |
| **Pre-book a bed before arrival** | With one click, reserve an ICU bed at the receiving hospital and get a dispatch token (#JH-108-DISPATCH-XXXX) |
| **Track your fleet** | See all ambulances on the live map — which ones are dispatched, which are at the base, and what area each one covers |
| **Monitor arrival** | Live countdown timer shows ETA. When the ambulance arrives, mark it to trigger bed handover |

### Quick Start for New Users

```
Step 1: Open TriageNet → http://localhost:3000
Step 2: Click "Staff Registration" on the login page
Step 3: Fill in your details — Name, Staff ID, Hospital, Role
Step 4: Create a strong password
Step 5: Save your security keys (QR code + 12-word recovery phrase + backup codes)
Step 6: Wait for your supervisor to verify your account
Step 7: Once approved, log in and start your shift!
```

### How the System Helps Save Lives — A Real Scenario

> **Situation**: A road accident on NH-33 near Dhanbad. 5 critical patients need immediate care.
>
> 1. **108 Dispatcher** receives the call and enters incident details into TriageNet
> 2. The system instantly scores all hospitals near Dhanbad — PMCH Dhanbad has 2 ICU beds, but Patliputra Medical College is already at 90% capacity (flashing red on the map)
> 3. Dispatcher pre-books 3 beds at PMCH Dhanbad and 2 at Sadar Hospital Bokaro with one click each
> 4. Ambulances are dispatched with live GPS tracking and ETA countdowns
> 5. **Triage Nurses** at both receiving hospitals see the incoming patients in their queue with severity scores already computed
> 6. **Hospital Admin** at PMCH notices ventilator stock dropping — logs a shortage. The AI recommends pre-fetching 2 units from the district reserve before the next wave arrives
> 7. **District CMO** of Dhanbad sees the surge on their dashboard and reallocates emergency budget to cover the equipment gap
> 8. **State Health Command** monitors the entire incident from the statewide map, ready to escalate if more districts need to be involved
>
> **Result**: All 5 patients receive care within the golden hour. Zero bed-hunting delays.

### For Developers & Contributors

See the [Getting Started](#getting-started) section for technical setup instructions, the [System Architecture](#system-architecture) section for how the codebase is structured, and the [Tech Stack](#tech-stack) for technologies used.

Key entry points for development:
- **Frontend**: `frontend/components/triagenet/dashboard.tsx` — the central view router
- **Backend**: `src/main/java/com/triagenet/TriageNetApplication.java` — Spring Boot entry
- **Data**: `frontend/lib/jharkhand-data.ts` — all 79 hospital facilities with GPS coordinates
- **Algorithms**: `backend/src/main/java/com/triagenet/engine/` — Dijkstra, Hungarian Matcher, Severity Scorer

### For Recruiters & Evaluators

This project demonstrates:
- **Full-stack engineering**: Next.js 16 + Spring Boot 3.3.2 + PostgreSQL
- **Real-world data**: 79 actual government hospitals across 24 districts of Jharkhand with GPS coordinates
- **Production security**: JWT + TOTP 2FA + BIP-39 recovery + CSRF protection + 54+ automated tests
- **AI/ML integration**: Logistic Regression severity scoring with 98.88% cross-dataset transfer recall
- **GIS & spatial computing**: Leaflet maps, Haversine distance, Dijkstra routing, OpenRouteService
- **Role-based access control**: 6 hierarchical roles with 3-tier approval precedence
- **Government healthcare domain**: Designed for Jharkhand State Health Department operations

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

