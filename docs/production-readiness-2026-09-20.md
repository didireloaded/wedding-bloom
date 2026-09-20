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
- Closing legacy policies is staged for AFTER compatible frontend deployment.

## Next work / not verified

- Confirm frontend publication and legacy-policy closure; verify complete signed uploads
  on a test wedding. Upload quotas, orphan cleanup and retry idempotency remain open.
- Secure arrival/check-in deployment and authorized/unauthorized end-to-end tests.
- AI authorization across all actions, quotas, timeouts and wedding-scoped context.
- Closed-app push/device tests and actual reminder receipt; never send real guest tests
  without specific authorization.
- Onboarding/admin recovery acceptance; receipt upload/scanning, budget PDF,
  automatic keepsakes, mobile/calendar acceptance, monitoring/offline/privacy/staging.
- Optional seating/site plans, vendors, guest languages and digests require scope review.

The older companion-progress document is historical, not the current completion list.
