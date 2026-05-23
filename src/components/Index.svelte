<script>
	import { getContext } from "svelte";
	import Footer from "$components/Footer.svelte";
	import IntroSequence from "$components/IntroSequence.svelte";
	import SemanticsViz from "../charts/semantics/SemanticsViz.svelte";
	import Scope from "../charts/scope/scope.svelte";
	import ConcretenessKde from "../charts/concreteness-kde/concretenessKde.svelte";
	import ConcretenessBands from "../charts/concreteness-bands/concretenessBands.svelte";
	import PosAdverbs from "../charts/part-of-speech/posAdverbs.svelte";
	import PosWaffle from "../charts/part-of-speech/posWaffle.svelte";
	import Title from "$components/Title.svelte";
	import Explorer from "$components/Explorer.svelte";

	const copy = getContext("copy");
	const storyBlocks = $derived(Array.isArray(copy?.story) ? copy.story : []);
	const introBlocks = $derived(storyBlocks.filter((block) => block?.type === "intro"));
	const mainBlocks = $derived(storyBlocks.filter((block) => block?.type !== "intro"));
	const hasText = (value) => typeof value === "string" && value.trim().length > 0;

</script>

<Explorer />

<article class="story">
	{#if storyBlocks.length}
		{#if introBlocks.length}
			<section class="story-section" id="intro">
				<IntroSequence blocks={introBlocks} />
			</section>
		{/if}

		{#each mainBlocks as block, i}
			{#if block.type === "hero"}
				<section class="story-section story-section--hero">
					<!-- <h1 class="story-heading">{@html block.h1}</h1> -->
					<Title/>
					{#if block.dek}
						<p class="story-dek">{@html block.dek}</p>
					{/if}
				</section>
			{:else if block.type === "prose"}
				<section class="story-section">
					<div class="content-container story-prose">{@html block.html}</div>
				</section>
			{:else if block.type === "chart"}
				<section class="story-section story-section--chart" id={block.chartId ?? `chart-${i}`}>
					{#if hasText(block.title) || hasText(block.subhead)}
						<header class="chart-header">
							{#if hasText(block.title)}
								<h2 class="story-heading">{@html block.title}</h2>
							{/if}
							{#if hasText(block.subhead)}
								<p class="chart-subhead">{@html block.subhead}</p>
							{/if}
						</header>
					{/if}
					{#if block.chartId === "semanticsSlopegraph"}
						<SemanticsViz
							title={block.title}
							subhead={block.subhead}
							note={block.note}
							overlays={block.overlays ?? []}
						/>
					{:else if block.chartId === "semanticsScope"}
						<Scope note={block.note} overlays={block.overlays ?? []} />
					{:else if block.chartId === "concretenessDistribution"}
						<ConcretenessKde annotation={block.annotation} />
					{:else if block.chartId === "concretenessBands"}
						<ConcretenessBands note={block.note} overlays={block.overlays ?? []} />
					{:else if block.chartId === "posDiagram"}
						<PosWaffle note={block.note} />
					{:else if block.chartId === "adverbsAdded"}
						<PosAdverbs />
					{:else}
						<div class="chart-placeholder" data-chart-id={block.chartId}>
							<p class="chart-placeholder-label">Chart not wired yet: {block.chartId}</p>
						</div>
					{/if}
				</section>
			{/if}
		{/each}
	{:else}
		<section class="story-section">
			<p class="story-empty">No <code>copy.story</code> in copy.json.</p>
		</section>
	{/if}
</article>

<svelte:boundary onerror={(e) => console.error(e)}>
	<!-- <Footer recirc={true} /> -->
</svelte:boundary>
