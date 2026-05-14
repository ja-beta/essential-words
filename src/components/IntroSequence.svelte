<script>
	import { getContext, onMount } from "svelte";
	import { buildIntroSequenceGrid, INTRO_SEQUENCE_DEFAULTS } from "$utils/introWords.js";

	let { blocks = [] } = $props();

	const getData = getContext("data");
	const pools = $derived(getData?.()?.introWordPools ?? null);
	let gridConfig = $state({
		cols: INTRO_SEQUENCE_DEFAULTS.cols,
		rowScale: INTRO_SEQUENCE_DEFAULTS.rowScale,
		rows: null,
		baseWordRequestFraction: INTRO_SEQUENCE_DEFAULTS.baseWordRequestFraction,
		removedFillRatio: INTRO_SEQUENCE_DEFAULTS.removedFillRatio,
		baseFillFraction: INTRO_SEQUENCE_DEFAULTS.baseFillFraction,
		centerExclusionWidth: INTRO_SEQUENCE_DEFAULTS.centerExclusionWidth,
		centerExclusionHeight: INTRO_SEQUENCE_DEFAULTS.centerExclusionHeight,
		centerExclusionNoise: INTRO_SEQUENCE_DEFAULTS.centerExclusionNoise
	});
	const sequenceGrid = $derived(
		pools
			? buildIntroSequenceGrid(pools, {
					cols: gridConfig.cols,
					rowScale: gridConfig.rowScale,
					rows: gridConfig.rows,
					baseWordRequestFraction: gridConfig.baseWordRequestFraction,
					removedFillRatio: gridConfig.removedFillRatio,
					baseFillFraction: gridConfig.baseFillFraction,
					centerExclusionWidth: gridConfig.centerExclusionWidth,
					centerExclusionHeight: gridConfig.centerExclusionHeight,
					centerExclusionNoise: gridConfig.centerExclusionNoise
				})
			: null
	);
	const baseCells = $derived(sequenceGrid?.baseCells ?? []);
	const fullCells = $derived(sequenceGrid?.withRemovedCells ?? []);
	const gridCols = $derived(sequenceGrid?.cols ?? 12);
	const gridRows = $derived(sequenceGrid?.rows ?? 12);

	const part1 = $derived(blocks[0] ?? {});
	const part2 = $derived(blocks[1] ?? {});
	const part3 = $derived(blocks[2] ?? {});
	const part4 = $derived(blocks[3] ?? {});

	function paragraphs(block) {
		return [block?.p1, block?.p2, block?.p3].filter((p) => typeof p === "string" && p.trim().length);
	}

	const part1Paragraphs = $derived(paragraphs(part1));
	const part2Paragraphs = $derived(paragraphs(part2));
	const part3Paragraphs = $derived(paragraphs(part3));
	const part4Paragraphs = $derived(paragraphs(part4));

	let rootMount = $state(null);
	let stickyTrackMount = $state(null);

	let stickyProgress = $state(0);
	let rafId = 0;

	let timing = $state({
		part1Scroll: 200,
		part2Pre: 33,
		part2Add: 33,
		part3Text: 33,
		part3Drop: 25,
		part3Add: 25,
		part3Remain: 25,
		part3Hold: 25,
		part4Fade: 20,
		part4Swap: 20,
		part4Hold: 18
	});
	let geometry = $state({
		stageVh: 100,
		bgTotalVh: 200
	});

	function clamp01(v) {
		return Math.max(0, Math.min(1, v));
	}

	function cssVhNumber(name, fallback) {
		if (!rootMount) return fallback;
		const raw = getComputedStyle(rootMount).getPropertyValue(name);
		const n = Number.parseFloat(raw);
		return Number.isFinite(n) ? n : fallback;
	}

	function cssRatioNumber(name, fallback) {
		if (!rootMount) return fallback;
		const raw = getComputedStyle(rootMount).getPropertyValue(name);
		const n = Number.parseFloat(raw);
		return Number.isFinite(n) ? n : fallback;
	}

	function readTimingVars() {
		timing = {
			part1Scroll: cssVhNumber("--intro-part1-vh", 200),
			part2Pre: cssVhNumber("--intro-part2-pre-vh", 33),
			part2Add: cssVhNumber("--intro-part2-add-vh", 33),
			part3Text: cssVhNumber("--intro-part3-text-vh", 33),
			part3Drop: cssVhNumber("--intro-part3-drop-vh", 25),
			part3Add: cssVhNumber("--intro-part3-add-vh", 25),
			part3Remain: cssVhNumber("--intro-part3-remain-vh", 25),
			part3Hold: cssVhNumber("--intro-part3-hold-vh", 25),
			part4Fade: cssVhNumber("--intro-part4-fade-vh", 20),
			part4Swap: cssVhNumber("--intro-part4-swap-vh", 20),
			part4Hold: cssVhNumber("--intro-part4-hold-vh", 18)
		};
		geometry = {
			stageVh: cssVhNumber("--intro-stage-vh", 100),
			bgTotalVh: cssVhNumber("--intro-bg-total-vh", 200)
		};
		gridConfig = {
			cols: Math.max(4, Math.round(cssRatioNumber("--intro-grid-cols", INTRO_SEQUENCE_DEFAULTS.cols))),
			rowScale: Math.max(0.5, cssRatioNumber("--intro-grid-row-scale", INTRO_SEQUENCE_DEFAULTS.rowScale)),
			rows: (() => {
				const r = cssRatioNumber("--intro-grid-rows", -1);
				return r > 0 ? Math.round(r) : null;
			})(),
			baseWordRequestFraction: cssRatioNumber(
				"--intro-base-word-request-fraction",
				INTRO_SEQUENCE_DEFAULTS.baseWordRequestFraction
			),
			removedFillRatio: cssRatioNumber("--intro-removed-fill-ratio", INTRO_SEQUENCE_DEFAULTS.removedFillRatio),
			baseFillFraction: cssRatioNumber("--intro-base-fill-fraction", INTRO_SEQUENCE_DEFAULTS.baseFillFraction),
			centerExclusionWidth: cssRatioNumber(
				"--intro-center-exclusion-w",
				INTRO_SEQUENCE_DEFAULTS.centerExclusionWidth
			),
			centerExclusionHeight: cssRatioNumber(
				"--intro-center-exclusion-h",
				INTRO_SEQUENCE_DEFAULTS.centerExclusionHeight
			),
			centerExclusionNoise: cssRatioNumber(
				"--intro-center-exclusion-noise",
				INTRO_SEQUENCE_DEFAULTS.centerExclusionNoise
			)
		};
	}

	const stickyTotalVh = $derived(
		timing.part1Scroll +
			timing.part2Pre +
			timing.part2Add +
			timing.part3Text +
			timing.part3Drop +
			timing.part3Add +
			timing.part3Remain +
			timing.part3Hold +
			timing.part4Fade +
			timing.part4Swap +
			timing.part4Hold
	);

	const stickyY = $derived(stickyProgress * stickyTotalVh);
	const part1End = $derived(timing.part1Scroll);
	const part1Progress = $derived(clamp01(stickyY / Math.max(1, timing.part1Scroll)));
	const part2Cut = $derived(part1End + timing.part2Pre);
	const part2End = $derived(part2Cut + timing.part2Add);
	const part3TextEnd = $derived(part2End + timing.part3Text);
	const part3DropEnd = $derived(part3TextEnd + timing.part3Drop);
	const part3AddEnd = $derived(part3DropEnd + timing.part3Add);
	const part3RemainEnd = $derived(part3AddEnd + timing.part3Remain);
	const part3HoldEnd = $derived(part3RemainEnd + timing.part3Hold);
	const part4FadeEnd = $derived(part3HoldEnd + timing.part4Fade);

	const phase = $derived.by(() => {
		if (stickyY >= part4FadeEnd) return 4;
		if (stickyY >= part2End) return 3;
		if (stickyY >= part1End) return 2;
		return 1;
	});
	const removedOn = $derived(stickyY >= part2Cut);
	const dropOn = $derived(stickyY >= part3TextEnd && stickyY < part3HoldEnd);
	const addOn = $derived(stickyY >= part3DropEnd && stickyY < part3HoldEnd);
	const remainOn = $derived(stickyY >= part3AddEnd && stickyY < part3HoldEnd);
	const part4OverlayOn = $derived(stickyY >= part3HoldEnd);
	const part1BgTravelVh = $derived(Math.max(0, geometry.bgTotalVh - geometry.stageVh));
	const part1BgShift = $derived(-part1Progress * part1BgTravelVh);

	function measureProgress() {
		if (stickyTrackMount) {
			const rect = stickyTrackMount.getBoundingClientRect();
			const scrollable = Math.max(1, rect.height - window.innerHeight);
			stickyProgress = clamp01((-rect.top) / scrollable);
		}
	}

	function scheduleMeasure() {
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			rafId = 0;
			measureProgress();
		});
	}

	function handleResize() {
		readTimingVars();
		scheduleMeasure();
	}

	onMount(() => {
		readTimingVars();
		measureProgress();
		window.addEventListener("scroll", scheduleMeasure, { passive: true });
		window.addEventListener("resize", handleResize);
		return () => {
			if (rafId) cancelAnimationFrame(rafId);
			window.removeEventListener("scroll", scheduleMeasure);
			window.removeEventListener("resize", handleResize);
		};
	});
</script>

<div class="intro-sequence" bind:this={rootMount}>
	<section class="intro-sticky-track" bind:this={stickyTrackMount}>
		<div class="intro-stage">
			<div
				class="intro-bg-grid intro-bg-grid--stage"
				class:is-focus-drop={dropOn}
				class:is-focus-add={addOn}
				class:is-focus-remain={remainOn}
				class:is-reveal-removed={removedOn}
				style:grid-template-columns="repeat({gridCols}, minmax(0, 1fr))"
				style:grid-template-rows="repeat({gridRows}, minmax(0, 1fr))"
				style:transform={"translateY(" + part1BgShift + "vh)"}
			>
				{#each fullCells as cell, i}
					<div class="intro-bg-cell">
						{#if cell}
							{@const baseCell = baseCells[i]}
							{@const isExtraRemoved = !baseCell && cell?.set === "removed"}
							<span class="word word--{cell?.set ?? ''}" class:word--removed-extra={isExtraRemoved}>
								{cell.text}
							</span>
						{/if}
					</div>
				{/each}
			</div>

			<div class="intro-copy intro-copy--sticky">
				<div class="intro-copy-veil" aria-hidden="true"></div>
				<div class="intro-copy-layer" class:is-visible={phase === 1}>
					{#each part1Paragraphs as p}
						<p>{@html p}</p>
					{/each}
				</div>
				<div class="intro-copy-layer" class:is-visible={phase === 2}>
					{#each part2Paragraphs as p}
						<p>{@html p}</p>
					{/each}
				</div>
				<div
					class="intro-copy-layer intro-copy-layer--part3"
					class:is-visible={phase === 3}
					class:is-highlight-drop={dropOn}
					class:is-highlight-add={addOn}
					class:is-highlight-remain={remainOn}
				>
					{#each part3Paragraphs as p}
						<p>{@html p}</p>
					{/each}
				</div>
				<div class="intro-copy-layer intro-copy-layer--part4" class:is-visible={phase === 4}>
					{#each part4Paragraphs as p}
						<p>{@html p}</p>
					{/each}
				</div>
			</div>
			<div class="intro-fade-overlay" class:is-visible={part4OverlayOn} aria-hidden="true"></div>
		</div>
	</section>
</div>

<style>
	.intro-sequence {
		margin: -8rem 0 8rem 0;
		--intro-part1-vh: 200;
		--intro-bg-total-vh: 200;
		--intro-part2-pre-vh: 33;
		--intro-part2-add-vh: 33;
		--intro-part3-text-vh: 33;
		--intro-part3-drop-vh: 25;
		--intro-part3-add-vh: 25;
		--intro-part3-remain-vh: 25;
		--intro-part3-hold-vh: 35;
		--intro-part4-fade-vh: 70;
		--intro-part4-swap-vh: 20;
		--intro-part4-hold-vh: 18;
		--intro-stage-vh: 100;
		--intro-part1-sticky-top: 36vh;
		--intro-grid-cols: 8;
		--intro-grid-row-scale: 4.2;
		--intro-grid-rows: -1; /* set >0 to force exact rows */
		--intro-base-word-request-fraction: 0.5;
		--intro-base-fill-fraction: 0.45;
		--intro-removed-fill-ratio: 0.33;
		--intro-center-exclusion-w: 0.42;
		--intro-center-exclusion-h: 0.8;
		--intro-center-exclusion-noise: 0.85;
		--intro-copy-veil-size: 50% 20%;
		--intro-copy-fade-ms: 420ms;
		--intro-highlight-fade-ms: 420ms;
		--intro-overlay-fade-ms: 460ms;
		--intro-removed-reveal-ms: 520ms;
		--intro-highlight-fill-height: 1.25em;
		position: relative;
		width: 100%;
	}

	.intro-sticky-track {
		position: relative;
		min-height: calc(
			(
					var(--intro-stage-vh) +
					var(--intro-part1-vh) +
					var(--intro-part2-pre-vh) +
					var(--intro-part2-add-vh) +
					var(--intro-part3-text-vh) +
					var(--intro-part3-drop-vh) +
					var(--intro-part3-add-vh) +
					var(--intro-part3-remain-vh) +
					var(--intro-part3-hold-vh) +
					var(--intro-part4-fade-vh) +
					var(--intro-part4-swap-vh) +
					var(--intro-part4-hold-vh)
				) * 1vh
		);
	}

	.intro-stage {
		position: sticky;
		top: 0;
		height: calc(var(--intro-stage-vh) * 1vh);
		overflow: hidden;
	}

	.intro-bg-grid {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: calc(var(--intro-bg-total-vh) * 1vh);
		display: grid;
		pointer-events: none;
		margin: 0 2rem;
		will-change: transform;
	}

	.intro-bg-cell {
		display: flex;
		align-items: center;
		justify-content: start;
		min-width: 0;
		min-height: 0;
	}

	.word {
		font-family: var(--font-sans);
		font-style: italic;
		font-size: 1rem;
		text-transform: uppercase;
		letter-spacing: 3%;
		color: var(--color-secondary);
		white-space: nowrap;
		opacity: 0.75;
		padding: 0 0.35rem;
		background-repeat: no-repeat;
		background-size: 0% var(--intro-highlight-fill-height);
		background-position: 0 0.1rem;
		box-decoration-break: clone;
		transition:
			background-size var(--intro-highlight-fade-ms) ease,
			color var(--intro-highlight-fade-ms) ease,
			opacity var(--intro-highlight-fade-ms) ease;
	}

	.word--removed {
		font-family: var(--font-serif);
	}

	.word--removed-extra {
		opacity: 0;
		transform: translateY(8px);
		transition:
			opacity var(--intro-removed-reveal-ms) ease,
			transform var(--intro-removed-reveal-ms) ease,
			background-size var(--intro-highlight-fade-ms) ease,
			color var(--intro-highlight-fade-ms) ease;
	}

	.intro-bg-grid--stage.is-reveal-removed .word--removed-extra {
		opacity: 0.75;
		transform: translateY(0);
		/* color: var(--color-primary); */
	}

	.intro-bg-grid--stage.is-focus-drop .word--removed {
		background-image: linear-gradient(var(--color-gsl-highlight), var(--color-gsl-highlight));
		background-size: 100% var(--intro-highlight-fill-height);
		opacity: 1;
		color: var(--color-highlight-text);
	}

	.intro-bg-grid--stage.is-focus-add .word--added {
		background-image: linear-gradient(var(--color-ngsl-highlight), var(--color-ngsl-highlight));
		background-size: 100% var(--intro-highlight-fill-height);
		opacity: 1;
		color: var(--color-highlight-text);
	}

	.intro-bg-grid--stage.is-focus-remain .word--remained {
		background-image: linear-gradient(var(--color-remained-highlight), var(--color-remained-highlight));
		background-size: 100% var(--intro-highlight-fill-height);
		opacity: 1;
		color: var(--color-highlight-text);
	}

	.intro-fade-overlay {
		position: absolute;
		inset: 0;
		background: var(--color-bg);
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--intro-overlay-fade-ms) ease;
	}

	.intro-fade-overlay.is-visible {
		opacity: 0.7;
	}

	.intro-copy {
		position: relative;
		z-index: 2;
		max-width: 525px;
		margin: 0 auto;
		padding-inline: 1rem;
		text-align: center;
	}

	.intro-copy p {
		font-size: 1.375rem;
		line-height: 1.45;
	}

	.intro-copy--sticky {
		position: relative;
		height: 100%;
	}

	.intro-copy-veil {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background: radial-gradient(
			ellipse var(--intro-copy-veil-size) at 50% var(--intro-part1-sticky-top),
			rgba(255, 255, 241, 1) 0%,
			rgba(255, 255, 241, 0.9) 28%,
			rgba(255, 255, 241, 0.55) 52%,
			rgba(255, 255, 241, 0) 100%
		);
	}

	.intro-copy-layer {
		position: absolute;
		inset: 0;
		z-index: 1;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		padding-top: var(--intro-part1-sticky-top);
		opacity: 0;
		transition: opacity var(--intro-copy-fade-ms) ease;
	}

	.intro-copy-layer.is-visible {
		opacity: 1;
	}

	.intro-copy-layer--part4{
		padding-top: 6rem; 
	}

	.intro-copy-layer--part4 p{
		text-align: left;
	}

	.intro-copy-layer--part3 :global(.gsl),
	.intro-copy-layer--part3 :global(.ngsl),
	.intro-copy-layer--part3 :global(.remained) {
		background-image: linear-gradient(transparent, transparent);
		background-repeat: no-repeat;
		background-size: 0% var(--intro-highlight-fill-height);
		background-position: 0 67%;
		box-decoration-break: clone;
		transition:
			background-size var(--intro-highlight-fade-ms) ease,
			color var(--intro-highlight-fade-ms) ease;
	}

	.intro-copy-layer--part3.is-highlight-drop :global(.gsl) {
		background-image: linear-gradient(var(--color-gsl-highlight), var(--color-gsl-highlight));
		background-size: 100% var(--intro-highlight-fill-height);
	}

	.intro-copy-layer--part3.is-highlight-add :global(.ngsl) {
		background-image: linear-gradient(var(--color-ngsl-highlight), var(--color-ngsl-highlight));
		background-size: 100% var(--intro-highlight-fill-height);
	}

	.intro-copy-layer--part3.is-highlight-remain :global(.remained) {
		background-image: linear-gradient(var(--color-remained-highlight), var(--color-remained-highlight));
		background-size: 100% var(--intro-highlight-fill-height);
	}

</style>
