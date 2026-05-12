<script>
	import { getContext } from "svelte";
	import { onDestroy, onMount } from "svelte";
	import { renderSemanticsRibbons } from "./semanticsRibbonsChart.js";

	let { overlays = [] } = $props();

	const getData = getContext("data");

	let chartMount = $state(null);
	let destroyChart = () => {};
	let resizeObserver;
	let rafId = 0;

	const payload = $derived(getData?.()?.semanticsRibbonsPayload ?? null);
	const payloadError = $derived(getData?.()?.semanticsRibbonsError ?? null);

	const payloadSummary = $derived.by(() => {
		if (!payload) return null;
		return `${payload.categories.length} categories · GSL n=${payload.nGsl} · NGSL n=${payload.nNgsl}`;
	});

	function renderChart() {
		destroyChart();
		destroyChart = () => {};
		if (!chartMount || !payload || payloadError) return;
		destroyChart = renderSemanticsRibbons(chartMount, payload);
	}

	function scheduleRender() {
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			rafId = 0;
			renderChart();
		});
	}

	onMount(() => {
		renderChart();
		if (!chartMount) return;
		resizeObserver = new ResizeObserver(() => {
			scheduleRender();
		});
		resizeObserver.observe(chartMount);
	});

	onDestroy(() => {
		if (rafId) cancelAnimationFrame(rafId);
		resizeObserver?.disconnect();
		destroyChart();
	});
</script>

<div class="semantics-viz">
	{#if payloadError}
		<p class="semantics-viz-error" role="alert">{payloadError}</p>
	{:else if payloadSummary}
		<p class="semantics-viz-status">{payloadSummary}</p>
		{#if overlays.length}
			<p class="semantics-viz-overlays">{overlays.length} overlay step(s) from copy (for interaction later).</p>
		{/if}
		<div class="semantics-viz-chart" bind:this={chartMount}></div>
	{:else}
		<p class="semantics-viz-error" role="alert">No semantics ribbon payload. Check semantics.csv and column names (word, set, usas_top_level_name).</p>
	{/if}
</div>

<style>
	.semantics-viz {
		--sem-slope-width: var(--max-prose-width, 650px);
		--sem-font-scale: 1;
		--sem-min-band-font-size: 15px;
		--sem-left-label-offset: 16;
		--sem-left-label-hover-shift: 30;
		--sem-left-percent-offset: 8;
		--sem-right-percent-offset: 8;
		--sem-right-change-offset: 46;
		--sem-responsive-breakpoint: 1080;
		--sem-compact-breakpoint: 700;
		--sem-mobile-margin: 8;
		--sem-mobile-margin-right: 16;
		--sem-mobile-label-max-pct: 0.3;
		--sem-mobile-label-min: 100;
		--sem-mobile-right-label-max-pct: 0.08;
		--sem-mobile-right-label-min: 44;
		--sem-mobile-slope-min: 220;
		--sem-debug-layout: 0;
		--sem-ribbon-up: #f493ff;
		--sem-ribbon-down: #ffaa4a;
		--sem-ribbon-neutral: #908a82;
		--sem-ribbon-tan: #b2a47f;
		--sem-ribbon-up-text: #db6ae8;
		--sem-ribbon-down-text: #ed9027;
		--sem-ribbon-neutral-text: #908a82;
		--sem-ribbon-tan-text: #988f77;
		--sem-ribbon-label: #8f8a77;
		--sem-ribbon-header: #706b66;
		--sem-ribbon-header-sub: #9a948c;
		width: 100%;
		max-width: 980px;
		margin-inline: auto;
		min-height: 8rem;
		overflow: visible;
	}

	.semantics-viz-chart {
		width: min(100%, var(--sem-slope-width));
		margin-inline: auto;
		overflow: visible;
	}

	.semantics-viz-overlays {
		font-size: var(--14px, 0.875rem);
		color: var(--color-secondary);
		margin-bottom: 0.5rem;
	}

	@media (max-width: 1080px) {
		.semantics-viz {
			--sem-slope-width: 100%;
		}
	}

	@media (max-width: 700px) {
		.semantics-viz {
			--sem-min-band-font-size: 13px;
			--sem-font-scale: 0.9;
			--sem-left-label-offset: 8;
			--sem-left-label-hover-shift: 14;
			--sem-right-change-offset: 32;
		}
	}

	@media (max-width: 510px){
		.semantics-viz {
			--sem-mobile-slope-min: 200;
			--sem-mobile-label-max-pct: 0.5;
			--sem-mobile-label-min: 150;
		}
	}
</style>
