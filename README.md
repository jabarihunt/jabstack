# JabStack

A modern, full-stack starter template for personal projects. Built with SvelteKit, Turso, Better Auth, Stripe, and deployed on Fly.io.

## Features

- **Bun** - Fast JavaScript runtime and package manager
- **SvelteKit 3** - Full-stack web framework with SSR/SSG/SPA support, on Vite 8
- **Turso/SQLite** - LibSQL for production, SQLite for local development
- **Better Auth** - Modern authentication with Google OAuth
- **Stripe** - Helpers for subscription checkout, the billing portal and customers (no checkout route or webhook endpoint yet)
- **Resend** - Transactional email templates (welcome, subscription confirmed, subscription cancelled)
- **shadcn-svelte** - Beautiful UI components for dashboard
- **Bits UI** - Headless components for marketing pages
- **Fly.io** - Edge deployment with Docker

## Quickstart

```bash
1. git clone https://github.com/yourusername/jabstack.git
2. cd jabstack
3. bun install
4. cp .env.example .env
5. bun run db:migrate
6. bun run dev
```

`bun run db:migrate` creates `local.db` and its tables. The app runs at `http://localhost:5173` with SQLite out of the box. Auth and payments won't work until you configure the API keys in `.env`.

## Full Setup

### Prerequisites

- [Bun](https://bun.sh) installed
- [Turso CLI](https://docs.turso.tech/cli/installation) (optional, for production database)
- [Stripe CLI](https://docs.stripe.com/stripe-cli) (optional, for local webhook testing)
- [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) (optional, for deployment)

### Environment Variables

Every variable is declared and validated in `src/env.ts`. The app refuses to start if one is missing or has the wrong format, and the error lists which ones. The placeholder values in `.env.example` pass validation, so the Quickstart works without real keys. You'll need to configure:

| Variable | Required For | Get From |
|----------|--------------|----------|
| `PUBLIC_APP_URL` | Auth callbacks, email links | The URL you open the app at (`http://localhost:5173` locally) |
| `BETTER_AUTH_SECRET` | Auth | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `STRIPE_SECRET_KEY` | Payments | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Webhooks (once you add the endpoint) | `bun run stripe:cli` prints it |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | Payments | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `RESEND_API_KEY` | Email | [Resend Dashboard](https://resend.com/api-keys) |

### Google Sign-In

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an OAuth client ID of type **Web application**.
2. Under **Authorized redirect URIs**, add `http://localhost:5173/api/auth/callback/google` for local development and `https://your-app.fly.dev/api/auth/callback/google` for production.
3. Put the client ID and secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

Better Auth builds the callback URL from `PUBLIC_APP_URL`, so the redirect URI must start with the same address.

## Project Structure

```
jabstack/
├── src/
│   ├── env.ts                # Environment variables and their validation
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/           # shadcn-svelte components (dashboard)
│   │   │   ├── dashboard/    # Dashboard components (sidebar, stats, chart, table)
│   │   │   └── icons/        # Brand icons for the home page
│   │   ├── server/           # Server-only code
│   │   │   ├── db/           # Database client and Drizzle schema
│   │   │   ├── auth.ts       # Better Auth config
│   │   │   ├── stripe.ts     # Stripe client and helpers
│   │   │   └── email.ts      # Resend client and email templates
│   │   ├── auth-client.ts    # Better Auth client (signIn, signOut, useSession)
│   │   └── utils.ts          # cn() and number formatting helpers
│   └── routes/
│       ├── +page.svelte      # Marketing home page
│       ├── auth/login/       # Sign-in placeholder (redirects to /dashboard)
│       ├── dashboard/        # Dashboard pages (no auth guard yet)
│       └── api/auth/         # Better Auth handler for /api/auth/*
├── drizzle/                  # Database migrations (committed)
├── vite.config.ts            # Vite and SvelteKit config (Bun adapter)
├── Dockerfile                # Bun-based Docker image
├── fly.toml                  # Fly.io configuration
└── drizzle.config.ts         # Drizzle Kit config
```

## Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production (runs Vite under Bun for the Bun adapter)
bun run preview      # Preview production build
bun run check        # Type check
bun run test         # Run tests in watch mode (test:unit runs once)
bun run db:generate  # Generate database migrations
bun run db:migrate   # Apply migrations
bun run db:push      # Push schema without a migration (prototyping only)
bun run db:studio    # Open Drizzle Studio
bun run stripe:cli   # Forward Stripe webhooks to localhost:5173/api/stripe/webhook
```

There's no Stripe webhook endpoint yet. `stripe:cli` forwards to `/api/stripe/webhook`, so add the handler at `src/routes/api/stripe/webhook/+server.ts`.

## UI Libraries

JabStack uses two UI libraries for different purposes:

### Dashboard Pages → shadcn-svelte
- Pre-styled, consistent components
- Located in `#lib/components/ui/`
- Used in `/dashboard/*` routes

### Marketing Pages → Bits UI
- Headless primitives for custom designs
- Imported from `bits-ui`. Put reusable marketing components in `#lib/components/marketing/`, which doesn't exist yet.
- Used in all non-dashboard routes

## Authentication

Better Auth serves every route under `/api/auth/*` through `src/routes/api/auth/[...all]/+server.ts`, including the Google callback at `/api/auth/callback/google`. Sign users in and out with the client in `src/lib/auth-client.ts`:

```ts
import { signIn, signOut } from '#lib/auth-client.js';

signIn.social({ provider: 'google', callbackURL: '/dashboard' });
signOut();
```

`/auth/login` is a placeholder that redirects to `/dashboard`, so the home page's Sign In button has somewhere to go. When a project needs real sign-in, replace `src/routes/auth/login/+page.server.ts` with a sign-in page. The dashboard has no auth guard yet. [`AGENTS.md`](AGENTS.md) shows how to add both.

## Database

### Local Development
Uses SQLite file (`local.db`) for simplicity.

### Migrations
Migrations are SQL files in `drizzle/` and are committed to git. After changing `src/lib/server/db/schema.ts`:

```bash
bun run db:generate  # Write a new migration to drizzle/
bun run db:migrate   # Apply it to the database in DATABASE_URL
```

Commit the new files in `drizzle/` with the schema change. On Fly.io, the `release_command` in `fly.toml` runs `bun run db:migrate` against your production database before each release goes live.

### Production
Uses [Turso](https://turso.tech) (libSQL) for edge-distributed database.

```bash
# Create Turso database
turso db create jabstack

# Get connection URL
turso db show jabstack --url

# Get auth token
turso db tokens create jabstack
```

## Deployment

### Fly.io

Before deploying, update `fly.toml`:
1. `app` - Your Fly.io app name
2. `PUBLIC_APP_URL` in `[build.args]` - Your production URL

Then add `https://your-app.fly.dev/api/auth/callback/google` (using your production URL) to your Google OAuth client's authorized redirect URIs.

The app reads its secrets when it starts. Set every variable in `src/env.ts` as a Fly secret except `PUBLIC_APP_URL`, which `fly.toml` passes as a build argument. The app won't start if a required one is missing. `.dockerignore` keeps your local `.env` out of the image.

```bash
# Create app
fly apps create your-app-name

# Set secrets
fly secrets set DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=...
fly secrets set BETTER_AUTH_SECRET=...
fly secrets set GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=...
fly secrets set STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=... PUBLIC_STRIPE_PUBLISHABLE_KEY=...
fly secrets set RESEND_API_KEY=...

# Deploy
fly deploy
```

## MCP Servers

JabStack includes MCP server configurations for AI-assisted development:

- **Stripe MCP** - Query Stripe data, manage products/prices
- **Turso MCP** - Query database, explore schema
- **shadcn MCP** - Browse, search, and install shadcn-svelte components via natural language
- **Svelte MCP** - Provides Svelte/SvelteKit documentation context and static analysis for better code generation

See `.mcp/mcp.json` for configuration.

## Documentation

- [`AGENTS.md`](AGENTS.md) - Instructions for AI coding agents (read by Claude Code through `CLAUDE.md`, and by Cursor, Windsurf, Kiro and GitHub Copilot)
- [`plans/jabstack-architecture.md`](plans/jabstack-architecture.md) - Architecture details

## License

MIT
