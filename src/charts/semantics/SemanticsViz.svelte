<script>
	import { getContext } from "svelte";
	import { onDestroy, onMount } from "svelte";
	import { renderSemanticsRibbons } from "./semanticsRibbonsChart.js";
	import { observeChartVisibility } from "$utils/chartVisibility.js";

	let { overlays = [], note = "" } = $props();

	const getData = getContext("data");
	const DEFAULT_STEP_FOCUS = [
		["General and Abstract Terms"],
		["Substances, Materials, Objects and Equipment", "Emotion", "The Body and the Individual", "Food and Farming"],
		["Psychological Actions, States and Processes", "Emotion"]
	];

	function normalizeFocusCategories(raw) {
		if (Array.isArray(raw)) {
			return raw
				.map((v) => (typeof v === "string" ? v : v?.value))
				.filter((v) => typeof v === "string" && v.trim().length)
				.map((v) => v.trim());
		}
		if (typeof raw === "string") {
			return raw
				.split("|")
				.map((v) => v.trim())
				.filter(Boolean);
		}
		return [];
	}

	let chartMount = $state(null);
	let stageMount = $state(null);
	let chartController = null;
	let resizeObserver;
	let stepObserver;
	let visibilityObserver;
	let scrollyMount = $state(null);
	let activeStep = $state(-1);
	let chartSectionVisible = false;
	let rafId = 0;
	let lastRenderedWidth = 0;

	const payload = $derived(getData?.()?.semanticsRibbonsPayload ?? null);
	const payloadError = $derived(getData?.()?.semanticsRibbonsError ?? null);

	const overlaySteps = $derived.by(() =>
		(overlays ?? []).map((step, i) => {
			const focusCategories = normalizeFocusCategories(step?.focusCategories);
			return {
				...step,
				focusCategories: focusCategories.length ? focusCategories : DEFAULT_STEP_FOCUS[i] ?? []
			};
		})
	);

	function syncMarqueeActive() {
		chartController?.setMarqueeActive(chartSectionVisible);
	}

	function applyStepFocus() {
		if (!chartController) return;
		if (activeStep < 0 || activeStep >= overlaySteps.length) {
			chartController.setInteractionLocked(false);
			chartController.clearFocus();
			return;
		}
		chartController.setInteractionLocked(true);
		chartController.setFocus(overlaySteps[activeStep].focusCategories ?? []);
	}


	function updateStageTop() {
		if (!stageMount || !chartMount || !scrollyMount) return;
		const svgEl = chartMount.querySelector("svg");
		if (!svgEl) return;
		const chartH = Math.round(svgEl.getBoundingClientRect().height);
		const vh = window.innerHeight;
		const minTopRaw = getComputedStyle(scrollyMount).getPropertyValue("--sem-stage-top").trim();
		const minTop = minTopRaw.endsWith("px")
			? parseFloat(minTopRaw)
			: minTopRaw.endsWith("vh")
				? (parseFloat(minTopRaw) / 100) * vh
				: 20;
		const centered = Math.floor((vh - chartH) / 2);

		const top = Math.max(minTop, centered);
		scrollyMount.style.setProperty("--chart-overlay-stage-top", `${top}px`);
		scrollyMount.style.setProperty("--chart-overlay-stage-height", `${chartH}px`);
	}

	function renderChart() {
		if (!chartMount || !payload || payloadError) {
			chartController?.destroy();
			chartController = null;
			return;
		}
		const width = chartMount.clientWidth;
		if (chartController && width > 0 && Math.abs(width - lastRenderedWidth) < 2) return;

		chartController?.destroy();
		chartController = null;
		lastRenderedWidth = width;
		chartController = renderSemanticsRibbons(chartMount, payload);
		applyStepFocus();
		syncMarqueeActive();
		// Run after the browser has painted the SVG so getBoundingClientRect is accurate.
		requestAnimationFrame(updateStageTop);
	}

	function setupVisibilityObserver() {
		visibilityObserver?.disconnect();
		const target = chartMount?.closest?.(".story-section--chart") ?? chartMount;
		if (!target) return;
		visibilityObserver = observeChartVisibility(target, (visible) => {
			chartSectionVisible = visible;
			syncMarqueeActive();
		});
	}

	function scheduleRender() {
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			rafId = 0;
			renderChart();
			// If the chart didn't re-render (same width), still re-check the top offset
			// because the viewport height may have changed (e.g. mobile toolbar show/hide).
			requestAnimationFrame(updateStageTop);
		});
	}

	function setupStepObserver() {
		stepObserver?.disconnect();
		if (!scrollyMount || !overlaySteps.length) return;
		const nodes = [...scrollyMount.querySelectorAll(".semantics-step")];
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
				const next = firstTop > midY || lastBottom < midY ? -1 : activeStep;
				if (next !== activeStep) {
					activeStep = next;
					applyStepFocus();
				}
			},
			{ root: null, rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.5, 0.8, 1] }
		);

		for (const node of nodes) stepObserver.observe(node);
	}

	onMount(() => {
		renderChart();
		setupStepObserver();
		setupVisibilityObserver();
		if (!chartMount) return;
		resizeObserver = new ResizeObserver(() => {
			scheduleRender();
		});
		resizeObserver.observe(chartMount);
	});

	onDestroy(() => {
		if (rafId) cancelAnimationFrame(rafId);
		resizeObserver?.disconnect();
		stepObserver?.disconnect();
		visibilityObserver?.disconnect();
		chartController?.destroy();
	});
</script>

<div class="semantics-viz">
	{#if payloadError}
		<p class="semantics-viz-error" role="alert">{payloadError}</p>
	{:else if payload}
		<div class="semantics-scrolly chart-overlay-scrolly" bind:this={scrollyMount}>
			<div class="semantics-stage chart-overlay-stage" bind:this={stageMount}>
				<div class="semantics-viz-chart" bind:this={chartMount}></div>
			</div>
			{#if overlaySteps.length}
				<div class="semantics-steps chart-overlay-steps">
					<div class="chart-overlay-step-spacer" aria-hidden="true"></div>
					{#each overlaySteps as step, i}
						<article class="semantics-step chart-overlay-step" data-step={i}>
							<div class="semantics-step-card chart-overlay-step-card" class:chart-overlay-step-card--active={i === activeStep}>
								{@html step.html ?? ""}
							</div>
						</article>
					{/each}
					<div class="chart-overlay-step-spacer" aria-hidden="true"></div>
				</div>
			{/if}
		</div>
		{#if note}
			<p class="chart-note">{@html note}</p>
		{/if}
	{:else}
		<p class="semantics-viz-error" role="alert">No semantics ribbon payload. Check semantics.csv and column names (word, set, usas_top_level_name).</p>
	{/if}
</div>

<style>
	.semantics-viz {
		--sem-slope-width: var(--max-prose-width, 650px);
		--sem-font-scale: 1;
		--sem-min-band-font-size: 15px;
		--sem-left-label-offset: 18;
		--sem-left-label-hover-shift: 0;
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
		--sem-ribbon-tan: #b2a47f;
		--sem-ribbon-up-text: #db6ae8;
		--sem-ribbon-down-text: #ed9027;
		--sem-ribbon-tan-text: #988f77;
		--sem-ribbon-label: #8f8a77;
		--sem-ribbon-header: #706b66;
		--sem-pct-cap-width: 44;
		--sem-pct-cap-label-bottom: 2;
		--sem-ribbon-cap-trim: -1;
		--sem-pct-cap-up-text: #962FA2;
		--sem-pct-cap-down-text: #9B5B12;
		--sem-pct-cap-tan-text: #635D43;
		--sem-chart-bg: var(--color-bg, #fffff1);
		--chart-overlay-stage-top: 10vh;
		--chart-overlay-stage-height: 80vh;
		--sem-stage-top: 32px;
		--chart-overlay-steps-top-pad: 85vh;
		--chart-overlay-steps-bottom-pad: 80vh;
		--chart-overlay-step-min-h: 75vh;
		--chart-overlay-step-spacer-h: 70vh;
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

	.semantics-viz-chart :global(.list-head){
		text-transform: uppercase;
		font-weight: 600;
		font-family: var(--font-mono);
		letter-spacing: 2%;
	}

	.semantics-viz-chart :global(.pct-cap-label) {
		font-family: var(--font-mono);
		font-size: 13px;
		letter-spacing: -0.02em;
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
			--sem-pct-cap-width: 36;
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
