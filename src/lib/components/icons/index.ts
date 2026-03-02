// Technology brand icons using official Simple Icons SVG paths with brand colors
export { default as BunIcon } from './bun-icon.svelte';
export { default as SvelteKitIcon } from './sveltekit-icon.svelte';
export { default as TursoIcon } from './turso-icon.svelte';
export { default as BetterAuthIcon } from './better-auth-icon.svelte';
export { default as StripeIcon } from './stripe-icon.svelte';
export { default as ResendIcon } from './resend-icon.svelte';
export { default as ShadcnIcon } from './shadcn-icon.svelte';
export { default as FlyIcon } from './fly-icon.svelte';

// Official brand colors from Simple Icons
export const brandColors = {
	bun: '#000000',
	svelte: '#FF3E00',
	turso: '#4FF8D2',
	stripe: '#635BFF',
	resend: '#000000',
	flyio: '#24175B',
	betterAuth: '#FFFFFF', // Note: Better Auth uses white, may need dark background
	shadcnui: '#000000'
} as const;
