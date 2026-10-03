"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { run } = require("../src/run");

const staleRoot = path.join(__dirname, "fixtures", "stale-app");
const cleanRoot = path.join(__dirname, "fixtures", "clean-app");

test("stale app reports the invalidation mismatches", () => {
  const result = run(staleRoot);
  const ids = result.findings.map((finding) => finding.id);
  assert.ok(ids.includes("revalidate-tag-max-with-use-cache"));
  assert.ok(ids.includes("tag-invalidation-leaves-router-cache"));
  assert.ok(ids.includes("standalone-without-shared-cache"));
  assert.ok(ids.includes("cdn-outlives-data-cache"));
  assert.deepEqual(result.layers.dataCacheTags, ["products", "products:123"]);
});

test("an app that updates the tag and shares the cache skips those high findings", () => {
  const result = run(cleanRoot);
  const ids = result.findings.map((finding) => finding.id);
  assert.equal(ids.includes("tag-invalidation-leaves-router-cache"), false);
  assert.equal(ids.includes("standalone-without-shared-cache"), false);
  assert.equal(ids.includes("revalidate-tag-max-with-use-cache"), false);
});
