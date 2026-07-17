<script>
	import { setContext } from "svelte";
	import { browser } from "$app/environment";
	import Meta from "$components/Meta.svelte";
	import Index from "$components/Index.svelte";
	import copy from "$data/copy.json";
	import version from "$utils/version.js";

	let { data } = $props();

	version();


	const preloadFont = ["./fonts/source-serif-4/source-serif-4-regular.woff2"];

	const meta = copy.meta ?? {};
	const title = meta.title ?? copy.title ?? "";
	const description = meta.description ?? copy.description ?? "";
	const url = meta.url ?? copy.url ?? "https://pudding.cool";
	const keywords = meta.keywords ?? copy.keywords ?? "";

	setContext("copy", copy);
	setContext("data", () => data);
</script>

<Meta {title} {description} {url} {preloadFont} {keywords} />
<Index />
