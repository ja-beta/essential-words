<script>
	let {
		cells = [],
		baseCells = null,
		cols = 4,
		rows = 5,
		writeReveal = false,
		writePlan = new Map(),
		revealRemoved = false,
		focusDrop = false,
		focusAdd = false,
		focusRemain = false,
		prefersReducedMotion = false,
		variant = "flow",
		transform = "",
		class: className = ""
	} = $props();
</script>

<div
	class="intro-word-grid intro-word-grid--{variant} {className}"
	aria-hidden="true"
	class:is-reduced-motion={prefersReducedMotion}
	class:is-write-reveal={writeReveal}
	class:is-focus-drop={focusDrop}
	class:is-focus-add={focusAdd}
	class:is-focus-remain={focusRemain}
	class:is-reveal-removed={revealRemoved}
	style:grid-template-columns="repeat({cols}, minmax(0, 1fr))"
	style:grid-template-rows={variant === "stage"
		? `repeat(${rows}, minmax(0, 1fr))`
		: `repeat(${rows}, minmax(0, auto))`}
	style:transform={transform || undefined}
>
	{#each cells as cell, i}
		<div class="intro-word-cell">
			{#if cell}
				{@const baseCell = baseCells?.[i]}
				{@const isExtraRemoved = baseCells && !baseCell && cell?.set === "removed"}
				{@const plan = writePlan.get(i)}
				<span class="word word--{cell?.set ?? ''}" class:word--removed-extra={isExtraRemoved}>
					<span
						class="word-write"
						class:word-write--static={isExtraRemoved || !plan}
						style:--write-order={plan?.order ?? 0}
						style:--write-ch={plan?.ch ?? 0}
						style:--write-steps={plan?.steps ?? 0}
					>
						{cell.text}
					</span>
				</span>
			{/if}
		</div>
	{/each}
</div>

<style>
	.intro-word-grid {
		display: grid;
		width: 100%;
		pointer-events: none;
	}

	.intro-word-grid--stage {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: calc(var(--intro-bg-total-vh) * 1vh);
		margin: 0 2rem;
		will-change: transform;
	}

	.intro-word-grid--flow {
		grid-auto-rows: minmax(1.35rem, auto);
	}

	.intro-word-grid--mobile-sticky {
		flex: 0 0 auto;
		max-height: 26vh;
		grid-auto-rows: minmax(0, 1fr);
	}

	.intro-word-grid--flow, 
	.intro-word-grid--mobile-sticky {
		gap: 1rem;
	}

	.intro-word-cell {
		display: flex;
		align-items: center;
		justify-content: start;
		min-width: 0;
		min-height: 0;
		/* overflow: hidden; */
	}

	.word {
		font-family: var(--font-sans);
		font-style: italic;
		font-size: calc(1rem * var(--highlight-sans-scale));
		text-transform: uppercase;
		letter-spacing: 3%;
		color: var(--color-secondary);
		white-space: nowrap;
		/* opacity: 0.85; */
		padding: 0 0.35rem;
		background-repeat: no-repeat;
		background-size: 0% var(--intro-highlight-sans);
		background-position: 0 var(--intro-grid-highlight-pos-sans);
		box-decoration-break: clone;
		transition:
			background-size var(--intro-highlight-fade-ms) ease,
			color var(--intro-highlight-fade-ms) ease,
			opacity var(--intro-highlight-fade-ms) ease;
	}

	.word--removed {
		font-family: var(--font-serif);
		font-size: var(--intro-grid-font-size-serif);
		background-position: 0 var(--intro-grid-highlight-pos-serif);
		position: relative;
		top: -0.163em;
	}

	.word-write {
		display: inline-block;
		clip-path: inset(0 100% 0 0);
	}

	.word-write--static {
		clip-path: none;
	}

	.intro-word-grid.is-write-reveal .word-write:not(.word-write--static) {
		clip-path: inset(0 0 0 0);
		transition: clip-path
			clamp(
				var(--intro-write-ms-min),
				calc(var(--intro-write-ms-min) + (var(--write-ch, 6) - 1) * var(--intro-write-ms-per-ch)),
				var(--intro-write-ms-max)
			)
			steps(var(--write-steps, 8), end);
		transition-delay: calc(var(--write-order, 0) * var(--intro-write-stagger-ms));
	}

	.intro-word-grid.is-reduced-motion .word-write {
		clip-path: none;
		transition: none;
	}

	.intro-word-grid.is-reduced-motion .word--removed-extra {
		transform: none;
		transition:
			background-size var(--intro-highlight-fade-ms) ease,
			color var(--intro-highlight-fade-ms) ease,
			opacity 0s,
			transform 0s;
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

	.intro-word-grid.is-reveal-removed .word--removed-extra {
		opacity: 0.75;
		transform: translateY(0);
	}

	.intro-word-grid.is-focus-drop .word--removed {
		background-image: linear-gradient(var(--color-gsl-highlight), var(--color-gsl-highlight));
		background-size: 100% var(--intro-highlight-serif);
		opacity: 1;
		color: var(--color-highlight-text);
	}

	.intro-word-grid.is-focus-add .word--added {
		background-image: linear-gradient(var(--color-ngsl-highlight), var(--color-ngsl-highlight));
		background-size: 100% var(--intro-highlight-sans);
		opacity: 1;
		color: var(--color-highlight-text);
	}

	.intro-word-grid.is-focus-remain .word--remained {
		background-image: linear-gradient(var(--color-remained-highlight), var(--color-remained-highlight));
		background-size: 100% var(--intro-highlight-sans);
		opacity: 1;
		color: var(--color-highlight-text);
	}

	@media (max-width: 768px) {
		.intro-word-grid--stage {
			margin: 0 1rem;
		}

		.word {
			font-size: 0.875rem;
			opacity: 1;
		}
	}
</style>
