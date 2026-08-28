import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const workflowsDirectory = path.join(repositoryRoot, ".github", "workflows");

function read(relativePath) {
  return readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function occurrences(text, fragment) {
  return text.split(fragment).length - 1;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parsedWorkflow(workflow) {
  const document = parseDocument(workflow, {
    logLevel: "error",
    strict: true,
    uniqueKeys: true,
    version: "1.2",
  });
  const errors = document.errors.map((error) => error.message).join("; ");

  assert.equal(
    document.errors.length,
    0,
    `workflow must be valid YAML${errors === "" ? "" : `: ${errors}`}`,
  );

  const value = document.toJS({ maxAliasCount: 100 });
  assert.ok(isRecord(value), "workflow must parse to a mapping");
  assert.ok(isRecord(value.jobs), "workflow must contain one jobs mapping");
  return value;
}

function workflowJob(workflow, jobId) {
  const parsed = parsedWorkflow(workflow);
  assert.ok(
    Object.hasOwn(parsed.jobs, jobId),
    `workflow must contain exactly one ${jobId} job`,
  );

  const job = parsed.jobs[jobId];
  assert.ok(isRecord(job), `${jobId} job must be a mapping`);
  assert.ok(
    Array.isArray(job.steps),
    `${jobId} job must contain a steps array`,
  );
  for (const step of job.steps) {
    assert.ok(isRecord(step), `${jobId} job steps must be mappings`);
  }

  return { job, parsed, steps: job.steps };
}

function assertSafeSequentialStep(step, label) {
  assert.equal(
    Object.hasOwn(step, "if"),
    false,
    `${label} must be unconditional`,
  );
  assert.ok(
    step["continue-on-error"] === undefined ||
      step["continue-on-error"] === false,
    `${label} must fail closed`,
  );
  assert.ok(
    step.background === undefined || step.background === false,
    `${label} must finish before the next step`,
  );
}

function assertStepOrderWithinJob(workflow, jobId, installCommand, actionUse) {
  const { job, parsed, steps } = workflowJob(workflow, jobId);
  const installSteps = steps.flatMap((step, index) =>
    typeof step.run === "string" && step.run.trim() === installCommand
      ? [{ index, step }]
      : [],
  );
  const actionSteps = steps.flatMap((step, index) =>
    step.uses === actionUse ? [{ index, step }] : [],
  );

  assert.equal(
    installSteps.length,
    1,
    `${jobId} job must contain exactly one run step for ${installCommand}`,
  );
  assert.equal(
    actionSteps.length,
    1,
    `${jobId} job must contain exactly one uses step for ${actionUse}`,
  );

  const install = installSteps[0];
  const action = actionSteps[0];
  assertSafeSequentialStep(install.step, "install step");
  assertSafeSequentialStep(action.step, "deployment action step");
  assert.equal(
    Object.hasOwn(install.step, "working-directory"),
    false,
    "install step must run at the repository root",
  );
  assert.equal(
    Object.hasOwn(job.defaults?.run ?? {}, "working-directory"),
    false,
    "deploy job must not override the install working directory",
  );
  assert.equal(
    Object.hasOwn(parsed.defaults?.run ?? {}, "working-directory"),
    false,
    "workflow must not override the install working directory",
  );
  assert.ok(
    install.index < action.index,
    `${installCommand} must precede ${actionUse} in the ${jobId} job`,
  );

  return steps;
}

function licenseInventory(lockfile) {
  const counts = new Map();

  for (const [packagePath, metadata] of Object.entries(lockfile.packages)) {
    if (packagePath === "") {
      continue;
    }

    assert.equal(
      typeof metadata.license,
      "string",
      `${packagePath} must declare a license in package-lock.json`,
    );
    counts.set(metadata.license, (counts.get(metadata.license) ?? 0) + 1);
  }

  return counts;
}

function documentedLicenseInventory(document) {
  const section = document.match(
    /## License inventory[^\n]*\n([\s\S]*?)\nAll licenses/u,
  );
  assert.ok(section, "THIRDPARTY.md must contain a license inventory table");

  const rows = [
    ...section[1].matchAll(/^\|\s*(.+?)\s*\|\s*(\d+)\s*\|\s*$/gmu),
  ].map(([, license, count]) => [license, Number(count)]);
  const inventory = new Map(rows);

  assert.equal(
    inventory.size,
    rows.length,
    "THIRDPARTY.md license inventory must not contain duplicate license rows",
  );

  return inventory;
}

function documentedDirectDependencies(document) {
  const section = document.match(
    /## Direct dependencies[^\n]*\n([\s\S]*?)\nFor an exhaustive/u,
  );
  assert.ok(section, "THIRDPARTY.md must contain a direct dependencies table");

  const rows = [
    ...section[1].matchAll(
      /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/gmu,
    ),
  ]
    .map(([, packageName, version]) => [packageName.trim(), version.trim()])
    .filter(
      ([packageName]) =>
        packageName !== "Package" && !/^[-: ]+$/u.test(packageName),
    );
  const dependencies = new Map(rows);

  assert.equal(
    dependencies.size,
    rows.length,
    "THIRDPARTY.md direct dependencies must not contain duplicate packages",
  );

  return dependencies;
}

function duplicateFirstLicenseRow(document) {
  const section = document.match(
    /## License inventory[^\n]*\n([\s\S]*?)\nAll licenses/u,
  );
  assert.ok(section, "THIRDPARTY.md must contain a license inventory table");
  const row = section[1].match(/^\|\s*.+?\s*\|\s*\d+\s*\|\s*$/mu)?.[0];
  assert.ok(row, "THIRDPARTY.md license inventory must contain a data row");

  const duplicated = document.replace(row, `${row}\n${row}`);
  assert.notEqual(
    duplicated,
    document,
    "the duplicate-row fixture must mutate the current inventory",
  );
  return duplicated;
}

const linearRelease = read(".github/workflows/linear-release.yml");
const deploy = read(".github/workflows/deploy.yml");
const actionsLock = read(".github/workflows/actions.lock");
const thirdParty = read("THIRDPARTY.md");
const packageJson = JSON.parse(read("package.json"));
const packageLock = JSON.parse(read("package-lock.json"));
const installedWrangler = JSON.parse(
  read("node_modules/wrangler/package.json"),
);
const allWorkflows = readdirSync(workflowsDirectory)
  .filter((file) => /\.ya?ml$/u.test(file))
  .map((file) => read(path.join(".github", "workflows", file)))
  .join("\n");

test("Linear Release remains tied to the successfully deployed main SHA", () => {
  assert.match(linearRelease, /workflow_run:/u);
  assert.match(linearRelease, /workflows:\s*\n\s*- Deploy/u);
  assert.match(linearRelease, /types:\s*\n\s*- completed/u);
  assert.match(
    linearRelease,
    /github\.event\.workflow_run\.conclusion == 'success'/u,
  );
  assert.match(
    linearRelease,
    /github\.event\.workflow_run\.head_branch == 'main'/u,
  );
  assert.match(
    linearRelease,
    /group: linear-release-\$\{\{ github\.event\.workflow_run\.head_branch \}\}-\$\{\{ github\.event\.workflow_run\.conclusion \}\}/u,
  );
  assert.match(linearRelease, /queue: max/u);
  assert.doesNotMatch(linearRelease, /cancel-in-progress:/u);
  assert.match(linearRelease, /environment: linear-release/u);
  assert.match(linearRelease, /permissions:\s*\n\s*contents: read/u);
  assert.match(
    linearRelease,
    /ref: \$\{\{ github\.event\.workflow_run\.head_sha \}\}/u,
  );
  assert.match(linearRelease, /fetch-depth: 0/u);
  assert.match(linearRelease, /persist-credentials: false/u);
  assert.doesNotMatch(linearRelease, /continue-on-error:/u);
});

test("Linear Release uses the pinned official action and lock entry", () => {
  const officialUse =
    "linear/linear-release-action@0a25abab892a91062ebf42260dbb2ce6277aa205";

  assert.equal(occurrences(linearRelease, officialUse), 1);
  assert.match(
    linearRelease,
    /access_key: \$\{\{ secrets\.LINEAR_ACCESS_KEY \}\}/u,
  );
  assert.match(linearRelease, /cli_version: v0\.16\.0/u);
  assert.doesNotMatch(
    linearRelease,
    /CLI_URL|CLI_SHA256|linear-release-linux|curl\s+-/u,
  );
  assert.equal(occurrences(actionsLock, officialUse), 2);
  assert.match(
    actionsLock,
    /'linear\/linear-release-action@0a25abab892a91062ebf42260dbb2ce6277aa205':[\s\S]*?ref: 'v0\.16\.0'/u,
  );
});

test("THIRDPARTY license totals match the authoritative lockfile", () => {
  const expectedInventory = licenseInventory(packageLock);
  const documentedInventory = documentedLicenseInventory(thirdParty);
  const packageCount = [...expectedInventory.values()].reduce(
    (total, count) => total + count,
    0,
  );

  assert.match(
    thirdParty,
    new RegExp(`lockfile entries \\(${packageCount} packages\\)`, "u"),
  );
  assert.match(
    thirdParty,
    new RegExp(`License inventory \\(lockfile, ${packageCount} packages`, "u"),
  );
  assert.deepEqual(documentedInventory, expectedInventory);
});

test("THIRDPARTY direct versions match package.json", () => {
  const documentedDependencies = documentedDirectDependencies(thirdParty);
  const expectedDependencies = new Map(
    Object.entries(packageJson.devDependencies),
  );

  assert.deepEqual(documentedDependencies, expectedDependencies);
});

test("THIRDPARTY rejects duplicate license rows", () => {
  const duplicatedInventory = duplicateFirstLicenseRow(thirdParty);

  assert.throws(
    () => documentedLicenseInventory(duplicatedInventory),
    /duplicate license rows/u,
  );
});

test("the duplicate-row regression fixture follows the live inventory", () => {
  const currentMitRow = thirdParty.match(
    /^(\|\s*MIT\s*\|\s*)(\d+)(\s*\|\s*)$/mu,
  );
  assert.ok(currentMitRow, "the live inventory must contain an MIT row");
  const changedInventory = thirdParty.replace(
    currentMitRow[0],
    `${currentMitRow[1]}${Number(currentMitRow[2]) + 1}${currentMitRow[3]}`,
  );
  const duplicatedInventory = duplicateFirstLicenseRow(changedInventory);

  assert.notEqual(
    changedInventory,
    thirdParty,
    "the mutation must first change the authoritative fixture",
  );
  assert.throws(
    () => documentedLicenseInventory(duplicatedInventory),
    /duplicate license rows/u,
  );
});

test("Deploy keeps the official Wrangler action and lockfile-selected CLI", () => {
  const officialUse =
    "cloudflare/wrangler-action@ebbaa1584979971c8614a24965b4405ff95890e0";
  const installCommand = "npm ci --ignore-scripts --no-audit --no-fund";
  const deploySteps = assertStepOrderWithinJob(
    deploy,
    "deploy",
    installCommand,
    officialUse,
  );
  const wranglerRange = packageJson.devDependencies.wrangler;
  const lockRootRange = packageLock.packages[""].devDependencies.wrangler;
  const lockedWrangler = packageLock.packages["node_modules/wrangler"];

  assert.equal(occurrences(deploy, officialUse), 1);
  assert.equal(
    deploySteps.filter((step) => step.uses === officialUse).length,
    1,
  );
  assert.match(deploy, /apiToken: \$\{\{ secrets\.CLOUDFLARE_API_TOKEN \}\}/u);
  assert.match(
    deploy,
    /accountId: \$\{\{ secrets\.CLOUDFLARE_ACCOUNT_ID \}\}/u,
  );
  assert.match(deploy, /packageManager: npm/u);
  assert.match(deploy, /command: deploy --strict/u);
  assert.doesNotMatch(deploy, /wranglerVersion:/u);
  assert.match(wranglerRange, /^\^4\.\d+\.\d+$/u);
  assert.equal(lockRootRange, wranglerRange);
  assert.match(lockedWrangler.version, /^4\.\d+\.\d+$/u);
  assert.equal(installedWrangler.version, lockedWrangler.version);
  assert.equal(lockedWrangler.dev, true);
  assert.match(lockedWrangler.integrity, /^sha512-/u);
  assert.equal(occurrences(actionsLock, officialUse), 2);
});

test("the local Wrangler installation cannot come from a different job", () => {
  const officialUse =
    "cloudflare/wrangler-action@ebbaa1584979971c8614a24965b4405ff95890e0";
  const splitRunnerWorkflow = `jobs:
  prepare:
    steps:
      - run: npm ci --ignore-scripts --no-audit --no-fund
  deploy:
    steps:
      - uses: ${officialUse}
`;

  assert.throws(
    () =>
      assertStepOrderWithinJob(
        splitRunnerWorkflow,
        "deploy",
        "npm ci --ignore-scripts --no-audit --no-fund",
        officialUse,
      ),
    /deploy job must contain exactly one run step for npm ci/u,
  );
});

test("comments, names, and unrelated block scalars are not executable install steps", () => {
  const officialUse =
    "cloudflare/wrangler-action@ebbaa1584979971c8614a24965b4405ff95890e0";
  const installCommand = "npm ci --ignore-scripts --no-audit --no-fund";
  const misleadingWorkflows = [
    `jobs:
  deploy:
    steps:
      # run: ${installCommand}
      - run: echo comment-only
      - uses: ${officialUse}
`,
    `jobs:
  deploy:
    steps:
      - name: "run: ${installCommand}"
        run: echo name-only
      - uses: ${officialUse}
`,
    `jobs:
  deploy:
    steps:
      - run: |
          echo "run: ${installCommand}"
      - uses: ${officialUse}
`,
  ];

  for (const workflow of misleadingWorkflows) {
    assert.throws(
      () =>
        assertStepOrderWithinJob(
          workflow,
          "deploy",
          installCommand,
          officialUse,
        ),
      /deploy job must contain exactly one run step for npm ci/u,
    );
  }
});

test("the install step must be unconditional, blocking, and rooted", () => {
  const officialUse =
    "cloudflare/wrangler-action@ebbaa1584979971c8614a24965b4405ff95890e0";
  const installCommand = "npm ci --ignore-scripts --no-audit --no-fund";
  const unsafeProperties = [
    "if: false",
    "continue-on-error: true",
    "background: true",
    "working-directory: nested",
  ];

  for (const property of unsafeProperties) {
    const workflow = `jobs:
  deploy:
    steps:
      - run: ${installCommand}
        ${property}
      - uses: ${officialUse}
`;

    assert.throws(
      () =>
        assertStepOrderWithinJob(
          workflow,
          "deploy",
          installCommand,
          officialUse,
        ),
      /install step/u,
    );
  }
});

test("the local Wrangler installation must precede the action", () => {
  const officialUse =
    "cloudflare/wrangler-action@ebbaa1584979971c8614a24965b4405ff95890e0";
  const reversedStepsWorkflow = `jobs:
  deploy:
    steps:
      - uses: ${officialUse}
      - run: npm ci --ignore-scripts --no-audit --no-fund
`;

  assert.throws(
    () =>
      assertStepOrderWithinJob(
        reversedStepsWorkflow,
        "deploy",
        "npm ci --ignore-scripts --no-audit --no-fund",
        officialUse,
      ),
    /npm ci .* must precede .*wrangler-action.* in the deploy job/u,
  );
});

test("the deploy job must exist exactly once", () => {
  assert.throws(
    () => workflowJob("jobs:\n  prepare:\n    steps: []\n", "deploy"),
    /exactly one deploy job/u,
  );
  assert.throws(
    () =>
      workflowJob(
        "jobs:\n  deploy:\n    steps: []\n  deploy:\n    steps: []\n",
        "deploy",
      ),
    /valid YAML/u,
  );
});

test("No direct Slack workflow is invented for this repository", () => {
  assert.doesNotMatch(allWorkflows, /slackapi\/slack-github-action@/u);
  assert.doesNotMatch(allWorkflows, /hooks\.slack\.com|chat\.postMessage/u);
});
