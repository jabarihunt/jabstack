# JabStack

A modern, full-stack starter template for personal projects. Built with SvelteKit, Turso, Better Auth, Stripe, and deployed on Fly.io.

## Features

- **Bun** - Fast JavaScript runtime and package manager
- **SvelteKit** - Full-stack web framework with SSR/SSG/SPA support
- **Turso/SQLite** - LibSQL for production, SQLite for local development
- **Better Auth** - Modern authentication with Google OAuth
- **Stripe** - Payment processing for subscriptions
- **Resend** - Transactional email service
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

The `.env.example` file has sensible defaults for local development. You'll need to configure:

| Variable | Required For | Get From |
|----------|--------------|----------|
| `BETTER_AUTH_SECRET` | Auth | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `STRIPE_SECRET_KEY` | Payments | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Webhooks | `stripe listen --forward-to localhost:5173/api/stripe/webhook` |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | Payments | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `RESEND_API_KEY` | Email | [Resend Dashboard](https://resend.com/api-keys) |

## Project Structure

```
jabstack/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/           # shadcn-svelte components (dashboard)
│   │   │   ├── dashboard/    # Dashboard-specific components
│   │   │   └── marketing/    # Bits UI components (marketing)
│   │   ├── server/           # Server-only code
│   │   │   ├── db/           # Database (Drizzle)
│   │   │   ├── auth.ts       # Better Auth config
│   │   │   ├── stripe.ts     # Stripe config
│   │   │   └── email.ts      # Resend config
│   │   ├── env.ts            # Environment validation
│   │   └── utils.ts          # Utility functions
│   └── routes/
│       ├── +page.svelte      # Marketing home page
│       ├── auth/             # Auth pages
│       ├── dashboard/        # Dashboard pages
│       └── api/              # API routes
├── Dockerfile                # Bun-based Docker image
├── fly.toml                  # Fly.io configuration
└── drizzle.config.ts         # Drizzle ORM config
```

## Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run preview      # Preview production build
bun run test         # Run tests
bun run db:generate  # Generate database migrations
bun run db:migrate   # Apply migrations
bun run db:studio    # Open Drizzle Studio
bun run stripe:cli   # Forward Stripe webhooks to localhost
```

## UI Libraries

JabStack uses two UI libraries for different purposes:

### Dashboard Pages → shadcn-svelte
- Pre-styled, consistent components
- Located in `$lib/components/ui/`
- Used in `/dashboard/*` routes

### Marketing Pages → Bits UI
- Headless primitives for custom designs
- Located in `$lib/components/marketing/`
- Used in all non-dashboard routes

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

```bash
# Create app
fly apps create your-app-name

# Set secrets
fly secrets set DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=...
fly secrets set BETTER_AUTH_SECRET=...
fly secrets set GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=...
fly secrets set STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=...
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

- [`documentation/LLM_CONTEXT.md`](documentation/LLM_CONTEXT.md) - AI assistant context
- [`plans/jabstack-architecture.md`](plans/jabstack-architecture.md) - Architecture details

## License

MIT
