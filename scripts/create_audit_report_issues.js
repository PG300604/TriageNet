/**
 * scripts/create_audit_report_issues.js
 * Automatically publishes or generates 1-click URLs for findings from SECURITY_AUDIT_REPORT.md
 *
 * Usage:
 *   node scripts/create_audit_report_issues.js [GITHUB_TOKEN]
 *   Or run without token to generate instant 1-click web links.
 */

const https = require('https');

const REPO_OWNER = 'PG300604';
const REPO_NAME = 'TriageNet';
const TOKEN = process.argv[2] || process.env.GITHUB_TOKEN;

const AUDIT_ISSUES = [
  {
    title: '[Security A1] Remove Hardcoded Default JWT Secret from All Env Files, Test Profile & Docker Compose',
    labels: ['security', 'high', 'backend', 'auth', 'deploy-blocker'],
    body: `### 🔴 Severity: HIGH (Deploy Blocker)
**CWE**: CWE-798 (Use of Hard-coded Credentials)

#### Problem Description
The backend configuration currently contains a default hardcoded JWT secret in \`JwtUtil.java\`, \`application.yml\`, \`application-dev.yml\`, \`application-local.yml\`, \`application-test.yml\`, and \`docker-compose.yml\`:
\`\`\`text
404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
\`\`\`
While \`JwtUtil.validateJwtConfiguration()\` correctly rejects this key in production profiles, having it present in version control means any non-prod or default container deployment is exposed to token forgery.

#### Affected Files
- \`backend/src/main/java/com/triagenet/util/JwtUtil.java\`
- \`backend/src/main/resources/application.yml\`
- \`backend/src/main/resources/application-dev.yml\`
- \`backend/src/main/resources/application-local.yml\`
- \`backend/src/test/resources/application-test.yml\`
- \`docker-compose.yml\`

#### Proposed Remediation
1. Remove the static fallback secret from \`@Value("\${jwt.secret}")\` in \`JwtUtil.java\` — require explicit configuration.
2. Remove hardcoded default values from \`application.yml\`, \`application-dev.yml\`, \`application-local.yml\`, and \`docker-compose.yml\`.
3. In \`application-test.yml\`, generate or inject a test-only dynamic random key or use \`@TestPropertySource\`.
4. Fail fast with an informative exception if \`jwt.secret\` is unset on startup.`
  },
  {
    title: '[Security A2] Persist Login Attempt Tracking and Lockout State to PostgreSQL Database',
    labels: ['security', 'medium', 'backend', 'auth', 'database'],
    body: `### 🟠 Severity: MEDIUM
**CWE**: CWE-345 (Insufficient Verification of Data Authenticity)

#### Problem Description
\`LoginAttemptService\` currently tracks failed login attempts and account lockout expiration exclusively in an in-memory \`ConcurrentHashMap\`. 
On application restart or service redeployment, all lockout state is lost, allowing blocked brute-force attackers to resume authentication attempts immediately.

#### Affected Files
- \`backend/src/main/java/com/triagenet/service/LoginAttemptService.java\`
- \`backend/src/main/java/com/triagenet/service/AuthService.java\`

#### Proposed Remediation
1. Create a database entity and JPA repository for persistent login attempts (e.g. \`login_attempts\` table with \`email\`, \`attempts\`, \`last_attempt_at\`, \`lock_expires_at\`).
2. Persist lockout state on failure transitions and verify database state during startup or authentication checks.
3. Add automated integration tests verifying lockout persists across simulated service restarts.`
  },
  {
    title: '[Security A3] Complete Pure HttpOnly Cookie Migration in Frontend & Remove LocalStorage Token Fallbacks',
    labels: ['security', 'medium', 'frontend', 'auth', 'xss-mitigation'],
    body: `### 🟠 Severity: MEDIUM
**CWE**: CWE-942 (Insecure Storage of Sensitive Information)

#### Problem Description
The Spring Boot backend issues \`HttpOnly; SameSite=Lax\` cookies (\`triagenet_jwt\`) upon login. However, portions of the frontend code (\`api-client.ts\` and \`auth-context.tsx\`) still maintain references to \`localStorage.getItem('triagenet_jwt_token')\` and inject manual \`Authorization: Bearer\` headers.
Storing or reading tokens via \`localStorage\` leaves the application exposed to token exfiltration if an XSS vulnerability occurs.

#### Affected Files
- \`frontend/lib/api-client.ts\`
- \`frontend/lib/auth-context.tsx\`
- \`frontend/components/triagenet/dashboard.tsx\`

#### Proposed Remediation
1. Remove all \`localStorage\` JWT token read/write logic (\`triagenet_jwt_token\`).
2. Rely purely on automatic browser cookie transmission via \`credentials: 'include'\` on all \`fetch()\` API calls.
3. Reserve \`localStorage\` exclusively for non-sensitive UI user display metadata (\`name\`, \`roleTitle\`, \`districtName\`).`
  },
  {
    title: '[Security A4] Add Password Complexity Validation (Uppercase, Lowercase, Digit, Special Character)',
    labels: ['security', 'low', 'backend', 'auth', 'good first issue'],
    body: `### 🟡 Severity: LOW
**CWE**: CWE-521 (Weak Password Requirements)

#### Problem Description
\`RegisterRequest.java\` currently enforces only a minimum length constraint (\`@Size(min = 8)\`). There is no regex complexity validation requiring uppercase letters, lowercase letters, numbers, or special symbols.
As a state healthcare infrastructure platform handling patient vitals and hospital admissions, strong password complexity standards should be strictly enforced.

#### Affected Files
- \`backend/src/main/java/com/triagenet/dto/RegisterRequest.java\`
- \`backend/src/test/java/com/triagenet/controller/SecurityHardeningIntegrationTest.java\`

#### Proposed Remediation
1. Add a \`@Pattern\` constraint on \`RegisterRequest.password\`:
\`\`\`java
@Pattern(
    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_\\-+=\\[\\]{};:'\\\",.<>?/|\\\`~]).{8,}$",
    message = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
)
\`\`\`
2. Add automated unit/integration tests asserting that passwords missing each required character class are rejected with \`400 Validation Failed\`.`
  },
  {
    title: '[Security A5] Restrict Dev/Test Profiles: Secure H2 Console & Remove application-local.yml from Git',
    labels: ['security', 'low', 'devops', 'backend', 'good first issue'],
    body: `### 🟡 Severity: LOW
**CWE**: CWE-1188 (Insecure Default Initialization)

#### Problem Description
1. The development profile exposes the H2 web console at \`/h2-console\` with unauthenticated \`permitAll()\` access.
2. \`application-local.yml\` contains weak local database credentials (\`sa\` / \`""\`) and is tracked in git rather than ignored.

#### Affected Files
- \`backend/src/main/resources/application-dev.yml\`
- \`backend/src/main/resources/application-local.yml\`
- \`backend/src/main/java/com/triagenet/config/SecurityConfig.java\`
- \`.gitignore\`

#### Proposed Remediation
1. Add \`backend/src/main/resources/application-local.yml\` to \`.gitignore\` and provide \`application-local.yml.example\` as a template.
2. Ensure H2 console in \`SecurityConfig.java\` is strictly restricted to localhost or protected behind dev authentication credentials.`
  }
];

function generateWebLinks() {
  console.log('\n================================================================================');
  console.log('       1-CLICK GITHUB ISSUE CREATION LINKS (SECURITY AUDIT REPORT)');
  console.log('================================================================================\n');

  AUDIT_ISSUES.forEach((issue, idx) => {
    const titleEncoded = encodeURIComponent(issue.title);
    const bodyEncoded = encodeURIComponent(issue.body);
    const labelsEncoded = encodeURIComponent(issue.labels.join(','));
    const url = `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new?title=${titleEncoded}&labels=${labelsEncoded}&body=${bodyEncoded}`;

    console.log(`[Issue A${idx + 1}] ${issue.title}`);
    console.log(`Labels: ${issue.labels.join(', ')}`);
    console.log(`👉 Link: ${url}\n`);
  });
}

function publishViaRestApi(token) {
  console.log(`Publishing ${AUDIT_ISSUES.length} issues to https://github.com/${REPO_OWNER}/${REPO_NAME} via GitHub API...\n`);

  let index = 0;

  function sendNext() {
    if (index >= AUDIT_ISSUES.length) {
      console.log('✅ All security audit issues published successfully!');
      return;
    }

    const issue = AUDIT_ISSUES[index];
    const postData = JSON.stringify({
      title: issue.title,
      body: issue.body,
      labels: issue.labels,
    });

    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
      method: 'POST',
      headers: {
        'User-Agent': 'TriageNet-Audit-Publisher',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 201) {
          const json = JSON.parse(data);
          console.log(`[${index + 1}/${AUDIT_ISSUES.length}] Created Issue #${json.number}: ${json.title}`);
          console.log(`     URL: ${json.html_url}`);
        } else {
          console.error(`[${index + 1}/${AUDIT_ISSUES.length}] Failed to create issue: HTTP ${res.statusCode}`);
          console.error(`     Response: ${data}`);
        }
        index++;
        setTimeout(sendNext, 1000); // 1s rate-limit delay
      });
    });

    req.on('error', (e) => {
      console.error(`Request error: ${e.message}`);
      index++;
      setTimeout(sendNext, 1000);
    });

    req.write(postData);
    req.end();
  }

  sendNext();
}

if (TOKEN) {
  publishViaRestApi(TOKEN);
} else {
  generateWebLinks();
}
