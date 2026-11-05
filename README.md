# JabStack

A modern, full-stack starter template for personal projects. Built with SvelteKit, PostgreSQL, Better Auth, Stripe, and deployed on Fly.io.

## Features

- **Bun** - Fast JavaScript runtime and package manager
- **SvelteKit 3** - Full-stack web framework with SSR/SSG/SPA support, on Vite 8
- **PostgreSQL** - Any Postgres host in production, PGlite (Postgres in WebAssembly) for local development and tests
- **Better Auth** - Modern authentication with Google OAuth
- **Stripe** - Helpers for subscription checkout, the billing portal and customers (no checkout route or webhook endpoint yet)
- **Resend** - Transactional email templates (welcome, subscription confirmed, subscription cancelled)
- **shadcn-svelte** - Beautiful UI components for dashboard
- **Bits UI** - Headless components for marketing pages
- **Fly.io** - Edge deployment with Docker

<!-- scaffold:start -->
## Choosing the Database

A new project picks its database once, right after copying JabStack and running `bun install`:

```bash
bun run setup:database postgres   # PostgreSQL, the default
bun run setup:database turso      # SQLite locally, Turso in production
```

The command keeps only the chosen database's code and docs, then deletes `templates/`, `.github/workflows/scaffold.yml`, itself and this section. Until then, the project is set up for PostgreSQL, and this README describes PostgreSQL.
<!-- scaffold:end -->

## Quickstart

```bash
1. git clone https://github.com/yourusername/jabstack.git
2. cd jabstack
3. bun install
4. cp .env.example .env
5. bun run db:migrate
6. bun run dev
```

`bun run db:migrate` creates a PGlite database in `.pglite/dev` and its tables, so you don't need a Postgres server to start. The app runs at `http://localhost:5173`. Auth and payments won't work until you configure the API keys in `.env`.

## Full Setup

### Prerequisites

- [Bun](https://bun.sh) installed
- A PostgreSQL database from any host (for production)
- [Stripe CLI](https://docs.stripe.com/stripe-cli) (optional, for local webhook testing)
- [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) (optional, for deployment)

### Environment Variables

Every variable is declared and validated in `src/env.ts`. The app refuses to start if one is missing or has the wrong format, and the error lists which ones. The placeholder values in `.env.example` pass validation, so the Quickstart works without real keys. You'll need to configure:

| Variable | Required For | Get From |
|----------|--------------|----------|
| `PUBLIC_APP_URL` | Auth callbacks, email links | The URL you open the app at (`http://localhost:5173` locally) |
| `DATABASE_URL` | Database | `file:.pglite/dev` locally. In production, your Postgres host's connection string |
| `DATABASE_MIGRATION_URL` | Migrations, when `DATABASE_URL` is pooled (optional) | Your host's direct connection string |
| `DATABASE_PREPARED_STATEMENTS` | Poolers that reject prepared statements (optional) | `false` for Supabase's pooler on port 6543. Defaults to `true` |
| `BETTER_AUTH_SECRET` | Auth | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `STRIPE_SECRET_KEY` | Payments | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Webhooks (once you add the endpoint) | `bun run stripe:cli` prints it |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | Payments | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `RESEND_API_KEY` | Email | [Resend Dashboard](https://resend.com/api-keys) |
| `EMAIL_FROM` | Email sender (optional) | An address on a domain verified in [Resend](https://resend.com/domains), e.g. `JabStack <noreply@yourdomain.com>`. Defaults to Resend's test sender, which only delivers to your own Resend address |

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
│       ├── +error.svelte     # 404 and error page
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
bun run test         # Run unit tests in watch mode (test:unit runs once)
bun run test:acceptance  # Build the app and run the Playwright acceptance tests
bun run test:criteria    # Check every acceptance criterion has a test
bun run db:generate  # Generate database migrations
bun run db:migrate   # Apply migrations
bun run db:push      # Push schema without a migration (prototyping only)
bun run db:studio    # Open Drizzle Studio
bun run stripe:cli   # Forward Stripe webhooks to localhost:5173/api/stripe/webhook
```

Unit tests live next to the code they cover (`src/**/*.test.ts`) and mock external services, so they run without API keys. `.env.test` supplies the one value Vitest needs when there's no `.env`. `src/lib/server/db/database.test.ts` runs the migrations and Better Auth against in-memory PGlite. Set `TEST_DATABASE_URL` to a `postgres://` URL to run it against a server.

Acceptance tests live in `tests/acceptance/`. Each test's title starts with the ID of a criterion in `tests/acceptance/criteria.md`, such as `AC-03: ...`, and `test:criteria` fails if any criterion has no test. `test:acceptance` installs Chromium if needed, builds the app with placeholder settings and serves it on port 4173. Running it replaces `build/` with that test build.

GitHub Actions (`.github/workflows/ci.yml`) runs the type check, unit tests, criteria check and acceptance tests on every push to `master` and every pull request. When tests fail, the Playwright report is attached to the run.

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
`DATABASE_URL=file:.pglite/dev` keeps the database in the `.pglite/dev` folder with [PGlite](https://pglite.dev), Postgres compiled to WebAssembly. Only one process can use the folder at a time, and PGlite doesn't lock it, so two processes can corrupt it. Stop `bun run dev` before running `bun run db:migrate` or `bun run db:studio`.

### Migrations
Migrations are SQL files in `drizzle/` and are committed to git. After changing `src/lib/server/db/schema.ts`:

```bash
bun run db:generate  # Write a new migration to drizzle/
bun run db:migrate   # Apply it to the database in DATABASE_URL
```

Commit the new files in `drizzle/` with the schema change. On Fly.io, the `release_command` in `fly.toml` runs `bun run db:migrate` against your production database before each release goes live.

### Production
Any Postgres host works, such as Neon, Supabase, Railway, AWS RDS or your own server. Set `DATABASE_URL` to its connection string, and add `?sslmode=require` if the host needs SSL. postgres.js reads the SSL setting from the URL.

If the host offers a pooled and a direct connection string, use the pooled one for `DATABASE_URL` and the direct one for `DATABASE_MIGRATION_URL`. Neon's pooler accepts prepared statements. Supabase's pooler on port 6543 doesn't, so set `DATABASE_PREPARED_STATEMENTS=false` there.

Run the app in the Fly region closest to the database (`primary_region` in `fly.toml`).

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
fly secrets set DATABASE_URL=postgres://... DATABASE_MIGRATION_URL=postgres://...
fly secrets set BETTER_AUTH_SECRET=...
fly secrets set GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=...
fly secrets set STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=... PUBLIC_STRIPE_PUBLISHABLE_KEY=...
fly secrets set RESEND_API_KEY=... EMAIL_FROM="Your App <noreply@yourdomain.com>"

# Deploy
fly deploy
```

## MCP Servers

`bun run mcp:setup <tool>` writes the MCP config for your AI coding tool: `claude` (Claude Code), `cursor`, `vscode` (GitHub Copilot), `kiro`, `codex`, `gemini` (Gemini CLI) or `windsurf`. Name several tools to set up each one. It configures these servers:

- **Stripe MCP** - Stripe's hosted server at `https://mcp.stripe.com`, for reading and changing data in the project's Stripe sandbox
- **shadcn MCP** - Browse, search, and install shadcn-svelte components via natural language
- **Svelte MCP** - Provides Svelte/SvelteKit documentation context and static analysis for better code generation

The server list is in `scripts/mcp-setup.ts`. The files it writes hold no secrets, so commit the ones your team uses. There's no database MCP server, because each Postgres host has its own. Neon and Supabase both publish one you can add.

### Stripe

Agents only ever get access to a Stripe sandbox, never live mode. [`docs/stripe-agent-permissions.md`](docs/stripe-agent-permissions.md) lists what they may do there and how to change it.

- **In your editor:** the first time the tool connects to Stripe, it opens Stripe's consent page. Grant access to the project's sandbox only, with the permissions in that file.
- **Agents that run alone, such as in CI:** create an Agent API key in the project's sandbox with those permissions. Put it in the `STRIPE_AGENT_API_KEY` environment variable and run `bun run mcp:setup <tool> --agent-key` before the agent starts. Don't commit the files this mode writes.
- **The key:** `STRIPE_AGENT_API_KEY` is separate from the app's `STRIPE_SECRET_KEY`. Set it in your shell or in CI secrets, not in `.env`, which most MCP tools don't read.
- **Approval:** the script makes Claude Code, Kiro, Codex and Gemini CLI ask before each Stripe tool call. In Cursor, VS Code and Windsurf, approval is a personal setting, so keep Stripe tools asking there. `--agent-key` leaves the prompts out, because nobody is there to answer them. The key's permissions are the limit.

In GitHub Actions, for example:

```yaml
- name: Set up MCP for the agent
  run: bun run mcp:setup claude --agent-key
- name: Run the agent
  run: ...
  env:
    STRIPE_AGENT_API_KEY: ${{ secrets.STRIPE_AGENT_API_KEY }}
```

## Documentation

- [`AGENTS.md`](AGENTS.md) - Instructions for AI coding agents (read by Claude Code through `CLAUDE.md`, and by Cursor, Windsurf, Kiro and GitHub Copilot)
- [`plans/jabstack-architecture.md`](plans/jabstack-architecture.md) - Architecture details
- [`docs/stripe-agent-permissions.md`](docs/stripe-agent-permissions.md) - What AI agents may do in Stripe

## License

MIT
