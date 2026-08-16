# instructions.md — Operating Instructions for Antigravity

These are the operational working rules for the AI coding agent (**Google Antigravity / Gemini**) building and maintaining **TriageNet**. Read [`brain.md`](file:///p:/TriageNet/Essentials/brain.md) first for standing context, then adhere strictly to these guidelines.

---

## 1. Session Workflow & Anti-Hallucination Directives

1. **Pre-Phase Mandatory Document Review**: Before starting any phase, feature, or code module, agents **MUST** read and inspect all 5 core source-of-truth documents in [`Essentials/`](file:///p:/TriageNet/Essentials): [`brain.md`](file:///p:/TriageNet/Essentials/brain.md), [`PRD.md`](file:///p:/TriageNet/Essentials/PRD.md), [`TRD.md`](file:///p:/TriageNet/Essentials/TRD.md), [`ERD.md`](file:///p:/TriageNet/Essentials/ERD.md), and [`instructions.md`](file:///p:/TriageNet/Essentials/instructions.md). Do not rely on unverified memory.
2. **Post-Phase Automatic Document Update**: Upon finishing development on any phase or feature, agents **MUST** immediately update all 5 essential documents in `Essentials/` (`brain.md`, `PRD.md`, `TRD.md`, `ERD.md`, `instructions.md`) and run `graphify update .` to reflect the latest codebase changes. A phase is **NOT DONE** until all documents are updated. (Enforced via [`.agents/rules/phase-doc-synchronization.md`](file:///p:/TriageNet/.agents/rules/phase-doc-synchronization.md)).
3. **Never Hallucinate Dataset Scope**: TriageNet is integrated with **100% authentic Jharkhand healthcare infrastructure data** (79 real facilities across 24 districts). Never revert to claiming data is purely synthetic or that real maps/geospatial coordinates are absent.
4. **Traceability**: Before writing or refactoring any module, ensure your implementation directly aligns with the technical contracts specified in `TRD.md` and `ERD.md`.
5. **Verification Requirement**: Never declare a task complete without executing concrete runtime verification (e.g. running unit tests or build commands).

---

## 2. Code Structure & Engineering Principles

### Backend (`backend/src/main/java/com/triagenet/`)
- Adhere strictly to standard Spring Boot layered architecture:
  - `controller/`: REST API controllers and RBAC annotation enforcement.
  - `service/`: Business logic, seeders, and referral orchestration.
  - `repository/`: Spring Data JPA interfaces.
  - `entity/`: JPA entities mapping to `ERD.md`.
  - `dto/`: Request/Response data transfer objects.
  - `config/`: Spring Security + JWT authentication rules.
  - `engine/`: Core algorithms ([`SeverityScorer.java`](file:///p:/TriageNet/backend/src/main/java/com/triagenet/engine/SeverityScorer.java), [`HungarianMatcher.java`](file:///p:/TriageNet/backend/src/main/java/com/triagenet/engine/HungarianMatcher.java), [`DijkstraRouter.java`](file:///p:/TriageNet/backend/src/main/java/com/triagenet/engine/DijkstraRouter.java)).
- Keep algorithm code clean, hand-coded, and thoroughly commented. Avoid replacing core algorithms with third-party library black boxes.

### Frontend (`frontend/`)
- Next.js 15 (App Router) + React 19 + Tailwind CSS + Lucide icons + Leaflet maps.
- Maintain the **Panacea Healthcare SaaS design language**: `Walnut Shadow` tone, `#491205` brand accent, official logo lockups, crisp cards, zero generic placeholders or emojis.
- Respect the **6-Role RBAC System**: `SUPER_ADMIN`, `STATE_HEALTH_DEPT`, `DISTRICT_CMO`, `HOSPITAL_ADMIN`, `TRIAGE_NURSE`, `AMBULANCE_DISPATCH`.

---

## 3. When to Ask vs. When to Proceed

### Proceed Without Asking
- Implementing features or bug fixes directly specified in PRD/TRD/ERD.
- Refactoring helper methods, DTOs, or standard Spring Boot / Next.js boilerplate.
- Resolving lint errors, build breaks, or styling misalignments.

### Stop and Ask Priyanshu
- Modifying core mathematical formulations of the 4 algorithms (Severity scoring weights, Priority decay lambda, Hungarian cost matrix penalties, Dijkstra shortest path logic).
- Adding new global database entities that break existing ERD relationships.
- Changing security model permissions or altering RBAC role definitions.

---

## 4. Testing & Verification Workflows

- **Backend Build & Verification**:
  ```powershell
  cd backend
  ./mvnw clean test
  ```
- **Frontend Build & Verification**:
  ```powershell
  cd frontend
  npm run build
  ```
- **Knowledge Graph Synchronization**:
  After modifying source code or documentation files in a session, always update the graphify index:
  ```powershell
  graphify update .
  ```

---

## 5. Security & Secret Handling

- **No Hardcoded Credentials**: Never commit hardcoded DB passwords, JWT secret keys, or API tokens. Always use environment variables (`APPLICATION_PROPERTIES`, `.env.local`).
- **RBAC Enforcement**: Ensure every new backend endpoint is annotated with proper security checks matching `TRD.md` §3.1.
