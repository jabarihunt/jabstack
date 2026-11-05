import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';

// Every timestamp is `timestamp with time zone`, so stored times don't depend on the
// server's TimeZone setting. Better Auth's generated schema uses plain `timestamp`.
const timestampTz = (name: string) => timestamp(name, { withTimezone: true });

// ---------------------------------------------------------------------------
// Better Auth tables
//
// These match the schema Better Auth 1.7 expects with `usePlural: true`.
// Better Auth checks them at startup. After upgrading Better Auth or adding a
// Better Auth plugin, regenerate a reference copy and compare:
//   bunx auth generate --config src/lib/server/auth.ts --output /tmp/auth-schema.ts
// ---------------------------------------------------------------------------

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').default(false).notNull(),
	image: text('image'),
	createdAt: timestampTz('created_at').defaultNow().notNull(),
	updatedAt: timestampTz('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const sessions = pgTable(
	'sessions',
	{
		id: text('id').primaryKey(),
		expiresAt: timestampTz('expires_at').notNull(),
		token: text('token').notNull().unique(),
		createdAt: timestampTz('created_at').defaultNow().notNull(),
		updatedAt: timestampTz('updated_at')
			.$onUpdate(() => new Date())
			.notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' })
	},
	(table) => [index('sessions_userId_idx').on(table.userId)]
);

// OAuth provider accounts (and passwords, if email/password sign-in is enabled)
export const accounts = pgTable(
	'accounts',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestampTz('access_token_expires_at'),
		refreshTokenExpiresAt: timestampTz('refresh_token_expires_at'),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestampTz('created_at').defaultNow().notNull(),
		updatedAt: timestampTz('updated_at')
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [index('accounts_userId_idx').on(table.userId)]
);

// Short-lived values such as OAuth state and email verification tokens
export const verifications = pgTable(
	'verifications',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestampTz('expires_at').notNull(),
		createdAt: timestampTz('created_at').defaultNow().notNull(),
		updatedAt: timestampTz('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [index('verifications_identifier_idx').on(table.identifier)]
);

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	accounts: many(accounts)
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	})
}));

// ---------------------------------------------------------------------------
// App tables
// ---------------------------------------------------------------------------

// Subscriptions table - for Stripe subscriptions
export const subscriptions = pgTable('subscriptions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	stripeCustomerId: text('stripe_customer_id').notNull(),
	stripeSubscriptionId: text('stripe_subscription_id').unique(),
	stripePriceId: text('stripe_price_id'),
	status: text('status').notNull().default('inactive'),
	plan: text('plan').default('free'),
	currentPeriodStart: timestampTz('current_period_start'),
	currentPeriodEnd: timestampTz('current_period_end'),
	cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
	createdAt: timestampTz('created_at')
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: timestampTz('updated_at')
		.notNull()
		.$defaultFn(() => new Date())
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
