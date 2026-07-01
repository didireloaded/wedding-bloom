
# ForeverVow — Audit Report & Rebuild Plan

Per your instruction, no code has been changed. Below is the full report + a phased implementation order. I'll wait for your approval before touching files.

The zip you uploaded (`wedding-bloom-main`) matches the live project's current file tree, so the audit is against what's already deployed.

---

## 1. Existing Features (working today)

**Admin**
- Login (`AdminLogin`), dashboard (`AdminDashboard.tsx`, ~75k), wedding builder/editor (`WeddingBuilder.tsx`), AI-assisted CSV importer (10-theme detection + custom theme fallback), delete-wedding edge function with storage cleanup, reports table, wedding analytics counters (`page_views`, `qr_scans`), moderation of Live Moments, manual "AI Framing" trigger.
- Backend: `weddings`, `rsvps`, `guestbook`, `guests`, `events`, `gallery`, `guest_photos`, `checkins`, `wedding_moments`, `moment_reactions`, `live_updates`, `wedding_updates`, `wedding_analytics`, `wedding_reports`, `seating_tables`, `seating_assignments`, `accommodations`, `registries`, `vendors`, `themes`, `profiles`, `user_roles` with `has_role()` + `regenerate_access_code()` RPCs.

**Couple**
- Access-code entry (`CoupleEntry`), dashboard (`CoupleDashboard.tsx` ~51k) with countdown, quick actions, activity feed, insights, AI Wedding Assistant (single- and multi-wedding admin mode via `ai-wedding` edge function, Gemini via Lovable AI), Edit Wedding Details flow (`couple-update-wedding` edge fn), planning + execution suites (`planningSuite.tsx`, `executionSuite.tsx`, `widgets.tsx`), Live Feed moderation.

**Guest**
- Invitation overlay animation (sealed → opening → revealed), wedding page (`WeddingPage.tsx` ~66k) with story, timeline, venue, accommodations, RSVP with dietary + party size, guestbook, guest photo upload, Live Feed w/ reactions + Reception Mode, gallery, QR redirect + page-view analytics, check-in flow.

**Infra**
- Supabase (Lovable Cloud), storage buckets `wedding-images` + `wedding-assets`, edge functions: `ai-wedding`, `delete-wedding`, `manage-moments`, `couple-update-wedding`, AI framing function.
- React 18 + Vite + Tailwind + shadcn, lazy routes, error boundary, sonner toasts, command palette.

---

## 2. Problems Found

**Architectural**
- Dual data layer: `src/store/weddingStore.ts` is a full localStorage "DB" with demo seed data, running alongside real Supabase. `useWeddingData` and parts of the couple suite still read from it → drift risk, confusing behavior after refresh, and the source of several "why is old data showing" bugs.
- `AdminDashboard.tsx` (75k), `WeddingPage.tsx` (66k), `executionSuite.tsx` (57k), `CoupleDashboard.tsx` (51k), `planningSuite.tsx` (36k), `widgets.tsx` (33k) are single-file god-components. Hard to maintain, slow to hot-reload, mixed concerns (data fetch + UI + business logic).
- No shared data layer / no React Query. Each screen re-fetches with ad-hoc Supabase calls; realtime subscriptions are scattered.
- No route-level auth guard component; role checks are inlined per page and rely on localStorage flags (`wb_admin`, `couple_wedding_slug`).
- Wedding lifecycle stage (Draft → Planning → Published → RSVP Open → Wedding Week → Live → Completed → Memory Book → Archived) exists only implicitly via booleans (`published`, `live_mode`, `archived`). No single `stage` field, no automatic transitions.

**UX / UI**
- Guest hero framing still inconsistent across weddings (heads cut, subject drowning) despite AI framing pass — recurring user complaint. Framing needs to be a first-class, per-image stored transform (focal point x/y + zoom), not a re-run heuristic.
- RSVP button contrast fixed once but themed weddings can regress (white on cream). Needs token-level guarantee in theme system.
- Admin dashboard tilts toward "IT command center" language; per your brief it should be wedding-centric (Upcoming, Today's, Recent, Couples, Guests, Activity).
- Couple dashboard has strong content but lacks a clear "today's recommendation" and Wedding Health score.
- Glass system inconsistently applied (some cards use raw `bg-white/5`, others use `GlassCard`).

**Data / Security**
- `access_code` regeneration works, but there's no rate limit / audit log.
- `weddings` table has 30 columns — some legacy (`hero_image` vs `cover_image` vs `story_image` vs `rsvp_image`) with unclear ownership; needs consolidation into a `wedding_images` child table with role + focal point.
- No `wedding_stage` enum; `archived` boolean + `live_mode` boolean can conflict.
- Guest arrival tracking is check-in only; no geofence / opt-in location share as the spec requires.
- Memory Book mode not implemented (post-wedding auto-transform).

**Code quality**
- Console logs scattered in edge functions and pages.
- `store/weddingStore.ts` demo data + `defaultDB()` ships to production.
- Duplicate confirmation modal patterns (`ConfirmModal`, inline AlertDialogs).
- Unused imports across the large page files.
- No tests.

**Performance**
- Hero images are raw Unsplash / storage URLs, no `srcset`, no AVIF/WebP variants, no LCP preload.
- Realtime channels created inside components without cleanup keys → risk of duplicate subscriptions on remount.
- Large pages ship as single chunks; code-splitting is only per route.

**Accessibility**
- Some icon-only buttons in admin lack `aria-label`.
- Focus states inconsistent on glass surfaces.
- Guest page hero text contrast varies by uploaded image (no scrim guarantee).

---

## 3. Missing Features (from your brief vs. what exists)

1. **Wedding lifecycle stage machine** with automatic transitions.
2. **Guest arrival tracking (opt-in geofence)** — Travelling / Nearby / Arrived, auto-stop after event.
3. **Memory Book mode** — automatic post-wedding transformation of the guest site.
4. **Wedding Health score** on couple dashboard.
5. **Today's Recommendation** engine (rules-based, no AI cost).
6. **Per-image focal point + zoom** stored in DB, applied everywhere the image renders — replaces one-shot AI framing.
7. **Business Insights** view for admin (weddings per month, avg RSVP rate, top vendors, revenue if applicable).
8. **Notifications center** (in-app) for couple + guest, unifying updates/moments/RSVPs.
9. **Templates library** for admin (starting themes / event schedules).
10. **Vendor status board** in Live Wedding Mode.

---

## 4. Recommended Implementation Order

Each phase is independently shippable. I'll pause for approval between phases.

**Phase 0 — Foundation (no user-visible change)**
- Introduce React Query + a single `supabase` data layer under `src/data/*` (queries + mutations per entity).
- Extract god-components into `src/features/{admin,couple,guest}/…` subfolders. No behavior change, just moves + splits.
- Add `AuthGuard` + role router; remove ad-hoc localStorage checks from pages.
- Remove the localStorage `weddingStore` demo layer once every consumer is migrated (kept until then).
- Console log sweep, unused-import sweep.

**Phase 1 — Data model hardening**
- Migration: add `wedding_stage` enum + column, backfill from existing booleans, add trigger to auto-advance on date/time.
- Migration: `wedding_images` table (`wedding_id`, `role`, `url`, `focal_x`, `focal_y`, `zoom`, `alt`) — migrate `cover_image / hero_image / story_image / rsvp_image` into rows.
- Migration: `access_code_audit` + rate-limit function.

**Phase 2 — Image system**
- Replace AI-framing-per-image with `<SmartImage>` that reads focal x/y + zoom from `wedding_images` and applies `object-position` + `transform`. Admin & couple get a visual focal-point picker (drag a dot on the image). Solves the "heads cut / drowning" issue permanently.
- Add responsive `srcset` via Supabase render transforms; preload LCP hero.

**Phase 3 — Admin rebuild (wedding-centric)**
- New dashboard sections: Today's Weddings, This Week, Upcoming, Recent, Couples, Guests, Activity, Reports, Templates, Business Insights. Same data, wedding-first language.
- Global search (already have CommandPalette — wire to weddings/couples/guests).

**Phase 4 — Couple workspace polish**
- Hero + countdown + Wedding Status + Today's Recommendation + Wedding Health.
- Notifications center.
- Consolidate planning/execution suites into tabbed workspace with lazy chunks.

**Phase 5 — Guest experience**
- Invitation → Story → Timeline → Venue → Interactive Map → Accommodation → RSVP → Gallery → Guestbook → Guest Photos → Moments → Live Updates → Memory Book.
- Themed glass tiers (rich for guest, medium for couple, light for admin).
- RSVP button contrast enforced via theme tokens (no per-wedding regressions).

**Phase 6 — Live Wedding Mode & Memory Book**
- Auto-activate on wedding day via stage machine.
- Opt-in geofenced arrival tracking (browser Geolocation, permission-gated, auto-stopped by stage transition).
- Post-wedding auto-flip to Memory Book (read-only curated view).

**Phase 7 — QA + perf + a11y pass**
- Playwright smoke suite for the three role journeys.
- Lighthouse pass on guest page.
- axe pass on all three surfaces.
- Remove all `console.log`, dead code, `defaultDB()` demo.

---

## 5. Technical notes (for the engineers on the team)

- Keep Supabase (Lovable Cloud); no backend swap.
- Keep Lovable AI gateway for the assistant; add a cheap rules-based recommender for "Today's Recommendation" to avoid per-load AI cost.
- Every new `public` table ships with GRANTs + RLS + policies in the same migration.
- Realtime subscribed inside `useEffect` with proper cleanup + channel keyed by wedding id.
- No changes to `src/integrations/supabase/client.ts` or auto-gen types.

---

## 6. What I need from you before touching code

1. **Approve the plan** (or tell me which phases to drop / reorder).
2. Confirm scope of **Phase 0 first** — I'd like to ship the foundation refactor alone, verify nothing regresses, then move to Phase 1.
3. Confirm you're OK with the **`wedding_images` migration** replacing the current `hero_image / cover_image / story_image / rsvp_image` columns (I'll keep the old columns during migration and drop them only after all reads are switched).
4. Confirm **opt-in geofenced arrival tracking** should use the browser Geolocation API (no third-party service, no ongoing cost).

Once you say go, I'll start Phase 0 and pause for review before Phase 1.
