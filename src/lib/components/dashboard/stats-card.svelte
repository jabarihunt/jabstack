<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { cn, formatPercentage } from '$lib/utils.js';
	import { TrendingUp, TrendingDown } from 'lucide-svelte';

	interface Props {
		title: string;
		value: string;
		change: number;
		description: string;
		class?: string;
	}

	let { title, value, change, description, class: className }: Props = $props();

	const isPositive = change >= 0;
</script>

<Card class={cn('', className)}>
	<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
		<CardTitle class="text-sm font-medium">{title}</CardTitle>
		<span class={cn('text-xs font-medium', isPositive ? 'text-green-600' : 'text-red-600')}>
			{formatPercentage(change)}
		</span>
	</CardHeader>
	<CardContent>
		<div class="text-2xl font-bold">{value}</div>
		<p class="text-xs text-muted-foreground">
			{#if isPositive}
				<TrendingUp class="mr-1 inline h-3 w-3 text-green-600" />
			{:else}
				<TrendingDown class="mr-1 inline h-3 w-3 text-red-600" />
			{/if}
			{description}
		</p>
	</CardContent>
</Card>
