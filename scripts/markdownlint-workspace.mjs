import { accessSync, constants } from "node:fs";
import {
  dirname,
  isAbsolute,
  join,
  parse,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

function isInsideRepository(candidate, repositoryRoot) {
  const pathFromRoot = relative(repositoryRoot, candidate);
  return (
    pathFromRoot === "" ||
    (pathFromRoot !== ".." &&
      !pathFromRoot.startsWith(`..${sep}`) &&
      !isAbsolute(pathFromRoot))
  );
}

function findWorkspaceConfig(repositoryRoot) {
  const override = process.env.LCV_MARKDOWNLINT_CONFIG;
  if (override) {
    const candidate = isAbsolute(override)
      ? resolve(override)
      : resolve(process.cwd(), override);
    if (isInsideRepository(candidate, repositoryRoot)) {
      console.error(
        "LCV_MARKDOWNLINT_CONFIG must point outside the repository checkout.",
      );
      process.exit(1);
    }
    return candidate;
  }

  let directory = dirname(repositoryRoot);
  const root = parse(directory).root;

  while (true) {
    const candidate = join(directory, ".markdownlint.jsonc");
    try {
      accessSync(candidate, constants.R_OK);
      return candidate;
    } catch {
      if (directory === root) {
        break;
      }
      directory = dirname(directory);
    }
  }

  return null;
}

const repository = spawnSync("git", ["rev-parse", "--show-toplevel"], {
  cwd: process.cwd(),
  encoding: "utf8",
});
if (repository.status !== 0) {
  process.stderr.write(repository.stderr);
  process.exit(repository.status ?? 1);
}

const repositoryRoot = resolve(repository.stdout.trim());
const config = findWorkspaceConfig(repositoryRoot);
if (!config) {
  console.error(
    "Central .markdownlint.jsonc not found. Run inside the LCV workspace or set LCV_MARKDOWNLINT_CONFIG.",
  );
  process.exit(1);
}

accessSync(config, constants.R_OK);

const trackedMarkdown = spawnSync("git", ["ls-files", "--", "*.md"], {
  cwd: repositoryRoot,
  encoding: "utf8",
});
if (trackedMarkdown.status !== 0) {
  process.stderr.write(trackedMarkdown.stderr);
  process.exit(trackedMarkdown.status ?? 1);
}

const files = trackedMarkdown.stdout.split(/\r?\n/u).filter(Boolean);
if (files.length === 0) {
  console.error("No tracked Markdown files found.");
  process.exit(1);
}

const markdownlintCli = fileURLToPath(
  new URL("../node_modules/markdownlint-cli/markdownlint.js", import.meta.url),
);
const result = spawnSync(
  process.execPath,
  [markdownlintCli, "--config", config, ...files],
  {
    cwd: repositoryRoot,
    stdio: "inherit",
  },
);
if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
