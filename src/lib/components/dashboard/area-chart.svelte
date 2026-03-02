<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { onMount } from 'svelte';

	interface Props {
		title?: string;
		description?: string;
		class?: string;
	}

	let { title = 'Total Visitors', description = 'Total for the last 3 months', class: className }: Props = $props();

	let selectedPeriod = $state<'3months' | '30days' | '7days'>('3months');
	let chartCanvas: HTMLCanvasElement;
	let chartInstance: any = null;

	// Sample data - replace with real data
	const chartData = {
		'3months': {
			labels: ['Apr 7', 'Apr 13', 'Apr 19', 'Apr 26', 'May 2', 'May 8', 'May 14', 'May 21', 'May 28', 'Jun 3', 'Jun 9', 'Jun 15', 'Jun 22', 'Jun 30'],
			mobile: [186, 305, 237, 273, 209, 214, 186, 305, 237, 273, 209, 214, 186, 305],
			desktop: [80, 200, 120, 190, 130, 140, 80, 200, 120, 190, 130, 140, 80, 200]
		},
		'30days': {
			labels: ['Jun 1', 'Jun 5', 'Jun 10', 'Jun 15', 'Jun 20', 'Jun 25', 'Jun 30'],
			mobile: [186, 305, 237, 273, 209, 214, 186],
			desktop: [80, 200, 120, 190, 130, 140, 80]
		},
		'7days': {
			labels: ['Jun 24', 'Jun 25', 'Jun 26', 'Jun 27', 'Jun 28', 'Jun 29', 'Jun 30'],
			mobile: [273, 209, 214, 186, 305, 237, 273],
			desktop: [190, 130, 140, 80, 200, 120, 190]
		}
	};

	async function initChart() {
		if (typeof window === 'undefined') return;

		const { Chart, registerables } = await import('chart.js');
		Chart.register(...registerables);

		if (chartInstance) {
			chartInstance.destroy();
		}

		const data = chartData[selectedPeriod];

		chartInstance = new Chart(chartCanvas, {
			type: 'line',
			data: {
				labels: data.labels,
				datasets: [
					{
						label: 'Mobile',
						data: data.mobile,
						fill: true,
						backgroundColor: 'rgba(59, 130, 246, 0.1)',
						borderColor: 'rgb(59, 130, 246)',
						tension: 0.4
					},
					{
						label: 'Desktop',
						data: data.desktop,
						fill: true,
						backgroundColor: 'rgba(156, 163, 175, 0.1)',
						borderColor: 'rgb(156, 163, 175)',
						tension: 0.4
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						mode: 'index',
						intersect: false
					}
				},
				scales: {
					x: {
						grid: {
							display: false
						}
					},
					y: {
						grid: {
							color: 'rgba(0, 0, 0, 0.05)'
						}
					}
				},
				interaction: {
					mode: 'nearest',
					axis: 'x',
					intersect: false
				}
			}
		});
	}

	onMount(() => {
		initChart();
		return () => {
			if (chartInstance) {
				chartInstance.destroy();
			}
		};
	});

	$effect(() => {
		// Re-render chart when period changes
		selectedPeriod;
		if (chartCanvas) {
			initChart();
		}
	});
</script>

<Card class={cn('', className)}>
	<CardHeader class="flex flex-row items-center justify-between">
		<div>
			<CardTitle>{title}</CardTitle>
			<CardDescription>{description}</CardDescription>
		</div>
		<div class="flex gap-1">
			<Button
				variant={selectedPeriod === '3months' ? 'secondary' : 'ghost'}
				size="sm"
				onclick={() => (selectedPeriod = '3months')}
			>
				Last 3 months
			</Button>
			<Button
				variant={selectedPeriod === '30days' ? 'secondary' : 'ghost'}
				size="sm"
				onclick={() => (selectedPeriod = '30days')}
			>
				Last 30 days
			</Button>
			<Button
				variant={selectedPeriod === '7days' ? 'secondary' : 'ghost'}
				size="sm"
				onclick={() => (selectedPeriod = '7days')}
			>
				Last 7 days
			</Button>
		</div>
	</CardHeader>
	<CardContent>
		<div class="h-[300px]">
			<canvas bind:this={chartCanvas}></canvas>
		</div>
		<div class="mt-4 flex items-center justify-center gap-6">
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded-full bg-blue-500"></div>
				<span class="text-sm text-muted-foreground">Mobile</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded-full bg-gray-400"></div>
				<span class="text-sm text-muted-foreground">Desktop</span>
			</div>
		</div>
	</CardContent>
</Card>
