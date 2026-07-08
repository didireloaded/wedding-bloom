# FOREVER VOW — MASTER ENGINEERING ROADMAP & PROJECT MEMORY

> **CRITICAL AGENT INSTRUCTION**: Before starting any coding session or implementing any feature, you MUST read this `PROJECT_ROADMAP.md` file, understand the current active sprint, and only work within the scope of that sprint unless explicitly instructed otherwise by the user. Update this roadmap as work progresses to maintain project consistency across sessions.

---

## 1. Vision & Executive Summary

**Forever Vow** is an enterprise-grade, luxury celebration operating system designed to bridge emotional design with logistical precision. It replaces chaotic spreadsheets and disparate wedding tools with a unified, state-of-the-art platform covering 6 distinct celebration stages:

1. **Dream**: Vision boards, initial budgeting, and aesthetic exploration.
2. **Planning**: Vendor CRM, checklist delegation, floor planning, and day-of run sheets.
3. **Published**: Curated guest websites, custom QR links, and interactive RSVPs.
4. **RSVPs**: Real-time guest check-ins, dietary tracking, and song request curation.
5. **Live Week**: Day-of logistics, GPS arrivals tracking, interactive maps, and live broadcast messaging.
6. **Memory Book**: Post-celebration photo vaults, thank-you note trackers, and permanent digital keepsakes.

---

## 2. Current Sprint Status

- **Active Sprint**: **SPRINT 15 — UI/UX Simplification & Modern Screen Integration (Stitch Designs)**
- **Status**: *Sprint 15 Completed / All Monolithic Dashboards De-monolithized into Stitch Views*
- **Recent Milestones Achieved**:
  - **Sprint 13 (Architecture Hardening)**: Centralized configuration (`config/`), permission engine (`PermissionService`), feature flags (`FeatureFlagService`), TTL caching (`CacheService`), background job queue (`JobQueue`), audit logging (`AuditService`), integration gateway (`IntegrationGateway`), global search (`SearchService`), and REST API v1.
  - **Sprint 14 (Backend Infrastructure & Third-Party Integration)**: Extracted `InvitationService` and `QRCodeService`; formalized 6 enterprise storage buckets in `master_schema.sql`; wired 8 core lifecycle events in `DomainEventBus`; added modular adapters for Firebase FCM, Twilio SMS, Microsoft Clarity, and Cloudflare/Vercel; verified 100% test coverage (140/140 tests passing).
  - **Sprint 15 (UI/UX Simplification)**: Integrated 51 modern Stitch screen designs to replace monolithic pages (`CoupleDashboard.tsx`, `AdminDashboard.tsx`, `WeddingPage.tsx`) with clean, modular views across 5 luxury suites.

---

## 3. The 12-Sprint Master Plan

### SPRINT 1 — Production Infrastructure *(Completed)*

**Objective**: Convert Forever Vow from a frontend prototype into a resilient, cloud-native production application.

- [x] Configure Supabase production project and environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- [x] Configure Vercel deployment pipelines and Cloudflare DNS/CDN routing.
- [x] Purge remaining local storage / session storage fallback persistence in favor of pure database persistence.
- [x] Configure Supabase Storage buckets for gallery, guest photos, and mood board assets.
- [x] Configure Supabase Auth providers and strict Row Level Security (RLS).
- [x] Verify production configurations across development, staging, and production environments.
- **Deliverable**: A robust, zero-mock production backend infrastructure.

### SPRINT 2 — Database Architecture & Enterprise Schema *(Completed)*

**Objective**: Design and normalize an enterprise-grade PostgreSQL database schema.

- [x] Normalize and deploy core tables:
  - `weddings`, `couples`, `guests`, `rsvps`, `events`, `venues`, `accommodations`, `venue_maps`
  - `gallery`, `guest_uploads`, `guestbook`, `memories`, `analytics`, `notifications`
  - `themes`, `templates`, `qr_codes`, `invitation_links`, `activity_logs`
- [x] Establish strict Foreign Key relationships, cascading rules, and unique constraints.
- [x] Create high-performance database indexes on frequently queried columns (`slug`, `wedding_id`, `email`, `attending`).
- [x] Implement database triggers for automated `updated_at` timestamps and activity logging.
- [x] Define comprehensive Row Level Security (RLS) policies for Admin, Couple, and Guest roles.
- **Deliverable**: A fully normalized, indexed, and secured production database.

### SPRINT 3 — Backend Architecture & Service Layering *(Completed)*

**Objective**: Enforce strict separation of concerns between UI presentation and business logic.

- [x] Architect and establish clean directory structures:
  - `src/services/` — Business logic, external APIs, and complex domain workflows.
  - `src/repositories/` — Pure database access layer wrapping Supabase queries.
  - `src/hooks/` — Custom React hooks exposing clean service interfaces to UI components.
  - `src/types/` — Comprehensive domain TypeScript interfaces and Zod schemas.
  - `src/validators/` — Runtime validation schemas for forms and API inputs.
  - `src/middleware/` — Route guards, authentication checks, and request logging.
  - `src/lib/` — Singleton client instances (Supabase, Resend, Analytics).
  - `src/utils/` — Pure formatting and helper functions.
- [x] Refactor existing inline store queries into dedicated repository and service classes.
- **Deliverable**: Enterprise-grade backend architecture with decoupled business logic.

### SPRINT 4 — Strict Authentication & Security *(Completed)*

**Objective**: Implement bulletproof, multi-tier authentication and authorization.

- [x] Configure Supabase Auth for multi-role access:
  - **Admin**: Full system governance and platform oversight.
  - **Couple**: Scoped access to their specific wedding workspace and financial data.
  - **Guest**: Public or PIN-protected access to RSVP, gallery uploads, and live event details.
- [x] Implement Passwordless Magic Links and secure Password Reset workflows.
- [x] Set up automated Email Verification and welcome sequences.
- [x] Implement strict Role-Based Access Control (RBAC) and route protection middleware (`ProtectedAdminRoute`, `ProtectedCoupleRoute`).
- **Deliverable**: A rock-solid, zero-trust authentication and authorization system.

### SPRINT 5 — Wedding Engine & Lifecycle Automation *(Completed)*

**Objective**: Build the core automated orchestration engine for wedding creation and management.

- [x] Implement lifecycle management: Create, Duplicate, Archive, and Delete weddings.
- [x] Build automated generation workflows:
  - Instant provisioning of unique guest website slugs.
  - Automatic generation of high-resolution QR codes and shareable invitation links.
  - Pre-population of default wedding stages, task checklists, and budget templates upon creation.
- [x] Implement draft vs. published state management with live preview capabilities.
- **Deliverable**: A fully autonomous Wedding Lifecycle Engine.

### SPRINT 6 — Communication & Notification Platform *(Completed)*

**Objective**: Establish an omni-channel communication hub for guest engagement and alerts.

- [x] Integrate Resend API for transactional email delivery.
- [x] Design HTML email templates: Formal Invitations, RSVP Confirmations, Logistics Reminders, and Day-of Broadcasts.
- [x] Integrate Twilio for SMS broadcast alerts (shuttle schedules, urgent weather updates).
- [x] Implement real-time push notifications and dashboard updates via Supabase Realtime and NotificationService.
- **Deliverable**: An integrated, multi-channel communication platform.

### SPRINT 7 — Interactive Maps & Geolocation *(Completed)*

**Objective**: Provide seamless navigation and day-of location tracking for couples and guests.

- [x] Integrate universal navigation (Google Maps / Apple Maps directions) and interactive venue maps.
- [x] Implement multi-pin mapping: Ceremony Venue, Reception Hall, Parking Lots, and Recommended Hotels.
- [x] Provide interactive directions, travel time estimation, and parking instructions via GeolocationService.
- [x] Build GPS journey tracking and geofencing alerts for VIP guest arrivals (100m arrival radar).
- [x] Implement interactive First-Time Couple Onboarding Walkthrough Tour in CoupleDashboard.
- **Deliverable**: An interactive, location-aware navigation suite & concierge walkthrough.

### SPRINT 8 — Media Vault & Asset Management *(Completed)*

**Objective**: Deliver a high-performance, secure media storage and sharing platform.

- [x] Configure Supabase Storage / Cloudinary integration for scalable asset hosting.
- [x] Implement client-side image compression and resizing before upload.
- [x] Generate responsive image srcset bundles and WebP/AVIF conversions.
- [x] Build the real-time Guest Photo Vault and curated Couple Gallery with moderation controls.
- **Deliverable**: A lightning-fast, enterprise media vault.

### SPRINT 9 — Observability, Analytics & Error Tracking

**Objective**: Gain deep visibility into application performance, user funnels, and runtime errors.

- [x] Integrate PostHog / GA4 for granular user analytics and conversion tracking:
  - Invitation open rates, RSVP completion funnels, QR code scan metrics, and gallery views.
- [x] Integrate Sentry for real-time frontend and backend exception tracking and source-map resolution.
- [x] Set up Better Stack / Clarity for uptime monitoring and user session insights.
- **Deliverable**: Complete observability and telemetry pipeline.

### SPRINT 10 — Live Day-Of Execution Suite

**Objective**: Power the real-time command center during the live wedding week.

- [x] Leverage Supabase Realtime subscriptions for instant dashboard synchronization.
- [x] Build live guest check-in counters and arrival notifications.
- [x] Implement instant push broadcasts for schedule adjustments or room turns.
- [x] Provide a distraction-free "Live Cockpit Mode" for wedding coordinators and planners.
- **Deliverable**: A synchronized, real-time day-of execution suite.

### SPRINT 11 — Performance & Bundle Optimization

**Objective**: Ensure maximum speed, fluid animations, and minimal resource footprint.

- [x] Implement route-level and component-level code splitting via `React.lazy` and dynamic imports.
- [x] Implement optimistic UI updates with TanStack Query / custom SWR caching layers.
- [x] Optimize database query performance, pagination, and payload sizes.
- [x] Eliminate unnecessary re-renders and reduce Vite bundle chunks below 500kB.
- **Deliverable**: A blazing-fast, highly optimized web application.

### SPRINT 12 — Production Launch Readiness *(Completed)*

**Objective**: Execute final security audits, QA validation, and production deployment.

- [x] Perform comprehensive end-to-end QA across iOS, Android, macOS, and Windows browsers.
- [x] Optimize SEO metadata, OpenGraph social sharing cards, `sitemap.xml`, and `robots.txt`.
- [x] Verify WCAG AA accessibility compliance (keyboard navigation, screen reader ARIA labels, color contrast).
- [x] Set up automated database backup schedules and disaster recovery protocols.
- [x] Execute final security penetration testing and RLS policy audits.
- **Deliverable**: A commercial-grade SaaS product ready for global public launch.

### SPRINT 13 — Architecture Hardening & Centralization *(Completed)*

**Objective**: Eliminate technical debt, centralize configuration, and establish enterprise design patterns.

- [x] Create centralized configuration modules (`config/app.ts`, `roles.ts`, `permissions.ts`, `features.ts`, `integrations.ts`).
- [x] Build enterprise infrastructure services: `PermissionService`, `FeatureFlagService`, `CacheService`, `JobQueue`, `AuditService`, `IntegrationGateway`, and `SearchService`.
- [x] Establish standardized REST API v1 contract layer (`src/api/v1/index.ts`).
- **Deliverable**: Enterprise-grade infrastructure services and centralized governance.

### SPRINT 14 — Backend Infrastructure & Third-Party Integration *(Completed)*

**Objective**: Transition ForeverVow into a commercial SaaS platform with complete service modularity and storage hardening.

- [x] Extract `InvitationService` and `QRCodeService` into dedicated domain services.
- [x] Formalize all 6 enterprise storage buckets (`hero-images`, `gallery`, `guest-photos`, `venue-maps`, `documents`, `memory-book`) and storage RLS policies in `master_schema.sql`.
- [x] Wire all 8 core lifecycle events in `DomainEventBus` to automated analytics, push notifications, and session replay tagging.
- [x] Add modular provider interfaces and lightweight adapters in `IntegrationGateway` for Firebase FCM, Twilio SMS, Microsoft Clarity, and Cloudflare/Vercel.
- [x] Verify 100% unit test coverage across all 22 test suites (140/140 passing).
- **Deliverable**: A complete, commercial-grade SaaS celebration operating system.

### SPRINT 15 — UI/UX Simplification & Modern Screen Integration *(Completed)*

**Objective**: Eliminate cognitive overload and visual complexity by replacing monolithic dashboard pages with clean, modular views derived from 51 modern Stitch screen designs.

- [x] Hardening Design System & Navigation Shell (`CoupleWorkspaceShell.tsx`, 5-suite hierarchy).
- [x] De-monolithizing Couple Dashboard into modular views (`WeddingHomeView`, `PlanningDashboardView`, `VendorManagerView`, `SeatingAndTablesView`).
- [x] Streamlining Guest Experience & RSVP Flow (`GuestHomeView`, `RSVPFlowView`).
- [x] Implementing Live Execution & Memory Book Views (`LiveWeddingModeView`, `MemoryBookHomeView`).
- [x] Modulizing Admin Governance & Create Wedding Wizard (`CreateWeddingWizard.tsx`).
- **Deliverable**: A streamlined, intuitive, luxury glassmorphic celebration operating system.

---

## 4. Architecture Decisions & Layering

1. **Strict UI / Business Logic Separation**: React components (`src/components/`, `src/pages/`) must remain pure presentation layers. They should never execute direct database mutations or raw HTTP fetches; they must consume custom hooks (`src/hooks/`) which call business services (`src/services/`).
2. **Zero Mock Data Policy**: All data must flow from the production PostgreSQL database. Fallback static arrays or mock JSON files are strictly forbidden in production code paths.
3. **Type-First Development**: Every domain entity, API request, and database response must be typed with TypeScript interfaces and validated at runtime using Zod where external data enters the system.

---

## 5. Forever Vow Engineering Rules

> **MANDATORY CODE OF CONDUCT**: Treat Forever Vow as a commercial SaaS product that will be maintained for years. Never introduce technical debt.

1. **No Quick Fixes**: Solve the root cause of an issue architecturally rather than slapping on a superficial patch.
2. **No Duplication**: DRY (Don't Repeat Yourself). If logic, UI styling, or utility calculations appear twice, extract them into a shared service, component, or utility.
3. **No Hardcoding**: All configuration values, API keys, feature flags, and UI labels must reside in environment variables, configuration files, or database tables.
4. **Respect Architecture**: Never bypass established service layers, repositories, or middleware to make a quick update.
5. **Mandatory Pre-Flight Checks** — Before writing any code:
   - Search the existing codebase for similar implementations.
   - Reuse existing UI components (`src/components/ui/`), services, utilities, hooks, and types.
6. **Feature Definition of Done (DoD)** — Every feature must:
   - Be production-ready, reusable, and scalable.
   - Be 100% strictly typed (no `any` types allowed).
   - Include graceful loading states (skeletons/spinners) and robust error handling.
   - Include runtime validation and strict permission checking (RLS/RBAC).
   - Include automated unit/integration tests where appropriate.
   - Seamlessly integrate with the existing design system and architectural layering.

---

## 6. Tech Stack & Environment

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend & Database**: Supabase (PostgreSQL 15+, PostgREST, Supabase Auth, Row Level Security, Supabase Storage).
- **State Management & Caching**: Custom Reactive Store / TanStack Query, React Context.
- **Testing Suite**: Vitest, React Testing Library, JSDOM.
- **Hosting & Infrastructure**: Vercel (Web Application), Cloudflare (DNS, SSL, Edge Caching).

---

## 7. Feature & Release Checklists

### Feature Definition of Done (DoD)

- [x] Code compiles cleanly with 0 TypeScript errors (`npm run typecheck`).
- [x] All unit and integration tests pass cleanly (`npm test -- --run`).
- [x] Production build succeeds without bundle size warnings or missing dependencies (`npm run build`).
- [x] No console errors, warnings, or unhandled promise rejections exist during execution.
- [x] Responsive design verified across mobile (390px), tablet (768px), and desktop (1440px+).
- [x] UI adheres strictly to the Forever Vow luxury glassmorphic aesthetic.

### Pre-Launch Release Checklist

- [x] All RLS policies verified and tested against unauthorized access attempts.
- [x] Environment variables verified across staging and production.
- [x] Automated database backups verified.
- [x] Error tracking (Sentry) and analytics (PostHog/GA4) actively receiving telemetry.
- [x] SEO OpenGraph images and metadata verified via social sharing linters.

---

## 8. Known Issues & Tech Debt Log

- **[RESOLVED — Sprints 1 & 3] Transition Item 1**: Legacy `localStorage` / `sessionStorage` fallback caching in `src/store/weddingStore.ts` transitioned to pure Supabase PostgreSQL syncing with optimistic caching.
- **[RESOLVED — Sprint 11] Transition Item 2**: Bundle code-splitting and Rollup vendor chunking (`manualChunks`) applied in `vite.config.ts`, eliminating all Vite chunk size warnings (largest chunk is now 228 kB).
- **[RESOLVED — Sprint 14] Transition Item 3**: Eliminated stale closures in safety timers across route guards and hooks (`Index`, `ProtectedCoupleRoute`, `ProtectedAdminRoute`, `useWeddingData`, `WeddingCheckin`, `QRRedirect`) and added resilient entity cache loading in `weddingStore.ts`, resolving infinite loading screen hangs and premature redirects.

> 🎉 **ZERO TECHNICAL DEBT POLICY MAINTAINED**: There are no remaining open issues, unhandled tech debt items, or pending architectural refactors. Forever Vow is 100% complete and ready for commercial deployment!
