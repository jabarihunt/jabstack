# JabStack

JabStack is a SvelteKit starter template. Each new project starts as a copy of it and then diverges. It includes a marketing home page, a dashboard, Google sign-in, Stripe and Resend helpers, and Fly.io deployment. Architecture diagrams are in `plans/jabstack-architecture.md`.

## Stack

| Layer | Technology | Key files |
|-------|------------|-----------|
| Runtime, package manager | Bun | `bun.lock`, `Dockerfile` |
| Framework | SvelteKit 2, Svelte 5 (runes), TypeScript | `svelte.config.js`, `src/routes/` |
| Database | SQLite locally, Turso in production, Drizzle ORM | `src/lib/server/db/`, `drizzle/`, `drizzle.config.ts` |
| Auth | Better Auth, Google OAuth only | `src/lib/server/auth.ts`, `src/lib/auth-client.ts` |
| Payments, email | Stripe, Resend | `src/lib/server/stripe.ts`, `src/lib/server/email.ts` |
| Dashboard UI | shadcn-svelte | `src/lib/components/ui/` |
| Marketing UI | Bits UI | `bits-ui` |
| Styling | Tailwind CSS 3 | `tailwind.config.ts`, `src/app.css` |
| Testing | Vitest (no tests yet) | `vitest.config.ts` |
| Hosting | Fly.io | `fly.toml`, `Dockerfile` |

## Commands

Use `bun`, never npm, yarn or pnpm.

```bash
bun run dev          # Dev server at http://localhost:5173
bun run build        # Production build
bun run check        # Type check with svelte-check
bun run test:unit    # Run Vitest once (bun run test starts watch mode)
bun run db:generate  # Write a migration to drizzle/ from schema.ts
bun run db:migrate   # Apply migrations to DATABASE_URL
bun run db:push      # Push schema without a migration (prototyping only)
bun run db:studio    # Open Drizzle Studio
bun run stripe:cli   # Forward Stripe webhooks to localhost:5173/api/stripe/webhook
```

Before finishing a change, run `bun run check` and `bun run build`. `check` currently reports 20 errors in `app-sidebar.svelte` and `sidebar.svelte`, because the sidebars link to pages that don't exist yet. Don't add new errors.

## Project Layout

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/           # shadcn-svelte (dashboard only)
│   │   ├── dashboard/    # app-sidebar, stats-card, area-chart, data-table
│   │   ├── icons/        # Brand icons used on the home page
│   │   └── marketing/    # Bits UI components (not created yet)
│   ├── hooks/            # is-mobile, used by the shadcn sidebar
│   ├── server/           # Server-only: db/, auth.ts, stripe.ts, email.ts
│   ├── auth-client.ts    # Better Auth client (signIn, signOut, useSession)
│   ├── env.ts            # Zod schemas for env vars (not imported yet)
│   └── utils.ts          # cn(), formatCurrency(), formatNumber(), formatPercentage()
└── routes/
    ├── +page.svelte      # Marketing home page
    ├── auth/login/       # Sign-in placeholder (redirects to /dashboard)
    ├── dashboard/        # Dashboard (no auth guard yet)
    └── api/auth/         # Better Auth handler for /api/auth/*
drizzle/                  # Migrations (generated, committed)
```

## Conventions

### UI libraries
- `/dashboard/*` routes use shadcn-svelte components from `$lib/components/ui/`.
- All other routes use Bits UI (`bits-ui`) with custom Tailwind styling. Marketing pages are meant to look different in every project.
- Never mix the two.
- Put reusable marketing components in `$lib/components/marketing/`. Create the folder when you add the first one. The home page currently imports Bits UI directly.
- `components.json` points at the Tailwind 3 registry (`tw3.shadcn-svelte.com`). Follow that site's instructions when adding shadcn components.

### Svelte and TypeScript
- Write Svelte 5 runes (`$props`, `$state`, `$derived`, `$effect`).
- Import from `src/lib/` with `$lib/` and include the `.js` extension for TypeScript modules (`$lib/utils.js`), as the rest of the code does.
- Merge Tailwind classes with `cn()` from `$lib/utils.js`.
- Use `$app/state` in new code. The dashboard layout and sidebars still use the deprecated `$app/stores`.
- Use form actions with `use:enhance` for forms in pages. Use `+server.ts` endpoints for JSON APIs.

### Server code and secrets
- Code in `src/lib/server/` is server-only. Never import it from client components.
- Import private env vars from `$env/static/private` and public ones (prefixed `PUBLIC_`) from `$env/static/public`.
- Don't read `process.env` in app code. `drizzle.config.ts` is the exception, because drizzle-kit runs outside SvelteKit.
- `.env.example` lists every variable. Never commit `.env`.
- `src/lib/env.ts` defines Zod schemas and exports a validated `env` object, but nothing imports it, so that validation doesn't run.
- Known issue: `$env/static/private` values are written into the build, so secrets set later with `fly secrets set` don't reach the app. Switching server code to `$env/dynamic/private` fixes this.
- Validate API input with Zod.

### Database
- Locally, `DATABASE_URL=file:local.db`. After cloning, run `bun run db:migrate` to create the tables.
- Query with Drizzle's type-safe query builder rather than raw SQL.
- The schema is in `src/lib/server/db/schema.ts`. Export row types next to each table (`typeof table.$inferSelect`), like the existing ones.
- After a schema change, run `bun run db:generate` and `bun run db:migrate`, then commit the new files in `drizzle/`. On Fly.io, `release_command` in `fly.toml` runs `bun run db:migrate` before each release.
- `users`, `sessions`, `accounts` and `verifications` belong to Better Auth, which checks them against its expected schema at startup. After upgrading Better Auth or adding a Better Auth plugin, generate a reference copy and compare: `bunx auth generate --config src/lib/server/auth.ts --output /tmp/auth-schema.ts`.

## Authentication

Better Auth handles sign-in, sessions and the OAuth callback. Google is the only sign-in method. Email and password sign-in is turned off in `src/lib/server/auth.ts`.

- `src/routes/api/auth/[...all]/+server.ts` passes every `/api/auth/*` request to Better Auth. Don't add other routes under `/api/auth/`, and don't create your own OAuth callback route.
- The main endpoints are `POST /api/auth/sign-in/social`, `GET /api/auth/callback/google`, `GET /api/auth/get-session` and `POST /api/auth/sign-out`. Call them through the client, not directly.
- Google sends users back to `<PUBLIC_APP_URL>/api/auth/callback/google`, which must be an authorized redirect URI on the Google OAuth client for each environment. Better Auth uses `PUBLIC_APP_URL` as its base URL, so it must match the address the app is served from.
- `src/routes/auth/login/+page.server.ts` is a placeholder that redirects to `/dashboard`.

Client:

```ts
import { signIn, signOut, useSession } from '$lib/auth-client.js';

signIn.social({ provider: 'google', callbackURL: '/dashboard' });
signOut();
const session = useSession(); // a store: $session.data is the session or null
```

Server: there's no `src/hooks.server.ts`, so `event.locals` has no session. Read it in a server `load` function or endpoint:

```ts
import { auth } from '$lib/server/auth.js';

const session = await auth.api.getSession({ headers: request.headers });
```

## Common Tasks

### Add a dashboard page
1. Create `src/routes/dashboard/<name>/+page.svelte` with shadcn-svelte components.
2. Add a nav item to `src/lib/components/dashboard/app-sidebar.svelte`, the sidebar the layout uses. `sidebar.svelte` is an older copy that nothing imports.
3. Load data in `+page.server.ts` if needed.

The sidebar already links to placeholder pages (Lifecycle, Analytics, Projects, Team, Settings and others) that don't exist yet. Create the page or remove the link.

### Add a marketing page
Create `src/routes/<name>/+page.svelte` with Bits UI and custom Tailwind styling, and add SEO tags in `<svelte:head>`.

### Add an API endpoint
Create `src/routes/api/<name>/+server.ts`, export method handlers (`GET`, `POST`), validate input with Zod and return `json(...)`. There's no Stripe webhook endpoint yet. `stripe:cli` expects one at `src/routes/api/stripe/webhook/+server.ts`.

### Add real sign-in
1. Delete `src/routes/auth/login/+page.server.ts` (the redirect placeholder).
2. Create `src/routes/auth/login/+page.svelte`. It's a marketing route, so use Bits UI:

```svelte
<script lang="ts">
	import { Button } from 'bits-ui';
	import { signIn } from '$lib/auth-client.js';
</script>

<Button.Root onclick={() => signIn.social({ provider: 'google', callbackURL: '/dashboard' })}>
	Sign in with Google
</Button.Root>
```

3. Make sure the Google OAuth client lists the callback URL (see Authentication).

### Protect the dashboard
Create `src/routes/dashboard/+layout.server.ts`:

```ts
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth.js';
import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) redirect(307, '/auth/login');
	return { user: session.user };
};
```

Replace the `/auth/login` placeholder first. It redirects to `/dashboard`, so with the guard in place, signed-out users would bounce between the two pages.

## Deployment

The app deploys to Fly.io as a Bun-based Docker image. Before the first deploy, set `app` and `PUBLIC_APP_URL` (under `[build.args]`) in `fly.toml`, set secrets with `fly secrets set` (see the known issue under "Server code and secrets"), and add the production Google callback URL. `fly deploy` builds the image and applies migrations before the release goes live.

## Notes

- `svelte-adapter-bun` is deprecated. Replace it with `@sveltejs/adapter-bun` when moving to SvelteKit 3.
- `.mcp/mcp.json` configures Stripe, Turso, shadcn and Svelte MCP servers.
- `svelte.config.js` defines a `$components` alias that nothing uses.
