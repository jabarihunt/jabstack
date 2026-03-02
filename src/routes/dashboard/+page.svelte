<script lang="ts">
	import StatsCard from '$lib/components/dashboard/stats-card.svelte';
	import AreaChart from '$lib/components/dashboard/area-chart.svelte';
	import DataTable from '$lib/components/dashboard/data-table.svelte';
	import { formatCurrency, formatNumber } from '$lib/utils.js';

	// Sample stats data
	const stats = [
		{
			title: 'Total Revenue',
			value: formatCurrency(1250.0),
			change: 12.5,
			description: 'Trending up this month'
		},
		{
			title: 'New Customers',
			value: formatNumber(1234),
			change: -20,
			description: 'Down 20% this period'
		},
		{
			title: 'Active Accounts',
			value: formatNumber(45678),
			change: 12.5,
			description: 'Strong user retention'
		},
		{
			title: 'Growth Rate',
			value: '4.5%',
			change: 4.5,
			description: 'Steady performance increase'
		}
	];
</script>

<svelte:head>
	<title>Dashboard - JabStack</title>
</svelte:head>

<!-- Stats Cards -->
<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	{#each stats as stat}
		<StatsCard
			title={stat.title}
			value={stat.value}
			change={stat.change}
			description={stat.description}
		/>
	{/each}
</div>

<!-- Area Chart -->
<AreaChart />

<!-- Data Table -->
<DataTable />
