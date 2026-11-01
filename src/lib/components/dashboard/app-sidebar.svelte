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
	} from '#lib/components/ui/sidebar/index.js';
	import { LayoutDashboard, Settings, ChevronUp } from '@lucide/svelte';
	import { page } from '$app/state';

	// Placeholder user until the dashboard reads the signed-in session
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
		<!-- Platform Navigation: add a link for each page you create under src/routes/dashboard/ -->
		<SidebarGroup>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton isActive={page.url.pathname === '/dashboard'}>
							{#snippet child({ props })}
								<a href="/dashboard" {...props}>
									<LayoutDashboard class="size-4" />
									<span>Dashboard</span>
								</a>
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
						<SidebarMenuButton isActive={page.url.pathname === '/dashboard/settings'}>
							{#snippet child({ props })}
								<a href="/dashboard/settings" {...props}>
									<Settings class="size-4" />
									<span>Settings</span>
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
						<a href="/dashboard/settings" {...props}>
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
