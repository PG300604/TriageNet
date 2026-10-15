# Cross-Platform Agent Handoff Sheet (Windows <-> Linux)

> **Purpose**: This file tracks active task ownership, pending handoffs, and synchronized state between the **Windows Agent** (Core Engineering, Spring Boot, Next.js, Flutter) and the **Linux Agent** (DevOps, Docker, CI/CD, Deployment, OCI/VPS).
> **Protocol**:
> 1. Read before starting any session on either workstation.
> 2. Whenever an agent finishes a milestone or requires an action from the other environment, post a handoff entry here.
> 3. Mark completed handoffs with `[RESOLVED]`.

---

## 📌 Current Work Division Matrix

| Domain | Responsible Workstation | Primary Agent Focus |
| :--- | :--- | :--- |
| **Backend Engine** | Windows (`P:\TriageNet`) | Spring Boot 3.3.2, JPA, Security, Dijkstra, Hungarian, ML Triage |
| **Frontend Web** | Windows (`P:\TriageNet`) | Next.js 16, Tailwind, Lucide, Clinical Leaflet Map HUD |
| **Mobile Apps (Phase 3)** | Windows (`P:\TriageNet`) | Flutter monorepo (`mobile/`) for 108 Ambulance, Bedside, and Command |
| **Containerization** | Linux (`/home/.../TriageNet`) | Docker multi-stage builds, rootless containers, multi-arch (ARM/AMD) |
| **DevOps & CI/CD** | Linux (`/home/.../TriageNet`) | GitHub Actions, test gates, vulnerability scans, Trivy |
| **Cloud Deployment** | Linux (`/home/.../TriageNet`) | OCI Always Free / Render / VPS orchestration, Nginx TLS, ORS container |

---

## 🔄 Active Handoff Log

### [HANDOFF-001] — 2026-10-14: Initialization of Multi-Device Architecture & Sync Directory
- **From**: Windows Agent
- **To**: Linux Agent
- **Status**: `ACTIONABLE_FOR_LINUX`
- **Context**: 
  - User approved shifting all sync & internal decision docs into `.agents/sync/` so the public GitHub root stays uncluttered.
  - User decided on **Flutter** for all future mobile apps (`mobile/`).
  - User requested evaluation of **Oracle Cloud (OCI) Always Free** (4 ARM OCPU / 24GB RAM) vs AWS for production hosting with Redis caching.
- **Action Required by Linux Agent**:
  1. Pull latest `main` containing `.agents/sync/`.
  2. Inspect `.agents/sync/DEVOPS_LOG.md` (moved from root).
  3. When beginning Docker/CI work on Linux, verify Docker Compose runs seamlessly on Linux host with the new file paths.
  4. Maintain all future DevOps log entries inside `.agents/sync/DEVOPS_LOG.md`.

### [HANDOFF-002] — 2026-10-14: Landing Page & Dashboard Stabilization Complete (0 Console Errors)
- **From**: Windows Agent
- **To**: Linux Agent / Next Windows Session
- **Status**: `RESOLVED`
- **Summary**:
  1. Localized mock patient and hospital names to authentic Jharkhand facilities (RIMS Ranchi, Sadar Hospital Ranchi, MGM Jamshedpur, SNMMCH Dhanbad).
  2. Aligned telemetry heap queue columns (`w-20` wait time, `w-56 sm:w-64` matched bed, `w-20` priority).
  3. Reordered hero card so Telemetry Header and controls render above the live ECG monitor.
  4. Removed full-bleed `ember-waves.png` overlay across `hero.tsx`, `interactive-graph-showcase.tsx`, and `cta-footer.tsx` to ensure uniform `#100904` background color across all sections.
  5. Resolved all console warnings:
     - Next.js Image `sizes="100vw"` and LCP eager loading.
     - Disabled `preload` on fonts (`Geist_Mono` and `Plus_Jakarta_Sans`).
     - Added `data-scroll-behavior="smooth"` to `<html>`.
     - Guarded `/api/auth/me` and `/api/auth/refresh` on landing page to eliminate 401s.
     - Guarded `/api/admin/staff/pending` with demo simulation fallback to eliminate 403s on `/dashboard`.
  6. Verified compilation (`npm run build`: 12/12 static routes generated cleanly).

---

## 📋 Next Milestone Checklist

- [x] **Windows**: Update all 5 `Essentials/` documents to reflect Phase 9.6 + Sprint 10 state.
- [x] **Windows**: Execute Phase 9.4 (Doctor & Clinician Profile Customization system with `<ClinicianProfileModal />`).
- [x] **Windows**: Clean Landing Page & Dashboard (0 console errors, authentic Jharkhand names, unified color scheme).
- [ ] **Windows**: Page-by-page feature breakdown & architectural walkthrough with user (Tomorrow).
- [ ] **Windows**: Execute Phase 9.7 (Inter-District Patient Referral & Cross-Boundary Transfer Protocol).
- [ ] **Windows / All (Final Milestone)**: **Phase 10** — High-Impact Pure Motion Graphics & Product Launch Showcase (OBS Studio + Motion Canvas algorithm visuals + Remotion UI telemetry + DaVinci Resolve Free 4K master timeline).
- [x] **Linux**: Refine Docker Compose with healthchecks, test containerized build with PostgreSQL 16.
- [x] **Linux**: Setup initial GitHub Actions CI workflow (`.github/workflows/ci.yml`) for backend Maven test & frontend build verification (100% Green!).
- [ ] **Linux / DevOps**: Script automated staging deployment (`scripts/deploy.sh`) for OCI Always Free ARM instance with Certbot TLS.
- [ ] **Both**: Export OpenAPI specification from Spring Boot for mobile contract synchronization.


### [HANDOFF-003] — 2026-10-15: Linux DevOps Hardening, Hermes Coordination & 100% Green CI Complete
- **From**: Linux Agent (Google Antigravity)
- **To**: Windows Agent / Next Session
- **Status**: `RESOLVED`
- **Summary**:
  1. **Host Toolchains Provisioned**: Eclipse Temurin JDK 17, Maven 3.9.9 (`./mvnw` wrapper), Node.js 20 LTS, Trivy 0.76.0, GitHub CLI 2.62.0.
  2. **Multi-Agent Task Sharing with Hermes**:
     - Task 1: `.env.example` template with strict fail-fast env vars.
     - Task 2: `nginx/default.conf` reverse proxy with `/healthz`, `/api/`, `/ws/`, `/_next/static/`, and security headers.
     - Task 3: `.github/workflows/ci.yml` pipeline with 3 parallel jobs.
  3. **Security Remediation**: Upgraded Spring Boot from 3.3.2 to 3.3.13 (CVE-2024-38816/38819 resolved). Patched frontend dependencies to Next.js 16.4.1 (0 criticals remaining). Cleansed hardcoded fallback secrets from Compose.
  4. **Local Multi-Container Stack (100% Healthy)**: `postgres:16-alpine`, `redis:7-alpine`, `triagenet-backend`, `triagenet-frontend`, and `nginx:alpine` running locally on port 80, 3000, 8080, 5432, and 6379.
  5. **CI/CD Fully Passing (100% Green)**: Resolved Surefire cross-test foreign key leakage, district seeding idempotence, and test hospital pollution. Run `38726310478` passed all jobs (Backend 71 tests, Frontend Next.js build, Trivy offline security scan).

### [HANDOFF-004] — 2026-10-16: GitHub Community Standards Suite Completed & Windows Parity 100% Verified
- **From**: Windows Agent (Google Antigravity)
- **To**: Linux Agent / User
- **Status**: `RESOLVED`
- **Summary**:
  1. **Full Windows Parity Verified**:
     - `.\backend\mvnw.cmd test` passed all 71 tests cleanly (`BUILD SUCCESS`, 0 failures, 0 errors) on Windows under Spring Boot 3.3.13.
     - `npm run build` completed in 6.0s (Turbopack) with 12/12 static routes generated cleanly.
  2. **GitHub Community Standards (Organized in `.github/`)**:
     - Completed all missing checklist items from GitHub's repository health profile inside `.github/` to keep root clean:
       - `.github/CODE_OF_CONDUCT.md`
       - `.github/CONTRIBUTING.md`
       - `.github/PULL_REQUEST_TEMPLATE.md`
       - `.github/ACCESSIBILITY.md`
       - `.github/LICENSE` (MIT)
  3. **Documentation Updated**:
     - Linked `README.md` badge and footer to `.github/LICENSE`.
     - Ready for page-by-page feature breakdown and architectural walkthrough with user.


