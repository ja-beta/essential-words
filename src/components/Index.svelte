<script>
	import { getContext, onMount } from "svelte";
	import { browser } from "$app/environment";
	import { getHeight } from "$runes/useWindowDimensions.svelte.js";
	import Footer from "$components/Footer.svelte";
	import IntroSequence from "$components/IntroSequence.svelte";
	import SemanticsViz from "../charts/semantics/SemanticsViz.svelte";
	import Scope from "../charts/scope/scope.svelte";
	import ConcretenessKde from "../charts/concreteness-kde/concretenessKde.svelte";
	import ConcretenessBands from "../charts/concreteness-bands/concretenessBands.svelte";
	import PosAdverbs from "../charts/part-of-speech/posAdverbs.svelte";
	import PosWaffle from "../charts/part-of-speech/posWaffle.svelte";
	import ScopeArcs from "../charts/scope-arcs/scopeArcs.svelte";
	import StoryTitle from "$svg/title.svg";
	import StoryTitleMobile from "$svg/title-mobile.svg";
	import Explorer from "$components/Explorer.svelte";
	import Notes from "$components/Notes.svelte";

	const copy = getContext("copy");
	const storyBlocks = $derived(Array.isArray(copy?.story) ? copy.story : []);
	const notesBlocks = $derived(Array.isArray(copy?.notes) ? copy.notes : []);
	const introBlocks = $derived(storyBlocks.filter((block) => block?.type === "intro"));
	const mainBlocks = $derived(storyBlocks.filter((block) => block?.type !== "intro"));
	const hasText = (value) => typeof value === "string" && value.trim().length > 0;

	function chartHeadingId(chartId) {
		return chartId ? `${chartId}-heading` : undefined;
	}

	function chartSubheadId(chartId) {
		return chartId ? `${chartId}-subhead` : undefined;
	}

	let explorerVisible = $state(false);
	let chartOverlayActive = $state(false);
	let rafId = 0;

	const EXPLORER_TITLE_SHOW_PX = 800;
	const EXPLORER_TITLE_HIDE_PX = 150;
	const EXPLORER_FOOTER_HIDE_PX = 72;
	const EXPLORER_FOOTER_SHOW_PX = 140;
	const CHART_FAB_HIDE_TOP_PX = 64;

	function isChartOverlayActive() {
		const vh = getHeight();

		for (const scrolly of document.querySelectorAll(".chart-overlay-scrolly")) {
			const section = scrolly.closest(".story-section--chart");
			if (!section) continue;

			const sectionRect = section.getBoundingClientRect();

			if (sectionRect.bottom <= 0 || sectionRect.top >= vh) continue;

			const stage = scrolly.querySelector(".chart-overlay-stage");
			if (!stage) continue;

			if (stage.getBoundingClientRect().top <= CHART_FAB_HIDE_TOP_PX) return true;
		}

		return false;
	}

	function updateExplorerVisibility() {
		const title = document.getElementById("title");
		const footer = document.querySelector("footer");
		const vh = getHeight();

		let visible = explorerVisible;

		if (title) {
			const titleBottom = title.getBoundingClientRect().bottom;
			if (titleBottom <= EXPLORER_TITLE_SHOW_PX) visible = true;
			else if (titleBottom > EXPLORER_TITLE_HIDE_PX) visible = false;
		}

		if (footer) {
			const footerTop = footer.getBoundingClientRect().top;
			if (footerTop < vh - EXPLORER_FOOTER_HIDE_PX) visible = false;
			else if (footerTop >= vh - EXPLORER_FOOTER_SHOW_PX && title) {
				const titleBottom = title.getBoundingClientRect().bottom;
				if (titleBottom <= EXPLORER_TITLE_SHOW_PX) visible = true;
			}
		}

		explorerVisible = visible;
		chartOverlayActive = isChartOverlayActive();
	}

	function scheduleExplorerVisibilityUpdate() {
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			rafId = 0;
			updateExplorerVisibility();
		});
	}

	onMount(() => {
		if (!browser) return;
		updateExplorerVisibility();
		window.addEventListener("scroll", scheduleExplorerVisibilityUpdate, { passive: true });
		window.addEventListener("resize", scheduleExplorerVisibilityUpdate);
		const vv = window.visualViewport;
		vv?.addEventListener("resize", scheduleExplorerVisibilityUpdate);
		vv?.addEventListener("scroll", scheduleExplorerVisibilityUpdate);

		return () => {
			if (rafId) cancelAnimationFrame(rafId);
			window.removeEventListener("scroll", scheduleExplorerVisibilityUpdate);
			window.removeEventListener("resize", scheduleExplorerVisibilityUpdate);
			vv?.removeEventListener("resize", scheduleExplorerVisibilityUpdate);
			vv?.removeEventListener("scroll", scheduleExplorerVisibilityUpdate);
		};
	});
</script>

<Explorer visible={explorerVisible} overlayActive={chartOverlayActive} />

<article class="story">
	{#if storyBlocks.length}
		{#if introBlocks.length}
			<section class="story-section" id="intro" aria-label="Introduction">
				<IntroSequence blocks={introBlocks} />
			</section>
		{/if}

		{#each mainBlocks as block, i}
			{#if block.type === "title"}
				<section class="story-section story-section--title" id="title">
					<h1 class="story-title" aria-label="From Goat to Despite">
						<span class="story-title__art story-title__art--desktop" aria-hidden="true">{@html StoryTitle}</span>
						<span class="story-title__art story-title__art--mobile" aria-hidden="true">{@html StoryTitleMobile}</span>
					</h1>
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
				<section
					class="story-section story-section--chart"
					id={block.chartId ?? `chart-${i}`}
					aria-labelledby={hasText(block.title) ? chartHeadingId(block.chartId) : undefined}
				>
					{#if hasText(block.title) || hasText(block.subhead)}
						<header class="chart-header">
							{#if hasText(block.title)}
								<h3 id={chartHeadingId(block.chartId)} class="chart-heading">{@html block.title}</h3>
							{/if}
							{#if hasText(block.subhead)}
								<p id={chartSubheadId(block.chartId)} class="chart-subhead">{@html block.subhead}</p>
							{/if}
						</header>
					{/if}
					{#if block.chartId === "semanticsSlopegraph"}
						<SemanticsViz
							title={block.title}
							subhead={block.subhead}
							note={block.note}
							overlays={block.overlays ?? []}
							headingId={chartHeadingId(block.chartId)}
							subheadId={hasText(block.subhead) ? chartSubheadId(block.chartId) : undefined}
						/>
					<!-- {:else if block.chartId === "semanticsScopeTiles"}
						<Scope note={block.note} overlays={block.overlays ?? []} /> -->
					{:else if block.chartId === "concretenessDistribution"}
						<ConcretenessKde
							annotation={block.annotation}
							headingId={chartHeadingId(block.chartId)}
							subheadId={hasText(block.subhead) ? chartSubheadId(block.chartId) : undefined}
						/>
					{:else if block.chartId === "concretenessBands"}
						<ConcretenessBands
							note={block.note}
							overlays={block.overlays ?? []}
							headingId={chartHeadingId(block.chartId)}
							subheadId={hasText(block.subhead) ? chartSubheadId(block.chartId) : undefined}
						/>
					{:else if block.chartId === "posDiagram"}
						<PosWaffle
							note={block.note}
							headingId={chartHeadingId(block.chartId)}
							subheadId={hasText(block.subhead) ? chartSubheadId(block.chartId) : undefined}
						/>
					{:else if block.chartId === "adverbsAdded"}
						<PosAdverbs headingId={chartHeadingId(block.chartId)} />
					{:else if block.chartId === "semanticsScopeArcs"}
						<ScopeArcs
							noteSummary={block.noteSummary}
							noteDetails={block.noteDetails}
							overlays={block.overlays ?? []}
							headingId={chartHeadingId(block.chartId)}
							subheadId={hasText(block.subhead) ? chartSubheadId(block.chartId) : undefined}
						/>
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
			<p class="story-empty">No copy in copy.json.</p>
		</section>
	{/if}

	<Notes blocks={notesBlocks} />
</article>

<svelte:boundary onerror={(e) => console.error(e)}>
	<Footer recirc={true} />
</svelte:boundary>
