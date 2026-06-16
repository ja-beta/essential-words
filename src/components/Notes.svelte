<script>
	let { blocks = [] } = $props();

	const hasText = (value) => typeof value === "string" && value.trim().length > 0;
	const notesBlocks = $derived(blocks.filter((block) => block?.type === "notes"));
</script>

{#if notesBlocks.length}
	<section class="story-section story-section--notes" id="notes">
		{#each notesBlocks as block}
			<div class="content-container story-prose story-notes">
				{#if hasText(block.title)}
					<h2 class="story-notes-title">{block.title}</h2>
				{/if}

				{#if Array.isArray(block.intro) && block.intro.length}
					<div class="story-notes-intro">
						{#each block.intro as item}
							{#if hasText(item?.html)}
								<div class="story-notes-intro-item">{@html item.html}</div>
							{/if}
						{/each}
					</div>
				{/if}

				{#if Array.isArray(block.drawer) && block.drawer.length}
					<div class="story-notes-drawers">
						{#each block.drawer as drawer}
							{#if hasText(drawer?.question) && hasText(drawer?.html)}
								<details class="story-notes-drawer" open={drawer.question === "Footnotes"}>
									<summary class="story-notes-drawer-summary">{drawer.question}</summary>
									<div class="story-notes-drawer-body">{@html drawer.html}</div>
								</details>
							{/if}
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</section>
{/if}

<style>
	.story-section--notes {
		margin-top: 7rem;
		padding-top: 3.5rem;
		padding-bottom: 100px;
		background-color: var(--color-bg-notes);
	}

	.story-notes-title {
		margin-top: 0;
		border-top: 1px solid var(--color-secondary);
		padding-top: 1.5rem;
		font-size: 2rem;
		font-family: var(--font-sans);
		font-weight: 400;
	}

	.story-notes-intro {
		margin-bottom: 1.5rem;
	}

	.story-notes-intro-item :global(p:last-child) {
		margin-bottom: 0;
	}

	.story-notes-drawers {
		display: flex;
		flex-direction: column;
	}

	.story-notes-drawer {
		border-top: 1px solid var(--color-secondary);
	}

	.story-notes-drawer-summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 0;
		font-family: var(--font-sans);
		font-size: 1.25rem;
		font-weight: 500;
		cursor: pointer;
		list-style: none;
	}

	.story-notes-drawer-summary::-webkit-details-marker {
		display: none;
	}

	.story-notes-drawer-summary::after {
		content: "+";
		flex-shrink: 0;
		font-size: 1.25rem;
		line-height: 1;
		color: var(--color-secondary);
	}

	.story-notes-drawer[open] .story-notes-drawer-summary::after {
		content: "−";
	}

	.story-notes-drawer-body {
		padding-bottom: 1.25rem;
	}

	.story-notes-drawer-body :global(p:first-child) {
  		margin-top: 0;
	}

	.story-notes-intro :global(p),
	.story-notes-intro :global(li),
	.story-notes-drawer-body :global(p),
	.story-notes-drawer-body :global(li) {
		font-size: 1rem;
		font-family: var(--font-sans);
	}

	.story-notes-drawer-body :global(li) {
		margin-bottom: 0.75rem;
	}

	.story-notes-drawer-body :global(li:last-child) {
		margin-bottom: 0;
	}

	.story-notes-drawer-body :global(p:last-child) {
		margin-bottom: 0;
	}
</style>