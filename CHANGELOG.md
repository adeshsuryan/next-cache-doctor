# Changelog

Each entry matches one tagged commit on `main`. The tag, the `version` field in `package.json`, and this file use the same number.

## 0.2.6 - 2026-10-09

Tag: `v0.2.6`

### Changed

- JSR entrypoint is now `mod.ts`: typed exports (`run`, `render`, `Finding`, `RunResult`) with documentation, satisfying JSR's slow-type and symbol-doc checks.
- Added a JSR publish workflow using OIDC provenance (no token secret), matching the npm workflow.

## 0.2.5 - 2026-10-04

Tag: `v0.2.5`

### Changed

- Repository and social banner updated: footer is `open source · npm · JSR · GitHub` (Packagist label and version number removed from the image).

## 0.2.4 - 2026-10-04

Tag: `v0.2.4`

### Added

- npm package `@adeshsuryandev/next-cache-doctor` (scoped; unscoped `next-cache-doctor` is taken).
- JSR package `@adeshsuryan/next-cache-doctor` with ESM entry `mod.mjs`.
- Dual package exports: `require` → `src/index.js`, `import` → `mod.mjs`.

### Changed

- README install paths for npm, JSR, and Packagist.

## 0.2.3 - 2026-10-04

Tag: `v0.2.3`

### Changed

- Republished on a clean git history so Packagist can track a new immutable release after upstream tags were rewritten (Packagist version immutability).
- Composer installs should use `adeshsuryan/next-cache-doctor:^0.2.3` (or `^0.2`) to resolve this release.

## 0.2.2 - 2026-10-03

Tag: `v0.2.2`

### Added

- Product banner in `docs/assets/banner.jpg`, shown at the top of the README (GitHub and Packagist).
- README notes that the npm name for Next.js installs should be `@adeshsuryan/next-cache-doctor`, because unscoped `next-cache-doctor` is already taken on npm.

## 0.2.1 - 2026-10-02

Tag: `v0.2.1`

### Added

- `composer.json` so the package can be installed from Packagist as `adeshsuryan/next-cache-doctor`.
- Composer install lines in the README. Node 18 or newer still runs the command.

## 0.2.0 - 2026-10-02

Tag: `v0.2.0`

### Added

- Import path. `require("next-cache-doctor")` exports `run` and `render`.
- Install instructions for npm, pnpm, and yarn, including install from the GitHub repository.
- `CHANGELOG.md` and `SECURITY.md`.
- Refusal to scan the filesystem root.
- Skip for symbolic links, files over 1 MB, null bytes, and walks beyond 20,000 source files.

### Changed

- `package.json` now has `main`, `exports`, `homepage`, `bugs`, and `publishConfig`.
- README describes the product, the command, and the library.

## 0.1.0 - 2026-10-02

Tag: `v0.1.0`

### Added

- First public commit. A static reader for Next.js source that reports data-cache tags, route `revalidate`, router refresh, and `s-maxage`.
- Findings for tag invalidation that leaves the router cache, standalone output without a shared cache handler, `revalidateTag` profile `max` together with `use cache`, tagged fetches with no invalidation, a CDN lifetime longer than the data lifetime, and a timed fetch with no tag.
- CLI flags `--json` and `--fail-on-high`.
- Project rules, prerequisites, and usage notes.
