# Production Readiness Checkpoint

## Active work cycle

Resumed by explicit user instruction on 2026-09-20. Continue this active cycle
while both usage windows have more than 10% remaining. At the threshold, checkpoint
and wait according to the automation instructions. This is not a completion claim.

## Applied and verified on Supabase

- Restricted public member/admin helper policies to authenticated users. Anonymous
  events and guestbook reads now complete without helper permission errors.
- Removed the actual legacy push INSERT policy, Published weddings can register
  push subscriptions. Subscription registration remains through the existing endpoint.
- Restored storage SELECT for authenticated uploaders' own wedding-images only.
  Anonymous listing returns zero objects; a member query exposes no other owners' files.
- Guestbook BEFORE INSERT trigger forces approved=false. A transactional temporary
  probe verifies true, false and null inputs all become false without client content
  or notification side effects. Existing couple approval UPDATE remains unchanged.
- Authenticated member read smoke check succeeds. This is database-role simulation,
  not an end-to-end browser login test.

Regression SQL: supabase/tests/public_boundary_regression.sql.
No frontend or UI changes in this batch; no frontend deployment required.

## Guest content follow-up

- Guestbook and moment forms now submit through submit-guest-content with an RSVP
  session; photos use signed uploads tied to the wedding and session. The endpoint
  checks publication, stored size and JPEG signature, and constructs its own URL.
- Guestbook no longer claims AI approval or silently discards an upload error.
- New endpoint deployed; malformed input returns 400 and invalid session returns 401.
- App TypeScript check and 31 tests pass; production build passes with the existing
  large-chunk warning. Authenticated physical-device upload acceptance remains open.
- Frontend version 28 published successfully, then legacy direct guestbook/moment
  INSERT and guest storage-upload policies removed. Anonymous moment/guestbook reads
  succeed, storage listing remains empty, and direct inserts fail with insufficient
  privilege in rollback-only tests. Members now have explicit moment moderation rights.

## Arrival follow-up

- Applied atomic_guest_checkin and deployed guest-checkin / verify-guest-arrival.
- Check-in uses RSVP identity, not guest name. Session and RSVP row locks serialize
  retries; arrival, token consumption and notification queue insertion are atomic.
- Requires confirmed RSVP, published wedding, enabled geolocation check-in, configured
  opening/closing window (when supplied), and unexpired verification token.
- RPC execution restricted to service_role. Live unauthorized endpoint returns 401;
  missing location returns 400. Invalid coordinate ranges/accuracy are rejected.
- 33 tests pass. Rollback-only synthetic database tests verified invalid sessions/tokens,
  idempotent retry, distinct same-name parties and one notification per arrival.
- Physical-device location testing remains open. Browser GPS can be spoofed and is
  convenience verification, not strong physical identity proof. QR fallback and the
  frontend's misleading manual-fallback copy still need completion; do not claim QR works.
- Latest capacity checkpoint: 16% five-hour remaining, 33% weekly remaining.
  Do not start a batch that cannot safely finish above the user's 10% stop threshold.

## Next work / not verified

- Verify complete signed uploads on a test wedding. Upload quotas, orphan cleanup and
  retry idempotency remain open. Guestbook/moment posting now requires an RSVP session;
  already-open older clients must refresh to use the new submission flow.
- Arrival device acceptance, frontend fallback messaging and real venue QR workflow.
- AI endpoint hardening applied and deployed: only RSVP interpretation and public
  wedding chat remain unsigned; dashboard/admin flags and all planning/report/theme/
  moderation actions require a valid account. Public requests are limited to 20 per
  action/hour per network-browser identity; signed-in requests to 60. Atomic quota
  storage is service-role-only. Payloads, questions and history are bounded, provider
  calls time out after 25 seconds, and outputs are capped. Private chat and daily
  reports retain wedding membership/admin checks; public chat uses published wedding
  context only. Live checks returned 401/400/405 before provider calls, and the quota
  regression allowed two then denied the third request. No paid generation was used
  for verification. Provider billing ceilings and abuse monitoring remain operational
  configuration work; successful real provider responses need an authenticated test.
- Closed-app push/device tests and actual reminder receipt; never send real guest tests
  without specific authorization.
- Onboarding/admin recovery acceptance; receipt upload/scanning, budget PDF,
  automatic keepsakes, mobile/calendar acceptance, monitoring/offline/privacy/staging.
- Optional seating/site plans, vendors, guest languages and digests require scope review.

The older companion-progress document is historical, not the current completion list.
