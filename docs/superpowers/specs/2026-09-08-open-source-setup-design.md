# Open-sourcing Exposed. — design

Date: 2026-09-08
Status: approved (user: "Tout est fait, tu es libre")

## Goal

Take the `exposed.` repo (currently private, French docs, no license/governance files)
and make it public with a coherent contributor-facing setup: license, contribution
rules, GitHub templates, CI, and the repo settings that go with it.

## Ownership constraint (drives everything below)

The owner wants outside contributions but must retain sole commercial ownership —
explicitly so that a future acquisition (e.g. by Meta) or any commercial licensing
stays entirely his call. This rules out standard permissive/copyleft OSI licenses
(MIT/Apache/AGPL), which would grant reuse rights to anyone, including an acquirer,
for free.

**Chosen model: "All Rights Reserved, source-available" + CLA.**
- `LICENSE`: code is visible/forkable for reading, local use, and testing; no
  commercial use or redistribution without the owner's written permission.
- `CLA.md`: any accepted contribution is assigned/licensed to the owner in full
  (including commercial use), so external contributions never dilute ownership.
- Not legal advice — flagged as a starting point, to be reviewed by a lawyer if a
  real acquisition or dispute comes up.

## Language scope

- English: all new governance files, and existing root docs (`README.md`,
  `DESIGN.md`, `PRODUCT.md`, `COPY.md` — 469 lines) translated in place.
- French, untouched: `docs/EXPOSED_BLUEPRINT.md`, `docs/CARTES_PERSONNALISABLES.md`,
  `docs/GROS_EXPORTS_MOBILE.md`, `docs/informations.txt` (1681 lines) — internal
  design/planning notes, not needed for contributor onboarding. Explicit user
  decision, not a scoping shortcut.

## Files to create

| File | Purpose |
|---|---|
| `LICENSE` | All Rights Reserved + source-available clause |
| `CLA.md` | Contributor License/assignment agreement |
| `CONTRIBUTING.md` | Dev setup (`npm install`, `npm run dev/lint/build/analyse`), fork→branch→PR workflow, coding conventions, CLA pointer |
| `CODE_OF_CONDUCT.md` | Contributor Covenant v2.1, contact = GitHub profile (no need to publish personal email) |
| `SECURITY.md` | Points to GitHub Private Vulnerability Reporting; defines in-scope (data leaving the browser, XSS, dependency vulns) vs out-of-scope |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | Structured bug report |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | Structured feature request |
| `.github/pull_request_template.md` | PR checklist incl. CLA acknowledgement |
| `.github/workflows/ci.yml` | `npm ci && npm run lint && npm run build` on push/PR to `main` |

## Files to translate (in place, same path)

`README.md`, `DESIGN.md`, `PRODUCT.md`, `COPY.md` — French → English, content
preserved (no rewrite of substance, just translation), internal cross-references
to French-only docs (`docs/EXPOSED_BLUEPRINT.md` etc.) kept as-is since those stay
French.

## GitHub repo configuration (via `gh` CLI, now authenticated as `arnvudl`)

Current state confirmed via `gh repo view`: repo is named `exposed.` (trailing dot
is real, not a typo — kept as-is), private, default branch `main`, French
description with a couple of typos.

Actions, all via `gh`:
1. `gh repo edit` — update description to an English one-liner, add topics
   (e.g. `nextjs`, `typescript`, `privacy`, `instagram`).
2. `gh repo edit --visibility public` — confirm explicitly before running (this is
   the one irreversible-ish, externally-visible step).
3. Enable branch protection on `main` requiring the CI status check before merge.
4. Enable private vulnerability reporting (`gh api repos/{owner}/{repo} -X PATCH
   -f security_and_analysis...` or via `gh repo edit` flags where supported).

## Verification

- `npm run lint` (`tsc --noEmit`) and `npm run build` pass after translation
  (translation touches only prose files, not `app/`/`components/`/`lib/`).
- CI workflow YAML validated by eye (can't trigger a real Actions run before the
  first push).
- After push, confirm the repo is public and CI runs green on GitHub.

## Out of scope

- Translating `docs/` internal notes.
- Automated CLA-bot enforcement (e.g. cla-assistant.io) — needs a separate GitHub
  App install/authorization by the owner; this design only ships the CLA text and
  a manual reference to it in `CONTRIBUTING.md`.
- Legal review of the license text.
