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

Use Node.js 22.22.2 or newer within the Node 22 line, Node.js 24.15.0 or newer
within the Node 24 line, or Node.js 26+. Node 23 and Node 25 are not supported
by the development quality-gate toolchain. Before opening a PR, run locally:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run lint          # ESLint
npm run biome         # Biome
npm run typecheck     # tsc --noEmit
npm test              # Vitest
npm run format:check  # Prettier over every supported tracked surface
npm run format:public:check
npx --no-install wrangler deploy --dry-run --strict
```

All commands must pass. CI runs the same repository-local tools on pull requests
to `main`, including retargeted PRs, without a workspace configuration or custom
governance scripts. The dry run validates the Worker bundle without deployment
or database writes. Native Dependency Review, Zizmor, Scorecard and CodeQL
Default Setup remain separate from formatting and product tests.

Dependabot uses GitHub native auto-merge after applicable required checks; do not
add mandatory human or AI reviews, merge queue, custom controllers or extra
repository settings without the operator's approval. Use independent review
where complexity warrants it, and distinguish local checks from remote CI and
post-deployment evidence.

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

Read [INBOUND.md](./INBOUND.md) before submitting copyrightable material. Opening
an issue or PR does not transfer copyright; contributor-owned material requires
the separately executed written rights described there before merge. The project
remains [AGPL-3.0-or-later](./LICENSE). AGPL §13 applies to network-service
operators of modified forks; see [README.md → AGPL §13 source-offer](./README.md#agpl-13-source-offer-operators-of-public-deployments).

---

## Code of Conduct

By participating, you agree to follow the [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) (Contributor Covenant 3.0). General contribution and support requests go to `chamados@lcv.dev`; report conduct violations privately to `conductcode@lcv.dev`.

---

## Maintainer

Single maintainer: [@example-beneficiary](https://github.com/example-beneficiary). Response time is best-effort.
