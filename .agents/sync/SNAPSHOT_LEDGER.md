# SNAPSHOT_LEDGER.md — TriageNet Crash & Power-Cut Recovery Checkpoints

> **Purpose**: Single chronological ledger of all saved steps. If an OS crash, VS Code freeze, or power outage occurs, locate the latest entry below to resume instantly.

| Timestamp | Step Description | Git Tag | Commit SHA | DB Snapshot | Containers |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `20261017_175231` | Pre-Render Deployment Step 1: Baseline Verification and Recovery Automation | [`snapshot-20261017_175231`](file:///home/priyanshughosh/Projects/TriageNet) | `644f5a0` | `b71d238087a6...` | `backend: Up 11 minutes (healthy),postgres: Up 12 minutes (healthy),frontend: Up 12 minutes (healthy),nginx: Up 12 minutes,redis: Up 12 minutes (healthy),` |
| `20261017_180406` | Fix render.yaml database schema to top-level databases key per Render blueprint specification | [`snapshot-20261017_180406`](file:///home/priyanshughosh/Projects/TriageNet) | `12337de` | `1973137af0aa...` | `backend: Up 23 minutes (healthy),postgres: Up 23 minutes (healthy),frontend: Up 23 minutes (healthy),nginx: Up 23 minutes,redis: Up 23 minutes (healthy),` |
| `20261017_181348` | Fix Render PostgreSQL connection string parsing with DatabaseUrlEnvironmentPostProcessor and enable ddl-auto update | [`snapshot-20261017_181348`](file:///home/priyanshughosh/Projects/TriageNet) | `e413035` | `2a765e4f67c0...` | `backend: Up 33 minutes (healthy),postgres: Up 33 minutes (healthy),frontend: Up 33 minutes (healthy),nginx: Up 33 minutes,redis: Up 33 minutes (healthy),` |
