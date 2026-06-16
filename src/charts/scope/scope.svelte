<script>
	import { getContext, onDestroy, onMount } from "svelte";
	import { renderScopeChart } from "./scopeChart.js";
	import { observeChartVisibility } from "$utils/chartVisibility.js";

	let { note = "", overlays = [] } = $props();

	const getData = getContext("data");


	const DEFAULT_STEP_FOCUS = [[1], [2], [3], [4], [5]];

	let chartMount = $state(null);
	let scrollyMount = $state(null);
	let chartController = null;
	let stepObserver;
	let legendObserver;
	let scrollyObserver;
	let visibilityObserver;
	let unsubscribeHover = null;
	let rafId = 0;
	let chartReady = $state(false);
	let chartSectionVisible = $state(false);
	let scrollyIntersecting = $state(false);
	let legendInRange = $state(false);
	let activeStep = $state(-1);
	let lastRenderedWidth = 0;

	let hoverInfo = $state(null);
	let mouseX = $state(0);
	let mouseY = $state(0);

	const payload = $derived(getData?.()?.scopePayload ?? null);
	const payloadError = $derived(getData?.()?.scopeError ?? null);

	function normalizeFocusRings(raw) {
		if (Array.isArray(raw)) {
			return raw
				.map((v) => Number(typeof v === "string" ? v : v?.value ?? v))
				.filter((n) => Number.isInteger(n) && n >= 1 && n <= 5);
		}
		if (typeof raw === "string") {
			return raw
				.split("|")
				.map((s) => Number(s.trim()))
				.filter((n) => Number.isInteger(n) && n >= 1 && n <= 5);
		}
		return [];
	}

	const overlaySteps = $derived.by(() =>
		(overlays ?? []).map((step, i) => ({
			...step,
			focusRings: normalizeFocusRings(step?.focusRings).length
				? normalizeFocusRings(step?.focusRings)
				: DEFAULT_STEP_FOCUS[i] ?? []
		}))
	);

	let dividerExpanded = false;

	function applyStepFocus() {
		if (!chartController) return;
		const N = overlaySteps.length;

		const reveal = activeStep < 0 ? 1 : activeStep >= N ? nRings : Math.min(activeStep + 1, nRings);
		chartController.setVisibleRings(reveal);

	const shouldExpandDivider = activeStep >= 0;
	if (shouldExpandDivider !== dividerExpanded) {
		dividerExpanded = shouldExpandDivider;
		if (shouldExpandDivider) chartController.expandDivider();
		else chartController.collapseDivider();
		}

		if (activeStep < 0 || activeStep >= N) {
			chartController.setInteractionLocked(false);
			chartController.clearFocus();
			return;
		}
		chartController.setInteractionLocked(true);
		chartController.setFocus(overlaySteps[activeStep].focusRings ?? []);
	}

	const nRings = $derived(payload?.rings?.length ?? 5);

	const legendVisible = $derived(
		scrollyIntersecting &&
			activeStep <= overlaySteps.length &&
			(activeStep >= 0 || legendInRange)
	);

	function renderChart() {
		if (!chartMount || !payload || payloadError) {
			chartController?.destroy();
			chartController = null;
			return;
		}
		const width = typeof window !== "undefined" ? window.innerWidth : 0;
		if (chartController && width > 0 && Math.abs(width - lastRenderedWidth) < 2) return;

		unsubscribeHover?.();
		chartController?.destroy();
		dividerExpanded = false;
		lastRenderedWidth = width;
		chartController = renderScopeChart(chartMount, payload);
		unsubscribeHover = chartController?.onHover((dot) => {
			hoverInfo = dot;
		});
		applyStepFocus();
		requestAnimationFrame(() => syncScrollMetrics());
	}

	function syncScrollMetrics() {
		if (!chartMount || !scrollyMount) return;
		const panel = chartMount.closest(".scope-chart-panel");
		if (!panel) return;

		scrollyMount.style.setProperty("--scope-chart-flow-height", `${panel.offsetHeight}px`);
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

	function handlePointerMove(event) {
		if (!hoverInfo) return;
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	function handleChartPointerLeave() {
		hoverInfo = null;
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
			{ root: null, rootMargin: "100% 0px 50% 0px", threshold: 0 }
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
					if (Number.isInteger(idx) && idx !== activeStep) {
						activeStep = idx;
						applyStepFocus();
					}
					return;
				}
				const firstTop = nodes[0].getBoundingClientRect().top;
				const lastBottom = nodes.at(-1)?.getBoundingClientRect().bottom ?? 0;
				const midY = window.innerHeight * 0.5;
				let next = activeStep;
				if (firstTop > midY) next = -1;
				else if (lastBottom < midY) next = nodes.length;
				if (next !== activeStep) {
					activeStep = next;
					applyStepFocus();
				}
			},
			{ root: null, rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.2, 0.5, 0.8, 1] }
		);

		for (const node of nodes) stepObserver.observe(node);
	}

	function handleWindowResize() {
		scheduleRender();
		syncScrollMetrics();
	}

	$effect(() => {
		if (!scrollyMount) return;
		setupScrollyObserver();
	});

	$effect(() => {
		overlaySteps.length;
		if (!scrollyMount) return;
		setupLegendObserver();
	});

	onMount(() => {
		chartReady = true;
		setupStepObserver();
		setupLegendObserver();
		setupVisibilityObserver();
		window.addEventListener("resize", handleWindowResize);
	});

	onDestroy(() => {
		if (rafId) cancelAnimationFrame(rafId);
		if (typeof window !== "undefined") {
			window.removeEventListener("resize", handleWindowResize);
		}
		stepObserver?.disconnect();
		legendObserver?.disconnect();
		scrollyObserver?.disconnect();
		visibilityObserver?.disconnect();
		unsubscribeHover?.();
		chartController?.destroy();
		chartController = null;
	});

	$effect(() => {
		if (!chartReady || !chartSectionVisible) return;
		payload;
		payloadError;
		lastRenderedWidth = 0;
		scheduleRender();
	});
</script>

<div class="scope">
	{#if payloadError}
		<p class="scope-error" role="alert">{payloadError}</p>
	{:else if !payload}
		<p class="scope-error" role="alert">No scope data loaded.</p>
	{:else}
		<div class="chart-overlay-scrolly" bind:this={scrollyMount}>
			<div class="chart-overlay-stage scope-stage">
				<div
					class="scope-chart-wrap"
					role="group"
					aria-label="Word scope chart"
					onmousemove={handlePointerMove}
					onmouseleave={handleChartPointerLeave}
				>
					<div class="scope-chart-panel">
						<div class="scope-chart" bind:this={chartMount}></div>
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
					<div class="chart-overlay-step-spacer scope-overlay-spacer-bottom" aria-hidden="true"></div>
				</div>
			{/if}
		</div>

		<div
			class="scope-legend-shell"
			class:scope-legend-shell--visible={legendVisible}
			aria-hidden={!legendVisible}
		>
			<div class="scope-legend">
				<span class="scope-legend-item">
					<span class="scope-legend-dot scope-legend-dot--remained"></span>
					in both lists
				</span>
				<span class="scope-legend-item">
					<span class="scope-legend-dot scope-legend-dot--removed"></span>
					discarded words
				</span>
				<span class="scope-legend-item">
					<span class="scope-legend-dot scope-legend-dot--added"></span>
					added words
				</span>
			</div>
		</div>

		{#if hoverInfo}
			<div
				class="scope-tooltip is-visible scope-tooltip--{hoverInfo.s}"
				style:left="{mouseX}px"
				style:top="{mouseY}px"
			>
				<div class="scope-tooltip-word">{hoverInfo.w}</div>
				<div class="scope-tooltip-meta">
					{hoverInfo.c}
					{#if hoverInfo.s === "remained"}<br><span class="scope-tooltip-meta-label">In both lists</span>
					{:else if hoverInfo.s === "removed"}<br><span class="scope-tooltip-meta-label">Removed</span>
					{:else if hoverInfo.s === "added"}<br><span class="scope-tooltip-meta-label">Added</span>
					{/if}
				</div>
			</div>
		{/if}

		{#if note}
			<div class="chart-note">{@html note}</div>
		{/if}
	{/if}
</div>

<style>

	.scope {
		--scope-viewbox: 1000;
		--scope-center-r: 45;
		--scope-max-r: 400;
		--scope-ring-gap: 40;
		--scope-min-ring-depth: 10;
		--scope-split-gap: 8;
		--scope-label-gap-bias: 0.05;
		--scope-label-outer-pad: 8;

		--scope-rect-w: 10;
		--scope-rect-h: 3;
		--scope-dot-edge-gap: 2;
		--scope-dot-align: inner; /* "inner" or "center" */
		--scope-hit-radius: 5;
		--scope-hover-scale: 1.6;

		--scope-ring-label-size: 20;
		--scope-pct-label-size: 13;

		--scope-focus-fade-ms: 220;
		--scope-divider-expand-ms: 700;
		--scope-list-header-gap: 32;
		--scope-list-header-transition-ms: 700;
		--scope-header-font-size: 16;

		--scope-intro-offset: -30vh;
		--scope-final-hold: 100vh;

		--chart-overlay-steps-top-pad: 120vh;
		--chart-overlay-steps-bottom-pad: 0;
		--chart-overlay-step-min-h: 125vh;
		--chart-overlay-step-spacer-h: 0;

		--scope-color-remained: var(--color-secondary);
		--scope-color-removed: var(--color-gsl);
		--scope-color-added: var(--color-ngsl);
		--scope-ring-stroke: #d0cbc4;
		--scope-divider: var(--color-primary);
		--scope-label: var(--color-primary);

		width: 100%;
		max-width: min(100%, var(--max-chart-width));
		margin-inline: auto;
		box-sizing: border-box;
	}

	.scope-stage {
		--chart-overlay-stage-height: calc(var(--scope-chart-flow-height, 90vh) + var(--scope-intro-offset));
		--chart-overlay-stage-top: 35vh;
		overflow: visible;
	}

	.scope :global(.scope-overlay-spacer-bottom) {
		height: var(--scope-final-hold);
	}

	.scope > .chart-note {
		text-align: left;
		margin-top: 3rem;
	}

	.scope-chart-wrap {
		width: fit-content;
		margin-inline: auto;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		overflow: visible;
		transform: translateY(var(--scope-intro-offset));
	}

	.scope-chart-panel {
		display: flex;
		justify-content: center;
		overflow: visible;
	}

	.scope-chart {
		display: block;
	}

	.scope-chart :global(.scope-header-label) {
		font-family: var(--font-mono);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		fill: var(--color-primary);
	}

	.scope-chart :global(svg) {
		display: block;
	}

    .scope-chart :global(.scope-ring-name) {
        font-size: var(--scope-ring-label-size);
        font-weight: 400;
        letter-spacing: 4%;
        line-height: 1;
    }

	.scope-chart :global(.scope-ring-label) {
		font-family: var(--font-sans);
	}

    .scope-chart :global(.scope-pct){
        display: none;
    }

	.scope-chart :global(.scope-pct--gsl) {
		fill: var(--scope-color-removed);
		opacity: 0.95;
	}

	.scope-chart :global(.scope-pct--ngsl) {
		fill: var(--scope-color-added);
		opacity: 0.95;
	}

	.scope-chart :global(.scope-dot) {
		transition: opacity 220ms cubic-bezier(0.33, 1, 0.68, 1);
	}

	.scope-chart :global(.scope-ring-label) {
		transition: opacity 220ms cubic-bezier(0.33, 1, 0.68, 1);
	}

	.scope-legend-shell {
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

	.scope-legend-shell--visible {
		max-height: 6rem;
		margin-top: 2rem;
		pointer-events: auto;
	}

	.scope-legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.25rem;
		justify-content: center;
		width: fit-content;
		padding: 0.5rem 1rem;
		box-sizing: border-box;
		font-family: var(--font-mono);
		font-size: 13px;
		color: var(--color-secondary);
		text-transform: uppercase;
		letter-spacing: 2%;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		opacity: 0;
		transform: translateY(1.25rem);
		transition:
			opacity 280ms cubic-bezier(0.33, 1, 0.68, 1),
			transform 280ms cubic-bezier(0.33, 1, 0.68, 1);
	}

	.scope-legend-shell--visible .scope-legend {
		opacity: 1;
		transform: translateY(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.scope-legend-shell {
			transition: none;
		}

		.scope-legend {
			transition: opacity 140ms ease;
			transform: none;
		}

		.scope-legend-shell--visible .scope-legend {
			transform: none;
		}
	}

	.scope-legend-item {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.scope-legend-dot {
		width: 4px;
		height: 12px;
		flex-shrink: 0;
	}

	.scope-legend-dot--remained {
		background: var(--scope-color-remained);
	}

	.scope-legend-dot--removed {
		background: var(--scope-color-removed);
	}

	.scope-legend-dot--added {
		background: var(--scope-color-added);
	}

	.scope-tooltip {
		position: fixed;
		z-index: var(--z-overlay);
		pointer-events: none;
		background: var(--color-bg);
		color: var(--color-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: 0.75rem 0.75rem;
		max-width: 240px;
		font-family: var(--font-mono);
		font-size: 15px;
		line-height: 1.35;
		opacity: 0;
		transform: translate(14px, -50%);
		transition: opacity 140ms ease;
		box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
	}

	.scope-tooltip.is-visible {
		opacity: 1;
	}

	.scope-tooltip-word {
		font-size: 1.25rem;
		margin-bottom: 0.5rem;
		color: var(--color-highlight-text);
		font-style: italic;
		display: inline-block;
		padding: 0 0.35rem;
		box-decoration-break: clone;
		background-repeat: no-repeat;
		background-size: 100% 1.15em;
		background-position: 0 67%; 
	}

	.scope-tooltip-meta {
		font-size: 13px;
		color: var(--color-secondary);
	}

	.scope-tooltip-meta-label {
		display: inline-block;
		text-transform: uppercase;
		letter-spacing: 2%;
		margin-top: 0.5rem;
	}

	.scope-tooltip--removed .scope-tooltip-word {
		background-image: linear-gradient(var(--color-gsl-highlight), var(--color-gsl-highlight));
		font-family: var(--font-serif);
	}

	.scope-tooltip--added .scope-tooltip-word {
		background-image: linear-gradient(var(--color-ngsl-highlight), var(--color-ngsl-highlight));
		font-family: var(--font-sans);
	}

	.scope-tooltip--remained .scope-tooltip-word {
		background-image: linear-gradient(var(--color-remained-highlight), var(--color-remained-highlight));
		font-family: var(--font-sans);
	}

	@media (max-width: 1080px) {
		.scope {
			--scope-max-r: 320;
			--scope-ring-gap: 26;
			--scope-rect-w: 7;
			--scope-rect-h: 2;
		}
	}

	@media (max-width: 700px) {
		.scope {
			--scope-max-r: 280;
			--scope-ring-gap: 20;
			--scope-rect-w: 6;
			--scope-rect-h: 2;
			--scope-ring-label-size: 11;
			--scope-pct-label-size: 9;
			--scope-split-gap: 6;
			--scope-header-font-size: 11;
		}
	}
</style>
