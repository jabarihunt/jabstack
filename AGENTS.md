# JabStack

JabStack is a SvelteKit starter template. Each new project starts as a copy of it and then diverges. It includes a marketing home page, a dashboard, Google sign-in, Stripe and Resend helpers, and Fly.io deployment. Architecture diagrams are in `plans/jabstack-architecture.md`.

<!-- scaffold:start -->
## Choosing the database

This copy hasn't chosen its database yet. It's set up for PostgreSQL, and this file describes PostgreSQL. Before making other changes, run `bun run setup:database postgres` to keep PostgreSQL, or `bun run setup:database turso` for SQLite locally and Turso in production. The command keeps only the chosen database's code and docs, then deletes `templates/`, `.github/workflows/scaffold.yml`, itself and this section.
<!-- scaffold:end -->

## Stack

| Layer | Technology | Key files |
|-------|------------|-----------|
| Runtime, package manager | Bun | `bun.lock`, `Dockerfile` |
| Framework | SvelteKit 3, Svelte 5 (runes), TypeScript 6, Vite 8 | `vite.config.ts` (SvelteKit config and Bun adapter), `src/routes/` |
| Environment variables | SvelteKit `defineEnvVars`, validated with Zod | `src/env.ts`, `.env.example` |
| Database | PostgreSQL on any host (postgres.js), PGlite locally, Drizzle ORM | `src/lib/server/db/`, `drizzle/`, `drizzle.config.ts` |
| Auth | Better Auth, Google OAuth only | `src/lib/server/auth.ts`, `src/lib/auth-client.ts` |
| Payments, email | Stripe, Resend | `src/lib/server/stripe.ts`, `src/lib/server/email.ts` |
| Dashboard UI | shadcn-svelte | `src/lib/components/ui/` |
| Marketing UI | Bits UI | `bits-ui` |
| Styling | Tailwind CSS 3 | `tailwind.config.ts`, `src/app.css` |
| Unit tests | Vitest | `vitest.config.ts`, `.env.test`, `src/**/*.test.ts` |
| Acceptance tests | Playwright (Chromium) | `playwright.config.ts`, `tests/acceptance/` |
| CI | GitHub Actions | `.github/workflows/ci.yml` |
| Hosting | Fly.io | `fly.toml`, `Dockerfile` |

## Commands

Use `bun`, never npm, yarn or pnpm.

```bash
bun run dev          # Dev server at http://localhost:5173
bun run build        # Production build (runs Vite under Bun, which the Bun adapter requires)
bun run check        # Type check with svelte-check
bun run test:unit    # Run Vitest once (bun run test starts watch mode)
bun run test:acceptance  # Build the app and run the Playwright tests against it
bun run test:criteria    # Check every acceptance criterion has a test (no browser needed)
bun run db:generate  # Write a migration to drizzle/ from schema.ts
bun run db:migrate   # Apply migrations to DATABASE_MIGRATION_URL, or DATABASE_URL if it's empty
bun run db:push      # Push schema without a migration (prototyping only)
bun run db:studio    # Open Drizzle Studio
bun run stripe:cli   # Forward Stripe webhooks to localhost:5173/api/stripe/webhook
bun run mcp:setup <tool>  # Write the MCP config for an AI tool (see Notes)
```

Before finishing a change, run `bun run check`, `bun run test:unit`, `bun run test:criteria` and `bun run test:acceptance`. `check` should report 0 errors and 0 warnings. CI runs the same steps on every push and pull request.

## Project Layout

```
src/
├── env.ts                # Every environment variable, with Zod validation
├── lib/
│   ├── components/
│   │   ├── ui/           # shadcn-svelte (dashboard only)
│   │   ├── dashboard/    # app-sidebar, stats-card, area-chart, data-table
│   │   ├── icons/        # Brand icons used on the home page
│   │   └── marketing/    # Bits UI components (not created yet)
│   ├── hooks/            # is-mobile, used by the shadcn sidebar
│   ├── server/           # Server-only: db/, auth.ts, stripe.ts, email.ts
│   ├── auth-client.ts    # Better Auth client (signIn, signOut, useSession)
│   └── utils.ts          # cn(), formatCurrency(), formatNumber(), formatPercentage()
└── routes/
    ├── +page.svelte      # Marketing home page
    ├── +error.svelte     # 404 and error page for every route
    ├── auth/login/       # Sign-in placeholder (redirects to /dashboard)
    ├── dashboard/        # Dashboard (no auth guard yet)
    └── api/auth/         # Better Auth handler for /api/auth/*
drizzle/                  # Migrations (generated, committed)
tests/acceptance/         # Playwright tests and criteria.md (the acceptance criteria)
scripts/                  # check-acceptance-criteria.ts (test:criteria), mcp-setup.ts (mcp:setup)
docs/                     # stripe-agent-permissions.md
```

## Conventions

### UI libraries
- `/dashboard/*` routes use shadcn-svelte components from `#lib/components/ui/`.
- All other routes use Bits UI (`bits-ui`) with custom Tailwind styling. Marketing pages are meant to look different in every project.
- Never mix the two.
- Put reusable marketing components in `#lib/components/marketing/`. Create the folder when you add the first one. The home page currently imports Bits UI directly.
- `components.json` points at the Tailwind 3 registry (`tw3.shadcn-svelte.com`), and its aliases use `#lib`. Follow that site's instructions when adding shadcn components, and check that the new files import from `#lib/`.

### Svelte and TypeScript
- Write Svelte 5 runes (`$props`, `$state`, `$derived`, `$effect`).
- Import from `src/lib/` with `#lib/` and include the file extension (`#lib/utils.js` for `utils.ts`, `#lib/components/.../x.svelte`). SvelteKit 3 has no `$lib` alias. `#lib` is a subpath import defined under `imports` in `package.json`.
- Merge Tailwind classes with `cn()` from `#lib/utils.js`.
- Read page state from `$app/state` (`page`, `navigating`, `updated`). `$app/stores` no longer exists.
- Use form actions with `use:enhance` for forms in pages. Use `+server.ts` endpoints for JSON APIs.

### Server code and secrets
- Code in `src/lib/server/` is server-only. Never import it from client components.
- Every environment variable the app reads is declared in `src/env.ts` with `defineEnvVars` and a Zod schema. Import private ones from `$app/env/private` and public ones from `$app/env/public`. `$env/*` is deprecated.
- Variables are read when the app starts, so values set with `fly secrets set` take effect. Only `PUBLIC_APP_URL` is `static: true` (written into the build from the `fly.toml` build argument).
- Invalid or missing values stop the app from starting. While building, secrets are optional and fall back to placeholders, because the Docker build has no secrets. When adding a secret, wrap its schema in `secret(...)` the same way.
- Don't read `process.env` in app code. `drizzle.config.ts` is the exception, because drizzle-kit runs outside SvelteKit.
- `.env.example` lists every variable the app reads. Never commit `.env`. `.env.test` is committed and holds only non-secret values for tests. Local `.env` files only ever hold Stripe sandbox keys.
- `EMAIL_FROM` sets the email sender. It defaults to Resend's test sender, which only delivers to your own Resend address.
- Validate API input with Zod.

### Database
- `DATABASE_URL` picks the driver in `src/lib/server/db/index.ts`. A `postgres://` URL connects with postgres.js and takes SSL settings from the URL (`?sslmode=require`). `file:.pglite/dev`, the local default, uses PGlite (Postgres in WebAssembly). PGlite is for development and tests only. After cloning, run `bun run db:migrate` to create the tables.
- Only one process can open a PGlite folder, and PGlite doesn't lock it, so a second one can corrupt it. Stop `bun run dev` before `bun run db:migrate` or `bun run db:studio`.
- With a pooled `DATABASE_URL`, set `DATABASE_MIGRATION_URL` to the host's direct connection. Set `DATABASE_PREPARED_STATEMENTS=false` for poolers in transaction mode that reject prepared statements (Supabase on port 6543).
- Query with Drizzle's type-safe query builder rather than raw SQL.
- The schema is in `src/lib/server/db/schema.ts`. Create timestamp columns with its `timestampTz` helper, and export row types next to each table (`typeof table.$inferSelect`), like the existing ones.
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
import { signIn, signOut, useSession } from '#lib/auth-client.js';

signIn.social({ provider: 'google', callbackURL: '/dashboard' });
signOut();
const session = useSession(); // a store: $session.data is the session or null
```

Server: there's no `src/hooks.server.ts`, so `event.locals` has no session. Read it in a server `load` function or endpoint:

```ts
import { auth } from '#lib/server/auth.js';

const session = await auth.api.getSession({ headers: request.headers });
```

## Common Tasks

### Add a dashboard page
1. Create `src/routes/dashboard/<name>/+page.svelte` with shadcn-svelte components.
2. Add a nav item to the Platform group in `src/lib/components/dashboard/app-sidebar.svelte`. Only add links to pages that exist.
3. Load data in `+page.server.ts` if needed.

The sidebar links to Dashboard and Settings. `src/routes/dashboard/settings/+page.svelte` is a placeholder page that each project replaces.

### Add a marketing page
Create `src/routes/<name>/+page.svelte` with Bits UI and custom Tailwind styling, and add SEO tags in `<svelte:head>`.

### Add an acceptance criterion and its test
1. Add a line to `tests/acceptance/criteria.md` with the next unused ID: `- **AC-NN**: description`. Never reuse an ID.
2. Add a test to a `*.spec.ts` file in `tests/acceptance/` whose title starts with the ID: `test('AC-NN: what the user can do', ...)`. One criterion can have several tests. A test can name several IDs.
3. Test what a user sees and does: use `page.getByRole`, `getByText` and URLs, not CSS classes.
4. Run `bun run test:criteria` and `bun run test:acceptance`. Run one criterion with `bun run test:acceptance --grep "AC-NN:"`.

The tests run against a production build served by `vite preview` on port 4173, using placeholder settings from `playwright.config.ts` and their own PGlite folder (`.pglite/acceptance`). They must never call Google, Stripe or Resend. Running them replaces `build/` with a test build.

### Add a unit test
Put unit tests next to the code they cover as `<name>.test.ts`. Mock `$app/env/private`, `$app/env/public` and external SDKs with `vi.mock`, as `src/lib/server/email.test.ts` and `stripe.test.ts` do. Tests never call real services. Every test must make at least one `expect` call (`requireAssertions` is on). `src/lib/server/db/database.test.ts` runs the migrations and Better Auth against in-memory PGlite. Set `TEST_DATABASE_URL` to a `postgres://` URL to run it against a server.

### Add an API endpoint
Create `src/routes/api/<name>/+server.ts`, export method handlers (`GET`, `POST`), validate input with Zod and return `Response.json(...)`. SvelteKit 3 deprecates its `json()` helper. There's no Stripe webhook endpoint yet. `stripe:cli` expects one at `src/routes/api/stripe/webhook/+server.ts`.

### Add real sign-in
1. Delete `src/routes/auth/login/+page.server.ts` (the redirect placeholder).
2. Create `src/routes/auth/login/+page.svelte`. It's a marketing route, so use Bits UI:

```svelte
<script lang="ts">
	import { Button } from 'bits-ui';
	import { signIn } from '#lib/auth-client.js';
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
import { auth } from '#lib/server/auth.js';
import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) redirect(307, '/auth/login');
	return { user: session.user };
};
```

Replace the `/auth/login` placeholder first. It redirects to `/dashboard`, so with the guard in place, signed-out users would bounce between the two pages.

## Deployment

The app deploys to Fly.io as a Bun-based Docker image built with `@sveltejs/adapter-bun`. Before the first deploy, set `app` and `PUBLIC_APP_URL` (under `[build.args]`) in `fly.toml`, and add the production Google callback URL. Set every other variable in `src/env.ts`, including `PUBLIC_STRIPE_PUBLISHABLE_KEY`, with `fly secrets set`. The app won't start without them. `fly deploy` builds the image and applies migrations before the release goes live.

The Bun adapter assumes requests arrived over HTTPS, which is true behind Fly's proxy. `.dockerignore` keeps `.env`, `node_modules` and local databases out of the image.

## Notes

- `bun run mcp:setup <tool>` writes MCP config for claude, cursor, vscode, kiro, codex, gemini or windsurf from the server list in `scripts/mcp-setup.ts`: Stripe, shadcn and Svelte. There's no database server, because Postgres hosts each publish their own (Neon and Supabase do).
- Stripe's MCP server only reaches the project's sandbox. `docs/stripe-agent-permissions.md` lists what agents may do there. When a task needs a permission it doesn't list, add the permission there in the same change and ask the person to grant it. Never call Stripe with `STRIPE_SECRET_KEY` or any other key to get around a missing permission. `STRIPE_AGENT_API_KEY` is only for MCP tools and never goes in `src/env.ts` or `.env`. Never commit config written by `mcp:setup --agent-key` (`ci.yml` checks).
