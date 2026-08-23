# ERD — TriageNet Database Schema & Entity Relationships
### Relational Data Model for State-Wide Healthcare Allocation in Jharkhand

```mermaid
erDiagram
    DISTRICT ||--o{ HOSPITAL : "contains"
    DISTRICT ||--o{ STAFF_USER : "governs"

    HOSPITAL ||--o{ RESOURCE : "owns"
    HOSPITAL ||--o{ PATIENT : "admits"
    HOSPITAL ||--o{ STAFF_USER : "employs"
    HOSPITAL ||--o{ HOSPITAL_EDGE : "originates (from_hospital)"
    HOSPITAL ||--o{ HOSPITAL_EDGE : "terminates (to_hospital)"

    PATIENT ||--|| SEVERITY_SCORE : "evaluates to"
    PATIENT ||--o{ TRIAGE_QUEUE_ENTRY : "queued as"
    PATIENT ||--o{ ALLOCATION_RECORD : "assigned to"
    PATIENT ||--o{ TRANSFER_REQUEST : "transferred via"

    RESOURCE ||--o{ ALLOCATION_RECORD : "allocated via"

    STAFF_USER }o--|| ROLE : "assigned"

    TRANSFER_REQUEST }o--|| HOSPITAL : "from_hospital"
    TRANSFER_REQUEST }o--|| HOSPITAL : "to_hospital"

    DISTRICT {
        uuid id PK
        string name "e.g., Ranchi, East Singhbhum, Dhanbad"
        string state "Jharkhand"
        int total_hospitals
        int active_emergencies
        timestamp created_at
    }

    HOSPITAL {
        uuid id PK
        string name "e.g., RIMS Ranchi, MGM Jamshedpur"
        uuid district_id FK
        string facility_tier "TERTIARY_MEDICAL_COLLEGE | DISTRICT_HOSPITAL | COMMUNITY_HEALTH_CENTRE"
        string region "Central | Southern | Northern | Eastern | Western"
        float lat "Latitude"
        float lng "Longitude"
        int total_beds
        int available_beds
        int total_ventilators
        int available_ventilators
        int total_specialists
        int available_specialists
        string contact_phone
        timestamp created_at
    }

    STAFF_USER {
        uuid id PK
        string name
        string email UK
        string password_hash
        uuid hospital_id FK "Nullable for District/State roles"
        uuid district_id FK "Nullable for State/Hospital roles"
        uuid role_id FK
        timestamp created_at
    }

    ROLE {
        uuid id PK
        string name UK "SUPER_ADMIN | STATE_HEALTH_DEPT | DISTRICT_CMO | HOSPITAL_ADMIN | TRIAGE_NURSE | AMBULANCE_DISPATCH"
    }

    RESOURCE {
        uuid id PK
        uuid hospital_id FK
        string type "ICU_BED | VENTILATOR | SPECIALIST | OXYGEN_BED"
        string subtype "e.g., Cardiology, O-Negative Blood, Trauma Bed"
        string status "AVAILABLE | OCCUPIED | RESERVED"
        timestamp last_updated
    }

    PATIENT {
        uuid id PK
        uuid hospital_id FK
        string name
        int age
        string gender
        float heart_rate
        float systolic_bp
        float spo2
        float temp_celsius
        float resp_rate
        float gcs "Glasgow Coma Scale"
        string presenting_complaint
        string blood_type
        string required_specialty
        string status "WAITING | ASSIGNED | TRANSFERRED | DISCHARGED"
        timestamp admitted_at
    }

    SEVERITY_SCORE {
        uuid id PK
        uuid patient_id FK UK
        float score "0.0 - 100.0"
        string risk_tier "CRITICAL | HIGH | MODERATE | LOW"
        text contributing_factors "JSON string of vital weight breakdown"
        timestamp computed_at
    }

    TRIAGE_QUEUE_ENTRY {
        uuid id PK
        uuid patient_id FK UK
        uuid hospital_id FK
        float base_severity
        float decay_lambda "Default 0.5 pts/min"
        float wait_time_minutes
        float effective_priority "base_severity + (decay_lambda * wait_time_minutes)"
        timestamp entered_queue_at
        timestamp last_recomputed_at
    }

    ALLOCATION_RECORD {
        uuid id PK
        uuid patient_id FK
        uuid resource_id FK
        float assignment_cost "Hungarian algorithm matrix cost"
        string algorithm_run_id "Batch ID grouping simultaneous matches"
        timestamp assigned_at
    }

    HOSPITAL_EDGE {
        uuid id PK
        uuid from_hospital_id FK
        uuid to_hospital_id FK
        float distance_km
        float travel_time_minutes
        string highway_name "e.g., NH-33, NH-75"
    }

    TRANSFER_REQUEST {
        uuid id PK
        uuid patient_id FK
        uuid from_hospital_id FK
        uuid to_hospital_id FK
        string routing_algorithm "DIJKSTRA | MCMF"
        float computed_cost "Spatial distance or travel time score"
        string status "PROPOSED | APPROVED | IN_TRANSIT | COMPLETED | REJECTED"
        timestamp requested_at
    }
```

---

## 2. Table Specifications & Constraints

### 2.1 `DISTRICT`
- Represents the 24 administrative districts of Jharkhand.
- Constraints: `name` must be unique within `state`.

### 2.2 `HOSPITAL`
- Represents the 79 authentic government healthcare facilities in Jharkhand.
- `facility_tier`: Enforces 3-tier healthcare hierarchy (`TERTIARY_MEDICAL_COLLEGE`, `DISTRICT_HOSPITAL`, `COMMUNITY_HEALTH_CENTRE`).
- `lat`, `lng`: Exact decimal coordinates for spatial routing and Leaflet mapping.

### 2.3 `PATIENT` & `SEVERITY_SCORE`
- One-to-One relationship between `PATIENT` and `SEVERITY_SCORE`.
- `SEVERITY_SCORE.contributing_factors` stores JSON text detailing exact vital sign impact (e.g. `[{"vital": "SpO2", "value": 85, "impact": "+35 pts"}]`).

### 2.4 `TRIAGE_QUEUE_ENTRY`
- Stores `effective_priority` computed periodically via background schedule:
  $$\text{effective\_priority} = \text{base\_severity} + (\text{decay\_lambda} \times \text{wait\_time\_minutes})$$

### 2.5 `ALLOCATION_RECORD`
- Links a patient to an allocated resource.
- `algorithm_run_id`: Groups all allocations executed in a single Hungarian algorithm invocation for auditability.

### 2.7 `LOGIN_ATTEMPT`
- Tracks failed login attempts and account lockout expiration for brute-force prevention.
- `email`: Normalized email string (UK).
- `attempt_count`: Integer failure counter.
- `lock_expires_at`: Timestamp indicating when temporary account lock expires.

---

## 3. Database Indexes for High-Performance Queries

```sql
-- Fast queue extraction by hospital ordered by effective priority
CREATE INDEX idx_triage_queue_lookup ON triage_queue_entry (hospital_id, effective_priority DESC);

-- Fast lookup of waiting patients by status
CREATE INDEX idx_patient_status ON patient (hospital_id, status);

-- Fast resource availability checks
CREATE INDEX idx_resource_avail ON resource (hospital_id, type, status);

-- Spatial graph edge lookup
CREATE INDEX idx_hospital_edge_src ON hospital_edge (from_hospital_id);

-- District hospital search
CREATE INDEX idx_hospital_district ON hospital (district_id, facility_tier);

-- Persistent account lockout lookups
CREATE INDEX idx_login_attempts_email ON login_attempts (email);
CREATE INDEX idx_login_attempts_lock_expires ON login_attempts (lock_expires_at);
```
