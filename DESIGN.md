---
name: Nick J Stevens
description: A polished personal field notebook for essays, tools, and technical
  resources.
colors:
  clear-sky-blue: "#3b82f6"
  clear-sky-blue-deep: "#1d4ed8"
  clear-sky-blue-light: "#60a5fa"
  signal-violet: "#a855f7"
  exact-amber: "#f59e0b"
  warning-rose: "#fca5a5"
  night-slate: "#0f172a"
  deep-night: "#020617"
  slate-panel: "#1e293b"
  quiet-slate: "#94a3b8"
  pale-slate: "#e2e8f0"
  paper-frost: "#f8fafc"
  cloud-paper: "#f1f5f9"
  ink-slate: "#0f172a"
  body-slate: "#475569"
  porcelain-white: "#ffffff"
typography:
  display:
    fontFamily: "Atkinson, sans-serif"
    fontSize: "3.052em"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  headline:
    fontFamily: "Atkinson, sans-serif"
    fontSize: "2.441em"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Atkinson, sans-serif"
    fontSize: "1.25em"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "Atkinson, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Atkinson, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "18px"
  panel: "22px"
  pill: "999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.2rem"
components:
  icon-button:
    backgroundColor: "{colors.slate-panel}"
    textColor: "{colors.paper-frost}"
    rounded: "{rounded.pill}"
    size: "38px"
  tool-button:
    backgroundColor: "{colors.slate-panel}"
    textColor: "{colors.paper-frost}"
    rounded: "{rounded.lg}"
    padding: "0.7rem 1rem"
    height: "44px"
  post-card:
    backgroundColor: "{colors.slate-panel}"
    textColor: "{colors.paper-frost}"
    rounded: "{rounded.lg}"
    padding: "0.75rem"
  tag-pill:
    textColor: "{colors.paper-frost}"
    rounded: "{rounded.pill}"
    padding: "0.22rem 0.65rem"
  search-input:
    backgroundColor: "{colors.porcelain-white}"
    textColor: "{colors.ink-slate}"
    rounded: "{rounded.sm}"
    padding: "0.5em 0.75em"
---

# Design System: Nick J Stevens

## 1. Overview

**Creative North Star: "The Polished Field Notebook"**

This visual system should feel like a carefully kept personal field notebook:
clear enough for engineering notes, warm enough for reflective essays, and
polished enough to make a strong first impression. It is a brand system for an
independent thinker, not a corporate portfolio or generic content template.

The current implementation is dark-first, with a light mode available for long
reading. Night Slate surfaces, Clear Sky Blue accents, restrained shadows, and
Atkinson typography create a calm, technical, personal voice. The site should
feel clean, polished, and beautiful while keeping the texture of a real person
with varied interests.

The system rejects boring, cluttered, and corporate presentation. It also
rejects generic SaaS polish, dense academic CV styling, influencer-newsletter
tropes, and overproduced consultancy language.

**Key Characteristics:**

- Dark-first reading environment with a practical light-mode counterpart.
- Generous prose width, stable navigation, and unhurried page rhythm.
- Blue accent used for action, focus, active state, and technical emphasis.
- Rounded surfaces and ambient shadows used only to clarify hierarchy.
- Personal imagery and writing remain the main brand signal.

## 2. Colors

The palette is restrained and technical: Night Slate provides calm depth,
Clear Sky Blue marks action, and Paper Frost keeps the light theme readable.

### Primary

- **Clear Sky Blue** (`#3b82f6`): The main accent for links, active
  navigation, focusable controls, badges, and technical callouts.
- **Clear Sky Blue Deep** (`#1d4ed8`): Hover and strong-action state for
  light-theme accents.
- **Clear Sky Blue Light** (`#60a5fa`): Soft dark-theme emphasis, input
  borders, and highlighted technical controls.

### Secondary

- **Signal Violet** (`#a855f7`): Secondary color for the Priced In tool and
  graph-oriented surfaces. Use sparingly, paired with blue, never as a broad
  brand wash.

### Tertiary

- **Exact Amber** (`#f59e0b`): Key output state in engineering tools and
  calculation highlights.
- **Warning Rose** (`#fca5a5`): Error or warning copy in tools. It should
  appear only when the interface needs immediate attention.

### Neutral

- **Night Slate** (`#0f172a`): Primary dark surface and dark-theme header.
- **Deep Night** (`#020617`): Darkest page-depth stop and shadow anchor.
- **Slate Panel** (`#1e293b`): Secondary panel surface for cards, buttons, and
  soft containers.
- **Quiet Slate** (`#94a3b8`): Muted copy, dates, metadata, and secondary
  labels.
- **Pale Slate** (`#e2e8f0`): Dark-theme high-contrast neutral and table
  foreground.
- **Paper Frost** (`#f8fafc`): Lightest reading surface and dark-theme text.
- **Cloud Paper** (`#f1f5f9`): Light-mode secondary surface.
- **Ink Slate** (`#0f172a`): Light-theme primary text.
- **Body Slate** (`#475569`): Light-theme muted copy.
- **Porcelain White** (`#ffffff`): Existing light header and search surface.
  Future work should tint this slightly when redesigning core surfaces.

### Named Rules

**The Blue Rarity Rule.** Clear Sky Blue should mark links, active states, and
important tool feedback. It should not flood broad content surfaces.

**The Night-Then-Paper Rule.** Dark mode owns the default atmosphere; light mode
exists for comfortable reading and must preserve the same hierarchy.

## 3. Typography

**Display Font:** Atkinson with sans-serif fallback.
**Body Font:** Atkinson with sans-serif fallback.
**Label/Mono Font:** Atkinson with sans-serif fallback.

**Character:** Atkinson gives the site readable, humane precision. It supports
long essays, tool labels, and navigation without pretending to be either a
magazine or a developer terminal.

### Hierarchy

- **Display** (700, `3.052em`, `1.2`): Home, page, and article titles.
- **Headline** (700, `2.441em`, `1.2`): Major page sections and large prose
  headings.
- **Title** (700, `1.25em`, `1.2`): Cards, compact panels, and minor section
  headings.
- **Body** (400, `18px`, `1.6`): Long-form reading and page copy. Keep prose
  near 65 to 75 characters per line with `--container-prose` at `760px`.
- **Label** (700, `0.78rem`, `0.08em` tracking): Eyebrows, metric labels, and
  compact technical annotations. Use uppercase only for short labels.

### Named Rules

**The Reading First Rule.** Do not sacrifice body readability for visual drama.
Large type belongs to titles, not dense panels or buttons.

**The No Costume Mono Rule.** Do not add monospace type as a lazy signal for
engineering or technology. Atkinson is the project voice.

## 4. Elevation

Elevation is layered but restrained. The system uses borders, tonal surfaces,
and a small shadow vocabulary to separate navigation, images, cards, dropdowns,
and tool panels. Shadows should feel ambient, not glossy.

### Shadow Vocabulary

- **Ambient Site Shadow** (`0 12px 40px rgba(2, 6, 23, 0.35)`): Default
  dark-theme image, dropdown, table, and panel lift.
- **Ambient Light Shadow** (`0 12px 32px rgba(148, 163, 184, 0.2)`): Light
  theme equivalent for panels and images.
- **Tool Depth Shadow** (`0 18px 60px rgba(2, 6, 23, 0.38)`): Priced In and
  larger dashboard-like tool surfaces.
- **Search Popover Shadow** (`0 2px 8px rgba(15, 23, 42, 0.05)`): Small,
  practical floating result lists.

### Named Rules

**The Clarify, Never Decorate Rule.** Add depth only when it helps a visitor
understand layering, state, or affordance.

**The No Glass Default Rule.** Backdrop blur exists in the Priced In tool, but
it is not the default brand treatment for the main site.

## 5. Components

Components should feel quietly tactile and precise. They should support reading
and exploration without turning the personal site into a generic app shell.

### Buttons

- **Shape:** Round controls for icons (`999px`) and gently curved text buttons
  (`12px` to `14px`).
- **Primary:** Text and tool buttons use Slate Panel surfaces, Paper Frost
  text, `0.7rem 1rem` padding, and `44px` minimum height in tool contexts.
- **Hover / Focus:** Hover can lift by `translateY(-1px)` and shift borders
  toward Clear Sky Blue. Focus states must be visible and keyboard-safe.
- **Secondary / Ghost / Tertiary:** Header links are ghost controls with a
  transparent bottom border. Active state is a `2px` Clear Sky Blue underline.

### Chips

- **Style:** Tags are pill-shaped (`999px`) with a thin border and restrained
  padding.
- **State:** Tags are navigation aids, not badges for decoration. They should
  remain legible at compact sizes and wrap cleanly on small screens.

### Cards / Containers

- **Corner Style:** Main cards use `12px`; tool panels may use `22px` when
  they need a stronger instrument-panel presence.
- **Background:** Post cards use Slate Panel on dark mode and Cloud Paper on
  light mode through `--surface-alt`.
- **Shadow Strategy:** Cards are mostly border-led. Tool panels and hero images
  may use Ambient Site Shadow.
- **Border:** Use the shared `--border` token. Do not add colored side stripes.
- **Internal Padding:** Post cards use `0.75rem`; tool panels use `1rem` to
  `1.2rem`.

### Inputs / Fields

- **Style:** Search and numeric tool fields use clear borders, compact padding,
  and rounded corners. Search currently uses a Porcelain White surface.
- **Focus:** Focus removes the browser default outline only when replaced with
  a visible border or ring treatment.
- **Error / Disabled:** Error panels use Warning Rose text and a darker red
  background mix. Disabled states should lower contrast without hiding labels.

### Navigation

The header is sticky, dark-first, and utilitarian. Brand name sits left, content
routes sit in a compact row, and social/theme controls sit as circular icon
buttons. Mobile navigation collapses into a menu button and stacked panel. The
active route is always shown with a Clear Sky Blue underline.

### Signature Component

The Richardson Extrapolation tool is the strongest custom component. It uses
large rounded tool panels, metric cards, amber key-output emphasis, and inline
help controls. It should remain precise, legible, and engineering-led.

## 6. Do's and Don'ts

### Do

- **Do** preserve the personal brand direction: clean, polished, beautiful.
- **Do** use Clear Sky Blue for action, active state, and technical emphasis.
- **Do** keep prose near `760px` and prioritize long-form readability.
- **Do** use Atkinson consistently across writing, navigation, and tools.
- **Do** use personal imagery decisively on articles and the home page.
- **Do** keep cards and panels useful: post previews, tools, dropdowns, and
  search results.
- **Do** protect keyboard navigation for menus, search, theme toggle, and
  interactive tools.

### Don't

- **Don't** make the site feel boring, cluttered, or corporate.
- **Don't** drift into generic SaaS polish, dense academic CV presentation,
  influencer-newsletter tropes, or consultancy brochure language.
- **Don't** use colored `border-left` or `border-right` stripes as accents.
- **Don't** use gradient text, decorative glassmorphism, or hero-metric
  templates.
- **Don't** make identical card grids the dominant expression of the brand.
- **Don't** use monospace as a costume for technical authority.
- **Don't** let tool surfaces overpower the reading and personal publishing
  purpose of the site.
