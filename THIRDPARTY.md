# Third-Party Components

`mtasts-motor` is a Cloudflare Worker with **zero runtime dependencies**. The lockfile entries (318 packages) are transitive devDependencies of the development toolchain only — they do NOT ship in the deployed Worker bundle.

## License inventory (lockfile, 318 packages — devDeps transitive only)

| License                                  | Count |
| ---------------------------------------- | ----- |
| MIT                                      | 221   |
| Apache-2.0                               | 34    |
| MIT OR Apache-2.0                        | 13    |
| MPL-2.0                                  | 12    |
| LGPL-3.0-or-later                        | 10    |
| ISC                                      | 9     |
| BSD-2-Clause                             | 7     |
| Apache-2.0 AND LGPL-3.0-or-later         | 3     |
| BSD-3-Clause                             | 3     |
| (BSD-2-Clause OR MIT OR Apache-2.0)      | 1     |
| 0BSD                                     | 1     |
| Apache-2.0 AND LGPL-3.0-or-later AND MIT | 1     |
| BlueOak-1.0.0                            | 1     |
| CC0-1.0                                  | 1     |
| Python-2.0                               | 1     |

All licenses are permissive or copyleft-compatible with this project's AGPL-3.0-or-later license. LGPL/MPL packages are tooling (not runtime); their compatibility constraints don't apply since none are bundled into the Worker.

## Direct dependencies (devDependencies only)

| Package                   | Version       | License           | Origin                                               |
| ------------------------- | ------------- | ----------------- | ---------------------------------------------------- |
| @biomejs/biome            | ^2.5.9        | MIT OR Apache-2.0 | https://registry.npmjs.org/@biomejs/biome            |
| @cloudflare/workers-types | ^5.20260818.1 | MIT OR Apache-2.0 | https://registry.npmjs.org/@cloudflare/workers-types |
| @eslint/js                | ^10.0.1       | MIT               | https://registry.npmjs.org/@eslint/js                |
| eslint                    | ^10.8.1       | MIT               | https://registry.npmjs.org/eslint                    |
| eslint-config-prettier    | ^10.1.8       | MIT               | https://registry.npmjs.org/eslint-config-prettier    |
| globals                   | ^17.11.0      | MIT               | https://registry.npmjs.org/globals                   |
| markdownlint-cli          | ^0.49.1       | MIT               | https://registry.npmjs.org/markdownlint-cli          |
| prettier                  | ^3.9.6        | MIT               | https://registry.npmjs.org/prettier                  |
| typescript                | ^6.0.3        | Apache-2.0        | https://registry.npmjs.org/typescript                |
| typescript-eslint         | ^8.67.0       | MIT               | https://registry.npmjs.org/typescript-eslint         |
| vitest                    | ^4.1.11       | MIT               | https://registry.npmjs.org/vitest                    |
| wrangler                  | ^4.124.0      | MIT OR Apache-2.0 | https://registry.npmjs.org/wrangler                  |
| yaml                      | ^2.9.0        | ISC               | https://registry.npmjs.org/yaml                      |

For an exhaustive package-by-package inventory, run:

```bash
npm ls --all
# or
npx license-checker --json
```

`package-lock.json` in the repo root is the authoritative source for all transitive dependencies and their resolved versions.
