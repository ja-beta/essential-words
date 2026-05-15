const NUM_BINS = 8;
const BIN_W = 0.5;
const BIN_LO = Array.from({ length: NUM_BINS }, (_, i) => Math.round((1.0 + i * BIN_W) * 10) / 10);

/**
 * @param {Array<{ word?: string; set?: string; concreteness?: string | number }>} rows
 */
export function buildConcretenessBandsPayload(rows) {
	const records = [];
	let totalRemoved = 0;
	let totalAdded = 0;

	for (const row of rows) {
		const set = row?.set;
		if (set !== "removed" && set !== "added") continue;
		const score = Number(row?.concreteness);
		const word = row?.word;
		if (!word || !Number.isFinite(score)) continue;

		const b = Math.min(NUM_BINS - 1, Math.floor((score - 1.0) / BIN_W));
		records.push({ w: word, s: set, c: Math.round(score * 100) / 100, b });

		if (set === "removed") totalRemoved += 1;
		else totalAdded += 1;
	}

	const bins = BIN_LO.map((lo, bi) => {
		const hi = Math.round((lo + BIN_W) * 10) / 10;
		const removed = records
			.filter((r) => r.b === bi && r.s === "removed")
			.map((r) => r.w)
			.sort();
		const added = records
			.filter((r) => r.b === bi && r.s === "added")
			.map((r) => r.w)
			.sort();
		return { lo, hi, removed, added };
	});

	for (const b of bins) {
		b.pct_removed = totalRemoved ? Math.round((b.removed.length / totalRemoved) * 10000) / 100 : 0;
		b.pct_added = totalAdded ? Math.round((b.added.length / totalAdded) * 10000) / 100 : 0;
	}

	let maxPct = 0;
	for (const b of bins) {
		maxPct = Math.max(maxPct, b.pct_removed, b.pct_added);
	}
	maxPct = maxPct || 1;

	for (const b of bins) {
		b.frac_removed = b.pct_removed / maxPct;
		b.frac_added = b.pct_added / maxPct;
	}

	return {
		bins,
		numBins: NUM_BINS,
		binW: BIN_W,
		totalRemoved,
		totalAdded,
		maxPct: Math.round(maxPct * 100) / 100
	};
}
