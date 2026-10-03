"use strict";

const fs = require("fs");
const path = require("path");

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "coverage",
  "out",
]);

const SOURCE_EXT = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]);
const MAX_FILE_BYTES = 1024 * 1024;
const MAX_FILES = 20000;

function insideRoot(rootReal, candidate) {
  const relative = path.relative(rootReal, candidate);
  return relative === "" || (relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative));
}

function assertSafeRoot(rootReal) {
  if (rootReal === path.parse(rootReal).root) {
    throw new Error("Refusing to scan the filesystem root.");
  }
}

function listFiles(root) {
  const rootReal = fs.realpathSync(root);
  assertSafeRoot(rootReal);
  const out = [];

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (out.length >= MAX_FILES) return;
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
      if (entry.isSymbolicLink()) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.isFile() || !SOURCE_EXT.has(path.extname(entry.name))) continue;
      if (!insideRoot(rootReal, full)) continue;
      let stat;
      try {
        stat = fs.lstatSync(full);
      } catch {
        continue;
      }
      if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_FILE_BYTES) continue;
      out.push(full);
    }
  }

  walk(rootReal);
  return out.sort();
}

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

function capture(text, pattern) {
  const found = [];
  const flags = pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g";
  const regex = new RegExp(pattern.source, flags);
  let match;
  while ((match = regex.exec(text)) !== null) {
    found.push({ match, line: lineOf(text, match.index) });
    if (match.index === regex.lastIndex) regex.lastIndex += 1;
  }
  return found;
}

function readProject(root) {
  const rootReal = fs.realpathSync(root);
  assertSafeRoot(rootReal);
  const files = listFiles(rootReal).map((file) => {
    const text = fs.readFileSync(file, "utf8");
    if (text.includes("\0")) return null;
    const rel = path.relative(rootReal, file);
    return { file: rel.split(path.sep).join("/"), text, signals: signalsFrom(text) };
  }).filter(Boolean);
  return { root: rootReal, files };
}

function signalsFrom(text) {
  const revalidateTags = capture(
    text,
    /revalidateTag\s*\(\s*([^,\n)]+?)\s*(?:,\s*([^)\n]+?))?\s*\)/g
  ).map((item) => ({
    tag: cleanArg(item.match[1]),
    profile: item.match[2] ? cleanArg(item.match[2]) : null,
    line: item.line,
  }));

  const updateTags = capture(text, /updateTag\s*\(\s*([^)\n]+?)\s*\)/g).map((item) => ({
    tag: cleanArg(item.match[1]),
    line: item.line,
  }));

  const revalidatePaths = capture(
    text,
    /revalidatePath\s*\(\s*([^)\n]+?)\s*\)/g
  ).map((item) => ({
    path: cleanArg(item.match[1]),
    line: item.line,
  }));

  const fetchNext = [];
  const nextBlocks = capture(text, /next\s*:\s*\{[^{}]*\}/g);
  for (const block of nextBlocks) {
    const body = block.match[0];
    const tags = tagList(body);
    const revalidate = numberOrFalse(body, /revalidate\s*:\s*(\d+|false)/);
    const cache = quoted(body, /cache\s*:\s*['"]([^'"]+)['"]/);
    if (tags.length || revalidate !== null || cache) {
      fetchNext.push({ tags, revalidate, cache, line: block.line });
    }
  }

  const routeRevalidate = capture(text, /export\s+const\s+revalidate\s*=\s*(\d+|false)/g).map(
    (item) => ({
      value: item.match[1] === "false" ? false : Number(item.match[1]),
      line: item.line,
    })
  );

  const dynamicModes = capture(text, /export\s+const\s+dynamic\s*=\s*['"]([^'"]+)['"]/g).map(
    (item) => ({ value: item.match[1], line: item.line })
  );

  const cacheControl = [];
  for (const item of capture(text, /max-age=(\d+)/g)) {
    cacheControl.push({ kind: "max-age", seconds: Number(item.match[1]), line: item.line });
  }
  for (const item of capture(text, /s-maxage=(\d+)/g)) {
    cacheControl.push({ kind: "s-maxage", seconds: Number(item.match[1]), line: item.line });
  }

  return {
    revalidateTags,
    updateTags,
    revalidatePaths,
    fetchNext,
    routeRevalidate,
    dynamicModes,
    cacheControl,
    useCache: /['"]use cache['"]/.test(text),
    routerRefresh: /router\.refresh\s*\(/.test(text),
    cacheHandler: /cacheHandler\s*:/.test(text),
    standalone: /output\s*:\s*['"]standalone['"]/.test(text),
  };
}

function cleanArg(value) {
  return String(value).trim().replace(/^['"`]|['"`]$/g, "");
}

function tagList(body) {
  const match = body.match(/tags\s*:\s*\[([^\]]*)\]/);
  if (!match) return [];
  return match[1]
    .split(",")
    .map((part) => cleanArg(part))
    .filter(Boolean);
}

function numberOrFalse(body, pattern) {
  const match = body.match(pattern);
  if (!match) return null;
  return match[1] === "false" ? false : Number(match[1]);
}

function quoted(body, pattern) {
  const match = body.match(pattern);
  return match ? match[1] : null;
}

module.exports = {
  listFiles,
  readProject,
  signalsFrom,
  insideRoot,
  MAX_FILE_BYTES,
  MAX_FILES,
};
