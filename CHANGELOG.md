# Changelog

Each entry matches one tagged commit on `main`. The tag, the `version` field in `package.json`, and this file use the same number.

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
