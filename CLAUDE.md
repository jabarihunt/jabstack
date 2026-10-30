## Project Configuration

- **Language**: TypeScript
- **Package Manager**: bun
- **Add-ons**: none

---

# JabStack - AI Assistant Context

> Read this file to understand the JabStack project. For detailed information, see the linked documents.

## Quick Links

- **[LLM Context](documentation/LLM_CONTEXT.md)** - Comprehensive guide for AI assistants
- **[Architecture Plan](plans/jabstack-architecture.md)** - Detailed architecture with diagrams

## Project Summary

**JabStack** is a full-stack SvelteKit starter template with:

| Component | Technology |
|-----------|------------|
| Runtime | Bun |
| Framework | SvelteKit + TypeScript |
| Database | Turso/SQLite + Drizzle ORM |
| Auth | Better Auth + Google OAuth |
| Payments | Stripe |
| Email | Resend |
| Dashboard UI | shadcn-svelte |
| Marketing UI | Bits UI |
| Hosting | Fly.io |

## Critical Rule

**UI Library Separation**:
- `/dashboard/*` routes → Use **shadcn-svelte** from `$lib/components/ui/`
- All other routes → Use **Bits UI** from `$lib/components/marketing/`

## Key Commands

```bash
bun run dev          # Development server
bun run build        # Production build
bun run db:migrate   # Run migrations
fly deploy           # Deploy to Fly.io
```

## File Structure

```
src/lib/components/ui/        # shadcn-svelte (dashboard)
src/lib/components/marketing/ # Bits UI (marketing)
src/lib/server/               # Server-only (db, auth, stripe, email)
src/routes/dashboard/         # Dashboard pages (no auth guard yet)
src/routes/auth/login/        # Sign-in placeholder (redirects to /dashboard)
src/routes/api/auth/[...all]/ # Better Auth handler for /api/auth/*
src/routes/                   # Marketing pages
```

## Auth Routes

- Better Auth serves everything under `/api/auth/*`, including the Google callback at `/api/auth/callback/google`. Don't create custom OAuth or callback routes.
- Sign in from the client with `signIn.social({ provider: 'google', callbackURL: '/dashboard' })` from `$lib/auth-client.js`.
- On the server, read the session with `auth.api.getSession({ headers: request.headers })`. There's no `hooks.server.ts`, so `locals` has no session.

---

*For complete documentation, see [documentation/LLM_CONTEXT.md](documentation/LLM_CONTEXT.md)*
