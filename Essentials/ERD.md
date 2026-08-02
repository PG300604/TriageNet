# ERD — TriageNet
### Entity Relationship Diagram & Schema Notes

```mermaid
erDiagram
    HOSPITAL ||--o{ RESOURCE : "has"
    HOSPITAL ||--o{ PATIENT : "admits"
    HOSPITAL ||--o{ STAFF_USER : "employs"
    HOSPITAL ||--o{ HOSPITAL_EDGE : "connects (as source)"
    HOSPITAL ||--o{ HOSPITAL_EDGE : "connects (as target)"

    PATIENT ||--o{ TRIAGE_QUEUE_ENTRY : "has"
    PATIENT ||--o{ ALLOCATION_RECORD : "receives"
    PATIENT ||--o{ TRANSFER_REQUEST : "may trigger"
    PATIENT ||--|| SEVERITY_SCORE : "has one"

    RESOURCE ||--o{ ALLOCATION_RECORD : "assigned via"

    STAFF_USER }o--|| ROLE : "has"

    TRANSFER_REQUEST }o--|| HOSPITAL : "from"
    TRANSFER_REQUEST }o--|| HOSPITAL : "to"

    HOSPITAL {
        uuid id PK
        string name
        string region
        float lat
        float lng
        int total_beds
        int total_ventilators
        int total_specialists
        timestamp created_at
    }

    STAFF_USER {
        uuid id PK
        string name
        string email
        string password_hash
        uuid hospital_id FK
        uuid role_id FK
        timestamp created_at
    }

    ROLE {
        uuid id PK
        string name  "HOSPITAL_STAFF | HOSPITAL_ADMIN | REGIONAL_COORDINATOR"
    }

    RESOURCE {
        uuid id PK
        uuid hospital_id FK
        string type  "BED | VENTILATOR | SPECIALIST"
        string subtype  "e.g. blood-type compatibility, specialty"
        string status  "AVAILABLE | OCCUPIED | RESERVED"
        timestamp last_updated
    }

    PATIENT {
        uuid id PK
        uuid hospital_id FK
        string name
        int age
        string presenting_complaint
        float heart_rate
        float systolic_bp
        float spo2
        string blood_type
        string required_specialty
        timestamp admitted_at
        string status  "WAITING | ASSIGNED | TRANSFERRED | DISCHARGED"
    }

    SEVERITY_SCORE {
        uuid id PK
        uuid patient_id FK
        float score  "0-100"
        json contributing_factors
        timestamp computed_at
    }

    TRIAGE_QUEUE_ENTRY {
        uuid id PK
        uuid patient_id FK
        uuid hospital_id FK
        float base_severity
        float effective_priority  "severity + wait-time decay, recomputed periodically"
        timestamp entered_queue_at
        timestamp last_recomputed_at
    }

    ALLOCATION_RECORD {
        uuid id PK
        uuid patient_id FK
        uuid resource_id FK
        float assignment_cost  "cost value from Hungarian algorithm run"
        timestamp assigned_at
        string algorithm_run_id  "groups records from the same solver invocation"
    }

    HOSPITAL_EDGE {
        uuid id PK
        uuid from_hospital_id FK
        uuid to_hospital_id FK
        float transfer_time_minutes
        float distance_km
    }

    TRANSFER_REQUEST {
        uuid id PK
        uuid patient_id FK
        uuid from_hospital_id FK
        uuid to_hospital_id FK
        string routing_algorithm  "DIJKSTRA | MCMF"
        float computed_cost
        string status  "PROPOSED | APPROVED | COMPLETED | REJECTED"
        timestamp requested_at
    }
```

## Notes on design decisions

- **`SEVERITY_SCORE` is a separate table from `PATIENT`**, not just a column, so historical
  scores can be tracked over time (a patient's condition can change, and this gives you an
  audit trail for the report/demo — "here's how this patient's priority evolved").
- **`TRIAGE_QUEUE_ENTRY.effective_priority`** is intentionally a stored, periodically recomputed
  value rather than something calculated purely on read — this matches the TRD's design of a
  scheduled job recomputing priorities, and it means the queue state is inspectable directly in
  the database at any point (useful for debugging and for the viva demo).
- **`ALLOCATION_RECORD.algorithm_run_id`** groups all assignments produced by a single Hungarian
  algorithm invocation, so you can show "this batch of 5 patients was matched to 5 resources in
  one solver run" — good for explainability in the demo.
- **`HOSPITAL_EDGE`** is a directed edge table representing the regional transfer graph; store it
  as directed even though transfer time is likely symmetric, since it keeps the graph algorithms
  (Dijkstra/MCMF) implementation simpler (uniform edge traversal, no special-casing).
- **`TRANSFER_REQUEST.routing_algorithm`** records which algorithm produced the routing decision
  (Dijkstra for MVP, MCMF if the stretch goal is reached) — useful both for testing and for
  showing the algorithmic range in the final report.
- Resource `subtype` is deliberately a loose string field (not a separate lookup table) to keep
  the schema simple within the 5-week timeline — document this as a simplification if asked in
  viva, not a design you'd necessarily keep in a production system.

## Suggested indexes

- `PATIENT(hospital_id, status)` — fast lookup of waiting patients per hospital.
- `TRIAGE_QUEUE_ENTRY(hospital_id, effective_priority DESC)` — fast queue retrieval in priority order.
- `RESOURCE(hospital_id, type, status)` — fast lookup of available resources by type.
- `HOSPITAL_EDGE(from_hospital_id)` — fast adjacency lookup for graph traversal.
