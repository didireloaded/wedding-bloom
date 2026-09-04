# ForeverVow Production Wedding Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve Wedding Bloom into a production-ready ForeverVow wedding experience with real couple ownership, state-aware guest journeys, secure guest sessions, Memories, check-in, and Supabase-backed notifications.

**Architecture:** Extend the existing React/Vite wedding routes and dashboard in place. Supabase Auth owns couple identity, `wedding_members` enforces ownership through RLS, guest sessions provide passwordless RSVP identity, and database events feed in-app/Web Push notifications. The existing public wedding content, RSVP, guestbook, Moments, gallery, realtime, and admin flows remain the source of truth and are upgraded incrementally.

**Tech Stack:** React, TypeScript, Vite, Supabase Postgres, Supabase Auth, Supabase Storage, Supabase Realtime, Supabase Edge Functions, Web Push/VAPID, Service Worker.

**Spec:** `docs/superpowers/specs/2026-09-02-forevervow-pwa-wedding-experience-design.md` (source brief supplied in the task attachments)

## Global Constraints

- Extend the existing application. Do not rebuild working systems from scratch.
- ForeverVow is the digital home for a wedding from invitation to memories.
- Do not add a vendor marketplace, budget tool, supplier booking system, generic task manager, project-management application, or general social network.
- Keep the couple navigation: Home, Guests, Schedule/Calendar, Memories, Website, Profile.
- AI remains invisible to guests and never decides deterministic wedding phases or event timing.
- Supabase is the entire backend backbone; do not add Firebase or OneSignal.
- Every couple-side table must enforce access through `wedding_members` RLS.
- Push must remain optional and the app must work fully when unavailable.
- Use `apply_patch` for code edits, preserve unrelated working-tree changes, and run typecheck/build after each task.

---

### Task 1: Capture the Approved Architecture Spec

**Files:**
- Create: `docs/superpowers/specs/2026-09-02-forevervow-pwa-wedding-experience-design.md`
- Source: supplied task attachment `2d2195d8-97f6-4ed3-80ed-2b4785f58fc8/pasted-text.txt`

**Interfaces:**
- Produces the versioned design reference used by every later task.

- [ ] **Step 1: Copy the supplied specification into the repository without changing its requirements.**
- [ ] **Step 2: Confirm the spec contains the product definition, lifecycle, auth/RLS, guest sessions, Memories, check-in, notification, PWA, admin, and verification sections.**
- [ ] **Step 3: Run `git diff --check` and commit with `docs: add ForeverVow product architecture spec`.**

### Task 2: Replace Preview Couple Auth With Supabase Auth

**Files:**
- Modify: `src/hooks/useAuth.ts`
- Modify: `src/pages/CoupleLogin.tsx`
- Modify: `src/pages/CoupleDashboard.tsx`
- Create: `supabase/migrations/20260904110000_couple_membership_auth.sql`
- Test: `src/hooks/useAuth.test.ts`

**Interfaces:**
- `useAuth()` returns the real Supabase session and user.
- `wedding_members(wedding_id, user_id, role)` stores `owner` or `partner` membership.
- Couple login uses `supabase.auth.signInWithPassword` and never stores an access code as authentication.

- [ ] **Step 1: Write tests proving unauthenticated users are rejected and authenticated users receive their session.**
- [ ] **Step 2: Add `wedding_members` with unique `(wedding_id, user_id)`, role checks, and RLS policies based on `auth.uid()`.**
- [ ] **Step 3: Implement login, signup, email verification messaging, sign-out, and protected dashboard routing using Supabase Auth.**
- [ ] **Step 4: Remove fake preview-admin success paths while retaining explicit local preview data only behind a development preview flag.**
- [ ] **Step 5: Run the focused tests, `tsc --noEmit`, and `vite build`; commit `feat: add real couple authentication`.**

### Task 3: Lock Down Couple-Side RLS and Public Wedding Data

**Files:**
- Create: `supabase/migrations/20260904111500_wedding_membership_rls.sql`
- Modify: `src/hooks/useWeddingData.ts`
- Modify: couple/admin data-fetching components identified by `rg "from\\(\"(rsvps|gallery|guest_photos|checkins|guestbook|events)\"" src`
- Test: `supabase/tests/wedding_isolation.sql`

**Interfaces:**
- `public.is_wedding_member(target_wedding_id uuid)` returns a boolean based only on `auth.uid()` membership.
- Couple queries return zero rows for a different wedding, even if the URL contains another wedding ID.

- [ ] **Step 1: Write SQL isolation tests for owner, partner, non-member, and public visitor roles.**
- [ ] **Step 2: Add the helper function and apply member-only SELECT/INSERT/UPDATE/DELETE policies to private wedding tables.**
- [ ] **Step 3: Split public wedding reads from private fields so `access_code`, ownership, and private settings are never exposed through public queries.**
- [ ] **Step 4: Update frontend queries to use slug/public projections for guests and membership-scoped queries for couples.**
- [ ] **Step 5: Run Supabase tests plus typecheck/build; commit `fix: enforce wedding membership isolation`.**

### Task 4: Add Couple Invite and Onboarding Wizard

**Files:**
- Create: `supabase/migrations/20260904113000_couple_invites.sql`
- Create: `supabase/functions/couple-invite/index.ts`
- Create: `src/pages/CoupleInvite.tsx`
- Create: `src/components/couple/OnboardingWizard.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/couple/OnboardingWizard.test.tsx`

**Interfaces:**
- `couple_invites` stores only a token hash, email, wedding scope, status, expiry, and acceptance metadata.
- Invite acceptance is single-use and creates the first `wedding_members` owner.
- Wizard autosaves seven named steps and reports `Step N of 7`.

- [ ] **Step 1: Add tests for expired, revoked, already accepted, wrong-email, and valid invite tokens.**
- [ ] **Step 2: Implement server-side token hashing, single-use acceptance, and membership creation.**
- [ ] **Step 3: Build the five-screen product introduction and seven-step setup wizard using existing form primitives.**
- [ ] **Step 4: Add partner invitation through the same membership model.**
- [ ] **Step 5: Run focused tests and build; commit `feat: add couple invitation onboarding`.**

### Task 5: Make the Guest Link State-Aware

**Files:**
- Create: `src/lib/guestExperience.ts`
- Create: `src/components/wedding/GuestHome.tsx`
- Create: `src/components/wedding/GuestBottomNav.tsx`
- Modify: `src/pages/WeddingPage.tsx`
- Modify: `src/components/wedding/RSVPSection.tsx`
- Test: `src/lib/guestExperience.test.ts`

**Interfaces:**
- `resolveGuestExperience(phase, guestState, settings)` returns prioritized sections and actions.
- Before wedding: Home, Schedule, Venue, RSVP, More.
- Wedding day before arrival: Home, Schedule, Directions, Check In, More.
- After check-in: Home, Schedule, Map, Capture, Wall.
- Post-wedding: Home, Photos, Moments, Wall, More.

- [ ] **Step 1: Write deterministic tests for upcoming, RSVP-pending, confirmed, declined, wedding-day, checked-in, live, completed, and archive states.**
- [ ] **Step 2: Build the mobile summary home with countdown, attendance state, next event, directions, calendar, and conditional check-in.**
- [ ] **Step 3: Add the mobile bottom navigation while preserving the long-form desktop page below/alongside it.**
- [ ] **Step 4: Simplify RSVP into a short progressive flow and render useful confirmation actions.**
- [ ] **Step 5: Run mobile-focused component tests, typecheck, and build; commit `feat: add state-aware guest wedding companion`.**

### Task 6: Connect RSVP Identity to Guest Sessions

**Files:**
- Modify: `supabase/migrations/20260904100000_notification_subsystem.sql`
- Create: `supabase/functions/create-guest-session/index.ts`
- Modify: `src/components/wedding/RSVPSection.tsx`
- Create: `src/lib/guestSession.ts`
- Test: `src/lib/guestSession.test.ts`

**Interfaces:**
- `create-guest-session` accepts a successful RSVP ID plus a server-verifiable proof and returns a raw token once.
- Browser stores the raw token locally; database stores only its SHA-256 hash.
- `getGuestSessionToken(weddingId)` reads the local token for future uploads, Wall posts, and check-in.

- [ ] **Step 1: Test token persistence, expiry handling, and no raw-token database writes.**
- [ ] **Step 2: Implement the Edge Function with RSVP/wedding validation and hashed token storage.**
- [ ] **Step 3: Call it after RSVP create/update and show `Welcome back` for a recognized guest.**
- [ ] **Step 4: Run focused tests and build; commit `feat: persist guest identity after RSVP`.**

### Task 7: Finish Server-Validated Check-In and Seating

**Files:**
- Modify: `src/components/wedding/SmartArrivalCheckin.tsx`
- Modify: `src/pages/WeddingCheckin.tsx`
- Modify: `supabase/functions/verify-guest-arrival/index.ts`
- Modify: `supabase/functions/guest-checkin/index.ts`
- Create: `supabase/functions/guest-checkin-qr/index.ts`
- Create: `src/components/wedding/GuestVenueMap.tsx`
- Test: `supabase/tests/checkin.sql`

**Interfaces:**
- `verify-guest-arrival` returns `verified`, `poor_accuracy`, `outside_radius`, or `qr_fallback`.
- `guest-checkin` accepts only a valid guest session and short-lived verification token, then emits `guest_arrived`.
- Precise coordinates are used for verification and are not retained unnecessarily.

- [ ] **Step 1: Test radius, accuracy, expired session, declined RSVP, duplicate check-in, and QR fallback behavior.**
- [ ] **Step 2: Replace direct public check-in inserts in the guest UI with the two-function flow.**
- [ ] **Step 3: Add wedding-day visibility rules and declined-guest suppression for check-in/table actions.**
- [ ] **Step 4: Use existing seating assignments to show `Table N` and render a personalized venue map.**
- [ ] **Step 5: Run SQL tests, typecheck, and build; commit `feat: secure guest arrival and seating`.**

### Task 8: Upgrade Memories Identity, Camera, and Storage

**Files:**
- Modify: `src/components/wedding/GuestPhotoWall.tsx`
- Modify: `src/components/wedding/Guestbook.tsx`
- Modify: `src/components/wedding/ShareMomentForm.tsx`
- Modify: `supabase/migrations/20260904100000_notification_subsystem.sql`
- Create: `supabase/functions/register-memory-upload/index.ts`
- Create: `supabase/functions/complete-memory-upload/index.ts`
- Test: `src/lib/imageUtils.test.ts`

**Interfaces:**
- `optimizeImage(file)` returns a display-quality JPEG with dimensions capped at 1800px and no raw camera upload when optimization succeeds.
- Memory records use `storage_path`, `display_storage_path`, `guest_session_id`, caption, dimensions, and status.
- Guest identity comes from the session, with one locally remembered display-name fallback for anonymous contributors.

- [ ] **Step 1: Test image resizing/compression and multi-file progress state.**
- [ ] **Step 2: Implement signed upload authorization and completion functions with wedding/session validation and file limits.**
- [ ] **Step 3: Update photo, Moment, and Wall creation to use the remembered session/name and generate `photo_uploaded`, `moment_created`, and `wall_message_created` events.**
- [ ] **Step 4: Preserve couple moderation, download-original, realtime, and existing storage cleanup behavior.**
- [ ] **Step 5: Run focused tests and build; commit `feat: unify Memories uploads and identity`.**

### Task 9: Complete Notification Registration and Processing

**Files:**
- Modify: `public/sw.js`
- Create: `src/lib/pushNotifications.ts`
- Create: `src/components/wedding/NotificationPrompt.tsx`
- Create: `src/components/wedding/GuestNotificationCenter.tsx`
- Create: `src/components/dashboard/NotificationPreferences.tsx`
- Create: `supabase/functions/register-push-subscription/index.ts`
- Create: `supabase/functions/update-notification-preferences/index.ts`
- Create: `supabase/functions/process-notifications/index.ts`
- Modify: `src/components/dashboard/DashboardLayout.tsx`
- Modify: `src/pages/CoupleDashboard.tsx`
- Test: `src/lib/pushNotifications.test.ts`

**Interfaces:**
- `registerPushSubscription({ weddingId, audienceType, session, subscription })` validates identity server-side and upserts one wedding/device record.
- Guest defaults are important alerts on and social alerts off.
- Couple defaults are arrivals/system immediate and RSVP/photos/moments/wall grouped.
- Every notification has a validated internal `target_url`.

- [ ] **Step 1: Test unsupported browsers, denied permission, prompt timing, subscription refresh, and safe internal target URLs.**
- [ ] **Step 2: Implement explicit prompt cards; call `Notification.requestPermission()` only after the user taps Enable.**
- [ ] **Step 3: Implement registration and preference Edge Functions with guest-session/couple-membership validation.**
- [ ] **Step 4: Implement event processing, grouping windows, in-app notification creation, Web Push delivery, retries, and expired-subscription disablement.**
- [ ] **Step 5: Add guest and couple notification centers/preferences without changing bottom-nav ownership.**
- [ ] **Step 6: Run focused tests, typecheck, and build; commit `feat: add Supabase notification engine`.**

### Task 10: Lifecycle Operations and Wedding-Day Mode

**Files:**
- Modify: `src/lib/weddingPhase.ts`
- Modify: `src/pages/CoupleDashboard.tsx`
- Modify: `src/pages/WeddingPage.tsx`
- Modify: `src/components/dashboard/OverviewCards.tsx`
- Create: `src/components/dashboard/WeddingDayMode.tsx`
- Test: `src/lib/weddingPhase.test.ts`

**Interfaces:**
- `getWeddingPhase(wedding, events, now)` remains deterministic and is the only phase resolver.
- Couple wedding-day mode reports arrivals/expected, recent arrivals, photos, Moments, Wall, and urgent updates.
- Completed mode retains uploads for a configurable seven-day window and then presents archive actions.

- [ ] **Step 1: Add boundary tests for event times, live mode, grace period, and archive transition.**
- [ ] **Step 2: Replace countdown-only wedding-day UI with operational couple and guest surfaces.**
- [ ] **Step 3: Add post-wedding memory/archive actions while retaining the public wedding route.**
- [ ] **Step 4: Run tests and build; commit `feat: add lifecycle-aware wedding day mode`.**

### Task 11: Production Verification and Handoff

**Files:**
- Modify: `README.md`
- Create: `docs/superpowers/checklists/forevervow-release.md`

- [ ] **Step 1: Run `tsc --noEmit`, `vite build`, all focused unit tests, and Supabase migration validation.**
- [ ] **Step 2: Verify mobile routes for guest upcoming, wedding day, check-in, Memories, couple Guests, Schedule, Memories, Website, Profile, and admin editor.**
- [ ] **Step 3: Verify RLS isolation with two wedding IDs and two couple accounts.**
- [ ] **Step 4: Verify service-worker push click routing only opens internal ForeverVow URLs.**
- [ ] **Step 5: Document required Supabase secrets (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`) and deployment commands without placing secrets in frontend or Git.**
- [ ] **Step 6: Commit `docs: add ForeverVow production release checklist`.**

## Coverage Gaps To Resolve Before Release

- The current public check-in table permits direct anonymous inserts; Task 7 must tighten or route that policy through the Edge Function.
- Existing shared access-code couple flows must remain available only as a migration/preview bridge until Task 2 and Task 3 are deployed.
- Notification tables already exist locally from the current build work, but the registration and processor functions in Task 9 are still required for real push delivery.
- The plan does not authorize deleting existing RSVP, guestbook, gallery, Moments, realtime, admin, or theme functionality.
