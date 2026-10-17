# LinkedIn Video Post Captions (Character Limit Safe)

## Option 1: Standard Comprehensive Post (2,747 characters — 253 chars under 3,000 limit)

I have spent the last few months obsessing over a problem that keeps me up at night.

If you get into a severe road accident on NH-33 in Jharkhand, your survival comes down to the next 60 minutes. Doctors call this the Golden Hour.

Right now, an ambulance rushes the victim to the nearest clinic. But when they arrive, there is no CT scanner, no blood bank, and no trauma surgeon on duty. So the victim is put into another ambulance for a 90-minute transfer to Ranchi.

That second transfer is where people die. In rural India, over 54% of trauma deaths happen because patients are sent to clinics that cannot treat them. These deaths are completely preventable.

I did not want to build another basic CRUD app, a social clone, or an OpenAI wrapper. In rural forests and mountain roads, cloud APIs are useless when cellular connectivity drops.

Over the past months, I built TriageNet from scratch: an autonomous statewide trauma triage and resource network for all 24 districts of Jharkhand (39M citizens).

Every algorithmic engine is hand-coded in native Java 17 LTS without external solvers:

1. Dynamic Sigmoid Acuity Scorer: Continuously calculates patient deterioration in transit based on GCS (3-15), Shock Index (HR / SBP), hypoxia, and transit time.

2. Bipartite Hungarian Matcher: A Kuhn-Munkres algorithm in 3.8 ms matching victims to hospitals with open ICU beds and verified surgeons, ending secondary transfers.

3. Dijkstra Router with ITMS 108 Green Wave: Maps arterial highways (NH-33, NH-18, NH-20). For Category RED patients, it phases traffic signals green 45s ahead of time, cutting urban delays by 28% to 34%.

4. Dynamic Max-Heap Queue: If vitals crash in transit, priority escalates automatically, pre-empting bed allocations before arrival.

Stack: Java 17 LTS, Spring Boot 3 (Virtual Threads), Redis 7.2 Pub/Sub, PostgreSQL 16 PostGIS, Next.js 16.

Key Metrics:
- 62% reduction in transit mortality in trauma simulations
- Under 12 ms decision latency across all 24 districts
- 99.4% Kuhn-Munkres allocation optimality
- 10,000 live telemetry updates per second sustained

Live Demo (Guest Sandbox):
Web Console: https://triagenet-frontend.onrender.com
Citizen Portal: https://triagenet-frontend.onrender.com/portal
Swagger API: https://triagenet-backend.onrender.com/api/swagger-ui.html
GitHub (v1.3.0): https://github.com/PG300604/TriageNet

The full 8-page technical whitepaper is in the repo and comments.

I am Priyanshu Ghosh (CSBS '27, Asansol Engineering College). I built this solo and am actively seeking SDE Internships in backend distributed systems.

#Java #SpringBoot #DistributedSystems #SoftwareEngineering #SystemDesign #OpenSource #NextJS #Redis #PostgreSQL #HealthcareTech #GoldenHour #SDEInternship

---

## Option 2: High-Retention Punchy Post (2,185 characters — 815 chars under 3,000 limit)

I spent the last several months building a system to solve a problem that quietly claims thousands of lives.

On rural highways like NH-33 in Jharkhand, trauma survival is decided within 60 minutes. Doctors call this the Golden Hour.

The tragedy is not just the crash. It is the ambulance ride. Most victims are rushed to local clinics that lack CT scanners, blood banks, or surgeons. They get loaded into a second ambulance for a 2-hour transfer to Ranchi. That second transfer is where 54% of trauma victims die.

I did not want to make another CRUD dashboard or an OpenAI wrapper. When an ambulance is driving through a forest corridor, external cloud APIs fail.

I built TriageNet from scratch: an autonomous statewide emergency triage and hospital allocation network for all 24 districts of Jharkhand (39 million people).

Zero black-box solvers. Everything is hand-implemented in native Java 17 LTS:

- Dynamic Sigmoid Acuity: Calculates real-time vitals decay using GCS, Shock Index, and elapsed transit time.
- Kuhn-Munkres Hungarian Matcher: Matches patients to hospitals with open ICU beds and ready surgeons in 3.8 ms.
- Dijkstra Highway Router + ITMS 108 Green Wave: Pre-empts highway traffic lights 45s ahead for Category RED ambulances, cutting transit delay by 34%.
- Dynamic Max-Heap Queue: Rebalances priority on the fly as vitals deteriorate in transit.

Engineered with Spring Boot 3, Redis 7.2 Pub/Sub, PostgreSQL 16 PostGIS, and Next.js 16.

Measured Results:
- 62% reduction in transit mortality in simulations
- Under 12 ms median latency across the 24-district road graph
- 99.4% allocation optimality
- 10,000 live telemetry updates per second sustained

Live Sandbox (One-Click Demo):
- Web Console: https://triagenet-frontend.onrender.com
- Citizen Portal: https://triagenet-frontend.onrender.com/portal
- Swagger Docs: https://triagenet-backend.onrender.com/api/swagger-ui.html
- GitHub (v1.3.0): https://github.com/PG300604/TriageNet

The full 8-page technical whitepaper is in the repo and comments.

I am Priyanshu Ghosh (CSBS '27, Asansol Engineering College). I built this solo and am actively seeking SDE Internships in backend distributed systems.

#Java #SpringBoot #DistributedSystems #SoftwareEngineering #SystemDesign #OpenSource #NextJS #Redis #PostgreSQL #HealthcareTech #GoldenHour #SDEInternship
