"use strict";

const path = require("path");
const { readProject } = require("./scan");
const { analyze } = require("./rules");

function run(root) {
  const resolved = path.resolve(root || ".");
  const project = readProject(resolved);
  const result = analyze(project);
  return {
    root: resolved,
    fileCount: project.files.length,
    layers: result.layers,
    findings: result.findings,
  };
}

module.exports = { run };
