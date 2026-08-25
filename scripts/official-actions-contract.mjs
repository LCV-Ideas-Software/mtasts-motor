import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

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

function workflowJob(workflow, jobId) {
  const lines = workflow.split(/\r?\n/u);
  const jobsIndexes = lines.flatMap((line, index) =>
    /^jobs:\s*(?:#.*)?$/u.test(line) ? [index] : [],
  );

  assert.equal(
    jobsIndexes.length,
    1,
    "workflow must contain exactly one top-level jobs mapping",
  );

  const jobsIndex = jobsIndexes[0];
  let jobIndent = null;
  const jobStarts = [];

  for (let index = jobsIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }

    const indent = line.length - line.trimStart().length;
    if (indent === 0) {
      break;
    }

    jobIndent ??= indent;
    if (indent === jobIndent && trimmed === `${jobId}:`) {
      jobStarts.push(index);
    }
  }

  assert.equal(
    jobStarts.length,
    1,
    `workflow must contain exactly one ${jobId} job`,
  );

  const jobStart = jobStarts[0];
  let jobEnd = lines.length;
  for (let index = jobStart + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }

    const indent = line.length - line.trimStart().length;
    if (indent <= jobIndent) {
      jobEnd = index;
      break;
    }
  }

  return lines.slice(jobStart, jobEnd).join("\n");
}

function assertStepOrderWithinJob(workflow, jobId, firstStep, secondStep) {
  const job = workflowJob(workflow, jobId);
  const firstStepIndex = job.indexOf(firstStep);
  const secondStepIndex = job.indexOf(secondStep);

  assert.ok(firstStepIndex >= 0, `${jobId} job must contain ${firstStep}`);
  assert.ok(secondStepIndex >= 0, `${jobId} job must contain ${secondStep}`);
  assert.ok(
    firstStepIndex < secondStepIndex,
    `${firstStep} must precede ${secondStep} in the ${jobId} job`,
  );

  return job;
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

test("THIRDPARTY rejects duplicate license rows", () => {
  const mitRow = "| MIT                                      | 221   |";
  const duplicatedInventory = thirdParty.replace(
    mitRow,
    `${mitRow}\n${mitRow}`,
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
  const deployJob = assertStepOrderWithinJob(
    deploy,
    "deploy",
    `run: ${installCommand}`,
    `uses: ${officialUse}`,
  );
  const wranglerRange = packageJson.devDependencies.wrangler;
  const lockRootRange = packageLock.packages[""].devDependencies.wrangler;
  const lockedWrangler = packageLock.packages["node_modules/wrangler"];

  assert.equal(occurrences(deploy, officialUse), 1);
  assert.equal(occurrences(deployJob, officialUse), 1);
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
        "run: npm ci --ignore-scripts --no-audit --no-fund",
        `uses: ${officialUse}`,
      ),
    /deploy job must contain run: npm ci/u,
  );
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
        "run: npm ci --ignore-scripts --no-audit --no-fund",
        `uses: ${officialUse}`,
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
    /exactly one deploy job/u,
  );
});

test("No direct Slack workflow is invented for this repository", () => {
  assert.doesNotMatch(allWorkflows, /slackapi\/slack-github-action@/u);
  assert.doesNotMatch(allWorkflows, /hooks\.slack\.com|chat\.postMessage/u);
});
