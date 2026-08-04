<div align="center">

# 🏥 TriageNet

### AI-Powered Regional Hospital Triage, Resource Optimization & Financial Recovery System

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-6DB33F?logo=spring-boot)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/Python-ML_Pipeline-3776AB?logo=python)](https://python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An enterprise healthcare triage platform featuring **machine learning severity scoring**, **graph-based regional load balancing (Dijkstra)**, **multi-resource clinical compatibility matching**, **autonomous 24/7 AI supply demand dispatching**, and **equipment cost management with budget recovery in Indian Rupees (₹)**.

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
- [ML & Algorithmic Core](#ml--algorithmic-core)
- [License](#license)

---

## Overview

**TriageNet** is an enterprise healthcare operations platform engineered for real-time regional hospital network simulation, autonomous AI supply dispatch, clinical triage load balancing, and inventory equipment cost management.

The platform connects **4 regional facilities** (*City General Hospital, St. Mary's Trauma Center, Riverside Medical Center, and North District Hospital*) over a weighted graph network. When a facility experiences a capacity surge or mass casualty event, TriageNet's autonomous AI agents calculate exact situational resource deficits, route patient overflow via Dijkstra shortest-path algorithms, stream darkroom terminal telemetry, and manage inventory equipment maintenance costs in Indian Rupees (₹).

---

## Key Features

### 🤖 Autonomous AI Supply Demand & Dispatcher Engine
- **Autonomous 24/7 Telemetry Monitoring**: Continuously monitors regional hospital bed and ICU capacity loads without requiring manual button triggers.
- **Dynamic Situational Need Calculator**: Computes exact dynamic deficits based on real-time situation severity:
  - **Mass Casualty Situation**: High surge allocation (`+16 to +20 General Beds`, `+5 to +6 ICU Beds`, `+6 to +8 Emergency Ventilators`).
  - **Regional Surge Situation**: Moderate surge allocation (`+8 to +12 General Beds`, `+3 ICU Beds`, `+4 Emergency Ventilators`).
  - **Steady State**: Preventative buffer allocation (`+4 General Beds`, `+1 ICU Bed`, `+2 Emergency Ventilators`).
- **macOS/Linux Darkroom Terminal Modal**: Streams live 100% computed telemetry diagnostics, bottleneck issue metrics, AI proposed solutions, and embedded operator permission controls (`[y] CONFIRM & DISPATCH` vs `[n] REJECT`).

### 💰 AI Financial & Equipment Cost Management Agent (Indian Rupees ₹)
- **Zero Insurance Redundancies**: Dedicated strictly to general triage equipment asset tracking, maintenance costs, assigned hospital budgets, and revenue recovery.
- **Assigned Regional Budgets**: Manages ₹12.80 Crore total regional operating budget (City General: ₹3.5 Cr, St. Mary's: ₹2.4 Cr, Riverside: ₹4.1 Cr, North District: ₹2.8 Cr).
- **Equipment Maintenance Expense Ledger**: Capital asset tracking for Ventilators (₹15.20 Lakh/unit), ICU Bed Units (₹4.80 Lakh/unit), General Beds (₹1.10 Lakh/unit), Portable O₂ Generators (₹2.45 Lakh/unit), and Trauma Kits (₹65,000/kit).
- **Net Cost Recovery Surplus**: Computes `Gross Recovered Triage Revenue - Equipment Maintenance Expenses` (+₹1.46 Cr Surplus) with a **142.7% Cost Recovery Ratio**.
- **Interactive Darkroom Financial Terminal**: macOS CLI terminal streaming live financial telemetry, asset valuations, and budget health checks in Indian Rupees (₹).

### 📊 Real-Time Clinical Risk & Telemetry Dashboard
- **Severe Preemption Risk Index**: Real-time tracking of critical patients (Severity ≥ 80) queued and monitored for emergency bed preemption.
- **Interactive SVG Charts**:
  - **Queue Wait Latency Trend**: Smooth SVG line chart comparing Legacy Triage vs TriageNet AI Dijkstra routing.
  - **Regional Acuity Stacked Bar Graph**: Critical (S ≥ 80), Moderate (S 50-79), and Mild (S < 50) load per facility.
  - **Specialist Matching Donut Gauge**: Donut ring chart showcasing right-treatment specialist matching ratios (Pulmonologists 34%, Cardiologists 28%, Trauma Surgeons 22%, General Physicians 16%).
  - **Realtime Financial Cost vs Recovery Bar Graph**: Facility maintenance costs vs care revenue recovered in Indian Rupees (₹).

### 🎨 Enterprise Clinical Design System
- **100% Zero Informal Emoji Purge**: Clean, serious enterprise clinical UI utilizing Lucide iconography (`<AlertTriangle />`, `<ShieldAlert />`, `<CheckCircle2 />`, `<Terminal />`) and monospace bracketed tags (`[CRITICAL SURGE]`, `[STRAINED]`, `[NOMINAL]`).
- **Walnut Shadow & Cream Aesthetic**: Landing page (`#100904` Walnut Shadow) and Dashboard (`bg-gradient-to-br from-[#fdfbf7] via-[#f7f2ea]/80 to-[#ffffff]`).

---

## Autonomous AI Agents

| Agent Name | Primary Responsibility | Telemetry Output |
|------------|------------------------|------------------|
| **AI Supply Demand Agent** | Analyzes hospital surge loads, calculates dynamic bed & ventilator deficits, streams CLI terminal telemetry, and dispatches equipment upon human operator authorization | Live macOS/Linux CLI Terminal (`ai-supply-terminal-modal.tsx`) |
| **AI Financial Cost Recovery Agent** | Tracks equipment asset valuations, manages ₹12.80 Cr operating budget, calculates maintenance costs, and auto-reallocates revenue recovery surpluses (+₹1.46 Cr) | Live macOS/Linux CLI Terminal (`ai-financial-terminal-modal.tsx`) |
| **Dijkstra Regional Overflow Agent** | Evaluates weighted network graph to route patient overflow to non-congested facilities with matching equipment & specialist physicians | Real-Time Routing Latency Trend Chart (`reports-view.tsx`) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (Turbopack) · React 19 · Tailwind CSS v4 · Framer Motion · Lucide React |
| **Backend** | Spring Boot 3.4 · Java 21 · Spring Security + JWT Auth |
| **ML Pipeline** | Python · scikit-learn · Logistic Regression Severity Scorer |
| **Database** | PostgreSQL 16 (H2 in-memory for local dev) |
| **Currency & Formatting** | Indian Rupees (₹) formatting with Cr/Lakh notation |

---

## Getting Started

### Prerequisites
- Node.js 18+ & npm
- Java 21 & Maven (for Spring Boot backend)

### 1. Frontend Installation & Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 2. Backend Installation & Setup
```bash
powershell -ExecutionPolicy Bypass -Command ".\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=local'"
```

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
