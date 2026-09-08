# Exposed.

> You might see some things. We show them.

A Wrapped for your Instagram DMs, running **entirely in your browser**.
You drop in your Instagram data export, you read your report, you share what you want.
No message ever leaves your machine: no account, no server, no tracking.

## Status

Pre-development. The full plan lives in **[docs/EXPOSED_BLUEPRINT.md](docs/EXPOSED_BLUEPRINT.md)**:
feasibility, pseudo-code for the 8 reveals, art direction, page tree,
monetization, and the security / legal / performance / SEO checklists.

## Non-negotiable principles

1. **Zero server for the data.** Parsing and analysis run in a Web Worker, client-side.
2. **Zero third-party script on `/wrapped`.** No ads, no analytics, no monitoring on the page that touches messages.
3. **Verifiable.** Anyone can open the Network tab during analysis and see that nothing happens.

## Target stack

Next.js · TypeScript · static export.

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
