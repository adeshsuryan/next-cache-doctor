"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("child_process");
const path = require("path");

const BIN = path.join(__dirname, "..", "bin", "next-cache-doctor");
const staleApp = path.join(__dirname, "fixtures", "stale-app");

test("--json prints a parseable report", () => {
  const out = execFileSync(process.execPath, [BIN, staleApp, "--json"], {
    encoding: "utf8",
  });
  const result = JSON.parse(out);
  assert.ok(Array.isArray(result.findings));
  assert.ok(result.findings.length >= 1);
});

test("--fail-on-high exits 1 when a high finding exists", () => {
  assert.throws(
    () =>
      execFileSync(process.execPath, [BIN, staleApp, "--fail-on-high"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }),
    (error) => error.status === 1
  );
});

test("an unscannable path exits 2", () => {
  assert.throws(
    () =>
      execFileSync(process.execPath, [BIN, "/does/not/exist", "--json"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }),
    (error) => error.status === 2
  );
});
