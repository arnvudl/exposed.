# Security Policy

Exposed. processes sensitive personal data (Instagram DM exports) entirely
client-side, in the user's browser. Its core security promise is that no
message data ever leaves the user's machine. Anything that breaks that
promise is a critical issue.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting instead of opening a
public issue:

1. Go to the "Security" tab of this repository.
2. Click "Report a vulnerability".
3. Describe the issue, how to reproduce it, and its impact.

You will get an acknowledgement within a few days. Please do not disclose
the issue publicly until it has been addressed.

## In scope

- Any code path that sends message content, exported data, or file contents
  to a server, third-party script, or external endpoint.
- Cross-site scripting (XSS) or injection in the report rendering
  (`/wrapped` and share-card generation).
- Vulnerable dependencies with a known exploit path in this app.
- Any bypass of the "everything runs in a Web Worker, nothing leaves the
  browser" guarantee described in [README.md](README.md).

## Out of scope

- Vulnerabilities requiring physical access to the user's device.
- Issues in third-party services unrelated to this codebase (e.g. the
  hosting platform, GitHub itself).
- Missing security headers on non-sensitive static marketing pages.

## Supported versions

This project does not yet have tagged releases; only the `main` branch is
supported and should be assumed to be the target of any report.
