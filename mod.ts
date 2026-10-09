/**
 * Next cache doctor — read a Next.js project and find cache-layer
 * invalidation mismatches before a write leaves stale data behind.
 *
 * This is the typed entrypoint (used by JSR and ESM consumers). The
 * implementation itself is dependency-free CommonJS under `src/`.
 *
 * ```ts
 * import { run, render } from "@adeshsuryan/next-cache-doctor";
 * const result = run("./my-next-app");
 * console.log(render(result));
 * ```
 *
 * @module
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const cjs = require("./src/index.js") as {
  run: (directory?: string) => RunResult;
  render: (result: RunResult) => string;
};

/** A single cache-layer invalidation mismatch found in the project. */
export interface Finding {
  /** Stable rule identifier, e.g. `standalone-without-shared-cache`. */
  id: string;
  /** Risk level: `high`, `medium`, or `low`. */
  risk: "high" | "medium" | "low" | string;
  /** One-line summary. */
  title?: string;
  /** Explanation of the mismatch and its evidence. */
  detail?: string;
  /** Project-relative file path. */
  file?: string;
  /** 1-based line number. */
  line?: number;
  /** Suggested remediation. */
  fix?: string;
  [key: string]: unknown;
}

/** Result of {@linkcode run}: the cache-layer inventory plus its findings. */
export interface RunResult {
  /** Absolute path that was scanned. */
  root: string;
  /** Number of files read. */
  fileCount: number;
  /** Detected cache layers (tags, route lifetimes, router cache, CDN). */
  layers: unknown;
  /** Findings sorted by risk (high first). */
  findings: Finding[];
}

/**
 * Scan a Next.js project directory and return cache-layer findings.
 * Read-only: it never executes project code or writes files.
 */
export function run(directory?: string): RunResult {
  return cjs.run(directory);
}

/** Render a human-readable text report for a {@linkcode run} result. */
export function render(result: RunResult): string {
  return cjs.render(result);
}
