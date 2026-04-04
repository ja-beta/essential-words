export const INTRO_SCREEN_SETS = [
    ["added", "remained"], //ngsl
    ["removed", "remained"], //gsl
    ["removed", "added"], //diff
    ["removed", "remained", "added"] //both
];

export const INTRO_SCREEN_LONG = [false, false, false, true];


export function buildIntroWordPools(rows) {
	const removed = [];
	const remained = [];
	const added = [];

	for (const row of rows) {
		const r = row.Removed?.trim();
		const m = row.Remained?.trim();
		const a = row.Added?.trim();
		if (r) removed.push(r);
		if (m) remained.push(m);
		if (a) added.push(a);
	}

	return { removed, remained, added };
}


function seededUnit(seed) {
	const x = Math.sin(seed + 1) * 10000;
	return x - Math.floor(x);
}


export function pickWordsForScreen(
	pools,
	screenIndex,
	count = 36,
	allowedSets = INTRO_SCREEN_SETS[screenIndex] ?? INTRO_SCREEN_SETS.at(-1)
) {
	const bySet = {
		removed: pools.removed,
		remained: pools.remained,
		added: pools.added
	};

	const sources = allowedSets
		.map((set) => ({ set, list: bySet[set] ?? [] }))
		.filter((s) => s.list.length);

	if (!sources.length) return [];

	const out = [];
	let seed = screenIndex * 7919;

	for (let i = 0; i < count; i++) {
		seed += i * 17;
		const si = i % sources.length;
		const { set, list } = sources[si];
		const j = Math.floor(seededUnit(seed) * list.length);
		out.push({ text: list[j], set });
	}

	return out;
}


export function placeWordsInGrid(words, screenIndex, cols = 12, rows = 12) {
	const total = cols * rows;
	const cells = Array.from({ length: total }, () => null);

	const indices = Array.from({ length: total }, (_, i) => i);
	for (let i = total - 1; i > 0; i--) {
		const seed = screenIndex * 10007 + i * 31;
		const j = Math.floor(seededUnit(seed) * (i + 1));
		[indices[i], indices[j]] = [indices[j], indices[i]];
	}

	const toPlace = Math.min(words.length, Math.floor(total * 0.35));
	for (let w = 0; w < toPlace; w++) {
		cells[indices[w]] = words[w];
	}

	return { cells, cols, rows };
}