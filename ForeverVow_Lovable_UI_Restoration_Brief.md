# ForeverVow — UI Restoration & Product Direction Brief

## Purpose

Use this document as the design and implementation brief for rebuilding the existing **ForeverVow** interface in Lovable.

The current build has drifted into an **editorial SaaS dashboard** with too many cards, too many visible tools, too many competing modules, and too much business-software language.

The goal is **not to rebuild ForeverVow from scratch**.

The goal is to:

1. Preserve the working functionality and data flows already in the codebase.
2. Restore the original visual identity and product experience.
3. Simplify the information architecture.
4. Make the app feel like a premium wedding platform instead of a generic SaaS dashboard.
5. Keep every important feature, but place it in the correct hierarchy.
6. Make the admin, couple, and guest experiences visually distinct.

---

# 1. Product Definition

ForeverVow is one platform with three connected experiences:

1. **Admin Portal**
2. **Couple Dashboard**
3. **Guest Wedding Experience**

ForeverVow is not:

- A generic SaaS dashboard
- A wedding magazine
- A website builder
- A Notion-style workspace
- A CRM with wedding colours
- A marketplace
- A vendor directory
- A registry platform

ForeverVow should feel like:

> A beautiful digital wedding experience with calm, practical management tools behind it.

---

# 2. Existing Routes to Preserve

Keep the current routing structure and ensure every route works:

```text
/admin/login
/admin/dashboard

/couple/:slug
/couple/:slug/dashboard

/wedding/:slug

/checkin/:slug
/q/:slug
```

There should be **no generic marketing homepage**.

The root route should intelligently direct the user to the correct role entry point.

Do not create unnecessary new routes unless required by the existing architecture.

---

# 3. Core Design Principle

The three roles should not all use the same visual system.

## Admin

A focused internal operations tool.

## Couple

A warm, calm, visual wedding management experience.

## Guest

A cinematic, emotional, wedding-specific experience.

This separation is essential.

Do not make the entire platform look like one large dashboard.

---

# 4. Original ForeverVow Visual Identity

The original ForeverVow direction was:

- Warm
- Elegant
- Soft
- Modern
- Image-led
- Calm
- Romantic without becoming overly decorative
- Practical without looking corporate
- Premium without becoming editorial

## Primary Palette

```text
Ivory Background:      #F8F4EC
Soft Cream:            #FAF8F5
Sage Green:            #7A9E7E
Deep Sage:             #5F7864
Muted Gold:            #C9A227
Warm Brown:            #5A4735
Soft Border:           #E6D4BE
Dark Text:             #2A231D
Muted Text:            #8D7962
White:                 #FFFFFF
```

## Typography

Use:

- **Cormorant Garamond** only for:
  - Couple names
  - Wedding titles
  - Guest invitation headings
  - Emotional section headings

- **Inter**, **Manrope**, or a similar clean sans-serif for:
  - Dashboards
  - Navigation
  - Forms
  - Buttons
  - Data
  - Labels
  - Tables
  - Settings

Do not use serif typography across the whole product.

Do not make every label uppercase with wide letter spacing.

## Shape Language

- Rounded corners, but not every element should be a card
- Use 14px–20px radius for major surfaces
- Use smaller radii for controls
- Avoid excessive pill-shaped buttons
- Avoid nested cards inside cards
- Avoid floating panels everywhere
- Use subtle borders and very light shadows
- Use empty space intentionally, but do not create dead space

## Image Direction

Use real wedding photography.

The interface should rely on:

- Couple portraits
- Wedding venue photography
- Floral details
- Ceremony moments
- Reception moments
- Guest moments

Do not use AI-generated wedding imagery.

Do not use abstract gradients as the main visual identity.

Do not use generic SaaS illustrations.

---

# 5. Global UX Rules

## Keep the interface focused

Every screen must have:

- One clear primary purpose
- One clear primary action
- A small number of secondary actions
- A visible path back
- No unnecessary dashboard noise

## Reduce visible complexity

Important features can remain in the app, but they do not all need to appear on the first screen.

Use:

- Progressive disclosure
- Collapsible sections
- Secondary menus
- Contextual actions
- Tabs inside a wedding
- “More” menus
- Detail drawers
- Full-page editors where appropriate

## Avoid generic SaaS patterns

Do not make the app feel like:

- Linear
- Stripe
- Notion
- ClickUp
- Monday.com
- HubSpot
- A CRM
- An analytics product

Avoid:

- Command-centre language
- System-health cards on the main dashboard
- Fake revenue cards
- Fake invoice cards
- Too many KPI blocks
- Too many charts
- Too many sidebar groups
- Too many micro-widgets
- Too many cards competing for attention

## Language

Use natural, human wording.

Preferred:

- Your Wedding
- Guest List
- Wedding Day
- Share Invitation
- Preview Wedding
- Latest Replies
- Upcoming Events
- Add Wedding Details
- Wedding Progress
- Photos & Memories

Avoid:

- Workspace Command Centre
- Performance Module
- Engagement Intelligence
- System Insights
- Platform Health
- Operations Hub
- Workflow Engine
- Asset Intelligence

---

# 6. Admin Portal Direction

## Admin Purpose

The admin portal is the ForeverVow operator’s control centre, but it should remain focused and calm.

The admin’s main responsibilities are:

1. Create weddings
2. View weddings
3. Edit weddings
4. Import wedding details
5. Import guest lists
6. Publish or unpublish weddings
7. Copy couple links
8. Copy guest links
9. Generate QR codes
10. View upcoming and live weddings
11. Review RSVP progress
12. Archive completed weddings

## Admin Dashboard Structure

The first admin screen should show only the most important information.

### Top Header

Include:

- ForeverVow logo
- Page title: **Weddings**
- Search
- Notifications
- Admin profile menu
- Primary button: **Create Wedding**

### Summary Row

Use no more than four summary items:

- Total Weddings
- Upcoming
- Live Now
- Confirmed Guests

These should be simple, compact, and readable.

Do not make them large decorative cards.

### Primary Wedding List

The wedding list is the centre of the admin experience.

Each row or card should show:

- Couple names
- Wedding date
- Venue
- Status
- RSVP progress
- Confirmed guest count
- Small cover image
- Quick actions

Quick actions:

- Open
- Edit
- Preview
- Copy Couple Link
- Copy Guest Link
- QR Code
- Publish / Unpublish
- Archive

Use either:

- A clean desktop table
- A compact card list on mobile

Do not provide card, table, and timeline view modes unless there is a real reason.

## Admin Navigation

Keep top-level navigation minimal:

```text
Weddings
Guests
Imports
Templates
Settings
```

Optional secondary items may exist inside Settings or individual weddings.

Do not place vendor management, revenue, contracts, invoices, system health, and asset libraries on the main navigation unless the codebase already uses them and they are genuinely required.

## Wedding Detail Page

When the admin opens a wedding, use a focused wedding-level navigation:

```text
Overview
Wedding Details
Guests
Schedule
Venues
Photos
Updates
Sharing
Settings
```

The overview should show:

- Wedding cover image
- Couple names
- Wedding date
- Status
- Guest summary
- RSVP progress
- Couple access details
- Guest link
- QR code
- Publish status
- Latest activity

## Create Wedding Flow

Use a short, guided flow.

### Step 1 — Couple

- Partner 1 name
- Partner 2 name
- Display couple name
- Primary email
- Contact number

### Step 2 — Wedding

- Wedding date
- Ceremony time
- Reception time
- Venue
- City
- Estimated guests

### Step 3 — Style

- Select template
- Select colour palette
- Upload hero image

### Step 4 — Access

- Generate slug
- Generate couple access code
- Generate guest link
- Generate QR code

### Step 5 — Review

Show a clean summary before creating.

Do not ask for every wedding detail in one giant form.

The wedding can be completed after creation.

## CSV Import

Support:

- Wedding details CSV
- Guest list CSV
- Events CSV
- Accommodation CSV
- Venue markers CSV

Import flow:

```text
Upload
→ Detect columns
→ Map fields
→ Validate
→ Preview
→ Confirm
→ Import
```

Do not import immediately without a preview.

Show:

- Valid rows
- Missing required fields
- Duplicate records
- Unmapped columns
- Errors
- Import destination

Never invent missing wedding details.

---

# 7. Couple Dashboard Direction

## Couple Experience Goal

The couple dashboard should feel like their wedding has already been prepared for them.

The couple should not feel like they are operating complicated software or building a website.

The dashboard should answer these questions immediately:

1. How long until our wedding?
2. How many guests have replied?
3. What should we do next?
4. What changed recently?
5. How does our wedding website look?
6. How do we share it?

## Couple Dashboard Home

### Hero Area

Use a large wedding image or soft image-led header.

Show:

- Couple names
- Wedding date
- Venue
- Countdown
- Wedding status
- Preview Wedding button
- Share Invitation button

The hero should feel emotional but remain functional.

### Main Summary

Use a maximum of four compact metrics:

- Confirmed
- Pending
- Declined
- Total Guests

### Recommended Next Step

Show one clear recommendation.

Examples:

- Add your wedding story
- Upload your cover image
- Review pending RSVPs
- Add accommodation details
- Publish your wedding
- Share the invitation
- Add the wedding-day timeline

Do not show several competing recommendation cards.

### Recent Activity

Show a simple feed with:

- New RSVP
- Guest message
- Guest photo
- Wedding update
- Admin change

### Quick Actions

Use a compact action row:

- Add Guest
- Preview Wedding
- Share Invitation
- Add Event
- Upload Photos

## Couple Navigation

Use no more than five top-level sections:

```text
Home
Wedding
Guests
Photos & Memories
Settings
```

### Wedding

Contains:

- Wedding Details
- Our Story
- Schedule
- Venues
- Accommodation
- Venue Map
- Live Updates

### Guests

Contains:

- Guest List
- RSVPs
- Dietary Requirements
- Check-in
- Messages

### Photos & Memories

Contains:

- Couple Gallery
- Guest Photos
- Guestbook
- Guest Moments
- Memory Book

### Settings

Contains:

- Theme
- Website Sections
- Privacy
- Guest Permissions
- Notifications
- Sharing
- Archive

Do not place every sub-feature in the main sidebar.

## Couple Editing Experience

Use clear edit pages.

Avoid placing every field inside one huge modal.

Use:

- Save
- Cancel
- Preview
- Autosave status where appropriate
- Unsaved change warning
- Upload progress
- Validation messages

Each editor should include a small live preview where useful, but do not turn the whole dashboard into a website builder.

---

# 8. Guest Wedding Experience

## Guest Experience Goal

The guest website should feel like opening a premium digital invitation.

This is the most emotional and cinematic part of ForeverVow.

It should not look like the admin dashboard.

## Opening Experience

On first visit:

```text
Soft loading moment
→ Envelope or invitation animation
→ Couple names
→ Wedding date
→ Open Invitation
→ Enter wedding experience
```

The animation should be elegant and short.

Do not make guests wait too long.

Add a skip option.

Remember the opened state so the full animation does not repeat on every visit.

## Guest Navigation

Use a clean sticky navigation or mobile menu:

```text
Home
Story
Schedule
Venue
RSVP
Photos
More
```

On mobile, keep RSVP and directions easy to reach.

## Guest Home

The hero should include:

- Full-screen or large wedding image
- Couple names
- Wedding date
- Venue
- Countdown
- RSVP button
- Add to Calendar
- Directions

## Sections

### Our Story

- Real couple story
- Photography-led layout
- Minimal decoration
- Elegant typography
- No unnecessary cards

### Schedule

Show a clear vertical timeline:

- Guest arrival
- Ceremony
- Photos
- Cocktails
- Reception
- Dinner
- First dance
- Party

Each event may include:

- Time
- Location
- Description
- Dress note

### Venue

Show:

- Ceremony venue
- Reception venue
- Address
- Map
- Directions
- Parking
- Accessibility
- Venue notes

### Accommodation

Show only relevant accommodation options.

Each listing includes:

- Hotel name
- Distance
- Contact details
- Booking link
- Couple booking code
- Short note

### RSVP

The RSVP form must remain simple.

Ask for:

- Guest name
- Attending
- Number of guests
- Dietary requirements
- Song request
- Short message

Do not create a long survey.

After submission, show:

- Clear confirmation
- RSVP summary
- Edit response option if enabled

### Photos & Guest Moments

Allow guests to:

- View gallery
- Upload a photo
- Leave a message
- Share a memory
- View approved guest moments

Use moderation controls for admin and couple.

### Live Wedding Mode

On the wedding day, the website may surface:

- Today’s schedule
- Live announcements
- Venue navigation
- Guest photo uploads
- Live memory wall
- Important updates

Do not create a separate complicated app experience.

### Memory Book

After the wedding, transform the guest website into a memory experience.

Show:

- Married for…
- Wedding film
- Couple gallery
- Guest photos
- Guestbook
- Favourite moments
- Timeline of the day

Keep the same wedding URL.

---

# 9. Responsive Behaviour

## Mobile First

Most guests will use mobile.

Every guest action must work comfortably with one hand.

### Mobile Rules

- Minimum 44px tap targets
- Sticky RSVP action where appropriate
- Easy access to directions
- Simple mobile navigation
- No horizontal scrolling
- No tiny labels
- No dense tables
- No multi-column forms
- Fast image loading

## Couple Mobile

The couple dashboard should use:

- Compact header
- Bottom navigation or simple drawer
- Summary cards stacked cleanly
- Large actions
- Short forms
- Sticky save action where useful

## Admin Mobile

The admin portal may be simplified on mobile.

Use:

- Search
- Wedding cards
- Create button
- Status filters
- Quick actions menu

Do not force desktop tables onto mobile.

---

# 10. Motion and Interaction

Use Framer Motion only where it adds meaning.

Recommended:

- Gentle page fade
- Soft image reveal
- Invitation opening
- Drawer transitions
- Modal transitions
- Success confirmations
- Small hover feedback
- Loading skeletons

Avoid:

- Excessive floating animation
- Constant motion
- Bouncing cards
- Large scale transitions
- Heavy parallax
- Animated gradients
- Unnecessary confetti

The guest invitation may be more expressive.

The admin and couple dashboards should remain calm.

---

# 11. Component Guidelines

## Buttons

Primary button:

- Solid sage, deep brown, or charcoal depending on the role
- High contrast
- Clear text
- Medium radius
- No excessive glow

Secondary button:

- Soft border
- Transparent or white background
- Clear hover state

Avoid making every button a pill.

## Cards

Only use cards when content needs grouping.

Do not wrap:

- Every heading
- Every metric
- Every section
- Every button
- Every list item

Use flat sections, dividers, images, and whitespace.

## Forms

- Labels above fields
- Clear helper text
- Visible validation
- Logical grouping
- No placeholder-only labels
- No giant form walls
- Use step-based forms when appropriate

## Tables

Use tables for admin data only.

Use:

- Sticky header
- Row actions
- Search
- Status
- Compact spacing
- Responsive fallback

## Empty States

Empty states should explain the next step.

Example:

> No guests have been added yet. Import a CSV or add your first guest manually.

Do not use generic empty dashboard illustrations.

---

# 12. Existing Functionality to Preserve

Before editing the UI, audit the repository and identify all currently working functionality.

Preserve and reconnect:

- Admin login
- Couple login
- Wedding creation
- Wedding editing
- Wedding deletion
- Wedding archiving
- Wedding duplication
- Publish and unpublish
- Guest links
- Couple links
- Couple access codes
- QR codes
- CSV import
- CSV export
- RSVP
- Guest counts
- Dietary requirements
- Events
- Timeline
- Venue information
- Accommodation
- Venue markers
- Gallery
- Guest photos
- Guestbook
- Guest moments
- Live updates
- Check-in
- Notifications
- Wedding preview
- Add to calendar
- Memory book behaviour
- Wedding lifecycle behaviour
- Responsive layouts

Do not replace working backend logic with placeholders.

Do not convert functional buttons into decorative buttons.

Do not remove a working feature simply because it is no longer visible on the dashboard.

Move secondary features into the correct location.

---

# 13. Technical Constraints

## Keep

- React
- TypeScript
- Tailwind CSS
- Existing routing
- Existing Supabase integration
- Existing store and services where functional
- Existing data models
- Existing QR logic
- Existing CSV logic
- Existing wedding lifecycle logic

## Improve

- Component separation
- Page size
- Reusable layout shells
- Design tokens
- Responsive behaviour
- Loading states
- Error states
- Empty states
- Form validation
- Accessibility
- Performance
- Image handling
- Navigation hierarchy

## Avoid

- Rewriting the entire codebase unnecessarily
- Duplicating existing logic
- Creating another parallel design system
- Hardcoding colours throughout components
- Very large page components
- Fake analytics
- Fake backend data
- Placeholder buttons
- Dead routes
- Non-functional menus

---

# 14. Design System Structure

Create central design tokens for:

```text
Colours
Typography
Spacing
Radii
Shadows
Borders
Motion
Breakpoints
Z-index
```

Use role-level themes:

```text
Admin Theme
Couple Theme
Guest Wedding Theme
```

Do not hardcode dozens of hex values inside page components.

## Suggested Role Themes

### Admin

```text
Background: #111827 or #0F172A
Surface: #172033
Primary: #F59E0B or restrained warm gold
Text: #F8FAFC
Muted: #94A3B8
```

Admin should feel professional, clean, and compact.

### Couple

```text
Background: #F8F4EC
Surface: #FFFFFF
Primary: #7A9E7E
Accent: #C9A227
Text: #2A231D
Muted: #8D7962
```

Couple should feel warm, soft, and calm.

### Guest

Use the selected wedding theme.

The guest website should support multiple wedding templates without changing the admin or couple UI.

---

# 15. Templates

Create a small, high-quality template library.

Start with:

1. Classic
2. Modern
3. Garden
4. Minimal
5. Beach
6. Luxury Evening

Each template should define:

- Typography pair
- Colour palette
- Hero style
- Section spacing
- Button style
- Image treatment
- Invitation animation style

Templates should change the guest wedding website—not the full platform dashboard.

---

# 16. What Must Be Removed From the Main Experience

Remove or hide from primary dashboards:

- Fake revenue
- Fake pending invoices
- Fake pending contracts
- Vendor directory
- Platform health
- Storage monitoring
- System performance blocks
- Command centre wording
- Multiple view toggles without a real use case
- Too many charts
- Too many analytics cards
- Generic SaaS language
- Large tool directories
- Unnecessary global search modules
- Repeated summary widgets
- Decorative metrics with no action

These items may remain in code only if they are genuinely required, but they must not dominate the interface.

---

# 17. Required Screens

## Admin

1. Admin Login
2. Weddings Dashboard
3. Create Wedding
4. Wedding Overview
5. Wedding Details
6. Wedding Guests
7. Wedding Schedule
8. Wedding Venue
9. Wedding Photos
10. Wedding Updates
11. Wedding Sharing
12. CSV Import
13. Templates
14. Settings

## Couple

1. Couple Entry
2. Couple Login
3. Couple Home
4. Wedding Details
5. Story
6. Schedule
7. Venue & Accommodation
8. Guest List
9. RSVP Overview
10. Photos & Memories
11. Live Updates
12. Share & QR
13. Settings

## Guest

1. Invitation Opening
2. Wedding Home
3. Story
4. Schedule
5. Venue
6. Accommodation
7. RSVP
8. Gallery
9. Guestbook
10. Guest Photos
11. Live Wedding
12. Memory Book

---

# 18. Implementation Order

Do not redesign everything at once.

## Phase 1 — Audit

- Review all routes
- Review all working actions
- Review all current data structures
- Review authentication
- Review mobile behaviour
- Identify dead code
- Identify duplicated logic

## Phase 2 — Design System

- Create central tokens
- Create admin shell
- Create couple shell
- Create guest theme system
- Create shared buttons
- Create forms
- Create tables
- Create empty states
- Create loading states

## Phase 3 — Admin Simplification

- Replace current admin dashboard
- Simplify navigation
- Build clean wedding list
- Restore create and import flows
- Keep all actions functional

## Phase 4 — Couple Simplification

- Replace dense sidebar
- Build image-led home screen
- Group features into five sections
- Keep existing management tools
- Improve mobile layout

## Phase 5 — Guest Experience

- Improve invitation opening
- Build clean cinematic page
- Improve RSVP
- Improve schedule and venue
- Improve gallery and memory sections

## Phase 6 — QA

- Test every route
- Test every button
- Test every form
- Test every modal
- Test every upload
- Test every CSV import
- Test every role
- Test mobile
- Test empty states
- Test errors
- Remove console errors
- Remove unused code

---

# 19. Final Acceptance Checklist

## Visual Direction

- [ ] The app no longer feels like an editorial SaaS dashboard
- [ ] Admin, couple, and guest experiences are visually distinct
- [ ] The couple dashboard feels warm and wedding-focused
- [ ] The guest website feels cinematic and emotional
- [ ] The admin dashboard feels clean and operational
- [ ] Serif typography is limited to emotional wedding content
- [ ] Real wedding imagery is used
- [ ] There are fewer visible cards
- [ ] There are fewer competing widgets
- [ ] Navigation is simplified

## Functionality

- [ ] Every existing route works
- [ ] Every primary button works
- [ ] Every form validates
- [ ] Every modal works
- [ ] Every upload works
- [ ] CSV import has preview and validation
- [ ] QR codes work
- [ ] Couple links work
- [ ] Guest links work
- [ ] RSVP works
- [ ] Publishing works
- [ ] Archiving works
- [ ] Wedding duplication works
- [ ] Guest photos work
- [ ] Guestbook works
- [ ] Live updates work
- [ ] Check-in works
- [ ] Memory book works

## Quality

- [ ] No placeholder actions
- [ ] No fake metrics
- [ ] No broken routes
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No duplicate design systems
- [ ] No unnecessary dead code
- [ ] Mobile layouts are complete
- [ ] Loading states are present
- [ ] Empty states are present
- [ ] Error states are present
- [ ] Accessibility is checked
- [ ] Images are optimised

---

# 20. Direct Instruction to Lovable

Audit the existing ForeverVow repository before making changes.

Do not rebuild the project from scratch.

Do not remove working functionality.

Do not produce another generic AI-generated dashboard.

Rebuild the visual hierarchy and role-based interface using this document as the source of truth.

The result must feel like:

> A premium wedding experience first, with calm and capable software behind it.

When a design choice conflicts with generic SaaS conventions, choose the wedding experience.

When a feature is useful but creates visual clutter, keep the feature and move it deeper into the correct workflow.

When uncertain, prioritise:

1. Simplicity
2. Emotion
3. Photography
4. Clear hierarchy
5. Mobile usability
6. Working functionality
7. Human-written language
