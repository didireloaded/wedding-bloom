# FOREVER VOW — PERMANENT AGENT INSTRUCTIONS & ENGINEERING RULES

> **MANDATORY PRE-SESSION DIRECTIVE**: Before starting any coding session, you MUST read `PROJECT_ROADMAP.md`, understand the current active sprint, and ONLY work within the scope of that sprint unless explicitly instructed otherwise by the user. Update `PROJECT_ROADMAP.md` as work progresses.

---

## 1. Forever Vow Engineering Rules

From now on, every change to Forever Vow must strictly follow these rules:

1. **Do not write quick fixes.** Solve problems architecturally at their root cause.
2. **Do not duplicate logic.** DRY (Don't Repeat Yourself). Extract shared logic into services, hooks, or utilities.
3. **Do not hardcode values.** All configuration values, API keys, labels, and feature flags must reside in environment variables, config files, or database tables.
4. **Do not bypass architecture.** Enforce strict separation between UI presentation (`components/`, `pages/`) and business logic (`services/`, `repositories/`, `hooks/`).

### Before Writing Code
You must always perform a thorough pre-flight check:
- **Search the existing codebase** using grep/ripgrep for similar implementations or existing patterns.
- **Reuse existing components** (especially in `src/components/ui/` and `GlassCard`).
- **Reuse services** and repositories.
- **Reuse utilities** and formatting helpers.
- **Reuse hooks** and state store queries.
- **Reuse types** and interfaces from `src/types/`.

### Every Feature Must:
- Be **production-ready**.
- Be **reusable** and modular.
- Be **scalable**.
- Be **fully typed** with TypeScript (strictly zero `any` types allowed).
- Include **loading states** (skeletons, spinners, progress indicators).
- Include **error handling** (try/catch, toast alerts, error boundaries, fallbacks).
- Include **runtime validation** (Zod schemas, input sanitation).
- Include **permissions** and authorization checks (RLS policies, RBAC guards).
- Include **tests** where appropriate (Vitest unit/integration tests).
- **Integrate seamlessly** with the existing architecture and luxury glassmorphic design system.

---

## 2. Zero Technical Debt Policy

Never introduce technical debt. Treat Forever Vow as a commercial SaaS product that will be maintained for years. When refactoring or adding features, ensure that the codebase is left cleaner, better typed, and more robust than before.
