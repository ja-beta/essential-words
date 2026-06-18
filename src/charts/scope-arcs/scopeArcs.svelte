<script>
	import { getContext, onDestroy, onMount } from "svelte";
	import { renderScopeArcsChart } from "./scopeArcsChart.js";
	import { observeChartVisibility, CHART_ONSCREEN_MARGIN } from "$utils/chartVisibility.js";
	import { subscribePrefersReducedMotion } from "$utils/prefersReducedMotion.js";
	import useWindowDimensions, { getHeight } from "$runes/useWindowDimensions.svelte.js";

	let { note = "", overlays = [] } = $props();

	const getData = getContext("data");
	const win = new useWindowDimensions(150);
	const MIN_REDRAW_DELTA = 4;
	const STEP_SETTLE_MS = 120;
	const payload = $derived(getData?.()?.scopePayload ?? null);
	const payloadError = $derived(getData?.()?.scopeError ?? null);

	let chartMount = $state(null);
	let scrollyMount = $state(null);
	let chartController = null;
	let resizeObserver;
	let stepObserver;
	let visibilityObserver = null;
	let marqueeObserver = null;
	let scrollyObserver = null;
	let legendObserver = null;
	let rafId = 0;
	let chartReady = $state(false);
	let chartNear = false;
	let chartVisible = false;
	let scrollyIntersecting = $state(false);
	let legendInRange = $state(false);
	let activeStep = $state(-1);
	let lastRenderedWidth = 0;
	let prefersReducedMotionSub;
	let stepSettleTimer = 0;
	let pendingStep = null;

	const overlaySteps = $derived(overlays ?? []);
	const nRings = $derived(payload?.rings?.length ?? 5);
	const isOverview = $derived(activeStep >= overlaySteps.length && overlaySteps.length > 0);

	const legendVisible = $derived(
		scrollyIntersecting &&
			activeStep <= overlaySteps.length &&
			(activeStep >= 0 || legendInRange)
	);

	function syncMarqueeActive() {
		chartController?.setMarqueeActive(chartVisible);
	}

	function applyStepFocus() {
		if (!chartController) return;
		const N = overlaySteps.length;

		if (activeStep < 0) {
			chartController.setScrollState({ visibleRings: 1, focusedRing: 1, overview: false });
			return;
		}
		if (activeStep >= N) {
			chartController.setScrollState({ visibleRings: nRings, focusedRing: null, overview: true });
			return;
		}
		const step = activeStep + 1;
		chartController.setScrollState({
			visibleRings: step,
			focusedRing: step,
			overview: false
		});
	}

	function commitStep(next) {
		if (next === activeStep) return;
		if (stepSettleTimer) {
			clearTimeout(stepSettleTimer);
			stepSettleTimer = 0;
		}
		pendingStep = null;
		activeStep = next;
		applyStepFocus();
	}


	function scheduleStepFallback(next) {
		if (next === activeStep) return;
		pendingStep = next;
		if (stepSettleTimer) clearTimeout(stepSettleTimer);
		stepSettleTimer = setTimeout(() => {
			stepSettleTimer = 0;
			const step = pendingStep;
			pendingStep = null;
			if (step != null) commitStep(step);
		}, STEP_SETTLE_MS);
	}

	function renderChart() {
		if (!chartMount || !payload || payloadError) {
			chartController?.destroy();
			chartController = null;
			return;
		}
		const width = win.width || chartMount.clientWidth;
		if (!width || width < 2) return;
		if (chartController && Math.abs(width - lastRenderedWidth) < MIN_REDRAW_DELTA) return;
		chartController?.destroy();
		chartController = null;
		lastRenderedWidth = width;
		chartController = renderScopeArcsChart(chartMount, payload);
		chartController?.setPrefersReducedMotion?.(prefersReducedMotionSub?.get() ?? false);
		syncMarqueeActive();
		applyStepFocus();
	}

	function scheduleRender() {
		if (!chartNear) return;
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			rafId = 0;
			renderChart();
		});
	}

	function setupVisibilityObservers() {
		visibilityObserver?.disconnect();
		marqueeObserver?.disconnect();
		const target = chartMount?.closest?.(".story-section--chart") ?? chartMount;
		if (!target) return;
		visibilityObserver = observeChartVisibility(target, (near) => {
			chartNear = near;
			if (near) scheduleRender();
		});
		marqueeObserver = observeChartVisibility(
			target,
			(visible) => {
				chartVisible = visible;
				syncMarqueeActive();
			},
			{ rootMargin: CHART_ONSCREEN_MARGIN }
		);
	}

	function setupScrollyObserver() {
		scrollyObserver?.disconnect();
		if (!scrollyMount) return;
		scrollyObserver = new IntersectionObserver(
			([entry]) => {
				scrollyIntersecting = entry?.isIntersecting ?? false;
			},
			{ root: null, threshold: 0 }
		);
		scrollyObserver.observe(scrollyMount);
	}

	function setupLegendObserver() {
		legendObserver?.disconnect();
		if (!scrollyMount || !overlaySteps.length) return;
		const firstStep = scrollyMount.querySelector(".chart-overlay-step");
		if (!firstStep) return;
		legendObserver = new IntersectionObserver(
			([entry]) => {
				legendInRange = entry?.isIntersecting ?? false;
			},
			{ root: null, rootMargin: "20% 0px -80% 0px", threshold: 0 }
		);
		legendObserver.observe(firstStep);
	}

	function setupStepObserver() {
		stepObserver?.disconnect();
		if (!scrollyMount || !overlaySteps.length) return;
		const nodes = [...scrollyMount.querySelectorAll(".chart-overlay-step")];
		if (!nodes.length) return;

		stepObserver = new IntersectionObserver(
			(entries) => {
				let best = null;
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
				}
				if (best) {
					const idx = Number(best.target.getAttribute("data-step"));
					if (Number.isInteger(idx)) commitStep(idx);
					return;
				}
				const firstTop = nodes[0].getBoundingClientRect().top;
				const lastBottom = nodes.at(-1)?.getBoundingClientRect().bottom ?? 0;
				const midY = (win.height || getHeight()) * 0.5;
				let next = activeStep;
				if (firstTop > midY) next = -1;
				else if (lastBottom < midY) next = nodes.length;
				scheduleStepFallback(next);
			},
			{ root: null, rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.2, 0.5, 0.8, 1] }
		);

		for (const node of nodes) stepObserver.observe(node);
	}

	onMount(() => {
		chartReady = true;
		prefersReducedMotionSub = subscribePrefersReducedMotion(() => {
			chartController?.setPrefersReducedMotion?.(prefersReducedMotionSub?.get() ?? false);
		});
		setupVisibilityObservers();
		setupStepObserver();
		setupScrollyObserver();
		setupLegendObserver();
		const resizeTarget = chartMount?.closest(".scope-arcs") ?? chartMount;
		if (resizeTarget) {
			resizeObserver = new ResizeObserver(() => {
				scheduleRender();
			});
			resizeObserver.observe(resizeTarget);
		}
	});

	onDestroy(() => {
		if (rafId) cancelAnimationFrame(rafId);
		if (stepSettleTimer) clearTimeout(stepSettleTimer);
		resizeObserver?.disconnect();
		stepObserver?.disconnect();
		visibilityObserver?.disconnect();
		marqueeObserver?.disconnect();
		scrollyObserver?.disconnect();
		legendObserver?.disconnect();
		chartController?.destroy();
		chartController = null;
		prefersReducedMotionSub?.destroy?.();
	});

	$effect(() => {
		if (!chartReady || !chartNear) return;
		payload;
		payloadError;
		lastRenderedWidth = 0;
		scheduleRender();
	});

	$effect(() => {
		win.width;
		if (!chartReady || !chartNear) return;
		scheduleRender();
	});

	$effect(() => {
		if (!chartReady) return;
		overlaySteps;
		setupStepObserver();
		setupScrollyObserver();
		setupLegendObserver();
	});
</script>

<div class="scope-arcs" class:scope-arcs--overview={isOverview}>
	{#if payloadError}
		<p class="scope-arcs-error" role="alert">{payloadError}</p>
	{:else if !payload}
		<p class="scope-arcs-error" role="alert">No scope data loaded.</p>
	{:else}
		<div class="chart-overlay-scrolly" bind:this={scrollyMount}>
			<div class="chart-overlay-stage scope-arcs-stage">
				<div class="scope-arcs-chart-wrap">
					<div class="scope-arcs-headers" aria-hidden="true">
						<span class="scope-arcs-header scope-arcs-header--left">1953 list</span>
						<span class="scope-arcs-header scope-arcs-header--right">2023 list</span>
					</div>
					<div class="scope-arcs-chart-panel">
						<div class="scope-arcs-chart" bind:this={chartMount}></div>
					</div>
				</div>
			</div>
			{#if overlaySteps.length}
				<div class="chart-overlay-steps">
					<div class="chart-overlay-step-spacer" aria-hidden="true"></div>
					{#each overlaySteps as step, i}
						<article class="chart-overlay-step" data-step={i}>
							<div
								class="chart-overlay-step-card"
								class:chart-overlay-step-card--active={i === activeStep}
							>
								{@html step.html ?? ""}
							</div>
						</article>
					{/each}
					<div
						class="chart-overlay-step-spacer scope-arcs-overlay-spacer-bottom"
						aria-hidden="true"
					></div>
				</div>
			{/if}
		</div>
		<div
			class="scope-arcs-legend-shell"
			class:scope-arcs-legend-shell--visible={legendVisible}
			aria-hidden={!legendVisible}
		>
			<div class="scope-arcs-legend">
				<span class="scope-arcs-legend-item">
					<span class="scope-arcs-swatch scope-arcs-swatch--remained"></span>
					remained (in both lists)
				</span>
				<span class="scope-arcs-legend-item">
					<span class="scope-arcs-swatch scope-arcs-swatch--removed"></span>
					removed from 1953 list
				</span>
				<span class="scope-arcs-legend-item">
					<span class="scope-arcs-swatch scope-arcs-swatch--added"></span>
					added to 2023 list
				</span>
			</div>
		</div>

		{#if note}
			<div class="chart-note">{@html note}</div>
		{/if}
	{/if}
</div>

<style>
	.scope-arcs {
		--scope-arcs-color-remained: var(--color-secondary, #8f8a77);
		--scope-arcs-color-removed: var(--color-gsl, #ed9027);
		--scope-arcs-color-added: var(--color-ngsl, #db6ae8);
		
		--scope-arcs-max-width: 800px;
		
		--scope-arcs-min-band: 0;
		
		--scope-arcs-words-band: 30;
		/* --scope-arcs-track-gap: room between tracks (also the label gutter); auto if unset */
		--scope-arcs-focus-fade-ms: 220;
		--scope-arcs-zoom-ms: 400;
		--scope-arcs-zoom-max: 3;
		--scope-arcs-segment-gap: 2;
		--scope-arcs-unfocused-opacity: 0.35;
		--scope-arcs-side-gap: 4;
		--scope-arcs-divider-color: var(--color-secondary);
		--scope-arcs-divider-width: 1;
		--scope-arcs-divider-dash: 5 5;


		--scope-arcs-text-outset-ratio: -0.02;
		--scope-arcs-text-outset: 0;
		/* per-ring overrides: --scope-arcs-text-outset-ratio-N, --scope-arcs-text-outset-N */
		--scope-arcs-text-outset-ratio-1: -0.04;
		--scope-arcs-text-path-pad: 2;
		--scope-arcs-marquee-speed: 10;
		--scope-arcs-marquee-repeat: 3;

		--scope-arcs-label-inset: 6;

		--scope-arcs-intro-offset: 0vh;
		--scope-arcs-final-hold: calc(100vh - var(--scope-arcs-intro-offset));

		--chart-overlay-steps-top-pad: 30vh;
		--chart-overlay-steps-bottom-pad: 0;
		--chart-overlay-step-min-h: 125vh;
		--chart-overlay-step-spacer-h: 0;

		width: 100%;
		max-width: min(100%, var(--scope-arcs-max-width));
		margin-inline: auto;
		box-sizing: border-box;
	}

	.scope-arcs :global(.chart-overlay-scrolly) {
		width: 100%;
		margin-bottom: var(--scope-arcs-intro-offset);
	}

	.scope-arcs-stage {
		--chart-overlay-stage-height: auto;
		--chart-overlay-stage-top: 5vh;
		width: 100%;
		justify-content: center;
	}


	.scope-arcs--overview :global(.chart-overlay-steps),
	.scope-arcs--overview :global(.chart-overlay-step),
	.scope-arcs--overview :global(.chart-overlay-step-card),
	.scope-arcs--overview :global(.chart-overlay-step-spacer) {
		pointer-events: none;
	}

	.scope-arcs--overview .scope-arcs-stage {
		z-index: 3;
	}

	.scope-arcs :global(.scope-arcs-overlay-spacer-bottom) {
		height: var(--scope-arcs-final-hold);
	}

	.scope-arcs-error {
		text-align: center;
		color: var(--color-secondary);
		font-family: var(--font-mono);
		font-size: 0.875rem;
		padding: 2rem;
	}

	.scope-arcs-chart-wrap {
		position: relative;
		width: 100%;
		max-width: var(--scope-arcs-max-width);
		margin-inline: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		transform: translateY(var(--scope-arcs-intro-offset));
		overflow: visible;
	}

	.scope-arcs-headers {
		display: contents;
	}

	.scope-arcs-header {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 2;
		font-family: var(--font-mono);
		font-weight: 600;
		font-size: 13px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-primary);
		white-space: nowrap;
		pointer-events: none;
	}

	.scope-arcs-header--left {
		right: 100%;
		margin-right: 0.75rem;
		text-align: right;
	}

	.scope-arcs-header--right {
		left: 100%;
		margin-left: 0.75rem;
		text-align: left;
	}

	

	.scope-arcs-chart-panel {
		width: 100%;
		display: flex;
		justify-content: center;
		overflow: visible;
	}

	.scope-arcs-chart {
		width: 100%;
		max-width: var(--scope-arcs-max-width);
		margin-inline: auto;
		overflow: visible;
	}

	.scope-arcs-chart :global(svg) {
		display: block;
		width: 100%;
		height: auto;
		margin-inline: auto;
		overflow: hidden;
	}

	.scope-arcs-chart :global(.sarc-ring),
	.scope-arcs-chart :global(.sarc-ring-label) {
		transition: opacity var(--scope-arcs-focus-fade-ms) cubic-bezier(0.33, 1, 0.68, 1);
	}

	.scope-arcs-chart :global(.sarc-words) {
		transition: opacity var(--scope-arcs-focus-fade-ms) cubic-bezier(0.33, 1, 0.68, 1);
	}

	.scope-arcs-legend-shell {
		position: sticky;
		bottom: 2rem;
		z-index: 1;
		width: fit-content;
		margin: 0 auto;
		max-height: 0;
		overflow: hidden;
		pointer-events: none;
		transition:
			max-height 320ms cubic-bezier(0.33, 1, 0.68, 1),
			margin-top 320ms cubic-bezier(0.33, 1, 0.68, 1);
	}

	.scope-arcs-legend-shell--visible {
		max-height: 6rem;
		margin-top: 2rem;
		pointer-events: auto;
	}

	.scope-arcs-legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.25rem;
		justify-content: center;
		width: fit-content;
		font-family: var(--font-mono);
		font-size: 13px;
		color: var(--color-secondary);
		text-transform: uppercase;
		letter-spacing: 2%;
		opacity: 0;
		transform: translateY(1.25rem);
		transition:
			opacity 280ms cubic-bezier(0.33, 1, 0.68, 1),
			transform 280ms cubic-bezier(0.33, 1, 0.68, 1);
	}

	.scope-arcs-legend-shell--visible .scope-arcs-legend {
		opacity: 1;
		transform: translateY(0);
	}


	.scope-arcs-legend-item {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.scope-arcs-swatch {
		display: inline-block;
		width: 16px;
		height: 8px;
		flex-shrink: 0;
		opacity: 0.55;
	}

	.scope-arcs-swatch--remained {
		background: var(--scope-arcs-color-remained);
	}

	.scope-arcs-swatch--removed {
		background: var(--scope-arcs-color-removed);
	}

	.scope-arcs-swatch--added {
		background: var(--scope-arcs-color-added);
	}

	.scope-arcs > .chart-note {
		margin-top: 1.5rem;
		text-align: left;
	}


	@media (prefers-reduced-motion: reduce) {
		.scope-arcs-legend-shell {
			transition: none;
		}

		.scope-arcs-legend {
			transition: opacity 140ms ease;
			transform: none;
		}

		.scope-arcs-legend-shell--visible .scope-arcs-legend {
			transform: none;
		}
	}

	@media (max-width: 1180px) {
		.scope-arcs-headers {
			display: flex;
			justify-content: center;
			gap: 2rem;
			align-items: baseline;
			width: 100%;
		}

		.scope-arcs-header {
			position: static;
			transform: none;
			margin: 0;
		}
	}
</style>
