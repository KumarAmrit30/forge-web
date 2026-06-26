# Forge Design System

Source of truth for the Forge visual language after Sprint 2 (Home + Today freeze).  
All future screens must follow these tokens and patterns — do not introduce parallel styling systems.

---

## Colors

Forge uses a dark-first palette with emerald as the primary accent. Values are defined in `src/app/globals.css` as OKLCH CSS variables.

### Primary Emerald

| Token | Dark value | Usage |
|-------|------------|-------|
| `--primary` | `oklch(0.72 0.15 160)` | CTAs, active nav, journey current node, progress rings |
| `--primary-foreground` | `oklch(0.12 0.005 260)` | Text on emerald fills |
| `--accent` | same as primary | Hover accents, chart highlights |
| `--ring` | same as primary | Focus rings |

Brand hex equivalent: `#10B981` (Storyset recolor target).

### Background

| Token | Dark value | Usage |
|-------|------------|-------|
| `--background` | `oklch(0.12 0.005 260)` | Page background |
| `--surface-0` | same as background | Base layer |
| `--surface-1` | `oklch(0.16 0.008 260)` | Elevated panels |
| `--surface-2` | `oklch(0.20 0.01 260)` | Nested surfaces |
| `--surface-3` | `oklch(0.24 0.012 260)` | Deepest nested layer |
| `--glass` | `oklch(0.18 0.01 260 / 60%)` | Legacy glass cards (Settings, Calendar, Progress) |

### Surface (Home cards)

Home and Today premium cards use gradient overlays via `HomeSurfaceCard`:

- **Mission**: `from-white/[0.06] via-white/[0.025] to-transparent`, border `white/[0.09]`
- **Insight**: `from-white/[0.04] via-white/[0.015] to-transparent`, border `white/[0.06]`
- **Progress**: `from-white/[0.03] via-transparent to-transparent`, border `white/[0.04]`

### Text

| Token | Dark value | Usage |
|-------|------------|-------|
| `--foreground` | `oklch(0.96 0 0)` | Primary body and headings |
| `--card-foreground` | same | Text on cards |

Headlines on Home/Today Focus use `text-white` explicitly for serif titles.

### Muted Text

| Token | Dark value | Usage |
|-------|------------|-------|
| `--muted-foreground` | `oklch(0.62 0.01 260)` | Subtitles, supporting copy, completed journey labels |

Common utility overrides:

- `text-muted-foreground/80` — secondary subtitles
- `text-muted-foreground/75` — Today Forge Noticed whisper
- `text-muted-foreground/60` — progress footer
- `text-foreground/45` — upcoming journey steps (Today)

### Borders

| Token | Usage |
|-------|-------|
| `--border` | `oklch(1 0 0 / 8%)` — default borders |
| `border-white/[0.09]` | Mission card edge |
| `border-white/[0.06]` | Insight card edge |
| `border-white/[0.04]` | Progress card edge |
| `border-white/[0.03]` | Today quiet dividers (Insight, Progress footer) |
| `border-dashed border-white/10` | Journey timeline connector |

### Success / Warning / Error

| Role | Value | Usage |
|------|-------|-------|
| Success | `--primary` (emerald) | Completed states, positive deltas |
| Warning | `amber-500` | Calendar mid scores, heat indicators |
| Error | `--destructive` `oklch(0.704 0.191 22.216)` | Destructive actions, low scores |

---

## Typography

### Font families

| Role | Family | CSS variable | Tailwind |
|------|--------|--------------|----------|
| Headlines | Instrument Serif | `--font-instrument-serif` | `font-serif` |
| Body | Geist Sans | `--font-geist-sans` | `font-sans` (default) |
| Mono | Geist Mono | `--font-geist-mono` | `font-mono` |

Loaded in `src/app/layout.tsx`. Root `<html>` applies Geist Sans by default.

### Sizes

| Element | Size | Component |
|---------|------|-----------|
| Hero name | `40px` | Home `HeroSection` |
| Focus / Mission title | `26–28px` serif | `TodayFocusCard`, `MissionCard` |
| Section body | `15px` | Hero brief lines |
| Standard body | `text-sm` (14px) | Subtitles, Next card |
| Whisper body | `13px` | Today Insight, Next supporting line |
| Section labels | `10px` / `9px` uppercase | `HomeSectionLabel` |
| Progress footer | `text-xs` (12px) | `TodayProgress` |

### Weights

- Headlines: `font-normal` (serif) or implicit medium on journey current step
- Section labels: `font-semibold`
- CTA buttons: `font-semibold`
- Body: default (400)

### Line heights

- Headlines: `leading-tight` or `leading-none`
- Body: `leading-normal` or `leading-snug` for compact whisper text

### Letter spacing

- Serif headlines: `tracking-[-0.01em]` (`homeSerif`) or `tracking-[-0.02em]` (hero)
- Section labels: `tracking-[0.2em]` default, `tracking-[0.18em]` small

### Usage rules

1. **Instrument Serif** — emotional headlines only (hero name, mission title, focus card title). Never for body paragraphs or labels.
2. **Geist Sans** — all UI chrome, labels, body copy, buttons.
3. **Uppercase emerald labels** — section headers via `HomeSectionLabel` only. Do not hand-roll label styles.
4. **No arbitrary font sizes** outside the established scale without design review.

---

## Spacing

### Grid

8px base grid. Prefer multiples of 4 and 8.

### Padding scale

| Context | Padding |
|---------|---------|
| Page horizontal | `px-6` |
| Page top | `pt-6` |
| Mission / Focus card | `px-6 py-4` (Today) or `py-6` (Home mission) |
| Insight card (Home) | `px-6 py-5` |
| Workspace panels | `px-6 py-5` |
| Legacy GlassCard | `p-4` to `p-6` (Settings, Calendar) |

### Margins & section spacing

| Gap | Usage |
|-----|-------|
| `mt-8` | Major section breaks (Journey, Home Insight) |
| `mt-6` | Today Insight, Progress footer |
| `mt-5` | Next section (Today) |
| `mb-4` / `mb-6` | Section label to content |
| `gap-3` / `gap-4` | Internal card spacing |

### Card spacing

- Focus card internal: `gap-3`
- Journey list items: `pb-8`, `gap-4`
- CTA top margin: `mt-3` with surrounding whitespace (Today)

---

## Border Radius

| Element | Radius |
|---------|--------|
| Home / Today surface cards | `rounded-[24px]` |
| Legacy glass cards | `rounded-2xl` (16px) |
| Buttons (pill CTA) | `rounded-full` |
| Journey nodes | `rounded-full` (20px diameter) |
| Quick action chips | `rounded-full` |
| Inputs | `--radius` (0.625rem) via shadcn tokens |
| Dialogs / sheets | `rounded-2xl` |

Token scale: `--radius-sm` through `--radius-4xl` derived from `--radius: 0.625rem`.

---

## Elevation

Defined in `HomeSurfaceCard` (`src/components/home/home-ui.tsx`).

### Mission

Highest prominence. Focus card, Home mission card.

- Inset highlight + deep drop shadow
- Optional ambient glow blob behind card (`bg-primary/[0.06]` blur)

### Insight

Mid prominence. Home Forge Noticed card.

- Lighter gradient and inset highlight
- No heavy outer shadow

### Progress

Lowest card elevation. Home progress summary.

- Minimal gradient, subtle border

### Footer (Today)

No card wrapper. `TodayProgress` uses a top border divider only — almost invisible.

### Glow rules

- Primary CTA: `shadow-[0_0_16px_-6px_oklch(0.72_0.15_160/0.35)]`
- CTA hover: `shadow-[0_0_20px_-4px_oklch(0.72_0.15_160/0.4)]`
- Home circle action: stronger glow (`0_0_24px`)
- Hero / Focus ambient: large blurred circles at `primary/[0.06–0.13]`
- Nav active icon: `drop-shadow-[0_0_8px_oklch(0.72_0.15_160/0.45)]`

### Shadow rules

- Prefer inset highlights on premium cards over heavy drop shadows
- No gamification badges or celebration shadows
- Legacy `GlassCard` uses `border-border/50 bg-card/40 backdrop-blur` — for Settings, Calendar, Progress only

---

## Motion

Central easing: `easeOut = [0, 0, 0.2, 1]` exported from `src/components/home/motion.ts`.

### Durations

| Duration | Usage |
|----------|-------|
| 200–350ms | Fade, card enter, journey item |
| 400–450ms | Section reveals, focus card morph |
| 500ms | Progress ring / bar fill |
| 2.6–2.8s | Current journey node pulse (infinite) |
| 7s | Illustration float (infinite) |

### Ease curves

- **Always ease-out** for entrances and exits: `ease: easeOut` or `ease: [0, 0, 0.2, 1]`
- **No spring animations** — policy for Sprint 2 freeze
- Float animation uses `easeInOut` for ambient drift only

### Interactions

| Interaction | Behavior |
|-------------|----------|
| Hover (CTA) | `-translate-y-0.5`, glow intensifies |
| Tap (CTA) | `active:scale-[0.97]` |
| Hover (circle action) | `-translate-y-0.5`, arrow nudge |
| Tap (chips) | `active:scale-95` |
| Nav indicator | `layoutId` slide, 300ms ease-out |

### Fade

- Page sections: `opacity: 0 → 1` with optional `y: 8–16`
- Focus card activity change: `AnimatePresence mode="wait"`, fade + slight vertical shift

### Layout transitions

- Today Journey: `LayoutGroup` + `layout` on list items and nodes
- Bottom nav: shared `layoutId="nav-indicator"`
- Workspace reveal: `height: 0 → auto` + opacity, 400ms

---

## Cards

### When to use each

| Card | Component | When |
|------|-----------|------|
| **Home card** | `HomeSurfaceCard elevation="mission"` | Home mission CTA |
| **Focus card** | `HomeSurfaceCard elevation="mission"` | Today current activity — preview + CTA |
| **Insight** | `HomeSurfaceCard elevation="insight"` (Home) / border-only section (Today) | AI observation — supportive, not primary |
| **Progress** | `HomeSurfaceCard elevation="progress"` (Home) / footer strip (Today) | Day completion summary |
| **Journey** | No card — timeline list with nodes | Step sequence and status |
| **Execution workspace** | `HomeSurfaceCard elevation="insight"` | Hidden until CTA — full activity interaction |
| **GlassCard** | `GlassCard` | Legacy screens: Settings, Calendar, Progress, Blueprint, Workout panel |

### Home card

Mission card with illustration, serif title, circular arrow CTA. Links to `/today`.

### Focus card

Living workspace preview: 2–3 upcoming items, never full checklist. Calm pill CTA. Morphs on activity change via `key={stepId}`.

### Journey

- **Completed**: filled emerald circle + check icon, muted label
- **Current**: emerald outline + soft pulse, brighter text (`text-white font-medium`)
- **Upcoming**: gray outline, reduced opacity (`text-foreground/45`)

Node size: 20px. Connector: dashed vertical line at `left: 10px`.

---

## Illustrations

### Storyset usage

- Style: **Amico** (primary), recolored to Forge emerald `#10B981`
- Catalog: `docs/assets-manifest.json`, paths via `assetPublicPath()` in `src/lib/asset-catalog.ts`
- Full library kept in `public/assets/illustrations/` for future screens

### Sizing

| Context | Size |
|---------|------|
| Home hero | ~168–176px height |
| Home mission thumb | 96px |
| Today focus | `h-28`, max-width 200px |
| Home insight | 64px |
| Today insight (whisper) | 28px |
| Next preview icon | 32px |

### Treatment

- `object-contain` always
- No illustration borders or frames
- Opacity reduced for whisper contexts (`opacity-50–60`)

### Floating animation

```tsx
animate={{ y: [0, -3, 0] }}  // or -4 for hero
transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
```

Subtle vertical drift — never bouncy or spring-based.

---

## Component reference

| Primitive | Location |
|-----------|----------|
| Section labels | `HomeSectionLabel` — `src/components/home/home-ui.tsx` |
| Surface cards | `HomeSurfaceCard` — elevations `mission`, `insight`, `progress` |
| Circle CTA | `HomeCircleAction` — Home mission only |
| Serif class | `homeSerif` — `font-serif tracking-[-0.01em]` |
| Motion easing | `easeOut` — `src/components/home/motion.ts` |
| Legacy glass | `GlassCard` — `src/components/shared/GlassCard.tsx` |

---

## Screen hierarchy (Today — frozen)

```
RIGHT NOW
→ Focus Card (living preview + CTA)
→ Next (quiet guidance)
→ Today's Journey (animated timeline)
→ Forge Noticed (whisper)
→ Today's Progress (footer)
→ Execution Workspace (hidden until CTA)
```

Progressive disclosure: detailed interactions live in the workspace, not the focus card.

---

*Last updated: Sprint 2 foundation freeze (`v0.3-foundation-freeze`)*
