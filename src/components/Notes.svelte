<script>
	let { blocks = [] } = $props();

	const hasText = (value) => typeof value === "string" && value.trim().length > 0;
	const proseBlocks = $derived(
		blocks.filter((block) => block?.type === "prose" && hasText(block.html))
	);
</script>

{#if proseBlocks.length}
	<section class="story-section story-section--notes" id="notes">
		{#each proseBlocks as block}
			<div class="content-container story-prose story-notes">
				{#if hasText(block.title)}
					<h2 class="story-notes-title">{block.title}</h2>
				{/if}
				<div class="story-notes-body">
					{@html block.html}
				</div>
			</div>
		{/each}
	</section>
{/if}

<style>

	.story-section--notes{
		margin-top: 7rem;
		padding: 3.5rem;
		background-color: var(--color-bg-notes);

	}


	.story-notes-title{
		margin-top: 0;
		border-top: 1px solid var(--color-secondary);
		padding-top: 1.5rem;
		font-size: 2rem;
		font-family: var(--font-sans);
		font-weight: 400;
	}


	.story-notes-body :global(p), .story-notes-body :global(li) {
		font-size: 1rem;
		font-family: var(--font-sans);
	}
</style>