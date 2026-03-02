<script lang="ts">
	import { Button } from 'bits-ui';
	import {
		BunIcon,
		SvelteKitIcon,
		TursoIcon,
		BetterAuthIcon,
		StripeIcon,
		ResendIcon,
		ShadcnIcon,
		FlyIcon
	} from '$lib/components/icons/index.js';

	const techStack = [
		{ name: 'Bun', description: 'Runtime', icon: BunIcon },
		{ name: 'SvelteKit', description: 'Framework', icon: SvelteKitIcon },
		{ name: 'Turso', description: 'Database', icon: TursoIcon },
		{ name: 'Better Auth', description: 'Authentication', icon: BetterAuthIcon },
		{ name: 'Stripe', description: 'Payments', icon: StripeIcon },
		{ name: 'Resend', description: 'Email', icon: ResendIcon },
		{ name: 'shadcn-svelte', description: 'UI Components', icon: ShadcnIcon },
		{ name: 'Fly.io', description: 'Hosting', icon: FlyIcon }
	];
</script>

<svelte:head>
	<title>JabStack - Modern Full-Stack Starter Template</title>
	<meta name="description" content="JabStack is a modern, full-stack starter template for personal projects with SvelteKit, Turso, Better Auth, Stripe, and more." />
	<meta property="og:title" content="JabStack - Modern Full-Stack Starter Template" />
	<meta property="og:description" content="Build your next project faster with JabStack. Includes authentication, payments, dashboard, and more." />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="JabStack - Modern Full-Stack Starter Template" />
	<meta name="twitter:description" content="Build your next project faster with JabStack." />
</svelte:head>

<div class="min-h-screen bg-white text-zinc-900">
	<!-- Navigation -->
	<nav class="border-b border-zinc-200">
		<div class="container mx-auto flex h-16 items-center justify-between px-4">
			<a href="/" class="text-xl font-bold">JabStack</a>
			<div class="flex items-center gap-4">
				<a href="/auth/login">
					<Button.Root class="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
						Sign In
					</Button.Root>
				</a>
				<a href="https://github.com/jabarihunt/jabstack" target="_blank" rel="noopener noreferrer">
					<Button.Root class="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
						GitHub
					</Button.Root>
				</a>
			</div>
		</div>
	</nav>

	<!-- Hero Section -->
	<main class="container mx-auto px-4 py-24">
		<div class="mx-auto max-w-3xl text-center">
			<h1 class="text-5xl font-bold tracking-tight sm:text-6xl">
				Welcome to <span class="text-emerald-600">JabStack</span>
			</h1>
			<p class="mt-6 text-xl text-zinc-600">
				A modern, full-stack starter template for personal projects. Built with SvelteKit, Turso, Better Auth, Stripe, and deployed on Fly.io.
			</p>
			<div class="mt-10 flex items-center justify-center gap-4">
				<a href="https://github.com/jabarihunt/jabstack" target="_blank" rel="noopener noreferrer">
					<Button.Root class="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800 transition-colors">
						GitHub
					</Button.Root>
				</a>
				<a href="/dashboard">
					<Button.Root class="rounded-lg border border-zinc-300 px-6 py-3 font-medium text-zinc-900 hover:bg-zinc-100 transition-colors">
						View Dashboard
					</Button.Root>
				</a>
			</div>
		</div>

		<!-- Tech Stack -->
		<div class="mx-auto mt-24 max-w-4xl">
			<h2 class="text-center text-2xl font-semibold">Built with Modern Technologies</h2>
			<div class="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
				{#each techStack as tech}
					<div class="flex flex-col items-center gap-3">
						<div class="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-100 p-2">
							<tech.icon class="h-10 w-10" />
						</div>
						<span class="font-medium">{tech.name}</span>
						<span class="text-sm text-zinc-500">{tech.description}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Features -->
		<div class="mx-auto mt-24 max-w-4xl">
			<h2 class="text-center text-2xl font-semibold">Everything You Need</h2>
			<div class="mt-12 grid gap-8 md:grid-cols-3">
				<div class="rounded-lg border border-zinc-200 p-6">
					<h3 class="text-lg font-semibold">Authentication</h3>
					<p class="mt-2 text-zinc-600">
						Google OAuth out of the box with Better Auth. Easily add more providers.
					</p>
				</div>
				<div class="rounded-lg border border-zinc-200 p-6">
					<h3 class="text-lg font-semibold">Payments</h3>
					<p class="mt-2 text-zinc-600">
						Stripe integration for subscriptions and one-time payments.
					</p>
				</div>
				<div class="rounded-lg border border-zinc-200 p-6">
					<h3 class="text-lg font-semibold">Dashboard</h3>
					<p class="mt-2 text-zinc-600">
						Beautiful dashboard with charts, tables, and sidebar navigation.
					</p>
				</div>
				<div class="rounded-lg border border-zinc-200 p-6">
					<h3 class="text-lg font-semibold">Database</h3>
					<p class="mt-2 text-zinc-600">
						SQLite locally, Turso in production. Type-safe with Drizzle ORM.
					</p>
				</div>
				<div class="rounded-lg border border-zinc-200 p-6">
					<h3 class="text-lg font-semibold">Email</h3>
					<p class="mt-2 text-zinc-600">
						Transactional emails with Resend for welcome messages and receipts.
					</p>
				</div>
				<div class="rounded-lg border border-zinc-200 p-6">
					<h3 class="text-lg font-semibold">Deploy Ready</h3>
					<p class="mt-2 text-zinc-600">
						Dockerfile and fly.toml included. Deploy to Fly.io in minutes.
					</p>
				</div>
			</div>
		</div>
	</main>

	<!-- Footer -->
	<footer class="border-t border-zinc-200 py-8">
		<div class="container mx-auto px-4 text-center text-sm text-zinc-500">
			<p>Built with JabStack. Your go-to starter for personal projects.</p>
		</div>
	</footer>
</div>
