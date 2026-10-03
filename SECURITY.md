# Security

## Reporting

Open a private vulnerability report on GitHub:

https://github.com/adeshsuryan/next-cache-doctor/security

Do not file a public issue for a security report.

## What this package does

The command and `run()` read source files under the directory you pass. They do not start a server, open a network connection, or write into that project.

## Limits in the scanner

- The filesystem root is rejected.
- Symbolic links are not followed.
- Names that start with a dot are skipped, which covers `.env` and `.git`.
- `node_modules`, `.next`, `dist`, `coverage`, and `out` are skipped.
- Only `.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, and `.tsx` are read.
- A file larger than 1 MB is skipped.
- A file that contains a null byte is skipped.
- The walk stops at 20,000 files.

A finding is a pattern in source. It is not a proof that a production response is stale, and it is not a verdict that the project is safe.

## Dependencies

Version 0.2.0 has no runtime dependencies. Review `package.json` before any later release that adds one.
