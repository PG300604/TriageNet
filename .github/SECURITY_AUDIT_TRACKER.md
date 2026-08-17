# TriageNet Security Audit & Open Source Hardening Tracker

This document tracks the remediation of findings from the **TriageNet Security Audit (Aug 2026)**. These issues are open for community contribution and can earn GitHub profile badges (**Good First Issue**, **Security**, **Help Wanted**).

---

## Issue Summary Matrix

| # | Issue Title | Severity | Component | Labels | Status |
|---|---|---|---|---|---|
| **1** | [Hardcoded Default JWT Secret & Missing Environment Guard](#issue-1--hardcoded-default-jwt-secret) | 🔴 `CRITICAL` | Backend (Auth) | `security`, `critical`, `backend`, `auth` | 📋 Open |
| **2** | [Restrict Permissive CORS Wildcard (*) to Authorized Origins](#issue-2--restrict-permissive-cors-wildcard) | 🔴 `HIGH` | Backend (Security) | `security`, `high`, `good first issue` | 📋 Open |
| **3** | [Enforce RBAC Method-Level Security (@PreAuthorize) Across Controllers](#issue-3--enforce-rbac-method-level-security) | 🔴 `CRITICAL` | Backend (RBAC) | `security`, `critical`, `rbac` | 📋 Open |
| **4** | [Password Complexity Validation & Account Lockout](#issue-4--password-complexity--account-lockout) | 🔴 `HIGH` | Backend (Auth) | `security`, `high`, `good first issue` | 📋 Open |
| **5** | [Migrate JWT Storage from localStorage to HttpOnly Cookies](#issue-5--migrate-jwt-storage-to-httponly-cookies) | 🟠 `MEDIUM` | Frontend (Auth) | `security`, `medium`, `frontend` | 📋 Open |
| **6** | [Security Headers (CSP, HSTS) & Production Error Sanitization](#issue-6--security-headers--error-sanitization) | 🟠 `MEDIUM` | Backend (Security) | `security`, `medium`, `good first issue` | 📋 Open |
| **7** | [Dependency Upgrades (Spring Boot 3.3+) & Non-Root Docker](#issue-7--dependency-upgrades--docker-hardening) | 🟡 `LOW` | DevOps / Infra | `security`, `low`, `devops` | 📋 Open |

---

## Detailed Issue Specifications & Reproduction Steps

### Issue 1 — Hardcoded Default JWT Secret
- **Severity**: 🔴 `CRITICAL` (Deploy Blocker)
- **Affected Files**:
  - `backend/src/main/resources/application.yml`
  - `backend/src/main/resources/application-dev.yml`
  - `backend/src/main/java/com/triagenet/util/JwtUtil.java`
- **Description**: The default secret string `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` is committed in source control. Anyone with repo access can sign arbitrary JWTs.
- **Fix**: Remove fallback from `application.yml` for prod profiles. Fail fast on startup if `JWT_SECRET` is unset or less than 256 bits of entropy.

### Issue 2 — Restrict Permissive CORS Wildcard (*)
- **Severity**: 🔴 `HIGH`
- **Affected Files**:
  - `AuthController.java`, `HospitalController.java`, `PatientController.java`, `ResourceController.java`, `RoutingController.java`, `TriageQueueController.java`, `DashboardController.java`, `ReferralController.java`
- **Description**: Controller-level `@CrossOrigin(origins = "*")` permits cross-origin requests from any arbitrary domain.
- **Fix**: Centralize CORS configuration inside `SecurityConfig.java` allowing only specific origins (`http://localhost:3000`, `https://triagenet.vercel.app`) and explicit HTTP headers.

### Issue 3 — Enforce RBAC Method-Level Security Across Controllers
- **Severity**: 🔴 `CRITICAL`
- **Affected Files**:
  - `SecurityConfig.java`, `HospitalController.java`, `PatientController.java`, `ResourceController.java`, `RoutingController.java`
- **Description**: `.permitAll()` on `/api/**` in `SecurityConfig.java` exposes REST endpoints to unauthenticated users.
- **Fix**: Require valid JWT bearer authentication for all `/api/**` endpoints (except `/api/auth/**`) and annotate controller methods with `@PreAuthorize("hasAnyRole(...)")`.

### Issue 4 — Password Complexity & Account Lockout
- **Severity**: 🔴 `HIGH` / 🟠 `MEDIUM`
- **Affected Files**:
  - `RegisterRequest.java`, `CustomUserDetails.java`, `AuthService.java`
- **Description**: Passwords lack complexity regex enforcement. No lockout exists for brute-force login attempts.
- **Fix**: Add `@Pattern` validation for uppercase, lowercase, number, and special character. Add failed attempt tracking and lockout after 5 consecutive failures.

### Issue 5 — Migrate JWT Storage to HttpOnly Cookies
- **Severity**: 🟠 `MEDIUM`
- **Affected Files**:
  - `frontend/lib/api-client.ts`, `frontend/lib/auth-context.tsx`
- **Description**: Storing JWT in browser `localStorage` makes tokens vulnerable to XSS exfiltration.
- **Fix**: Issue tokens via `HttpOnly; Secure; SameSite=Strict` cookies upon login.

### Issue 6 — Security Headers & Error Sanitization
- **Severity**: 🟠 `MEDIUM`
- **Affected Files**:
  - `SecurityConfig.java`, `GlobalExceptionHandler.java`
- **Description**: Missing Content-Security-Policy (CSP), HSTS headers. Internal exception message is returned to clients on 500 errors.
- **Fix**: Enable Spring Security standard header filters and mask internal error details in `GlobalExceptionHandler.java`.

### Issue 7 — Dependency Upgrades & Docker Hardening
- **Severity**: 🟡 `LOW`
- **Affected Files**:
  - `backend/pom.xml`, `Dockerfile`, `docker-compose.yml`
- **Description**: Upgrade Spring Boot 3.2.5 to 3.3.x and JJWT 0.12.x; configure non-root user in Docker containers.

---

## How to Contribute & Earn Badges

1. Fork the [TriageNet repository](https://github.com/PG300604/TriageNet).
2. Create a branch: `git checkout -b fix/issue-<number>-<description>`.
3. Implement the remediation and verify tests pass:
   - Backend: `./mvnw clean test`
   - Frontend: `npm run build`
4. Submit a Pull Request referencing the issue number (e.g. `Fixes #1`).
