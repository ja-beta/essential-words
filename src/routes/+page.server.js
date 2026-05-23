import introRows from "$data/intro_screen.csv";
import semanticsRows from "$data/semantics.csv";
import concretenessRows from "$data/concreteness.csv";
import posRows from "$data/pos.csv";
import { buildExplorerWordLists, buildIntroWordPools } from "$utils/introWords.js";
import { buildSemanticsRibbonsPayload } from "../charts/semantics/semanticsRibbonsPayload.js";
import { buildScopePayload } from "../charts/scope/scopePayload.js";
import { buildConcretenessKdePayload } from "../charts/concreteness-kde/concretenessKdePayload.js";
import { buildConcretenessBandsPayload } from "../charts/concreteness-bands/concretenessBandsPayload.js";

export async function load() {
	const introWordPools = buildIntroWordPools(introRows);
	const explorerWordLists = buildExplorerWordLists(introRows);

	let semanticsRibbonsPayload = null;
	let semanticsRibbonsError = null;
	try {
		semanticsRibbonsPayload = buildSemanticsRibbonsPayload(semanticsRows);
	} catch (e) {
		semanticsRibbonsError = e instanceof Error ? e.message : String(e);
	}

	let scopePayload = null;
	let scopeError = null;
	try {
		scopePayload = buildScopePayload(semanticsRows);
	} catch (e) {
		scopeError = e instanceof Error ? e.message : String(e);
	}

	let concretenessKdePayload = null;
	let concretenessKdeError = null;
	try {
		concretenessKdePayload = buildConcretenessKdePayload(concretenessRows);
	} catch (e) {
		concretenessKdeError = e instanceof Error ? e.message : String(e);
	}

	let concretenessBandsPayload = null;
	let concretenessBandsError = null;
	try {
		concretenessBandsPayload = buildConcretenessBandsPayload(concretenessRows);
	} catch (e) {
		concretenessBandsError = e instanceof Error ? e.message : String(e);
	}

	return {
		introWordPools,
		explorerWordLists,
		semanticsRibbonsPayload,
		semanticsRibbonsError,
		scopePayload,
		scopeError,
		concretenessKdePayload,
		concretenessKdeError,
		concretenessBandsPayload,
		concretenessBandsError,
		posRows
	};
}
