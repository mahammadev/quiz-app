# Design System

> **Status**: Draft  
> **Last Updated**: 2026-02-04

---

## Philosophy

**Premium Minimalism**: Clean, spacious, with subtle depth. Think Linear meets Notion.

- Generous whitespace
- Subtle shadows and borders
- Smooth, intentional animations
- No visual clutter

---

## Color Tokens

### Core Palette

| Token             | Light Mode         | Dark Mode          | Usage |
|-------------------|--------------------|--------------------|-------|
| `--background`    | `hsl(0 0% 100%)`   | `hsl(240 10% 4%)`  | Page background |
| `--foreground`    | `hsl(240 10% 4%)`  | `hsl(0 0% 98%)`    | Primary text |
| `--muted`         | `hsl(240 5% 96%)`  | `hsl(240 5% 15%)`  | Secondary backgrounds |
| `--muted-foreground` | `hsl(240 4% 46%)` | `hsl(240 4% 65%)` | Secondary text |

### Brand Colors

| Token             | Value              | Usage |
|-------------------|--------------------|----|
| `--primary`       | `hsl(252 85% 60%)` | CTAs, links, focus states |
| `--primary-foreground` | `hsl(0 0% 100%)` | Text on primary |
| `--accent`        | `hsl(252 30% 95%)` | Hover states, highlights |
| `--destructive`   | `hsl(0 84% 60%)`   | Errors, delete actions |

### Semantic Colors

| Token      | Light              | Dark               |
|------------|--------------------|--------------------|
| `--success`| `hsl(142 76% 36%)` | `hsl(142 76% 46%)` |
| `--warning`| `hsl(38 92% 50%)`  | `hsl(38 92% 50%)`  |
| `--info`   | `hsl(199 89% 48%)` | `hsl(199 89% 58%)` |

---

## Typography

### Font Stack

| Purpose | Font | Fallback |
|---------|------|----------|
| UI/Body | Inter | system-ui, sans-serif |
| Display (Optional) | Plus Jakarta Sans | Inter, sans-serif |
| Code | JetBrains Mono | monospace |

### Scale

| Element    | Size     | Weight | Line Height |
|------------|----------|--------|-------------|
| Display    | 3rem     | 800    | 1.1         |
| Heading 1  | 2.25rem  | 700    | 1.2         |
| Heading 2  | 1.75rem  | 600    | 1.25        |
| Heading 3  | 1.25rem  | 600    | 1.3         |
| Body       | 1rem     | 400    | 1.5         |
| Small      | 0.875rem | 400    | 1.4         |
| Caption    | 0.75rem  | 500    | 1.4         |

---

## Spacing Scale

Based on 4px unit:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps |
| `--space-2` | 8px | Icon gaps |
| `--space-3` | 12px | Inline element gaps |
| `--space-4` | 16px | Default padding |
| `--space-6` | 24px | Section padding |
| `--space-8` | 32px | Card padding |
| `--space-12` | 48px | Section margins |
| `--space-16` | 64px | Page sections |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Inputs, small buttons |
| `--radius-md` | 8px | Cards, dropdowns |
| `--radius-lg` | 12px | Modals, large cards |
| `--radius-xl` | 16px | Feature sections |
| `--radius-full` | 9999px | Pills, avatars, primary CTAs |

---

## Component Patterns

### Cards
```css
.card {
  border-radius: var(--radius-lg);
  border: 1px solid hsl(var(--border) / 0.5);
  background: hsl(var(--card));
  box-shadow: 0 1px 3px hsl(0 0% 0% / 0.04);
}
```

### Buttons
| Type | Border Radius | Shadow |
|------|---------------|--------|
| Primary CTA | `--radius-full` | Subtle drop shadow |
| Secondary | `--radius-md` | None |
| Ghost | `--radius-md` | None |

### Glassmorphism (Use Sparingly)
```css
.glass {
  background: hsl(var(--background) / 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid hsl(var(--border) / 0.3);
}
```
**When to use**: Overlays, floating toolbars, sticky headers only.

---

## Motion Guidelines

### Timing

| Type | Duration | Easing |
|------|----------|--------|
| Micro (hover, focus) | 150ms | ease-out |
| Small (dropdowns) | 200ms | ease-out |
| Medium (modals) | 300ms | ease-in-out |
| Large (page transitions) | 400ms | ease-in-out |

### Framer Motion Defaults
```typescript
const defaultTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};
```

### What to Animate
- ✅ Hover states, focus rings
- ✅ Dropdown open/close
- ✅ Modal enter/exit
- ✅ List item add/remove
- ❌ Scroll position (let it be native)
- ❌ Every button click (too noisy)

---

## Accessibility

- All interactive elements must have visible focus states
- Color contrast ratio: minimum 4.5:1 for text
- Touch targets: minimum 44x44px
- Keyboard navigation must work for all flows
