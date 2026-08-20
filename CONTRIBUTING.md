# Contributing to mtasts-motor

Thanks for your interest. Quick guide for filing issues and opening pull requests.

---

## Before you start

1. **Read the [README](./README.md)** — it covers what the Worker does, the architecture, and how to deploy your own fork.
2. **Read [SECURITY.md](./SECURITY.md)** — for security reports, do NOT open a public issue.
3. **Check existing issues** before opening a new one.

---

## Filing issues

- **Bug reports**: include the request URL, the response, the expected behavior, and (if possible) the corresponding D1 row in the `mtasts_mta_sts_policies` table that should have served the policy.
- **Feature requests**: explain the use case and why it doesn't fit a downstream fork.
- **Documentation gaps**: open an issue or a PR directly.

---

## Opening a pull request

### Local gates

Use Node.js 22.13.0 or newer. Before opening a PR, run locally:

```bash
npm ci
npm run lint          # ESLint
npm run biome         # Biome
npm run typecheck     # tsc --noEmit
npm test              # Vitest
npm run format:check  # Prettier over every supported tracked surface
npm run markdownlint  # markdownlint-cli with the central workspace policy
```

All commands must be GREEN. The portable gates run again in CI. `npm run markdownlint`
finds the central `.markdownlint.jsonc` by walking up from above the checkout and fails
closed if the policy is unavailable. Repository-local policy files are ignored, and
`LCV_MARKDOWNLINT_CONFIG` is rejected when it points inside the checkout.

The five-gate quality directive is ESLint + Biome + Prettier + markdownlint-cli + a
completed Cross Review on the exact final SHA. Cross Review remains a maintainer process
gate and must complete before the merge queue; it is never treated as a post-merge approval.

### PR description

Include:

- What changed and why (one short paragraph).
- How you tested it (command output OK).
- Whether the change touches the public response shape (currently `text/plain` policy text on `GET /.well-known/mta-sts.txt`). Public surface changes need careful review.

### Action pinning

This repo enforces SHA-pinned GitHub Actions per supply-chain hardening baseline. Do NOT downgrade pinned actions to floating tags. Dependabot opens version-bump PRs with new SHAs + tag comments — accept those instead of editing manually.

### Sign-off

The repo enforces `web_commit_signoff_required` for browser-edited commits. For local commits via `git commit`, no DCO sign-off is required (the requirement is web-only).

---

## License

By contributing, you agree your contribution is licensed under [AGPL-3.0-or-later](./LICENSE) — same as the rest of the project. AGPL §13 applies to network-service operators of forks; see [README.md → AGPL §13 source-offer](./README.md#agpl-13-source-offer-operators-of-public-deployments).

---

## Code of Conduct

By participating, you agree to follow the [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) (Contributor Covenant 3.0). Violations to `lcv@lcv.dev`.

---

## Maintainer

Single maintainer: [@example-beneficiary](https://github.com/example-beneficiary). Response time is best-effort.
