# Contributing to Exposed.

Thanks for wanting to help. Please read this before opening a pull request.

## Before you start

This project uses a [source-available license](LICENSE), not a permissive
open-source one: the owner retains commercial ownership. Contributions are
governed by the [Contributor License Agreement](CLA.md): by submitting a
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
