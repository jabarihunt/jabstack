import { PGlite } from '@electric-sql/pglite';
import { betterAuth } from 'better-auth';
import { eq } from 'drizzle-orm';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import { migrate as migratePostgres } from 'drizzle-orm/postgres-js/migrator';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { auth } from '../auth.js';
import { accounts, db, sessions, subscriptions, users } from './index.js';

// Checks the schema, the migrations in drizzle/ and the Better Auth config against a
// real database: in-memory PGlite, or the Postgres server in TEST_DATABASE_URL.
vi.mock('$app/env', () => ({ building: false }));
vi.mock('$app/env/private', () => ({
	DATABASE_URL: process.env.TEST_DATABASE_URL || 'memory://',
	DATABASE_PREPARED_STATEMENTS: process.env.DATABASE_PREPARED_STATEMENTS !== 'false',
	BETTER_AUTH_SECRET: 'database-test-secret-not-used-in-production',
	GOOGLE_CLIENT_ID: 'test-google-client-id',
	GOOGLE_CLIENT_SECRET: 'test-google-client-secret'
}));
vi.mock('$app/env/public', () => ({ PUBLIC_APP_URL: 'http://localhost:5173' }));

// The app's Better Auth config, plus email and password sign-in so the test can sign in
// without Google
const testAuth = betterAuth({ ...auth.options, emailAndPassword: { enabled: true } });

// Better Auth stores emails in lowercase. A random address keeps runs on a shared
// server apart.
const newUser = () => ({
	name: 'Test User',
	email: `test-${crypto.randomUUID()}@example.com`,
	password: 'correct-horse-battery-staple'
});

beforeAll(async () => {
	// The same migrations `bun run db:migrate` applies
	if (db.$client instanceof PGlite) await migratePglite(db as never, { migrationsFolder: 'drizzle' });
	else await migratePostgres(db as never, { migrationsFolder: 'drizzle' });
});

afterAll(async () => {
	if (db.$client instanceof PGlite) await db.$client.close();
	else await db.$client.end();
});

describe('database', () => {
	it('lets Better Auth sign a user up, in and out', async () => {
		const user = newUser();
		const signUp = await testAuth.api.signUpEmail({ body: user });
		expect(signUp.user.email).toBe(user.email);
		expect(signUp.user.createdAt).toBeInstanceOf(Date);

		const signIn = await testAuth.api.signInEmail({
			body: { email: user.email, password: user.password },
			returnHeaders: true
		});
		const cookie = signIn.headers.get('set-cookie')?.split(';')[0];
		expect(cookie).toBeTruthy();
		const headers = new Headers({ cookie: cookie! });

		const session = await testAuth.api.getSession({ headers });
		expect(session?.user.id).toBe(signUp.user.id);

		await testAuth.api.signOut({ headers });
		expect(await testAuth.api.getSession({ headers })).toBeNull();

		await db.delete(users).where(eq(users.id, signUp.user.id));
	});

	it("deletes a user's sessions, accounts and subscriptions with the user", async () => {
		const { user } = await testAuth.api.signUpEmail({ body: newUser() });
		const periodEnd = new Date('2026-12-01T12:34:56.789Z');
		await db.insert(subscriptions).values({
			id: crypto.randomUUID(),
			userId: user.id,
			stripeCustomerId: 'cus_test',
			currentPeriodEnd: periodEnd
		});

		const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, user.id));
		expect(subscription.currentPeriodEnd?.toISOString()).toBe(periodEnd.toISOString());
		expect(await db.select().from(sessions).where(eq(sessions.userId, user.id))).toHaveLength(1);
		expect(await db.select().from(accounts).where(eq(accounts.userId, user.id))).toHaveLength(1);

		await db.delete(users).where(eq(users.id, user.id));

		expect(await db.select().from(sessions).where(eq(sessions.userId, user.id))).toHaveLength(0);
		expect(await db.select().from(accounts).where(eq(accounts.userId, user.id))).toHaveLength(0);
		expect(await db.select().from(subscriptions).where(eq(subscriptions.userId, user.id))).toHaveLength(0);
	});
});
