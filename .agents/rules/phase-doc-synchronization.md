# Mandatory Phase Document Synchronization & Anti-Hallucination Rule

All AI coding agents (Google Antigravity / Gemini) operating on **TriageNet** MUST strictly follow this mandatory two-step protocol for every phase of development:

---

## 1. Pre-Phase Requirement: Read Essential Documents Before Development

**BEFORE** writing any code, starting a new phase, or implementing a new feature/module:
- All agents **MUST** read and inspect all 5 core source-of-truth documents located in the [`Essentials/`](file:///p:/TriageNet/Essentials) directory:
  1. [`brain.md`](file:///p:/TriageNet/Essentials/brain.md) — Standing context, project identity, non-negotiable priorities, and recent decisions.
  2. [`PRD.md`](file:///p:/TriageNet/Essentials/PRD.md) — Product scope, state-wide 24-district Jharkhand region, 6 RBAC user personas, and feature specifications.
  3. [`TRD.md`](file:///p:/TriageNet/Essentials/TRD.md) — System architecture, technical stack, 4 core algorithm formulations (`SeverityScorer.java`, `TriageQueueService.java`, `HungarianMatcher.java`, `DijkstraRouter.java`), and complete REST API surface contracts.
  4. [`ERD.md`](file:///p:/TriageNet/Essentials/ERD.md) — Database schema, JPA entity fields, relationships, foreign keys, and indexes.
  5. [`instructions.md`](file:///p:/TriageNet/Essentials/instructions.md) — Operational guidelines, coding standards, and verification workflows.

**Goal**: Prevent AI agents from making stale assumptions, hallucinating synthetic vs real datasets, creating duplicate abstractions, or breaking RBAC security boundaries.

---

## 2. Post-Phase Requirement: Synchronize Essential Documents Upon Phase Completion

**UPON COMPLETION** of any development phase, feature implementation, dataset modification, or architectural refactoring:
- All agents **MUST** update all 5 essential documents in `Essentials/` to reflect the latest state of the codebase:
  - Update **`brain.md`** with recent decisions, memory, and standing architectural context.
  - Update **`PRD.md`** with new feature additions, updated scope, or revised success criteria.
  - Update **`TRD.md`** with new API endpoints, updated module contracts, modified data structures, or refined algorithms.
  - Update **`ERD.md`** with table schema modifications, new entities, foreign keys, or database indexes.
  - Update **`instructions.md`** with updated verification workflows or new operational rules.
- Run `graphify update .` to synchronize the AST knowledge graph (`graphify-out/`).

**Rule Enforcement**: A phase, feature, or sprint is **NOT considered DONE** until all 5 essential documents and the knowledge graph have been updated and verified.
