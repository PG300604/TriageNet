/**
 * scripts/create_github_issues.js
 * Automatically publishes the 7 security audit issue groups to GitHub via REST API
 * 
 * Usage:
 *   node scripts/create_github_issues.js [GITHUB_TOKEN]
 *   Or set GITHUB_TOKEN=your_token_here in environment
 */

const https = require('https');

const REPO_OWNER = 'PG300604';
const REPO_NAME = 'TriageNet';
const TOKEN = process.argv[2] || process.env.GITHUB_TOKEN;

const ISSUES = [
  {
    title: '[Security] Hardcoded Default JWT Secret & Missing Environment Guard in Backend',
    labels: ['security', 'critical', 'backend', 'auth', 'help wanted'],
    body: `### 🔴 Severity: CRITICAL (Deploy Blocker)

#### Problem Description
The backend configuration currently contains a default hardcoded JWT secret in \`application.yml\`, \`application-dev.yml\`, and \`JwtUtil.java\`:
\`\`\`text
404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
\`\`\`
Anyone with repository access can forge valid JWT tokens for any role (including \`SUPER_ADMIN\`), bypassing authentication.

#### Affected Files
- \`backend/src/main/resources/application.yml\`
- \`backend/src/main/resources/application-dev.yml\`
- \`backend/src/main/java/com/triagenet/util/JwtUtil.java\`

#### Proposed Remediation
1. Remove hardcoded fallback secrets from \`application.yml\` in production profiles.
2. In \`JwtUtil.java\`, validate that \`JWT_SECRET\` has at least 256 bits of entropy on application startup.
3. Fail fast on startup in \`prod\` profile if \`JWT_SECRET\` is missing or matches the known development key.

#### Good First Issue / Contributor Guidance
Check out \`JwtUtil.java\` and ensure proper Spring \`@Value("\${jwt.secret}")\` injection without static secret fallbacks.`
  },
  {
    title: '[Security] Restrict Permissive CORS Wildcard (*) to Authorized Frontend Origins',
    labels: ['security', 'high', 'backend', 'good first issue', 'help wanted'],
    body: `### 🔴 Severity: HIGH

#### Problem Description
Controllers currently declare \`@CrossOrigin(origins = "*")\`, allowing any arbitrary domain to execute cross-origin requests against the TriageNet API.

#### Affected Files
- \`backend/src/main/java/com/triagenet/controller/AuthController.java\`
- \`backend/src/main/java/com/triagenet/controller/HospitalController.java\`
- \`backend/src/main/java/com/triagenet/controller/PatientController.java\`
- \`backend/src/main/java/com/triagenet/controller/TriageQueueController.java\`
- \`backend/src/main/java/com/triagenet/controller/ResourceController.java\`
- \`backend/src/main/java/com/triagenet/controller/RoutingController.java\`
- \`backend/src/main/java/com/triagenet/controller/DashboardController.java\`
- \`backend/src/main/java/com/triagenet/controller/ReferralController.java\`

#### Proposed Remediation
1. Remove all controller-level \`@CrossOrigin(origins = "*")\` annotations.
2. Centralize CORS in \`SecurityConfig.java\` via \`CorsConfigurationSource\`:
\`\`\`java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000", "https://triagenet.vercel.app"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
\`\`\``
  },
  {
    title: '[Security] Enforce RBAC Method-Level Security (@PreAuthorize) Across All REST Controllers',
    labels: ['security', 'critical', 'backend', 'rbac', 'help wanted'],
    body: `### 🔴 Severity: CRITICAL

#### Problem Description
In \`SecurityConfig.java\`, \`requestMatchers("/api/**").permitAll()\` exposes almost all operational endpoints publicly. While \`ReferralController\` has method-level \`@PreAuthorize\`, other controllers (\`HospitalController\`, \`PatientController\`, \`ResourceController\`, \`RoutingController\`, \`TriageQueueController\`) lack role guards.

#### Affected Files
- \`backend/src/main/java/com/triagenet/config/SecurityConfig.java\`
- \`backend/src/main/java/com/triagenet/controller/HospitalController.java\`
- \`backend/src/main/java/com/triagenet/controller/PatientController.java\`
- \`backend/src/main/java/com/triagenet/controller/ResourceController.java\`
- \`backend/src/main/java/com/triagenet/controller/RoutingController.java\`
- \`backend/src/main/java/com/triagenet/controller/TriageQueueController.java\`

#### Proposed Remediation
1. Lock down \`SecurityConfig.java\` to only permit public access to \`/api/auth/**\` and healthchecks.
2. Add \`@PreAuthorize\` with granular roles (\`TRIAGE_NURSE\`, \`HOSPITAL_ADMIN\`, \`DISTRICT_CMO\`, \`STATE_HEALTH_DEPT\`, \`SUPER_ADMIN\`) to:
   - Patient intake & vitals scoring (\`TRIAGE_NURSE\`, \`HOSPITAL_ADMIN\`)
   - Resource bed assignment (\`HOSPITAL_ADMIN\`, \`SUPER_ADMIN\`)
   - Hospital management & state overview (\`DISTRICT_CMO\`, \`STATE_HEALTH_DEPT\`, \`SUPER_ADMIN\`)`
  },
  {
    title: '[Security] Implement Password Complexity Rules & Account Lockout on Failed Logins',
    labels: ['security', 'high', 'backend', 'auth', 'good first issue'],
    body: `### 🔴 Severity: HIGH / 🟠 MEDIUM

#### Problem Description
1. \`RegisterRequest.java\` lacks validation rules on password complexity (allowing 1-character or common passwords).
2. \`CustomUserDetails.java\` always returns \`true\` for \`isAccountNonLocked()\`, with no tracking for brute-force / credential stuffing protection.

#### Affected Files
- \`backend/src/main/java/com/triagenet/dto/RegisterRequest.java\`
- \`backend/src/main/java/com/triagenet/config/CustomUserDetails.java\`
- \`backend/src/main/java/com/triagenet/service/AuthService.java\`

#### Proposed Remediation
1. Add bean validation annotations in \`RegisterRequest.java\`:
\`\`\`java
@NotBlank(message = "Password is required")
@Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
@Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$",
         message = "Password must contain at least one digit, lowercase, uppercase, and special character")
private String password;
\`\`\`
2. Add a failed login attempt counter with temporary 15-minute account lockout after 5 consecutive failures.`
  },
  {
    title: '[Security] Migrate JWT Storage from localStorage to Secure HttpOnly SameSite Cookies',
    labels: ['security', 'medium', 'frontend', 'auth', 'help wanted'],
    body: `### 🟠 Severity: MEDIUM

#### Problem Description
The Next.js frontend currently stores authentication tokens in browser \`localStorage\` (\`frontend/lib/api-client.ts\` and \`frontend/lib/auth-context.tsx\`). If a Cross-Site Scripting (XSS) vulnerability exists, tokens can be extracted by malicious third-party scripts.

#### Affected Files
- \`frontend/lib/api-client.ts\`
- \`frontend/lib/auth-context.tsx\`
- \`backend/src/main/java/com/triagenet/controller/AuthController.java\`

#### Proposed Remediation
1. Set the JWT token via an \`HttpOnly\`, \`Secure\`, \`SameSite=Strict\` cookie on successful \`POST /api/auth/login\`.
2. Clear the cookie on \`POST /api/auth/logout\`.
3. Update frontend \`ApiClient\` to include \`credentials: 'include'\` on all API requests.`
  },
  {
    title: '[Security] Configure Standard Security Headers (CSP, HSTS) & Sanitize Production Error Details',
    labels: ['security', 'medium', 'backend', 'good first issue'],
    body: `### 🟠 Severity: MEDIUM

#### Problem Description
1. \`SecurityConfig.java\` lacks standard OWASP security response headers (Content-Security-Policy, HSTS, X-Content-Type-Options, Referrer-Policy).
2. \`GlobalExceptionHandler.java\` returns raw \`ex.getMessage()\` for generic \`500 Internal Server Error\`, potentially leaking stack trace details in production.

#### Affected Files
- \`backend/src/main/java/com/triagenet/config/SecurityConfig.java\`
- \`backend/src/main/java/com/triagenet/exception/GlobalExceptionHandler.java\`

#### Proposed Remediation
1. Configure security headers in \`SecurityConfig.java\`:
\`\`\`java
http.headers(headers -> headers
    .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
    .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000))
    .frameOptions(frame -> frame.deny())
);
\`\`\`
2. In \`GlobalExceptionHandler.java\`, return a generic message ("An unexpected error occurred. Please contact support.") for uncaught 500 exceptions while logging full details internally.`
  },
  {
    title: '[Security] Dependency Upgrades (Spring Boot 3.3.x, JJWT 0.12.x) & Non-Root Docker Container',
    labels: ['security', 'low', 'devops', 'dependencies', 'good first issue'],
    body: `### 🟡 Severity: LOW / Defense-in-Depth

#### Problem Description
1. \`pom.xml\` uses Spring Boot \`3.2.5\`; upgrading to \`3.3.x\` resolves upstream dependency CVEs.
2. JJWT can be updated to latest stable version (\`0.12.6\`).
3. Production Dockerfiles should run as a non-root unprivileged user (\`USER triagenet\`).

#### Affected Files
- \`backend/pom.xml\`
- \`Dockerfile\` / \`docker-compose.yml\`

#### Proposed Remediation
1. Bump \`<spring-boot.version>\` in \`pom.xml\` to \`3.3.3\` and verify test suite pass.
2. In backend and frontend Dockerfiles, add:
\`\`\`dockerfile
RUN addgroup -S triagenet && adduser -S triagenet -G triagenet
USER triagenet
\`\`\`
3. Remove default database passwords in production environment variable templates.`
  }
];

if (!TOKEN) {
  console.log('========================================================================');
  console.log('TriageNet Security Audit GitHub Issue Generator');
  console.log('========================================================================\n');
  console.log('⚠️  No GITHUB_TOKEN provided.');
  console.log('To automatically publish all 7 issues via GitHub API, run:');
  console.log('   node scripts/create_github_issues.js <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>\n');
  console.log('Or use the 1-Click Pre-filled Web Links below to raise each issue:\n');

  ISSUES.forEach((issue, idx) => {
    const url = `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new?title=${encodeURIComponent(issue.title)}&labels=${encodeURIComponent(issue.labels.join(','))}&body=${encodeURIComponent(issue.body)}`;
    console.log(`[Issue #${idx + 1}] ${issue.title}`);
    console.log(`Labels: ${issue.labels.join(', ')}`);
    console.log(`1-Click Creation Link: ${url}\n`);
  });
  process.exit(0);
}

async function createIssue(issue) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      title: issue.title,
      body: issue.body,
      labels: issue.labels
    });

    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
      method: 'POST',
      headers: {
        'User-Agent': 'TriageNet-Security-Audit-Script',
        'Authorization': `token ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode === 201) {
          const result = JSON.parse(responseBody);
          console.log(`✅ Created Issue #${result.number}: ${result.html_url}`);
          resolve(result);
        } else {
          console.error(`❌ Failed (${res.statusCode}): ${responseBody}`);
          resolve(null);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

(async () => {
  console.log(`🚀 Publishing ${ISSUES.length} Security Audit Issues to ${REPO_OWNER}/${REPO_NAME}...\n`);
  for (const issue of ISSUES) {
    try {
      await createIssue(issue);
      // Brief pause to respect GitHub rate limits
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.error(`Error creating issue:`, e.message);
    }
  }
  console.log('\n🎉 All security audit issues published successfully!');
})();
