import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

// Placeholder sign-in route. The scaffold has no sign-in UI, so this sends
// visitors straight to the dashboard.
//
// To add real sign-in, delete this file and create +page.svelte with a button
// that calls the Better Auth client, for example:
//
//   import { signIn } from '$lib/auth-client.js';
//   signIn.social({ provider: 'google', callbackURL: '/dashboard' });
//
// Better Auth handles the rest under /api/auth/*. Google returns users to
// /api/auth/callback/google, which must be an authorized redirect URI in
// Google Cloud Console.
export const load: PageServerLoad = () => {
	redirect(307, '/dashboard');
};
