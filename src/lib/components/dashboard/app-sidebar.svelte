<script lang="ts">
	import {
		Sidebar,
		SidebarContent,
		SidebarFooter,
		SidebarGroup,
		SidebarGroupContent,
		SidebarGroupLabel,
		SidebarHeader,
		SidebarMenu,
		SidebarMenuButton,
		SidebarMenuItem,
		SidebarRail
	} from '$lib/components/ui/sidebar/index.js';
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
		ChevronUp,
		MoreHorizontal
	} from 'lucide-svelte';
	import { page } from '$app/stores';

	const user = {
		name: 'shadcn',
		email: 'm@example.com'
	};
</script>

<Sidebar variant="inset" collapsible="icon">
	<SidebarHeader>
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
					{#snippet child({ props })}
						<a href="/dashboard" {...props}>
							<div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
								<span class="text-sm font-bold">J</span>
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">JabStack</span>
								<span class="truncate text-xs">Enterprise</span>
							</div>
						</a>
					{/snippet}
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	</SidebarHeader>
	<SidebarContent>
		<!-- Platform Navigation -->
		<SidebarGroup>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton isActive={$page.url.pathname === '/dashboard'}>
							{#snippet child({ props })}
								<a href="/dashboard" {...props}>
									<LayoutDashboard class="size-4" />
									<span>Dashboard</span>
								</a>
							{/snippet}
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton isActive={$page.url.pathname === '/dashboard/lifecycle'}>
							{#snippet child({ props })}
								<a href="/dashboard/lifecycle" {...props}>
									<LineChart class="size-4" />
									<span>Lifecycle</span>
								</a>
							{/snippet}
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton isActive={$page.url.pathname === '/dashboard/analytics'}>
							{#snippet child({ props })}
								<a href="/dashboard/analytics" {...props}>
									<FileBarChart class="size-4" />
									<span>Analytics</span>
								</a>
							{/snippet}
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton isActive={$page.url.pathname === '/dashboard/projects'}>
							{#snippet child({ props })}
								<a href="/dashboard/projects" {...props}>
									<FolderKanban class="size-4" />
									<span>Projects</span>
								</a>
							{/snippet}
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton isActive={$page.url.pathname === '/dashboard/team'}>
							{#snippet child({ props })}
								<a href="/dashboard/team" {...props}>
									<Users class="size-4" />
									<span>Team</span>
								</a>
							{/snippet}
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>

		<!-- Documents Navigation -->
		<SidebarGroup>
			<SidebarGroupLabel>Documents</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton isActive={$page.url.pathname === '/dashboard/data-library'}>
							{#snippet child({ props })}
								<a href="/dashboard/data-library" {...props}>
									<Database class="size-4" />
									<span>Data Library</span>
								</a>
							{/snippet}
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton isActive={$page.url.pathname === '/dashboard/reports'}>
							{#snippet child({ props })}
								<a href="/dashboard/reports" {...props}>
									<FileText class="size-4" />
									<span>Reports</span>
								</a>
							{/snippet}
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton isActive={$page.url.pathname === '/dashboard/word-assistant'}>
							{#snippet child({ props })}
								<a href="/dashboard/word-assistant" {...props}>
									<MessageSquare class="size-4" />
									<span>Word Assistant</span>
								</a>
							{/snippet}
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton>
							{#snippet child({ props })}
								<button {...props}>
									<MoreHorizontal class="size-4" />
									<span>More</span>
								</button>
							{/snippet}
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>

		<!-- Secondary Navigation (pushed to bottom) -->
		<SidebarGroup class="mt-auto">
			<SidebarGroupContent>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton isActive={$page.url.pathname === '/dashboard/settings'}>
							{#snippet child({ props })}
								<a href="/dashboard/settings" {...props}>
									<Settings class="size-4" />
									<span>Settings</span>
								</a>
							{/snippet}
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton isActive={$page.url.pathname === '/dashboard/help'}>
							{#snippet child({ props })}
								<a href="/dashboard/help" {...props}>
									<HelpCircle class="size-4" />
									<span>Get Help</span>
								</a>
							{/snippet}
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton isActive={$page.url.pathname === '/dashboard/search'}>
							{#snippet child({ props })}
								<a href="/dashboard/search" {...props}>
									<Search class="size-4" />
									<span>Search</span>
								</a>
							{/snippet}
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	</SidebarContent>
	<SidebarFooter>
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton size="lg">
					{#snippet child({ props })}
						<a href="/dashboard/profile" {...props}>
							<div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent">
								<span class="text-sm font-medium">S</span>
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">{user.name}</span>
								<span class="truncate text-xs">{user.email}</span>
							</div>
							<ChevronUp class="ml-auto size-4" />
						</a>
					{/snippet}
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	</SidebarFooter>
	<SidebarRail />
</Sidebar>
