# Contributing to TriageNet

First off, thank you for considering contributing to **TriageNet**! 🎉

TriageNet is an open-source, AI-powered emergency healthcare triage and spatial resource allocation platform engineered for the 24 districts of Jharkhand, India. Every contribution—whether reporting a bug, improving documentation, designing accessible UI components, or optimizing matching algorithms—helps ensure emergency medical care reaches patients faster and more reliably.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
  - [Prerequisites](#prerequisites)
  - [Cross-Platform Toolchains](#cross-platform-toolchains)
  - [Running the Backend](#running-the-backend)
  - [Running the Frontend](#running-the-frontend)
  - [Full Stack with Docker Compose](#full-stack-with-docker-compose)
- [Testing Guidelines](#testing-guidelines)
- [Coding Conventions & Style](#coding-conventions--style)
- [Documentation & Sync Policy](#documentation--sync-policy)
- [Security Disclosures](#security-disclosures)

---

## Code of Conduct

This project adheres to the Contributor Covenant 2.1. By participating, you are expected to uphold this code. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for reporting guidelines and community standards.

---

## How Can I Contribute?

### Reporting Bugs

Before creating an issue, please search existing issues to see if it has already been reported.

When creating a bug report, include:
- A clear, descriptive title
- Operating system and environment details (Linux / Windows, Node.js version, JDK version)
- Steps to reproduce the behavior
- Expected vs. actual behavior
- Relevant terminal or browser console logs
- Screenshots if applicable

### Suggesting Enhancements

Enhancement suggestions should explain:
- The problem or inefficiency being solved
- Proposed solution or UX improvement
- Impact on Jharkhand emergency response workflows (dispatchers, doctors, CMOs, triage nurses)

### Pull Requests

1. **Fork the repository** and create a descriptive branch from `main`:
   ```bash
   git checkout -b feat/triage-score-enhancement
   # or
   git checkout -b fix/auth-token-refresh
   ```
2. **Follow commit conventions**: Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `perf:`, `refactor:`, `test:`).
3. **Keep changes focused**: Small, single-purpose pull requests are reviewed and merged much faster.
4. **Include tests**: All new features and bug fixes must include unit or integration test coverage.
5. **Update documentation**: If modifying data models or APIs, update the corresponding files in `Essentials/`.

---

## Development Setup

### Prerequisites

- **Java JDK 17** (Eclipse Temurin 17 recommended)
- **Node.js 20+** and `npm`
- **Docker & Docker Compose v2+** (for containerized PostgreSQL 16 and Redis 7)
- **Git**

### Cross-Platform Toolchains

| OS | Shell | Maven Wrapper | Docker Command | Line Endings |
| :--- | :--- | :--- | :--- | :--- |
| **Linux (Fedora/Ubuntu)** | `bash` / `zsh` | `./backend/mvnw` | `docker compose` | LF |
| **Windows 11** | PowerShell / CMD | `.\backend\mvnw.cmd` | `docker compose` | CRLF / LF |

> [!IMPORTANT]
> Always keep shell scripts (`.sh`), Dockerfiles, and YAML configurations formatted with LF (`\n`) line endings.

### Running the Backend

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Start local PostgreSQL and Redis dependencies (or use existing containers):
   ```bash
   # From root:
   docker compose up -d postgres redis
   ```
3. Run the Spring Boot application:
   ```bash
   # Linux:
   ./mvnw spring-boot:run

   # Windows:
   .\mvnw.cmd spring-boot:run
   ```
4. Verify backend health:
   ```bash
   curl http://localhost:8080/actuator/health
   # or
   curl http://localhost:8080/api/v1/auth/health
   ```

### Running the Frontend

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:3000`.

### Full Stack with Docker Compose

To run the entire platform with Nginx reverse proxy, PostgreSQL, Redis, Spring Boot, and Next.js:

```bash
docker compose up --build -d
```
All endpoints will be proxied through Nginx on port `80`:
- Frontend: `http://localhost/`
- Backend API: `http://localhost/api/`
- WebSocket: `ws://localhost/ws/`
- Nginx Healthcheck: `http://localhost/healthz`

---

## Testing Guidelines

Before opening a pull request, verify that all test suites pass cleanly:

### Backend Tests
```bash
# Linux:
./backend/mvnw test

# Windows:
cd backend && .\mvnw.cmd test
```
All 71 test suites across security hardening, Dijkstra router, Hungarian matcher, and controller integration must pass with 0 failures and 0 errors.

### Frontend Linting & Build
```bash
cd frontend
npm run lint
npm run build
```
Verify 0 TypeScript compilation errors and 0 ESLint warnings.

---

## Coding Conventions & Style

### Java (Backend)
- Standard Java naming conventions (CamelCase for classes, camelCase for methods/variables).
- Strict separation of concerns: Controller -> Service -> Repository / Engine.
- Hand-implemented core algorithms reside in `com.triagenet.engine` (`SeverityScorer`, `TriageQueueService`, `HungarianMatcher`, `DijkstraRouter`).
- Defensive input validation with Jakarta Bean Validation annotations.

### TypeScript / React (Frontend)
- Next.js App Router paradigm.
- Tailwind CSS with the Jharkhand Emergency High-Contrast Dark Theme (`#100904` dark base, `#ffedd7` text, `#dc5000` emergency accent).
- Accessible components using Radix UI primitives and Lucide icons.
- Avoid exposing low-level algorithm details or raw academic complexity to emergency dispatch operators.

---

## Documentation & Sync Policy

TriageNet maintains a dual-environment synchronized documentation architecture:
- [`Essentials/PRD.md`](../Essentials/PRD.md): Product Requirements & Jharkhand 24-district operational model.
- [`Essentials/TRD.md`](../Essentials/TRD.md): Technical Requirements & Algorithm specs.
- [`Essentials/ERD.md`](../Essentials/ERD.md): PostgreSQL Schema & Entity relationships.
- [`Essentials/brain.md`](../Essentials/brain.md): Architecture memory & standing decisions.
- [`.agents/sync/DEVOPS_LOG.md`](../.agents/sync/DEVOPS_LOG.md): Multi-workstation DevOps audit trail.

If your PR introduces schema migrations, new endpoints, or configuration changes, update the relevant `Essentials/` files in the same pull request.

---

## Security Disclosures

Please do **NOT** report security vulnerabilities via public GitHub issues. Instead, review our [Security Policy](SECURITY.md) and report vulnerabilities securely to `priyanshu@triagenet.dev`.
