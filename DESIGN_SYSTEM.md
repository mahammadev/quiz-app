# Design System – Figma Cheatsheet

Quick-reference version for building screens in **Figma** using the system rules. Keep this open, avoid improvising.

---

## Philosophy

**Premium Minimalism**

* Spacious layouts, intentional gaps
* Subtle borders and shadows only
* Calm motion, nothing flashy
* If something feels decorative, remove it

Think: Linear + Notion, not a crypto landing page.

---

## Color Tokens (Create as Figma Color Styles)

### Core

* **Background**
  * Light: `hsl(0 0% 100%)`
  * Dark: `hsl(240 10% 4%)`

* **Foreground (Primary Text)**
  * Light: `hsl(240 10% 4%)`
  * Dark: `hsl(0 0% 98%)`

* **Muted (Secondary Surfaces)**
  * Light: `hsl(240 5% 96%)`
  * Dark: `hsl(240 5% 15%)`

* **Muted Foreground (Secondary Text)**
  * Light: `hsl(240 4% 46%)`
  * Dark: `hsl(240 4% 65%)`

### Brand

* **Primary**: `hsl(252 85% 60%)`
* **Primary / Text On**: `hsl(0 0% 100%)`
* **Accent**: `hsl(252 30% 95%)`
* **Destructive**: `hsl(0 84% 60%)`

### Semantic

* **Success**: `hsl(142 76% 36%)`
* **Warning**: `hsl(38 92% 50%)`
* **Info**: `hsl(199 89% 48%)`

Rule: use semantic colors for meaning only, never decoration.

---

## Color Usage Permission Chart

A quick-reference for where each color token is allowed. If a cell is blank in our mental model, the answer is **no**.

### Surfaces (Backgrounds)

| Component | background | muted | accent | primary | destructive |
|:---|:---:|:---:|:---:|:---:|:---:|
| Page / App shell | ✓ | | | | |
| Card / Panel / Modal | | ✓ | | | |
| Table Header | | ✓ | | | |
| Hovered / Selected Row | | | ✓ | | |
| Alerts (container) | | ✓ | | | |

> [!IMPORTANT]
> Semantic colors (success, warning, info) almost never fill large surfaces.

### Text

| Text Type | foreground | muted‑foreground | primary | destructive | semantic |
|:---|:---:|:---:|:---:|:---:|:---:|
| Headings / Body | ✓ | | | | |
| Secondary / Meta | | ✓ | | | |
| Links / Primary Actions | ✓ | | ✓ | | |
| Error / Success / Info | | | | ✓ | ✓ |

> [!TIP]
> If the user must read it, it’s not muted.

### Absolute No‑Gos
- ❌ **Primary** as a page background.
- ❌ **Semantic colors** as large fills.
- ❌ **Accent** used as a text color (contrast risk).
- ❌ **Muted‑foreground** for important content.

---

## Typography (Create Text Styles)

### Fonts

* **UI / Body**: Inter
* **Display (Optional)**: Plus Jakarta Sans
* **Code**: JetBrains Mono

### Scale

* **Display**: 48px / 800 / 1.1
* **H1**: 36px / 700 / 1.2
* **H2**: 28px / 600 / 1.25
* **H3**: 20px / 600 / 1.3
* **Body**: 16px / 400 / 1.5
* **Small**: 14px / 400 / 1.4
* **Caption**: 12px / 500 / 1.4

Rules:
* No center-aligned paragraphs
* Max width for body text ~60–70ch
* Avoid mixed font weights inside a sentence

---

## Spacing Scale (Use 4px Grid)

| Token    | px |
| -------- | -- |
| space-1  | 4  |
| space-2  | 8  |
| space-3  | 12 |
| space-4  | 16 |
| space-6  | 24 |
| space-8  | 32 |
| space-12 | 48 |
| space-16 | 64 |

Usage rules:
* Stack sections: 48–64px
* Card padding: 24–32px
* Inline gaps: 8–12px
* If spacing feels arbitrary, it is wrong

---

## Border Radius

| Token | Value  | Use                   |
| ----- | ------ | --------------------- |
| sm    | 6px    | Inputs, small buttons |
| md    | 8px    | Cards, dropdowns      |
| lg    | 12px   | Modals                |
| xl    | 16px   | Feature sections      |
| full  | 9999px | Pills, primary CTAs   |

Never mix multiple radius sizes in the same component.

---

## Elevation & Borders

### Cards

* Radius: 12px
* Border: 1px, neutral, ~50% opacity
* Shadow: `0 1px 3px rgba(0,0,0,0.04)`

Rule: if a shadow is noticeable, it is too strong.

---

## Buttons

### Primary CTA

* Radius: full
* Background: Primary
* Text: Primary Foreground
* Shadow: subtle

### Secondary

* Radius: md
* Background: transparent or muted
* Border: optional

### Ghost

* Text only
* No shadow, no background

Rule: one primary CTA per screen, max.

---

## Glass (Use Rarely)

* Background: Background @ 80%
* Blur: 12px
* Border: 1px @ 30%

Only for:
* Sticky headers
* Floating toolbars
* Overlays

Never for main content containers.

---

## Motion (For Prototypes)

* Hover / Focus: 150ms, ease-out
* Dropdowns: 200ms, ease-out
* Modals: 300ms, ease-in-out
* Page transitions: 400ms

Animate:
* Hover states
* Dropdown open/close
* Modal enter/exit

Do not animate scroll or every click.

---

## Accessibility Checklist

* Contrast ≥ 4.5:1
* Focus states visible
* Touch targets ≥ 44x44px
* Full keyboard navigation supported

If it looks cool but fails this list, it fails.
