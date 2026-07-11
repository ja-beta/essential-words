<script>
	import { getContext, onDestroy, onMount } from "svelte";
	import { observeChartVisibility } from "$utils/chartVisibility.js";

	let { note = "", headingId = undefined, subheadId = undefined } = $props();

	const getData = getContext("data");
	const rows = $derived(getData?.()?.posRows ?? []);

	const mobileScreen = 530;

	const POS_ORDER = ["noun", "adjective", "adverb", "verb", "other"];
	const POS_HEADERS = {
		noun: "nouns",
		adjective: "adjectives",
		adverb: "adverbs",
		verb: "verbs",
		other: "other"
	};

	const BREAKPOINTS = [
		{
			maxWidth: mobileScreen,
			layout: "butterfly",
			cellSize: 4,
			cellGap: 0,
			interactive: false
		},
		{
			maxWidth: 580,
			layout: "stacked",
			cellSize: 4,
			cellGap: 0,
			interactive: false,
			cols: { noun: 24, adjective: 16, adverb: 16, verb: 16, other: 16 }
		},
		{
			maxWidth: 768,
			layout: "stacked",
			cellSize: 4,
			cellGap: 0,
			interactive: false,
			cols: { noun: 32, adjective: 16, adverb: 16, verb: 16, other: 16 }
		},
		{
			maxWidth: Infinity,
			layout: "desktop",
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
		if (count === 0) return { cells: [], rows: 0, cols: 0 };
		const rows = Math.ceil(count / cols);
		return {
			rows,
			cols,
			cells: ordered.map((cell, i) => ({
				...cell,
				gridRow: rows - Math.floor(i / cols),
				gridColumn: (i % cols) + 1
			}))
		};
	}

	function orderCellsOuterLast(cells, outerSet = null) {
		if (!outerSet) return cells;
		return [
			...cells.filter((cell) => cell.set !== outerSet),
			...cells.filter((cell) => cell.set === outerSet)
		];
	}


	function layoutCellsWrapped(cells, maxCols, side, outerSet = null) {
		const ordered = orderCellsOuterLast(cells, outerSet);
		const count = ordered.length;
		if (count === 0 || maxCols < 1) return { cells: [], rows: 0, cols: 0 };

		const cols = maxCols;
		const rows = Math.ceil(count / cols);

		return {
			rows,
			cols,
			cells: ordered.map((cell, i) => {
				const row = Math.floor(i / cols) + 1;
				const indexInRow = i % cols;
				const gridColumn = side === "left" ? cols - indexInRow : indexInRow + 1;
				return { ...cell, gridRow: row, gridColumn };
			})
		};
	}

	function maxColsForWidth(widthPx, size, gap) {
		if (widthPx <= 0) return 1;
		return Math.max(1, Math.floor((widthPx + gap) / (size + gap)));
	}

	function estimateButterflyColWidth(viewportW) {
		if (viewportW <= 0) return 120;
		const margin = viewportW <= 480 ? 16 : 32;
		const rail = viewportW <= 720 ? 24 : 40;
		const center = 72;
		const gap = 12;
		const content = viewportW - rail - margin * 2;
		return Math.max(40, (content - center - gap) / 2);
	}

	function blockWidth(cols) {
		if (!cols) return 0;
		return cols * (cellSize + cellGap) - cellGap;
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
	const list1953 = $derived(lists[0]);
	const list2023 = $derived(lists[1]);
	let screenWidth = $state(0);
	const activeBreakpoint = $derived(breakpointForScreenWidth(screenWidth));
	const layoutMode = $derived(activeBreakpoint.layout ?? "desktop");
	const isButterflyLayout = $derived(layoutMode === "butterfly");
	const colsPerPos = $derived(activeBreakpoint.cols ?? {});
	const cellSize = $derived(activeBreakpoint.cellSize);
	const cellGap = $derived(activeBreakpoint.cellGap);
	const interactive = $derived(activeBreakpoint.interactive);
	let butterflyMount = $state(null);
	let butterflyColWidth = $state(0);
	let butterflyResizeObserver;
	const butterflyMaxCols = $derived(
		maxColsForWidth(
			butterflyColWidth || estimateButterflyColWidth(screenWidth),
			cellSize,
			cellGap
		)
	);
	const blockWidths = $derived.by(() => {
		const widths = {};
		for (const pos of POS_ORDER) {
			widths[pos] = blockWidth(colsPerPos[pos]);
		}
		return widths;
	});
	const butterflyLayouts = $derived.by(() => {
		const maxCols = butterflyMaxCols;
		const layouts = {};
		for (const pos of POS_ORDER) {
			const layout1953 = layoutCellsWrapped(list1953.posCells[pos], maxCols, "left", "removed");
			const layout2023 = layoutCellsWrapped(list2023.posCells[pos], maxCols, "right", "added");
			layouts[pos] = { list1953: layout1953, list2023: layout2023 };
		}
		return layouts;
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

	function measureButterflyColWidth() {
		const side = butterflyMount?.querySelector(".pos-butterfly-side--1953");
		butterflyColWidth = side?.clientWidth ?? 0;
	}

	$effect(() => {
		if (!isButterflyLayout || !butterflyMount) return;
		measureButterflyColWidth();
		butterflyResizeObserver?.disconnect();
		butterflyResizeObserver = new ResizeObserver(measureButterflyColWidth);
		butterflyResizeObserver.observe(butterflyMount);
		return () => butterflyResizeObserver?.disconnect();
	});

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
	role={headingId ? "region" : undefined}
	aria-labelledby={headingId}
	aria-describedby={subheadId}
>
	{#if lists[0]?.posCells && lists[1]?.posCells}
		{#if gridMounted}
		<!-- Word tooltips are decorative desktop-only; cells are aria-hidden. -->
		<!-- svelte-ignore a11y_mouse_events_have_key_events -->
		<div
			class="pos-waffle-inner"
			class:pos-waffle-inner--static={!interactive}
			class:pos-waffle-inner--butterfly={isButterflyLayout}
			role="group"
			aria-labelledby={headingId}
			aria-label={headingId ? undefined : "Parts of speech waffle chart"}
			aria-describedby={subheadId}
			onmouseover={interactive ? handleCellOver : undefined}
			onmouseout={interactive ? handleCellOut : undefined}
			onmousemove={interactive ? handleCellMove : undefined}
			onmouseleave={interactive ? handleWaffleLeave : undefined}
		>
			{#if isButterflyLayout}
				<div class="pos-butterfly" bind:this={butterflyMount}>
					<div class="pos-butterfly-list-row">
						<div class="pos-butterfly-list-label pos-butterfly-list-label--1953">{list1953.label}</div>
						<div class="pos-butterfly-list-label-spacer" aria-hidden="true"></div>
						<div class="pos-butterfly-list-label pos-butterfly-list-label--2023">{list2023.label}</div>
					</div>

					{#each POS_ORDER as pos}
						{@const layout = butterflyLayouts[pos]}
						<div class="pos-butterfly-row">
							<div class="pos-butterfly-side pos-butterfly-side--1953">
								<div class="pos-block pos-block--butterfly">
									<div
										class="pos-grid pos-grid--butterfly"
										style:--pos-grid-cols={layout.list1953.cols}
										style:grid-template-rows={`repeat(${layout.list1953.rows}, var(--pos-cell-size))`}
										style:gap={`var(--pos-cell-gap)`}
									>
										{#each layout.list1953.cells as cell (cell.word + cell.set)}
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
							</div>

							<div class="pos-butterfly-pos-header">{POS_HEADERS[pos]}</div>

							<div class="pos-butterfly-side pos-butterfly-side--2023">
								<div class="pos-block pos-block--butterfly">
									<div
										class="pos-grid pos-grid--butterfly"
										style:--pos-grid-cols={layout.list2023.cols}
										style:grid-template-rows={`repeat(${layout.list2023.rows}, var(--pos-cell-size))`}
										style:gap={`var(--pos-cell-gap)`}
									>
										{#each layout.list2023.cells as cell (cell.word + cell.set)}
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
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="pos-layout-row pos-layout-row--top">
					<div class="pos-label-cell">{list1953.label}</div>
					<div class="pos-chart-area pos-chart-area--top">
						{#each POS_ORDER as pos}
							{@const layout = layoutCellsBottomUp(list1953.posCells[pos], colsPerPos[pos], "removed")}
							<div class="pos-block" style:width={`${blockWidths[pos]}px`}>
								<div
									class="pos-grid"
									style:grid-template-columns={`repeat(${colsPerPos[pos]}, var(--pos-cell-size))`}
									style:grid-template-rows={layout.rows
										? `repeat(${layout.rows}, var(--pos-cell-size))`
										: undefined}
									style:gap={`var(--pos-cell-gap)`}
								>
									{#each layout.cells as cell (cell.word + cell.set)}
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
					<div class="pos-label-cell pos-label-cell--spacer" aria-hidden="true"></div>
					<div class="pos-chart-area pos-chart-area--headers">
						{#each POS_ORDER as pos}
							<div class="pos-header" style:width={`${blockWidths[pos]}px`}>{POS_HEADERS[pos]}</div>
						{/each}
					</div>
				</div>

				<div class="pos-layout-row pos-layout-row--bottom">
					<div class="pos-label-cell">{list2023.label}</div>
					<div class="pos-chart-area pos-chart-area--bottom">
						{#each POS_ORDER as pos}
							<div class="pos-block" style:width={`${blockWidths[pos]}px`}>
								<div
									class="pos-grid"
									style:grid-template-columns={`repeat(${colsPerPos[pos]}, var(--pos-cell-size))`}
									style:gap={`var(--pos-cell-gap)`}
								>
									{#each list2023.posCells[pos] as cell (cell.word + cell.set)}
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
			{/if}

			<div class="pos-legend-container" aria-label="Parts of speech color legend">
					<div class="pos-legend-item">
						<div class="pos-legend-item-color" style="background: var(--pos-color-remained);"></div>
						<div class="pos-legend-item-label">in both lists</div>
					</div>
					<div class="pos-legend-item">
						<div class="pos-legend-item-color" style="background: var(--pos-color-removed);"></div>
						<div class="pos-legend-item-label">Removed from the 1953 list</div>
					</div>
					<div class="pos-legend-item">
						<div class="pos-legend-item-color" style="background: var(--pos-color-added);"></div>
						<div class="pos-legend-item-label">Added to the 2023 list</div>
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
			aria-hidden="true"
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
	:global(#posDiagram) {
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
		position: relative;
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

	.pos-layout-row--top .pos-label-cell{
		top: auto;
		bottom: 0%;
	}

	.pos-layout-row--headers .pos-label-cell--spacer {
		visibility: hidden;
	}

	.pos-butterfly {
		--pos-butterfly-center-gap: 0.5rem;
		--pos-butterfly-row-gap: 1rem;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		column-gap: var(--pos-butterfly-center-gap);
		row-gap: var(--pos-butterfly-row-gap);
		align-items: start;
	}

	.pos-butterfly-list-row,
	.pos-butterfly-row {
		display: contents;
	}

	.pos-butterfly-side {
		min-width: 0;
		width: 100%;
		align-self: start;
	}

	.pos-butterfly-side--1953 {
		grid-column: 1;
		justify-self: end;
	}

	.pos-butterfly-side--2023 {
		grid-column: 3;
		justify-self: start;
	}

	.pos-block--butterfly {
		width: 100%;
		max-width: 100%;
	}

	.pos-grid--butterfly {
		width: 100%;
		grid-template-columns: repeat(var(--pos-grid-cols), var(--pos-cell-size));
	}

	.pos-butterfly-list-label {
		font-family: var(--font-mono);
		font-size: 15px;
		line-height: 1.1;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 2%;
		color: var(--color-primary);
	}

	.pos-butterfly-list-label--1953 {
		grid-column: 1;
	}

	.pos-butterfly-list-label-spacer {
		grid-column: 2;
	}

	.pos-butterfly-list-label--2023 {
		grid-column: 3;
		justify-self: end;
		text-align: right;
	}

	.pos-butterfly-pos-header {
		grid-column: 2;
		justify-self: center;
		align-self: center;
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 2%;
		color: var(--color-secondary);
		text-align: center;
		white-space: nowrap;
	}

	.pos-waffle-inner--butterfly .pos-legend-container {
		position: static;
		border: none;
		padding: 0;
		margin-top: 0;
		/* border-bottom: 1px solid var(--color-border);
		padding-bottom: 0.5rem;  */
	}

	.pos-chart-area {
		width: 100%;
		display: flex;
		justify-content: space-between;
		gap: var(--pos-gap);
	}

	.pos-chart-area--top {
		align-items: flex-end;
	}

	.pos-chart-area--bottom {
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
		font-size: calc(1.25rem * var(--highlight-sans-scale));
	}

	.pos-tooltip--remained {
		color: var(--color-primary);
		font-size: calc(1.25rem * var(--highlight-sans-scale));
	}

	.pos-waffle-empty {
		text-align: center;
		font-size: 0.95rem;
		color: var(--color-secondary);
	}

	.pos-legend-container {
		position: absolute;
		top: 0;
		right: 0;
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 2%;
		color: var(--color-secondary);
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 0.5rem;
	}

	.pos-legend-item{
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.pos-legend-item-color{
		width: 6px;
		height: 6px;
	}


	@media (max-width: 920px) {
		.pos-chart-area {
			flex: 1;
			min-width: 0;
		}

		.pos-header {
			font-size: 12px;
		}

		.pos-waffle-inner {
			--pos-label-width: 92px;
			--pos-gap: 8px;
		}

		.pos-layout-row {
			display: flex;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.pos-label-cell {
			position: static;
			flex: 0 0 var(--pos-label-width);
			font-size: 1rem;
			line-height: 1.2;
			max-width: 5ch;
			text-align: left;
		}

		.pos-layout-row--headers .pos-label-cell--spacer {
			visibility: visible;
		}

		.pos-layout-row--top {
			align-items: flex-end;
		}
	}

	@media (max-width: 530px){

		.pos-waffle .chart-note{
			margin-top: 2.5rem;
		}

		.pos-waffle-inner{
			display: flex;
			flex-direction: column-reverse;
			gap: 2rem;
		}
	}


</style>
