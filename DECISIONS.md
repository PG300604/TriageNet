# DECISIONS.md — TriageNet Architectural & Scope Decisions

Log of decisions and variations from the initial PRD/TRD specs.

| Date | Decision / Change | Rationale |
|------|-------------------|-----------
| 2026-08-01 | Extracted provided `triage-net.zip` frontend UI into `frontend/` directory | User provided Next.js design modules with high-aesthetic skeuomorphic UI, 3 core views (Capacity, Queue, Regional Network), and scenario simulation controls. |
| 2026-08-01 | Top-level project split into `backend/` and `frontend/` | Maintain clean separation of concerns as requested. |
| 2026-08-06 | 4-dataset Kaggle ML benchmarking completed | Validated TriageNet severity model across ESI, KTAS, SIRS/Lactate triage scales with 98.88% cross-dataset emergency recall. |
| 2026-08-06 | Logistic Regression retained as production baseline | O(d) inference time, 98.88% cross-system sensitivity, interpretable weights for clinical audit. Random Forest reserved for future KTAS/Sepsis deployments. |
| 2026-08-06 | Target region: Jharkhand (24 districts, 500+ govt hospitals) | State with significant public health infrastructure needs and digital health modernization opportunity. |
| 2026-08-06 | Self-hosted OpenRouteService from day 1 | Eliminates rate limits and API costs. Docker container pre-loaded with Jharkhand OSM extract from Geofabrik. |
| 2026-08-06 | Deploy backend on Render.com (not Railway) | User preference for Render free tier. Accepts cold-start latency trade-off for zero-cost deployment. |
| 2026-08-06 | Hospital data via NHM Jharkhand + OpenStreetMap scraping | No official government data access. Python scraper will merge NHM portal, OSM Overpass API, and IHFR data. |
| 2026-08-06 | 6-role RBAC access control design | Super Admin, State Health Dept (read-only), District CMO, Hospital Admin, Triage Nurse, Ambulance Dispatch. |
| 2026-08-06 | Removed `benchmark_kaggle_triage.py` (single dataset) | Superseded by `benchmark_multi_kaggle_triage.py` which covers all 4 datasets. Repo cleanup. |
| 2026-08-17 | 108 Ambulance Referral Controller & Dual-Mode Live/Sim Sync | Created `ReferralController.java` with 4 REST endpoints (`/api/referrals`, `/api/referrals/active`, `/api/referrals/{id}/status`, `/api/referrals/recommendation`) with RBAC `@PreAuthorize` security, wired type-safe `ApiClient` methods, and integrated live backend probe with automatic in-memory simulation fallback into `dashboard.tsx`. |
