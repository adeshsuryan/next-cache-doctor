"use strict";

const { run } = require("./run");
const { render } = require("./report");

function main(argv) {
  const json = argv.includes("--json");
  const failOn = argv.includes("--fail-on-high");
  const root = argv.find((arg) => arg !== "--json" && arg !== "--fail-on-high") || ".";
  let result;
  try {
    result = run(root);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
    return;
  }
  if (json) console.log(JSON.stringify(result, null, 2));
  else process.stdout.write(render(result));
  if (failOn && result.findings.some((finding) => finding.risk === "high")) {
    process.exitCode = 1;
  }
}

module.exports = { main };
