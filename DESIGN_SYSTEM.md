# Workouter Design System v0.1

> Source of truth for implementing Workouter UI. Tokens, type, components, patterns, and code — copy-pasteable.
> Original: https://claude.ai/design/p/019de0ba-8e0d-7424-a71a-2ead1bc2acb4?file=Workouter+Design+System.html

---

## Brand in one paragraph

Workouter helps people build structured Apple Watch and Garmin workouts in a web app. The design is approachable, calm, and confident — Linear-restraint, not Strava-shouting. Block-based UI. Two surfaces (light + dark). One configurable accent the user picks for themselves.

## Principles

1. **Restraint over exuberance.** The data is the hero. Color is a signal, not a decoration.
2. **Approachable to everyone.** Copy avoids gym-bro tropes ("CRUSH IT", "GO HARD"). Visual energy comes from typography and composition, not aggression.
3. **Block-based mental model.** A workout is a stack of steps. Steps are the atomic unit; the UI reinforces that everywhere.
4. **Numbers matter.** Pace, HR, intervals — these get monospaced numerals so they line up and feel instrument-grade.
5. **Light + dark, day one.** Both surfaces are first-class. Don't ship one without the other.

---

## 01 · Logo

The third bar of the mark carries the accent color — that's the only place the accent appears in the logo lockup.

**SVG construction:**
```svg
<svg width="56" height="56" viewBox="0 0 56 56">
  <rect x="6" y="6" width="44" height="10" fill="var(--fg)" />
  <rect x="6" y="20" width="32" height="10" fill="var(--fg)" />
  <rect x="6" y="34" width="20" height="10" fill="var(--accent)" />
</svg>
```

**Don'ts:**
- Don't recolor the upper bars — only the third (shortest) bar carries the accent
- No gradients or strokes — solid fills only
- Don't skew or rotate — bars stay horizontal and left-aligned
- Wordmark is always Archivo 800 (ExtraBold)

---

## 02 · Color

Two surfaces (light + dark), one configurable accent. Neutrals are locked. The accent is set per-user in account settings.

### Light surface
| Token | Value |
|---|---|
| `--bg` | `#FAFAF7` |
| `--panel` | `#FFFFFF` |
| `--panel-alt` | `#F2F1EC` |
| `--border` | `#E5E4DF` |
| `--border-strong` | `#0E0F11` |
| `--fg` | `#0E0F11` |
| `--fg-soft` | `#3A3B3D` |
| `--muted` | `#7A7A75` |

### Dark surface
| Token | Value |
|---|---|
| `--bg` | `#0B0D0F` |
| `--panel` | `#161A1F` |
| `--panel-alt` | `#1F242B` |
| `--border` | `#262B33` |
| `--border-strong` | `#3A4049` |
| `--fg` | `#E8EAED` |
| `--fg-soft` | `#C4C7CC` |
| `--muted` | `#9CA3AF` |

### Accents (user-configurable)
| Name | id | Hex |
|---|---|---|
| Hot Coral (DEFAULT) | `coral` | `#FF4D6D` |
| Signal Orange | `orange` | `#FF5C26` |
| Ultraviolet | `violet` | `#7C3AED` |

### CSS variables (paste into global stylesheet)
```css
:root {
  /* light (default) */
  --bg: #FAFAF7;
  --panel: #FFFFFF;
  --panel-alt: #F2F1EC;
  --border: #E5E4DF;
  --border-strong: #0E0F11;
  --fg: #0E0F11;
  --fg-soft: #3A3B3D;
  --muted: #7A7A75;
  /* accent — user-selected, falls back to coral */
  --accent: #FF4D6D;
  --accent-fg: #FFFFFF; /* text/icon ON the accent */
  /* type */
  --display: 'Archivo Black', sans-serif;
  --body: 'Inter', sans-serif;
  --mono: 'JetBrains Mono', monospace;
}
[data-theme="dark"] {
  --bg: #0B0D0F;
  --panel: #161A1F;
  --panel-alt: #1F242B;
  --border: #262B33;
  --border-strong: #3A4049;
  --fg: #E8EAED;
  --fg-soft: #C4C7CC;
  --muted: #9CA3AF;
  --accent-fg: #0B0D0F; /* dark text on accent in dark mode */
}
[data-accent="coral"]  { --accent: #FF4D6D; }
[data-accent="orange"] { --accent: #FF5C26; }
[data-accent="violet"] { --accent: #7C3AED; }
```

### Accent usage rules
- **One accent moment per screen** — Primary CTA, the active step's left-border, the live tab indicator.
- **Never tint backgrounds** — Accent never fills a panel or page background. It's a pointer, not a wash.
- **Use for state, not decoration** — Active, selected, sending, in-progress.
- **Never tint body text** — Body copy stays neutral. Accent is for headings or punctuation only (e.g. the period in "Tempo Tuesday.").

---

## 03 · Type

Three families: Archivo Black for display, Inter for body, JetBrains Mono for utility and numbers. Specific sizes only — no in-between.

| token | family | size/weight | line-height / tracking | usage |
|---|---|---|---|---|
| `display-xl` | Archivo Black | 72 / 900 | 0.95 / -2px | Hero moments |
| `display-lg` | Archivo Black | 48 / 900 | 1 / -1.5px | Page titles |
| `display-md` | Archivo Black | 32 / 900 | 1.05 / -1px | Section titles |
| `heading` | Inter | 22 / 700 | 1.2 / -0.4px | Sub-heads |
| `body-lg` | Inter | 17 / 400 | 1.5 / 0 | Lead copy |
| `body` | Inter | 14 / 400 | 1.55 / 0 | Default copy |
| `label` | Inter | 12 / 600 | 1.4 / 0.2px | Form labels |
| `utility` | JetBrains Mono | 11 / 500 | 1.4 / 1.2px | STEP 02 · TEMPO |
| `numeric-lg` | JetBrains Mono | 32 / 700 | 1 / 0 | 138 bpm |
| `numeric` | JetBrains Mono | 14 / 500 | 1.4 / 0 | 4:30/km |

**Rules:**
- `display-*` only for hero moments — page titles, big numbers. Not nav, sub-titles, or sub-section heads.
- `utility` is always uppercase. Write the text uppercase in source (not CSS) for SEO/screen-reader correctness.
- `numeric-*` uses tabular figures: always set `font-feature-settings: "tnum"`.

### Type CSS
```css
.text-display-xl  { font: 900 72px/0.95 var(--display); letter-spacing: -2px; }
.text-display-lg  { font: 900 48px/1 var(--display); letter-spacing: -1.5px; }
.text-display-md  { font: 900 32px/1.05 var(--display); letter-spacing: -1px; }
.text-heading     { font: 700 22px/1.2 var(--body); letter-spacing: -0.4px; }
.text-body-lg     { font: 400 17px/1.5 var(--body); }
.text-body        { font: 400 14px/1.55 var(--body); }
.text-label       { font: 600 12px/1.4 var(--body); letter-spacing: 0.2px; }
.text-utility     { font: 500 11px/1.4 var(--mono); letter-spacing: 1.2px; text-transform: uppercase; }
.text-numeric-lg  { font: 700 32px/1 var(--mono); font-feature-settings: "tnum"; }
.text-numeric     { font: 500 14px/1.4 var(--mono); font-feature-settings: "tnum"; }
```

---

## 04 · Spacing, Radius, Shadow

4px-base scale. Use these tokens for every gap, padding, and margin — no arbitrary values.

| Token | Value |
|---|---|
| `--space-0` | `0px` |
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `24px` |
| `--space-6` | `32px` |
| `--space-7` | `48px` |
| `--space-8` | `64px` |
| `--space-9` | `96px` |

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `3px` | Tags, micro-pills |
| `--radius-md` | `6px` | Buttons, inputs, step blocks |
| `--radius-lg` | `8px` | Cards, modals |
| `--radius-xl` | `12px` | Page-level surfaces |

| Token | Value | Usage |
|---|---|---|
| `--shadow-none` | `none` | Default. Most surfaces are flat. |
| `--shadow-raise-1` | `0 1px 2px rgba(14,15,17,0.06)` | Lifted card on busy background |
| `--shadow-raise-2` | `0 4px 12px rgba(14,15,17,0.08)` | Floating elements (popovers, dropdowns) |
| `--shadow-raise-3` | `0 12px 32px rgba(14,15,17,0.12)` | Modals, drag-state of a step |

---

## 05 · Components

### Button
Three variants: primary (accent — only one per screen), secondary (outlined, fg color), ghost (subtle outline).

```html
<button class="btn btn-primary">SEND TO WATCH →</button>
<button class="btn btn-secondary">SAVE DRAFT</button>
<button class="btn btn-ghost">CANCEL</button>
```
```css
.btn {
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font: 500 13px/1 var(--display);
  letter-spacing: 0.5px;
  cursor: pointer;
}
.btn-primary   { background: var(--accent); color: var(--accent-fg); border: 0; }
.btn-secondary { background: transparent; color: var(--fg); border: 1.5px solid var(--fg); }
.btn-ghost     { background: transparent; color: var(--fg); border: 1px solid var(--border); }
```

### Tag
Two variants: outline (default, neutral) and filled (accent). Always uppercase, monospaced.

### Step block
The atomic unit of a workout. Always has a 4px left-border in the accent color. Active state thickens the surrounding border too.

Anatomy: utility-style label at top-left, numeric goal at top-right, body metric description below.

```tsx
// StepBlock.tsx
type Props = { n: number; label: string; goal: string; metric: string; active?: boolean; };

export function StepBlock({ n, label, goal, metric, active }: Props) {
  return (
    <div className={`bg-panel border rounded-md p-3 border-l-4 border-l-accent ${active ? 'border-accent' : 'border-border'}`}>
      <div className="flex justify-between items-baseline">
        <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
          {String(n).padStart(2, '0')} · {label}
        </span>
        <span className="font-mono text-xs text-fg font-semibold tabular-nums">
          {goal}
        </span>
      </div>
      <p className="text-[13px] text-fg-soft mt-1">{metric}</p>
    </div>
  );
}
```

### Input
Mono utility-style label above. Body-sized value. Optional mono suffix for unit.

---

## 06 · Patterns

### Workout title block
Always: small utility eyebrow → large display-lg title with accent period → tag row.

The accent period is a Workouter signature — it signals "this object has the accent color attached to it."

```
RUN — TEMPO
Tempo Tuesday.
[RUN] [TEMPO] [READY]
```

### Effort over time chart
Used in builder + workout detail. Bar widths proportional to step duration. Bar height = effort intensity.
- Active sets → `--accent`
- Recoveries → `--muted`
- Warmup/cooldown → `--fg-soft`

### Workout card (discover/library)
Compact card for browsing: small accent square with step count → name + author + duration → optional new/saved tag.

### Workout list row (editorial)
Roman numeral → name + italic description → numeric goal. Underline borders only — no left-border accent.

---

## 07 · Voice & Copy

Workouter is a knowledgeable friend who runs. Not your trainer barking commands, not a wellness app whispering affirmations. Direct, specific, and warm. Confident enough to use a period instead of an exclamation point.

| ✓ DO | ✗ DON'T |
|---|---|
| "Send to watch" · "4 cuts at threshold" | "CRUSH IT" · "BEAST MODE" |
| "Build your workout" · "Pick a goal for each step" | "Let's do this together!" |
| "Workout sent." · "Saved to library." | "Workout sent!" · "Nice job!!" |

**Buttons:** Always Archivo Black, uppercase, with directional arrow on primary CTAs.
- DO: "SEND TO WATCH →" · "ADD STEP →" · "PICK A GOAL →"
- DON'T: "SEND" · "ADD" · "GO"

**Empty states:**
- DO: "No workouts yet. Build your first one →"
- DON'T: "Looks like it's empty in here :("

---

## 08 · Code Starter Pack

### 1. Fonts (in `<head>`)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800;900&family=Archivo+Black&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

### 2. Global CSS variables
```css
:root {
  --display: 'Archivo Black', sans-serif;
  --body: 'Inter', sans-serif;
  --mono: 'JetBrains Mono', monospace;
  --bg: #FAFAF7; --panel: #FFFFFF; --panel-alt: #F2F1EC;
  --border: #E5E4DF; --border-strong: #0E0F11;
  --fg: #0E0F11; --fg-soft: #3A3B3D; --muted: #7A7A75;
  --accent: #FF4D6D; --accent-fg: #FFFFFF;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px; --space-9: 96px;
  --radius-sm: 3px; --radius-md: 6px; --radius-lg: 8px; --radius-xl: 12px;
}
[data-theme="dark"] {
  --bg: #0B0D0F; --panel: #161A1F; --panel-alt: #1F242B;
  --border: #262B33; --border-strong: #3A4049;
  --fg: #E8EAED; --fg-soft: #C4C7CC; --muted: #9CA3AF;
  --accent-fg: #0B0D0F;
}
[data-accent="coral"]  { --accent: #FF4D6D; }
[data-accent="orange"] { --accent: #FF5C26; }
[data-accent="violet"] { --accent: #7C3AED; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 400 14px/1.55 var(--body); }
```

### 3. Tailwind config
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)', panel: 'var(--panel)', 'panel-alt': 'var(--panel-alt)',
        border: 'var(--border)', 'border-strong': 'var(--border-strong)',
        fg: 'var(--fg)', 'fg-soft': 'var(--fg-soft)', muted: 'var(--muted)',
        accent: 'var(--accent)', 'accent-fg': 'var(--accent-fg)',
      },
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        sans:    ['Inter', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: { sm: '3px', md: '6px', lg: '8px', xl: '12px' },
      spacing: {
        1: '4px', 2: '8px', 3: '12px', 4: '16px',
        5: '24px', 6: '32px', 7: '48px', 8: '64px', 9: '96px',
      },
    },
  },
};
```

### 4. Theme + accent toggle
```js
// Apply on <html> element. Persist in localStorage.
document.documentElement.setAttribute('data-theme', 'dark');   // or 'light'
document.documentElement.setAttribute('data-accent', 'coral'); // 'coral' | 'orange' | 'violet'
```
