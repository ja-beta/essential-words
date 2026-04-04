<script>
    import { getContext } from "svelte";
    import { pickWordsForScreen, placeWordsInGrid } from "$utils/introWords.js";

    let { p1="", p2="", p3="", screenIndex = 0 } = $props();

    const data = getContext("data");
    const pools = data?.introWordPools;

    const words = $derived(
        pools ? pickWordsForScreen(pools, screenIndex, 40) : []
    );

    const grid = $derived(placeWordsInGrid(words, screenIndex, 12, 12));
</script>

<div class="intro-screen">
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