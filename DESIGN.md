# Exposed. — DESIGN.md

Concept: **a confidential file being opened for you.** Not a dashboard, a document.
Mental references: investigation report cover, photocopied paper, "CONFIDENTIAL"
stamp, typewriter mono against a very wide grotesque for numbers.

## Dials

`DESIGN_VARIANCE: 7` · `MOTION_INTENSITY: 6` · `VISUAL_DENSITY: 3`

Preset "Premium consumer landing". The concept demands restraint: the variance lives
in the asymmetry of compositions, not in the number of effects.

## Theme

**Dark only, across the whole site, home page included.** This is an explicit
instruction from the product owner, not a missed light mode. The background never
changes from one page to another. No section inverts.

## Colors

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0D0B0A` | Background of every page. Black biased toward warm, never `#000`. |
| `--surface` | `#171412` | Minimal elevation, base of tinted cards. |
| `--text` | `#F4F1EC` | Main text. Off-white, never `#fff`. |
| `--muted` | `#8E8781` | Metadata. 4.6:1 ratio on the background, AA compliant. |
| `--line` | `#2C2724` | Borders, solid 1px. Never 0.5px. |
| `--paper` | `#F3EFE6` | **Rare surface.** Share cards, quotes, primary button. |
| `--ink` | `#141414` | Text on paper. |
| `--line-paper` | `#D9D3C6` | Borders on paper. |
| `--signal` | `#E8442A` | **Single accent.** Stamp, key numbers, underlines. |

Paper is never a page background: a light card used three times hits harder
than a whole page of it.

### The posters

Each reveal is a **flat-color poster**, not a dark card. Solid color
background, black ink on top, huge title, two or three flat shapes layered, and
the wordmark at the bottom. It's the only card form on the site: there's no more paper
tile, no more 8%-tinted card, no more color rule on a black background.

The poster is read on a phone first. Every composition decision is made at
320px wide, never on a desktop screen.

The eight hues are chosen to pass **4.5:1 against the `#141414` ink**, so the
poster's text is always black. No exception, no light text on color.

| Token | Value | Reveal |
|---|---|---|
| `--t1` | `#E8442A` | Your real inner circle |
| `--t2` | `#F0803C` | Your groups |
| `--t3` | `#5C8CEA` | Who doesn't follow you back |
| `--t4` | `#5FA85C` | What you actually say |
| `--t5` | `#BE7ACD` | *(free, used to be the inside-jokes reveal, chapter removed)* |
| `--t6` | `#E9BE3C` | Your five records |
| `--t7` | `#2F9AA8` | First and last |
| `--t8` | `#C4703A` | Your relationship profile |
| `--t9` `--t10` | `#E86FA0` `#A8BE49` | Type index |

Two utility colors: `--orange #F0803C` for the support action, `--vert #5FA85C`
for the privacy numbers, where green says "safe".

### The shape vocabulary

This is what fills the poster. A poster with a single small shape and lots of
empty space falls flat: color alone doesn't carry it, **layering** does.

Eight shapes, flat and geometric, all borrowed from the world of the case file, all in CSS.

| Shape | Description | Where it's used |
|---|---|---|
| Censor bar | Solid rectangle, 13 to 40px tall | Stacked in 3 or 4, uneven widths |
| Disc | Solid circle, from the logo | Repeated, different sizes, one spilling off a corner |
| Hatching | Diagonal photocopy hatch lines | In a beveled corner or across half the poster's background |
| Arc | Half-disc | Anchored on an edge, very large |
| Frame | Rectangle with 3px border | Frames the number, like a piece of evidence |
| Beam | Triangles from an edge | Photocopier light above the document |
| Halftone | Regular dots, `radial-gradient` | Zone background, never over text |
| Tab | Rectangular tab at the top | Cardboard folder tab |

**The five composition rules, mobile first.** The poster is drawn at 320px
wide and only grows from there. It's never recomposed for desktop.

1. **Two to three shapes per poster.** One fills nothing, four make noise.
2. **At least one shape overflows the frame**, cut by the edge. That's what gives
   the impression of an image larger than the poster.
3. **Scale contrast is mandatory**: one very large shape, at least a third of the
   height, and a small one next to it. Two medium shapes produce nothing.
4. **No empty band taller than 15% of the height.** Fill emptiness with a shape,
   never by enlarging the text.
5. **Text always sits above** and keeps its 4.5:1 against the flat color. A shape under
   text drops to `opacity: .25` maximum, or moves away.

**The free band is measured, not guessed.** On a mounted poster, the title
stops around 27% of the height and the number starts around 60%. The large shape
lives in that band. A shape overflowing it passes under text, and ink
at 55% under solid ink doesn't hold 4.5:1.

**Three depth levels, no more**: the flat color, the shapes, the text.

**Second tone allowed.** Ink at `.55` and `.25` counts as a tone. A second
color from the palette is allowed on a poster, never a third.

**Export constraint, don't forget it.** Every poster has to end up as a shareable
image. A shape that doesn't trivially redraw in a `canvas` or an SVG is forbidden,
however nice it looks in CSS. The eight shapes above all fit into a rectangle, a
circle, an arc, or a repetition: that's the test.

### The full-bleed flats

The last section switches to full-bleed solid red across the whole width. **Validated,
and it's the only mandatory flat color on the site.** That's what gives it its impact.

Elsewhere, go light. One second flat color at most on the whole home page, never
two in a row, and never in the top third. The impact of the final red comes from
its rarity: three flats and there's nothing left.

### Buttons

A **solid block** in bold display type, never a thin-bordered box. Two variants only:
`--signal` on a dark background, `--paper` on a colored background. Ink-colored text in both cases.

**One button per screen.** Two twin rectangles side by side are the most
recognizable signature of a generated page: the hero carries only one.

## Typography

Two families, not three.

- **Display**: `Bricolage Grotesque` 700/800. Titles and large numbers.
- **Mono**: `JetBrains Mono` 400/500. Dates, identifiers, counters, stamps.

Forbidden: `Inter`, `Fraunces`, `Instrument Serif`. No serif, no italic serif.
To emphasize a word in a title, use bold within the same family.

Tracking is a function of size, never a single value: `-0.04em` above
48px, `-0.02em` between 24 and 48px, `0` on body text. `tabular-nums` on any
number that might animate.

## Shapes

Radius **3px everywhere**, no exceptions. No pill shapes, no full radius, no
mixing radii. Solid 1px borders. One shadow allowed in the whole project:
the paper resting on black, `0 24px 48px -24px rgb(0 0 0 / .6)`.

Never a card inside a card. To group things, use empty space or a rule line.

## Spacing

Sections at `py-24` minimum, `py-32` by default. Content column at 1200px maximum,
680px for running text. Constant margins: it's the consistency that produces
the impression of quality, not the effects.

## Motion

**Scroll-driven: allowed and desired on the home page.** The user is the source
of the motion and controls it frame by frame.

**Autonomous: forbidden everywhere.** Nothing pulses, nothing floats, nothing scrolls
on its own, no looping banner, no blinking dot.

- Durations: 100 to 160ms for a press response, 150 to 250ms for a micro-interaction.
  **Inside the app, nothing exceeds 300ms.** The home page, which is marketing
  copy, can go up to 600ms.
- Curves: `--ease-out: cubic-bezier(.23,1,.32,1)` for any entrance or exit,
  `--ease-drawer: cubic-bezier(.32,.72,0,1)` for sliding surfaces, `ease` for
  hovers, `linear` for counters. **Never `ease-in` on interface elements.**
- `transform` and `opacity` only. Never `height`, never animated blur.
- Never `scale(0)`: an entrance starts at `0.94`.
- Maximum amplitude: 24px of translation on entrance, 3 degrees of rotation. No
  rotation below 768px, it creates touch-target conflicts.
- Never an exit animation on leaving the screen. One entrance, once, final.
- Three animated elements at most, simultaneously.
- Native scroll is never hijacked. No artificial smooth scrolling.
- Entrances go through `IntersectionObserver`, once, never on exit.
- **Deliberate exception for the two scroll-linked effects** (card straightening,
  reveal panning): they're driven by **a single `scroll` listener grouped
  by `requestAnimationFrame`, which only writes `transform`**. CSS
  `animation-timeline` is cleaner on paper and runs on the compositor, but it
  turns out inactive or frozen in several embedded contexts, without raising
  any error: the page just looks dead. Reliability wins over elegance here. Any
  other use of `scroll` stays forbidden.
- The page must be fully readable with no motion at all: `prefers-reduced-motion` and
  JavaScript disabled produce a complete page, in place.
- Frequency decides: whatever is seen dozens of times a day doesn't animate.
  *Start over* button, period selection, tab switching: instant.

## Forbidden, binding list

Background gradients, glows, colored shadows, pills, emojis in the interface, `Inter`,
serifs, italic serifs, nested cards, three equal cards side by side, fake
product previews built out of `div`s, hand-drawn icons, custom cursor,
labels under 12px, any text under 4.5:1.

**Em dash forbidden everywhere.** No `—`, no `–`, not in titles, not in the
body, not in labels, not in `alt` attributes. A plain hyphen, a comma, a period,
or a colon instead.

**Micro-labels in spaced caps: one maximum per three sections.** The title is enough.
A section's position on the page already categorizes it.

**Decorative section numbering forbidden** (`01 / INDEX`, `002 · Capabilities`).
The app's `01 / 08` counter is allowed: it's a real progression,
not a decoration.

**No invented social proof.** No client logos, no testimonials, no
user counter. Any number shown is either real, or marked as an example.

**No scroll hint** (`Scroll`, animated arrow, mouse wheel). No location, time,
or weather banner. No version label.

## Mandatory signature

Every screen must carry an element a generator wouldn't have produced: the
tilted red stamp, the red `o` in the logo, the paper card on black, or a dry line
of copy. If there's none, the screen isn't finished.

## Logo

Wordmark only: `exposed.` in lowercase, mono, the `o` replaced by a solid
red disc. No icon, nothing borrowed from Instagram.

## Work in progress, decided on September 3, 2026

What's left to do on the posters, in order. None of this is coded yet.

1. **Write the eight shapes** as reusable CSS classes, with size and
   overflow variants. It's a library, not eight one-offs.
2. **Recompose the eight posters** with two or three shapes each, scale contrast,
   one shape cut by the edge. No poster keeps a single centered shape.
3. **Bump up the poster's type scale**: the number is the largest element
   in the composition, the title comes next.
4. **Check by hand**, at 320 and 390px, before looking at anything at 1440.

### What the move to Next.js changes, and what it doesn't

| Subject | In HTML today | In Next.js after |
|---|---|---|
| The shapes | CSS classes | Identical, in a `Shape` component |
| The posters | Eight hand-written blocks | A `Poster` component and eight data objects |
| Scroll scrubbing | A listener grouped by `requestAnimationFrame` | A `useMotionValue`, never a `useState` |
| Image export | Not cleanly possible | The real subject, see below |

**Image export is the only real open question.** Rendering a CSS poster as a PNG
needs a library that reads back the DOM, and those libraries render gradients,
`clip-path`, and web fonts poorly. The reliable route is to redraw the poster in a
`canvas` at export time. That forces the shapes to stay simple, which is already the
constraint written above. To be settled before writing the share button.

**What we won't do**: no 3D, no WebGL, no heavy animation library. The page has
already been slowed down once by a 3D room, and the verdict was final.
