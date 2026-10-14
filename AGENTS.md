# AGENTS.md — Global Multi-Agent Standing Rules & Instructions for TriageNet

Welcome, AI coding agent. Whether you are running on **Linux** or **Windows**, in **Google Antigravity**, **Gemini**, **Cursor**, **Claude Code**, or another tool, you MUST follow these standing rules.

---

## 1. Primary Operating Rules

### Rule A: DevOps Decision & Action Logging (Linux <-> Windows Sync)
- **Primary Log File**: [`DEVOPS_LOG.md`](DEVOPS_LOG.md)
- **Full Rule Specification**: [`.agents/rules/devops-log-synchronization.md`](.agents/rules/devops-log-synchronization.md)
- **Mandatory Directive**:
  1. DevOps operations (Docker, Compose, scripts, deployment configurations, CI/CD, environment variables) are conducted on the Linux workstation and potentially on Windows.
  2. **BEFORE** doing any DevOps work, inspect [`DEVOPS_LOG.md`](DEVOPS_LOG.md) to review previous decisions, container states, and commands executed across environments.
  3. **AFTER** any DevOps work, record the action, rationale, commands executed, and instructions for Windows/Linux peer agents into [`DEVOPS_LOG.md`](DEVOPS_LOG.md).

### Rule B: Phase Document Synchronization & Anti-Hallucination
- **Core Specification**: [`.agents/rules/phase-doc-synchronization.md`](.agents/rules/phase-doc-synchronization.md)
- **Mandatory Directive**:
  1. **BEFORE** coding or starting a phase, inspect the 5 core documents in [`Essentials/`](Essentials/):
     - [`Essentials/brain.md`](Essentials/brain.md) — Standing context, project memory, and key architecture principles.
     - [`Essentials/PRD.md`](Essentials/PRD.md) — 24-district Jharkhand scope, 6 RBAC user roles, feature requirements.
     - [`Essentials/TRD.md`](Essentials/TRD.md) — Tech stack, REST API specs, and 4 hand-implemented algorithms (`SeverityScorer`, `TriageQueueService`, `HungarianMatcher`, `DijkstraRouter`).
     - [`Essentials/ERD.md`](Essentials/ERD.md) — PostgreSQL JPA entities and database schema.
     - [`Essentials/instructions.md`](Essentials/instructions.md) — Operating rules, build commands, and testing protocols.
  2. **AFTER** finishing any phase/feature, update all 5 documents in `Essentials/` and [`DECISIONS.md`](DECISIONS.md).

---

## 2. Environment Matrix & Cross-Platform Conventions

| Environment | Primary Scope | Commands / Wrappers | Line Endings |
| :--- | :--- | :--- | :--- |
| **Linux (Fedora)** | DevOps, Docker, Deployments, Shell Automation | `./mvnw`, `bash`, `docker compose` | LF |
| **Windows 11** | Full-Stack Dev, Testing, Frontend / Backend | `.\mvnw.cmd`, `PowerShell`, `npm` | CRLF / LF |

- Always use repository-relative paths in documentation and scripts so links resolve across both Linux and Windows.
- Keep shell scripts with LF line endings.
- Do not commit unverified secrets or hardcoded passwords.
