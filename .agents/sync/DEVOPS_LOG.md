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
