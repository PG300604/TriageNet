# DESIGN.md — TriageNet Modern Healthcare SaaS Design System

**Design Version:** 4.0 (Modern Clinical SaaS)  
**Primary Archetypes:** Boltshift (Fintech/SaaS Dashboard), Globetrans (Spatial Map Logistics HUD), Transaction History (Expandable Clinical Records), Bright (Modern Hierarchical CRM Table & Nav), Starline (Soft Tinted KPI & Metric Cards)  
**Primary Typography:** Plus Jakarta Sans (Geometric Humanist Sans-Serif)  
**Color System:** Warm Espresso (`#382416`), Terracotta (`#ea580c` / `#dc5000`), Warm Canvas (`#faf8f5` / `#fdfbf7`), Cream Beige (`#f7f2ea`) with Standardized Clinical Telemetry Accents (Emerald, Amber, Rose)

---

## 1. Design Vision & Philosophy

TriageNet 4.0 bridges the gap between emergency clinical governance and modern SaaS product design. Eliminating visual noise, prototype artifacts, and mechanical monospace clutter ("AI slop"), the new design language delivers:

1. **Human-Crafted Hierarchy**: Clear visual anchors, generous white space, and soft elevation (`shadow-xs`, `shadow-sm`, `shadow-md`) prioritizing cognitive ease for high-stress triage command centers.
2. **Unified Geometric Typography**: Universal adoption of **Plus Jakarta Sans** across all headers, KPI values, tables, and UI controls. Monospace is strictly reserved for technical tokens (e.g., Staff IDs, Cryptographic hashes, 108 Dispatch callsigns).
3. **Warm Authentic Palette**: Preserving the authentic government healthcare identity—grounded in warm espresso and rich terracotta—enhanced with soft porcelain/white card surfaces and subtle hairline borders (`border-stone-200/70`).
4. **Interactive Expandable Density**: Rather than overwhelming the user with dense data grids, data tables adopt the **Transaction History Expandable Row pattern**, allowing clinicians to expand any row into an organized 3-column clinical detail drawer.
5. **Floating Logistics HUD**: Overhaul of the emergency map into the **Globetrans Spatial HUD pattern**, featuring floating card panels for active 108 ambulance fleets, route progress, and live vitals telemetry.
6. **Doctor & Specialist Availability**: Transition from personal appointment booking (delegated to doctor-specific personal apps) to real-time on-duty medical staff and specialist rosters with active status and instant paging.

---

## 2. Color Palette & Token Architecture

| Token Name | Hex / Value | Role & Usage |
| :--- | :--- | :--- |
| **Canvas Background** | `#faf8f5` / `#fdfbf7` | Primary page canvas, warm porcelain undertone |
| **Card Surface** | `#ffffff` | Elevated data containers, modals, and floating panels |
| **Card Surface Muted** | `#f7f2ea` | Table headers, secondary pill buttons, inactive tabs |
| **Primary Brand (Espresso)** | `#382416` | High-contrast headings, primary buttons, active nav pills |
| **Accent Primary (Terracotta)** | `#ea580c` / `#dc5000` | Critical indicators, active accent icons, hero KPI gradients |
| **Border Subtle** | `rgba(56, 36, 22, 0.08)` / `#e7e5e4` | Hairline card borders, table dividers |
| **Text Primary** | `#2c1b0e` / `#1c1917` | Headings, primary metrics, table values |
| **Text Muted** | `#78716c` / `#64748b` | Field labels, timestamps, metadata |
| **Clinical Critical (P1)** | `#e11d48` (Rose-600) | S≥80 Acuity, Red Triage, Preemption Alerts |
| **Clinical Urgent (P2)** | `#d97706` (Amber-600) | S 50-79 Acuity, Amber Triage, Capacity Strain |
| **Clinical Delayed (P3)** | `#059669` (Emerald-600) | S <50 Acuity, Green Triage, Available Beds |
| **Hero Card Gradient** | `from-[#ea580c] to-[#c2410c]` | Featured KPI card (Emergency Bed Capacity / Critical Queue) |

---

## 3. Typography Hierarchy (Plus Jakarta Sans)

- **Page Title**: `text-2xl font-bold tracking-tight text-[#382416]`
- **Section Heading**: `text-lg font-bold text-[#382416]`
- **Card Title**: `text-sm font-semibold text-[#382416]`
- **Card Eyebrow / Label**: `text-[11px] font-semibold text-stone-400 uppercase tracking-wider`
- **KPI Large Number**: `text-3xl font-extrabold text-[#382416] tracking-tight`
- **Body & Table Text**: `text-xs font-medium text-stone-700`
- **Micro Metadata**: `text-[11px] font-normal text-stone-400`
- **Technical Monospace (Scoped)**: `font-mono text-xs font-semibold text-stone-600` (Used only for IDs: `JH-CMO-2001`, `ALS-1081`, `P-101`)

---

## 4. Component Archetypes & Layout Patterns

### A. Boltshift & Starline 4-Column KPI Grid
- **Hero Card (Card 1)**: Gradient background (`from-[#ea580c] to-[#c2410c]`), white typography, frosted glass pill badge (`bg-white/20 text-white`), circular icon badge.
- **Secondary Metric Cards (Cards 2–4)**: Pure white background, circular icon avatar (`size-10 rounded-full flex items-center justify-center bg-stone-100 text-stone-700`), bold numeric readout, and rounded trend pills (`↑ 4.9% vs last week`).
- **Segmented Radial Capacity Gauge**: Boltshift-style arc gauge showing real-time district bed occupancy percentage with color-coded risk bands.

### B. Transaction History Expandable Table Row
- Standard view displays patient/record summary (Name, ID, Acuity, Status Pill, Wait Time).
- Clicking any row smoothly animates an accordion drawer with 3 structured columns:
  1. **Column 1 — Presenting Vitals & Acuity**: Heart Rate, SpO2, Systolic BP, MEWS score, chief complaint.
  2. **Column 2 — Hungarian Matching Breakdown**: Assigned Bed type, distance, compatibility score, attending physician.
  3. **Column 3 — Clinical Actions**: Discharge, Preempt bed, Trigger Dijkstra transfer, Page on-duty specialist.

### C. Globetrans Floating Logistics Map HUD
- Full-bleed Leaflet spatial map showing Jharkhand road network, hospital nodes, and ambulance positions.
- **Left Floating Overlay Panel**: Search bar, filter pills (`On Route`, `At Hospital`), active ambulance dispatch cards with driver details, initial ETA, and contact action buttons.
- **Bottom Floating Overlay Card**: Real-time transit telemetry for selected transport (patient vitals, remaining distance in km, minute countdown, emergency intake trigger).

### D. Bright Leads Hierarchical Navigation
- Clean left sidebar with compact logo mark, global search shortcut (`⌘K`), grouped navigation categories (`Clinical Command`, `Analytics & Governance`), active pill indicator (`bg-[#382416] text-[#ffedd7]`), and bottom profile card.

### E. Doctor & Specialist Availability Module
- Real-time medical personnel availability tracking:
  - Top metrics: Total On-Duty Doctors, In Emergency/Surgery, Available for Immediate Triage, Specialty Coverage.
  - Specialty filter pills: All, Trauma Surgery, Cardiology, Pulmonology, General Medicine, Anesthesiology, Pediatrics.
  - Doctor cards/table: Doctor Name, Department, Qualification, Assigned Hospital & Wing/OPD, Duty Status (`Available`, `In Emergency`, `In Surgery`, `On Call`), Patient Load, and "Page Specialist" action.

---

## 5. View Architecture Matrix

| View Key | Title | Reference Design Pattern | Core Functionality |
| :--- | :--- | :--- | :--- |
| `capacity` | **Dashboard & Analytics** | Boltshift KPI + Radial Arc Gauge | Bed utilization, ICU reserve, simulation player, live facilities |
| `queue` | **Triage Queue** | Transaction History Expandable Table | Priority heap, Hungarian bed matching rationale, preemption |
| `network` | **Regional Network** | Globetrans Floating Map HUD | 108 Ambulance dispatch, Dijkstra spatial transfer routing |
| `patients` | **Patient Directory** | Bright Leads Table + Diagnostic Card | Patient directory, searchable records, interactive ML vitals scorer |
| `doctors` | **Doctors & Specialists** | Modern SaaS Personnel Directory | Real-time on-duty doctor roster, specialty filter, paging |
| `clinical` | **Clinical Operations** | Clean Card Grid + Bed Matrix | Bed management, ward operations, room allocation |
| `aicds` | **AI Decision Support** | Split Diagnostic Terminal | Predictive clinical analytics, risk trajectory modeling |
| `billing` | **Revenue & Ayushman** | Modern Financial Ledger | Ayushman Bharat coverage, PM-JAY claim tracking, bed billing |
| `docs` | **EHR & Medical Records** | Document Card Grid | Discharge summaries, clinical audit trails, lab reports |
| `supplies` | **Inventory & Supplies** | Starline Inventory Telemetry | Ventilators, blood bank, oxygen supplies, AI supply dispatch |
| `reports` | **Reports & Telemetry** | Boltshift Analytic Cards | Regional clinical risk telemetry, mortality prevention logs, export |
| `comms` | **Emergency Comms** | Clean Streamlined Messaging | Inter-hospital emergency dispatch radio and alerts |
