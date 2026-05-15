<script>
	import { getContext } from "svelte";
	import { onDestroy, onMount } from "svelte";
	import { renderSemanticsRibbons } from "./semanticsRibbonsChart.js";

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
	let chartController = null;
	let resizeObserver;
	let stepObserver;
	let scrollyMount = $state(null);
	let activeStep = $state(-1);
	let rafId = 0;
	let lastRenderedWidth = 0;

	const payload = $derived(getData?.()?.semanticsRibbonsPayload ?? null);
	const payloadError = $derived(getData?.()?.semanticsRibbonsError ?? null);

	const overlaySteps = $derived.by(() =>
		(overlays ?? []).map((step, i) => ({
			...step,
			focusCategories: normalizeFocusCategories(step?.focusCategories).length
				? normalizeFocusCategories(step?.focusCategories)
				: DEFAULT_STEP_FOCUS[i] ?? []
		}))
	);

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
	}

	function scheduleRender() {
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			rafId = 0;
			renderChart();
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
		chartController?.destroy();
	});
</script>

<div class="semantics-viz">
	{#if payloadError}
		<p class="semantics-viz-error" role="alert">{payloadError}</p>
	{:else if payload}
		<div class="semantics-scrolly" bind:this={scrollyMount}>
			<div class="semantics-stage">
				<div class="semantics-viz-chart" bind:this={chartMount}></div>
			</div>
			{#if overlaySteps.length}
				<div class="semantics-steps">
					<div class="semantics-step-spacer" aria-hidden="true"></div>
					{#each overlaySteps as step, i}
						<article class="semantics-step" data-step={i}>
							<div class="semantics-step-card" class:semantics-step-card--active={i === activeStep}>
								{@html step.html ?? ""}
							</div>
						</article>
					{/each}
					<div class="semantics-step-spacer" aria-hidden="true"></div>
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

	.semantics-scrolly {
		position: relative;
	}

	.semantics-stage {
		position: sticky;
		top: 10vh;
		height: 80vh;
		display: flex;
		align-items: center;
		z-index: 1;
	}

	.semantics-steps {
		position: relative;
		z-index: 2;
		margin-top: -80vh;
		padding-top: 85vh;
		padding-bottom: 80vh;
		pointer-events: none;
	}

	.semantics-step {
		min-height: 75vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.semantics-step-card {
		max-width: min(400px, 88vw);
		pointer-events: auto;
		opacity: 0.45;
		transition: opacity 180ms ease;
		background-color: var(--color-bg);
		border: 1px solid var(--color-secondary);
		border-radius: var(--radius-md);
		padding: 1rem;
		font-size: 1.125rem;
		line-height: 1.5;
	}

	.semantics-step-card--active {
		opacity: 1;
	}

	.semantics-step-spacer {
		height: 70vh;
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
