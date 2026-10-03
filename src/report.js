"use strict";

function render(result) {
  const lines = [];
  lines.push("Next cache doctor");
  lines.push(`Files read: ${result.fileCount}`);
  lines.push("");
  lines.push("LAYERS");
  lines.push("DATA CACHE");
  if (result.layers.dataCacheTags.length === 0) lines.push("  (no tags found)");
  for (const tag of result.layers.dataCacheTags) lines.push(`  ${tag}`);
  lines.push("FULL ROUTE CACHE");
  if (result.layers.routeLifetimes.length === 0) lines.push("  (no route revalidate export found)");
  for (const item of result.layers.routeLifetimes) {
    const value = item.value === false ? "false" : `${item.value}s`;
    lines.push(`  ${item.file}  revalidate ${value}`);
  }
  lines.push("ROUTER CACHE");
  lines.push(
    result.layers.routerRefresh
      ? "  router.refresh() is called"
      : "  router.refresh() was not found"
  );
  lines.push("CDN");
  if (result.layers.cdn.length === 0) lines.push("  (no s-maxage found)");
  for (const item of result.layers.cdn) {
    lines.push(`  ${item.file}:${item.line}  s-maxage ${item.seconds}`);
  }
  lines.push("");
  lines.push("FINDINGS");
  if (result.findings.length === 0) {
    lines.push("  No cache invalidation mismatch was detected in the files that were read.");
    return lines.join("\n") + "\n";
  }
  for (const finding of result.findings) {
    lines.push("");
    lines.push(`${finding.risk.toUpperCase()}  ${finding.id}`);
    lines.push(`${finding.file}:${finding.line}`);
    lines.push(finding.title);
    lines.push(finding.detail);
    lines.push(`Fix: ${finding.fix}`);
  }
  lines.push("");
  return lines.join("\n");
}

module.exports = { render };
