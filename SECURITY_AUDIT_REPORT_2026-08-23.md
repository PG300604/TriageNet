# TriageNet — Full Security Audit & Bug Report
**Date:** 2026-08-23 · **Scope:** backend (Spring Boot 3.3.2 / Java 17), frontend (Next.js 16), docker-compose
**Method:** White-box source review + black-box live testing of the running backend (`dev` profile).

Severity legend: CRITICAL / HIGH / MEDIUM / LOW for vulnerabilities; BUG for functional defects.

---

## VULNERABILITIES

### V1. Unauthenticated self-registration as SUPER_ADMIN — CRITICAL (confirmed live)
`POST /api/auth/register` is public (`/api/auth/**` is permitAll in `SecurityConfig.java:96`) and the caller fully controls the `role` field.
Confirmed: registered a user with `"role":"SUPER_ADMIN"` → HTTP 201, logged in, received full-power token.
`AuthService.register()` (AuthService.java:87) accepts any RoleName with no invite code or admin approval.
**Fix:** remove role from RegisterRequest (force HOSPITAL_STAFF), require admin invitation/approval flow.

### V2. H2 console exposed unauthenticated in dev profile — HIGH (dev-only)
`SecurityConfig.java:92` permits `/h2-console/**` when profile dev/test/local is active. Default active profile IS `dev`
(application.yml: `${SPRING_PROFILES_ACTIVE:dev}`), so anyone deploying without setting the profile gets SQL console access
(= full DB read/write). Confirmed reachable: `/h2-console/` → 200.

### V3. JWT secret defaults to empty string → app refuses to boot in prod unless configured; but any 32+ byte value passes — MEDIUM
`JwtUtil.validateJwtConfiguration()` only enforces length ≥32 bytes and blocks one known hardcoded default in prod profiles.
No entropy check, no block of weak secrets like "aaaa…" outside the single blacklisted literal. Also the well-known dev secret
(`application-dev.yml`: `404E63…`) lets anyone forge tokens on every dev/staging deployment.

### V4. JWTs cannot be revoked; 24h lifetime; no refresh/rotation — MEDIUM
Stateless tokens remain valid after logout (logout only clears the cookie, AuthController.logout) and after account lock/disable.
Stolen token = 24h of access. Consider short expiry + refresh tokens or a denylist.

### V5. Account lockout is per-email only, no IP dimension — MEDIUM
LoginAttemptService keys solely on email: an attacker can lock out arbitrary users (denial-of-service against hospital staff logins,
confirmed: 5 bad attempts → HTTP 423) while their own distributed password spraying from many IPs is never throttled.

### V6. CORS allows credentials to wildcard-ish origins — LOW/MEDIUM
`https://*.vercel.app` + allowCredentials(true): any attacker-hosted `*.vercel.app` preview deployment can make credentialed requests
against the API if a user visits it while holding the cookie. Restrict to your exact frontend origin(s).

### V7. Missing security headers on API responses — LOW
Live response had only X-Content-Type-Options / X-Frame-Options / X-XSS-Protection. No CSP (fine for pure API), but also no
`Cache-Control: no-store` on authenticated PHI endpoints — patient data can be cached by intermediate proxies.

### V8. Dependency vulnerabilities (frontend) — HIGH (supply chain)
`npm audit --omit=dev`:
- **next 16.2.6** — 9 advisories incl. middleware bypass (GHSA-6gpp-xcg3-4w24), Server Action DoS (GHSA-m99w-x7hq-7vfj),
  SSRF in rewrites (GHSA-p9j2-gv94-2wf4), cache confusion (GHSA-68g3-v927-f742), image-optimization DoS (GHSA-q8wf-6r8g-63ch).
  Fix available: next ≥16.3.x.
- **nanoid <3.3.18** (high) and **hono ≤4.12.33** (moderate, incl. cross-user SSR disclosure GHSA-f23p-vx2j-j53r).
Note: pnpm override pins hono 4.12.25, which is still below the fixed 4.12.34.

### V9. CSRF disabled with cookie auth across two ports — MEDIUM
CSRF is disabled (correct for Bearer-header use), but the app ALSO authenticates via `triagenet_jwt` HttpOnly cookie
(JwtAuthenticationFilter reads it) and the frontend calls with `credentials:'include'`. Cookie-based auth + csrf().disable() =
classic CSRF surface. SameSite=Lax mitigates cross-site POSTs partially, but Lax still sends top-level navigation GETs;
any state-changing GET would be exploitable. Add double-submit token or drop cookie auth.

### V10. Patient PII returned to any authenticated staff regardless of hospital — MEDIUM (IDOR)
`GET /api/triage-queue/{hospitalId}`, `/api/patients`, `/api/patients/{id}` have role checks but NO tenant scoping:
a HOSPITAL_STAFF user at hospital A can read patients and queues of hospital B. Confirmed live: SUPER_ADMIN token could fetch any
hospital's queue; role model implies per-hospital isolation that isn't enforced. Multi-tenant authorization gap (CWE-639).

---

## BUGS (functional/logic)

### B1. `POST /api/patients` always returns 500 without explicit hospitalId — confirmed live
Patient requires non-null hospital_id; controller takes raw entity, service doesn't validate. Any caller omitting hospitalId
gets "Internal Server Error" instead of 400, and the severity score row may be committed inconsistently depending on tx rollback.
Fix: DTO + validation, return 400.

### B2. `/api/resources/transfer` is a stub that lies — confirmed live
Returns "Successfully transferred -100 ventilator …" for nonexistent hospital UUIDs and negative quantities. No validation,
no persistence, no stock decrement. Dangerous in a healthcare system (fake audit trail).

### B3. No input validation on clinical vitals — confirmed live
`score-vitals` accepted `spo2:-500, heartRate:99999, systolicBp:-1, temperatureC:999`. Score math produced absurd factor
contribution (Tachycardia 3357%). ClinicalVitals has no @Min/@Max constraints.

### B4. Discharge bed-accounting race/double-count — PatientService.dischargePatient
Frees a bed for status WAITING too (a WAITING patient was never occupying a bed → usedBeds decremented wrongly), then auto-assigns
"first waiting patient" using `patientRepository.findAll()` streamed in-memory with findFirst — unordered, not by severity/priority,
no locking → concurrent discharges corrupt bed counts.

### B5. ReferralController duplicates ReferralService logic and diverges
Controller re-implements getActiveReferrals/updateReferralStatus with its own mapping; `Random random` field instantiated but
unused; comment says dispatch token "#JH-108-DISPATCH-XXXX" generated — no such token exists in the response path shown.
Also `executeReferral` sets travelMinutes=30.0 hardcoded ("refined by Dijkstra in production" — it never is).

### B6. Dashboard fabricates ICU numbers — DashboardController.getStateOverview
When totalIcuBeds/availableIcuBeds are null it substitutes constants 10 and 2 per hospital. State-level ICU stats are fiction.

### B7. O(N²)/O(N³) hot paths over findAll()
Dashboard district matching filters all hospitals per district; ReferralService.calculateRecommendation recomputes severity scores
repeatedly inside nested stream sorts (computeSeverityFromPatient called O(N²) times); discharge uses findAll() in a loop context.
Fine for demo scale, will fall over at real Jharkhand scale (~hundreds of hospitals × thousands of patients).

### B8. `next.config.mjs` sets `typescript.ignoreBuildErrors: true`
Type errors ship to production silently. Remove this flag.

### B9. Frontend stores user profile JSON in localStorage
Token itself is HttpOnly-cookie (good), but `triagenet_user` display metadata in localStorage is a spoofable trust source if
any UI logic trusts it for role gating (auth-context.tsx:100). Verify all gating happens server-side (it does today via @PreAuthorize,
but client-side route guards reading localStorage can be tampered with).

### B10. Error handling leaks transaction semantics
IllegalArgumentException → 400 handler is fine, but generic RuntimeException("User not found") paths map to 500 with contact-support
message even for recoverable cases (AuthService.login line ~110). Inconsistent error taxonomy.

### B11. `ddl-auto: update` in the default profile
Schema drift risk in shared environments; combined with V2 (H2 console) it's trivially abusable in dev deployments.

---

## WHAT HELD UP WELL
- BCrypt password hashing, DaoAuthenticationProvider.
- Brute-force lockout works (5 attempts → HTTP 423, verified live) with clean capacity-bounded in-memory cache.
- GlobalExceptionHandler sanitizes messages; SecurityAuditService actively prevents log forging (CWE-117) with masking + CRLF stripping.
- JWT parse uses verifyWith (symmetric key, no alg-confusion); token validation rejects expired/bad signatures.
- Method-level @PreAuthorize consistently applied on sensitive controllers (except the noted dashboard/routing gaps which are intentional public data).
- Generic 500s don't leak stack traces to clients.

## TOP PRIORITIES
1. Fix V1 (public SUPER_ADMIN registration) — this alone compromises the entire system.
2. Upgrade Next.js and clear npm audit; bump hono override past 4.12.34.
3. Add tenant scoping (hospitalId) checks to patient/queue endpoints.
4. Replace the resource-transfer stub or gate it behind feature flag.
5. Validate vitals ranges and patient-create payload.
