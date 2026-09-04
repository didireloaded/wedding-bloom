Absolutely. Paste this directly into Codex as:

`docs/superpowers/specs/2026-09-02-forevervow-pwa-wedding-experience-design.md`

````md
# ForeverVow PWA Wedding Experience
## Technical Design Specification

**Date:** 02 September 2026  
**Repository:** `didireloaded/wedding-bloom`  
**Backend:** Supabase  
**Frontend:** React + TypeScript + Vite  
**Status:** Approved architecture  
**Implementation rule:** Extend the existing application. Do not rebuild working systems from scratch.

---

# 1. Product Definition

ForeverVow is the digital home of a wedding from invitation to memories.

Every couple receives:

1. One personalized wedding website
2. One guest wedding link
3. One private couple dashboard
4. One admin-managed wedding configuration

The same wedding link becomes useful at different stages.

### Before the wedding

Invitation, RSVP, schedule, venue information, dress code, accommodation and reminders.

### Wedding day

Arrival, check-in, venue map, seating, schedule, live updates, guest photos, Moments and Wedding Wall.

### After the wedding

Guest photos, Moments, Wall messages, gallery, memory downloads and archive.

ForeverVow must **not** become:

- a vendor marketplace
- an expense tracker
- a wedding budget tool
- a supplier booking system
- a generic task manager
- a project-management application
- a general social network

The product principle is:

> The digital home for your wedding, from invitation to memories.

---

# 2. Existing Codebase

This specification applies to the existing repository:

```text
https://github.com/didireloaded/wedding-bloom
````

Codex must inspect the repository before making changes.

The application already contains working systems including:

```text
src/pages/AdminDashboard.tsx
src/pages/AdminLogin.tsx
src/pages/AdminWeddingEditor.tsx
src/pages/CoupleDashboard.tsx
src/pages/CoupleLogin.tsx
src/pages/Index.tsx
src/pages/WeddingCheckin.tsx
src/pages/WeddingPage.tsx
```

Existing guest components include functionality such as:

```text
InvitationOverlay
WeddingNav
WeddingHero
WeddingCountdown
WeddingStory
EventTimeline
VenueSection
DressCodeSection
WeddingUpdates
RSVPSection
Guestbook
GuestPhotoWall
LiveFeed
PhotoGallery
AccommodationSection
WeddingFooter
WeddingChatAssistant
```

There are also existing systems for:

```text
Guest Photos
Guestbook
Wedding Moments
Moment reactions
Photo management
Moments management
Realtime updates
RSVP
Check-ins
Wedding themes
Couple dashboard
Admin editing
Supabase Edge Functions
Supabase Storage
```

## Critical implementation instruction

**Do not create duplicate systems where a working feature already exists.**

Inspect and evolve:

```text
GuestPhotoWall
Guestbook
LiveFeed
ShareMomentForm
MomentCard
PhotoManager
MomentsManager
GuestMessages
WeddingCheckin
RSVPSection
CoupleDashboard
AdminWeddingEditor
```

Existing systems should be upgraded progressively.

---

# 3. High-Level Architecture

ForeverVow should use:

```text
React
TypeScript
Vite

Supabase Postgres
Supabase Storage
Supabase Realtime
Supabase Edge Functions
Supabase Cron
Supabase Auth for admin where already used

Web Push
VAPID
Service Worker
PWA
```

Do not introduce Firebase or OneSignal for the initial notification implementation.

The overall architecture is:

```text
                 FOREVERVOW
                     │
        ┌────────────┴────────────┐
        │                         │
     Guest PWA                Couple PWA
        │                         │
        └────────────┬────────────┘
                     │
                 Supabase
                     │
        ┌────────────┼────────────┐
        │            │            │
     Postgres      Storage     Realtime
        │
   Edge Functions
        │
 Notification Engine
        │
     Web Push
        │
   Guest / Couple
      Devices
```

---

# 4. Wedding Lifecycle

Create one central wedding lifecycle resolver.

Do **not** scatter random date checks throughout React components.

Example utility:

```ts
getWeddingPhase()
```

Possible phases:

```text
draft
upcoming
rsvp_closing
wedding_day
live
completed
archive
```

The wedding phase must be deterministic.

AI must never decide whether a wedding is today or whether an event has started.

---

# 5. Guest Lifecycle

Guest state exists separately from the wedding phase.

Possible guest states:

```text
unknown_guest
invited
rsvp_pending
rsvp_confirmed
rsvp_declined
near_venue
checked_in
```

The guest interface should be determined by:

```text
Wedding Phase
+
Guest State
+
Wedding Settings
```

---

# 6. Guest Experience Before Wedding

When the wedding is upcoming, prioritize:

```text
Invitation
Countdown
RSVP
Schedule
Venue
Directions
Dress Code
Accommodation
Add to Calendar
Updates
```

If the guest has not RSVP'd:

```text
RSVP
```

should be the strongest CTA.

Example:

```text
Will you be celebrating with us?

[ RSVP ]
```

Do not prioritize Photos, Map or Moments before RSVP.

---

# 7. Guest Experience After RSVP

Once the guest successfully RSVPs, the interface should recognize them.

Example:

```text
You're attending

Sarah +1
```

Primary actions become:

```text
View Schedule
Get Directions
Add to Calendar
Update RSVP
```

The guest should not repeatedly enter their name throughout ForeverVow.

---

# 8. Declined Guest Experience

If a guest declined:

```text
We'll miss you
```

They may still be allowed to:

```text
View the story
See approved gallery content
Leave a Wall message
View post-wedding memories
```

Do not show:

```text
Check In
Find My Table
Venue arrival
```

to declined guests.

---

# 9. Guest Sessions

Guests do not create accounts.

After RSVP, create a lightweight guest session.

Suggested table:

```sql
guest_sessions
```

Conceptual fields:

```text
id
wedding_id
rsvp_id
guest_id
session_token_hash
created_at
last_seen_at
expires_at
revoked_at
```

The browser stores the raw guest session token.

Supabase stores only the secure hash.

Never store the raw session token in the database.

The guest session allows ForeverVow to remember:

```text
Guest identity
RSVP
Party size
Attendance state
Notification subscription
Check-in state
Table assignment
Photo ownership
Moment ownership
Wall ownership
```

---

# 10. Anonymous Guests

If a wedding allows non-RSVP guests to contribute:

```text
Photos
Moments
Wall
```

ask for their display name once.

Remember that display name locally for that wedding.

Do not make them repeatedly type their name.

---

# 11. Couple Authentication Direction

Keep the current shared wedding access code for now.

However:

**Do not use the access code as the permanent device credential.**

Use:

```text
Access Code
↓
Server validation
↓
Secure couple device session
```

Suggested table:

```sql
couple_device_sessions
```

Fields:

```text
id
wedding_id
device_token_hash
device_name
created_at
last_seen_at
expires_at
revoked_at
```

This allows each partner's device to become independent.

Example:

```text
Towa's iPhone
Mathew's Samsung
```

Both access the same wedding.

But each device can have different notification settings.

---

# 12. Future Couple Accounts

The architecture should allow future support for:

```text
Partner 1 account
Partner 2 account
```

without rewriting the notification infrastructure.

For now:

```text
Access Code
→ Couple Device Session
```

is sufficient.

---

# 13. Couple Navigation

Keep the dashboard close to:

```text
Home
Guests
Schedule
Memories
Website
Profile
```

Rename Calendar to:

```text
Schedule
```

if necessary.

Rename Moments navigation to:

```text
Memories
```

where appropriate.

---

# 14. Couple Home Before Wedding

Remove generic productivity-app concepts.

Avoid things like:

```text
Let's Make Today Productive
Total Tasks
To Do
In Progress
In Review
Meeting with Client
```

Instead show:

```text
Wedding countdown
Wedding website readiness
Confirmed guests
Pending RSVPs
Declines
What needs attention
Wedding snapshot
Share wedding link
ForeverVow AI summary
```

Example:

```text
26 Days To Go

Wedding Website
86% Ready

Guests
68 Confirmed
12 Pending
4 Declined

Needs Your Attention
• 12 guests haven't RSVP'd
• Accommodation details are missing
```

---

# 15. Wedding Day Couple Dashboard

On wedding day:

```text
It's Your Wedding Day
```

Primary data:

```text
Guests Arrived
Guests Expected
Recent Arrivals
Photos
Moments
Wall Messages
Important Updates
```

Example:

```text
Arrivals

68 / 120

Recent Arrivals

Sarah +1
2 min ago

David
4 min ago
```

---

# 16. Post-Wedding Couple Dashboard

After the wedding:

```text
Your Wedding Memories
```

Primary information:

```text
Guests attended
Photos
Moments
Wall messages
Download Memories
View Gallery
Read Wall
Keep Website Live
Archive Wedding
```

---

# 17. PWA Push Notifications

Use native standards-based:

```text
Web Push
VAPID
Service Worker
Supabase
```

The current service worker must be extended.

Do not destroy working offline caching functionality unnecessarily.

---

# 18. Push Subscriptions

Create:

```sql
push_subscriptions
```

Suggested fields:

```text
id
wedding_id

audience_type

guest_session_id
couple_device_session_id

endpoint
p256dh_key
auth_key

user_agent
platform

enabled

created_at
updated_at
last_seen_at
```

`audience_type`:

```text
guest
couple
```

Every browser/device gets its own subscription.

Never assume one subscription per wedding.

---

# 19. Couple Notification Preferences

Create:

```sql
couple_notification_preferences
```

Fields:

```text
id
couple_device_session_id
category
delivery_mode
updated_at
```

Delivery modes:

```text
immediate
grouped
off
```

Recommended defaults:

```text
guest_arrival     immediate
new_rsvp          grouped
declined_rsvp     grouped
guest_photo       grouped
wall_message      grouped
wedding_moment    grouped
system_alert      immediate
```

Each partner controls their own device.

Example:

```text
Towa

Arrivals: Immediate
Photos: Off
RSVPs: Grouped
```

while:

```text
Mathew

Arrivals: Grouped
Photos: Grouped
RSVPs: Immediate
```

---

# 20. Guest Notification Preferences

Create:

```sql
guest_notification_preferences
```

Fields:

```text
id
push_subscription_id
important_alerts
social_alerts
updated_at
```

Default:

```text
important_alerts = true
social_alerts = false
```

### Important alerts

Examples:

```text
Schedule changes
Venue changes
Ceremony reminders
Reception reminders
Important wedding announcements
```

### Social alerts

Examples:

```text
New Moments
New photos
Celebration activity
```

Do not notify guests about every Wall post.

---

# 21. Notification Permission UX

Use a combination of first visit + contextual follow-up.

## First visit

Show an in-app card:

```text
Stay updated for Towa & Mathew's wedding.

Get important schedule, venue and wedding-day updates.

[ Enable Notifications ]
[ Not Now ]
```

Do **not** automatically call:

```ts
Notification.requestPermission()
```

on page load.

Only request native browser permission after the guest taps:

```text
Enable Notifications
```

---

# 22. Second Notification Prompt

If notifications were skipped, after successful RSVP show:

```text
Want wedding-day updates?

Get schedule changes, venue information and important reminders.

[ Enable Notifications ]
```

---

# 23. Wedding Day Notification Prompt

If still not enabled:

```text
Today's the day.

Turn on wedding alerts so you don't miss important updates.

[ Enable Notifications ]
```

Only show this final contextual reminder.

Do not continuously nag the guest.

---

# 24. iOS Considerations

Do not assume Web Push behaves exactly the same on every browser.

The app must remain fully usable when push is unavailable.

PWA installation must never be mandatory for guests.

Push notification UX should gracefully explain unsupported browser states.

---

# 25. Notification Events

Do not call Web Push directly from random frontend components.

Introduce a backend event layer.

Create:

```sql
notification_events
```

Fields:

```text
id
wedding_id
event_type
actor_type
actor_id
subject_id
payload
priority
created_at
processed_at
status
```

Example event types:

```text
rsvp_created
rsvp_updated
guest_checked_in
photo_uploaded
moment_created
wall_message_created
schedule_changed
venue_changed
wedding_live_started
event_reminder_due
wedding_completed
```

---

# 26. Notification Jobs

Create:

```sql
notification_jobs
```

Fields:

```text
id
wedding_id
event_id
category
audience
scheduled_for
status
attempts
last_error
created_at
processed_at
```

Statuses:

```text
pending
processing
sent
partial
failed
cancelled
```

---

# 27. Notification Deliveries

Create:

```sql
notification_deliveries
```

Fields:

```text
id
notification_event_id
push_subscription_id
title
body
target_url
sent_at
opened_at
delivery_status
error_code
```

This gives ForeverVow delivery auditing and debugging.

---

# 28. Notification Deduplication

Push delivery must be idempotent.

Create uniqueness based on something conceptually like:

```text
notification_event_id
+
push_subscription_id
+
notification_type
```

A retry must not deliver the same notification twice.

---

# 29. Notification Grouping

Grouped notifications should summarize activity.

Examples:

```text
8 guests arrived in the last 10 minutes
```

```text
5 new RSVPs received
```

```text
12 new wedding photos uploaded
```

If 20 guests arrive within a few minutes, do not send 20 separate pushes even when arrival notifications are set to Immediate.

High-volume bursts should collapse intelligently.

---

# 30. Notification Batches

If required, create:

```sql
notification_batches
```

Fields:

```text
id
wedding_id
recipient_device_id
category
window_started_at
window_ends_at
event_count
payload
sent_at
```

---

# 31. Notification Center

The existing couple dashboard bell should become functional.

Create persistent in-app notifications.

Suggested table:

```sql
in_app_notifications
```

Fields:

```text
id
wedding_id
recipient_type
recipient_device_id
category
title
body
target_url
read_at
created_at
```

Couple filters:

```text
All
Guests
Memories
System
```

Guest notification center should remain much simpler.

---

# 32. Push Deep Links

Every push notification must take the user somewhere useful.

Examples:

```text
RSVP
/couple-dashboard?tab=guests
```

```text
Arrival
/couple-dashboard?tab=guests&view=arrivals
```

```text
Photo
/couple-dashboard?tab=moments&view=photos
```

```text
Wall
/couple-dashboard?tab=moments&view=wall
```

```text
Guest schedule update
/wedding/{slug}#events
```

```text
Guest venue update
/wedding/{slug}#venue
```

Validate all target routes server-side.

Do not allow arbitrary external URLs in push payloads.

---

# 33. Service Worker

Extend:

```text
public/sw.js
```

with:

```js
self.addEventListener("push", ...)
```

and:

```js
self.addEventListener("notificationclick", ...)
```

Notification click behavior:

1. Look for an existing ForeverVow window.
2. Focus it if appropriate.
3. Navigate it to the target route.
4. Otherwise open a new ForeverVow window.

Preserve existing caching/offline behavior.

---

# 34. Push Edge Functions

Add or evolve Edge Functions.

Suggested functions:

```text
register-push-subscription
update-notification-preferences
enqueue-notification-event
process-notifications
couple-device-session
```

---

# 35. register-push-subscription

Responsibilities:

```text
Validate wedding
Validate guest/couple session
Register browser subscription
Refresh existing subscription
Update last seen
Attach correct wedding
Attach correct device identity
```

Never allow a subscription to be attached to another wedding through client-supplied IDs alone.

---

# 36. process-notifications

Responsibilities:

```text
Load notification event
Determine recipients
Load preferences
Determine Immediate / Grouped / Off
Create in-app notifications
Send Web Push
Record deliveries
Handle retries
Disable expired subscriptions
```

---

# 37. VAPID Security

VAPID private credentials must exist only in Supabase server-side secrets.

Never place private keys in:

```text
VITE_*
frontend source
public files
service worker source
Git repository
```

The public VAPID key may safely be exposed where required by Web Push.

---

# 38. Wedding Check-In Settings

Create:

```sql
wedding_checkin_settings
```

Fields:

```text
id
wedding_id

latitude
longitude
radius_meters

checkin_enabled
geolocation_enabled
qr_checkin_enabled

checkin_opens_at
checkin_closes_at

created_at
updated_at
```

Admin controls the venue radius.

Example:

```text
Small venue: 75–150m
Large venue: 200–500m
```

Do not hardcode one universal radius.

---

# 39. Wedding-Day Arrival Flow

The approved arrival flow is:

```text
Guest opens wedding
↓
Wedding is today
↓
Guest chooses Check My Location
↓
Browser requests geolocation
↓
Coordinates sent to Supabase
↓
Server calculates distance
↓
Guest is inside venue radius
↓
Looks like you've arrived
↓
Guest taps I'm Here
↓
Check-in created
↓
Couple notified
```

Do not silently check guests in.

---

# 40. Geolocation Verification

Create Edge Function:

```text
verify-guest-arrival
```

Input:

```text
wedding_id
guest_session
latitude
longitude
accuracy
timestamp
```

Backend must load the true venue coordinates.

Do not trust a client field such as:

```text
isInsideVenue = true
```

Server calculates the distance using a proper geographic distance formula.

---

# 41. Location Accuracy

Verification should consider:

```text
distance
GPS accuracy
configured radius
```

Example:

```text
distance: 72m
accuracy: ±18m
radius: 150m

= verified
```

Bad accuracy example:

```text
accuracy: ±800m
```

Return:

```text
poor_accuracy
```

Guest UI:

```text
We couldn't confirm your location accurately.

[ Try Again ]
[ Use Venue QR ]
```

---

# 42. Arrival Verification Token

Once geolocation passes, return a short-lived server-signed verification token.

Example flow:

```text
verify-guest-arrival
↓
verification token
↓
"I'm Here"
↓
guest-checkin
```

This avoids blindly trusting old browser coordinates.

The verification token should expire quickly.

---

# 43. Guest Check-In Function

Create:

```text
guest-checkin
```

Inputs conceptually:

```text
wedding_id
guest_session
arrival_verification_token
method
```

Check-in methods:

```text
geolocation
qr
manual_staff
```

---

# 44. Check-In Data

Evolve the current `checkins` system.

Potential fields:

```text
id
wedding_id
guest_id
rsvp_id
guest_name
party_size
checkin_method
checked_in_at
verified
distance_m
location_accuracy
```

Avoid permanently storing precise guest GPS coordinates unless there is a strong requirement.

ForeverVow does not need a movement history.

---

# 45. Duplicate Check-In

A guest must not check in repeatedly.

Enforce a database-level constraint equivalent to:

```text
unique(wedding_id, guest identity)
```

If already checked in:

```text
You're already checked in.
```

Return the existing check-in rather than creating a duplicate.

---

# 46. Current Check-In Page

The existing:

```text
WeddingCheckin.tsx
```

must be evolved rather than replaced blindly.

The current direct-client database insert should move toward the secure Edge Function flow.

Do not allow the public browser to fetch every RSVP in the wedding to perform fuzzy name matching.

RSVP resolution should happen server-side.

---

# 47. QR Check-In

Every wedding may receive a venue check-in QR.

Do not make the trusted QR simply:

```text
/wedding/towa-mathew/checkin
```

Use a signed wedding-specific token:

```text
/wedding/towa-mathew/checkin?t={SIGNED_TOKEN}
```

Token should encode/verify:

```text
wedding
purpose = checkin
expiration where required
signature
```

---

# 48. QR Guest Flow

If the guest already has a session:

```text
Welcome Sarah

[ Check In ]
```

If no guest session exists:

```text
Enter the name used for your RSVP.
```

The server resolves their RSVP.

Do not return the full guest list to the browser.

---

# 49. Couple Arrival Notifications

Check-in creates:

```text
guest_checked_in
```

notification event.

Example Immediate notification:

```text
Sarah +1 just arrived
```

Grouped:

```text
8 guests arrived in the last 10 minutes
```

Off:

No push.

The dashboard still updates regardless.

---

# 50. Venue Map

Add an interactive venue/site map.

Version one is:

```text
Uploaded layout image
+
Interactive hotspots
```

Do not build turn-by-turn indoor navigation yet.

---

# 51. Venue Map Table

Create:

```sql
venue_maps
```

Fields:

```text
id
wedding_id
name
image_storage_path
width
height
version
published
created_at
updated_at
```

Supported image types may include:

```text
PNG
JPEG
WEBP
SVG where safe
```

---

# 52. Venue Hotspots

Create:

```sql
venue_map_hotspots
```

Fields:

```text
id
venue_map_id
type
label
description
x_percent
y_percent
icon
visible
sort_order
metadata
```

Use:

```text
x_percent
y_percent
```

instead of raw pixels.

Example:

```text
62.4
38.2
```

This keeps hotspot positioning responsive.

---

# 53. Hotspot Types

Support:

```text
entrance
parking
ceremony
reception
table
bar
food
bathroom
stage
dj
dancefloor
photobooth
gift_table
kids
smoking
exit
```

The schema should support additional hotspot types later.

---

# 54. Hotspot UX

Tap:

```text
BAR
```

Display bottom sheet:

```text
Main Bar

Drinks are served here throughout the reception.
```

Tap:

```text
Bathrooms
```

Display:

```text
Bathrooms

Located beside the main reception entrance.
```

---

# 55. Seating

Do not build a huge seating planner.

Create a simple table-assignment system.

Suggested:

```sql
seating_tables
```

Fields:

```text
id
wedding_id
name
number
capacity
venue_map_hotspot_id
```

Create:

```sql
seating_assignments
```

Fields:

```text
id
wedding_id
guest_id
rsvp_id
seating_table_id
seat_label
```

Reuse existing tables if the repo already contains suitable seating data.

---

# 56. Find My Table

After check-in, guest sees:

```text
Your Table

Table 7

[ Find My Table ]
```

Clicking it opens the venue map and highlights the assigned table hotspot.

Example:

```text
YOU ARE HERE
or
YOUR TABLE
```

Do not expose other guests' private seating information.

---

# 57. Admin Venue Map Editor

Add to the existing admin wedding editor.

Admin workflow:

```text
Upload map
↓
Click location
↓
Add hotspot
↓
Choose type
↓
Enter label
↓
Save
```

Admin can:

```text
Drag hotspots
Edit hotspots
Delete hotspots
Hide hotspots
Preview map
Publish map
```

Couples should mainly preview the venue map.

Do not burden couples with map-building unless explicitly enabled later.

---

# 58. Guest Wedding-Day Navigation

Before wedding:

```text
Home
Schedule
Venue
RSVP
More
```

Wedding day before check-in:

```text
Home
Schedule
Directions
Check In
More
```

After check-in:

```text
Home
Schedule
Map
Capture
Wall
```

Post-wedding:

```text
Home
Photos
Moments
Wall
More
```

---

# 59. Guest Wedding-Day Home

After check-in:

```text
Welcome to Towa & Mathew's Wedding

Sarah +1
Checked In
```

Show:

```text
Up Next

Ceremony
14:00
```

Then:

```text
Your Table

Table 7

[ Find My Table ]
```

Quick actions:

```text
Venue Map
Take Photo
Wedding Wall
```

---

# 60. Schedule Intelligence

Use deterministic schedule logic.

Example schedule:

```text
14:00 Ceremony
16:00 Cocktails
18:00 Reception
19:30 Dinner
21:00 Party
```

At 13:45:

```text
Up next:
Ceremony in 15 minutes
```

At 17:50:

```text
Reception begins in 10 minutes
```

No AI required.

---

# 61. Schedule Change Notifications

If admin changes:

```text
Reception
18:00
```

to:

```text
18:30
```

create:

```text
schedule_changed
```

event.

Guests with Important Alerts enabled receive:

```text
Schedule Update

Reception will now begin at 18:30.
```

---

# 62. Venue Announcements

Allow important venue announcements.

Example:

```text
Important Venue Update

Please use the eastern entrance for tonight's reception.
```

These should be treated as Important Alerts.

---

# 63. Memories

The couple-facing section should be called:

```text
Memories
```

Inside:

```text
Photos
Moments
Wall
```

Do not introduce more overlapping content types.

---

# 64. Photos Definition

Photos are:

> Pure photographs captured or selected by guests.

Guests can:

```text
Take Photo
Choose From Phone
Upload Multiple
Add optional caption
```

---

# 65. Moments Definition

Moments are:

> Social wedding posts containing a photo and/or message.

Example:

```text
[ Photo ]

Sarah
Best entrance ever 😂

♥ 18
👏 7
🎉 11
```

Keep reactions limited.

Suggested:

```text
heart
applause
celebrate
```

Do not turn ForeverVow into Instagram.

---

# 66. Wedding Wall Definition

Wall is:

> Messages written directly to the couple.

Example:

```text
Leave something for Towa & Mathew

[ Write your message... ]

[ Add Photo ]

[ Post to Wall ]
```

Evolve the existing Guestbook into Wedding Wall.

Do not create a second redundant message system.

---

# 67. Guest Identity in Memories

If Sarah has a guest session, uploading a photo should automatically identify:

```text
Sarah
```

Do not ask her for her name again.

This same identity should apply to:

```text
Photos
Moments
Wall
```

---

# 68. Capture Experience

Wedding day primary action:

```text
Capture
```

Screen:

```text
Capture the Moment

[ Take Photo ]

[ Choose From Phone ]
```

Where supported, `Take Photo` should use a camera capture input.

Example:

```html
<input
  type="file"
  accept="image/*"
  capture="environment"
/>
```

Do not rely on browser capture support being identical everywhere.

---

# 69. Photo Preview

After capture:

```text
[ Image preview ]

[ Retake ]

Add a caption...
```

Then:

```text
[ Share With Couple ]
```

---

# 70. Multiple Upload

Allow:

```text
Choose From Phone
```

to select multiple images.

Example:

```text
8 photos selected

[ thumbnails ]

[ Upload 8 Photos ]
```

Show upload progress per image.

---

# 71. Photo Compression

Phone photos may be very large.

Before upload, where practical:

```text
Original
↓
Correct orientation
↓
Resize display copy
↓
Compress display copy
↓
Upload
```

Keep quality high enough for wedding memories.

Where supported by the product configuration, keep:

```text
High-quality/original
+
Optimized display version
```

---

# 72. Storage Structure

Organize memory storage cleanly.

Example bucket/path structure:

```text
wedding-memories/
    {wedding_id}/
        photos/
        moments/
        wall/
```

Database records should store storage paths.

Do not rely only on hardcoded public URLs.

---

# 73. Guest Photos Table

Evolve existing:

```sql
guest_photos
```

Potential fields:

```text
id
wedding_id
guest_id
guest_session_id
rsvp_id

storage_path
display_storage_path

caption

mime_type
width
height
file_size

status

captured_at
uploaded_at

approved_at
approved_by

hidden_at
deleted_at
```

Status:

```text
pending
approved
hidden
rejected
```

---

# 74. Secure Upload Flow

Progressively move away from unrestricted browser upload + direct database inserts.

Preferred flow:

```text
Guest selects image
↓
Frontend requests upload authorization
↓
Edge Function validates wedding/session
↓
Signed upload target returned
↓
Browser uploads
↓
complete-memory-upload
↓
Database record created
↓
Notification event created
```

---

# 75. Upload Authorization

The backend should validate:

```text
Wedding exists
Uploads enabled
Guest/session allowed
Maximum file size
Allowed MIME type
Upload count/rate limit
Correct storage path
```

---

# 76. Existing GuestPhotoWall

Do not throw away:

```text
GuestPhotoWall.tsx
```

Upgrade it to use:

```text
Guest session
Secure upload flow
Improved storage
Realtime
Moderation state
Multi-upload progress
```

---

# 77. Existing ShareMomentForm

Do not replace the existing Moment functionality unnecessarily.

Upgrade it to:

```text
Use guest session identity
Avoid repeated name field
Use secure storage flow
Connect notification events
Use improved moderation
```

---

# 78. Existing Guestbook

Evolve:

```text
Guestbook.tsx
```

into the Wedding Wall.

Preserve useful functionality such as:

```text
Messages
Optional photos
Moderation
Approval
```

Rename/reframe guest-facing UX to:

```text
Wedding Wall
```

---

# 79. Moments Backend

Evolve:

```sql
wedding_moments
```

Potential fields:

```text
id
wedding_id
guest_id
guest_session_id
message
photo_id
status
highlighted
created_at
approved_at
```

Reuse current schema where possible.

---

# 80. Reactions

Keep the existing reactions system if already functional.

Suggested reactions:

```text
heart
applause
celebrate
```

No comments-on-comments.

No follower system.

No user profiles.

---

# 81. Supabase Realtime for Memories

Realtime should update open interfaces.

Examples:

```text
Approved Moment
↓
Realtime
↓
Guest live feed updates
```

```text
New check-in
↓
Realtime
↓
Couple arrivals counter updates
```

```text
Approved Wall message
↓
Realtime
↓
Wedding Wall updates
```

Do not force-scroll the user when new posts arrive.

Display:

```text
3 new moments
```

with a tap action.

---

# 82. Moderation

Each wedding can support:

```text
Photos:
Automatic / Manual

Moments:
Automatic / Manual

Wall:
Automatic / Manual
```

Recommended Live Mode default:

```text
Photos: automatic
Moments: automatic or AI-assisted
Wall: AI-assisted
```

Couple/admin should retain final control.

---

# 83. AI Moderation

AI can help classify:

```text
spam
offensive content
obvious inappropriate content
uncertain content
```

Outputs:

```text
safe
uncertain
unsafe
```

Use reversible moderation.

AI must **not permanently delete** guest content automatically.

---

# 84. Claude AI

If AI architecture is upgraded, ForeverVow should use Claude through Supabase Edge Functions.

Pattern:

```text
ForeverVow frontend
↓
Supabase Edge Function
↓
Anthropic Claude
↓
Structured JSON
```

Secrets:

```text
ANTHROPIC_API_KEY
ANTHROPIC_MODEL
```

Never place Anthropic secrets in the browser.

---

# 85. AI Boundaries

Use code/database logic for:

```text
Wedding dates
Guest counts
Check-in state
Venue distance
Table assignment
Schedule reminders
Wedding phase
Current event
RSVP state
```

Use AI for:

```text
Summaries
Suggested actions
Draft messages
Dietary summaries
Moderation assistance
Wedding activity summaries
```

AI must never fabricate wedding facts.

---

# 86. Couple Memories Dashboard

Inside:

```text
Memories
```

show:

```text
487 Photos
73 Moments
142 Wall Messages
```

Photo filters:

```text
All
New
Approved
Hidden
```

Photo detail:

```text
Guest name
Caption
Captured time
Download
Approve
Hide
Delete
```

---

# 87. Bulk Memory Management

Allow selecting multiple photos.

Actions:

```text
Approve
Hide
Download
Delete
```

Do not require couples to open hundreds of individual photographs.

---

# 88. Wedding Memory Export

For large exports:

```text
Couple requests download
↓
Export job created
↓
Archive generated
↓
Temporary secure URL created
↓
Couple downloads ZIP
```

Possible exports:

```text
All Memories
Guest Photos
Wall Messages
```

Do not make the browser individually download 500 files.

---

# 89. EXIF Privacy

Public/display images should remove unnecessary sensitive metadata.

Especially remove:

```text
Precise GPS coordinates
Camera/device serial identifiers where applicable
```

Do not unintentionally publish where a guest took a photo.

---

# 90. Offline Memory Uploads

Wedding venues may have poor connectivity.

Guest uploads should support local queueing where practical.

States:

```text
Waiting
Uploading
Uploaded
Failed
```

Example:

```text
5 memories waiting to upload
```

When connectivity returns:

```text
Queue resumes
↓
Uploads succeed
↓
Status changes to Uploaded
```

Never display success until the server confirms it.

---

# 91. Offline Wedding Information

Cache read-only wedding-day essentials.

Examples:

```text
Couple names
Wedding date
Schedule
Venue name
Venue map
Venue hotspots
Guest's table
Previously loaded updates
```

When offline:

```text
You're offline
```

should appear.

Do not show a blank page.

---

# 92. Scheduled Notifications

Use Supabase Cron for scheduled reminders.

Possible flow:

```text
Cron
↓
Find due notification jobs
↓
Enqueue notification events
↓
Process notifications
```

Suggested reminders:

```text
Wedding today
Ceremony in 1 hour
Reception in 15 minutes
RSVP deadline approaching
```

Only configured events should notify guests.

Do not notify them for every timeline entry.

---

# 93. RSVP Deadline

If RSVP deadline approaches:

Guest who hasn't responded:

```text
RSVP closes in 3 days
```

Couple:

```text
12 guests still haven't responded
```

Optional grouped push:

```text
RSVP deadline approaching

12 guests are still pending.
```

---

# 94. Wedding Morning Notification

Guest Important Alerts:

```text
Towa & Mathew's wedding is today

Ceremony begins at 14:00.
```

Deep link:

```text
/wedding/towa-mathew
```

---

# 95. Ceremony Reminder

Example:

```text
Ceremony begins in 1 hour
```

Only if that wedding has ceremony reminders enabled.

---

# 96. Post-Wedding Transition

After the last scheduled event plus a configurable grace period:

```text
live
↓
completed
```

Guest experience becomes:

```text
Thank You for Celebrating With Us
```

Primary actions:

```text
View Photos
Wedding Moments
Write on the Wall
Share Your Photos
```

---

# 97. Guest Upload Window

Allow admin/couple to configure:

```text
Guest uploads available until
```

Example:

```text
7 days after wedding
```

or:

```text
30 days after wedding
```

Do not require uploads to close immediately after the wedding.

---

# 98. Archive Mode

After the post-wedding period:

```text
completed
↓
archive
```

Options:

```text
Keep Website Live
Private Archive
Disable Guest Access
```

---

# 99. PWA Installation

Guests:

**Never require installation.**

The full wedding experience must work through the normal link.

Couple dashboard may gently suggest:

```text
Add ForeverVow to your Home Screen

Get faster access to your wedding dashboard and notifications.

[ Install ]
```

Do not show the install prompt immediately on login.

---

# 100. Couple PWA Launch

If installed and a secure couple device session is valid:

```text
Open ForeverVow
↓
Couple Dashboard
```

Do not unnecessarily send them to the marketing landing page.

---

# 101. PWA Manifest

Review the current manifest.

The current naming should no longer describe ForeverVow as a generic:

```text
Wedding Planner
```

Preferred branding:

```text
ForeverVow
```

or:

```text
ForeverVow — Your Wedding
```

Do not make the product positioning sound like a traditional planning tool.

---

# 102. Service Worker Cache Naming

Clean up outdated naming such as:

```text
evervow-v1
```

if still present.

Use a ForeverVow versioned cache strategy.

Example:

```text
forevervow-v2
```

Cache migration must not break existing installed PWAs.

---

# 103. Admin Features

Extend existing AdminWeddingEditor.

Add sections for:

```text
Check-In Settings
Venue Coordinates
Arrival Radius
QR Check-In
Venue Map
Hotspots
Seating Assignment
Notification Defaults
Guest Reminders
Post-Wedding Upload Window
Archive Settings
```

Do not create a second admin dashboard.

---

# 104. Couple Website Settings

The couple Website tab should focus on simple controls:

```text
Share Wedding Link
QR Code
Preview Website
Published / Draft
Section Visibility
Simple Wedding Details
Theme
Venue Map Preview
```

Do not expose raw admin complexity.

---

# 105. Security: Wedding Isolation

Every new table must enforce wedding isolation.

Data from:

```text
Wedding A
```

must never be readable or writable from:

```text
Wedding B
```

This includes:

```text
Guest sessions
Couple sessions
Push subscriptions
Notification events
Notification jobs
Check-ins
Maps
Hotspots
Tables
Seating
Photos
Moments
Wall messages
```

---

# 106. Security: Couple Access Code

Review the current architecture for places where:

```text
access_code
```

may be publicly selected.

Public wedding queries should not expose the couple access code.

Move couple authorization toward:

```text
Edge Function
+
Secure device session
```

Do not rely on `sessionStorage` access code alone for sensitive backend authorization.

---

# 107. Security: Guest Lists

Public guest pages must not fetch the full RSVP guest list.

Name resolution for QR/manual check-in should occur server-side.

Do not return all guest names to the browser.

---

# 108. Security: Push Subscriptions

Push endpoints and keys are private application data.

Apply RLS.

Guests should only manage their own subscription.

Couple devices should only manage their own subscriptions.

Public wedding visitors must not be able to enumerate subscriptions.

---

# 109. Security: Storage

Use controlled storage paths.

Example:

```text
wedding_id
+
content type
+
generated object ID
```

Do not allow guests to choose arbitrary storage locations.

Validate:

```text
MIME type
file size
wedding
session
upload limits
```

---

# 110. Security: QR

Check-in QR must use signed tokens.

Do not trust:

```text
wedding slug alone
```

as proof of venue check-in.

---

# 111. Geolocation Privacy

ForeverVow must not continuously monitor guest location.

Flow:

```text
Guest taps Check My Location
↓
Read current location
↓
Verify
↓
Check in
↓
Stop
```

No background route tracking.

No travel history.

No live GPS map of guests.

---

# 112. Realtime vs Push

Use Supabase Realtime when the application is open.

Use Web Push when notification delivery outside the active screen is needed.

Example:

```text
Maria checks in
↓
checkins table updated
↓
Realtime updates open dashboard
↓
Push notification sent if enabled
```

Check-in remains valid even if push fails.

---

# 113. Source of Truth

Push notification delivery must never be the source of truth.

Correct architecture:

```text
Database Event
↓
Notification Event
↓
Push Attempt
```

Not:

```text
Push Success
↓
Create Database Record
```

---

# 114. Error Handling

## Location denied

Show:

```text
We couldn't access your location.

[ Use Venue QR ]
```

## Poor GPS accuracy

Show:

```text
We couldn't confirm your location accurately.

[ Try Again ]
[ Use Venue QR ]
```

## Outside venue

Show:

```text
We can't confirm that you've reached the venue yet.
```

Do not reveal internal exact coordinates.

## Already checked in

Show:

```text
You're already checked in.
```

## Push unavailable

Keep in-app notifications working.

## Upload fails

Keep local pending state.

Do not falsely mark the upload as successful.

---

# 115. Testing Strategy

Implementation must include tests.

## Wedding lifecycle

Test:

```text
Upcoming
RSVP closing
Wedding day
Live
Completed
Archive
Timezone boundaries
```

## Guest sessions

Test:

```text
Session created after RSVP
Returning guest recognized
Expired session
Revoked session
Cross-wedding rejection
```

## Couple device sessions

Test:

```text
Access code exchange
Multiple devices
Independent preferences
Revocation
Cross-wedding rejection
```

## Push

Test:

```text
Subscribe
Refresh subscription
Guest preference filtering
Couple preference filtering
Immediate
Grouped
Off
Expired subscription
Deduplication
Deep links
```

## Check-in

Test:

```text
Inside radius
Outside radius
Poor accuracy
Duplicate check-in
Valid QR
Invalid QR
Expired QR
Wrong wedding
```

## Venue map

Test:

```text
Responsive hotspot placement
Hidden hotspots
Missing map
Table highlight
No table assignment
```

## Memories

Test:

```text
Single photo
Multiple photos
Failed upload
Retry
Wrong wedding
Moderation
Bulk actions
Realtime Moments
Wall messages
```

## Offline

Test:

```text
Schedule cached
Map cached
Guest table cached
Pending photo queue
Reconnect upload
```

---

# 116. Rollout Plan

Implement the system in controlled vertical slices.

Do not build every subsystem simultaneously.

Recommended order:

```text
1. Secure couple device sessions
2. Guest sessions
3. Notification database model
4. In-app notification center
5. Web Push subscriptions
6. Service worker push handling
7. Notification event engine
8. Per-device notification preferences
9. Geolocation arrival verification
10. Secure guest check-in
11. Signed QR fallback
12. Venue map
13. Hotspots
14. Seating assignment
15. Memories identity improvements
16. Secure photo uploads
17. Offline upload queue
18. Wedding phase-driven guest UI
19. Wedding phase-driven couple UI
20. Scheduled reminders
21. Post-wedding archive
22. Memory export
```

Existing functionality must continue to work while each replacement path is introduced.

---

# 117. Migration Strategy

For every existing table:

```text
rsvps
checkins
guest_photos
guestbook
wedding_moments
events
weddings
```

inspect the current database schema first.

Do not blindly create new versions.

If existing fields can safely support the new feature:

```text
ALTER TABLE
```

rather than creating duplicate tables.

Migrations must be:

```text
idempotent where practical
reversible where practical
safe for existing wedding records
```

---

# 118. No Destructive Rewrites

Codex must not:

```text
Delete the current RSVP system
Replace the entire WeddingPage
Replace the whole CoupleDashboard
Rebuild the admin application
Remove Realtime
Delete working Moments
Delete guest photos
Delete the existing guestbook data
```

without strong technical justification.

This project should evolve.

Not restart.

---

# 119. Current Guest Check-In Upgrade

Current architecture:

```text
Guest enters name
↓
Browser inserts checkin
↓
Browser searches RSVPs
```

Target architecture:

```text
Guest session / QR identity
↓
Arrival verification
↓
Supabase Edge Function
↓
Server-side RSVP resolution
↓
Secure check-in
↓
Notification event
↓
Realtime + Push
```

---

# 120. Current Guest Photos Upgrade

Current architecture roughly:

```text
Browser chooses file
↓
Browser uploads directly
↓
Browser generates public URL
↓
Browser inserts guest photo
```

Target:

```text
Guest identity
↓
Upload authorization
↓
Validated storage path
↓
Upload
↓
Server finalization
↓
guest_photos
↓
Moderation
↓
Notification event
```

---

# 121. Current Guestbook Upgrade

Current Guestbook should become:

```text
Wedding Wall
```

Preserve existing historical messages.

If table name remains:

```sql
guestbook
```

that is acceptable initially.

User-facing terminology can become:

```text
Wall
```

without forcing a risky database rename.

---

# 122. Current Moments Upgrade

Keep:

```text
wedding_moments
```

and the current Moments components where appropriate.

Improve:

```text
Guest identity
Photo storage
Moderation
Realtime
Notifications
Deep linking
```

---

# 123. AI Architecture

Where AI is used, centralize it.

Preferred:

```text
ForeverVow
↓
Supabase Edge Function AI core
↓
Anthropic Claude
↓
Structured response
```

Avoid different frontend components directly calling different AI providers.

---

# 124. AI Safety Rule

Claude must only reason from supplied wedding data.

It may say:

```text
12 guests haven't responded.
```

only if:

```text
12
```

came from actual database data.

It must not invent:

```text
guest counts
dates
locations
schedule times
cultural themes
dress codes
venue assumptions
```

---

# 125. Non-Goals

Do not build in this phase:

```text
Vendor marketplace
Budget management
Supplier payments
Expense tracking
Full seating-chart designer
Indoor navigation
Continuous geolocation
Guest accounts/passwords
Followers
Direct messages
Social profiles
Public social feed across weddings
Mandatory app installation
```

---

# 126. Success Criteria

The implementation is successful when:

### Guest

A guest can:

```text
Open one wedding link
RSVP without an account
Return and be recognized
Enable wedding notifications
Receive useful updates
Reach the venue
Verify location
Check in
Use QR fallback
See their table
Explore venue map
Take photos
Upload photos
Share Moments
Write on the Wall
View post-wedding memories
```

### Couple

Each partner can:

```text
Use their own phone
Use the same wedding access code initially
Receive a secure device session
Have independent push settings
See RSVPs
See arrivals
Receive arrival notifications
Manage photos
Manage Moments
Read Wall messages
Download wedding memories
Archive the wedding
```

### Admin

Admin can:

```text
Configure check-in
Set venue location
Choose check-in radius
Generate QR
Upload venue layout
Add hotspots
Configure seating
Publish map
Configure reminders
Moderate content
Manage post-wedding state
```

---

# 127. Final Guest Flow

```text
Invitation
↓
RSVP
↓
Guest Session
↓
Notifications
↓
Upcoming Wedding
↓
Wedding Day
↓
Directions
↓
Check My Location
↓
Arrival Verification
↓
I'm Here
↓
Check-In
↓
My Table
↓
Venue Map
↓
Capture
↓
Moments
↓
Wedding Wall
↓
Post-Wedding Memories
```

---

# 128. Final Couple Flow

```text
Access Code
↓
Secure Device Session
↓
Wedding Dashboard
↓
Share Invitation
↓
Monitor RSVPs
↓
Wedding Day
↓
Guest Arrivals
↓
Realtime Activity
↓
Photos
↓
Moments
↓
Wedding Wall
↓
Memory Archive
```

---

# 129. Final Admin Flow

```text
Create / Import Wedding
↓
Review
↓
Theme
↓
Images
↓
Schedule
↓
Venue
↓
Check-In Setup
↓
QR
↓
Venue Map
↓
Hotspots
↓
Seating
↓
Notification Settings
↓
Publish
↓
Wedding-Day Monitoring
↓
Post-Wedding
↓
Archive
```

---

# 130. Core Product Rule

Every implementation decision should reinforce this:

> Before the wedding, ForeverVow is the invitation and information hub.

> During the wedding, ForeverVow becomes the guest companion.

> After the wedding, ForeverVow becomes the memory archive.

The platform should feel like **one continuous wedding experience**, not a collection of unrelated features.

---

# 131. Codex Implementation Rules

Before modifying any file:

1. Inspect the existing implementation.
2. Inspect existing Supabase migrations.
3. Inspect existing generated Supabase types.
4. Inspect existing RLS policies.
5. Inspect existing Edge Functions.
6. Inspect current guest photo, Moments and guestbook behavior.
7. Inspect current couple authorization behavior.
8. Identify which systems can be extended instead of replaced.

During implementation:

```text
Do not use placeholder data
Do not create fake dashboard statistics
Do not create fake schedule events
Do not create fake guest activity
Do not hardcode Towa & Mathew into reusable components
Do not bypass Supabase RLS
Do not expose service-role credentials
Do not expose access codes publicly
Do not expose VAPID private keys
Do not expose Anthropic keys
```

Everything must remain reusable for many weddings.

---

# 132. Implementation Quality

The implementation should be:

```text
Type-safe
Mobile-first
Accessible
Responsive
Secure
Wedding-scoped
Realtime-aware
Offline-aware
Retry-safe
Idempotent
Production-ready
```

Avoid AI-generated-looking generic dashboard UI.

Preserve the visual identity already established in the new ForeverVow dashboard while correcting the product-management drift.

---

# 133. Final Instruction to Codex

This repository already contains substantial working functionality.

**Do not regenerate ForeverVow.**

Treat this as a production application being upgraded.

First understand what exists.

Then implement the approved architecture progressively.

The priority is:

```text
Reliability
Security
Simple guest UX
Simple couple UX
Wedding-day usefulness
Memory preservation
```

not adding unnecessary feature volume.

ForeverVow should ultimately feel like the wedding itself has a digital layer surrounding it from invitation until long after the final guest leaves.

```

This is the **master design specification**. The next file Codex should receive after this is the detailed **implementation plan**, which breaks this into migrations, Edge Functions, React changes, service-worker changes, tests, and the exact order Codex should build each part.
```
