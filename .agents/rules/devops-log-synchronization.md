# Mandatory DevOps Action & Decision Logging Rule

All AI coding agents (Google Antigravity, Gemini, Claude, Cursor, Copilot) operating on **TriageNet** MUST strictly adhere to this rule across all operating environments (**Linux** and **Windows**).

---

## 1. Context & Rationale

DevOps, containerization, deployment configurations, and infrastructure setups for TriageNet are actively performed on the **Linux** workstation, while development and triage sessions may also occur on **Windows** workstations.

To eliminate context loss, stale assumptions, and configuration drift across sessions and platforms:
- **`DEVOPS_LOG.md`** (located at `.agents/sync/DEVOPS_LOG.md`) serves as the persistent, chronological log of all DevOps decisions, actions, container setups, and deployment steps.

---

## 2. Pre-DevOps Execution Protocol

**BEFORE** undertaking any DevOps or infrastructure task (e.g. modifying Dockerfiles, updating `docker-compose.yml`, creating deployment scripts, altering CI/CD workflows, or configuring environment variables):

1. **Read `DEVOPS_LOG.md` & `HANDOFF.md`**: Inspect the latest log entries in [`.agents/sync/DEVOPS_LOG.md`](../sync/DEVOPS_LOG.md) and [`.agents/sync/HANDOFF.md`](../sync/HANDOFF.md) to understand current infrastructure state, active container setups, and previous architectural choices.
2. **Review Environment**: Identify whether the current session is executing on Linux or Windows to select appropriate commands (`bash` vs `powershell`, `./mvnw` vs `mvnw.cmd`).

---

## 3. Post-DevOps Execution Protocol

**UPON COMPLETION** of any DevOps action, script creation, container configuration, or deployment task:

1. **Update `DEVOPS_LOG.md`**: Append a new structured entry in [`.agents/sync/DEVOPS_LOG.md`](../sync/DEVOPS_LOG.md) using the standard schema:
   - **ID / Timestamp**: Unique entry ID (e.g. `[LOG-XXX]`) and ISO 8601 timestamp.
   - **Environment**: Operating system (`Linux (Fedora)` or `Windows 11`) and shell.
   - **Operator / Agent**: Agent identity and session role.
   - **Scope / Category**: (e.g. `Docker & Containers`, `CI/CD & Workflows`, `Deployment & Hosting`, `Secrets & Security`, `Networking`).
   - **Status**: `Completed` / `In Progress` / `Blocked`.
   - **Decisions Made & Rationale**: Why each decision was reached and trade-offs considered.
   - **Actions Executed & Files Modified**: Exact files touched and actions performed.
   - **Exact Commands Executed**: Shell commands run and their outcome.
   - **Instructions for Peer Agents (Windows / Linux)**: Crucial context and reproduction instructions for agents on other platforms.

2. **Cross-Document Synchronization**:
   - If the DevOps change impacts core architecture, high-level decisions, or environment requirements, update:
     - [`.agents/sync/DECISIONS.md`](../sync/DECISIONS.md)
     - [`Essentials/brain.md`](../../Essentials/brain.md)
     - [`Essentials/instructions.md`](../../Essentials/instructions.md)
3. **Commit / Sync Reminder**:
   - Ensure changes to `DEVOPS_LOG.md` are committed so they are readily available to agents pulling from git on other workstations.

---

## 4. Cross-Platform Guidelines

- **Line Endings**: Maintain LF (`\n`) for all `.sh` scripts, `Dockerfile`s, and YAML configs.
- **Paths**: Use repository-relative paths in documentation and scripts for seamless cross-platform resolution.
- **Portability**: Avoid machine-specific hardcoded absolute paths in configuration files.
