<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<div class={cn('flex items-center p-6 pt-0', className)} {...restProps}>
	{@render children?.()}
</div>
