import { defineConfig } from 'drizzle-kit';

// The `turso` dialect uses @libsql/client, so it works with a local SQLite file
// (`file:local.db`) and with a Turso database (`libsql://...` plus auth token).
export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'turso',
	dbCredentials: {
		url: process.env.DATABASE_URL || 'file:local.db',
		authToken: process.env.DATABASE_AUTH_TOKEN || undefined
	}
});
