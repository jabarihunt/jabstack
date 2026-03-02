import { z } from 'zod';
import {
	DATABASE_URL,
	DATABASE_AUTH_TOKEN,
	BETTER_AUTH_SECRET,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	STRIPE_SECRET_KEY,
	STRIPE_WEBHOOK_SECRET,
	RESEND_API_KEY
} from '$env/static/private';
import { PUBLIC_STRIPE_PUBLISHABLE_KEY, PUBLIC_APP_URL } from '$env/static/public';

const privateEnvSchema = z.object({
	DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
	DATABASE_AUTH_TOKEN: z.string().optional(),
	BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
	GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
	GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
	STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
	STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_'),
	RESEND_API_KEY: z.string().startsWith('re_', 'RESEND_API_KEY must start with re_')
});

const publicEnvSchema = z.object({
	PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_'),
	PUBLIC_APP_URL: z.string().url('PUBLIC_APP_URL must be a valid URL')
});

// Parse and validate private environment variables
const privateEnvResult = privateEnvSchema.safeParse({
	DATABASE_URL,
	DATABASE_AUTH_TOKEN,
	BETTER_AUTH_SECRET,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	STRIPE_SECRET_KEY,
	STRIPE_WEBHOOK_SECRET,
	RESEND_API_KEY
});

// Parse and validate public environment variables
const publicEnvResult = publicEnvSchema.safeParse({
	PUBLIC_STRIPE_PUBLISHABLE_KEY,
	PUBLIC_APP_URL
});

if (!privateEnvResult.success) {
	console.error('❌ Invalid private environment variables:');
	console.error(privateEnvResult.error.flatten().fieldErrors);
	throw new Error('Invalid private environment variables');
}

if (!publicEnvResult.success) {
	console.error('❌ Invalid public environment variables:');
	console.error(publicEnvResult.error.flatten().fieldErrors);
	throw new Error('Invalid public environment variables');
}

export const env = {
	...privateEnvResult.data,
	...publicEnvResult.data
};

// Type exports for use in other files
export type Env = typeof env;
