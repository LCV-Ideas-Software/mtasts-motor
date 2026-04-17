# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this repository, please do **not** open a public issue. Instead, please report it privately to the repository maintainer.

**Contact:** alert@lcvmail.com

Please include:
- Description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact
- Suggested fix (if you have one)

We will acknowledge your report within 24 hours and work to resolve the issue promptly.

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | ✅ |
| Previous releases | ⚠️ Security updates only |

## Security Measures

This repository currently relies on:
- **Dependency Scanning (Dependabot)**: Automated dependency update proposals
- **CI quality gates**: `npm audit`, lint, typecheck, tests, and deploy validation in GitHub Actions
- **Manual review**: Security-sensitive changes should be reviewed before promotion to production

Controls such as **CodeQL**, **secret scanning**, and **branch protection** depend on the GitHub plan and repository settings in effect for the private repository and should not be assumed enabled unless verified in the platform settings.

## Best Practices

- Keep dependencies up-to-date
- Use strong authentication (SSH keys, personal access tokens)
- Review pull requests carefully before merge
- Report any suspicious activity immediately
