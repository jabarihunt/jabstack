import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { DATABASE_URL, DATABASE_AUTH_TOKEN } from '$app/env/private';
import * as schema from './schema.js';

const client = createClient({
	url: DATABASE_URL,
	authToken: DATABASE_AUTH_TOKEN || undefined
});

export const db = drizzle(client, { schema });

// Re-export schema for convenience
export * from './schema.js';
