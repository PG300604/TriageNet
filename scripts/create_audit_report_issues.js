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
    title: '[Security B1] Remove Dev Profile Fallback JWT Secret in application-dev.yml',
    labels: ['security', 'medium', 'backend', 'auth'],
    body: `### 🟠 Severity: MEDIUM
**CWE**: CWE-798 (Use of Hard-coded Credentials)

#### Problem Description
\`application-dev.yml\` contains a hardcoded fallback JWT secret:
\`\`\`yaml
jwt:
  secret: \${JWT_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
\`\`\`
While \`JwtUtil.validateJwtConfiguration()\` rejects this secret in production profiles, any developer or staging deployment using the \`dev\` profile without setting \`JWT_SECRET\` will use this publicly known secret, enabling token forgery.

#### Affected Files
- \`backend/src/main/resources/application-dev.yml\`

#### Proposed Remediation
1. Remove the fallback string from \`application-dev.yml\` (\`\${JWT_SECRET:}\`).
2. Make \`JWT_SECRET\` required or dynamically generate an ephemeral 256-bit secret on startup in dev profile only.`
  },
  {
    title: '[Security B2] Enforce Content-Security-Policy (CSP) Headers in SecurityConfig',
    labels: ['security', 'medium', 'backend', 'headers', 'good first issue'],
    body: `### 🟠 Severity: MEDIUM
**CWE**: CWE-693 (Protection Mechanism Failure)

#### Problem Description
While HSTS, X-Frame-Options, and nosniff headers are enabled, the application currently lacks a \`Content-Security-Policy\` header. Without CSP, defense-in-depth against Cross-Site Scripting (XSS) relies solely on SameSite cookies and CSRF guards.

#### Affected Files
- \`backend/src/main/java/com/triagenet/config/SecurityConfig.java\`

#### Proposed Remediation
Add Content-Security-Policy directives in \`SecurityConfig.java\`:
\`\`\`java
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
\`\`\``
  },
  {
    title: '[Security B3] Restrict Permissive permitAll() Endpoints & Enforce Hospital Tenant Scoping',
    labels: ['security', 'medium', 'backend', 'rbac', 'idor'],
    body: `### 🟠 Severity: MEDIUM
**CWE**: CWE-639 (Authorization Bypass Through User-Controlled Key)

#### Problem Description
The endpoints \`/api/dashboard/**\`, \`/api/hospitals/**\`, \`/api/routing/optimal\`, and \`/api/patients/score-vitals\` are marked \`permitAll()\`. 
Unauthenticated access to internal hospital telemetry, real-time bed capacity, and patient vitals evaluation creates operational and privacy risks. Furthermore, hospital-scoped authorization is needed to prevent IDOR across facilities.

#### Affected Files
- \`backend/src/main/java/com/triagenet/config/SecurityConfig.java\`
- \`HospitalController.java\`, \`DashboardController.java\`, \`RoutingController.java\`

#### Proposed Remediation
1. Audit public vs. authenticated requirements; require JWT authentication for internal metrics.
2. Annotate controller methods with \`@PreAuthorize("hasAnyRole(...)")\`.
3. Verify \`HospitalAuthorizationService\` scopes access to the caller's assigned hospital or district.`
  },
  {
    title: '[Security B4] Cleanse Hardcoded Dev Secret from application-local.yml.example',
    labels: ['security', 'low', 'config', 'good first issue'],
    body: `### 🟡 Severity: LOW
**CWE**: CWE-522 (Insufficiently Protected Credentials)

#### Problem Description
The committed template file \`backend/src/main/resources/application-local.yml.example\` contains the legacy 64-character hex secret string. Developers copying this template without generating a new secret may unintentionally deploy with default credentials.

#### Affected Files
- \`backend/src/main/resources/application-local.yml.example\`

#### Proposed Remediation
Replace the hex string with an instruction placeholder:
\`\`\`yaml
jwt:
  # Generate with: openssl rand -hex 32
  secret: CHANGE_ME_GENERATE_WITH_OPENSSL_RAND_HEX_32
\`\`\``
  },
  {
    title: '[Security B5] Dynamic Runtime CSPRNG Secret in Test Profile Isolation',
    labels: ['security', 'low', 'testing'],
    body: `### 🟡 Severity: LOW
**CWE**: CWE-330 (Use of Insufficiently Random Values)

#### Problem Description
\`backend/src/test/resources/application-test.yml\` uses a static CSPRNG-generated secret. While acceptable for automated testing isolation, dynamic runtime secret generation via \`@DynamicPropertySource\` provides cleaner security hygiene.

#### Affected Files
- \`backend/src/test/resources/application-test.yml\`

#### Proposed Remediation
Document test-profile isolation or dynamically inject an ephemeral CSPRNG secret during test suite bootstrap.`
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
