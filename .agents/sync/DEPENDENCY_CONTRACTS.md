# Shared Dependency & API Contracts Matrix

> **Purpose**: Prevents version skew, broken API schemas, and incompatible runtime dependencies across Windows, Linux, and downstream Flutter mobile clients.

---

## 1. Runtime & Language Versions

| Layer | Component | Pinned Version | Notes |
| :--- | :--- | :--- | :--- |
| **Backend** | Java | `21-LTS` (Compatible up to JDK 25) | Docker uses eclipse-temurin:17 or 21 |
| **Backend** | Spring Boot | `3.3.2` | Upgraded in Phase 8.1 |
| **Backend** | JJWT | `0.12.5` | Strict $\ge 256$-bit CSPRNG entropy requirement |
| **Backend** | Database | PostgreSQL `16-alpine` | JPA Hibernate DDL validation in production |
| **Frontend** | Node.js | `20-alpine` | LTS |
| **Frontend** | Next.js | `16.3.4` (Turbopack) | Zero CVEs reported |
| **Frontend** | React | `18.3.1` | Standard with Next 16 |
| **Mobile** | Flutter SDK | `3.24+` / Dart `3.5+` | Monorepo planned under `mobile/` |
| **DevOps** | Docker | Compose `3.8+` | Hardened non-root containers (`UID 1001`) |

---

## 2. Shared Network & Port Specifications

| Service | Host Port | Container Port | Protocol / Path | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | `3000` | `3000` | HTTP | Next.js Web Command Dashboard |
| **Backend** | `8080` | `8080` | HTTP / REST | Spring Boot Core Engine API (`/api/**`) |
| **Database** | `5432` | `5432` | TCP / PostgreSQL | PostgreSQL Primary DB (`triagenet`) |
| **Cache (Future)** | `6379` | `6379` | TCP / Redis | Ambulance GPS telemetry & queue cache |
| **ORS (Future)**| `8082` | `8082` | HTTP | Self-hosted OpenRouteService with Jharkhand OSM |

---

## 3. Core API Endpoint Surface (Contract Baseline)

| Endpoint | Method | Scope | Auth Header / Cookie | Response Model |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | None | `LoginResponse` (Sets HttpOnly JWT) |
| `/api/auth/register` | `POST` | Public | None | `CryptoPacketResponse` (TOTP + BIP-39) |
| `/api/auth/status/{staffId}` | `GET` | Public | None | Status string (`PENDING_VERIFICATION`, `ACTIVE`) |
| `/api/auth/me` | `GET` | Authenticated | JWT Cookie / Bearer | `UserDto` |
| `/api/hospitals` | `GET` | Authenticated | Scoped | `List<Hospital>` |
| `/api/hospitals/{id}` | `GET` | Authenticated | Multi-tenant checked | `Hospital` |
| `/api/patients` | `GET` | Authenticated | Scoped | `List<Patient>` |
| `/api/patients` | `POST` | Triage Nurse+ | Scoped | `Patient` (clamped vitals) |
| `/api/routing/optimal` | `POST` | Dispatcher+ | Scoped | `OptimalRouteResponse` (Dijkstra) |
| `/api/referrals` | `POST` | Dispatcher/Admin | Scoped | `Referral` (`#JH-108-DISPATCH-XXXX`) |
| `/api/admin/staff/pending` | `GET` | Tier 1/2 Admin | Scoped | `List<StaffUser>` |
| `/api/admin/staff/{id}/approve` | `POST` | Tier 1/2 Admin | 3-tier precedence | `StaffUser` |
