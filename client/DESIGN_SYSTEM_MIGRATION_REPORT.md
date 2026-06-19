# Design System Migration Report

Date: 2026-06-15

## Scope

Full refactor of the React client under `client/src` from **playful geometric** (cream canvas, 2px ink borders, hard offset shadows, purple brand) to **Soft Minimal SaaS Canvas** with **logo blue** palette from NihongoCoach brand assets.

## Design Philosophy

- **Canvas**: `#FAFAFA` neutral ground with pristine white (`#FFFFFF`) card surfaces
- **Brand**: Navy/Royal blue spectrum from logo (`#1E40AF` primary, `#3B82F6` accent, `#EFF6FF` soft highlight)
- **Borders**: Thin `1px` `#E5E7EB` instead of heavy 2px ink strokes
- **Shadows**: Soft layered shadows (`.premium-card`, `shadow-premium`) instead of hard offset shadows
- **Typography**: Space Grotesk (display) + Inter (body) + JetBrains Mono (labels/furigana) + Noto Sans JP (kanji)
- **Secondary**: Pink gamification (`#FBCFE8` / `#831843`) — gần màu gốc `#F472B6`
- **Tertiary/Accent**: Yellow gamification (`#FDE68A` / `#78350F`) — gần màu gốc `#FBBF24`
- UI buttons remain neutral (`variant="secondary"` uses white/gray, not pink)
- **Motion**: Vertical lift (`-translate-y-0.5`) and press scale (`active:scale-[0.98]`)

## Token Changes

### `globals.css`
- Replaced purple/cream/parchment palette with logo blue brand spectrum
- Semantic `--primary` → `--color-brand` (`#1E40AF`)
- `--border` / `--input` → `#E5E7EB` (no longer mapped to ink)
- Soft shadow tokens: `--shadow-soft-sm`, `--shadow-soft-md`, `--shadow-cta`, `--shadow-premium`
- Dark mode updated with blue accents (`#60A5FA` brand-light)
- Utility classes: `.premium-card`, `.premium-card-hover`, `.glass-overlay`, `.view-transition`, `.card-lift`

### `tailwind.config.js`
- `brand.*` namespace: `brand`, `brand-hover`, `brand-deep`, `brand-light`, `brand-soft`, `brand-muted`
- Added `fontFamily.mono`, `boxShadow.premium`, `boxShadow.cta`
- Legacy `shadow-hard-*` aliases map to soft shadows during migration

### Fonts (`package.json`)
- Added: `@fontsource/inter`, `@fontsource/space-grotesk`, `@fontsource/jetbrains-mono`
- Removed: `@fontsource/plus-jakarta-sans`, `@fontsource/outfit`, `@fontsource-variable/geist`, `@fontsource/be-vietnam-pro`

## Component Updates

### Primitives (`components/ui/`)
- `recipes.ts`: soft minimal `uiBase` (thin borders, `rounded-xl`, vertical lift)
- `button-variants.ts`: default dark CTA, new `brand` variant, `rounded-lg` sizing
- `card`, `input`, `badge`, `tabs`, `table`, `dialog`, `drawer`: aligned to new tokens

### Motion (`lib/motion/`)
- `presets.ts`: vertical lift + scale press (replaced diagonal sticker motion)
- Deleted orphaned `lib/design-system/motion.ts`

### Shell & Layouts
- `index.html`: title `NihongoCoach`, favicon `brand-mark.png`
- `app-header.tsx`, `page-shell.tsx`, `layout-topbar.tsx`: glass topbar, brand logo, clean headers
- `auth-layout.tsx`: brand-soft gradient + logo watermark
- `student-sidebar.tsx`, `admin-layout.tsx`: white sidebar, `bg-brand-soft` active nav
- `auth-card.tsx`: premium card, updated accent variants (`soft`, `brand`, `success`, `warning`)

## Bulk Migration

~82 feature files migrated via controlled search-replace:
- `border-2 border-ink` → `border border-border`
- `shadow-hard*` → `shadow-sm` / `shadow-premium-hover`
- `text-ink` → `text-foreground`
- `bg-tertiary/*` hovers → `bg-brand-soft`
- `var(--nc-*)` → semantic tokens
- `from-violet-100` → `from-brand-soft`

## Remaining Intentional Patterns

- Arbitrary spacing (`min-h-[70vh]`, `max-w-[320px]`) retained for layout constraints
- `font-extrabold` in some feature views (gradual typography migration)
- JLPT exam / video-call dark chrome: token colors only, focused UX preserved

## Audit Result

- Build: `pnpm build` passes (TypeScript + Vite)
- Raw hex values remain only in `globals.css`
- WCAG: `#111827` on `#FFFFFF` (AAA), `#1E40AF` on white for brand buttons (AA+)
- Dark mode tokens defined in `.dark` block

## Brand Assets

- `public/brand-logo.png` — full logo (auth watermark, marketing)
- `public/brand-mark.png` — icon mark (header, sidebar, favicon)
