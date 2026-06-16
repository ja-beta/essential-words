<script>
	import { getContext, onMount } from "svelte";
	import { browser } from "$app/environment";
	import Footer from "$components/Footer.svelte";
	import IntroSequence from "$components/IntroSequence.svelte";
	import SemanticsViz from "../charts/semantics/SemanticsViz.svelte";
	import Scope from "../charts/scope/scope.svelte";
	import ConcretenessKde from "../charts/concreteness-kde/concretenessKde.svelte";
	import ConcretenessBands from "../charts/concreteness-bands/concretenessBands.svelte";
	import PosAdverbs from "../charts/part-of-speech/posAdverbs.svelte";
	import PosWaffle from "../charts/part-of-speech/posWaffle.svelte";
	import ScopeArcs from "../charts/scope-arcs/scopeArcs.svelte";
	import Title from "$components/Title.svelte";
	import Explorer from "$components/Explorer.svelte";
	import Notes from "$components/Notes.svelte";

	const copy = getContext("copy");
	const storyBlocks = $derived(Array.isArray(copy?.story) ? copy.story : []);
	const notesBlocks = $derived(Array.isArray(copy?.notes) ? copy.notes : []);
	const introBlocks = $derived(storyBlocks.filter((block) => block?.type === "intro"));
	const mainBlocks = $derived(storyBlocks.filter((block) => block?.type !== "intro"));
	const hasText = (value) => typeof value === "string" && value.trim().length > 0;

	let explorerVisible = $state(false);
	let rafId = 0;

	$effect(() => {
		if (!browser) return;

		document.documentElement.classList.toggle("explorer-rail-active", explorerVisible);

		return () => {
			document.documentElement.classList.remove("explorer-rail-active");
		};
	});

	const EXPLORER_INTRO_OFFSET_PX = 500;
	const EXPLORER_FOOTER_OFFSET_PX = 100;

	function updateExplorerVisibility() {
		const intro = document.getElementById("intro");
		const footer = document.querySelector("footer");

		let visible = true;

		if (intro) {
			visible = intro.getBoundingClientRect().bottom <= EXPLORER_INTRO_OFFSET_PX;
		}

		if (visible && footer) {
			visible = footer.getBoundingClientRect().top >= window.innerHeight - EXPLORER_FOOTER_OFFSET_PX;
		}

		explorerVisible = visible;
	}

	function scheduleExplorerVisibilityUpdate() {
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			rafId = 0;
			updateExplorerVisibility();
		});
	}

	onMount(() => {
		updateExplorerVisibility();
		window.addEventListener("scroll", scheduleExplorerVisibilityUpdate, { passive: true });
		window.addEventListener("resize", scheduleExplorerVisibilityUpdate);

		return () => {
			if (rafId) cancelAnimationFrame(rafId);
			window.removeEventListener("scroll", scheduleExplorerVisibilityUpdate);
			window.removeEventListener("resize", scheduleExplorerVisibilityUpdate);
		};
	});
</script>

<Explorer visible={explorerVisible} />

<article class="story">
	{#if storyBlocks.length}
		{#if introBlocks.length}
			<section class="story-section" id="intro">
				<IntroSequence blocks={introBlocks} />
			</section>
		{/if}

		{#each mainBlocks as block, i}
			{#if block.type === "title"}
				<section class="story-section story-section--title">
					<Title/>
					{#if block.dek}
						<p class="story-dek">{@html block.dek}</p>
					{/if}
					{#if block.byline}
						<p class="byline">{@html block.byline}</p>
					{/if}
				</section>
			{:else if block.type === "prose"}
				<section class="story-section story-section--prose">
					<div class="content-container story-prose">{@html block.html}</div>
				</section>
			{:else if block.type === "chart"}
				<section class="story-section story-section--chart" id={block.chartId ?? `chart-${i}`}>
					{#if hasText(block.title) || hasText(block.subhead)}
						<header class="chart-header">
							{#if hasText(block.title)}
								<h3 class="chart-heading">{@html block.title}</h3>
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
					{:else if block.chartId === "semanticsScopeArcs"}
						<ScopeArcs note={block.note} overlays={block.overlays ?? []} />
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

	<Notes blocks={notesBlocks} />
</article>

<svelte:boundary onerror={(e) => console.error(e)}>
	<Footer recirc={true} />
</svelte:boundary>
