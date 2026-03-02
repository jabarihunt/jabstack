# JabStack - LLM Context Prompt

> This document provides comprehensive context for AI assistants working on the JabStack project. Read this alongside `plans/jabstack-architecture.md` for full understanding.

## Project Identity

**JabStack** is a modern, full-stack starter template for personal projects requiring both marketing pages and user dashboards. It serves as a foundation that diverges per project while maintaining consistent patterns.

## Technology Stack Quick Reference

| Layer | Technology | Key Files |
|-------|------------|-----------|
| Runtime | Bun | `bun.lockb`, `Dockerfile` |
| Language | TypeScript | `tsconfig.json` |
| Framework | SvelteKit | `svelte.config.js`, `src/routes/` |
| Database | Turso/SQLite + Drizzle | `src/lib/server/db/`, `drizzle.config.ts` |
| Auth | Better Auth + Google OAuth | `src/lib/server/auth.ts` |
| Payments | Stripe | `src/lib/server/stripe.ts` |
| Email | Resend | `src/lib/server/email.ts` |
| Dashboard UI | shadcn-svelte | `src/lib/components/ui/` |
| Marketing UI | Bits UI | `src/lib/components/marketing/` |
| Styling | Tailwind CSS | `tailwind.config.ts`, `src/app.css` |
| Testing | Vitest | `vitest.config.ts`, `tests/` |
| Hosting | Fly.io | `fly.toml`, `Dockerfile` |

## Critical Conventions

### 1. UI Library Separation

**IMPORTANT**: This project uses TWO UI libraries for different purposes:

- **Dashboard routes** (`/dashboard/*`) → Use **shadcn-svelte** components from `$lib/components/ui/`
- **Marketing routes** (everything else) → Use **Bits UI** primitives from `$lib/components/marketing/`

Never mix these. Dashboard pages should have consistent, pre-styled components. Marketing pages should have custom designs using headless Bits UI primitives.

### 2. Environment Variables

All environment variables are validated at startup via `src/lib/env.ts` using Zod schemas.

- **Private vars**: Import from `$env/static/private` (server-only)
- **Public vars**: Import from `$env/static/public` (client-safe, prefixed with `PUBLIC_`)

Never access `process.env` directly. Always use the validated `env` export.

### 3. Database Access

- **Local development**: SQLite file at `local.db`
- **Production**: Turso (libSQL)
- **ORM**: Drizzle - all queries should use Drizzle's type-safe query builder
- **Schema**: Defined in `src/lib/server/db/schema.ts`
- **Migrations**: Run via `bun run db:migrate`

### 4. Authentication Flow

Better Auth handles all auth. Key patterns:

- Auth API routes: `src/routes/api/auth/[...all]/+server.ts`
- Session available via `locals.session` in server load functions
- Protected routes use `+layout.server.ts` guards in `/dashboard/`
- OAuth callback: `src/routes/auth/callback/+server.ts`

### 5. File Organization

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/           # shadcn-svelte (dashboard only)
│   │   ├── dashboard/    # Dashboard-specific compositions
│   │   └── marketing/    # Bits UI based (marketing only)
│   ├── server/           # Server-only code (db, auth, stripe, email)
│   ├── env.ts            # Validated environment variables
│   ├── utils.ts          # Shared utilities (cn function, etc.)
│   └── types.ts          # Shared TypeScript types
├── routes/
│   ├── +page.svelte      # Marketing home page
│   ├── auth/             # Auth pages (login, register, callback)
│   ├── dashboard/        # Protected dashboard area
│   └── api/              # API routes (auth, webhooks)
```

## Common Tasks

### Adding a New Dashboard Page

1. Create route in `src/routes/dashboard/[page-name]/+page.svelte`
2. Use shadcn-svelte components from `$lib/components/ui/`
3. Add navigation item to sidebar in `src/lib/components/dashboard/sidebar.svelte`
4. If data needed, create `+page.server.ts` with load function

### Adding a New Marketing Page

1. Create route in `src/routes/[page-name]/+page.svelte`
2. Use Bits UI primitives with custom Tailwind styling
3. Add SEO meta tags using `<svelte:head>`
4. Keep design flexible - marketing pages should be unique per project

### Adding a Database Table

1. Define schema in `src/lib/server/db/schema.ts` using Drizzle
2. Generate migration: `bun run db:generate`
3. Apply migration: `bun run db:migrate`
4. Create type exports in `src/lib/types.ts` if needed

### Adding a New API Endpoint

1. Create `+server.ts` in `src/routes/api/[endpoint]/`
2. Export HTTP method handlers (GET, POST, etc.)
3. Validate input with Zod
4. Use `json()` helper for responses

## Package Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run preview      # Preview production build
bun run test         # Run Vitest tests
bun run db:generate  # Generate Drizzle migrations
bun run db:migrate   # Apply migrations
bun run db:studio    # Open Drizzle Studio
bun run stripe:cli   # Forward Stripe webhooks to localhost
```

## Deployment

Deployed to Fly.io using Bun-based Docker image:

```bash
fly deploy           # Deploy to Fly.io
fly secrets set KEY=value  # Set environment variables
fly logs             # View logs
```

## MCP Server Integration

This project includes MCP server configurations for AI-assisted development:

- **Stripe MCP**: Query Stripe data, manage products/prices
- **Turso MCP**: Query database, explore schema
- **shadcn MCP**: Browse, search, and install shadcn-svelte components via natural language
- **Svelte MCP**: Provides Svelte/SvelteKit documentation context and static analysis for better code generation

See `.mcp/mcp.json` for configurations.

## Key Dependencies

| Package | Purpose | Docs |
|---------|---------|------|
| `@sveltejs/kit` | Framework | https://kit.svelte.dev |
| `svelte-adapter-bun` | Bun adapter | https://github.com/gornostay25/svelte-adapter-bun |
| `drizzle-orm` | Database ORM | https://orm.drizzle.team |
| `@libsql/client` | Turso/SQLite client | https://docs.turso.tech |
| `better-auth` | Authentication | https://better-auth.com |
| `stripe` | Payments | https://stripe.com/docs |
| `resend` | Email | https://resend.com/docs |
| `bits-ui` | Headless components | https://bits-ui.com |
| `shadcn-svelte` | Styled components | https://shadcn-svelte.com |

## Gotchas and Tips

1. **Bun vs Node**: This project uses Bun exclusively. Use `bun` instead of `npm/yarn/pnpm`.

2. **Import aliases**: Use `$lib/` for imports from `src/lib/`. Configured in `svelte.config.js`.

3. **Server vs Client**: Files in `src/lib/server/` are server-only. SvelteKit will error if imported client-side.

4. **Tailwind in Svelte**: Use `class:` directive for conditional classes, or the `cn()` utility from `$lib/utils.ts`.

5. **Form handling**: Use SvelteKit's form actions with progressive enhancement. See `use:enhance` directive.

6. **Type safety**: All database queries return typed results. All API inputs should be validated with Zod.

## Questions to Ask When Uncertain

1. Is this a dashboard feature or marketing feature? (Determines UI library)
2. Does this need server-side data? (Determines if `+page.server.ts` needed)
3. Is this user-specific data? (Determines if auth guard needed)
4. Should this be an API route or form action? (API for external/JS, form for progressive enhancement)

---

*For detailed architecture diagrams and implementation specifics, see `plans/jabstack-architecture.md`*
