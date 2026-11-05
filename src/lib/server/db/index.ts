import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { building } from '$app/env';
import { DATABASE_PREPARED_STATEMENTS, DATABASE_URL } from '$app/env/private';
import * as schema from './schema.js';

// DATABASE_URL picks the driver:
// - postgres://... or postgresql://... connects to a Postgres server with postgres.js.
//   SSL settings come from the URL, e.g. ?sslmode=require.
// - file:<folder> opens PGlite (Postgres compiled to WebAssembly) in that folder.
//   memory:// keeps a PGlite database in memory until the process exits.
//
// Only one process can use a PGlite folder at a time. PGlite doesn't lock the folder,
// so a second process (`bun run db:migrate` while `bun run dev` is running) can
// corrupt it.

type Client = PGlite | postgres.Sql;
type Database = PgDatabase<PgQueryResultHKT, typeof schema> & { $client: Client };

function createClient(url: string): Client {
	if (/^postgres(ql)?:\/\//.test(url)) {
		// Poolers in transaction mode (e.g. Supabase on port 6543) need prepare: false
		return postgres(url, { prepare: DATABASE_PREPARED_STATEMENTS });
	}
	const dataDir = url.replace(/^file:/, '');
	// PGlite creates its folder but not the folders above it
	if (url.startsWith('file:')) mkdirSync(dirname(dataDir), { recursive: true });
	return new PGlite(dataDir);
}

// Vite runs this module again when it or schema.ts changes during development.
// Reusing the client keeps a reload from opening a second PGlite on the same folder.
const cache = globalThis as typeof globalThis & { databaseClients?: Map<string, Client> };
const clients = (cache.databaseClients ??= new Map());

function connect(url: string): Database {
	let client = clients.get(url);
	if (!client) {
		const created = createClient(url);
		clients.set(url, created);
		// The Bun adapter emits this once it has stopped taking requests (on SIGTERM or
		// SIGINT). Open connections would otherwise keep the process running.
		process.once('sveltekit:shutdown', () => {
			void (created instanceof PGlite ? created.close() : created.end());
		});
		client = created;
	}
	return client instanceof PGlite ? drizzlePglite(client, { schema }) : drizzlePostgres(client, { schema });
}

// The build loads this module but never queries the database. A postgres.js client
// doesn't connect until its first query, so this one never opens a connection, and
// the build leaves the local PGlite folder alone.
export const db = building ? connect('postgres://build-placeholder@localhost/build') : connect(DATABASE_URL);

// Re-export schema for convenience
export * from './schema.js';
