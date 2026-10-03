"use strict";

function analyze(project) {
  const findings = [];
  const layers = summarize(project);

  const useCacheFile = project.files.find((file) => file.signals.useCache);
  const maxProfile = findTag(project, (call) => call.profile === "max");
  if (useCacheFile && maxProfile) {
    findings.push({
      id: "revalidate-tag-max-with-use-cache",
      risk: "high",
      file: maxProfile.file,
      line: maxProfile.call.line,
      title: "revalidateTag profile max is combined with use cache",
      detail:
        "A production failure mode returns 500 on later Server Action requests when revalidateTag is called with the max profile in an app that also uses the use cache directive.",
      fix: "Drop the max profile, or move the mutation to updateTag inside the Server Action, and retest the action in a production build.",
    });
  }

  const anyRevalidateTag = findTag(project, () => true);
  const anyUpdateTag = project.files.find((file) => file.signals.updateTags.length > 0);
  const anyRefresh = project.files.find((file) => file.signals.routerRefresh);
  if (anyRevalidateTag && !anyUpdateTag && !anyRefresh) {
    findings.push({
      id: "tag-invalidation-leaves-router-cache",
      risk: "high",
      file: anyRevalidateTag.file,
      line: anyRevalidateTag.call.line,
      title: "Tag invalidation does not clear the client router cache",
      detail:
        "revalidateTag expires the data cache used by the server. The browser can still render a cached React Server Component payload until the router cache is refreshed.",
      fix: 'Call updateTag from the Server Action when the user must see the write immediately, and call router.refresh() on the client after the mutation.',
    });
  }

  const taggedFetch = findFetch(project, (call) => call.tags.length > 0);
  if (taggedFetch && !anyRevalidateTag && !anyUpdateTag) {
    findings.push({
      id: "tagged-fetch-without-invalidation",
      risk: "medium",
      file: taggedFetch.file,
      line: taggedFetch.call.line,
      title: "Cached fetches are tagged, but nothing invalidates those tags",
      detail:
        "Tags only help if a mutation calls revalidateTag or updateTag with the same tag. A write that skips both leaves the data cache in place until the lifetime ends.",
      fix: "Invalidate the same tag from the mutation path, or stop tagging fetches that you cannot invalidate.",
    });
  }

  const timedFetch = findFetch(
    project,
    (call) => typeof call.revalidate === "number" && call.tags.length === 0
  );
  if (timedFetch) {
    findings.push({
      id: "timed-fetch-without-tag",
      risk: "low",
      file: timedFetch.file,
      line: timedFetch.call.line,
      title: "A timed fetch cache has no tag",
      detail:
        "revalidate sets a lifetime. Without a tag, a database write cannot target that entry.",
      fix: "Add a stable tag and invalidate it from the write path, or accept that the entry lives until the lifetime ends.",
    });
  }

  const standalone = project.files.find((file) => file.signals.standalone);
  const cacheHandler = project.files.find((file) => file.signals.cacheHandler);
  if (standalone && !cacheHandler && (anyRevalidateTag || anyUpdateTag || taggedFetch)) {
    findings.push({
      id: "standalone-without-shared-cache",
      risk: "high",
      file: standalone.file,
      line: 1,
      title: "Standalone output has no shared cache handler",
      detail:
        "Tag invalidation on one Node process does not reach the other processes. A multi-instance deploy keeps serving the entry that lived on the instance the request did not hit.",
      fix: "Point cacheHandler at a store every instance can read, or run a single instance.",
    });
  }

  const longCdn = longestSharedCache(project);
  const shortestData = shortestDataLifetime(project);
  if (longCdn && shortestData !== null && longCdn.seconds > shortestData) {
    findings.push({
      id: "cdn-outlives-data-cache",
      risk: "medium",
      file: longCdn.file,
      line: longCdn.line,
      title: "The shared HTTP cache outlives the data cache",
      detail:
        "Invalidating the data cache does not remove a response that a CDN or reverse proxy is still allowed to store.",
      fix: "Align s-maxage or the CDN lifetime with the data lifetime, or purge the CDN when you invalidate the tag.",
    });
  }

  const order = { high: 0, medium: 1, low: 2 };
  findings.sort((a, b) => order[a.risk] - order[b.risk] || a.id.localeCompare(b.id));
  return { layers, findings };
}

function summarize(project) {
  const tags = new Set();
  const routeLifetimes = [];
  let routerRefresh = false;
  const cdn = [];

  for (const file of project.files) {
    for (const call of file.signals.fetchNext) {
      for (const tag of call.tags) tags.add(tag);
    }
    for (const call of file.signals.revalidateTags) tags.add(call.tag);
    for (const call of file.signals.updateTags) tags.add(call.tag);
    for (const item of file.signals.routeRevalidate) {
      routeLifetimes.push({ file: file.file, value: item.value, line: item.line });
    }
    if (file.signals.routerRefresh) routerRefresh = true;
    for (const item of file.signals.cacheControl) {
      if (item.kind === "s-maxage") {
        cdn.push({ file: file.file, seconds: item.seconds, line: item.line });
      }
    }
  }

  return {
    dataCacheTags: [...tags].sort(),
    routeLifetimes,
    routerRefresh,
    cdn,
  };
}

function findTag(project, predicate) {
  for (const file of project.files) {
    for (const call of file.signals.revalidateTags) {
      if (predicate(call)) return { file: file.file, call };
    }
  }
  return null;
}

function findFetch(project, predicate) {
  for (const file of project.files) {
    for (const call of file.signals.fetchNext) {
      if (predicate(call)) return { file: file.file, call };
    }
  }
  return null;
}

function longestSharedCache(project) {
  let best = null;
  for (const file of project.files) {
    for (const item of file.signals.cacheControl) {
      if (item.kind !== "s-maxage") continue;
      if (!best || item.seconds > best.seconds) {
        best = { file: file.file, line: item.line, seconds: item.seconds };
      }
    }
  }
  return best;
}

function shortestDataLifetime(project) {
  let best = null;
  for (const file of project.files) {
    for (const call of file.signals.fetchNext) {
      if (typeof call.revalidate === "number") {
        best = best === null ? call.revalidate : Math.min(best, call.revalidate);
      }
    }
    for (const item of file.signals.routeRevalidate) {
      if (typeof item.value === "number") {
        best = best === null ? item.value : Math.min(best, item.value);
      }
    }
  }
  return best;
}

module.exports = { analyze };
