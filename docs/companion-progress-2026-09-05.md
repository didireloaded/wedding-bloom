# Companion Fixes: Paused to Conserve Usage

## Implemented Locally
- Owner password-recovery route and request button. Email delivery and redirect allowlist still need an end-to-end check; no password changed.
- Updates tab with saved wedding_updates; publishing and sharing moved into Profile. Old website-tab links resolve to Profile.
- RSVP accept/decline/not sure, session-token edits, transactional capacity check.
- Guest schedule fallback to the current wedding's ceremony/reception details and an honest empty state.
- Rounded activity/message panels, selected emoji removal, moderation errors surfaced.
- Service worker excludes API/cross-origin responses and restricts notification links to this app.
- Supabase types regenerated from live schema; project reference corrected.

## Applied to Supabase
- 20260904231810_companion_workflows.sql: missing wedding columns, member content permissions, private reports, approved-only public guestbook.
- 20260904233323_secure_guest_response.sql: transactional guest response RPC.
- Migrations were executed through db query, not recorded in migration history.
- Legacy anonymous RSVP insert policy remains for compatibility with the currently published frontend. Remove after coordinated frontend deployment; it can bypass the new RPC's capacity checks.

## Verification
- App TypeScript check passed.
- Production build passed (existing large-chunk warning).
- 12 tests passed, including schedule fallback and service-worker privacy.
- No browser acceptance pass or public deployment in this batch.

## Remaining
- Follow-up: signed guest uploads now implemented; register-memory-upload and complete-memory-upload deployed and malformed requests return 400. Full upload/device acceptance test still required. Couple photo realtime and 30-second foreground refresh added.
- Follow-up: notification prompt no longer reports false success; missing configuration remains explicit. Fabricated site map and hardcoded Google embed removed; real directions preserved. Remaining known reaction emojis replaced with lucide icons.
- Deploy frontend after browser checks; verify owner recovery redirect and email delivery.
- Real VAPID registration, reminder targeting, worker deployment, cron and closed-app device test.
- Secure guest photo upload/receipt pipeline and complete realtime refresh.
- Optional uploaded site plan and seating hotspots; remove fabricated map content.
- Complete calendar editing and consistent UI/emoji cleanup.
- AI provider configuration and authenticated reports, full workflow audit, post-wedding PDF.
- Do not deploy the existing create-guest-session endpoint without fixing its weak identity checks.
