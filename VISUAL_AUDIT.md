# VISUAL AUDIT & DESIGN SYSTEM REVIEW

## 🚨 P0 - Critical Issues (Legibility & Contrast)

### Global Tokens
- **Problem:** `--primary` is Lime Neon (`#CDFF00`). Using `text-primary` on light backgrounds (white/gray) is unreadable (Contrast ratio < 3:1).
- **Locations:**
  - `apps/web/src/components/PackCard.tsx` (Hover text, Price)
  - `apps/web/src/app/login/page.tsx` (Links, Tabs)
  - `apps/web/src/app/signup/page.tsx` (Links, Tabs)
  - `apps/web/src/components/ui/button.tsx` (Link variant)
  - `apps/web/src/app/pack/[id]/page.tsx` (Back link, Icons)
- **Fix:** Change to `text-foreground` or a darker shade for text. Use `primary` only for backgrounds (buttons/badges) with dark text (`text-primary-foreground`).

### Hardcoded Colors
- **Problem:** Use of `bg-white`, `bg-gray-50`, `bg-gray-100`, `border-gray-300` breaks the theme system and dark mode compatibility.
- **Locations:**
  - `apps/web/src/components/CreatorCard.tsx`
  - `apps/web/src/app/dashboard/packs/page.tsx` (Tables)
  - `apps/web/src/app/dashboard/packs/new/page.tsx` (Forms)
  - `apps/web/src/app/dashboard/packs/[id]/edit/page.tsx` (Forms, Upload areas)
- **Fix:** Replace with `bg-card`, `bg-muted`, `border-border`, `bg-accent`.

## 🟡 P1 - Hierarchy & Consistency

### Layout Structure
- **Problem:** "All White" layout. Page background and cards are often both white or indistinguishable.
- **Fix:**
  - Page Background: `bg-background` (Light Gray/Blue `210 40% 98%`)
  - Content Containers: `bg-card` (White `0 0% 100%`) + `shadow-sm` + `border-border`
  - Ensure this hierarchy is applied globally (Public & Logged in).

### Dashboard Visuals
- **Problem:** Dashboard lacks the "highlight" cards and specific chart styling requested in the visual reference.
- **Fix:**
  - Create a "Highlight Card" variant (Dark bg + Neon text).
  - Style charts with consistent tokens.

## 🟢 P2 - Polishing

### Focus States
- **Problem:** Inconsistent focus rings.
- **Fix:** Ensure `focus-visible:ring-ring` is applied to all interactive elements.

### Typography
- **Problem:** Headings in Cards sometimes lack weight differentiation.
- **Fix:** Enforce `font-semibold` for headings and `text-muted-foreground` for secondary text.