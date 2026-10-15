# DEVOPS_LOG.md — TriageNet DevOps Decisions & Action Log

> **Purpose**: This file is the single source of truth for all DevOps actions, infrastructure decisions, container configurations, CI/CD pipelines, and deployment operations. It enables seamless context sharing and synchronization between agents running on **Linux** and **Windows**.
>
> **Mandatory Rule for All Agents**: Any agent performing DevOps or infrastructure actions MUST record every decision, change, command, and verification result in this log. See [`.agents/rules/devops-log-synchronization.md`](.agents/rules/devops-log-synchronization.md) and [`AGENTS.md`](AGENTS.md).

---

## 1. System & Environment Matrix

| Parameter | Linux Environment (Current Primary for DevOps) | Windows Environment (Client / Full-Stack Agent) |
| :--- | :--- | :--- |
| **OS** | Linux (Fedora 44 / x86_64) | Windows 11 / x86_64 |
| **Primary Shell** | `bash` | `PowerShell` / `cmd` |
| **Workspace Path** | `/home/priyanshughosh/Projects/TriageNet` | `P:\TriageNet` |
| **Docker Engine** | Docker 29.8.2 (build 2.fc44), rootless/docker group | Docker Desktop / WSL2 |
| **Docker Compose** | v5.6.0 | Docker Compose v2+ |
| **Java SDK** | OpenJDK 25.0.2 | OpenJDK 21 / 25 |
| **Git Version** | 2.53.0 | Git for Windows |
| **Line Endings** | LF (`\n`) | CRLF (`\r\n`) / Git core.autocrlf |
| **Git Remote** | `origin -> https://github.com/PG300604/TriageNet.git` | `origin -> https://github.com/PG300604/TriageNet.git` |

---

## 2. Cross-Environment Guidelines (Linux <-> Windows)

1. **Path Conventions**:
   - Always write relative paths (e.g. `backend/Dockerfile`, `docker-compose.yml`) in configs and documentation so they resolve identically on both Linux and Windows.
2. **Line Endings & Shell Scripts**:
   - Shell scripts (`.sh`) MUST use LF line endings. Never commit CRLF in shell scripts or Dockerfiles.
   - Use `./mvnw` on Linux/macOS and `mvnw.cmd` on Windows.
3. **File Permissions**:
   - Ensure executable permissions (`chmod +x`) on scripts and wrappers (`./backend/mvnw`) are preserved in Git (`git update-index --chmod=+x ...`).
4. **Environment Variables & Secrets**:
   - Store local environment overrides in `.env` / `.env.local` (kept in `.gitignore`). Never commit raw secrets to Git.
5. **Git Synchronization**:
   - Always commit and push DevOps changes after completing a task so agents operating on Windows receive up-to-date context immediately upon pulling `main`.

---

## 3. DevOps Decision & Action Log

### [LOG-001] — 2026-10-14: Initialization of Linux DevOps Environment & Cross-Platform Logging Protocol

- **Timestamp**: `2026-10-14T12:45:00+05:30`
- **Environment**: Linux (Fedora 44, `x86_64`)
- **Operator / Agent**: Google Antigravity (Linux DevOps Session)
- **Scope / Category**: Environment Provisioning, Cross-Agent Architecture, Rules Enforcement
- **Status**: Completed

#### Context & Objectives
The project maintainer (@PG300604) established a dedicated Linux workstation for all TriageNet DevOps, containerization, and deployment activities. Because development and operational agents operate across both Windows (`P:\TriageNet`) and Linux (`/home/priyanshughosh/Projects/TriageNet`), a strict synchronization protocol and persistent rule was required to guarantee context continuity across sessions and operating systems.

#### Decisions Made
1. **Designate `DEVOPS_LOG.md` as Persistent Log**: Every DevOps action, architectural choice, container tweak, and deployment step will be appended chronologically to this file.
2. **Establish Automatic Rule Enforcement**:
   - Created workspace rule `.agents/rules/devops-log-synchronization.md` (auto-discovered by Antigravity).
   - Created root `AGENTS.md` and `GEMINI.md` for universal discovery across any agent runtime.
   - Updated `Essentials/instructions.md` and `Essentials/brain.md` to link and mandate `DEVOPS_LOG.md`.
3. **Verified Linux Host Capabilities**:
   - Docker Engine 29.8.2 and Docker Compose 5.6.0 are operational with active daemon access.
   - OpenJDK 25.0.2 is available for backend builds and Maven wrapper executions.
   - Git 2.53.0 is configured on `main` tracking `origin/main`.

#### Actions Executed
- Audited repository layout and existing container specifications (`docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`).
- Verified Docker daemon connectivity (`docker ps`).
- Created `DEVOPS_LOG.md` with environment matrix, guidelines, and entry schema.
- Created `.agents/rules/devops-log-synchronization.md`.
- Created root `AGENTS.md` and `GEMINI.md`.
- Updated `Essentials/instructions.md` and `Essentials/brain.md`.
- Logged architecture entry in `DECISIONS.md`.

#### Instructions for Windows Agents
- Pull the latest `main` branch before starting any development or triage work.
- When reviewing DevOps or deployment questions, inspect `DEVOPS_LOG.md` first to understand recent changes made on the Linux workstation.
- If you make any Docker, Compose, CI/CD, or deployment-related changes on Windows, record your actions in `DEVOPS_LOG.md` following this same schema, noting `Windows` under the `Environment` field.

### [LOG-002] — 2026-10-14: Modal Portal Containment Fix & Statewide Facility Clutter Filtering (Windows)

- **Timestamp**: `2026-10-14T17:05:00+05:30`
- **Environment**: Windows 11 (`P:\TriageNet`)
- **Operator / Agent**: Google Antigravity (Windows Client Agent)
- **Scope / Category**: UI Architecture, Portal Rendering, Statewide 111-Hospital UX Optimization
- **Status**: Completed & Verified

#### Context & Issues Addressed
1. **Clinician Profile Modal Containment Bug**: Clicking the doctor profile card in `<header>` (`top-bar.tsx`) squished the modal into a tiny ~64px box. Because `<header>` applied `backdrop-blur-md`, CSS specifications established a new containing block for `fixed` descendants.
2. **111-Facility Visual Clutter**:
   - `ClinicalView` (`clinical-view.tsx`) mapped all 111 hospitals as buttons wrapping indefinitely across the screen.
   - `ReportsView` (`reports-view.tsx`) rendered all 111 hospitals in an unbounded vertical list in the Regional Acuity Distribution panel and Facility Matrix.
3. **Theme & Dark Mode Styling**: User preferred the dark charcoal/walnut & glowing amber aesthetic (`#181512`, `#12100e`, `#ea580c`) active in their browser.

#### Actions Executed
- Updated `frontend/components/triagenet/clinician-profile-modal.tsx`:
  - Imported `createPortal` and mounted modal directly to `document.body`.
  - Added dedicated "Sign Out / Switch Clinician" button calling `logout()` to easily return to `/login`.
  - Styled with deep charcoal/amber theme (`#181512`, `#12100e`, `#ea580c` accents).
- Updated `frontend/components/triagenet/clinical-view.tsx`:
  - Implemented categorized command toolbar with District filter (all 24 Jharkhand districts), Tier selector chips (Tertiary, District, SDH, CHC), search input, active facility card, popover facility selector, and quick-access pills.
- Updated `frontend/components/triagenet/reports-view.tsx`:
  - Added district/tier/search filters and 6-per-page pagination with "View All" toggle to both "Regional Acuity Distribution" and "Facility Capacity & Clinical Load Matrix".
- Verified compilation with Next.js Turbopack (`npm run build` -> 12/12 routes generated cleanly).

### [LOG-003] — 2026-10-14: React 19 Script False-Positive & SSR Hydration Mismatch Resolution (Windows)

- **Timestamp**: `2026-10-14T17:15:00+05:30`
- **Environment**: Windows 11 (`P:\TriageNet`)
- **Operator / Agent**: Google Antigravity (Windows Client Agent)
- **Scope / Category**: React 19 & Next.js 16 Hydration Stability
- **Status**: Completed & Verified

#### Context & Issues Addressed
1. **React 19 False-Positive Script Warning**: React 19 flags the internal anti-FOUC inline script injected by `next-themes` (`ThemeProvider`) during development with `Console Error: Encountered a script tag while rendering React component`.
2. **SSR Hydration Mismatch on Sidebar Queue Badge**: `Sidebar` rendered `criticalCount` (SSR server evaluated 4, client evaluated 5 as state synchronized), triggering `Recoverable Error: Hydration failed because the server rendered text didn't match the client`.

#### Actions Executed
- Updated `frontend/components/theme-provider.tsx`:
  - Filtered out the development-only React 19 false-positive warning for `next-themes` anti-FOUC script.
- Updated `frontend/components/triagenet/sidebar.tsx`:
  - Added `mounted` condition and `suppressHydrationWarning` on the `queue` badge and profile card text.
- Verified build: `npm run build` passes with 0 errors across all 12 routes.

### [LOG-004] — 2026-10-14: Dashboard Client-Mounting Hydration Barrier (Windows)

- **Timestamp**: `2026-10-14T17:20:00+05:30`
- **Environment**: Windows 11 (`P:\TriageNet`)
- **Operator / Agent**: Google Antigravity (Windows Client Agent)
- **Scope / Category**: Hydration Stability, Client Lifecycle Mounting
- **Status**: Completed & Verified

#### Context & Issue Addressed
In `CapacityView` (`components/triagenet/capacity-view.tsx:168`), the dynamic metric `{waitingPatientsCount} Patients Waiting in Queue` evaluated to 1 on server SSR and 2 on the client as the simulation engine initialized, triggering a recoverable hydration warning.

#### Actions Executed
- Updated `frontend/components/triagenet/dashboard.tsx`:
  - Added a client-mounting barrier (`const [mounted, setMounted] = useState(false)` with `useEffect`) that renders a matching command center loader on SSR and initial hydration, switching to the active live dashboard once mounted.
- Updated `frontend/components/triagenet/capacity-view.tsx`:
  - Added `suppressHydrationWarning` on dynamic queue wait and patient count elements.
- Verified build: `npm run build` completed cleanly in Turbopack (`✓ Generating static pages using 13 workers (12/12) in 1939ms`).

### [LOG-005] — 2026-10-14: Landing Page Healthcare Localization & Console Bug Fixes (Windows)

- **Timestamp**: `2026-10-14T21:35:00+05:30`
- **Environment**: Windows 11 (`P:\TriageNet`)
- **Operator / Agent**: Google Antigravity (Windows Client Agent)
- **Scope / Category**: UI/UX Refinement, Console Error Resolution, Regional Localization
- **Status**: Completed & Verified

#### Context & Objectives Addressed
1. **Console Warnings Cleared**:
   - Fixed Next.js Image warning (`Image with src "/ember-waves.png" has "fill" but is missing "sizes" prop`) across `hero.tsx`, `interactive-graph-showcase.tsx`, and `cta-footer.tsx`.
   - Prevented public landing page visitors from triggering unauthenticated `401 Unauthorized` network logs on `/api/auth/me` by checking `triagenet_session_active` in `auth-context.tsx`.
2. **Authentic Regional Healthcare Names**:
   - Replaced foreign placeholder names with realistic Jharkhand names: Rahul Mahato, Anita Soren, Sunil Birhor, Deepak Munda.
   - Replaced simulated regional hospitals with actual Jharkhand healthcare facilities: RIMS Ranchi, Sadar Hospital Ranchi, MGM Medical College Jamshedpur, SNMMCH Dhanbad.
   - Updated Dijkstra active route copy to `RIMS RANCHI ➔ MGM JAMSHEDPUR (18 MIN)`.
3. **Queue Telemetry Column Alignment**:
   - Replaced variable-width flex row in `hero.tsx` with structured fixed-width columns (`w-20` for Wait Time, `w-56 sm:w-64` for Matched Bed, `w-20` for Priority score), ensuring perfect vertical alignment across all cards.
4. **Clean Design Language**:
   - Removed technical pill badges (`O(N^2)`, `O(LOG N)`, `LOGISTIC REGRESSION`, etc.) and dead link arrow buttons.
   - Replaced formulas (`P = Severity + 0.45(Wait Minutes)`) with clear clinical explanations.
   - Removed personal student credits in hero card and footer while maintaining GitHub repository and Live Console navigation.
5. **Build Verification**:
   - `npm run build` completed with 0 errors across 12 static routes (`12/12 in 870ms`).

### [LOG-006] — 2026-10-14: Dashboard Console Error Elimination & Demo Staff Verification (Windows)

- **Timestamp**: `2026-10-14T22:05:00+05:30`
- **Environment**: Windows 11 (`P:\TriageNet`)
- **Operator / Agent**: Google Antigravity (Windows Client Agent)
- **Scope / Category**: Console Error Resolution, Demo Authorization Simulation, Next.js Routing
- **Status**: Completed & Verified

#### Context & Issues Addressed
1. **Next.js `data-scroll-behavior="smooth"` Warning**:
   - `Detected 'scroll-behavior: smooth' on the '<html>' element. To disable smooth scrolling during route transitions, add 'data-scroll-behavior="smooth"' to your '<html>' element.`
   - Resolved by adding `data-scroll-behavior="smooth"` directly on `<html ...>` in `frontend/app/layout.tsx`.
2. **Font Preload Warning**:
   - `...woff2 was preloaded using link preload but not used within a few seconds from the window's load event.`
   - Resolved by setting `preload: false` on `Plus_Jakarta_Sans` in `frontend/app/layout.tsx`.
3. **403 Forbidden on `/api/admin/staff/pending`**:
   - In demo mode, Spring Boot returned 403 Forbidden because no real backend `SUPER_ADMIN` cookie session exists.
   - Guarded `checkPendingStaff` in `dashboard.tsx` with `triagenet_session_active`. In demo mode, provides mock pending count (2) and simulated pending staff roster in `staff-approval-modal.tsx`, allowing full interactive verification workflow without 403 network failures.
4. **Unified Background Tint**:
   - Completely removed `ember-waves.png` texture overlay from `hero.tsx`, `interactive-graph-showcase.tsx`, and `cta-footer.tsx` to unify `#100904` background seamlessly.
5. **Build Verification**:
   - `npm run build` passed cleanly in Turbopack (`12/12 in 835ms`).

### [LOG-007] — 2026-10-15: Linux Host DevOps Toolchain Provisioning & Portable Wrapper Setup

- **Timestamp**: `2026-10-15T14:08:00+05:30`
- **Environment**: Linux (Fedora 44, `x86_64`)
- **Operator / Agent**: Google Antigravity (Linux DevOps Session)
- **Scope / Category**: Host Toolchain Installation, Node.js 20 LTS, Apache Maven 3.9, Trivy Scanner, Cross-Platform Maven Wrapper
- **Status**: Completed & Verified

#### Context & Actions Executed
1. **Node.js & npm Setup**:
   - Installed Node Version Manager (`nvm` v0.40.1) in user-space (`~/.nvm`).
   - Provisioned Node.js `v20.20.2` LTS and `npm` `10.8.2`.
   - Created symlinks in `~/.local/bin` (`node`, `npm`, `npx`) ensuring immediate availability across subshells and background processes.
2. **Apache Maven Setup**:
   - Installed Apache Maven 3.9.9 in `~/.local/share/apache-maven-3.9.9` with symlink at `~/.local/bin/mvn`.
   - Verified runtime execution alongside OpenJDK 25.0.4.
3. **Portable Maven Wrapper**:
   - Generated official Maven wrapper scripts inside `backend/` (`mvn wrapper:wrapper`).
   - Made `backend/mvnw` executable (`chmod +x`). Verified `./mvnw -version` succeeds on Linux, establishing parity with `mvnw.cmd` on Windows.
4. **Trivy Vulnerability Scanner**:
   - Installed Aqua Security Trivy `v0.76.0` binary into `~/.local/bin/trivy` for container image and secret vulnerability scanning.
5. **Toolchain Verification**:
   - Docker Engine: 29.8.2
   - Docker Compose: 5.6.0
   - Node.js: v20.20.2 / npm: 10.8.2
   - Java: OpenJDK 25.0.4 / Maven: 3.9.9 / `./backend/mvnw`
   - Trivy: 0.76.0

### [LOG-008] — 2026-10-15: Created `.env.example` Template for Environment Variables

- **Timestamp**: `2026-10-15T14:35:00+05:30`
- **Environment**: Linux (Fedora 44, `x86_64`)
- **Operator / Agent**: Hermes Agent (Linux DevOps Session)
- **Scope / Category**: Secrets & Security, Environment Configuration
- **Status**: Completed

#### Context & Decisions Made
Created `.env.example` at repository root as a version-controlled template for environment variables. Following AGENTS.md and `.agents/rules/devops-log-synchronization.md`, real secrets must never be committed; this file provides sensible development defaults for all services (Database, Redis, Spring Boot, Next.js, Nginx) with clear section headers and a prominent top warning.

#### Actions Executed
- Created `.env.example` with all required sections and development defaults.
- Added top-level warning: "DO NOT COMMIT REAL PRODUCTION SECRETS TO VERSION CONTROL."
- Verified file is tracked in workspace (not `.env` which remains gitignored).

### [LOG-009] — 2026-10-15: Temurin JDK 17 Setup, Full Verification Suites & Docker Compose Architecture Upgrade

- **Timestamp**: `2026-10-15T14:35:00+05:30`
- **Environment**: Linux (Fedora 44, `x86_64`)
- **Operator / Agent**: Google Antigravity (Linux DevOps Session)
- **Scope / Category**: Java Toolchain Fix, Test Verification, Container Hardening, Compose Topology
- **Status**: Completed & Verified

#### Context & Issues Addressed
1. **JDK Compiler Missing**: The Fedora host had OpenJDK JRE installed without `javac`. Provisioned Eclipse Temurin JDK 17 (`17.0.20.1`) in user-space (`~/.local/share/jdk-17`) and configured `JAVA_HOME` in `~/.bashrc`.
2. **Backend Verification**: Executed `./mvnw clean test` verifying 71/71 test suite passing (100% BUILD SUCCESS) on Linux.
3. **Frontend Verification**: Executed `npm run build` in `frontend/`, verifying 12/12 static pages build cleanly via Turbopack on Linux.
4. **Backend Dockerfile Hardening**: Updated `backend/Dockerfile` to utilize `maven:3.9-eclipse-temurin-17-alpine` as builder stage with dependency layer pre-fetching (`dependency:go-offline`) and non-root execution (`UID 1001:1001`). Verified image creation (`docker build -t triagenet-backend:test ./backend` succeeded in 167s).
5. **Security Scan**: Ran Aqua Security Trivy scan on `triagenet-backend:test` (0 Alpine OS vulnerabilities).
6. **Docker Compose Topology Upgrade**: Updated `docker-compose.yml` to include `redis:7-alpine` (for telemetry and queue caching), `nginx:alpine` (reverse proxy), healthchecks across all database and cache services, and isolated bridge network `triagenet-network`.
