# LinkedIn Post Caption (Video Announcement)

I have spent the last few months quietly obsessing over a problem that keeps me up at night.

If you get into a severe road accident on NH-33 in Jharkhand, your survival comes down to what happens in the next 60 minutes. Doctors call this the Golden Hour.

Right now, an ambulance picks up a victim and rushes to the nearest local clinic. But when they arrive, there is no CT scanner, no blood bank, and no trauma surgeon available. So the victim is put back into another ambulance for a 90-minute transfer to Ranchi or Jamshedpur.

That second transfer is where people lose their lives. In rural India, over 54% of trauma deaths happen because patients are sent to hospitals that simply cannot treat them. It is heartbreaking because these deaths are completely preventable.

I did not want to build another basic CRUD app, a clone of an existing product, or an API wrapper around OpenAI. In rural and tribal healthcare, external black-box APIs are useless when the cellular internet drops in the middle of a forest corridor.

So over the past several months, I built TriageNet from scratch: an autonomous statewide emergency trauma triage and spatial resource network designed for all 24 districts of Jharkhand, covering 39 million citizens.

Every algorithmic core is hand-implemented in native Java 17 LTS without external solvers:

1. Dynamic Sigmoid Acuity Scorer: It does not use static triage tags. It continuously calculates patient deterioration in transit based on Glasgow Coma Scale (GCS 3-15), Shock Index (Heart Rate / Systolic BP), oxygen hypoxia, and elapsed transit time.

2. Bipartite Hungarian Matcher: A Kuhn-Munkres algorithm running in 3.8 milliseconds. It matches trauma victims to hospitals that actually have open ICU beds and ready trauma surgeons on duty, eliminating secondary transfers.

3. Dijkstra Highway Router with ITMS 108 Green Wave: It maps the entire highway network (NH-33, NH-18, NH-20, NH-23, NH-32, NH-39, NH-43). When a Category RED patient is flagged, it talks to traffic signal controllers to phase upcoming signals green 45 seconds ahead of time, cutting urban transit delays by 28% to 34%.

4. Dynamic Max-Heap Priority Queue: If a patient crashes inside the ambulance, their priority key dynamically escalates, automatically updating bed reservations before they even reach the emergency room doors.

The system is deployed across a multi-container architecture using Spring Boot 3, Redis 7.2 Pub/Sub for sub-second ambulance telemetry, PostgreSQL 16 with PostGIS spatial indexing, and Next.js 16 with React 19 for the command console.

Here are the real benchmark numbers:
- 62% reduction in transit mortality in simulated trauma scenarios
- Less than 12 ms median decision latency across all 24 district road networks
- 99.4% Kuhn-Munkres allocation optimality compared to brute force
- 10,000 live telemetry updates per second sustained with 0% packet loss

The video above walks through the complete live system, from the command dashboard to the paramedic companion terminal.

You can also test the live deployment right now with a one-click guest sandbox:
- Live Web Console: https://triagenet-frontend.onrender.com
- Citizen Emergency Portal: https://triagenet-frontend.onrender.com/portal
- Interactive Swagger UI: https://triagenet-backend.onrender.com/api/swagger-ui.html
- GitHub Repository (v1.3.0 Release): https://github.com/PG300604/TriageNet

The full 8-page technical whitepaper detailing the math proofs, container topologies, and labeled screenshots is in the repository and linked in the comments.

I am Priyanshu Ghosh, a CSBS student ('27) at Asansol Engineering College. I built this entire project solo from the ground up, and I am actively looking for SDE Internships in backend systems, distributed infrastructure, and mission-critical engineering.

If this work resonates with you, I would love to hear your thoughts.

#Java #SpringBoot #DistributedSystems #SoftwareEngineering #SystemDesign #OpenSource #FullStack #NextJS #Redis #PostgreSQL #HealthcareTech #GoldenHour #SDEInternship
