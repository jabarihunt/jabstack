import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit runs outside SvelteKit, so it reads process.env (Bun loads .env).
// DATABASE_MIGRATION_URL lets migrations use a direct connection when DATABASE_URL
// goes through a pooler. A postgres:// URL connects with postgres.js. A file: URL
// opens a PGlite folder, which no other process may have open (stop `bun run dev`).
const url = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL || 'file:.pglite/dev';
const isServer = /^postgres(ql)?:\/\//.test(url);
const dataDir = url.replace(/^file:/, '');

// PGlite creates its folder but not the folders above it
if (url.startsWith('file:')) mkdirSync(dirname(dataDir), { recursive: true });

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	...(isServer ? { dbCredentials: { url } } : { driver: 'pglite', dbCredentials: { url: dataDir } })
});
