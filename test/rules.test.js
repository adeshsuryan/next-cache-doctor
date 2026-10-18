"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { run } = require("../src/run");

function fixture(name) {
  return path.join(__dirname, "fixtures", name);
}

function ids(result) {
  return result.findings.map((finding) => finding.id);
}

test("timed fetch without a tag fires timed-fetch-without-tag", () => {
  const found = ids(run(fixture("timed-fetch-app")));
  assert.ok(found.includes("timed-fetch-without-tag"));
  // Negative assertions: a plain timed fetch is not the other failure modes.
  assert.equal(found.includes("tagged-fetch-without-invalidation"), false);
  assert.equal(found.includes("tag-invalidation-leaves-router-cache"), false);
  assert.equal(found.includes("standalone-without-shared-cache"), false);
});

test("tagged fetch without any invalidation fires tagged-fetch-without-invalidation", () => {
  const found = ids(run(fixture("tagged-no-invalidation-app")));
  assert.ok(found.includes("tagged-fetch-without-invalidation"));
  assert.equal(found.includes("tag-invalidation-leaves-router-cache"), false);
});

test("revalidateTag inside a Server Action still warns about the router cache", () => {
  const found = ids(run(fixture("server-action-app")));
  assert.ok(found.includes("tag-invalidation-leaves-router-cache"));
});

test("revalidateTag in a Route Handler does not warn about the router cache", () => {
  // A webhook has no client router to refresh — flagging it would be a
  // false positive under Next 16 semantics.
  const found = ids(run(fixture("webhook-app")));
  assert.equal(found.includes("tag-invalidation-leaves-router-cache"), false);
});

test("stale app still reports all four layer mismatches", () => {
  const result = run(fixture("stale-app"));
  const found = ids(result);
  assert.ok(found.includes("revalidate-tag-max-with-use-cache"));
  assert.ok(found.includes("tag-invalidation-leaves-router-cache"));
  assert.ok(found.includes("standalone-without-shared-cache"));
  assert.ok(found.includes("cdn-outlives-data-cache"));
  assert.deepEqual(result.layers.dataCacheTags, ["products", "products:123"]);
});

test("Next 16: unstable_cache and bare revalidateTag are flagged", () => {
  const found = ids(run(fixture("next16-app")));
  assert.ok(found.includes("unstable-cache-deprecated"));
  assert.ok(found.includes("revalidate-tag-without-profile"));
});

test("Next 15: the same code does not fire the Next 16 findings", () => {
  const found = ids(run(fixture("next15-app")));
  assert.equal(found.includes("unstable-cache-deprecated"), false);
  assert.equal(found.includes("revalidate-tag-without-profile"), false);
});

test("cdn shorter than data lifetime does not fire cdn-outlives-data-cache", () => {
  const found = ids(run(fixture("cdn-aligned-app")));
  assert.equal(found.includes("cdn-outlives-data-cache"), false);
});
