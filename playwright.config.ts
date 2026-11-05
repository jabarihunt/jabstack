import { defineConfig, devices } from '@playwright/test';

const port = 4173;
const baseURL = `http://localhost:${port}`;

// The app won't start unless every variable in src/env.ts is valid. These are
// placeholders: acceptance tests never call Google, Stripe or Resend.
// They take precedence over any local .env file.
const testEnv = {
	PUBLIC_APP_URL: baseURL,
	// A PGlite folder of its own, so the tests can run while `bun run dev` is using
	// .pglite/dev. Set ACCEPTANCE_DATABASE_URL to a postgres:// URL to test against a server.
	DATABASE_URL: process.env.ACCEPTANCE_DATABASE_URL || 'file:.pglite/acceptance',
	// Keeps drizzle-kit from migrating a database named in .env instead
	DATABASE_MIGRATION_URL: '',
	BETTER_AUTH_SECRET: 'acceptance-test-secret-not-used-in-production',
	GOOGLE_CLIENT_ID: 'acceptance-test-google-client-id',
	GOOGLE_CLIENT_SECRET: 'acceptance-test-google-client-secret',
	STRIPE_SECRET_KEY: 'sk_test_acceptance',
	STRIPE_WEBHOOK_SECRET: 'whsec_acceptance',
	PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_acceptance',
	RESEND_API_KEY: 're_acceptance',
	EMAIL_FROM: 'JabStack <onboarding@resend.dev>'
};

export default defineConfig({
	testDir: 'tests/acceptance',
	testMatch: '**/*.spec.ts',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: [[process.env.CI ? 'github' : 'list'], ['html', { open: 'never' }]],
	use: {
		baseURL,
		trace: 'on-first-retry'
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		// A production build served by `vite preview`, the setup SvelteKit's Playwright
		// add-on uses. The Bun server (`bun ./build`) assumes HTTPS, so over plain HTTP
		// SvelteKit would reject form submissions as cross-site.
		command: 'bun run db:migrate && bun run build && bun run preview --port 4173 --strictPort',
		url: baseURL,
		env: testEnv,
		// Always start a fresh server, so tests never run against an old build or other settings
		reuseExistingServer: false,
		timeout: 180_000
	}
});
