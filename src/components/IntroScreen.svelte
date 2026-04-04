<script>
    import { getContext } from "svelte";
    import {
        INTRO_SCREEN_LONG,
        INTRO_SCREEN_SETS,
        pickWordsForScreen,
        placeWordsInGrid
    } from "$utils/introWords.js";

    let { p1="", p2="", p3="", screenIndex = 0 } = $props();
    const showOverlay = $derived(screenIndex === 3);
    const longForm = $derived(INTRO_SCREEN_LONG[screenIndex] ?? false);

    const data = getContext("data");
    const pools = data?.introWordPools;


    const allowedSets = $derived(
        INTRO_SCREEN_SETS[screenIndex] ?? INTRO_SCREEN_SETS.at(-1)
    );

    const words = $derived(
        pools ? pickWordsForScreen(pools, screenIndex, 40, allowedSets) : []
    );

    const grid = $derived(placeWordsInGrid(words, screenIndex, 12, 12));
</script>

<div class="intro-screen" class:intro-screen--long={longForm}>
    {#if pools}
        <div 
            class="intro-screen-grid"
            style:grid-template-columns="repeat({grid.cols}, minmax(0, 1fr))"
            style:grid-template-rows="repeat({grid.rows}, minmax(0, 1fr))"
            aria-hidden="true"
        >
            {#each grid.cells as cell}
                <div class="intro-screen-cell">
                    {#if cell}
                        <span class="word word--{cell.set}">{cell.text}</span>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
    
    {#if showOverlay}
    <div class="intro-screen-overlay" aria-hidden="true"></div>
    {/if}
    
    <div class="intro-screen-foreground">
        <p>{@html p1}</p>
        {#if p2}
            <p>{@html p2}</p>
        {/if}
        {#if p3}
            <p>{@html p3}</p>
        {/if}
    </div>
</div>

<style>

    .intro-screen-foreground {
        position: relative;
        z-index: 2;
        max-width: 600px;
        font-size: 32px;
    }

    .intro-screen-overlay {
        position: absolute;
        z-index: 1;
        inset: 0;
        pointer-events: none;
        background-color: var(--color-bg);
        opacity: 0.75;
    }
    .intro-screen {
        box-sizing: border-box;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 90%;
        overflow: hidden;
    }

    .intro-screen--long {
        height: auto;
        min-height: 100vh;
        overflow: hidden visible;
        justify-content: flex-start;
        padding-block: clamp(2rem, 8vh, 5rem);
    }

    .intro-screen-grid {
        display: grid;
        position: absolute;
        inset: 0;
        z-index: 0;
        overflow: hidden;
        pointer-events: none;
    }

    .intro-screen-cell {
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .intro-screen-cell .word {
        display: block;
        max-width: 100%;
        overflow: hidden;
        white-space: nowrap;
    }
</style>