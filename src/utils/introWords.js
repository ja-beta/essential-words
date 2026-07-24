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
	baseFillFraction: 0.5,
	removedFillRatio: 0.4,
	centerExclusionWidth: 0.5,
	centerExclusionHeight: 0.7, //0.7
	centerExclusionNoise: 0.01, //0.15

	headerExclusionCells: [
		[4, 1],
		[5, 1],
		[4, 2],
		[5, 2]
	],

	baseSeed: 148, //147
	removedSeed: 255, //202
	exclusionSeed: 3001, //3001
	emptyShuffleSeed: 21013,
	maxWordLength: 10 
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
	allowedSets = INTRO_SCREEN_SETS[screenIndex] ?? INTRO_SCREEN_SETS.at(-1),
	options = {}
) {
	const maxLen = options.maxWordLength ?? INTRO_SEQUENCE_DEFAULTS.maxWordLength;
	const exclude = options.exclude ?? null;
	const bySet = {
		removed: pools.removed,
		remained: pools.remained,
		added: pools.added
	};

	const sources = allowedSets
		.map((set) => {
			const seen = new Set();
			const list = [];
			for (const w of bySet[set] ?? []) {
				if (w.length > maxLen) continue;
				const key = w.toLowerCase();
				if (seen.has(key) || exclude?.has(key)) continue;
				seen.add(key);
				list.push(w);
			}
			return { set, list };
		})
		.filter((s) => s.list.length);

	if (!sources.length) return [];

	
	let seed = screenIndex * 7919;
	for (const source of sources) {
		const { list } = source;
		for (let i = list.length - 1; i > 0; i--) {
			seed += 17;
			const j = Math.floor(seededUnit(seed) * (i + 1));
			[list[i], list[j]] = [list[j], list[i]];
		}
	}

	const out = [];
	const used = new Set(exclude ? [...exclude] : []);
	const cursors = sources.map(() => 0);

	for (let i = 0; i < count; i++) {
		let placed = false;
		for (let attempt = 0; attempt < sources.length; attempt++) {
			const si = (i + attempt) % sources.length;
			const { set, list } = sources[si];
			while (cursors[si] < list.length) {
				const text = list[cursors[si]++];
				const key = text.toLowerCase();
				if (used.has(key)) continue;
				used.add(key);
				out.push({ text, set });
				placed = true;
				break;
			}
			if (placed) break;
		}
		if (!placed) break;
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
	const halfBase = Math.max(0.08, Math.min(0.5, widthFrac / 2));
	const activeTop = Math.max(0, (1 - Math.max(0.05, Math.min(1, heightFrac))) / 2);
	const activeBottom = 1 - activeTop;

	for (let r = 0; r < rows; r++) {
		const rowFrac = (r + 0.5) / rows;
		if (rowFrac < activeTop || rowFrac > activeBottom) continue;

		const rowWidthJitter = (seededUnit(seedBase + r * 97) - 0.5) * edgeNoise;
		const rowCenterJitter = (seededUnit(seedBase + r * 131) - 0.5) * edgeNoise;
		const rowHalf = Math.max(0.06, Math.min(0.49, halfBase * (1 + rowWidthJitter)));
		const rowCenter = 0.5 + rowCenterJitter;

		for (let c = 0; c < cols; c++) {
			const idx = r * cols + c;
			const x = (c + 0.5) / cols;
			const edgeJitter = (seededUnit(seedBase + idx * 17) - 0.5) * edgeNoise;
			if (Math.abs(x - rowCenter) <= rowHalf + edgeJitter) blocked.add(idx);
		}
	}

	return blocked;
}

function applyHeaderExclusion(blocked, cols, rows, cells = INTRO_SEQUENCE_DEFAULTS.headerExclusionCells) {
	for (const pair of cells ?? []) {
		const col = Math.round(pair[0]) - 1;
		const row = Math.round(pair[1]) - 1;
		if (col < 0 || col >= cols || row < 0 || row >= rows) continue;
		blocked.add(row * cols + col);
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
	applyHeaderExclusion(
		blocked,
		cols,
		rows,
		options.headerExclusionCells ?? INTRO_SEQUENCE_DEFAULTS.headerExclusionCells
	);

	const baseWords = pickWordsForScreen(
		pools,
		options.baseSeed ?? INTRO_SEQUENCE_DEFAULTS.baseSeed,
		Math.floor(cols * rows * (options.baseWordRequestFraction ?? INTRO_SEQUENCE_DEFAULTS.baseWordRequestFraction)),
		["added", "remained"],
		{ maxWordLength: options.maxWordLength }
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
	const placedKeys = new Set(
		cells.filter(Boolean).map((cell) => cell.text.toLowerCase())
	);
	const removedWords = pickWordsForScreen(
		pools,
		options.removedSeed ?? INTRO_SEQUENCE_DEFAULTS.removedSeed,
		removedCount,
		["removed"],
		{ maxWordLength: options.maxWordLength, exclude: placedKeys }
	);
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

export function buildIntroFlowGrid(pools, options = {}) {
	const cols = Math.max(3, Math.round(options.cols ?? 4));
	const rows = Math.max(1, Math.round(options.rows ?? 5));
	const screenIndex = options.screenIndex ?? 0;
	const seed = options.seed ?? screenIndex * 7919;
	const allowedSets = options.allowedSets ?? INTRO_SCREEN_SETS[screenIndex] ?? INTRO_SCREEN_SETS.at(-1);
	const count = cols * rows;
	const words = pickWordsForScreen(pools, seed, count, allowedSets, {
		maxWordLength: options.maxWordLength
	});

	return placeWordsInGrid(words, seed, cols, rows, { fillFraction: 1 });
}

export function buildWritePlanForCells(cells, shuffleSeed = 4187) {
	if (!cells?.length) return new Map();

	const eligible = [];
	for (let i = 0; i < cells.length; i++) {
		if (cells[i]) eligible.push(i);
	}

	const shuffled = [...eligible];
	for (let n = shuffled.length - 1; n > 0; n--) {
		const j = Math.floor(seededUnit(shuffleSeed + n * 41) * (n + 1));
		[shuffled[n], shuffled[j]] = [shuffled[j], shuffled[n]];
	}

	const plan = new Map();
	for (let rank = 0; rank < shuffled.length; rank++) {
		const i = shuffled[rank];
		const len = cells[i].text.length;
		plan.set(i, { order: rank, ch: len, steps: Math.max(4, len) });
	}

	return plan;
}