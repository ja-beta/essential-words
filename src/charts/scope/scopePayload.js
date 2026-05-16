
export const SCOPE_RING_ORDER = [1, 2, 3, 4, 5];

export const SCOPE_RING_NAMES = {
	1: "the self",
	2: "local–immediate",
	3: "institutional",
	4: "social–communicative",
	5: "universal–abstract"
};

export const SCOPE_CATEGORY_TO_RING = {
	Emotion: 1,
	"The Body and the Individual": 1,
	"Architecture, Housing and the Home": 2,
	"Food and Farming": 2,
	"Life and Living Things": 2,
	"Substances, Materials, Objects and Equipment": 2,
	"World and Environment": 2,
	Education: 3,
	"Government and Public": 3,
	"Money and Commerce in Industry": 3,
	"Science and Technology": 3,
	"Entertainment, Sports and Games": 4,
	"Language and Communication": 4,
	"Movement, Location, Travel and Transport": 4,
	"Social Actions, States and Processes": 4,
	"Arts and Crafts": 5,
	"General and Abstract Terms": 5,
	"Names and Grammar": 5,
	"Numbers and Measurement": 5,
	"Psychological Actions, States and Processes": 5,
	Time: 5
};

function readField(row, key) {
	if (!row || typeof row !== "object") return "";
	if (key in row) return String(row[key] ?? "");
	const match = Object.keys(row).find(
		(k) => String(k).replace(/^\uFEFF/, "").trim().toLowerCase() === key.toLowerCase()
	);
	return match ? String(row[match] ?? "") : "";
}

function normalizeRow(r) {
	if (!r || typeof r !== "object") return null;
	const word = readField(r, "word").trim();
	const set = readField(r, "set").trim().toLowerCase();
	const category = readField(r, "usas_top_level_name").trim();
	if (!word || !set || !category) return null;
	return { word, set, category };
}


function makeWordRecords(rows) {
	const remained = rows
		.filter((r) => r.set === "remained")
		.sort((a, b) => a.word.localeCompare(b.word));
	const changed = rows
		.filter((r) => r.set !== "remained")
		.sort((a, b) => a.word.localeCompare(b.word));
	return [...remained, ...changed].map((r) => ({ w: r.word, s: r.set, c: r.category }));
}

/**
 * @param {Array<Record<string, string>>} rawRows
 * @returns {{ nGsl: number, nNgsl: number, rings: object[] }}
 */
export function buildScopePayload(rawRows) {
	const rows = (rawRows ?? []).map(normalizeRow).filter(Boolean);
	const tagged = rows.filter((r) => SCOPE_CATEGORY_TO_RING[r.category] != null);

	const gsl = tagged.filter((r) => r.set === "remained" || r.set === "removed");
	const ngsl = tagged.filter((r) => r.set === "remained" || r.set === "added");

	const nGsl = gsl.length;
	const nNgsl = ngsl.length;

	if (nGsl === 0 || nNgsl === 0) {
		throw new Error(
			`[scope] GSL or NGSL has zero tagged rows (GSL=${nGsl}, NGSL=${nNgsl}). ` +
				`Check semantics.csv set values and category names against SCOPE_CATEGORY_TO_RING.`
		);
	}

	const rings = SCOPE_RING_ORDER.map((id) => {
		const gslInRing = gsl.filter((r) => SCOPE_CATEGORY_TO_RING[r.category] === id);
		const ngslInRing = ngsl.filter((r) => SCOPE_CATEGORY_TO_RING[r.category] === id);
		return {
			id,
			name: SCOPE_RING_NAMES[id],
			gslPct: Math.round((gslInRing.length / nGsl) * 1000) / 10,
			ngslPct: Math.round((ngslInRing.length / nNgsl) * 1000) / 10,
			gslCount: gslInRing.length,
			ngslCount: ngslInRing.length,
			gslWords: makeWordRecords(gslInRing),
			ngslWords: makeWordRecords(ngslInRing)
		};
	});

	return { nGsl, nNgsl, rings };
}
