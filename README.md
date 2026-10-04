# Next cache doctor

![Next Cache Doctor](docs/assets/banner.jpg)

Next cache doctor reads a Next.js project on disk and reports which cache layers can still serve an old page after a write.

A database update, `revalidateTag()`, and a fresh server do not guarantee a fresh screen. The data cache, the full route cache, the client router cache, and a CDN can each keep their own copy. This package names the layer that was left behind.

It is a library and a command. It does not start Next.js, call Redis, or purge a CDN. The command finishes and exits, so a process manager such as PM2 is not part of the setup.

Current release: **0.2.5**. Each release commit on `main` is an annotated git tag, `v0.2.5`, and an entry in [CHANGELOG.md](CHANGELOG.md).

- GitHub: https://github.com/adeshsuryan/next-cache-doctor
- npm: https://www.npmjs.com/package/@adeshsuryandev/next-cache-doctor
- JSR: https://jsr.io/@adeshsuryan/next-cache-doctor
- Packagist: https://packagist.org/packages/adeshsuryan/next-cache-doctor

The unscoped npm name `next-cache-doctor` is taken by another package. Node installs use the scoped names below.

## Install

Node.js 18 or newer.

### npm / pnpm / yarn (recommended for Next.js)

```bash
npm install @adeshsuryandev/next-cache-doctor
pnpm add @adeshsuryandev/next-cache-doctor
yarn add @adeshsuryandev/next-cache-doctor
```

```bash
npx @adeshsuryandev/next-cache-doctor
```

### JSR

```bash
npx jsr add @adeshsuryan/next-cache-doctor
# or: deno add jsr:@adeshsuryan/next-cache-doctor
```

### Composer (Packagist)

Composer installs the files. Node runs them.

```bash
composer require adeshsuryan/next-cache-doctor
node vendor/adeshsuryan/next-cache-doctor/bin/next-cache-doctor.js
```

## Use it from code

```js
// npm (CommonJS)
const { run, render } = require("@adeshsuryandev/next-cache-doctor");

// npm / JSR (ESM)
// import { run, render } from "@adeshsuryandev/next-cache-doctor";
// import { run, render } from "@adeshsuryan/next-cache-doctor";

const result = run("/path/to/next-app");
process.stdout.write(render(result));

for (const finding of result.findings) {
  if (finding.risk === "high") {
    console.error(finding.id, finding.file, finding.line);
  }
}
```

`run(directory)` returns `{ root, fileCount, layers, findings }`. `render(result)` returns the text report. The package has no dependencies.

## Use it from the shell

```bash
npx @adeshsuryandev/next-cache-doctor [directory] [--json] [--fail-on-high]
```

`directory` defaults to the current working directory. `--json` prints the same object `run()` returns. `--fail-on-high` exits 1 when any finding is high. Exit 2 means the path was refused or could not be read.

Example:

```text
Next cache doctor
Files read: 3

LAYERS
DATA CACHE
  products
  products:123
FULL ROUTE CACHE
  app/products/[id]/page.tsx  revalidate 300s
ROUTER CACHE
  router.refresh() was not found
CDN
  next.config.js:7  s-maxage 86400

FINDINGS

HIGH  tag-invalidation-leaves-router-cache
app/actions.ts:4
Tag invalidation does not clear the client router cache
revalidateTag expires the data cache used by the server. The browser can still render a cached React Server Component payload until the router cache is refreshed.
Fix: Call updateTag from the Server Action when the user must see the write immediately, and call router.refresh() on the client after the mutation.
```

## What a high finding means

| Id | What is wrong |
| --- | --- |
| `tag-invalidation-leaves-router-cache` | `revalidateTag` ran, and the project never calls `updateTag` or `router.refresh()`. The browser can keep the old Server Component payload. |
| `standalone-without-shared-cache` | `output: "standalone"` with cached data and no `cacheHandler`. Another instance can keep serving the tag you just invalidated. |
| `revalidate-tag-max-with-use-cache` | `revalidateTag(..., "max")` appears in a project that also uses `"use cache"`. That combination has failed production Server Actions with HTTP 500. |

Medium and low findings are in [docs/usage.md](docs/usage.md).

## What the scan will not open

- The filesystem root.
- Symbolic links.
- `node_modules`, `.next`, `.git`, `dist`, `coverage`, `out`, and any name that starts with a dot.
- Files larger than 1 MB, or files that are not `.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, or `.tsx`.
- More than 20,000 source files. The walk stops there.

The file is read as text. It is not executed. A path that resolves outside the directory you passed is dropped.

## Develop

```bash
git clone https://github.com/adeshsuryan/next-cache-doctor.git
cd next-cache-doctor
npm test
```

`pnpm test` and `yarn test` run the same `node --test` script. There is no install step, because the package has no dependencies.

## Releases

Versions follow semantic versioning. The git tag and `package.json` use the same number. History is in [CHANGELOG.md](CHANGELOG.md).

Report a vulnerability through GitHub private security reporting, described in [SECURITY.md](SECURITY.md).

## License

MIT. Copyright 2026 Adesh Suryan. See [LICENSE](LICENSE).
