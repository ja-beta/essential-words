<script>
	import { getContext, onDestroy, onMount } from "svelte";
	import { renderConcretenessBands } from "./concretenessBandsChart.js";

	let { note = "", overlays = [] } = $props();

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
	let chartSectionEl = null;
	let rafId = 0;
	let activeStep = $state(-1);
	let lastRenderedWidth = 0;

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
		chartSectionEl = rootMount?.closest?.(".story-section--chart") ?? null;
		scheduleRender();
		setupStepObserver();
		const resizeTarget = chartWrap ?? chartMount;
		if (!resizeTarget) return;
		resizeObserver = new ResizeObserver(() => scheduleRender());
		resizeObserver.observe(resizeTarget);
	});

	onDestroy(() => {
		chartSectionEl?.classList.remove("is-concr-bands-overlay-active");
		if (rafId) cancelAnimationFrame(rafId);
		resizeObserver?.disconnect();
		stepObserver?.disconnect();
		chartController?.destroy();
		chartController = null;
	});

	$effect(() => {
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

<div class="concr-bands" class:is-overlay-active={overlayModeActive} bind:this={rootMount}>
	{#if payloadError}
		<p class="concr-bands-error" role="alert">{payloadError}</p>
	{:else if !payload}
		<p class="concr-bands-error" role="alert">No concreteness bands data loaded.</p>
	{:else}
		<div class="chart-overlay-scrolly" bind:this={scrollyMount}>
			<div class="chart-overlay-stage concr-bands-stage">
				<div class="concr-bands-chart-wrap" bind:this={chartWrap}>
					<div class="concr-bands-chart" bind:this={chartMount}></div>
				</div>
			</div>
			{#if overlaySteps.length}
				<div class="chart-overlay-steps">
					<div class="chart-overlay-step-spacer" aria-hidden="true"></div>
					{#each overlaySteps as step, i}
						<article class="chart-overlay-step" data-step={i}>
							<div class="chart-overlay-step-card" class:chart-overlay-step-card--active={i === activeStep}>
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
		--concr-bands-margin-top: 56px;
		--concr-bands-margin-right: 24px;
		--concr-bands-margin-bottom: 32px;
		--concr-bands-margin-left: 24px;
		--concr-bands-band-h: 42px;
		--concr-bands-band-gap: 14px;
		--concr-bands-center-gap: 32px;
		--concr-bands-marquee-font-size: 36px;
		--concr-bands-marquee-speed: 24;
		--concr-bands-min-bar-width: 4px;
		--concr-bands-text-pad: 4px;
		--concr-bands-axis-line-pad: 8px;
		--concr-bands-dir-label-offset-y: 28px;
		--concr-bands-dir-label-offset-x: 8px;
		--concr-bands-endpoint-offset-top: 12px;
		--concr-bands-endpoint-offset-bottom: 28px;
		--concr-bands-axis-label-w: 28px;
		--concr-bands-axis-label-h: 14px;
		--concr-bands-dir-label-size: 15px;
		--concr-bands-axis-whole-size: 13px;
		--concr-bands-axis-half-size: 13px;
		--concr-bands-endpoint-size: 15px;

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

    .concr-bands-chart :global(.endpoint-text) {
        font-size: 15px;
        font-family: var(--font-mono);
        text-transform: uppercase;
        color: var(--color-primary);
        font-weight: 600;
        letter-spacing: 2%;
    }

    .concr-bands-chart :global(.label) {
        font-family: var(--font-mono);
        text-transform: uppercase;
    }

	.concr-bands-chart :global(.all-bands .band-group) {
		transition: opacity 220ms cubic-bezier(0.33, 1, 0.68, 1);
	}

	.concr-bands .chart-note {
		transition: opacity 220ms ease;
	}

	.concr-bands.is-overlay-active .chart-note {
		opacity: 0.4;
	}

	.concr-bands-stage {
		--chart-overlay-stage-height: auto;
		--chart-overlay-stage-top: 20vh;
	}


</style>
