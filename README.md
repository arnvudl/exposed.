# Exposed.

> You might see some things. We show them.

[![CI](https://github.com/arnvudl/exposed./actions/workflows/ci.yml/badge.svg)](https://github.com/arnvudl/exposed./actions/workflows/ci.yml)
[![License: source-available](https://img.shields.io/badge/license-source--available-blue)](LICENSE)

A Wrapped for your Instagram DMs, running **entirely in your browser**.
You drop in your Instagram data export, you read your report, you share what you want.
No message ever leaves your machine: no account, no server, no tracking.

## What it is

Instagram will hand you a full export of your data on request: every message, every
follower, every group you're in. Exposed reads that export locally and turns it into a
report about your relationships, your vocabulary, and your habits. Not a dashboard you
operate: a document you scroll through and read, once.

## The report

Seven reveals, computed from your own export (see
[`lib/wrapped/chapitres.ts`](lib/wrapped/chapitres.ts)):

1. **Your real inner circle.** Who you actually message the most, and whether they're
   in your Instagram close friends list.
2. **Your groups.** How active each group chat is, and your role in it.
3. **Who doesn't follow you back.** A straight comparison of your followers and following lists.
4. **Your words.** The words you use the most, from your own messages.
5. **Your five records.** Busiest day, slowest and fastest replies, latest message sent at night.
6. **First and last.** The first and the last message in the period you pick.
7. **Your relationship profile.** Four axes (who starts conversations, how many people,
   how fast, how long) combined into a one-line type.

No AI, no predictive algorithm: counting, sorting, and cross-referencing lists. See
[`COPY.md`](COPY.md) for why that's stated plainly instead of dressed up.

## Non-negotiable principles

1. **Zero server for the data.** Parsing and analysis run in a Web Worker, client-side.
2. **Zero third-party script on `/wrapped`.** No ads, no analytics, no monitoring on the page that touches messages.
3. **Verifiable.** Anyone can open the Network tab during analysis and see that nothing happens.

## How it works

Next.js, exported as a static site: no API routes exist, so there's no code path that
could send your data anywhere. Full data flow, folder map, and the reasoning behind the
key technical choices are in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Status

Pre-development. The full product plan lives in
**[docs/EXPOSED_BLUEPRINT.md](docs/EXPOSED_BLUEPRINT.md)**: feasibility, pseudo-code for
each reveal, art direction, page tree, monetization, and the security / legal /
performance / SEO checklists.

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run lint      # tsc --noEmit
npm run build     # static export (next build)
```

## Docs

| Doc | What it covers |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Codebase structure and data flow |
| [`docs/EXPOSED_BLUEPRINT.md`](docs/EXPOSED_BLUEPRINT.md) | Full product plan (French) |
| [`DESIGN.md`](DESIGN.md) | Visual design system |
| [`COPY.md`](COPY.md) | Copywriting rules |
| [`docs/README.md`](docs/README.md) | Map of everything else under `docs/` |

## Contributing

Outside contributions are welcome. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) first,
including the [Contributor License Agreement](CLA.md) it links to: this project isn't
under a standard permissive license, see below.

## License

Source-available, not open-source in the OSI sense: the code is public to read, fork,
and test locally, but commercial use and redistribution need the owner's permission, and
contributions are governed by a CLA. Full terms in [`LICENSE`](LICENSE) and
[`CLA.md`](CLA.md).

## Design skills

The project relies on third-party skills, not versioned here (see `skills-lock.json`):

```bash
npx skills add Leonxlnx/taste-skill
```
```bash
npx skills add emilkowalski/skill
```

---

Exposed is not affiliated with Instagram or Meta. Instagram is a trademark of Meta Platforms, Inc.
