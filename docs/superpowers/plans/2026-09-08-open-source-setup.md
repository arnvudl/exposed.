# Open-sourcing Exposed. Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `exposed.` GitHub repo public with a full contributor-facing
setup: a source-available license + CLA that preserves sole commercial
ownership, English governance docs, GitHub templates, CI, and the repo
settings that go with all of that.

**Architecture:** This is a documentation/config task, not application code —
there is no test suite to drive with TDD. "Verification" per task means: the
file exists at the right path with the right content, and for anything that
touches the app (none of these tasks do), `npm run lint` / `npm run build`
still pass. Translation tasks (Tasks 9-12) specify the exact source file,
required terminology, and constraints (see "Translation rules" below) rather
than embedding the full translated text twice — the translator reads the
cited source lines directly.

**Tech Stack:** Markdown, GitHub Actions YAML, GitHub issue-form YAML, `gh` CLI (authenticated as `arnvudl`).

**Translation rules (apply to Tasks 9-12):**
- Preserve structure 1:1: same headings, same order, same tables/lists.
- Preserve meaning exactly — this is translation, not a rewrite. Don't add,
  drop, or soften claims (especially the privacy/no-server guarantees).
- Keep `Exposed.` (with the trailing period) as the product name, never
  translate it.
- Keep French-only cross-references as-is (e.g. link text may become English
  but the target path `docs/EXPOSED_BLUEPRINT.md` stays, and it's fine that
  the linked doc is still in French).
- **No em dash (`—`) or en dash (`–`) anywhere** — `DESIGN.md`/`COPY.md`
  themselves ban this punctuation project-wide ("Tiret cadratin interdit
  partout"), so it applies to the English versions too. Use a comma, period,
  colon, or parenthesis instead.
- No exclamation marks, no rhetorical question titles — same rule.
- Keep the flat, factual tone (COPY.md's "sec, factuel" rule): don't
  translate into marketing-speak.

---

### Task 1: LICENSE

**Files:**
- Create: `LICENSE`

- [ ] **Step 1: Write the file**

```text
Exposed. Source-Available License

Copyright (c) 2026 Arnaud Leroy. All rights reserved.

1. Grant of rights
   You may view, download, fork, and modify this source code for personal,
   educational, and non-commercial evaluation purposes, including running it
   locally to test changes before submitting a contribution under CLA.md.

2. What you may not do without prior written permission from the copyright
   holder
   - Use this software, in whole or in part, in a product or service made
     available to third parties, commercially or free of charge.
   - Redistribute this software or a modified version of it, in source or
     compiled form, outside of contributing back to this repository.
   - Remove or alter this license notice.

3. Contributions
   Contributions submitted to this repository are governed by CLA.md. By
   submitting a pull request, you agree to the terms described there.

4. No warranty
   This software is provided "as is", without warranty of any kind, express
   or implied, including but not limited to the warranties of
   merchantability, fitness for a particular purpose, and noninfringement.
   In no event shall the copyright holder be liable for any claim, damages,
   or other liability arising from the use of this software.

5. Contact
   For licensing inquiries (commercial use, acquisition, partnerships),
   open a GitHub issue or contact the repository owner directly.

This is not an OSI-approved open-source license. It is a source-available
license: the code is public for transparency and collaboration, but
commercial rights are reserved.
```

- [ ] **Step 2: Commit**

```bash
git add LICENSE
git commit -m "Add source-available LICENSE"
```

---

### Task 2: CLA.md

**Files:**
- Create: `CLA.md`

- [ ] **Step 1: Write the file**

```markdown
# Contributor License Agreement (CLA)

Exposed. accepts contributions from anyone, but the project is released
under a source-available license (see [LICENSE](LICENSE)), not a permissive
open-source one. Sole commercial ownership stays with the project owner, so
this agreement makes that explicit before your first pull request is merged.

## What you agree to by submitting a pull request

By opening a pull request against this repository, you agree that:

1. **You own the rights to your contribution.** It is your original work, or
   you have the right to submit it under this agreement.
2. **You grant the project owner (Arnaud Leroy) a perpetual, worldwide,
   irrevocable, royalty-free, exclusive license to use, modify, sublicense,
   and commercialize your contribution**, in this project or any derivative
   of it, without further consent or compensation.
3. **You keep your copyright.** You are not signing away authorship credit,
   just granting the license above. Contributors are welcome to be listed in
   release notes on request.
4. **You understand this is not a standard open-source contribution.**
   Unlike MIT/Apache-licensed projects, your contribution cannot later be
   forked or reused commercially by anyone, including yourself, outside this
   repository, without the project owner's permission.

## How to signal agreement

Add the following line to your pull request's description:

> I have read and agree to the Exposed. Contributor License Agreement (CLA.md).

Pull requests without this line will not be merged.

## Why this exists

Exposed. is a solo-founder project. Outside contributions are genuinely
welcome, but the owner needs to retain the ability to license or sell the
project as a whole (for example, in an acquisition) without having to track
down every past contributor for a separate agreement. This CLA is what makes
both things possible at once.

Questions? Open an issue before you start work on a large contribution.
```

- [ ] **Step 2: Commit**

```bash
git add CLA.md
git commit -m "Add Contributor License Agreement"
```

---

### Task 3: CODE_OF_CONDUCT.md

**Files:**
- Create: `CODE_OF_CONDUCT.md`

- [ ] **Step 1: Write the file**

```markdown
# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics,
gender identity and expression, level of experience, education,
socio-economic status, nationality, personal appearance, race, religion, or
sexual identity and orientation.

## Our Standards

Examples of behavior that contributes to a positive environment:

- Demonstrating empathy and kindness toward other people
- Being respectful of differing opinions, viewpoints, and experiences
- Giving and gracefully accepting constructive feedback
- Accepting responsibility and apologizing to those affected by our
  mistakes, and learning from the experience
- Focusing on what is best not just for us as individuals, but for the
  overall community

Examples of unacceptable behavior:

- The use of sexualized language or imagery, and sexual attention or
  advances of any kind
- Trolling, insulting or derogatory comments, and personal or political
  attacks
- Public or private harassment
- Publishing others' private information, such as a physical or email
  address, without their explicit permission
- Other conduct which could reasonably be considered inappropriate in a
  professional setting

## Enforcement Responsibilities

The project owner is responsible for clarifying and enforcing standards of
acceptable behavior and will take appropriate and fair corrective action in
response to any behavior deemed inappropriate, threatening, offensive, or
harmful.

## Scope

This Code of Conduct applies within all community spaces (issues, pull
requests, discussions) and when an individual is officially representing the
project in public spaces.

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported by opening a GitHub issue tagged `conduct`, or, if the report
involves sensitive details you don't want public, via a private message to
the repository owner's GitHub account. All complaints will be reviewed and
investigated promptly and fairly.

## Enforcement Guidelines

1. **Correction** - A private, written warning for an isolated incident.
2. **Warning** - A warning with consequences for continued behavior,
   including temporary avoidance of interaction with the reporter.
3. **Temporary Ban** - A temporary ban from any interaction or public
   communication with the community for a specified period.
4. **Permanent Ban** - A permanent ban from any public interaction within
   the community.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage],
version 2.1, available at
[contributor-covenant.org/version/2/1/code_of_conduct.html][v2.1].

[homepage]: https://www.contributor-covenant.org
[v2.1]: https://www.contributor-covenant.org/version/2/1/code_of_conduct.html
```

- [ ] **Step 2: Commit**

```bash
git add CODE_OF_CONDUCT.md
git commit -m "Add Contributor Covenant code of conduct"
```

---

### Task 4: SECURITY.md

**Files:**
- Create: `SECURITY.md`

- [ ] **Step 1: Write the file**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add SECURITY.md
git commit -m "Add security policy"
```

---

### Task 5: CONTRIBUTING.md

**Files:**
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Write the file**

```markdown
# Contributing to Exposed.

Thanks for wanting to help. Please read this before opening a pull request.

## Before you start

This project uses a [source-available license](LICENSE), not a permissive
open-source one: the owner retains commercial ownership. Contributions are
governed by the [Contributor License Agreement](CLA.md) — by submitting a
pull request you agree to it. Read it before you invest time in a change.

For anything non-trivial, open an issue first to discuss the approach before
writing code. It avoids wasted work on a PR that doesn't fit the project's
direction.

## Project rules that override personal taste

Two documents are the non-negotiable style bible for this project. They are
written in French but apply to all contributions regardless of your native
language:

- [`DESIGN.md`](DESIGN.md): visual design system (colors, motion, spacing,
  typography, the poster component rules for each reveal).
- [`COPY.md`](COPY.md): copywriting rules for every visible string (banned
  words, sentence rhythm, tone).

If a change touches UI or copy, it has to comply with these files. When in
doubt, ask in the PR rather than guessing.

## Dev setup

```bash
npm install
npm run dev
```

## Before opening a PR

```bash
npm run lint
npm run build
```

`npm run lint` runs `tsc --noEmit` and must pass with zero errors.
`npm run build` runs `next build` (static export) and must succeed. Both
also run in CI on every pull request; a failing check blocks merge.

## Workflow

1. Fork the repository and create a branch off `main`.
2. Make your change, following `DESIGN.md` / `COPY.md` where relevant.
3. Run `npm run lint` and `npm run build` locally.
4. Open a pull request. Include the CLA acknowledgement line from
   [`CLA.md`](CLA.md) in the description.
5. Fill in the pull request template checklist.

## Non-negotiable product principles

From [`README.md`](README.md), these apply to any contribution:

1. **Zero server for user data.** Parsing and analysis run client-side, in a
   Web Worker.
2. **Zero third-party script on `/wrapped`.** No ads, analytics, or
   monitoring on the page that touches message content.
3. **Verifiable.** Anyone should be able to open the browser's Network tab
   during analysis and see that nothing is sent.

A pull request that violates any of these will not be merged, regardless of
how good the feature is otherwise.

## Commit messages

Short, in the imperative mood, describing the "why" when it's not obvious
from the diff. No fixed format is enforced beyond that.

## Questions

Open a GitHub issue with the "question" label.
```

- [ ] **Step 2: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "Add CONTRIBUTING guide"
```

---

### Task 6: Issue templates

**Files:**
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`

- [ ] **Step 1: Write `.github/ISSUE_TEMPLATE/bug_report.yml`**

```yaml
name: Bug report
description: Something in Exposed. isn't working as expected
labels: ["bug"]
body:
  - type: textarea
    id: description
    attributes:
      label: What happened?
      description: A clear description of the bug.
    validations:
      required: true
  - type: textarea
    id: repro
    attributes:
      label: Steps to reproduce
      description: Exact steps to trigger the bug.
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. See error
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
    validations:
      required: true
  - type: input
    id: browser
    attributes:
      label: Browser and OS
      placeholder: "Chrome 129 on macOS 15"
    validations:
      required: true
  - type: textarea
    id: export-size
    attributes:
      label: Instagram export size (if relevant)
      description: >-
        Only if the bug happens while processing a data export. Do not
        attach the export file itself.
      placeholder: "e.g. 1.2 GB, single ZIP"
    validations:
      required: false
```

- [ ] **Step 2: Write `.github/ISSUE_TEMPLATE/feature_request.yml`**

```yaml
name: Feature request
description: Suggest an idea for Exposed.
labels: ["enhancement"]
body:
  - type: textarea
    id: problem
    attributes:
      label: What problem does this solve?
      description: What are you trying to do that the product doesn't support today?
    validations:
      required: true
  - type: textarea
    id: proposal
    attributes:
      label: Proposed solution
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives considered
    validations:
      required: false
  - type: checkboxes
    id: principles
    attributes:
      label: Non-negotiable check
      description: >-
        Confirm your idea doesn't conflict with the project's core
        principles (see README.md).
      options:
        - label: This does not require sending user data to a server.
          required: true
        - label: This does not add a third-party script to /wrapped.
          required: true
```

- [ ] **Step 3: Commit**

```bash
git add .github/ISSUE_TEMPLATE
git commit -m "Add issue templates"
```

---

### Task 7: Pull request template

**Files:**
- Create: `.github/pull_request_template.md`

- [ ] **Step 1: Write the file**

```markdown
## What does this PR do?



## Related issue

Closes #

## Checklist

- [ ] I have read [CONTRIBUTING.md](CONTRIBUTING.md)
- [ ] `npm run lint` passes locally
- [ ] `npm run build` passes locally
- [ ] UI/copy changes follow [DESIGN.md](DESIGN.md) and [COPY.md](COPY.md)
- [ ] No new server calls, third-party scripts, or data leaving the browser
      were introduced

## CLA acknowledgement

I have read and agree to the Exposed. Contributor License Agreement (CLA.md).
```

- [ ] **Step 2: Commit**

```bash
git add .github/pull_request_template.md
git commit -m "Add pull request template"
```

---

### Task 8: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write the file**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

- [ ] **Step 2: Validate YAML syntax locally**

Run: `node -e "require('yaml' in require('module').builtinModules ? 'yaml' : './node_modules/.bin')" 2>/dev/null; python -c "import yaml,sys; yaml.safe_load(open('.github/workflows/ci.yml'))" 2>&1 || true`

If Python/PyYAML isn't available, visually re-check indentation instead
(2 spaces, `on:`/`jobs:` at column 0, steps as a list under `steps:`). The
real validation happens when this file first runs in GitHub Actions after
Task 14's push.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "Add CI workflow (lint + build on push/PR to main)"
```

---

### Task 9: Translate README.md to English

**Files:**
- Modify: `README.md` (currently 38 lines, French — see full text already
  read into context earlier in this session)

- [ ] **Step 1: Rewrite the file in English**, following the "Translation
  rules" section above. Preserve every section (`État`, `Principes non
  négociables` → `Status`, `Non-negotiable principles`, etc.), the link to
  `docs/EXPOSED_BLUEPRINT.md`, the two `npx skills add` code blocks
  unchanged, and the closing Meta/Instagram disclaimer.

- [ ] **Step 2: Verify nothing else changed**

Run: `git diff --stat README.md`
Expected: only `README.md` listed, no unrelated files touched.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "Translate README to English"
```

---

### Task 10: Translate PRODUCT.md to English

**Files:**
- Modify: `PRODUCT.md` (currently 60 lines, French, see full text already
  read into context earlier in this session)

- [ ] **Step 1: Rewrite the file in English**, following the "Translation
  rules" section above. Preserve all section headers (`Ce que c'est`, `Mode
  utilisateur`, `Audience`, `Promesse`, `Contre-promesse, aussi importante`,
  `Ton`, `La friction centrale, à ne jamais oublier`, `Modèle économique`,
  `Hors périmètre`, `Mentions obligatoires`) and the example quote sentence
  ("Tu lui parles plus qu'à tes close friends. Il n'y est pas.") translated
  faithfully, keeping its short/blunt rhythm.

- [ ] **Step 2: Verify nothing else changed**

Run: `git diff --stat PRODUCT.md`
Expected: only `PRODUCT.md` listed.

- [ ] **Step 3: Commit**

```bash
git add PRODUCT.md
git commit -m "Translate PRODUCT.md to English"
```

---

### Task 11: Translate COPY.md to English

**Files:**
- Modify: `COPY.md` (currently 118 lines, French, see full text already read
  into context earlier in this session)

- [ ] **Step 1: Rewrite the file in English**, following the "Translation
  rules" section above. This file is itself a style guide that bans certain
  words/punctuation in French — translate it into an equivalent English
  style guide with an equivalent banned-word list (English marketing-speak
  equivalents: "revolutionize", "boost", "transform", "catalyze", "dive
  into", "innovative", "holistic", "synergy", "ecosystem", "game-changing",
  "seamless", "effortless", "unique experience", "designed for", "built
  for", "empower", "leverage", "insights", "data-driven", "magical", "it
  has never been easier to"). Keep the two example tables (the copy grid
  applied to the homepage, and the pre-publish checklist) with their
  original French example strings translated too.

- [ ] **Step 2: Verify nothing else changed**

Run: `git diff --stat COPY.md`
Expected: only `COPY.md` listed.

- [ ] **Step 3: Commit**

```bash
git add COPY.md
git commit -m "Translate COPY.md to English"
```

---

### Task 12: Translate DESIGN.md to English

**Files:**
- Modify: `DESIGN.md` (currently 253 lines, French, see full text already
  read into context earlier in this session)

- [ ] **Step 1: Rewrite the file in English**, following the "Translation
  rules" section above. This is the largest file: preserve every section
  (`Dials`, `Thème`, `Couleurs`, `Les affiches`, `Le vocabulaire de formes`,
  `Les aplats pleine largeur`, `Les boutons`, `Typographie`, `Formes`,
  `Espacement`, `Mouvement`, `Interdits, liste opposable`, `Signature
  obligatoire`, `Logo`, `Chantier en cours`, the Next.js migration table),
  every color/token table with values unchanged (only the "Usage"/"Révélation"
  column text is translated), and every numeric constraint (pixel values,
  durations, easing curves, contrast ratios) copied verbatim, not
  re-derived. Do not translate CSS token names (`--bg`, `--signal`, etc.) or
  CSS property names (`transform`, `opacity`).

- [ ] **Step 2: Verify nothing else changed**

Run: `git diff --stat DESIGN.md`
Expected: only `DESIGN.md` listed.

- [ ] **Step 3: Commit**

```bash
git add DESIGN.md
git commit -m "Translate DESIGN.md to English"
```

---

### Task 13: Verify build still works after translation

**Files:** none (verification only)

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: exits 0, no TypeScript errors (translation only touched
`.md` files, not `app/`/`components/`/`lib/`, so this should be a no-op
change in outcome).

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: exits 0, static export succeeds.

- [ ] **Step 3: Confirm working tree is clean except intended commits**

Run: `git status`
Expected: `nothing to commit, working tree clean` (all 12 prior tasks were
already committed individually).

---

### Task 14: Push and configure the GitHub repo

**Files:** none (git/GitHub operations only)

- [ ] **Step 1: Push all commits**

```bash
git push origin main
```

- [ ] **Step 2: Update repo description and topics**

```bash
gh repo edit arnvudl/exposed. \
  --description "A Wrapped for your Instagram DMs, entirely in your browser. No server, no account, no tracking." \
  --add-topic nextjs --add-topic typescript --add-topic privacy --add-topic instagram
```

- [ ] **Step 3: Confirm with the user, then make the repo public**

This is the one externally-visible, effectively-irreversible step (anyone
can clone/index it once public, and reverting to private afterward doesn't
undo that). Ask explicitly before running:

```bash
gh repo edit arnvudl/exposed. --visibility public --accept-visibility-change-consequences
```

- [ ] **Step 4: Require the CI check before merging to `main`**

```bash
gh api repos/arnvudl/exposed./branches/main/protection \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[contexts][]=build" \
  -F "enforce_admins=true" \
  -F "required_pull_request_reviews=null" \
  -F "restrictions=null"
```

Note: the `contexts` value `build` must match the CI job name in
`.github/workflows/ci.yml` (Task 8) exactly. Verify after the first CI run
on GitHub that the check name shown in the Actions tab is `build`; if
GitHub displays it differently (e.g. prefixed with the workflow name),
update the branch protection context to match.

- [ ] **Step 5: Enable private vulnerability reporting**

```bash
gh api repos/arnvudl/exposed./vulnerability-alerts -X PUT
gh api -X PATCH repos/arnvudl/exposed. -f security_and_analysis.private_vulnerability_reporting.status=enabled
```

- [ ] **Step 6: Verify final state**

```bash
gh repo view arnvudl/exposed. --json visibility,description,repositoryTopics
```

Expected: `"visibility":"PUBLIC"`, description and topics as set in Step 2.

- [ ] **Step 7: Report back to the user**

Summarize what was pushed, confirm the repo is public, link to the Actions
tab so they can watch the first CI run.

---

## Manual follow-ups (cannot be scripted)

- If `gh repo edit --visibility public` requires an interactive confirmation
  prompt that the non-interactive shell can't answer, fall back to the
  `--accept-visibility-change-consequences` flag (included above); if that
  flag doesn't exist in the installed `gh` version, do this one step in the
  GitHub web UI instead (Settings → General → Danger Zone → Change
  visibility) and note that to the user.
- Confirm the repo name `exposed.` (trailing period) is intentional; it was
  confirmed via `gh repo view` during brainstorming but is worth a final
  sanity check with the user before the repo goes public under that name.
