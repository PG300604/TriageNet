# TriageNet Security Audit & Open Source Hardening Tracker

This document tracks all security findings from the **Hermes Automated Security Audit (September 3, 2026)** as well as historical audits. These issues are cataloged for resolution in our upcoming **Light Security Sprints** and are open for community contribution.

---

## 🎯 Active Sprint Backlog — Hermes Agent Findings (Sep 2026)

| # | Issue Title | Severity | CWE | Component | Labels | Status |
|---|---|---|---|---|---|---|
| **B1** | [Dev Profile Fallback JWT Secret Vulnerability](#issue-b1--dev-profile-fallback-jwt-secret) | 🟠 `MEDIUM` | CWE-798 | Backend (Auth) | `security`, `sprint`, `backend` | 📋 Ready for Sprint |
| **B2** | [Enforce Content-Security-Policy (CSP) Directives](#issue-b2--enforce-content-security-policy-csp) | 🟠 `MEDIUM` | CWE-693 | Backend (Headers) | `security`, `sprint`, `good-first-issue` | 📋 Ready for Sprint |
| **B3** | [Permissive permitAll() Endpoints Without Hospital Tenant Scoping](#issue-b3--permissive-permitall-endpoints) | 🟠 `MEDIUM` | CWE-639 | Backend (RBAC) | `security`, `sprint`, `rbac` | 📋 Ready for Sprint |
| **B4** | [application-local.yml.example Hardcoded Secret Cleansing](#issue-b4--application-localymlexample-secret-cleansing) | 🟡 `LOW` | CWE-522 | Config / Templates | `security`, `hygiene`, `good-first-issue` | 📋 Ready for Sprint |
| **B5** | [Runtime Dynamic Test Profile CSPRNG Secret](#issue-b5--runtime-dynamic-test-profile-csprng-secret) | 🟡 `LOW` | CWE-330 | Testing / CI | `security`, `tests` | 📋 Ready for Sprint |

---

## 📋 Detailed Sprint Issue Specifications

### Issue B1 — Dev Profile Fallback JWT Secret (CWE-798)
- **Severity**: 🟠 `MEDIUM`
- **Affected File**: `backend/src/main/resources/application-dev.yml:27`
- **Description**: `application-dev.yml` contains a fallback secret:
  ```yaml
  jwt:
    secret: ${JWT_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
  ```
  While production rejects this secret via `JwtUtil`, a staging or dev deployment without `JWT_SECRET` set will use this publicly known secret, enabling token forgery in dev environments.
- **Sprint Task**:
  1. Remove the fallback string from `application-dev.yml`.
  2. If `JWT_SECRET` is unset in dev, dynamically generate a fresh 256-bit random secret at startup, or require developers to define `JWT_SECRET`.
- **Target Sprint**: Sprint 10 (Light Security).

---

### Issue B2 — Enforce Content-Security-Policy (CSP) (CWE-693)
- **Severity**: 🟠 `MEDIUM`
- **Affected File**: `backend/src/main/java/com/triagenet/config/SecurityConfig.java:100-108`
- **Description**: While HSTS, X-Frame-Options, and nosniff headers are enabled, the application currently lacks a `Content-Security-Policy` header, leaving defense-in-depth against XSS incomplete.
- **Sprint Task**:
  Add standard CSP directives in `SecurityConfig.java`:
  ```java
  headers.contentSecurityPolicy(csp -> csp.policyDirectives(
      "default-src 'self'; " +
      "script-src 'self'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://triagenet.vercel.app https://triagenet.gov.in; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'"
  ));
  ```
- **Target Sprint**: Sprint 10 (Light Security).

---

### Issue B3 — Permissive `permitAll()` Endpoints (CWE-639)
- **Severity**: 🟠 `MEDIUM`
- **Affected Files**:
  - `backend/src/main/java/com/triagenet/config/SecurityConfig.java:116-124`
  - `HospitalController.java`, `DashboardController.java`, `RoutingController.java`
- **Description**: The endpoints `/api/dashboard/**`, `/api/hospitals/**`, `/api/routing/optimal`, and `/api/patients/score-vitals` are marked `permitAll()`. While public access may be intended for landing page previews, internal hospital metrics, quotas, and patient vitals evaluation should be protected or scoped by facility tenant.
- **Sprint Task**:
  1. Audit public vs. authenticated requirements for each endpoint.
  2. Guard state-sensitive endpoints under `@PreAuthorize("hasAnyRole(...)")`.
  3. Verify `HospitalAuthorizationService` scopes hospital-specific metrics to assigned staff.
- **Target Sprint**: Sprint 10 (Light Security).

---

### Issue B4 — application-local.yml.example Secret Cleansing (CWE-522)
- **Severity**: 🟡 `LOW`
- **Affected File**: `backend/src/main/resources/application-local.yml.example:25`
- **Description**: The example template contains the old 64-char hex secret string in version control.
- **Sprint Task**:
  Replace with a placeholder instruction:
  ```yaml
  jwt:
    # Generate with: openssl rand -hex 32
    secret: CHANGE_ME_GENERATE_WITH_OPENSSL_RAND_HEX_32
  ```
- **Target Sprint**: Sprint 10 (Light Security).

---

### Issue B5 — Runtime Dynamic Test Profile CSPRNG Secret (CWE-330)
- **Severity**: 🟡 `LOW`
- **Affected File**: `backend/src/test/resources/application-test.yml:20`
- **Description**: Test profile uses a fixed high-entropy CSPRNG secret. While acceptable for CI/CD test isolation, dynamic property generation offers cleaner hygiene.
- **Sprint Task**:
  Document explicit test-profile isolation or switch to `@DynamicPropertySource` in base test classes.
- **Target Sprint**: Sprint 11.

---

## ✅ Historical Findings (Resolved & Closed)

| # | Title | Original Severity | Resolution Phase | Status |
|---|---|---|---|---|
| **1** | Hardcoded Base JWT Secret in `application.yml` | 🔴 `CRITICAL` | Phase 8.1 & 9 | ✅ Resolved (Fail-Fast Entropy Guard) |
| **2** | Permissive Wildcard CORS `*` on Controllers | 🔴 `HIGH` | Phase 8.1 & 8.2 | ✅ Resolved (Exact-Origin Allowlist) |
| **3** | Unprotected `/api/**` Endpoints Without RBAC | 🔴 `CRITICAL` | Phase 8.1 & 9 | ✅ Resolved (`@PreAuthorize` on All Endpoints) |
| **4** | Password Complexity & Account Lockout | 🔴 `HIGH` | Phase 8.1 & 9 | ✅ Resolved (Regex + DB Lockout Service) |
| **5** | JWT Insecure `localStorage` Storage | 🟠 `MEDIUM` | Phase 8.1 & 9 | ✅ Resolved (HttpOnly SameSite Cookies) |
| **6** | Lack of Standard Security Headers & Error Masking | 🟠 `MEDIUM` | Phase 8.1 & 8.2 | ✅ Resolved (HSTS, nosniff, cache-control) |
| **7** | Vulnerable Dependencies & Root Container Execution | 🟡 `LOW` | Phase 8.1 & 9 | ✅ Resolved (Spring Boot 3.3.2, Non-Root 1001) |
| **8** | Unsanitized Audit Logging | 🟠 `MEDIUM` | Phase 8.1 | ✅ Resolved (CWE-117 PII Sanitizer) |
| **9** | Lack of Refresh Token Revocation | 🔴 `HIGH` | Phase 9 | ✅ Resolved (7-Day Cookie Rotation & Replay Defense) |
| **10** | Third-Party Auth & SMS Gateway Dependence | 🔴 `HIGH` | Phase 9.1 & 9.2 | ✅ Resolved (Self-Sovereign Staff ID + TOTP/BIP-39) |
