import { defineEnvVars } from '@sveltejs/kit/env';
import { building } from '$app/env';
import { z } from 'zod';

// Environment variables, imported from '$app/env/private' and '$app/env/public'.
// They're read when the app starts unless marked `static: true`, so secrets set
// with `fly secrets set` reach the app. Invalid values stop the app from starting.
//
// The build loads server modules but has no secrets (the Docker build gets none).
// While building, a missing secret is replaced by a placeholder that satisfies the
// client libraries. Placeholders never reach the running app, because the real
// values are validated again at startup.
const secret = (schema: z.ZodString, buildPlaceholder: string) =>
	building ? z.string().optional().transform((value) => value || buildPlaceholder) : schema;

export const variables = defineEnvVars({
	PUBLIC_APP_URL: {
		public: true,
		// Written into the build. fly.toml passes it as a build argument.
		static: true,
		schema: z.url('PUBLIC_APP_URL must be a valid URL'),
		description: 'The URL the app is served from, e.g. http://localhost:5173. Better Auth builds callback URLs from it.'
	},
	DATABASE_URL: {
		schema: secret(z.string().min(1, 'DATABASE_URL is required'), ':memory:'),
		description: 'libSQL URL: file:local.db locally, libsql://... for Turso.'
	},
	DATABASE_AUTH_TOKEN: {
		schema: z.string().optional(),
		description: 'Turso auth token. Leave empty for a local SQLite file.'
	},
	BETTER_AUTH_SECRET: {
		schema: secret(
			z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
			'build-placeholder-secret-not-used-at-runtime'
		),
		description: 'Secret Better Auth uses to sign sessions. Generate with `openssl rand -base64 32`.'
	},
	GOOGLE_CLIENT_ID: {
		schema: secret(z.string().min(1, 'GOOGLE_CLIENT_ID is required'), 'build-placeholder'),
		description: 'Google OAuth client ID.'
	},
	GOOGLE_CLIENT_SECRET: {
		schema: secret(z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'), 'build-placeholder'),
		description: 'Google OAuth client secret.'
	},
	STRIPE_SECRET_KEY: {
		schema: secret(
			z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
			'sk_build_placeholder'
		),
		description: 'Stripe secret key.'
	},
	STRIPE_WEBHOOK_SECRET: {
		schema: secret(
			z.string().startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_'),
			'whsec_build_placeholder'
		),
		description: 'Signing secret for Stripe webhooks. `bun run stripe:cli` prints one for local testing.'
	},
	PUBLIC_STRIPE_PUBLISHABLE_KEY: {
		public: true,
		schema: secret(
			z.string().startsWith('pk_', 'PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_'),
			'pk_build_placeholder'
		),
		description: 'Stripe publishable key (safe to send to the browser). Read at startup, so set it with `fly secrets set`.'
	},
	RESEND_API_KEY: {
		schema: secret(
			z.string().startsWith('re_', 'RESEND_API_KEY must start with re_'),
			're_build_placeholder'
		),
		description: 'Resend API key.'
	},
	EMAIL_FROM: {
		// Defaults to Resend's test sender, which can only deliver to your own Resend
		// account's address. Set it to an address on your verified domain for real users.
		schema: z
			.string()
			.regex(
				/^(?:[^<>]+<[^\s@<>]+@[^\s@<>]+>|[^\s@<>]+@[^\s@<>]+)$/,
				'EMAIL_FROM must be an email address or "Name <email@example.com>"'
			)
			.default('JabStack <onboarding@resend.dev>'),
		description: 'Sender for transactional email, e.g. "JabStack <noreply@yourdomain.com>". The domain must be verified in Resend.'
	}
});
