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

const linearRelease = read(".github/workflows/linear-release.yml");
const deploy = read(".github/workflows/deploy.yml");
const actionsLock = read(".github/workflows/actions.lock");
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

test("Deploy keeps the official Wrangler action and lockfile-selected CLI", () => {
  const officialUse =
    "cloudflare/wrangler-action@ebbaa1584979971c8614a24965b4405ff95890e0";
  const installCommand = "npm ci --ignore-scripts --no-audit --no-fund";
  const installIndex = deploy.indexOf(installCommand);
  const actionIndex = deploy.indexOf(officialUse);
  const wranglerRange = packageJson.devDependencies.wrangler;
  const lockRootRange = packageLock.packages[""].devDependencies.wrangler;
  const lockedWrangler = packageLock.packages["node_modules/wrangler"];

  assert.equal(occurrences(deploy, officialUse), 1);
  assert.ok(installIndex >= 0, "Deploy must install the lockfile dependencies");
  assert.ok(
    actionIndex >= 0,
    "Deploy must invoke the official Wrangler action",
  );
  assert.ok(
    installIndex < actionIndex,
    "Deploy must install the lockfile-selected Wrangler before the action",
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

test("No direct Slack workflow is invented for this repository", () => {
  assert.doesNotMatch(allWorkflows, /slackapi\/slack-github-action@/u);
  assert.doesNotMatch(allWorkflows, /hooks\.slack\.com|chat\.postMessage/u);
});
