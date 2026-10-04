export type Finding = {
  id: string;
  risk: "high" | "medium" | "low" | string;
  title?: string;
  detail?: string;
  file?: string;
  line?: number;
  [key: string]: unknown;
};

export type RunResult = {
  root: string;
  fileCount: number;
  layers: unknown;
  findings: Finding[];
};

/** Scan a Next.js project directory and return cache-layer findings. */
export function run(directory?: string): RunResult;

/** Render a text report for a run() result. */
export function render(result: RunResult): string;
