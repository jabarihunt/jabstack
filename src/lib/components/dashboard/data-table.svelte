<script lang="ts">
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { Plus, Settings2 } from 'lucide-svelte';

	interface TableRow {
		header: string;
		sectionType: string;
		status: 'Draft' | 'In Progress' | 'Done';
		target: string;
		limit: string;
		reviewer: string;
	}

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();

	let activeTab = $state<'outline' | 'performance' | 'personnel' | 'documents'>('outline');

	// Sample data
	const tableData: TableRow[] = [
		{ header: 'Introduction', sectionType: 'Overview', status: 'Done', target: '500', limit: '600', reviewer: 'John D.' },
		{ header: 'Market Analysis', sectionType: 'Research', status: 'In Progress', target: '1000', limit: '1200', reviewer: 'Sarah M.' },
		{ header: 'Competitive Landscape', sectionType: 'Analysis', status: 'In Progress', target: '800', limit: '1000', reviewer: 'Mike R.' },
		{ header: 'Product Strategy', sectionType: 'Strategy', status: 'Draft', target: '1500', limit: '2000', reviewer: 'Emily K.' },
		{ header: 'Financial Projections', sectionType: 'Finance', status: 'Draft', target: '1200', limit: '1500', reviewer: 'David L.' },
		{ header: 'Implementation Plan', sectionType: 'Planning', status: 'Draft', target: '900', limit: '1100', reviewer: 'Lisa P.' }
	];

	function getStatusColor(status: TableRow['status']) {
		switch (status) {
			case 'Done':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'In Progress':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			case 'Draft':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
		}
	}
</script>

<Card class={cn('', className)}>
	<CardHeader class="flex flex-row items-center justify-between">
		<div class="flex items-center gap-4">
			<button
				onclick={() => (activeTab = 'outline')}
				class={cn(
					'text-sm font-medium transition-colors',
					activeTab === 'outline'
						? 'text-foreground'
						: 'text-muted-foreground hover:text-foreground'
				)}
			>
				Outline
			</button>
			<button
				onclick={() => (activeTab = 'performance')}
				class={cn(
					'text-sm font-medium transition-colors',
					activeTab === 'performance'
						? 'text-foreground'
						: 'text-muted-foreground hover:text-foreground'
				)}
			>
				Past Performance
				<span class="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">3</span>
			</button>
			<button
				onclick={() => (activeTab = 'personnel')}
				class={cn(
					'text-sm font-medium transition-colors',
					activeTab === 'personnel'
						? 'text-foreground'
						: 'text-muted-foreground hover:text-foreground'
				)}
			>
				Key Personnel
				<span class="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">2</span>
			</button>
			<button
				onclick={() => (activeTab = 'documents')}
				class={cn(
					'text-sm font-medium transition-colors',
					activeTab === 'documents'
						? 'text-foreground'
						: 'text-muted-foreground hover:text-foreground'
				)}
			>
				Focus Documents
			</button>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm">
				<Settings2 class="mr-2 h-4 w-4" />
				Customize Columns
			</Button>
			<Button size="sm">
				<Plus class="mr-2 h-4 w-4" />
				Add Section
			</Button>
		</div>
	</CardHeader>
	<CardContent>
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b text-left text-sm text-muted-foreground">
						<th class="pb-3 font-medium">Header</th>
						<th class="pb-3 font-medium">Section Type</th>
						<th class="pb-3 font-medium">Status</th>
						<th class="pb-3 font-medium">Target</th>
						<th class="pb-3 font-medium">Limit</th>
						<th class="pb-3 font-medium">Reviewer</th>
					</tr>
				</thead>
				<tbody>
					{#each tableData as row}
						<tr class="border-b last:border-0">
							<td class="py-3 font-medium">{row.header}</td>
							<td class="py-3 text-muted-foreground">{row.sectionType}</td>
							<td class="py-3">
								<span class={cn('rounded-full px-2 py-1 text-xs font-medium', getStatusColor(row.status))}>
									{row.status}
								</span>
							</td>
							<td class="py-3 text-muted-foreground">{row.target}</td>
							<td class="py-3 text-muted-foreground">{row.limit}</td>
							<td class="py-3 text-muted-foreground">{row.reviewer}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</CardContent>
</Card>
