import introRows from "$data/intro_screen.csv";
import { buildIntroWordPools } from "$utils/introWords.js";

export async function load() {
	const introWordPools = buildIntroWordPools(introRows);

	return {
		introWordPools
	};
}