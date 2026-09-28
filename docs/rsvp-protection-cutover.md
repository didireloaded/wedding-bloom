# Protected RSVP cutover

This change is prepared, not deployed. Do not publish its frontend or apply its
permission migration until all prerequisites below are met.

1. Create separate Cloudflare Turnstile widgets for staging and production.
   Restrict each widget to its exact website hostname. Set
   `VITE_TURNSTILE_SITE_KEY` at frontend build time and
   `TURNSTILE_SECRET_KEY` and `TURNSTILE_ALLOWED_HOSTNAMES` as Supabase Edge
   Function secrets. The latter is a comma-separated list of exact hostnames.
   Never expose the secret key
   secret in `VITE_*`, source, logs, or the service worker.
2. Reconcile Supabase migration history and use a disposable staging wedding.
   Deploy `submit-guest-response` first. It fails closed when configuration is
   absent. Confirm valid, invalid, expired, and replayed Turnstile tokens;
   capacity rejection; new RSVP; and existing-session edit. Check that errors
   do not issue a guest session. No real guest messages should be sent.
3. Publish the frontend with the production site key. Confirm a real guest can
   submit through the Edge Function and reopen their response. Keep direct RPC
   access during this compatibility window so older clients still work.
4. Apply `20260928120000_close_direct_guest_response_rpc.sql` only after the
   new frontend is live and working. Confirm anonymous and authenticated direct
   RPC calls are denied, while the Edge Function still submits successfully.
   Old cached clients will lose RSVP submission after this step; set a short
   cache lifetime or prompt them to refresh during the cutover.

The Edge Function validates Turnstile server-side, then consumes a 500-request
per-wedding hourly quota using the existing service-role-only quota RPC. This
is a backstop, not a guarantee against human-solved challenges or distributed
abuse. Watch rejection rates before changing quota. Do not claim production
readiness until a staging and live cutover pass are recorded.
