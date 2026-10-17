import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('README.md', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Top video section
old_top = '''### 🎬 Master Explainer Video (112s Silent Tech Keynote)
*Synced to the high-energy soundtrack "Rise Up" by Aylex — Built with Glassmorphism, 60 FPS Chromium motion graphics, and Manim.*

[![TriageNet 112s Master Explainer Video](.github/assets/hero-architecture-preview.gif)](https://github.com/PG300604/TriageNet/releases/tag/v1.3.0)

<p align="center">
  <em>👆 <strong>Click the banner to watch or download the full 112s high-production video</strong> (1080p @ 60 FPS, 24.5 MB).</em>
</p>'''

new_top = '''<p align="center">
  <img src=".github/assets/keynote-video-loop.gif" alt="TriageNet Architecture Showcase" width="100%" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);" />
</p>'''

assert old_top in text, 'old_top not found'
text = text.replace(old_top, new_top)

# 2. System Design tags
old_tags = '`Manim v0.22` • `Context DFD Level 0` • `Process DFD Level 1` • `Data Dictionary`'
new_tags = '`Context DFD Level 0` • `Process DFD Level 1` • `Dynamic Data Dictionary` • `Sub-50ms Routing`'
assert old_tags in text, 'old_tags not found'
text = text.replace(old_tags, new_tags)

# 3. Level 0 DFD
old_l0 = '''<p align="center">
  <img src=".github/assets/manim-system-design-level0.gif" alt="Manim Level 0 Context DFD" width="780" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);" /><br>
  <em>Manim Animation: Level 0 Context System Design detailing bidirectional flows between 6 external entities and TriageNet.</em>
</p>'''

new_l0 = '''<p align="center">
  <img src=".github/assets/manim-system-design-level0.gif" alt="Level 0 Context DFD" width="780" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);" />
</p>'''

assert old_l0 in text, 'old_l0 not found'
text = text.replace(old_l0, new_l0)

old_l0_edge = 'TN -->|Corridor Preemption Requests (NH-33, GT Road)| E4'
new_l0_edge = 'TN -->|Corridor Preemption Requests: NH-33 and GT Road| E4'
assert old_l0_edge in text, 'old_l0_edge not found'
text = text.replace(old_l0_edge, new_l0_edge)

# 4. Level 1 DFD
old_l1 = '''<p align="center">
  <img src=".github/assets/manim-system-design-level1.gif" alt="Manim Level 1 Process Decomposition" width="780" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);" /><br>
  <em>Manim Animation: Level 1 Process Decomposition Diagram showing the 5 sub-processes, persistent stores D1-D3, and data contracts.</em>
</p>'''

new_l1 = '''<p align="center">
  <img src=".github/assets/manim-system-design-level1.gif" alt="Level 1 Process Decomposition" width="780" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);" />
</p>'''

assert old_l1 in text, 'old_l1 not found'
text = text.replace(old_l1, new_l1)

old_l1_block = '''```mermaid
flowchart TB
    subgraph DataStores ["💾 PERSISTENT DATA STORES"]
        D1[("D1: PostgreSQL Relational DB<br/>(Patients, Staff, Grants, Audit)")]
        D2[("D2: PostGIS Spatial Graph<br/>(Hospitals, Road Edges, Corridors)")]
        D3[("D3: Redis In-Memory State Cache<br/>(Pub/Sub Telemetry, STOMP Queue)")]
    end

    subgraph Processes ["⚡ CORE SUB-PROCESSES"]
        P1(("1.0<br/>Clinical Intake &<br/>SeverityScorer"))
        P2(("2.0<br/>Dual-Bus Telemetry<br/>& Event Broker"))
        P3(("3.0<br/>HungarianMatcher<br/>Specialist Alloc"))
        P4(("4.0<br/>DijkstraRouter &<br/>Green Wave ITMS"))
        P5(("5.0<br/>Statewide Capacity<br/>& Grants Ledger"))
    end

    P1 -->|Acuity Vector| P2
    P1 -->|Patient Record| D1
    P2 <-->|GPS & STOMP Channels| D3
    P2 -->|Acuity Event| P3
    P3 -->|Specialist Reservation| D1
    P3 -->|Assigned Destination| P4
    P4 <-->|Road Weights & Shortest Path| D2
    P4 -->|Corridor Signal Preemption| P2
    P5 <-->|Facility Beds & ₹ Ledger| D1
    P2 -->|Real-Time State Sync| P5
```'''

new_l1_block = '''```mermaid
flowchart TB
    subgraph DataStores ["💾 PERSISTENT DATA STORES"]
        D1[("D1: PostgreSQL Relational DB<br/>(Patients, Staff, Grants, Audit)")]
        D2[("D2: PostGIS Spatial Graph<br/>(Hospitals, Road Edges, Corridors)")]
        D3[("D3: Redis In-Memory State Cache<br/>(Pub/Sub Telemetry, STOMP Queue)")]
    end

    subgraph Processes ["⚡ CORE SUB-PROCESSES"]
        P1(("1.0<br/>Clinical Intake and<br/>SeverityScorer"))
        P2(("2.0<br/>Dual-Bus Telemetry<br/>and Event Broker"))
        P3(("3.0<br/>HungarianMatcher<br/>Specialist Alloc"))
        P4(("4.0<br/>DijkstraRouter and<br/>Green Wave ITMS"))
        P5(("5.0<br/>Statewide Capacity<br/>and Grants Ledger"))
    end

    P1 -->|Acuity Vector| P2
    P1 -->|Patient Record| D1
    P2 -->|GPS and STOMP Channels| D3
    D3 -->|Cached Telemetry State| P2
    P2 -->|Acuity Event| P3
    P3 -->|Specialist Reservation| D1
    P3 -->|Assigned Destination| P4
    P4 -->|Shortest Path Query| D2
    D2 -->|Dynamic Road Edge Weights| P4
    P4 -->|Corridor Signal Preemption| P2
    P5 -->|Bed Ledger Updates| D1
    D1 -->|Historical Grant Records| P5
    P2 -->|Real-Time State Sync| P5
```'''

assert old_l1_block in text, 'old_l1_block not found'
text = text.replace(old_l1_block, new_l1_block)

# 5. Dijkstra Green Wave caption
old_dijkstra = '''<p align="center">
  <img src=".github/assets/manim-dijkstra-greenwave.gif" alt="Manim Highway Green Wave Graph" width="750" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);" /><br>
  <em>Manim Mathematical Graph: Vertex network resolving shortest path and preempting traffic signals to ALL-GREEN.</em>
</p>'''

new_dijkstra = '''<p align="center">
  <img src=".github/assets/manim-dijkstra-greenwave.gif" alt="Highway Green Wave Graph" width="750" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);" />
</p>'''

assert old_dijkstra in text, 'old_dijkstra not found'
text = text.replace(old_dijkstra, new_dijkstra)

# 6. System Architecture & Reactive Data Flow
old_arch = '''<p align="center">
  <img src=".github/assets/manim-architecture-flow.gif" alt="Manim System Architecture Flow" width="800" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);" /><br>
  <em>Manim Animation: Real-time event propagation across Edge Clients, Spring Core Broker, and Postgres/Redis tiers.</em>
</p>'''

new_arch = '''<p align="center">
  <img src=".github/assets/hero-architecture-preview.gif" alt="Distributed Real-Time Telemetry and Dispatch Pipeline" width="800" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);" /><br><br>
  <img src=".github/assets/manim-architecture-flow.gif" alt="System Architecture Flow" width="800" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);" />
</p>'''

assert old_arch in text, 'old_arch not found'
text = text.replace(old_arch, new_arch)

# 7. Docker & Redis Deployment
old_docker = '''<p align="center">
  <img src=".github/assets/manim-deployment-docker-redis.gif" alt="Manim Docker and Redis Deployment Architecture" width="800" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);" /><br>
  <em>Manim Animation: Docker multi-container topology showing isolated bridge networking, Nginx gateway, and Redis telemetry streams.</em>
</p>

```mermaid
flowchart TB
    Internet(("🌐 Public Internet<br/>(HTTPS / WSS)"))

    subgraph DockerHost ["🐳 DOCKER COMPOSE ORCHESTRATION HOST (docker-compose.prod.yml)"]
        subgraph Gateway ["Nginx Edge Gateway (:80 / :443)"]
            NGINX["nginx:alpine<br/>• TLS Termination<br/>• Gzip Level 6<br/>• Rate Limiting<br/>• Keepalive 32"]
        end

        subgraph BridgeNetwork ["Isolated Docker Bridge Network (triagenet-network)"]
            FRONTEND["frontend:3000<br/>Next.js 16 (React 19 SSR)<br/>Turbopack Engine"]
            BACKEND["backend:8080<br/>Spring Boot 3.3.13 (Java 17)<br/>Virtual Threads Concurrency"]
            REDIS["redis:6379<br/>redis:7-alpine (AOF Enabled)<br/>Sub-50ms Telemetry Bus"]
            POSTGRES["postgres:5432<br/>postgres:16-alpine + PostGIS<br/>Row-Level Security (RLS)"]
        end

        subgraph Volumes ["💾 Persistent Volume Mounts"]
            V_PG[("postgres_data<br/>/var/lib/postgresql/data")]
            V_REDIS[("redis_data<br/>/data (appendonly.aof)")]
            V_SSL[("certbot/conf<br/>Let's Encrypt TLS")]
        end
    end

    Internet -->|Ports 80/443| NGINX
    NGINX -->|/ and /_next/static/| FRONTEND
    NGINX -->|/api/ and /swagger-ui/| BACKEND
    NGINX -->|/ws/ (WebSocket STOMP)| BACKEND

    BACKEND <-->|Sub-50ms Pub/Sub & TTL Locks| REDIS
    BACKEND <-->|JPA / PostGIS Geospatial Queries| POSTGRES

    POSTGRES --- V_PG
    REDIS --- V_REDIS
    NGINX --- V_SSL
```'''

new_docker = '''<p align="center">
  <img src=".github/assets/manim-deployment-docker-redis.gif" alt="Docker and Redis Deployment Architecture" width="800" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);" />
</p>

```mermaid
flowchart TB
    Internet(("🌐 Public Internet<br/>(HTTPS / WSS)"))

    subgraph DockerHost ["🐳 DOCKER COMPOSE ORCHESTRATION HOST (docker-compose.prod.yml)"]
        subgraph Gateway ["Nginx Edge Gateway (:80 / :443)"]
            NGINX["nginx:alpine<br/>• TLS Termination<br/>• Gzip Level 6<br/>• Rate Limiting<br/>• Keepalive 32"]
        end

        subgraph BridgeNetwork ["Isolated Docker Bridge Network (triagenet-network)"]
            FRONTEND["frontend:3000<br/>Next.js 16 (React 19 SSR)<br/>Turbopack Engine"]
            BACKEND["backend:8080<br/>Spring Boot 3.3.13 (Java 17)<br/>Virtual Threads Concurrency"]
            REDIS["redis:6379<br/>redis:7-alpine (AOF Enabled)<br/>Sub-50ms Telemetry Bus"]
            POSTGRES["postgres:5432<br/>postgres:16-alpine + PostGIS<br/>Row-Level Security (RLS)"]
        end

        subgraph Volumes ["💾 Persistent Volume Mounts"]
            V_PG[("postgres_data<br/>/var/lib/postgresql/data")]
            V_REDIS[("redis_data<br/>/data (appendonly.aof)")]
            V_SSL[("certbot/conf<br/>Let's Encrypt TLS")]
        end
    end

    Internet -->|Ports 80 and 443| NGINX
    NGINX -->|Route: / and /_next/| FRONTEND
    NGINX -->|Route: /api/ and /swagger-ui/| BACKEND
    NGINX -->|Route: /ws/ WebSocket STOMP| BACKEND

    BACKEND -->|PubSub Streams and Bed TTL Locks| REDIS
    REDIS -->|In-Memory Telemetry State| BACKEND
    BACKEND -->|JPA and PostGIS Spatial Queries| POSTGRES
    POSTGRES -->|Persisted Clinical Records| BACKEND

    POSTGRES --- V_PG
    REDIS --- V_REDIS
    NGINX --- V_SSL
```'''

assert old_docker in text, 'old_docker not found'
text = text.replace(old_docker, new_docker)

# 8. Safety & Security
old_safety = '''<p align="center">
  <img src=".github/assets/manim-safety-security.gif" alt="Manim Safety and Security Framework" width="800" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);" /><br>
  <em>Manim Animation: Multi-layer safety governance framework spanning clinical algorithms, access control, and infrastructure.</em>
</p>

```mermaid
flowchart TD
    subgraph Layer1 ["🏥 LAYER 1: CLINICAL PATIENT SAFETY"]
        L1_1["Sepsis Early Warning Protocol<br/>(SpO2 < 90% & HR > 110 bpm)"]
        L1_2["Shock Index Hemorrhagic Alert<br/>(SI = HR / SBP > 0.9)"]
        L1_3["Code Red ICU Preemption<br/>(Immediate Bed Grant for Score ≥ 95)"]
        L1_4["Acuity Wait-Aging Function<br/>(E = S + λ√W Prevents Starvation)"]
    end

    subgraph Layer2 ["🔐 LAYER 2: OPERATIONAL ACCESS GOVERNANCE"]
        L2_1["6-Role Hierarchical RBAC<br/>(Strict Principle of Least Privilege)"]
        L2_2["Dual-Control Clinician Signoff<br/>(StaffApprovalModal Two-Supervisor Signoff)"]
        L2_3["Glove-Friendly FIDO2 / WebAuthn<br/>(Physical USB Hardware Key 2FA)"]
        L2_4["Zero-Email BIP-39 Offline Auth<br/>(12-Word Mnemonic + TOTP Seed)"]
        L2_5["RateLimitingFilter<br/>(Token Bucket Anti-Brute Force)"]
    end

    subgraph Layer3 ["🛡️ LAYER 3: DATA & INFRASTRUCTURE INTEGRITY"]
        L3_1["PostgreSQL Row-Level Security<br/>(Tenancy-Segregated Hospital Mutations)"]
        L3_2["Non-Root Container Hardening<br/>(UID 1001 Unprivileged Execution)"]
        L3_3["Aqua Security Trivy Scanning<br/>(0 Critical / High OS Vulnerabilities)"]
        L3_4["Dual-Transport Auth Security<br/>(HttpOnly SameSite Cookie + Bearer JWT)"]
    end

    Layer1 --- Layer2 --- Layer3
```'''

new_safety = '''<p align="center">
  <img src=".github/assets/manim-safety-security.gif" alt="Safety and Security Framework" width="800" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);" />
</p>

```mermaid
flowchart TD
    subgraph Layer1 ["🏥 LAYER 1: CLINICAL PATIENT SAFETY"]
        L1_1["Sepsis Early Warning Protocol<br/>(SpO2 below 90% and HR above 110 bpm)"]
        L1_2["Shock Index Hemorrhagic Alert<br/>(SI = HR / SBP exceeding 0.9)"]
        L1_3["Code Red ICU Preemption<br/>(Immediate Bed Grant for Score >= 95)"]
        L1_4["Acuity Wait-Aging Function<br/>(Priority Boost E = S + lambda * sqrt(W))"]
    end

    subgraph Layer2 ["🔐 LAYER 2: OPERATIONAL ACCESS GOVERNANCE"]
        L2_1["6-Role Hierarchical RBAC<br/>(Strict Principle of Least Privilege)"]
        L2_2["Dual-Control Clinician Signoff<br/>(StaffApprovalModal Two-Supervisor Signoff)"]
        L2_3["Glove-Friendly FIDO2 / WebAuthn<br/>(Physical USB Hardware Key 2FA)"]
        L2_4["Zero-Email BIP-39 Offline Auth<br/>(12-Word Mnemonic + TOTP Seed)"]
        L2_5["RateLimitingFilter<br/>(Token Bucket Anti-Brute Force)"]
    end

    subgraph Layer3 ["🛡️ LAYER 3: DATA & INFRASTRUCTURE INTEGRITY"]
        L3_1["PostgreSQL Row-Level Security<br/>(Tenancy-Segregated Hospital Mutations)"]
        L3_2["Non-Root Container Hardening<br/>(UID 1001 Unprivileged Execution)"]
        L3_3["Aqua Security Trivy Scanning<br/>(0 Critical / High OS Vulnerabilities)"]
        L3_4["Dual-Transport Auth Security<br/>(HttpOnly SameSite Cookie + Bearer JWT)"]
    end

    L1_4 --> L2_1
    L2_5 --> L3_1
```'''

assert old_safety in text, 'old_safety not found'
text = text.replace(old_safety, new_safety)

with open('README.md', 'w', encoding='utf-8') as f:
    f.write(text)

print('README.md successfully updated and all assertions passed!')
