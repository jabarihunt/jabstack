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
src/routes/dashboard/         # Protected dashboard pages
src/routes/                   # Marketing pages
```

---

*For complete documentation, see [documentation/LLM_CONTEXT.md](documentation/LLM_CONTEXT.md)*
