# Third-Party Components

`mtasts-motor` is a Cloudflare Worker with **zero runtime dependencies**. The lockfile entries (192 packages) are transitive devDependencies of the development toolchain only — they do NOT ship in the deployed Worker bundle.

## License inventory (lockfile, 192 packages — devDeps transitive only)

| License | Count |
|---------|-------|
| MIT | 105 |
| Apache-2.0 | 42 |
| MIT OR Apache-2.0 | 13 |
| MPL-2.0 | 12 |
| LGPL-3.0-or-later | 10 |
| Apache-2.0 AND LGPL-3.0-or-later | 3 |
| ISC | 3 |
| Apache-2.0 AND LGPL-3.0-or-later AND MIT | 1 |
| CC0-1.0 | 1 |
| BSD-3-Clause | 1 |
| 0BSD | 1 |

All licenses are permissive or copyleft-compatible with this project's AGPL-3.0-or-later license. LGPL/MPL packages are tooling (not runtime); their compatibility constraints don't apply since none are bundled into the Worker.

## Direct dependencies (devDependencies only)

| Package | Version | License | Origin |
|---------|---------|---------|--------|
| @biomejs/biome | ^2.5.8 | MIT OR Apache-2.0 | https://registry.npmjs.org/@biomejs/biome |
| @cloudflare/workers-types | ^5.20260812.1 | MIT OR Apache-2.0 | https://registry.npmjs.org/@cloudflare/workers-types |
| prettier | ^3.9.6 | MIT | https://registry.npmjs.org/prettier |
| typescript | ^7.0.2 | Apache-2.0 | https://registry.npmjs.org/typescript |
| vitest | ^4.1.10 | MIT | https://registry.npmjs.org/vitest |
| wrangler | ^4.121.0 | MIT OR Apache-2.0 | https://registry.npmjs.org/wrangler |

For an exhaustive package-by-package inventory, run:

```bash
npm ls --all
# or
npx license-checker --json
```

`package-lock.json` in the repo root is the authoritative source for all transitive dependencies and their resolved versions.
