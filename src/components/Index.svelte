<script>
	import { getContext } from "svelte";
	import Footer from "$components/Footer.svelte";
	import IntroScreen from "$components/IntroScreen.svelte";

	const copy = getContext("copy");
	// console.log(copy);
	// const data = getContext("data");

	const components = { IntroScreen };
</script>

<article class="story">
	{#each copy.body as part}
		<section id={part.section} class="story-section">
			{#each part.content as block, blockIndex}
				{#if block.type === "IntroScreen"}
					<IntroScreen {...block.value} screenIndex={blockIndex} />
				{:else if block.type === "text"}
					<p>{@html block.value}</p>
				{:else if block.type === "h1" || block.type === "h2"}
					<svelte:element this={block.type} class="story-heading">{@html block.value}</svelte:element>
				{/if}
			{/each}
		</section>
	{/each}
</article>

<svelte:boundary onerror={(e) => console.error(e)}>
	<!-- <Footer recirc={true} /> -->
</svelte:boundary>
