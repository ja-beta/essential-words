<script>
	import { getContext } from "svelte";

	let { visible = false } = $props();

	const getData = getContext("data");

	let isOpen = $state(false);

	const explorerWordLists = $derived(getData?.()?.explorerWordLists ?? null);
	const list1953 = $derived(explorerWordLists?.list1953 ?? []);
	const list2023 = $derived(explorerWordLists?.list2023 ?? []);

	$effect(() => {
		if (!visible) isOpen = false;
	});

	function toggleOpen() {
		isOpen = !isOpen;
	}
</script>

<aside
	class="explorer"
	class:is-open={isOpen}
	class:is-visible={visible}
	aria-label="Word list explorer"
	inert={!visible}
>
	<div class="explorer-drawer">
		<button
			type="button"
			class="explorer-rail"
			onclick={toggleOpen}
			aria-expanded={isOpen}
			aria-controls="explorer-panel"
			aria-label={isOpen ? "Close word lists" : "Open word lists"}
		>
			<span class="explorer-btn" aria-hidden="true">
				<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<line x1="10" y1="4" x2="10" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					<line x1="4" y1="10" x2="16" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			</span>

			<span class="explorer-tab-label">word lists</span>
		</button>

		<div
			class="explorer-panel"
			id="explorer-panel"
			inert={!isOpen}
		>
			<div class="explorer-columns">
				<div class="explorer-column">
					<div class="explorer-column-header">
						<h3 class="exp-col-name">1953 list</h3>
						<div class="exp-col-desc-container">
							<div class="exp-col-desc-icon" aria-hidden="true">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                                    <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" stroke-width="2" />
                                </svg>
                            </div>
							<p class="exp-col-desc removed">removed words</p>
						</div>
					</div>
					<ul class="exp-word-list">
						{#each list1953 as word (word.text + word.status)}
							<li
								class="exp-word"
								class:exp-word--removed={word.status === "removed"}
								class:exp-word--remained={word.status === "remained"}
							>
								{word.text}
							</li>
						{/each}
					</ul>
				</div>

				<div class="explorer-column">
					<div class="explorer-column-header">
						<h3 class="exp-col-name">2023 list</h3>
						<div class="exp-col-desc-container">
							<div class="exp-col-desc-icon" aria-hidden="true">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                                    <line x1="7" y1="3" x2="7" y2="11" stroke="currentColor" stroke-width="2" />
                                    <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" stroke-width="2" />
                                </svg>
                            </div>
							<p class="exp-col-desc added">added words</p>
						</div>
					</div>
					<ul class="exp-word-list">
						{#each list2023 as word (word.text + word.status)}
							<li
								class="exp-word"
								class:exp-word--added={word.status === "added"}
								class:exp-word--remained={word.status === "remained"}
							>
								{word.text}
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>
</aside>

<style>
	.explorer {
		--explorer-rail-width: 2.5rem;
		--explorer-panel-width: min(320px, calc(100vw - var(--explorer-rail-width)));
		--explorer-transition-duration: 360ms;
		--explorer-transition-ease: cubic-bezier(0.4, 0, 0.2, 1);

		position: fixed;
		top: 0;
		right: 0;
		height: 100%;
		width: var(--explorer-rail-width);
		overflow: hidden;
		z-index: var(--z-modal);
		border-left: 1px solid var(--color-border);
		box-shadow: -6px 0 16px 0 rgba(173, 161, 148, 0.17);
		transform: translateX(100%);
		pointer-events: none;
		visibility: hidden;
		transition:
			transform var(--explorer-transition-duration) var(--explorer-transition-ease),
			width var(--explorer-transition-duration) var(--explorer-transition-ease),
			visibility 0s linear var(--explorer-transition-duration);
	}

	.explorer.is-visible {
		transform: translateX(0);
		pointer-events: auto;
		visibility: visible;
		transition:
			transform var(--explorer-transition-duration) var(--explorer-transition-ease),
			width var(--explorer-transition-duration) var(--explorer-transition-ease),
			visibility 0s linear 0s;
	}

	.explorer.is-open {
		width: calc(var(--explorer-rail-width) + var(--explorer-panel-width));
	}

	.explorer-drawer {
		display: flex;
		flex-direction: row;
		align-items: stretch;
		width: calc(var(--explorer-rail-width) + var(--explorer-panel-width));
		height: 100%;
		pointer-events: auto;
	}

	.explorer-rail {
		flex: 0 0 var(--explorer-rail-width);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		width: 100%;
		height: 100%;
		padding-block: 1rem;
		padding-inline: 0;
		background-color: var(--color-bg);
		border: none;
		border-right: 1px solid var(--color-border);
        border-radius: 0;
		color: inherit;
		cursor: pointer;
	}

    .explorer-btn{
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 1.25rem;
		height: 1.25rem;
        color: var(--color-secondary);
        transform: rotate(0deg);
        transform-origin: center;
        transition: transform 0.3s ease-in-out;
    }

	.explorer-btn svg {
		display: block;
		width: 100%;
		height: 100%;
	}

    .explorer.is-open .explorer-btn{
        transform: rotate(45deg);
        transition: transform 0.3s ease-in-out;
    }

	.explorer-tab-label {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		writing-mode: vertical-rl;
		text-orientation: mixed;
		transform: rotate(180deg);
		font-family: var(--font-mono);
		font-size: 1rem;
		font-weight: 500;
		letter-spacing: 4%;
		text-transform: uppercase;
		white-space: nowrap;
        color: var(--color-secondary);
        transition: all 0.2s ease-in-out;

	}

	.explorer-panel {
		flex: 0 0 var(--explorer-panel-width);
		width: var(--explorer-panel-width);
		overflow: hidden;
		background-color: var(--color-bg);
	}

    .explorer-rail:hover .explorer-tab-label{
        color: var(--color-primary);
    }

	.explorer-columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		height: 100%;
	}

	.explorer-column {
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
	}

	.explorer-column + .explorer-column {
		border-left: 1px solid var(--color-border);
	}

	.explorer-column-header {
		flex: 0 0 auto;
		padding: 0.5rem;
        font-family: var(--font-mono);
        text-transform: uppercase;
        letter-spacing: 2%;
        border-bottom: 1px solid var(--color-border);

	}

    .exp-col-name{
        margin: 0.5rem 0 0 0;
        font-size: 1rem;
    }

    .exp-col-desc{
        margin: 0;
        font-size: 0.875rem;
    }

    .exp-col-desc-container{
        display: flex;
        max-width: 100%;
        align-items: center;
        gap: 0.25rem;
    }

    .exp-col-desc-container:has(.exp-col-desc.added) {
        color: var(--color-ngsl);
    }

    .exp-col-desc-container:has(.exp-col-desc.removed) {
        color: var(--color-gsl);
    }

	.exp-word-list {
		flex: 1 1 auto;
		margin: 0;
		padding:1rem;
		overflow-y: auto;
		list-style: none;
        direction: rtl;
        scrollbar-width: thin;
		scrollbar-color: var(--color-border) transparent;
	}

	.exp-word {
        direction: ltr;
		font-family: var(--font-mono);
		font-size: 15px;
		line-height: 1.2;
        hyphens: auto;
        font-weight: 500;
        margin-bottom: 1.5rem;
	}

    .exp-word--removed{
        color: var(--color-gsl);
    }

    .exp-word--added{
        color: var(--color-ngsl);
    }

    @media (max-width: 720px){
        .explorer {
            --explorer-rail-width: 1.5rem;
        }

        .explorer-rail .explorer-tab-label{
            font-size: 13px;
        }
    }

</style>
