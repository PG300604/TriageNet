# DECISIONS.md — TriageNet Architectural & Scope Decisions

Log of decisions and variations from the initial PRD/TRD specs.

| Date | Decision / Change | Rationale |
|------|-------------------|-----------|
| 2026-08-01 | Extracted provided `triage-net.zip` frontend UI into `frontend/` directory | User provided Next.js design modules with high-aesthetic skeuomorphic UI, 3 core views (Capacity, Queue, Regional Network), and scenario simulation controls. |
| 2026-08-01 | Top-level project split into `backend/` and `frontend/` | Maintain clean separation of concerns as requested. |
