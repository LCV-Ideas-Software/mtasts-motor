# Third-Party Components

`mtasts-motor` is a Cloudflare Worker with **zero runtime dependencies**. The lockfile entries (251 packages) are transitive devDependencies of the development toolchain only — they do NOT ship in the deployed Worker bundle.

## License inventory (lockfile, 251 packages — devDeps transitive only)

| License                                  | Count |
| ---------------------------------------- | ----- |
| MIT                                      | 160   |
| Apache-2.0                               | 34    |
| MIT OR Apache-2.0                        | 13    |
| MPL-2.0                                  | 12    |
| LGPL-3.0-or-later                        | 10    |
| ISC                                      | 7     |
| BSD-2-Clause                             | 6     |
| Apache-2.0 AND LGPL-3.0-or-later         | 3     |
| BSD-3-Clause                             | 2     |
| 0BSD                                     | 1     |
| Apache-2.0 AND LGPL-3.0-or-later AND MIT | 1     |
| BlueOak-1.0.0                            | 1     |
| CC0-1.0                                  | 1     |

These labels reflect npm lockfile metadata, not a blanket legal compatibility
determination. LGPL/MPL packages are development tooling, not Worker runtime
components. Redistributing any tooling requires observing that component's own
license terms. The deployed Worker contains only this project's source.

## Direct dependencies (devDependencies only)

| Package                   | Version       | License           | Origin                                               |
| ------------------------- | ------------- | ----------------- | ---------------------------------------------------- |
| @biomejs/biome            | ^2.5.11       | MIT OR Apache-2.0 | https://registry.npmjs.org/@biomejs/biome            |
| @cloudflare/workers-types | ^5.20260902.1 | MIT OR Apache-2.0 | https://registry.npmjs.org/@cloudflare/workers-types |
| @eslint/js                | ^10.0.1       | MIT               | https://registry.npmjs.org/@eslint/js                |
| eslint                    | ^10.9.1       | MIT               | https://registry.npmjs.org/eslint                    |
| eslint-config-prettier    | ^10.1.8       | MIT               | https://registry.npmjs.org/eslint-config-prettier    |
| globals                   | ^17.12.0      | MIT               | https://registry.npmjs.org/globals                   |
| prettier                  | ^3.9.6        | MIT               | https://registry.npmjs.org/prettier                  |
| typescript                | ^6.0.3        | Apache-2.0        | https://registry.npmjs.org/typescript                |
| typescript-eslint         | ^8.69.0       | MIT               | https://registry.npmjs.org/typescript-eslint         |
| vitest                    | ^4.1.11       | MIT               | https://registry.npmjs.org/vitest                    |
| wrangler                  | ^4.128.0      | MIT OR Apache-2.0 | https://registry.npmjs.org/wrangler                  |

For an exhaustive package-by-package inventory, run:

```bash
npm ls --all
# or export the dependency metadata with npm's built-in SBOM command
npm sbom --sbom-format cyclonedx
```

`package-lock.json` in the repo root is the authoritative source for all transitive dependencies and their resolved versions.

This is a maintained snapshot, updated on 10/09/2026 after the development-only
Workers types, globals and Wrangler updates; all 251 package/license counts remain unchanged. Native Dependency
Review and npm SBOM metadata do not replace license texts or automatically update
this document. Review the snapshot when the tooling or distribution changes.
