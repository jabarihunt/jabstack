<script lang="ts">
	import { Button } from 'bits-ui';
	import { page } from '$app/state';

	// Shown for 404s and for errors thrown while loading or rendering a page.
	// Unexpected errors arrive with the generic message "Internal Error", so no
	// server details reach the browser.
	const notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? 'Page not found' : 'Error'} - JabStack</title>
</svelte:head>

<main class="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center text-zinc-900">
	<p class="text-sm font-semibold text-emerald-600">{page.status}</p>
	<h1 class="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
		{notFound ? 'Page not found' : 'Something went wrong'}
	</h1>
	<p class="mt-4 max-w-md text-zinc-600">
		{notFound ? "The page you're looking for doesn't exist or has moved." : page.error?.message}
	</p>
	<div class="mt-10 flex items-center justify-center gap-4">
		<Button.Root href="/" class="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800 transition-colors">
			Go home
		</Button.Root>
		<Button.Root href="/dashboard" class="rounded-lg border border-zinc-300 px-6 py-3 font-medium text-zinc-900 hover:bg-zinc-100 transition-colors">
			View Dashboard
		</Button.Root>
	</div>
</main>
