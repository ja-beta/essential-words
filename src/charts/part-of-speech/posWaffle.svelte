<script>
	import { getContext } from "svelte";

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
	const COLS_PER_POS = {
		noun: 40,
		adjective: 10,
		adverb: 10,
		verb: 10,
		other: 10
	};
	const CELL_SIZE = 6;
	const CELL_GAP = 1;

	function normalizePos(v) {
		const p = String(v ?? "").trim().toLowerCase();
		return POS_ORDER.includes(p) ? p : "other";
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
	const blockWidths = $derived.by(() => {
		const widths = {};
		for (const pos of POS_ORDER) {
			widths[pos] = COLS_PER_POS[pos] * (CELL_SIZE + CELL_GAP) - CELL_GAP;
		}
		return widths;
	});

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

	function moveTooltip(event) {
		if (!tooltipVisible) return;
		updateTooltipPosition(event);
	}

	function hideTooltip() {
		tooltipVisible = false;
	}
</script>

<div class="pos-waffle" style:--pos-cell-size={`${CELL_SIZE}px`} style:--pos-cell-gap={`${CELL_GAP}px`}>
	{#if lists[0]?.posCells && lists[1]?.posCells}
		<div class="pos-waffle-inner">
				<div class="pos-layout-row pos-layout-row--bottom">
					<div class="pos-label-cell">{lists[0].label}</div>
					<div class="pos-chart-area pos-chart-area--bottom">
						{#each POS_ORDER as pos}
							<div class="pos-block" style:width={`${blockWidths[pos]}px`}>
								<div
									class="pos-grid"
									style:grid-template-columns={`repeat(${COLS_PER_POS[pos]}, var(--pos-cell-size))`}
									style:gap={`var(--pos-cell-gap)`}
								>
									{#each lists[0].posCells[pos] as cell}
										<span
											class={`pos-cell pos-cell--${cell.set}`}
											role="presentation"
											aria-hidden="true"
											onmouseenter={(event) => showTooltip(cell.word, cell.set, event)}
											onmousemove={moveTooltip}
											onmouseleave={hideTooltip}
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
									style:grid-template-columns={`repeat(${COLS_PER_POS[pos]}, var(--pos-cell-size))`}
									style:gap={`var(--pos-cell-gap)`}
								>
									{#each lists[1].posCells[pos] as cell}
										<span
											class={`pos-cell pos-cell--${cell.set}`}
											role="presentation"
											aria-hidden="true"
											onmouseenter={(event) => showTooltip(cell.word, cell.set, event)}
											onmousemove={moveTooltip}
											onmouseleave={hideTooltip}
										></span>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
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
		{#if note}
			<p class="chart-note">{@html note}</p>
		{/if}
	{:else}
		<p class="pos-waffle-empty" role="alert">No POS data loaded.</p>
	{/if}
</div>

<style>
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

	@media (max-width: 900px) {
		.pos-waffle-inner {
			--pos-label-width: 92px;
			--pos-gap: 8px;
		}

		.pos-label-cell {
			font-size: 0.74rem;
		}
	}

	.pos-cell:hover {
		/* outline: 1px solid #222;
		outline-offset: 0; */
        /* background: var(--color-secondary); */
        filter: brightness(0.85);
        transform: scale(2);
        transition: transform 0.25s ease;
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
</style>
