# Rendivia Implementation Notes

## Summary
Pivoted Rendivia toward an API-first, deterministic JSON-to-video platform. Implemented a JSON-driven pSEO system, refreshed the public marketing site and dashboard, expanded API and rendering infrastructure, and delivered Remotion marketing videos (1080p + 4K). Fixed runtime and routing issues that caused 404s and dashboard crashes.

## Public Site (API-First Positioning)
- Rebuilt the homepage content to “Programmatic video generation for SaaS products” with clear API messaging, structured sections, and a JSON payload block.
- Added the landing marketing video in the hero column, above the JSON code block.
- Updated header and footer navigation to focus on API-first routes and de-emphasize legacy tools.
- Pricing page updated to API usage-based positioning, with overage callout.
- Docs and status placeholders aligned to API-first copy.

Key files
- `src/app/page.tsx`
- `src/components/Header.tsx`
- `src/components/SiteFooter.tsx`
- `src/app/pricing/page.tsx`
- `src/app/docs/page.tsx`
- `src/app/status/page.tsx`

## pSEO System (JSON-Driven)
- Created a strict JSON content system under `content/pseo/`.
- Added Zod validation and loader utilities for canonical lookup and type filtering.
- Built a shared layout component for pSEO pages with consistent sections and single CTA.
- Implemented dynamic routes for use cases, triggers, and data sources.
- Added hub pages for `/use-cases`, `/from`, and `/when`.
- Added JSON-LD, metadata, and sitemap integration for pSEO pages.
- Implemented subtle internal linking using `related` data and contextual link blocks.

Key files
- `content/pseo/**`
- `src/lib/pseo-schema.ts`
- `src/lib/pseo.ts`
- `src/components/pseo/PseoPage.tsx`
- `src/app/use-cases/[industry]/[slug]/page.tsx`
- `src/app/from/[source]/to/video/page.tsx`
- `src/app/when/[event]/generate-video/page.tsx`
- `src/app/use-cases/page.tsx`
- `src/app/from/page.tsx`
- `src/app/when/page.tsx`
- `src/app/sitemap.ts`

## Dashboard UX (API Console)
- Reworked dashboard structure to API-first navigation and data views.
- Added Overview, API Keys, Templates, Brand Profiles, Renders, Billing pages.
- Implemented real data wiring for dashboard stats (render jobs + usage).
- Added safe guards to prevent runtime errors when usage payload is missing.

Key files
- `src/components/dashboard/SidebarLayout.tsx`
- `src/components/StatCard.tsx`
- `src/components/DataTable.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/api-keys/page.tsx`
- `src/app/dashboard/templates/page.tsx`
- `src/app/dashboard/brands/page.tsx`
- `src/app/dashboard/renders/page.tsx`
- `src/app/dashboard/billing/page.tsx`

## API + Backend Updates
- Added API-first render endpoints under `/api/v1`.
- Added templates listing endpoint.
- Added render job status endpoint.
- Expanded usage tracking to include render stats.
- Added brand profile and logo upload support.
- Added render retry endpoint for failed jobs.

Key files
- `src/app/api/v1/render/route.ts`
- `src/app/api/v1/render/[jobId]/route.ts`
- `src/app/api/v1/templates/route.ts`
- `src/app/api/render-jobs/route.ts`
- `src/app/api/render-jobs/[id]/retry/route.ts`
- `src/app/api/brand-profiles/logo/route.ts`
- `src/app/api/usage/route.ts`
- `src/lib/video-templates.ts`

## Rendering & Remotion
- Added landing marketing video component with 6 scenes.
- Produced 1080p and 4K MP4 renders and embedded the 1080p on the homepage.
- Built pSEO demo video system with Remotion composition and batch renderer.
- Added Remotion webpack alias support for `@` path resolution.
- Pinned `zod` to match Remotion requirements.
- Shortened landing video to 45s and increased typography sizes for readability.

Key files
- `src/remotion/LandingHeroVideo.tsx`
- `src/remotion/Root.tsx`
- `src/remotion/PseoDemoVideo.tsx`
- `scripts/render-pseo-demos.cjs`
- `remotion.config.ts`
- `package.json`
- `public/landing/rendivia-landing-1080p.mp4`
- `public/landing/rendivia-landing-4k.mp4`

## Data + DB Layer
- Added render jobs and brand profiles tables (Supabase migration).
- Extended usage tracking to include render seconds/pixels.

Key files
- `supabase/migrations/*`
- `src/types/database.ts`
- `src/lib/usage.ts`

## Routing & Stability Fixes
- Fixed Next.js 16 param handling for pSEO routes (params are async).
- Removed invalid static param assumptions and enabled dynamic rendering for pSEO.
- Fixed dashboard crash when `/api/usage` returns an error payload.

Key files
- `src/app/use-cases/[industry]/[slug]/page.tsx`
- `src/app/from/[source]/to/video/page.tsx`
- `src/app/when/[event]/generate-video/page.tsx`
- `src/app/use-cases/[industry]/page.tsx`
- `src/app/dashboard/page.tsx`

## Scripts & Commands Used
- `npm run marketing:render-landing-1080p`
- `npm run marketing:render-landing-4k`
- `npm run pseo:render-demos`
- `npm run lint`

## Outputs
- Landing marketing video: `public/landing/rendivia-landing-1080p.mp4`
- Landing marketing video 4K: `public/landing/rendivia-landing-4k.mp4`
- pSEO demo videos: `public/pseo-demos/**`

