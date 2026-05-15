<script>
	import { getContext } from "svelte";

	const getData = getContext("data");

	const rows = $derived(getData?.()?.posRows ?? []);
	const shuffledAdverbs = $derived.by(() =>
		rows
			.filter((row) => row?.set === "added" && row?.pos === "adverb")
			.map((row) => String(row.word ?? "").trim())
			.filter(Boolean)
			.sort(() => Math.random() - 0.5)
	);
</script>

<div class="pos-adverbs">
	{#if shuffledAdverbs.length}
		<div class="pos-adverbs-grid" aria-label="Added adverbs">
			{#each shuffledAdverbs as word}
				<span class="pos-adverbs-word">{word}</span>
			{/each}
		</div>
	{:else}
		<p class="pos-adverbs-empty" role="alert">No added adverbs found in `pos.csv`.</p>
	{/if}
</div>

<style>
	.pos-adverbs {
		width: 100%;
		/* max-width: min(100%, var(--max-chart-width)); */
		margin: 3rem auto 4rem auto;
        padding: 0 2rem;
	}

	.pos-adverbs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
		gap: 2rem 1rem;
		align-items: start;
	}

	.pos-adverbs-word {
		display: block;
		font-family: var(--font-sans);
		font-style: italic;
        text-transform: uppercase;
        letter-spacing: 3%;
		font-size: 2rem;
		line-height: 1.1;
		color: var(--color-ngsl);
		white-space: nowrap;
	}

	.pos-adverbs-empty {
		margin: 0;
		text-align: center;
		font-size: 0.95rem;
		color: var(--color-secondary);
	}

	@media (max-width: 700px) {
		.pos-adverbs-grid {
			grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
			gap: 0.35rem 0.75rem;
		}

		.pos-adverbs-word {
			font-size: 1.05rem;
		}
	}
</style>
