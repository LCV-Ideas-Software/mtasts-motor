import { accessSync, constants } from "node:fs";
import { dirname, isAbsolute, join, parse, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

function findWorkspaceConfig() {
  const override = process.env.LCV_MARKDOWNLINT_CONFIG;
  if (override) {
    return isAbsolute(override) ? override : resolve(process.cwd(), override);
  }

  let directory = process.cwd();
  const root = parse(directory).root;

  while (directory !== root) {
    const candidate = join(directory, ".markdownlint.jsonc");
    try {
      accessSync(candidate, constants.R_OK);
      return candidate;
    } catch {
      directory = dirname(directory);
    }
  }

  return null;
}

const config = findWorkspaceConfig();
if (!config) {
  console.error(
    "Central .markdownlint.jsonc not found. Run inside the LCV workspace or set LCV_MARKDOWNLINT_CONFIG.",
  );
  process.exit(1);
}

accessSync(config, constants.R_OK);

const trackedMarkdown = spawnSync("git", ["ls-files", "--", "*.md"], {
  cwd: process.cwd(),
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
    cwd: process.cwd(),
    stdio: "inherit",
  },
);
if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
