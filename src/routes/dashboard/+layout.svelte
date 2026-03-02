<script lang="ts">
	import AppSidebar from '$lib/components/dashboard/app-sidebar.svelte';
	import { SidebarProvider, SidebarInset, SidebarTrigger } from '$lib/components/ui/sidebar/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { page } from '$app/stores';

	let { children } = $props();

	// Generate breadcrumb items from the current path
	function getBreadcrumbs(pathname: string) {
		const parts = pathname.split('/').filter(Boolean);
		return parts.map((part, index) => ({
			label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
			href: '/' + parts.slice(0, index + 1).join('/'),
			isLast: index === parts.length - 1
		}));
	}

	$effect(() => {
		// Breadcrumbs will update reactively
	});
</script>

<SidebarProvider>
	<AppSidebar />
	<SidebarInset>
		<header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
			<div class="flex items-center gap-2 px-4">
				<SidebarTrigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 h-4" />
				<Breadcrumb.Root>
					<Breadcrumb.List>
						{#each getBreadcrumbs($page.url.pathname) as crumb, i}
							{#if i > 0}
								<Breadcrumb.Separator class="hidden md:block" />
							{/if}
							<Breadcrumb.Item class="hidden md:block">
								{#if crumb.isLast}
									<Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
								{:else}
									<Breadcrumb.Link href={crumb.href}>{crumb.label}</Breadcrumb.Link>
								{/if}
							</Breadcrumb.Item>
						{/each}
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</div>
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
			{@render children()}
		</div>
	</SidebarInset>
</SidebarProvider>
