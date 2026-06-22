<script>
	import { browser } from "$app/environment";
	import { getContext, onDestroy, onMount } from "svelte";
	import { CONCRETENESS_KDE_CONFIG as cfg, renderConcretenessKde } from "./concretenessKdeChart.js";
	import { observeChartVisibility } from "$utils/chartVisibility.js";

	let { annotation = "" } = $props();

	const getData = getContext("data");

	let chartMount = $state(null);
	let chartController = null;
	let resizeObserver;
	let visibilityObserver;
	let rafId = 0;
	let chartReady = $state(false);
	let chartSectionVisible = false;
	let lastRenderedWidth = 0;
	let lastRenderedNarrow = null;

	const payload = $derived(getData?.()?.concretenessKdePayload ?? null);
	const payloadError = $derived(getData?.()?.concretenessKdeError ?? null);

	const sourceStyle = $derived(
		`margin-top:${cfg.sourceNote.marginTop};font-size:${cfg.sourceNote.fontSize};color:${cfg.sourceNote.color};font-family:${cfg.sourceNote.fontFamily ?? cfg.typography.fontFamily}`
	);

	const errorStyle = $derived(`font-size:${cfg.error.fontSize}`);

	function renderChart() {
		if (!chartMount || !payload || payloadError) {
			chartController?.destroy();
			chartController = null;
			return;
		}
		const width = chartMount.clientWidth;
		if (width < 1) return;
		const narrow = window.innerWidth <= 720;
		if (
			chartController &&
			Math.abs(width - lastRenderedWidth) < 2 &&
			narrow === lastRenderedNarrow
		) {
			return;
		}

		chartController?.destroy();
		lastRenderedWidth = width;
		lastRenderedNarrow = narrow;
		chartController = renderConcretenessKde(chartMount, payload, { width });
	}

	function scheduleRender() {
		if (!chartSectionVisible) return;
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			rafId = 0;
			renderChart();
		});
	}

	function setupVisibilityObserver() {
		visibilityObserver?.disconnect();
		const target = chartMount?.closest?.(".story-section--chart") ?? chartMount;
		if (!target) return;
		visibilityObserver = observeChartVisibility(target, (visible) => {
			chartSectionVisible = visible;
			if (visible) scheduleRender();
		});
	}

	onMount(() => {
		chartReady = true;
		setupVisibilityObserver();
		if (!chartMount) return;
		resizeObserver = new ResizeObserver(() => scheduleRender());
		resizeObserver.observe(chartMount);
		window.addEventListener("resize", scheduleRender, { passive: true });
	});

	onDestroy(() => {
		if (rafId) cancelAnimationFrame(rafId);
		if (browser) window.removeEventListener("resize", scheduleRender);
		resizeObserver?.disconnect();
		visibilityObserver?.disconnect();
		chartController?.destroy();
		chartController = null;
	});

	$effect(() => {
		if (!chartReady || !chartSectionVisible) return;
		payload;
		payloadError;
		lastRenderedWidth = 0;
		lastRenderedNarrow = null;
		scheduleRender();
	});
</script>

<div class="concr-kde">
	{#if payloadError}
		<p class="concr-kde-error" role="alert" style={errorStyle}>
			Could not build concreteness chart: {payloadError}
		</p>
	{:else if !payload}
		<p class="concr-kde-error" role="alert" style={errorStyle}>No concreteness data loaded.</p>
	{:else}
		{#if annotation}
			<div class="concr-kde-annotation">{@html annotation}</div>
		{/if}
		<div class="concr-kde-chart" bind:this={chartMount}></div>
		<p class="chart-note" style={sourceStyle}>
			Kernel density estimation, bandwidth {payload.bandwidth}. · Data source: Brysbaert et al. (2014)
		</p>
	{/if}
</div>

<style>
	.concr-kde {
		--concr-kde-narrow-breakpoint: 720;
		--concr-kde-series-label-line-height: 1.15;

		width: 100%;
		max-width: var(--max-prose-width);
		margin: 0 auto;
        position: relative;
        margin-top: 2.5rem;
	}

	.concr-kde-chart {
		position: relative;
		width: 100%;
	}

	.concr-kde-chart :global(svg) {
		overflow: visible;
	}

	.concr-kde-chart :global(.concr-kde-density-hint) {
		color: var(--color-primary);
	}

    .concr-kde-chart :global(.concr-kde-series-label) {
        font-family: var(--font-mono);
        text-transform: uppercase;
    }

    .concr-kde-chart :global(.concr-kde-axis-end-label) {
        text-transform: uppercase;
        font-size: 15px;
        font-family: var(--font-mono);
        color: var(--color-primary);
        font-weight: 600;
        letter-spacing: 2%;
    }


    .concr-kde-chart :global(.concr-kde-hint-label) {
        font-size: 13px;
        font-family: var(--font-mono);
        color: var(--color-primary);
        font-weight: 500;
        letter-spacing: 2%;
    }

    .concr-kde-annotation {
        max-width: 20ch;
        font-size: 1.125rem;
        line-height: 1.2;
        position: absolute;
        top: -13%;
        z-index: 1;
        left: 35%;
    }

	.concr-kde-annotation :global(.annotation) {
        background-image: linear-gradient(color-mix(in srgb, var(--color-accent) 20%, transparent), color-mix(in srgb, var(--color-accent) 20%, transparent));
        padding: 0 0.35rem;
        color: var(--color-highlight-text);
        box-decoration-break: clone;
        background-repeat: no-repeat;
        background-size: 100% 1.15em;
        background-position: 0 67%;
    }

    .concr-kde-chart + .chart-note {
        margin-top: 3rem;
		text-align: start;
    }

	@media (max-width: 935px){
		.concr-kde{
			margin-top: 0;
		}

		.concr-kde-annotation{
			max-width: 20ch;
			font-size: 1rem;
			top: -7%;
		}
	}

	@media (max-width: 520px){

		.concr-kde-chart{
			margin-top: 3rem;
		}
		
	}

</style>
