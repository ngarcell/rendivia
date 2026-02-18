# Rendivia — Implementation & Feature Documentation

This document describes the features, structure, and implementation details added to the Rendivia project: PSEO scaling, pricing, design system, mobile optimization, SEO, accessibility, security, and supporting pages.

---

## Table of contents

1. [Programmatic SEO (PSEO) — Tools section](#1-programmatic-seo-pseo--tools-section)
2. [Pricing & plans](#2-pricing--plans)
3. [Design system & light theme](#3-design-system--light-theme)
4. [Mobile optimization](#4-mobile-optimization)
5. [Popular tools section](#5-popular-tools-section)
6. [SEO & sharing](#6-seo--sharing)
7. [Custom error pages](#7-custom-error-pages)
8. [Accessibility](#8-accessibility)
9. [Legal pages (Privacy & Terms)](#9-legal-pages-privacy--terms)
10. [Loading states](#10-loading-states)
11. [Rate limiting](#11-rate-limiting)
12. [Security headers & CSP](#12-security-headers--csp)
13. [File reference](#13-file-reference)
14. [Programmatic render API](#14-programmatic-render-api)

---

## 1. Programmatic SEO (PSEO) — Tools section

### Overview

The Tools section scales to **800+ unique pages** for SEO: by platform, language, use case, feature, vertical, and **platform + language** (808 combos). All pages are statically generated at build time.

### URL schema

- **Hub**: `/tools` — lists all categories and popular tools.
- **Category + slug**: `/tools/[category]/[slug]` — e.g. `/tools/platform/youtube-shorts-captions`, `/tools/language/spanish-subtitles`, `/tools/platform-language/tiktok-spanish`.
- **Legacy redirect**: `/tools/[category]` when `[category]` is an old flat slug (e.g. `/tools/youtube-shorts-captions`) redirects to the correct `/tools/platform/youtube-shorts-captions`.

### Data & categories

- **Source**: `src/data/tools.ts` (core categories) and `src/data/tools-platform-language.ts` (platform × language entries).
- **Categories**: `platform`, `language`, `use-case`, `feature`, `vertical`, `platform-language`.
- **Platform-language**: 8 platforms × 101 languages = 808 entries with templated intro, benefits, FAQs, and how-to steps to avoid thin content.

### Key functions (in `src/data/tools.ts`)

- `getToolEntry(category, slug)` — single tool page data.
- `getAllToolEntriesByCategory()` — all entries grouped by category (for hub).
- `getAllSlugsForStaticParams()` — all `{ category, slug }` for `generateStaticParams`.
- `resolveLegacySlug(slug)` — returns `{ category, slug }` for old flat URLs, or `null`.
- `getRelatedToolEntries(category, slug, limit)` — related tools for the template.

### Pages & components

- **Hub**: `src/app/tools/page.tsx` — hero, popular tools grid, then sections per category with links to `/tools/[category]/[slug]`.
- **Tool page**: `src/app/tools/[category]/[slug]/page.tsx` — uses `getToolEntry`, `generateStaticParams` from `getAllSlugsForStaticParams()`, renders `ToolPageTemplate`.
- **Legacy**: `src/app/tools/[category]/page.tsx` — if `resolveLegacySlug(params.category)` returns a match, redirects to `/tools/[category]/[slug]`; else 404.
- **Template**: `src/app/tools/ToolPageTemplate.tsx` — H1 (primary keyword), description, “Why use Rendivia”, “How it works”, “Benefits”, FAQ, related tools, browse links, CTA.

---

## 2. Pricing & plans

### Tiers (in `src/lib/plans.ts`)

| Tier        | Price        | Videos/mo | API/mo | Max duration | Notes                    |
|------------|-------------|-----------|--------|--------------|--------------------------|
| **Starter** | Free        | 15        | —      | 5 min        | Captions only            |
| **Pro**     | $24/mo      | 150       | 1,000  | 20 min       | Trim, brand-from-URL, API|
| **Team**    | $59/mo      | 500       | 5,000  | 30 min       | SSO, 5 seats             |
| **Enterprise** | Custom   | ∞         | ∞      | 120 min      | SLA, dedicated support   |

- Yearly pricing: 10 months billed (e.g. Pro $228/yr), displayed with “save 2 months” on the pricing page.
- Features (trim silence, audio enhancement, brand-from-URL, data-to-video, API, batch export, SSO, etc.) are defined in `plans.ts` and gated in the app and API.

### Pricing page

- **Path**: `src/app/pricing/page.tsx`.
- Hero plus a grid of plan cards (name, description, price, yearly equivalent, feature list, “Get started” / “Contact sales” CTA). Styled to match the homepage (light theme, card style).

---

## 3. Design system & light theme

### Defaults

- **Light theme** is the default. Dark is opt-in via `data-theme="dark"` on the document (no `prefers-color-scheme`).
- **CSS variables** in `src/app/globals.css`: `--background`, `--foreground`, `--accent`, `--accent-hover`, `--muted`, `--muted-bg`, `--border`, `--card-bg`, gradient colors. Dark theme overrides the same variables.

### Shared components

- **Header**: `src/components/Header.tsx` (client) — logo, nav links, auth (Clerk), mobile hamburger menu. Used in root layout.
- **SiteFooter**: `src/components/SiteFooter.tsx` — logo, Tools / Pricing / Contact / Privacy / Terms, plus “Tools: By platform · By language · …” links. Used on landing and error pages.

### Landing pages (consistent structure)

- **Home** (`src/app/page.tsx`): Hero (tag, headline, gradient sub, links), Key Features grid (8 cards), Use Cases (3 cards), Mission, CTA, SiteFooter.
- **Pricing**: Hero + plans grid + “Explore tools” section + SiteFooter.
- **Tools**: Hero + Popular tools + category sections + SiteFooter.
- **Enterprise** (`src/app/enterprise/page.tsx`): Hero, “What’s included” list, contextual tool links, contact CTA card, SiteFooter.

### Dashboard & tool template

- Dashboard (`src/app/dashboard/page.tsx`) and API Keys (`src/app/dashboard/keys/page.tsx`): Light backgrounds, rounded cards, consistent buttons/links.
- Tool template: Same light card/typography style; no dark-only classes.

---

## 4. Mobile optimization

### Viewport & global

- **Layout** (`src/app/layout.tsx`): `viewport` export — `width: device-width`, `initialScale: 1`, `maximumScale: 5`, `viewportFit: "cover"`.
- **globals.css**:  
  - `.touch-target` — on `(pointer: coarse)` enforces ≥44px min height/width for tap targets.  
  - `touch-action: manipulation` on buttons/links.  
  - Safe-area insets via `env(safe-area-inset-left/right)` on body.

### Header (mobile nav)

- **Header** (`src/components/Header.tsx`):  
  - Sticky; height `h-14` on small screens, `h-16` on `sm+`.  
  - Desktop: horizontal nav; mobile: nav hidden, **hamburger** toggles a panel with Home, Use Cases, Tools, Contact (48px-tall links).  
  - Body scroll locked when menu is open.  
  - Logo and primary CTA use touch-friendly sizing.

### Responsive & tap targets

- **Home**: Hero CTAs stack on mobile (`flex-col sm:flex-row`), full-width buttons with `min-h-[48px]`; “More use cases” and “Try Rendivia free” use touch targets.
- **Pricing**: Plan CTAs use `touch-target` and `min-h-[48px]`.
- **Tools**: Popular cards and category cards use touch targets; category cards `min-h-[72px]`.
- **Enterprise**: Contact CTA (mailto) uses touch target and `min-h-[48px]`.
- **Footer**: Logo and all links use touch targets; layout stacks on mobile.
- **Dashboard & keys**: Back link, Upgrade/API keys links, Submit/Create buttons, Download link use touch targets; main content has `sm:px-6`; file input button styled for tap.
- **Tool template**: CTA row stacks on mobile; breadcrumb, related links, and CTAs use touch targets.

---

## 5. Popular tools section

- **Location**: First content section on `/tools` (below hero).
- **Refinement**:  
  - “Quick links” replaced with a centered “Most used” label and “Popular tools” heading.  
  - Single short line of copy: “Jump straight to the tools our users rely on most.” (no inline links).  
  - Six popular tools shown as **cards** in a responsive grid (2 cols on small, 3 on large): rounded, padding, subtle shadow, hover border/shadow and accent on title; “View tool →” subline.  
  - Section padding and max-width (`max-w-5xl`) tuned for spacing.

---

## 6. SEO & sharing

### Metadata (root layout)

- **File**: `src/app/layout.tsx`.
- **Base URL**: `NEXT_PUBLIC_APP_URL` or `VERCEL_URL` (fallback `https://rendivia.com`). Used for `metadataBase` and canonical.
- **Metadata**: `title`, `description`, `openGraph` (type, locale, url, siteName, title, description, images), `twitter` (card `summary_large_image`, title, description, images), `alternates.canonical`.

### Open Graph image

- Metadata references `/og.png` (1200×630). Add this file under `public/`. See `public/og-readme.txt`.

### JSON-LD

- Injected in layout body: `<script type="application/ld+json">` with `@graph` containing:  
  - **Organization**: name, url, description.  
  - **WebSite**: name, url, description, publisher reference.

---

## 7. Custom error pages

- **404** — `src/app/not-found.tsx`: “Page not found” message, CTAs “Back to home” and “Browse tools”, same light theme and SiteFooter.
- **Error boundary** — `src/app/error.tsx` (client): “We hit a snag”, “Try again” (calls `reset()`), “Back to home”, SiteFooter; logs error in `useEffect`.

---

## 8. Accessibility

### Skip link

- First focusable element in layout body: “Skip to main content” linking to `#main-content`.
- Styled as `sr-only` until focused; on focus becomes visible (absolute, top-left, accent background, white text).
- Main content wrapper in layout: `<div id="main-content">{children}</div>`.

### Focus visible

- **globals.css**: `:focus { outline: none }`; `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }` so keyboard focus is clear and mouse click does not show outline.

---

## 9. Legal pages (Privacy & Terms)

- **Privacy**: `src/app/privacy/page.tsx` — title “Privacy Policy”, last-updated date, placeholder text instructing to replace with real policy (data, cookies, third parties, user rights). Back to home link.
- **Terms**: `src/app/terms/page.tsx` — same pattern for “Terms of Service” (acceptance, acceptable use, liability, termination).
- **Footer**: SiteFooter includes links to `/privacy` and `/terms` alongside Tools, Pricing, Contact.

---

## 10. Loading states

- **Dashboard**: `src/app/dashboard/loading.tsx` — skeleton (back link, title, paragraphs, usage card, form blocks) with `animate-pulse`.
- **API Keys**: `src/app/dashboard/keys/loading.tsx` — skeleton for back link, title, description, form, and submit button.

---

## 11. Rate limiting

- **Implementation**: `src/lib/rate-limit.ts`.
- **Mechanism**: In-memory store keyed by client IP (`x-forwarded-for` or `x-real-ip`). Window 1 minute, max 60 requests per IP per window. In serverless, state is per-instance; for cross-instance limits use Redis/KV.
- **Usage**: Called at the start of the handler; if over limit, return `429` with `Retry-After` (seconds) and JSON `{ error: "Too many requests. Try again later." }`.
- **Applied in**:  
  - `POST /api/caption`  
  - `POST /api/keys`  
  - `GET /api/brand-from-url`  
  - `POST /api/v1/caption`

---

## 12. Security headers & CSP

- **File**: `next.config.ts` — `async headers()` for `/:path*`.
- **Headers**:  
  - `X-Content-Type-Options: nosniff`  
  - `X-Frame-Options: SAMEORIGIN`  
  - `Referrer-Policy: strict-origin-when-cross-origin`  
  - `Content-Security-Policy`: directives for default-src, script-src (self + Clerk), style-src, font-src, img-src, connect-src, frame-src (Clerk), base-uri, form-action, frame-ancestors.
- If Clerk or other scripts break, relax the relevant CSP directives (e.g. script-src) in `next.config.ts`.

---

## 13. File reference

| Area            | Files |
|-----------------|-------|
| **Layout & shell** | `src/app/layout.tsx`, `src/components/Header.tsx`, `src/components/SiteFooter.tsx` |
| **Global styles**  | `src/app/globals.css` |
| **PSEO / Tools**   | `src/data/tools.ts`, `src/data/tools-platform-language.ts`, `src/app/tools/page.tsx`, `src/app/tools/[category]/page.tsx`, `src/app/tools/[category]/[slug]/page.tsx`, `src/app/tools/ToolPageTemplate.tsx` |
| **Pricing**        | `src/lib/plans.ts`, `src/app/pricing/page.tsx` |
| **Landing**        | `src/app/page.tsx`, `src/app/enterprise/page.tsx` |
| **Dashboard**      | `src/app/dashboard/page.tsx`, `src/app/dashboard/keys/page.tsx`, `src/app/dashboard/loading.tsx`, `src/app/dashboard/keys/loading.tsx` |
| **Error & legal**  | `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` |
| **Rate limit**     | `src/lib/rate-limit.ts`; used in `src/app/api/caption/route.ts`, `src/app/api/keys/route.ts`, `src/app/api/brand-from-url/route.ts`, `src/app/api/v1/caption/route.ts` |
| **Config**         | `next.config.ts` (headers); `public/og-readme.txt` (OG image note) |

---

## 14. Programmatic render API

### Overview

Rendivia now supports a **JSON → video** render API for deterministic, branded MP4 output. Templates are defined in Remotion and invoked by ID.

### Endpoints

- `POST /api/v1/render` — enqueue a render job (API key required).
- `GET /api/v1/render/:jobId` — poll status and output URL.
- `GET /api/v1/templates` — list template IDs, examples, and resolution.

### Data model

- `render_jobs` — render job queue, input props, status, output URL, webhook metadata.
- `brand_profiles` — reusable brand definitions (logo, colors, font, intro/outro text).
- `usage` — now includes `render_seconds` and `render_pixels` for metering.

### Files

- Template registry: `src/lib/video-templates.ts`
- Brand normalization: `src/lib/brand-profile.ts`
- Render API: `src/app/api/v1/render/route.ts`, `src/app/api/v1/render/[jobId]/route.ts`
- Brand profiles API: `src/app/api/brand-profiles/route.ts`
- Worker: `scripts/remotion-worker.mjs`

---

*This documentation reflects the implementation as of the last update. For setup, env vars, and database, see the main README.*
