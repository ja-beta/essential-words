<script>
	import { getContext, onDestroy, onMount } from "svelte";
	import { CONCRETENESS_KDE_CONFIG as cfg, renderConcretenessKde } from "./concretenessKdeChart.js";

	let { annotation = "" } = $props();

	const getData = getContext("data");

	let chartMount = $state(null);
	let chartController = null;
	let resizeObserver;
	let rafId = 0;
	let lastRenderedWidth = 0;

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
		if (chartController && Math.abs(width - lastRenderedWidth) < 2) return;

		chartController?.destroy();
		lastRenderedWidth = width;
		chartController = renderConcretenessKde(chartMount, payload, { width });
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
		if (!chartMount) return;
		resizeObserver = new ResizeObserver(() => scheduleRender());
		resizeObserver.observe(chartMount);
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
		<p class="concr-kde-source" style={sourceStyle}>
			Kernel density estimation, bandwidth {payload.bandwidth}. · Data source: Brysbaert et al. (2014)
		</p>
	{/if}
</div>

<style>
	.concr-kde {
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
        max-width: 24ch;
        font-size: 1.125rem;
        line-height: 1.2;
        position: absolute;
        top: -13%;
        z-index: 1;
        left: 50%;
    }

	.concr-kde-annotation :global(.annotation) {
        background-image: linear-gradient(color-mix(in srgb, var(--color-accent) 25%, transparent), color-mix(in srgb, var(--color-accent) 25%, transparent));
        padding: 0 0.35rem;
        color: var(--color-highlight-text);
        box-decoration-break: clone;
        background-repeat: no-repeat;
        background-size: 100% 1.15em;
        background-position: 0 67%;
    }


</style>
