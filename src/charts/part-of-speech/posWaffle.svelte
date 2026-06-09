<script>
	import { getContext, onDestroy, onMount } from "svelte";
	import { observeChartVisibility } from "$utils/chartVisibility.js";

	let { note = "" } = $props();

	const getData = getContext("data");
	const rows = $derived(getData?.()?.posRows ?? []);

	const POS_ORDER = ["noun", "adjective", "adverb", "verb", "other"];
	const POS_HEADERS = {
		noun: "nouns",
		adjective: "adjectives",
		adverb: "adverbs",
		verb: "verbs",
		other: "other"
	};

	// Screen-width tiers — same logic as @media (max-width: …).
	const BREAKPOINTS = [
		{
			maxWidth: 480,
			cellSize: 3,
			cellGap: 1,
			interactive: false,
			cols: { noun: 14, adjective: 5, adverb: 5, verb: 5, other: 5 }
		},
		{
			maxWidth: 660,
			cellSize: 4,
			cellGap: 1,
			interactive: false,
			cols: { noun: 35, adjective: 8, adverb: 8, verb: 8, other: 8 }
		},
		{
			maxWidth: 768,
			cellSize: 4,
			cellGap: 1,
			interactive: false,
			cols: { noun: 35, adjective: 10, adverb: 10, verb: 10, other: 10 }
		},
		{
			maxWidth: Infinity,
			cellSize: 6,
			cellGap: 1,
			interactive: true,
			cols: { noun: 40, adjective: 10, adverb: 10, verb: 10, other: 10 }
		}
	];

	function breakpointForScreenWidth(width) {
		const w = width > 0 ? width : Infinity;
		for (const bp of BREAKPOINTS) {
			if (w <= bp.maxWidth) return bp;
		}
		return BREAKPOINTS.at(-1);
	}

	function normalizePos(v) {
		const p = String(v ?? "").trim().toLowerCase();
		return POS_ORDER.includes(p) ? p : "other";
	}


	function layoutCellsBottomUp(cells, cols, bottomSet = null) {
		const ordered = bottomSet
			? [
					...cells.filter((cell) => cell.set === bottomSet),
					...cells.filter((cell) => cell.set !== bottomSet)
				]
			: cells;
		const count = ordered.length;
		if (count === 0) return { cells: [], rows: 0 };
		const rows = Math.ceil(count / cols);
		return {
			rows,
			cells: ordered.map((cell, i) => ({
				...cell,
				gridRow: rows - Math.floor(i / cols),
				gridColumn: (i % cols) + 1
			}))
		};
	}

	function buildList(sourceRows, label, includeSets, setOrder) {
		const grouped = Object.fromEntries(POS_ORDER.map((pos) => [pos, []]));
		sourceRows
			.filter((row) => includeSets.includes(row?.set))
			.sort((a, b) => {
				const oa = setOrder[a?.set] ?? 99;
				const ob = setOrder[b?.set] ?? 99;
				if (oa !== ob) return oa - ob;
				return String(a?.word ?? "").localeCompare(String(b?.word ?? ""));
			})
			.forEach((row) => {
				const pos = normalizePos(row?.pos);
				grouped[pos].push({ word: String(row?.word ?? ""), set: row?.set });
			});
		return { label, posCells: grouped };
	}

	const lists = $derived.by(() => [
		buildList(rows, "1953 list", ["remained", "removed"], { remained: 0, removed: 1 }),
		buildList(rows, "2023 list", ["remained", "added"], { added: 0, remained: 1 })
	]);
	let screenWidth = $state(0);
	const activeBreakpoint = $derived(breakpointForScreenWidth(screenWidth));
	const colsPerPos = $derived(activeBreakpoint.cols);
	const cellSize = $derived(activeBreakpoint.cellSize);
	const cellGap = $derived(activeBreakpoint.cellGap);
	const interactive = $derived(activeBreakpoint.interactive);
	const blockWidths = $derived.by(() => {
		const widths = {};
		for (const pos of POS_ORDER) {
			widths[pos] = colsPerPos[pos] * (cellSize + cellGap) - cellGap;
		}
		return widths;
	});

	let rootMount = $state(null);
	let gridMounted = $state(false);
	let visibilityObserver;

	let tooltipWord = $state("");
	let tooltipSet = $state("");
	let tooltipVisible = $state(false);
	let tooltipX = $state(0);
	let tooltipY = $state(0);

	function updateTooltipPosition(event) {
		const tipW = 180;
		let tx = event.clientX + 12;
		let ty = event.clientY - 28;
		if (tx + tipW > window.innerWidth - 8) tx = event.clientX - tipW - 12;
		if (ty < 8) ty = event.clientY + 16;
		tooltipX = tx;
		tooltipY = ty;
	}

	function showTooltip(word, setName, event) {
		tooltipWord = word;
		tooltipSet = setName;
		tooltipVisible = true;
		updateTooltipPosition(event);
	}

	function hideTooltip() {
		tooltipVisible = false;
	}

	/** @param {Event} event */
	function cellFromEvent(event) {
		const target = event.target;
		if (!(target instanceof Element)) return null;
		return target.closest(".pos-cell");
	}

	/** @param {MouseEvent} event */
	function handleCellOver(event) {
		const cell = cellFromEvent(event);
		if (!cell) return;
		showTooltip(cell.dataset.word ?? "", cell.dataset.set ?? "", event);
	}

	/** @param {MouseEvent} event */
	function handleCellOut(event) {
		const cell = cellFromEvent(event);
		if (!cell) return;
		const related = event.relatedTarget;
		if (related instanceof Node && cell.contains(related)) return;
		if (related instanceof Element && related.closest(".pos-cell")) return;
		hideTooltip();
	}

	/** @param {MouseEvent} event */
	function handleCellMove(event) {
		if (!tooltipVisible || !cellFromEvent(event)) return;
		updateTooltipPosition(event);
	}

	/** @param {MouseEvent} event */
	function handleWaffleLeave(event) {
		const related = event.relatedTarget;
		if (related instanceof Node && event.currentTarget.contains(related)) return;
		hideTooltip();
	}

	function setupVisibilityObserver() {
		visibilityObserver?.disconnect();
		const target = rootMount?.closest?.(".story-section--chart") ?? rootMount;
		if (!target) return;
		visibilityObserver = observeChartVisibility(target, (visible) => {
			if (visible) gridMounted = true;
		});
	}

	onMount(() => {
		setupVisibilityObserver();
		const onResize = () => {
			screenWidth = window.innerWidth;
		};
		onResize();
		window.addEventListener("resize", onResize, { passive: true });
		return () => window.removeEventListener("resize", onResize);
	});
	onDestroy(() => visibilityObserver?.disconnect());
</script>

<div
	class="pos-waffle"
	bind:this={rootMount}
	style:--pos-cell-size={`${cellSize}px`}
	style:--pos-cell-gap={`${cellGap}px`}
>
	{#if lists[0]?.posCells && lists[1]?.posCells}
		{#if gridMounted}
		<!-- Word tooltips are decorative desktop-only; cells are aria-hidden. -->
		<!-- svelte-ignore a11y_mouse_events_have_key_events -->
		<div
			class="pos-waffle-inner"
			class:pos-waffle-inner--static={!interactive}
			role="group"
			aria-label="Parts of speech waffle chart"
			onmouseover={interactive ? handleCellOver : undefined}
			onmouseout={interactive ? handleCellOut : undefined}
			onmousemove={interactive ? handleCellMove : undefined}
			onmouseleave={interactive ? handleWaffleLeave : undefined}
		>
				<div class="pos-layout-row pos-layout-row--bottom">
					<div class="pos-label-cell">{lists[0].label}</div>
					<div class="pos-chart-area pos-chart-area--bottom">
						{#each POS_ORDER as pos}
							{@const layout = layoutCellsBottomUp(lists[0].posCells[pos], colsPerPos[pos], "removed")}
							<div class="pos-block" style:width={`${blockWidths[pos]}px`}>
								<div
									class="pos-grid"
									style:grid-template-columns={`repeat(${colsPerPos[pos]}, var(--pos-cell-size))`}
									style:grid-template-rows={layout.rows
										? `repeat(${layout.rows}, var(--pos-cell-size))`
										: undefined}
									style:gap={`var(--pos-cell-gap)`}
								>
									{#each layout.cells as cell}
										<span
											class={`pos-cell pos-cell--${cell.set}`}
											style:grid-row={cell.gridRow}
											style:grid-column={cell.gridColumn}
											data-word={cell.word}
											data-set={cell.set}
											role="presentation"
											aria-hidden="true"
										></span>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="pos-layout-row pos-layout-row--headers">
					<div class="pos-label-cell" aria-hidden="true"></div>
					<div class="pos-chart-area pos-chart-area--headers">
						{#each POS_ORDER as pos}
							<div class="pos-header" style:width={`${blockWidths[pos]}px`}>{POS_HEADERS[pos]}</div>
						{/each}
					</div>
				</div>

				<div class="pos-layout-row pos-layout-row--top">
					<div class="pos-label-cell">{lists[1].label}</div>
					<div class="pos-chart-area pos-chart-area--top">
						{#each POS_ORDER as pos}
							<div class="pos-block" style:width={`${blockWidths[pos]}px`}>
								<div
									class="pos-grid"
									style:grid-template-columns={`repeat(${colsPerPos[pos]}, var(--pos-cell-size))`}
									style:gap={`var(--pos-cell-gap)`}
								>
									{#each lists[1].posCells[pos] as cell}
										<span
											class={`pos-cell pos-cell--${cell.set}`}
											data-word={cell.word}
											data-set={cell.set}
											role="presentation"
											aria-hidden="true"
										></span>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
		{#if interactive}
		<div
			class="pos-tooltip"
			class:is-visible={tooltipVisible}
			class:pos-tooltip--removed={tooltipSet === "removed"}
			class:pos-tooltip--added={tooltipSet === "added"}
			class:pos-tooltip--remained={tooltipSet === "remained"}
			style:left={`${tooltipX}px`}
			style:top={`${tooltipY}px`}
		>
			{tooltipWord}
		</div>
		{/if}
		{#if note}
			<p class="chart-note">{@html note}</p>
		{/if}
	{:else}
		<p class="pos-waffle-empty" role="alert">No POS data loaded.</p>
	{/if}
</div>

<style>
	/* NOTE TO SELF: FIX POS DIAGRAM!!!!!!!! this is a temporary bandaid for mobile so I can work on other things */
	:global(#posDiagram){
		overflow: hidden;
	}

	.pos-waffle {
		--pos-cell-size: 5px;
		--pos-cell-gap: 1px;
		--pos-color-remained: #d7d1bc;
		--pos-color-removed: #fbc576;
		--pos-color-added: #f6b6e7;
		width: 100%;
		max-width: var(--max-prose-width);
		margin: 0 auto;
	}

	.pos-waffle-inner {
		--pos-label-width: 120px;
		--pos-rows-gap: 20px;
		--pos-gap: 12px;
		width: 100%;
	}

	.pos-layout-row {
		position: relative;
		padding-left: 0;
	}

	.pos-layout-row--bottom {
		align-items: flex-end;
	}

	.pos-layout-row--top {
		align-items: flex-start;
	}

	.pos-layout-row--headers {
		padding: calc(var(--pos-rows-gap) / 2) 0;
		align-items: center;
	}

	.pos-label-cell {
		width: var(--pos-label-width);
		position: absolute;
        top: -3px;
		right: calc(100% + 14px);
		text-align: right;
		font-family: var(--font-mono);
		font-size: 18px;
        line-height: 1;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-primary);
	}

	.pos-chart-area {
		width: 100%;
		display: flex;
		justify-content: space-between;
		gap: var(--pos-gap);
	}

	.pos-chart-area--bottom {
		align-items: flex-end;
	}

	.pos-chart-area--top {
		align-items: flex-start;
	}

	.pos-header {
        display: flex;
        justify-content: center;
		font-family: var(--font-mono);
		font-size: 14px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-secondary);
		text-align: center;
        white-space: nowrap;
	}

	.pos-grid {
		display: grid;
		align-content: start;
	}

	.pos-cell {
		width: var(--pos-cell-size);
		height: var(--pos-cell-size);
		display: block;
		cursor: default;
	}

	.pos-block {
		flex: 0 0 auto;
	}


	.pos-cell:hover {
		filter: brightness(0.85);
		transform: scale(2);
		transition: transform 0.25s ease;
	}

	.pos-waffle-inner--static .pos-cell {
		pointer-events: none;
	}

	.pos-waffle-inner--static .pos-cell:hover {
		filter: none;
		transform: none;
	}

	.pos-cell--remained {
		background: var(--pos-color-remained);
	}

	.pos-cell--removed {
		background: var(--pos-color-removed);
	}

	.pos-cell--added {
		background: var(--pos-color-added);
	}

	.pos-tooltip {
		position: fixed;
		z-index: 20;
		pointer-events: none;
		background: var(--color-bg);
		color: var(--color-primary);
		border: 1px solid #dbd4bc;
		border-radius: 2px;
		padding: 0.35rem 0.6rem;
		font-family: var(--font-sans);
		font-style: italic;
		text-transform: uppercase;
		letter-spacing: 3%;
		font-size: 1.25rem;
		line-height: 1.2;
		opacity: 0;
		transform: translateY(2px);
		transition: opacity 150ms ease, transform 150ms ease;
	}

	.pos-tooltip.is-visible {
		opacity: 1;
		transform: translateY(0);
	}

	.pos-tooltip--removed {
		color: var(--color-gsl);
        font-family: var(--font-serif);
	}

	.pos-tooltip--added {
		color: var(--color-ngsl);
	}

	.pos-tooltip--remained {
		color: var(--color-primary);
	}

	.pos-waffle-empty {
		text-align: center;
		font-size: 0.95rem;
		color: var(--color-secondary);
	}


	@media (max-width: 900px) {
		.pos-waffle-inner {
			--pos-label-width: 92px;
			--pos-gap: 8px;
		}

		.pos-label-cell {
			font-size: 1rem;
			line-height: 1.2;
		}
	}

	@media (max-width: 768px) {
		.pos-layout-row {
			display: flex;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.pos-label-cell {
			position: static;
			max-width: 5ch;
			text-align: left;
		}

		.pos-chart-area {
			flex: 1;
			min-width: 0;
		}

		.pos-header{
			font-size: 12px;
		}
	}

</style>
