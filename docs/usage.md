# Usage

Library:

```js
const { run, render } = require("next-cache-doctor");

const result = run("/path/to/next-app");
process.stdout.write(render(result));
```

Command, after install:

```bash
npx next-cache-doctor [directory] [--json] [--fail-on-high]
```

With pnpm: `pnpm exec next-cache-doctor . --fail-on-high`

With yarn: `yarn next-cache-doctor . --fail-on-high`

`directory` defaults to the current working directory.

The text report has two parts.

LAYERS lists tags, route `revalidate` exports, whether `router.refresh()` appears, and any `s-maxage` values.

FINDINGS lists mismatches. Each line has a risk (`high`, `medium`, `low`), an id, a file and line, a description, and a fix.

## Finding ids

| Id | Risk | Meaning |
| --- | --- | --- |
| `revalidate-tag-max-with-use-cache` | high | `revalidateTag` is called with the `max` profile in a project that also contains `use cache`. |
| `tag-invalidation-leaves-router-cache` | high | `revalidateTag` is used, and neither `updateTag` nor `router.refresh()` appears. |
| `standalone-without-shared-cache` | high | `output: "standalone"` is set, cached or tagged data is present, and `cacheHandler` is not. |
| `tagged-fetch-without-invalidation` | medium | A fetch sets `next.tags`, and the project never calls `revalidateTag` or `updateTag`. |
| `cdn-outlives-data-cache` | medium | An `s-maxage` is longer than the shortest data or route lifetime found in source. |
| `timed-fetch-without-tag` | low | A fetch sets `next.revalidate` to a number and does not set `next.tags`. |

`--fail-on-high` sets the exit code to 1 when any high finding is present. Without that flag the exit code stays 0 so the report can be read in a shell without failing the shell.
