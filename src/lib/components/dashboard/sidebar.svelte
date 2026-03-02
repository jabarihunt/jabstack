<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		LayoutDashboard,
		LineChart,
		FolderKanban,
		Users,
		FileText,
		Database,
		FileBarChart,
		MessageSquare,
		Settings,
		HelpCircle,
		Search,
		ChevronLeft,
		ChevronRight,
		Plus,
		Mail
	} from 'lucide-svelte';
	import { page } from '$app/stores';

	let collapsed = $state(false);
</script>

<aside
	class={cn(
		'flex h-screen flex-col border-r bg-sidebar transition-all duration-300',
		collapsed ? 'w-16' : 'w-64'
	)}
>
	<!-- Header -->
	<div class="flex h-16 items-center justify-between border-b px-4">
		{#if !collapsed}
			<div class="flex items-center gap-2">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
					<span class="text-sm font-bold">J</span>
				</div>
				<div class="flex flex-col">
					<span class="text-sm font-semibold text-sidebar-foreground">JabStack</span>
					<span class="text-xs text-sidebar-foreground/60">Dashboard</span>
				</div>
			</div>
		{:else}
			<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
				<span class="text-sm font-bold">J</span>
			</div>
		{/if}
		<button
			onclick={() => (collapsed = !collapsed)}
			class="rounded-md p-1 hover:bg-sidebar-accent"
		>
			{#if collapsed}
				<ChevronRight class="h-4 w-4 text-sidebar-foreground" />
			{:else}
				<ChevronLeft class="h-4 w-4 text-sidebar-foreground" />
			{/if}
		</button>
	</div>

	<!-- Quick Create Button -->
	<div class="flex items-center gap-2 p-3">
		<Button class={cn('flex-1 justify-start gap-2', collapsed && 'justify-center px-2')}>
			<Plus class="h-4 w-4" />
			{#if !collapsed}
				<span>Quick Create</span>
			{/if}
		</Button>
		{#if !collapsed}
			<Button variant="ghost" size="icon">
				<Mail class="h-4 w-4" />
			</Button>
		{/if}
	</div>

	<!-- Main Navigation -->
	<nav class="flex-1 space-y-1 overflow-y-auto px-3">
		<a
			href="/dashboard"
			class={cn(
				'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
				$page.url.pathname === '/dashboard'
					? 'bg-sidebar-accent text-sidebar-accent-foreground'
					: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
				collapsed && 'justify-center px-2'
			)}
		>
			<LayoutDashboard class="h-4 w-4 shrink-0" />
			{#if !collapsed}<span>Dashboard</span>{/if}
		</a>
		<a
			href="/dashboard/lifecycle"
			class={cn(
				'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
				$page.url.pathname === '/dashboard/lifecycle'
					? 'bg-sidebar-accent text-sidebar-accent-foreground'
					: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
				collapsed && 'justify-center px-2'
			)}
		>
			<LineChart class="h-4 w-4 shrink-0" />
			{#if !collapsed}<span>Lifecycle</span>{/if}
		</a>
		<a
			href="/dashboard/analytics"
			class={cn(
				'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
				$page.url.pathname === '/dashboard/analytics'
					? 'bg-sidebar-accent text-sidebar-accent-foreground'
					: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
				collapsed && 'justify-center px-2'
			)}
		>
			<FileBarChart class="h-4 w-4 shrink-0" />
			{#if !collapsed}<span>Analytics</span>{/if}
		</a>
		<a
			href="/dashboard/projects"
			class={cn(
				'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
				$page.url.pathname === '/dashboard/projects'
					? 'bg-sidebar-accent text-sidebar-accent-foreground'
					: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
				collapsed && 'justify-center px-2'
			)}
		>
			<FolderKanban class="h-4 w-4 shrink-0" />
			{#if !collapsed}<span>Projects</span>{/if}
		</a>
		<a
			href="/dashboard/team"
			class={cn(
				'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
				$page.url.pathname === '/dashboard/team'
					? 'bg-sidebar-accent text-sidebar-accent-foreground'
					: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
				collapsed && 'justify-center px-2'
			)}
		>
			<Users class="h-4 w-4 shrink-0" />
			{#if !collapsed}<span>Team</span>{/if}
		</a>

		<!-- Documents Section -->
		{#if !collapsed}
			<div class="pt-4">
				<span class="px-3 text-xs font-semibold uppercase text-sidebar-foreground/60">
					Documents
				</span>
			</div>
		{/if}
		<a
			href="/dashboard/data-library"
			class={cn(
				'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
				$page.url.pathname === '/dashboard/data-library'
					? 'bg-sidebar-accent text-sidebar-accent-foreground'
					: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
				collapsed && 'justify-center px-2'
			)}
		>
			<Database class="h-4 w-4 shrink-0" />
			{#if !collapsed}<span>Data Library</span>{/if}
		</a>
		<a
			href="/dashboard/reports"
			class={cn(
				'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
				$page.url.pathname === '/dashboard/reports'
					? 'bg-sidebar-accent text-sidebar-accent-foreground'
					: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
				collapsed && 'justify-center px-2'
			)}
		>
			<FileText class="h-4 w-4 shrink-0" />
			{#if !collapsed}<span>Reports</span>{/if}
		</a>
		<a
			href="/dashboard/word-assistant"
			class={cn(
				'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
				$page.url.pathname === '/dashboard/word-assistant'
					? 'bg-sidebar-accent text-sidebar-accent-foreground'
					: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
				collapsed && 'justify-center px-2'
			)}
		>
			<MessageSquare class="h-4 w-4 shrink-0" />
			{#if !collapsed}<span>Word Assistant</span>{/if}
		</a>
	</nav>

	<!-- Bottom Navigation -->
	<div class="border-t p-3">
		<a
			href="/dashboard/settings"
			class={cn(
				'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
				$page.url.pathname === '/dashboard/settings'
					? 'bg-sidebar-accent text-sidebar-accent-foreground'
					: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
				collapsed && 'justify-center px-2'
			)}
		>
			<Settings class="h-4 w-4 shrink-0" />
			{#if !collapsed}<span>Settings</span>{/if}
		</a>
		<a
			href="/dashboard/help"
			class={cn(
				'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
				$page.url.pathname === '/dashboard/help'
					? 'bg-sidebar-accent text-sidebar-accent-foreground'
					: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
				collapsed && 'justify-center px-2'
			)}
		>
			<HelpCircle class="h-4 w-4 shrink-0" />
			{#if !collapsed}<span>Get Help</span>{/if}
		</a>
		<a
			href="/dashboard/search"
			class={cn(
				'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
				$page.url.pathname === '/dashboard/search'
					? 'bg-sidebar-accent text-sidebar-accent-foreground'
					: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
				collapsed && 'justify-center px-2'
			)}
		>
			<Search class="h-4 w-4 shrink-0" />
			{#if !collapsed}<span>Search</span>{/if}
		</a>
	</div>
</aside>
