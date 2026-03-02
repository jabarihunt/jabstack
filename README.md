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

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) installed
- [Turso CLI](https://docs.turso.tech/cli/installation) (optional, for production database)
- [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) (optional, for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/jabstack.git
cd jabstack

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Start development server
bun run dev
```

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL=file:local.db
DATABASE_AUTH_TOKEN=

# Authentication
BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Resend
RESEND_API_KEY=re_...

# Application
PUBLIC_APP_URL=http://localhost:5173
```

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

```bash
# Create app
fly apps create jabstack

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
