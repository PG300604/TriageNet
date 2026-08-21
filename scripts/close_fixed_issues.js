/**
 * scripts/close_fixed_issues.js
 * Automatically closes fixed GitHub issues via REST API
 *
 * Usage:
 *   node scripts/close_fixed_issues.js [GITHUB_TOKEN]
 */

const https = require('https');

const REPO_OWNER = 'PG300604';
const REPO_NAME = 'TriageNet';
const TOKEN = process.argv[2] || process.env.GITHUB_TOKEN;

const FIXED_ISSUES = [
  {
    number: 15,
    reason: 'Resolved in commit 959f4d1: Purged hardcoded JWT secret fallbacks from JwtUtil.java, application.yml, and docker-compose.yml.',
  },
  {
    number: 17,
    reason: 'Resolved in commit 959f4d1: Completed pure HttpOnly cookie migration and removed all localStorage JWT token access in frontend.',
  },
  {
    number: 18,
    reason: 'Resolved in PR #20 (commit fef1986): Added password complexity pattern validation with uppercase, lowercase, digit, and special character checks.',
  },
  {
    number: 19,
    reason: 'Resolved in PR #22 (commit 15436e7): Untracked application-local.yml from version control and added application-local.yml.example template.',
  },
];

if (!TOKEN) {
  console.log('\nTo close these issues automatically via API, pass your GitHub token:');
  console.log('  node scripts/close_fixed_issues.js <YOUR_GITHUB_TOKEN>\n');
  console.log('Direct Web URLs to close on GitHub manually:');
  FIXED_ISSUES.forEach(issue => {
    console.log(`- Issue #${issue.number}: https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/${issue.number}`);
  });
  process.exit(0);
}

let idx = 0;
function closeNext() {
  if (idx >= FIXED_ISSUES.length) {
    console.log('\n✅ All fixed issues have been closed on GitHub!');
    return;
  }

  const issue = FIXED_ISSUES[idx];
  const postData = JSON.stringify({
    state: 'closed',
    state_reason: 'completed',
  });

  const options = {
    hostname: 'api.github.com',
    path: `/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issue.number}`,
    method: 'PATCH',
    headers: {
      'User-Agent': 'TriageNet-Issue-Closer',
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`[${idx + 1}/${FIXED_ISSUES.length}] Closed Issue #${issue.number} successfully.`);
      } else {
        console.error(`[${idx + 1}/${FIXED_ISSUES.length}] Failed to close Issue #${issue.number}: HTTP ${res.statusCode}`);
      }
      idx++;
      setTimeout(closeNext, 1000);
    });
  });

  req.on('error', err => {
    console.error(`Error: ${err.message}`);
    idx++;
    setTimeout(closeNext, 1000);
  });

  req.write(postData);
  req.end();
}

closeNext();
