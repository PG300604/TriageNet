# instructions.md — Operating Instructions for Antigravity

These are the working rules for the AI coding agent while building TriageNet. Read `brain.md`
first for context, then follow these rules for *how* to work.

---

## 1. Session workflow

1. At the start of every session, re-read `brain.md`, `PRD.md`, `TRD.md`, and `ERD.md` if any
   time has passed since the last session — don't rely on stale in-context memory of the plan.
2. Work in the phase order defined in the PRD's 5-week plan. Don't jump ahead to Week 3 work
   (assignment engine) before Week 1–2 foundations (schema, auth, scoring, triage queue) are
   working and tested.
3. Before writing code for a new module, restate in 2-3 sentences what you're about to build
   and which section of the TRD it corresponds to. This keeps the build traceable to the spec.
4. After finishing a module, run/describe a quick manual sanity check (or a unit test) before
   moving to the next module. Don't stack unverified modules on top of each other.

## 2. Code style & structure

- Follow standard Spring Boot layered architecture: `controller/`, `service/`, `repository/`,
  `entity/`, `dto/`, `config/`. Keep algorithm implementations (Hungarian, Dijkstra, priority
  queue, severity scorer) in a clearly separated `algorithms/` or `engine/` package — these are
  the heart of the project and should be easy to point to directly in a code walkthrough.
- Favor clear, well-commented algorithm code over clever one-liners. The person reviewing this
  in a viva or interview should be able to read the Hungarian algorithm implementation and
  understand it without external references.
- Use environment variables for all secrets (DB credentials, JWT signing key) — never hardcode.
  This is a hard rule, not a preference, carried over from a prior security-hardening pass on
  ShopFlow.
- Keep the frontend to the 3 views defined in the TRD. If a new view idea comes up mid-build,
  flag it rather than silently building it.

## 3. When to ask vs. when to proceed

**Proceed without asking when:**
- Implementing something already fully specified in PRD/TRD/ERD.
- Making small implementation choices (variable names, minor helper functions, standard Spring
  Boot boilerplate).

**Stop and ask Priyanshu when:**
- A core algorithm (Hungarian, Dijkstra/MCMF, priority queue, severity scorer) would need to be
  simplified, replaced with a library call, or cut due to time pressure. This is the one thing
  that must not silently degrade.
- The 5-week phase plan needs to slip or reorder.
- A new feature is being considered that isn't in the PRD's MVP or stretch-goal list.
- Something in the TRD/ERD turns out to be technically wrong or infeasible as written — flag it,
  propose a fix, but don't just quietly deviate from the documented plan.

## 4. Testing expectations

- Every algorithm module needs at least a minimal correctness check before being considered
  "done": e.g. Hungarian algorithm verified against a small hand-computed cost matrix; Dijkstra
  verified against a small known graph with an obvious shortest path; priority queue verified
  to reorder correctly when a new high-severity patient arrives.
- Don't consider Week 3/4 modules complete until this kind of sanity check exists, even if
  informal (a `main` method or a simple test class is fine — doesn't need full JUnit coverage
  given the timeline).

## 5. Documentation as you go

- Keep a running `DECISIONS.md` (create if it doesn't exist) logging any meaningful deviation
  from the original PRD/TRD — one line per decision, e.g. "Week 3: simplified MCMF to
  single-hospital Dijkstra routing only due to time; documented as a stretch goal not completed."
  This becomes useful both for `brain.md` updates and for the final report's honesty about scope.
- When a module is finished, briefly note in commit messages which TRD section it implements
  (e.g. `feat: implement Hungarian algorithm assignment engine (TRD §3.4)`).

## 6. Demo/report readiness

- By end of Week 4, the system should be deployed (Docker → Railway/Render backend, Vercel
  frontend) and runnable end-to-end via the Scenario Simulator.
- Week 5 is reserved for: dashboard polish, running and recording the mass-casualty-event demo
  scenario, and writing/assembling the final report — not for new features. If Week 4 finishes
  early, resist scope creep; use the extra time to harden tests and polish the demo instead.

## 7. Tone/scope honesty

- When generating any user-facing copy (dashboard labels, report language, README), be accurate
  about what this system is: a simulation/demonstration of algorithmic techniques applied to a
  healthcare resource-allocation scenario — not a validated clinical tool. Don't let generated
  marketing-style copy overclaim real-world readiness.
