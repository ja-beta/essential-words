<script>
	import { getContext, onDestroy, onMount } from "svelte";
	import { renderConcretenessBands } from "./concretenessBandsChart.js";

	const getData = getContext("data");

	let chartMount = $state(null);
	let chartWrap = $state(null);
	let chartController = null;
	let resizeObserver;
	let rafId = 0;
	let lastRenderedWidth = 0;

	const payload = $derived(getData?.()?.concretenessBandsPayload ?? null);
	const payloadError = $derived(getData?.()?.concretenessBandsError ?? null);

	function renderChart() {
		if (!chartMount || !payload || payloadError) {
			chartController?.destroy();
			chartController = null;
			return;
		}
		const width = chartMount.clientWidth;
		if (width < 1) return;
		if (chartController && Math.abs(width - lastRenderedWidth) < 2) return;

		chartController?.destroy();
		lastRenderedWidth = width;
		chartController = renderConcretenessBands(chartMount, payload, { width });
	}

	function scheduleRender() {
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			rafId = 0;
			renderChart();
		});
	}

	onMount(() => {
		scheduleRender();
		const resizeTarget = chartWrap ?? chartMount;
		if (!resizeTarget) return;
		resizeObserver = new ResizeObserver(() => scheduleRender());
		resizeObserver.observe(resizeTarget);
	});

	onDestroy(() => {
		if (rafId) cancelAnimationFrame(rafId);
		resizeObserver?.disconnect();
		chartController?.destroy();
		chartController = null;
	});

	$effect(() => {
		payload;
		payloadError;
		lastRenderedWidth = 0;
		scheduleRender();
	});
</script>

<div class="concr-bands">
	{#if payloadError}
		<p class="concr-bands-error" role="alert">{payloadError}</p>
	{:else if !payload}
		<p class="concr-bands-error" role="alert">No concreteness bands data loaded.</p>
	{:else}
		<div class="concr-bands-chart-wrap" bind:this={chartWrap}>
			<div class="concr-bands-chart" bind:this={chartMount}></div>
		</div>
		<div class="concr-bands-legend" aria-hidden="true">
			<span class="concr-bands-legend-item">
				<span class="concr-bands-swatch concr-bands-swatch--removed"></span>
				Words removed from 1953 list
			</span>
			<span class="concr-bands-legend-item">
				<span class="concr-bands-swatch concr-bands-swatch--added"></span>
				Words added to 2023 list
			</span>
		</div>
		<p class="concr-bands-note">
			Width = share of that word set in this concreteness range (removed ÷ {payload.totalRemoved}
			words; added ÷ {payload.totalAdded} words), on a shared scale. Hover to read the words.
		</p>
	{/if}
</div>

<style>
	
	.concr-bands {
		--concr-bands-margin-top: 72px;
		--concr-bands-margin-right: 24px;
		--concr-bands-margin-bottom: 72px;
		--concr-bands-margin-left: 24px;
		--concr-bands-band-h: 36px;
		--concr-bands-band-gap: 8px;
		--concr-bands-center-gap: 24px;
		--concr-bands-marquee-font-size: 28px;
		--concr-bands-marquee-speed: 16;
		--concr-bands-min-bar-width: 4px;
		--concr-bands-text-pad: 4px;
		--concr-bands-axis-line-pad: 8px;
		--concr-bands-dir-label-offset-y: 28px;
		--concr-bands-dir-label-offset-x: 8px;
		--concr-bands-endpoint-offset-top: 10px;
		--concr-bands-endpoint-offset-bottom: 20px;
		--concr-bands-axis-label-w: 28px;
		--concr-bands-axis-label-h: 14px;
		--concr-bands-dir-label-size: 11px;
		--concr-bands-axis-whole-size: 11px;
		--concr-bands-axis-half-size: 9px;
		--concr-bands-endpoint-size: 12px;

		width: 100%;
		max-width: min(100%, var(--max-chart-width));
		margin-inline: auto;
		box-sizing: border-box;
	}

	@media (max-width: 1080px) {
		.concr-bands {
			max-width: min(100%, var(--max-prose-width));
		}
	}

	@media (max-width: 520px) {
		.concr-bands {
			--concr-bands-band-h: 28px;
			--concr-bands-marquee-font-size: 18px;
			--concr-bands-margin-top: 48px;
			--concr-bands-margin-bottom: 48px;
			--concr-bands-dir-label-offset-y: 22px;
		}
	}

	.concr-bands-chart-wrap {
		overflow-x: auto;
		width: 100%;
	}

	.concr-bands-chart {
		position: relative;
		width: 100%;
		min-width: 320px;
	}

	.concr-bands-chart :global(svg) {
		display: block;
		overflow: visible;
	}

	.concr-bands-legend {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 1.5rem;
		justify-content: center;
		margin-top: 1.125rem;
		font-size: 11px;
		color: var(--color-secondary);
	}

	.concr-bands-legend-item {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.concr-bands-swatch {
		width: 11px;
		height: 11px;
		border-radius: 1px;
		flex-shrink: 0;
	}

	.concr-bands-swatch--removed {
		background: var(--concr-bands-removed-bg, rgba(237, 144, 39, 0.3));
		border: 1px solid var(--color-gsl);
	}

	.concr-bands-swatch--added {
		background: var(--concr-bands-added-bg, rgba(219, 106, 232, 0.25));
		border: 1px solid var(--color-ngsl);
	}

	.concr-bands-note {
		text-align: center;
		font-size: 0.69rem;
		color: var(--color-secondary);
		margin-top: 0.5rem;
	}

</style>
