"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { run } = require("../src/run");

test("a symlink to a file outside the project is not read", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ncd-"));
  const outside = path.join(os.tmpdir(), `ncd-secret-${process.pid}.js`);
  fs.writeFileSync(path.join(dir, "app.js"), "export const revalidate = 30;\n");
  fs.writeFileSync(outside, 'revalidateTag("secret-outside", "max");\n');
  fs.symlinkSync(outside, path.join(dir, "linked.js"));
  const result = run(dir);
  assert.equal(result.fileCount, 1);
  assert.equal(JSON.stringify(result).includes("secret-outside"), false);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.rmSync(outside, { force: true });
});

test("the filesystem root is refused", () => {
  assert.throws(() => run(path.parse(process.cwd()).root), /filesystem root/);
});
