<script>
	import { browser } from "$app/environment";
	import { getContext, onMount } from "svelte";
	import IntroWordGrid from "$components/IntroWordGrid.svelte";
	import { subscribePrefersReducedMotion, getPrefersReducedMotion } from "$utils/prefersReducedMotion.js";
	import {
		buildIntroFlowGrid,
		buildIntroSequenceGrid,
		buildWritePlanForCells,
		INTRO_SEQUENCE_DEFAULTS
	} from "$utils/introWords.js";

	let { blocks = [] } = $props();

	const MOBILE_LAYOUT_MQ = "(max-width: 768px)";

	function flowColsForViewport(width) {
		if (width <= 480) return 3;
		if (width <= 600) return 4;
		return 5;
	}

	function readMobileLayout() {
		if (!browser) return false;
		return window.matchMedia(MOBILE_LAYOUT_MQ).matches;
	}

	const getData = getContext("data");
	const pools = $derived(getData?.()?.introWordPools ?? null);
	let isMobileLayout = $state(readMobileLayout());
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
	let flowConfig = $state({
		cols: browser ? flowColsForViewport(window.innerWidth) : 5,
		rowsLong: 10,
		rowsShort: 5
	});

	let layoutSynced = $state(!browser || !readMobileLayout());

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

	const flowGridLong = $derived(
		pools
			? buildIntroFlowGrid(pools, {
					cols: flowConfig.cols,
					rows: flowConfig.rowsLong,
					screenIndex: 0,
					seed: 1101
				})
			: null
	);
	const flowGridShort = $derived(
		pools
			? buildIntroFlowGrid(pools, {
					cols: flowConfig.cols,
					rows: flowConfig.rowsShort,
					screenIndex: 0,
					seed: 1102
				})
			: null
	);
	const stickyGridGsl = $derived(
		pools
			? buildIntroFlowGrid(pools, {
					cols: flowConfig.cols,
					rows: flowConfig.rowsShort,
					screenIndex: 1,
					seed: 1103
				})
			: null
	);
	const stickyGridAll = $derived(
		pools
			? buildIntroFlowGrid(pools, {
					cols: flowConfig.cols,
					rows: flowConfig.rowsShort,
					screenIndex: 3,
					seed: 1104
				})
			: null
	);

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
	let writeReveal = $state(false);
	let prefersReducedMotion = $state(browser ? getPrefersReducedMotion() : false);
	let prefersReducedMotionSub;
	let rafId = 0;
	let writeRevealTimer = 0;
	let scrollListenerActive = false;
	let introObserver;

	let timing = $state({
		part1Scroll: 200,
		part2Pre: 33,
		part2Add: 33,
		part3Text: 33,
		part3Drop: 25,
		part3Add: 25,
		part3Remain: 25,
		part3Hold: 25,
		part3Release: 25
	});
	let geometry = $state({
		stageVh: 100,
		bgTotalVh: 200
	});

	function clamp01(v) {
		return Math.max(0, Math.min(1, v));
	}

	function seededUnit(seed) {
		const x = Math.sin(seed + 1) * 10000;
		return x - Math.floor(x);
	}

	const WRITE_SHUFFLE_SEED = 4187;

	const writePlanByIndex = $derived.by(() => {
		const cols = gridCols;
		const rows = gridRows;
		const cells = fullCells;
		const base = baseCells;
		if (!cells.length || !cols) return new Map();

		const visibleRows = Math.max(
			1,
			Math.min(rows, Math.ceil((geometry.stageVh / Math.max(1, geometry.bgTotalVh)) * rows))
		);

		const eligible = [];
		for (let i = 0; i < cells.length; i++) {
			if (!cells[i]) continue;
			if (!base[i] && cells[i]?.set === "removed") continue;
			if (Math.floor(i / cols) >= visibleRows) continue;
			eligible.push(i);
		}

		const shuffled = [...eligible];
		for (let n = shuffled.length - 1; n > 0; n--) {
			const j = Math.floor(seededUnit(WRITE_SHUFFLE_SEED + n * 41) * (n + 1));
			[shuffled[n], shuffled[j]] = [shuffled[j], shuffled[n]];
		}

		const plan = new Map();
		for (let rank = 0; rank < shuffled.length; rank++) {
			const i = shuffled[rank];
			const len = cells[i].text.length;
			plan.set(i, { order: rank, ch: len, steps: Math.max(4, len) });
		}
		return plan;
	});

	const flowWritePlanLong = $derived(buildWritePlanForCells(flowGridLong?.cells ?? [], 5101));
	const flowWritePlanShort = $derived(buildWritePlanForCells(flowGridShort?.cells ?? [], 5102));
	const stickyWritePlanGsl = $derived(buildWritePlanForCells(stickyGridGsl?.cells ?? [], 5103));
	const stickyWritePlanAll = $derived(buildWritePlanForCells(stickyGridAll?.cells ?? [], 5104));

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
			part3Release: cssVhNumber("--intro-part3-release-vh", 40)
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
		flowConfig = {
			cols: Math.max(
				3,
				Math.round(cssRatioNumber("--intro-flow-cols", flowColsForViewport(window.innerWidth)))
			),
			rowsLong: Math.max(1, Math.round(cssRatioNumber("--intro-flow-rows-long", 10))),
			rowsShort: Math.max(1, Math.round(cssRatioNumber("--intro-flow-rows-short", 5)))
		};
	}

	const desktopStickyTotalVh = $derived(
		timing.part1Scroll +
			timing.part2Pre +
			timing.part2Add +
			timing.part3Text +
			timing.part3Drop +
			timing.part3Add +
			timing.part3Remain +
			timing.part3Hold +
			timing.part3Release
	);

	const mobileStickyTotalVh = $derived(
		timing.part3Text +
			timing.part3Drop +
			timing.part3Add +
			timing.part3Remain +
			timing.part3Hold +
			timing.part3Release
	);

	const activeStickyTotalVh = $derived(isMobileLayout ? mobileStickyTotalVh : desktopStickyTotalVh);
	const stickyY = $derived(stickyProgress * activeStickyTotalVh);

	const part1End = $derived(timing.part1Scroll);
	const part1Progress = $derived(clamp01(stickyY / Math.max(1, timing.part1Scroll)));
	const part2Cut = $derived(part1End + timing.part2Pre);
	const part2End = $derived(part2Cut + timing.part2Add);

	const part3Start = $derived(isMobileLayout ? 0 : part2End);
	const part3TextEnd = $derived(part3Start + timing.part3Text);
	const part3DropEnd = $derived(part3TextEnd + timing.part3Drop);
	const part3AddEnd = $derived(part3DropEnd + timing.part3Add);
	const part3RemainEnd = $derived(part3AddEnd + timing.part3Remain);
	const part3HoldEnd = $derived(part3RemainEnd + timing.part3Hold);

	const phase = $derived.by(() => {
		if (stickyY >= part2End) return 3;
		if (stickyY >= part1End) return 2;
		return 1;
	});
	const removedOn = $derived(!isMobileLayout && stickyY >= part2Cut);
	const dropOn = $derived(stickyY >= part3TextEnd);
	const addOn = $derived(stickyY >= part3DropEnd);
	const remainOn = $derived(stickyY >= part3AddEnd);
	const overlayOn = $derived(stickyY >= part3HoldEnd);
	const part4Visible = $derived(stickyY >= part3HoldEnd);
	const part1BgTravelVh = $derived(Math.max(0, geometry.bgTotalVh - geometry.stageVh));
	const part1BgShift = $derived(-part1Progress * part1BgTravelVh);

	function attachScrollListener() {
		if (scrollListenerActive) return;
		scrollListenerActive = true;
		window.addEventListener("scroll", scheduleMeasure, { passive: true });
	}

	function detachScrollListener() {
		if (!scrollListenerActive) return;
		scrollListenerActive = false;
		window.removeEventListener("scroll", scheduleMeasure);
	}

	function measureProgress() {
		if (stickyTrackMount) {
			const rect = stickyTrackMount.getBoundingClientRect();
			const scrollable = Math.max(1, rect.height - window.innerHeight);
			stickyProgress = clamp01((-rect.top) / scrollable);
		}
	}

	function setupIntroObserver() {
		introObserver?.disconnect();
		if (!rootMount) return;
		introObserver = new IntersectionObserver(
			([entry]) => {
				if (!entry) return;
				const pastIntro = entry.boundingClientRect.bottom <= 0;
				if (pastIntro) {
					stickyProgress = 1;
					detachScrollListener();
					return;
				}
				attachScrollListener();
				scheduleMeasure();
			},
			{ root: null, threshold: 0 }
		);
		introObserver.observe(rootMount);
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

	function startWriteReveal() {
		if (writeReveal) return;
		if (prefersReducedMotion) {
			writeReveal = true;
			return;
		}
		writeRevealTimer = window.setTimeout(() => {
			writeReveal = true;
		}, 50);
	}

	onMount(() => {
		prefersReducedMotionSub = subscribePrefersReducedMotion((reduced) => {
			prefersReducedMotion = reduced;
			if (reduced) startWriteReveal();
		});

		const layoutMq = window.matchMedia(MOBILE_LAYOUT_MQ);
		const syncLayout = () => {
			isMobileLayout = layoutMq.matches;
			readTimingVars();
			scheduleMeasure();
		};

		syncLayout();
		layoutSynced = true;
		measureProgress();
		startWriteReveal();
		layoutMq.addEventListener("change", syncLayout);
		attachScrollListener();
		requestAnimationFrame(setupIntroObserver);
		window.addEventListener("resize", handleResize);
		return () => {
			prefersReducedMotionSub?.destroy();
			if (rafId) cancelAnimationFrame(rafId);
			if (writeRevealTimer) clearTimeout(writeRevealTimer);
			layoutMq.removeEventListener("change", syncLayout);
			introObserver?.disconnect();
			detachScrollListener();
			window.removeEventListener("resize", handleResize);
		};
	});
</script>

<div class="intro-sequence" class:intro-sequence--mobile={isMobileLayout} bind:this={rootMount}>
	{#if layoutSynced && isMobileLayout}
		{#if flowGridLong}
			<IntroWordGrid
				variant="flow"
				cells={flowGridLong.cells}
				cols={flowGridLong.cols}
				rows={flowGridLong.rows}
				{writeReveal}
				{prefersReducedMotion}
				writePlan={flowWritePlanLong}
			/>
		{/if}

		<section class="intro-copy intro-copy--flow">
			{#each part1Paragraphs as p}
				<p>{@html p}</p>
			{/each}
		</section>

		{#if flowGridShort}
			<IntroWordGrid
				variant="flow"
				cells={flowGridShort.cells}
				cols={flowGridShort.cols}
				rows={flowGridShort.rows}
				{writeReveal}
				{prefersReducedMotion}
				writePlan={flowWritePlanShort}
			/>
		{/if}

		<section class="intro-copy intro-copy--flow">
			{#each part2Paragraphs as p}
				<p>{@html p}</p>
			{/each}
		</section>

		<section class="intro-mobile-sticky-track" bind:this={stickyTrackMount}>
			<div class="intro-mobile-stage">
				{#if stickyGridGsl}
					<IntroWordGrid
						variant="mobile-sticky"
						cells={stickyGridGsl.cells}
						cols={stickyGridGsl.cols}
						rows={stickyGridGsl.rows}
						{writeReveal}
						{prefersReducedMotion}
						writePlan={stickyWritePlanGsl}
						focusDrop={dropOn}
						focusRemain={remainOn}
					/>
				{/if}

				<div
					class="intro-copy intro-copy--part3-mobile"
					class:is-highlight-drop={dropOn}
					class:is-highlight-add={addOn}
					class:is-highlight-remain={remainOn}
				>
					{#each part3Paragraphs as p}
						<p>{@html p}</p>
					{/each}
				</div>

				{#if stickyGridAll}
					<IntroWordGrid
						variant="mobile-sticky"
						cells={stickyGridAll.cells}
						cols={stickyGridAll.cols}
						rows={stickyGridAll.rows}
						{writeReveal}
						{prefersReducedMotion}
						writePlan={stickyWritePlanAll}
						focusDrop={dropOn}
						focusAdd={addOn}
						focusRemain={remainOn}
					/>
				{/if}

				<div class="intro-fade-overlay" class:is-visible={overlayOn} aria-hidden="true"></div>
			</div>
		</section>
	{:else if layoutSynced}
		<section class="intro-sticky-track" bind:this={stickyTrackMount}>
			<div class="intro-stage">
				<IntroWordGrid
					variant="stage"
					class="intro-bg-grid--stage"
					cells={fullCells}
					baseCells={baseCells}
					cols={gridCols}
					rows={gridRows}
					{writeReveal}
					{prefersReducedMotion}
					writePlan={writePlanByIndex}
					revealRemoved={removedOn}
					focusDrop={dropOn}
					focusAdd={addOn}
					focusRemain={remainOn}
					transform={"translateY(" + part1BgShift + "vh)"}
				/>

				<div class="intro-copy intro-copy--sticky">
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
						class:is-visible={phase === 3 && stickyY < part3HoldEnd}
						class:is-highlight-drop={dropOn}
						class:is-highlight-add={addOn}
						class:is-highlight-remain={remainOn}
					>
						{#each part3Paragraphs as p}
							<p>{@html p}</p>
						{/each}
					</div>
				</div>
				<div class="intro-fade-overlay" class:is-visible={overlayOn} aria-hidden="true"></div>
			</div>
		</section>
	{/if}

	<section class="intro-copy intro-copy--part4" class:is-visible={part4Visible}>
		{#each part4Paragraphs as p}
			<p>{@html p}</p>
		{/each}
		<div class="intro-legend-container">
			<div class="intro-legend">
				<div class="intro-legend-item">
					<div class="intro-legend-rect"><span class="ngsl">A</span></div>
					<div class="intro-legend-text">Added to 2023 list</div>
				</div>
				<div class="intro-legend-item">
					<div class="intro-legend-rect"><span class="gsl">A</span></div>
					<div class="intro-legend-text">Removed from 1953 list</div>
				</div>
				<div class="intro-legend-item">
					<div class="intro-legend-rect"><span class="remained">A</span></div>
					<div class="intro-legend-text">In both lists</div>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	:global(#intro) {
		margin-bottom: 8rem;
	}

	.intro-sequence {
		margin: -8rem 0 4rem 0;

		--intro-copy-width: 525px;
		--intro-part1-vh: 200;
		--intro-bg-total-vh: 200;
		--intro-part2-pre-vh: 33;
		--intro-part2-add-vh: 33;
		--intro-part3-text-vh: 33;
		--intro-part3-drop-vh: 25;
		--intro-part3-add-vh: 25;
		--intro-part3-remain-vh: 25;
		--intro-part3-hold-vh: 35;
		--intro-part3-release-vh: 35;
		--intro-stage-vh: 100;
		--intro-part1-sticky-top: 36vh;
		--intro-grid-cols: 8;
		--intro-grid-row-scale: 4.2;
		--intro-grid-rows: -1;
		--intro-copy-fade-ms: 420ms;
		--intro-highlight-fade-ms: 420ms;
		--intro-overlay-fade-ms: 460ms;
		--intro-removed-reveal-ms: 520ms;
		--intro-part4-fade-ms: 600ms;
		--intro-part4-translate: 16px;
		--intro-highlight-sans: 1.1em;
		--intro-highlight-serif: 1.15em;
		--intro-highlight-y-serif: 100%;
		--intro-highlight-y-sans: 50%;
		--intro-grid-font-size-serif: 0.95rem;
		--intro-grid-highlight-pos-sans: 0.1rem;
		--intro-grid-highlight-pos-serif: 0.2rem;
		--intro-write-ms-min: 140ms;
		--intro-write-ms-max: 500ms;
		--intro-write-ms-per-ch: 180ms;
		--intro-write-stagger-ms: 200ms;
		position: relative;
		width: 100%;
	}

	.intro-sticky-track {
		position: relative;
		min-height: calc(
			(
					var(--intro-stage-vh) + var(--intro-part1-vh) + var(--intro-part2-pre-vh) +
						var(--intro-part2-add-vh) + var(--intro-part3-text-vh) + var(--intro-part3-drop-vh) +
						var(--intro-part3-add-vh) + var(--intro-part3-remain-vh) + var(--intro-part3-hold-vh) +
						var(--intro-part3-release-vh)
				) * 1vh
		);
	}

	.intro-mobile-sticky-track {
		position: relative;
		min-height: calc(
			(
					var(--intro-stage-vh) + var(--intro-part3-text-vh) + var(--intro-part3-drop-vh) +
						var(--intro-part3-add-vh) + var(--intro-part3-remain-vh) + var(--intro-part3-hold-vh) +
						var(--intro-part3-release-vh)
				) * 1vh
		);
	}

	.intro-stage {
		position: sticky;
		top: 0;
		height: calc(var(--intro-stage-vh) * 1vh);
		overflow: hidden;
	}

	.intro-mobile-stage {
		position: sticky;
		top: 2rem;
		height: calc(100vh - 4rem);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 2rem;
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
		opacity: 0.85;
	}

	.intro-copy {
		position: relative;
		z-index: 2;
		max-width: var(--intro-copy-width);
		margin: 0 auto;
		padding: 1rem;
		text-align: center;
	}

	.intro-copy p {
		font-size: 1.375rem;
		line-height: 1.45;
	}

	.intro-copy--flow {
		padding-top: 1.5rem;
		padding-bottom: 1.5rem;
	}

	.intro-copy--sticky {
		position: relative;
		height: 100%;
	}

	.intro-copy-layer {
		position: absolute;
		inset: 0;
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

	.intro-copy--part3-mobile {
		padding: 0.5rem;
		text-align: center;
	}

	.intro-copy--part4 {
		position: relative;
		z-index: 5;
		max-width: var(--intro-copy-width);
		margin-top: calc(var(--intro-stage-vh) * -0.8vh);
		padding-top: 4rem;
		padding-bottom: 2rem;
		text-align: left;
		opacity: 0;
		transform: translateY(var(--intro-part4-translate));
		transition:
			opacity var(--intro-part4-fade-ms) ease,
			transform var(--intro-part4-fade-ms) ease;
		will-change: opacity, transform;
	}

	.intro-sequence--mobile .intro-copy--part4 {
		margin-top: 0;
		padding-top: 2rem;
	}

	.intro-copy--part4.is-visible {
		opacity: 1;
		transform: translateY(0);
	}

	.intro-copy--part4 p {
		text-align: left;
	}

	.intro-copy-layer--part3 :global(.gsl),
	.intro-copy-layer--part3 :global(.ngsl),
	.intro-copy-layer--part3 :global(.remained),
	.intro-copy--part3-mobile :global(.gsl),
	.intro-copy--part3-mobile :global(.ngsl),
	.intro-copy--part3-mobile :global(.remained) {
		padding: 0;
		background-image: linear-gradient(transparent, transparent);
		background-repeat: no-repeat;
		background-size: 0% var(--intro-highlight-sans);
		box-decoration-break: clone;
		color: var(--color-primary);
		transition:
			background-size var(--intro-highlight-fade-ms) ease,
			color var(--intro-highlight-fade-ms) ease,
			padding var(--intro-highlight-fade-ms) ease;
	}

	.intro-copy-layer--part3 :global(.gsl),
	.intro-copy--part3-mobile :global(.gsl) {
		background-position: 0 var(--intro-highlight-y-serif);
	}

	.intro-copy-layer--part3 :global(.ngsl),
	.intro-copy-layer--part3 :global(.remained),
	.intro-copy--part3-mobile :global(.ngsl),
	.intro-copy--part3-mobile :global(.remained) {
		background-position: 0 var(--intro-highlight-y-sans);
	}

	.intro-copy-layer--part3.is-highlight-drop :global(.gsl),
	.intro-copy--part3-mobile.is-highlight-drop :global(.gsl) {
		background-image: linear-gradient(var(--color-gsl-highlight), var(--color-gsl-highlight));
		background-size: 100% var(--intro-highlight-serif);
		padding: 0 0.35rem;
		color: var(--color-highlight-text);
	}

	.intro-copy-layer--part3.is-highlight-add :global(.ngsl),
	.intro-copy--part3-mobile.is-highlight-add :global(.ngsl) {
		background-image: linear-gradient(var(--color-ngsl-highlight), var(--color-ngsl-highlight));
		background-size: 100% var(--intro-highlight-sans);
		padding: 0 0.35rem;
		color: var(--color-highlight-text);
	}

	.intro-copy-layer--part3.is-highlight-remain :global(.remained),
	.intro-copy--part3-mobile.is-highlight-remain :global(.remained) {
		background-image: linear-gradient(var(--color-remained-highlight), var(--color-remained-highlight));
		background-size: 100% var(--intro-highlight-sans);
		padding: 0 0.35rem;
		color: var(--color-highlight-text);
	}

	.intro-legend-container {
		display: none;
		width: fit-content;
		position: sticky;
		bottom: 2rem;
	}

	.intro-legend {
		display: flex;
		width: fit-content;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: flex-start;
		gap: 0.5rem 1rem;
		margin-top: 2rem;
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 2%;
		font-weight: 600;
		font-size: 13px;
		background: var(--color-bg);
		padding: 0.5rem;
		border-radius: 0.25rem;
		border: 1px solid var(--color-border);
	}

	.intro-legend-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 4px;
		white-space: nowrap;
	}


	@media (min-width: 769px) and (max-width: 1024px) {
		.intro-sequence {
			--intro-grid-cols: 4;
			--intro-grid-row-scale: 8.4;
		}
	}

	@media (min-width: 769px) {
		.intro-stage {
			margin: 0 calc(-2.5 * var(--prose-margins)) 0 calc(var(--prose-margins) * -1);
		}
	}

	@media (max-width: 768px) {
		:global(#intro) {
			margin-bottom: 3rem;
			padding: 0 0 0 1.5rem;
		}

		.intro-sequence--mobile {
			margin-top: 2rem;
			margin-bottom: 0;
			display: flex;
			flex-direction: column;
			gap: 3rem;
			--intro-flow-cols: 5;
			--intro-flow-rows-long: 10;
			--intro-flow-rows-short: 5;
		}

		.intro-sequence--mobile .intro-copy {
			max-width: 100%;
			margin: 0;
			padding: 0;
		}

		.intro-sequence--mobile .intro-copy p {
			font-size: 1.125rem;
			line-height: 1.35;
			margin-top: 0;
		}

		.intro-sequence--mobile .intro-copy p:last-child {
			margin-bottom: 0;
		}

		.intro-copy--part3-mobile p {
			margin: 0;
		}
	}

	@media (max-width: 600px) {
		.intro-sequence--mobile {
			--intro-flow-cols: 4;
		}
	}

	@media (max-width: 480px) {
		.intro-sequence--mobile {
			--intro-flow-cols: 3;
		}
	}
</style>
