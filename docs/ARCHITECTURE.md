# Architecture

How Exposed. is built, for anyone about to touch the code. For design/copy
rules see [`../DESIGN.md`](../DESIGN.md) and [`../COPY.md`](../COPY.md); for
the full product plan see [`EXPOSED_BLUEPRINT.md`](EXPOSED_BLUEPRINT.md)
(French).

## The one-sentence version

A static Next.js site (`output: 'export'` in
[`../next.config.mjs`](../next.config.mjs)) with no backend and no API
routes: the browser reads a ZIP file, computes everything locally, and
renders the result. Nothing is sent anywhere, which is also why there's
nothing to configure to run it.

## Data flow

1. **Input.** The user picks their Instagram data export (one or more
   `.zip` files) on `/wrapped` ([`app/wrapped/`](../app/wrapped/)).
2. **Read.** [`lib/wrapped/zip.ts`](../lib/wrapped/zip.ts) streams the ZIP
   entries with `@zip.js/zip.js`. Large exports (Instagram can split them
   into several GB-sized parts) are handled per the plan in
   [`GROS_EXPORTS_MOBILE.md`](GROS_EXPORTS_MOBILE.md).
3. **Decode & parse.** [`decode.ts`](../lib/wrapped/decode.ts) and
   [`parse.ts`](../lib/wrapped/parse.ts) turn Instagram's JSON (which is
   Latin-1-mangled UTF-8, among other quirks) into typed `Conversation`
   objects, accumulating per-word counts as messages are ingested.
4. **Compute.** [`chapitres.ts`](../lib/wrapped/chapitres.ts) holds one pure
   function per reveal (conversations in, result out), each validated
   against a real export via `npm run analyse`
   ([`scripts/analyse.mts`](../scripts/analyse.mts)) before being wired into
   the UI. Today there are 7:
   - `chapitre01`: real inner circle (top people by message volume, flags
     anyone in your top 5 who isn't in your Instagram close friends list)
   - `chapitre02`: groups (activity, your share of each, roles like
     "most talkative" or "least present")
   - `chapitre03`: who doesn't follow you back (a set difference between
     your followers and following lists)
   - `chapitre04`: your most-used words (from your own sent messages)
   - `chapitre05`: five records (busiest day, slowest/fastest replies,
     latest message sent at night)
   - `chapitre06`: first and last message in the selected period
   - `chapitre07`: relationship profile (four axes: who starts
     conversations, how many people vs. how few, how fast, how long)
5. **Render.** [`app/wrapped/StoryPlayer.tsx`](../app/wrapped/StoryPlayer.tsx)
   drives the full-screen story format; each reveal renders as a poster via
   [`components/Affiche.tsx`](../components/Affiche.tsx), styled per
   `DESIGN.md`.
6. **Share.** [`lib/partage/`](../lib/partage/) redraws the chosen poster
   into a `<canvas>` at export time (`dessin.ts`, `rendu.ts`, `themes.ts`,
   `faits.ts`, `photo.ts`) rather than rasterizing the live DOM, per the
   spec in [`CARTES_PERSONNALISABLES.md`](CARTES_PERSONNALISABLES.md). This
   is why every visual shape in `DESIGN.md` has to be redrawable in a
   canvas or SVG.

All of the above runs client-side. There is no server component anywhere in
this flow.

## Folder map

| Path | What's in it |
|---|---|
| `app/` | Next.js App Router pages: `/` (home), `/wrapped` (the app), `/guide` (export walkthrough), `/faq`, legal pages (`/cgu`, `/confidentialite`, `/mentions-legales`), `/partage-test` (temporary manual test page for share cards) |
| `components/` | Shared UI: `Affiche` (poster), `Bouton`, `Nav`, `PageTexte`, `Pied` (footer), `Mouvement` (scroll-linked motion), `ListeProfils`, `RappelIcs` |
| `lib/wrapped/` | Everything from ZIP to computed reveals: `zip.ts`, `decode.ts`, `parse.ts`, `mapper.ts`, `chapitres.ts`, `analyser.ts`, `format.ts`, `lexique.ts`, `profil.ts` |
| `lib/partage/` | Share-card rendering: `dessin.ts`, `rendu.ts`, `themes.ts`, `faits.ts`, `photo.ts` |
| `scripts/analyse.mts` | Node script (`npm run analyse`) that runs the chapter functions against a real, local, gitignored export, to validate calculations outside the browser before wiring them into the UI |
| `data/` | Gitignored. Local real Instagram exports for manual testing, never committed |
| `docs/` | Internal planning docs (French) and this file. See [`README.md`](README.md) for a map |

## Why things are the way they are

- **Static export, not a Next.js server.** No API route can exist, which is
  the point: there's no code path that could accidentally receive user data.
- **A Web Worker for parsing** (see `app/wrapped/`) keeps the UI thread free
  while a multi-hundred-MB export is being read, and makes the "check the
  Network tab, nothing happens" claim in the README something a user can
  actually go verify.
- **Canvas-based share-card export**, not `html-to-image`-style DOM
  rasterization: those libraries render gradients, `clip-path`, and web
  fonts inconsistently. Redrawing in a `<canvas>` is more code but always
  looks right, and it's why `DESIGN.md` restricts every poster shape to
  something a canvas or SVG can draw trivially.
- **Pure functions per chapter**, validated against a real export via a
  Node script before touching the UI: the fastest way to catch a bug in
  arithmetic (this product's core promise per `COPY.md`: no AI, just
  counting and cross-referencing) is to run it against real data outside
  React, once, in a script.

## Local setup

See [`../CONTRIBUTING.md`](../CONTRIBUTING.md) for dev setup, lint, and
build commands.
