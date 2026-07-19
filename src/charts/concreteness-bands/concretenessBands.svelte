<script>
	import { getContext, onDestroy, onMount } from "svelte";
	import {
		measureConcretenessBandsWidth,
		renderConcretenessBands
	} from "./concretenessBandsChart.js";
	import { CHART_ONSCREEN_MARGIN, observeChartVisibility } from "$utils/chartVisibility.js";
	import { subscribePrefersReducedMotion } from "$utils/prefersReducedMotion.js";

	let { note = "", overlays = [], headingId = undefined, subheadId = undefined } = $props();

	const getData = getContext("data");
	const DEFAULT_STEP_FOCUS = [
		[{ lo: 4.5, hi: 5.0 }],
		[{ lo: 2.0, hi: 2.5 }],
		[{ lo: 1.0, hi: 2.0 }]
	];

	let chartMount = $state(null);
	let chartWrap = $state(null);
	let scrollyMount = $state(null);
	let rootMount = $state(null);
	let chartController = null;
	let resizeObserver;
	let stepObserver;
	let initObserver;
	let marqueeObserver;
	let chartSectionEl = null;
	let chartSectionNear = false;
	let chartSectionVisible = false;
	let documentVisible = true;
	let rafId = 0;
	let chartReady = $state(false);
	let activeStep = $state(-1);
	let lastRenderedWidth = 0;
	let prefersReducedMotionSub;

	const payload = $derived(getData?.()?.concretenessBandsPayload ?? null);
	const payloadError = $derived(getData?.()?.concretenessBandsError ?? null);

	function normalizeFocusRanges(raw) {
		if (Array.isArray(raw)) {
			return raw
				.map((entry) => {
					if (Array.isArray(entry) && entry.length >= 2) {
						const lo = Number(entry[0]);
						const hi = Number(entry[1]);
						if (Number.isFinite(lo) && Number.isFinite(hi)) return { lo: Math.min(lo, hi), hi: Math.max(lo, hi) };
						return null;
					}
					if (entry && typeof entry === "object") {
						const lo = Number(entry.lo ?? entry.min ?? entry.from);
						const hi = Number(entry.hi ?? entry.max ?? entry.to);
						if (Number.isFinite(lo) && Number.isFinite(hi)) return { lo: Math.min(lo, hi), hi: Math.max(lo, hi) };
						return null;
					}
					return null;
				})
				.filter(Boolean);
		}
		if (typeof raw === "string") {
			return raw
				.split("|")
				.map((part) => part.trim())
				.filter(Boolean)
				.map((part) => {
					const [a, b] = part.split("-").map((v) => Number(v.trim()));
					if (Number.isFinite(a) && Number.isFinite(b)) return { lo: Math.min(a, b), hi: Math.max(a, b) };
					return null;
				})
				.filter(Boolean);
		}
		return [];
	}

	const overlaySteps = $derived.by(() =>
		(overlays ?? []).map((step, i) => ({
			...step,
			focusRanges: normalizeFocusRanges(step?.focusRanges).length
				? normalizeFocusRanges(step?.focusRanges)
				: DEFAULT_STEP_FOCUS[i] ?? []
		}))
	);

	const overlayModeActive = $derived(activeStep >= 0 && activeStep < overlaySteps.length);

	function syncPrefersReducedMotion() {
		chartController?.setPrefersReducedMotion?.(prefersReducedMotionSub?.get() ?? false);
	}

	function syncMarqueeActive() {
		chartController?.setMarqueeActive(chartSectionVisible && documentVisible);
	}

	function handleDocumentVisibility() {
		documentVisible = !document.hidden;
		syncMarqueeActive();
	}

	function applyStepFocus() {
		if (!chartController) return;
		if (activeStep < 0 || activeStep >= overlaySteps.length) {
			chartController.setInteractionLocked(false);
			chartController.clearFocus();
			return;
		}
		chartController.setInteractionLocked(true);
		chartController.setFocus(overlaySteps[activeStep].focusRanges ?? []);
	}

	function commitStep(next) {
		if (next === activeStep) return;
		activeStep = next;
		applyStepFocus();
	}
	function syncStageLayout() {
		if (!chartMount || !scrollyMount) return;
		const svgEl = chartMount.querySelector("svg");
		if (!svgEl) return;
		const chartH = Math.round(svgEl.getBoundingClientRect().height);
		if (chartH < 1) return;
		scrollyMount.style.setProperty("--chart-overlay-stage-height", `${chartH}px`);
	}

	function clearStageLayout() {
		scrollyMount?.style.removeProperty("--chart-overlay-stage-height");
	}

	function renderChart() {
		if (!chartMount || !payload || payloadError) {
			chartController?.destroy();
			chartController = null;
			clearStageLayout();
			return;
		}
		const width = measureConcretenessBandsWidth(chartMount);
		if (width < 1) return;
		if (chartController && Math.abs(width - lastRenderedWidth) < 2) return;

		chartController?.destroy();
		lastRenderedWidth = width;
		chartController = renderConcretenessBands(chartMount, payload, { width });
		syncPrefersReducedMotion();
		applyStepFocus();
		syncMarqueeActive();
		requestAnimationFrame(syncStageLayout);
	}

	function disconnectVisibilityObservers() {
		initObserver?.disconnect();
		marqueeObserver?.disconnect();
	}

	function setupVisibilityObserver() {
		disconnectVisibilityObservers();
		const target = chartSectionEl ?? rootMount?.closest?.(".story-section--chart") ?? chartWrap ?? chartMount;
		if (!target) return;
		initObserver = observeChartVisibility(target, (near) => {
			chartSectionNear = near;
			if (near) scheduleRender();
		});
		marqueeObserver = observeChartVisibility(
			target,
			(visible) => {
				chartSectionVisible = visible;
				syncMarqueeActive();
			},
			{ rootMargin: CHART_ONSCREEN_MARGIN }
		);
	}

	function scheduleRender() {
		if (!chartSectionNear) return;
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			rafId = 0;
			renderChart();
			requestAnimationFrame(syncStageLayout);
		});
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
				const midY = window.innerHeight * 0.5;
				const next = firstTop > midY || lastBottom < midY ? -1 : activeStep;
				commitStep(next);
			},
			{ root: null, rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.5, 0.8, 1] }
		);

		for (const node of nodes) stepObserver.observe(node);
	}

	onMount(() => {
		prefersReducedMotionSub = subscribePrefersReducedMotion(() => {
			syncPrefersReducedMotion();
		});
		documentVisible = !document.hidden;
		document.addEventListener("visibilitychange", handleDocumentVisibility);
		chartReady = true;
		chartSectionEl = rootMount?.closest?.(".story-section--chart") ?? null;
		setupStepObserver();
		setupVisibilityObserver();
		const resizeTarget = chartWrap ?? chartMount;
		if (!resizeTarget) return;
		resizeObserver = new ResizeObserver(() => scheduleRender());
		resizeObserver.observe(resizeTarget);
	});

	onDestroy(() => {
		prefersReducedMotionSub?.destroy();
		if (typeof document !== "undefined") {
			document.removeEventListener("visibilitychange", handleDocumentVisibility);
		}
		chartSectionEl?.classList.remove("is-concr-bands-overlay-active");
		if (rafId) cancelAnimationFrame(rafId);
		resizeObserver?.disconnect();
		stepObserver?.disconnect();
		disconnectVisibilityObservers();
		chartController?.destroy();
		chartController = null;
		clearStageLayout();
	});

	$effect(() => {
		if (!chartReady || !chartSectionNear) return;
		payload;
		payloadError;
		lastRenderedWidth = 0;
		scheduleRender();
	});

	$effect(() => {
		if (!chartSectionEl) return;
		chartSectionEl.classList.toggle("is-concr-bands-overlay-active", overlayModeActive);
	});
</script>

<div
	class="concr-bands"
	class:is-overlay-active={overlayModeActive}
	bind:this={rootMount}
>
	{#if payloadError}
		<p class="concr-bands-error" role="alert">{payloadError}</p>
	{:else if !payload}
		<p class="concr-bands-error" role="alert">No concreteness bands data loaded.</p>
	{:else}
		<div class="chart-overlay-scrolly" bind:this={scrollyMount}>
			<div class="chart-overlay-stage concr-bands-stage">
				<div class="concr-bands-chart-wrap" bind:this={chartWrap}>
					<div
						class="concr-bands-chart"
						role={headingId ? "img" : undefined}
						aria-labelledby={headingId}
						bind:this={chartMount}
					></div>
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
					<div class="chart-overlay-step-spacer" aria-hidden="true"></div>
				</div>
			{/if}
		</div>
		{#if note}
			<p class="chart-note">{@html note}</p>
		{/if}
	{/if}
</div>

<style>
	
	.concr-bands {
		--concr-bands-removed-bg: #FFAA4A;
		--concr-bands-added-bg: #F493FF;
		--concr-bands-removed-bg-row: #FFD59E;
		--concr-bands-added-bg-row: #FACCF9;
		--concr-bands-removed-text: #714008;
		--concr-bands-added-text: #76207F;
		--concr-bands-primary: #7B746E;
		--concr-bands-grid: #CCC5BB;
		--concr-bands-grid-text: #7B746E;
		--concr-bands-muted: #b9afa6;
		--concr-bands-axis-label-bg: var(--color-bg, #FFFFF1);
		--concr-bands-background: transparent;

		--concr-bands-compact-breakpoint: 935;
		--concr-bands-phone-breakpoint: 520;
		--concr-bands-margin-top: 100px;
		--concr-bands-axis-tick-offset: 80px;
		--concr-bands-margin-right: 24px;
		--concr-bands-margin-bottom: 32px;
		--concr-bands-margin-left: 24px;
		--concr-bands-band-h: 42px;
		--concr-bands-band-gap: 14px;
		--concr-bands-center-gap: 32px;
		--concr-bands-marquee-font-size: 36px;
		--concr-bands-marquee-speed: 28;
		--concr-bands-min-bar-width: 4px;
		--concr-bands-text-pad: 4px;
		--concr-bands-axis-line-pad: 8px;
		--concr-bands-dir-label-offset-x: 16px;
		--concr-bands-dir-arrow-gap: 0px;
		--concr-bands-dir-arrow-offset-y: 0px;
		--concr-bands-dir-label-gap: 22px;
		--concr-bands-dir-label-nudge: 0px;
		--concr-bands-dir-label-line-height: 1.15;
		--concr-bands-axis-tick-label-offset: 24px;
		--concr-bands-endpoint-offset-top: 18px;
		--concr-bands-endpoint-offset-bottom: 30px;
		--concr-bands-axis-label-w: 28px;
		--concr-bands-axis-label-h: 18px;
		--concr-bands-dir-label-size: 16px;
		--concr-bands-axis-whole-size: 14px;
		--concr-bands-axis-half-size: 14px;
		--concr-bands-endpoint-size: 14px;
		--concr-bands-annot-leader: 16px;
		--concr-bands-annot-stack: 48px;
		--concr-bands-annot-text-gap: 12px;
		--concr-bands-annot-text-gap-below: var(--concr-bands-annot-text-gap);
		--concr-bands-annot-text-inset: 6px;
		--concr-bands-annot-dot-r: 2.5px;
		--concr-bands-annot-font-size: 16px;

		

		--chart-overlay-steps-top-pad: 60vh;
		--chart-overlay-steps-bottom-pad: 50vh;
		--chart-overlay-step-spacer-h: 50vh;
		--chart-overlay-step-min-h: 160vh;
		--chart-overlay-step-gap: 20vh;

		/* width: calc(100vw - var(--explorer-rail-width));
		max-width: calc(100vw - var(--explorer-rail-width)); */
		width: 100%;
		max-width: 100vw;
		margin-inline: calc(50% - 50vw) calc(50% - 50vw + var(--explorer-rail-width));
		margin-top: 1.5rem;
		box-sizing: border-box;
	}

	/* @supports (width: 100dvw) {
		.concr-bands {
			width: calc(100dvw - var(--explorer-rail-width));
			max-width: calc(100dvw - var(--explorer-rail-width));
			margin-inline: calc(50% - 50dvw) calc(50% - 50dvw + var(--explorer-rail-width));
			margin-top: 1.5rem;
		}
	} */

	.concr-bands-chart-wrap {
		overflow: visible;
		width: 100%;
		transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease;
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

	.concr-bands-chart :global(svg text),
	.concr-bands-chart :global(svg tspan) {
		font-synthesis: none;
	}

    .concr-bands-chart :global(.endpoint-text) {
        font-family: var(--font-mono);
        text-transform: uppercase;
        color: var(--concr-bands-primary);
        font-weight: 500;
        letter-spacing: 0.02em;
    }

    .concr-bands-chart :global(.label) {
        font-family: var(--font-mono);
        text-transform: uppercase;
        font-weight: 500;
    }

	.concr-bands-chart :global(.all-bands .band-group) {
		transition: opacity 220ms cubic-bezier(0.33, 1, 0.68, 1);
	}

	.concr-bands-chart :global(.all-bands .band-row-highlight) {
		transition: opacity 200ms cubic-bezier(0.33, 1, 0.68, 1);
		pointer-events: none;
	}

	.concr-bands .chart-note {
		transition: opacity 220ms ease;
	}

	.concr-bands.is-overlay-active .chart-note {
		opacity: 0.4;
	}

	.concr-bands-stage {
		--chart-overlay-stage-height: auto;
		--chart-overlay-stage-top: 22vh;
	}

	@media (max-width: 1200px) {
		.concr-bands{
			--concr-bands-annot-stack: 72px;
			--concr-bands-annot-text-gap: 8px;
			--concr-bands-annot-text-gap-below: 8px;
		}
	}

	@media (max-width: 935px) {
		.concr-bands {
			--concr-bands-margin-top: 120px;
			--concr-bands-margin-left: 16px;
			--concr-bands-margin-right: 16px;
			--concr-bands-center-gap: 24px;
			--concr-bands-dir-label-size: 14px;
			--concr-bands-dir-label-gap: 36px;
			--concr-bands-dir-label-nudge: 8px;
			--concr-bands-dir-arrow-offset-y: 12px;
			--concr-bands-axis-whole-size: 13px;
			--concr-bands-axis-half-size: 13px;
			--concr-bands-endpoint-size: 13px;
			--concr-bands-annot-font-size: 14px;
			--concr-bands-annot-stack: 56px;
			--concr-bands-annot-leader: 12px;
			/* Steps 2–3 annotate below bands; hanging baseline reads tighter than step 1 above. */
			--concr-bands-annot-text-gap-below: 8px;
			--chart-overlay-steps-top-pad: 45vh;
			--chart-overlay-steps-bottom-pad: 40vh;
			--chart-overlay-step-spacer-h: 40vh;
			--chart-overlay-step-min-h: 140vh;

		}


		.concr-bands-stage {
			--chart-overlay-stage-top: 10vh;
		}

		:global(.story-section#concretenessBands .concr-bands) {
			margin: 0;
		}
	}


	@media (max-width: 520px) {
		.concr-bands {
			--concr-bands-band-h: 28px;
			--concr-bands-band-gap: 28px;
			--concr-bands-marquee-font-size: 18px;
			--concr-bands-margin-top: 96px;
			/* --concr-bands-axis-tick-offset: 48px; */
			--concr-bands-margin-bottom: 48px;
			--concr-bands-margin-left: 12px;
			--concr-bands-margin-right: 12px;
			--concr-bands-center-gap: 16px;
			--concr-bands-endpoint-offset-top: 12px;
			--concr-bands-dir-label-size: 13px;
			--concr-bands-dir-label-gap: 34px;
			--concr-bands-axis-whole-size: 12px;
			--concr-bands-axis-half-size: 10px;
			--concr-bands-endpoint-size: 13px;
			--concr-bands-annot-font-size: 13px;
			--concr-bands-annot-stack: 64px;
			--concr-bands-annot-leader: 24px;
			--concr-bands-annot-text-gap: 8px;
			--concr-bands-annot-text-gap-below: 8px;
			--concr-bands-annot-text-inset: 2px;
			--chart-overlay-step-min-h: 140vh;
		}


		.concr-bands-stage {
			--chart-overlay-stage-height: auto;
			--chart-overlay-stage-top: 10vh;
		}
	}


</style>
