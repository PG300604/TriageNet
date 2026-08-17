# Security Policy — TriageNet

## Supported Versions

The following versions of TriageNet are actively supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x (Phase 7+) | :white_check_mark: |
| < 1.0.0 | :x:                |

---

## Reporting a Vulnerability

The TriageNet team takes security vulnerabilities seriously. If you discover a security vulnerability within TriageNet, please follow these guidelines:

1. **Do not create a public issue immediately** for active zero-day exploits or sensitive credentials.
2. Email the maintainer directly at: **[priyanshu@triagenet.dev](mailto:priyanshu@triagenet.dev)** with the subject line `[SECURITY] TriageNet Vulnerability Report`.
3. Include detailed steps to reproduce the vulnerability, proof-of-concept payloads, and affected endpoints.
4. Maintainers will acknowledge your report within **48 hours** and provide an estimated remediation timeline.

---

## Open Source Security Contribution Guidelines

We welcome community pull requests addressing known defense-in-depth issues, dependency upgrades, and security hardening tasks labeled with:
- `security`
- `good first issue`
- `help wanted`

Please ensure all PRs include corresponding unit/integration test coverage in `backend/src/test/` or `frontend/` before requesting review.
