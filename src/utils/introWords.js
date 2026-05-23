export const INTRO_SCREEN_SETS = [
    ["added", "remained"], //ngsl
    ["removed", "remained"], //gsl
    ["removed", "added"], //diff
    ["removed", "remained", "added"] //both
];

export const INTRO_SCREEN_LONG = [false, false, false, true];

export const INTRO_SEQUENCE_DEFAULTS = {
	cols: 8,
	rowScale: 4.2, // rows = round(cols * rowScale) when rows not explicitly set
	rows: null,
	baseWordRequestFraction: 0.5,
	baseFillFraction: 0.38,
	removedFillRatio: 0.25,
	centerExclusionWidth: 0.33,
	centerExclusionHeight: 0.5,
	centerExclusionNoise: 0.1,
	baseSeed: 102,
	removedSeed: 202,
	exclusionSeed: 3001,
	emptyShuffleSeed: 21013
};


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

export function buildExplorerWordLists(rows) {
	const list1953 = [];
	const list2023 = [];

	for (const row of rows) {
		const remained = row.Remained?.trim();
		const removed = row.Removed?.trim();
		const added = row.Added?.trim();

		if (remained) {
			list1953.push({ text: remained, status: "remained" });
			list2023.push({ text: remained, status: "remained" });
		}
		if (removed) {
			list1953.push({ text: removed, status: "removed" });
		}
		if (added) {
			list2023.push({ text: added, status: "added" });
		}
	}

	const byText = (a, b) => a.text.localeCompare(b.text);
	list1953.sort(byText);
	list2023.sort(byText);

	return { list1953, list2023 };
}

function seededUnit(seed) {
	const x = Math.sin(seed + 1) * 10000;
	return x - Math.floor(x);
}


export function pickWordsForScreen(
	pools,
	screenIndex,
	count = 150,
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


export function placeWordsInGrid(words, screenIndex, cols, rows, options = {}) {
	const { blockedIndices = null, fillFraction = 0.35 } = options;
	const total = cols * rows;
	const cells = Array.from({ length: total }, () => null);

	const indices = Array.from({ length: total }, (_, i) => i);
	for (let i = total - 1; i > 0; i--) {
		const seed = screenIndex * 10007 + i * 31;
		const j = Math.floor(seededUnit(seed) * (i + 1));
		[indices[i], indices[j]] = [indices[j], indices[i]];
	}

	const openIndices = blockedIndices ? indices.filter((i) => !blockedIndices.has(i)) : indices;
	const toPlace = Math.min(words.length, Math.floor(openIndices.length * fillFraction));
	for (let w = 0; w < toPlace; w++) {
		cells[openIndices[w]] = words[w];
	}

	return { cells, cols, rows };
}

function resolveGridSize(options = {}) {
	const cols = Math.max(4, Math.round(options.cols ?? INTRO_SEQUENCE_DEFAULTS.cols));
	const scaledRows = Math.round(cols * (options.rowScale ?? INTRO_SEQUENCE_DEFAULTS.rowScale));
	const rows = Math.max(4, Math.round(options.rows ?? INTRO_SEQUENCE_DEFAULTS.rows ?? scaledRows));
	return { cols, rows };
}

function buildCenterExclusionMask(cols, rows, opts = {}) {
	const widthFrac = opts.widthFrac ?? INTRO_SEQUENCE_DEFAULTS.centerExclusionWidth;
	const heightFrac = opts.heightFrac ?? INTRO_SEQUENCE_DEFAULTS.centerExclusionHeight;
	const edgeNoise = opts.edgeNoise ?? INTRO_SEQUENCE_DEFAULTS.centerExclusionNoise;
	const seedBase = opts.seedBase ?? INTRO_SEQUENCE_DEFAULTS.exclusionSeed;
	const blocked = new Set();
	const halfBase = Math.max(0.08, Math.min(0.48, widthFrac / 2));
	const activeTop = Math.max(0, (1 - Math.max(0.05, Math.min(1, heightFrac))) / 2);
	const activeBottom = 1 - activeTop;

	for (let r = 0; r < rows; r++) {
		const rowFrac = (r + 0.5) / rows;
		if (rowFrac < activeTop || rowFrac > activeBottom) continue;

		const rowWidthJitter = (seededUnit(seedBase + r * 97) - 0.5) * edgeNoise * 0.75;
		const rowCenterJitter = (seededUnit(seedBase + r * 131) - 0.5) * edgeNoise * 0.12;
		const rowHalf = Math.max(0.06, Math.min(0.49, halfBase * (1 + rowWidthJitter)));
		const rowCenter = 0.5 + rowCenterJitter;

		for (let c = 0; c < cols; c++) {
			const idx = r * cols + c;
			const x = (c + 0.5) / cols;
			const edgeJitter = (seededUnit(seedBase + idx * 17) - 0.5) * edgeNoise * 0.03;
			if (Math.abs(x - rowCenter) <= rowHalf + edgeJitter) blocked.add(idx);
		}
	}

	return blocked;
}


export function buildIntroSequenceGrid(pools, options = {}) {
	const { cols, rows } = resolveGridSize(options);

	const blocked = buildCenterExclusionMask(cols, rows, {
		widthFrac: options.centerExclusionWidth ?? INTRO_SEQUENCE_DEFAULTS.centerExclusionWidth,
		heightFrac: options.centerExclusionHeight ?? INTRO_SEQUENCE_DEFAULTS.centerExclusionHeight,
		edgeNoise: options.centerExclusionNoise ?? INTRO_SEQUENCE_DEFAULTS.centerExclusionNoise,
		seedBase: options.exclusionSeed ?? INTRO_SEQUENCE_DEFAULTS.exclusionSeed
	});

	const baseWords = pickWordsForScreen(
		pools,
		options.baseSeed ?? INTRO_SEQUENCE_DEFAULTS.baseSeed,
		Math.floor(cols * rows * (options.baseWordRequestFraction ?? INTRO_SEQUENCE_DEFAULTS.baseWordRequestFraction)),
		["added", "remained"]
	);
	const baseGrid = placeWordsInGrid(baseWords, options.baseSeed ?? INTRO_SEQUENCE_DEFAULTS.baseSeed, cols, rows, {
		blockedIndices: blocked,
		fillFraction: options.baseFillFraction ?? INTRO_SEQUENCE_DEFAULTS.baseFillFraction
	});

	const cells = [...baseGrid.cells];
	const empties = cells
		.map((cell, i) => (cell ? -1 : i))
		.filter((i) => i >= 0 && !blocked.has(i));

	// Stable shuffle for empty slots
	for (let i = empties.length - 1; i > 0; i--) {
		const seed = (options.emptyShuffleSeed ?? INTRO_SEQUENCE_DEFAULTS.emptyShuffleSeed) + i * 37;
		const j = Math.floor(seededUnit(seed) * (i + 1));
		[empties[i], empties[j]] = [empties[j], empties[i]];
	}

	const removedCount = Math.max(
		0,
		Math.floor(empties.length * (options.removedFillRatio ?? INTRO_SEQUENCE_DEFAULTS.removedFillRatio))
	);
	const removedWords = pickWordsForScreen(pools, options.removedSeed ?? INTRO_SEQUENCE_DEFAULTS.removedSeed, removedCount, [
		"removed"
	]);
	for (let i = 0; i < removedWords.length && i < empties.length; i++) {
		cells[empties[i]] = removedWords[i];
	}

	return {
		cols,
		rows,
		baseCells: baseGrid.cells,
		withRemovedCells: cells
	};
}