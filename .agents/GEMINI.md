# GEMINI.md — Antigravity Standing Instructions for TriageNet

This workspace is actively maintained across **Linux** (primary for DevOps & container infrastructure) and **Windows** (development & client testing). All Antigravity sessions MUST adhere to the following rules:

---

## 1. DevOps Action & Decision Logging
- **Log File**: [`.agents/sync/DEVOPS_LOG.md`](.agents/sync/DEVOPS_LOG.md)
- **Handoff Coordination**: [`.agents/sync/HANDOFF.md`](.agents/sync/HANDOFF.md)
- **Detailed Rule**: [`.agents/rules/devops-log-synchronization.md`](.agents/rules/devops-log-synchronization.md)
- **Directive**:
  - Always review [`.agents/sync/DEVOPS_LOG.md`](.agents/sync/DEVOPS_LOG.md) prior to running DevOps commands, creating containers, editing Docker/compose configs, or modifying deployment setups.
  - Every DevOps action and architectural decision executed on Linux (or Windows) must be logged in [`.agents/sync/DEVOPS_LOG.md`](.agents/sync/DEVOPS_LOG.md) with rationale, commands, affected files, and notes for peer agents.

---

## 2. Source-of-Truth Document Synchronization
- **Detailed Rule**: [`.agents/rules/phase-doc-synchronization.md`](.agents/rules/phase-doc-synchronization.md)
- **Core Documents**:
  - [`Essentials/brain.md`](Essentials/brain.md)
  - [`Essentials/PRD.md`](Essentials/PRD.md)
  - [`Essentials/TRD.md`](Essentials/TRD.md)
  - [`Essentials/ERD.md`](Essentials/ERD.md)
  - [`Essentials/instructions.md`](Essentials/instructions.md)
  - [`.agents/sync/DECISIONS.md`](.agents/sync/DECISIONS.md)
- Always read before starting work, and keep them synchronized upon completing phases or features.

---

## 3. Cross-Platform Guidelines
- **Paths**: Use repository-relative paths so links and documentation resolve properly on both Linux and Windows.
- **Line Endings**: LF (`\n`) for shell scripts, Dockerfiles, and YAML configs.
- **Maven**: Use `./mvnw` on Linux, `mvnw.cmd` on Windows.
