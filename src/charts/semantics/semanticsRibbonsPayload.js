

export const CATEGORY_ORDER = [
	"General and Abstract Terms",
	"The Body and the Individual",
	"Arts and Crafts",
	"Emotion",
	"Food and Farming",
	"Government and Public",
	"Architecture, Housing and the Home",
	"Money and Commerce in Industry",
	"Entertainment, Sports and Games",
	"Life and Living Things",
	"Movement, Location, Travel and Transport",
	"Numbers and Measurement",
	"Substances, Materials, Objects and Equipment",
	"Education",
	"Language and Communication",
	"Social Actions, States and Processes",
	"Time",
	"World and Environment",
	"Psychological Actions, States and Processes",
	"Science and Technology",
	"Names and Grammar"
];

export const SHORT_NAMES = {
	"General and Abstract Terms": "General & Abstract",
	"The Body and the Individual": "Body & Individual",
	"Arts and Crafts": "Arts & Crafts",
	Emotion: "Emotion",
	"Food and Farming": "Food & Farming",
	"Government and Public": "Government & Public",
	"Architecture, Housing and the Home": "Architecture & Home",
	"Money and Commerce in Industry": "Money & Commerce",
	"Entertainment, Sports and Games": "Entertainment & Games",
	"Life and Living Things": "Life & Living Things",
	"Movement, Location, Travel and Transport": "Movement & Transport",
	"Numbers and Measurement": "Numbers & Measurement",
	"Substances, Materials, Objects and Equipment": "Substances & Objects",
	Education: "Education",
	"Language and Communication": "Language & Communication",
	"Social Actions, States and Processes": "Social Actions & Processes",
	Time: "Time",
	"World and Environment": "World & Environment",
	"Psychological Actions, States and Processes": "Psych. Actions & Processes",
	"Science and Technology": "Science & Technology",
	"Names and Grammar": "Names & Grammar"
};


export const MOBILE_SHORT_NAMES = {
	"General and Abstract Terms": "General",
	"The Body and the Individual": "Body",
	"Arts and Crafts": "Arts",
	Emotion: "Emotion",
	"Food and Farming": "Food",
	"Government and Public": "Gov't",
	"Architecture, Housing and the Home": "Housing",
	"Money and Commerce in Industry": "Money",
	"Entertainment, Sports and Games": "Sports",
	"Life and Living Things": "Life",
	"Movement, Location, Travel and Transport": "Travel",
	"Numbers and Measurement": "Numbers",
	"Substances, Materials, Objects and Equipment": "Objects",
	Education: "Education",
	"Language and Communication": "Language",
	"Social Actions, States and Processes": "Social",
	Time: "Time",
	"World and Environment": "World",
	"Psychological Actions, States and Processes": "Psych.",
	"Science and Technology": "Science",
	"Names and Grammar": "Grammar"
};

function readField(row, key) {
	if (!row || typeof row !== "object") return "";
	if (key in row) return String(row[key] ?? "");
	const match = Object.keys(row).find((k) => String(k).replace(/^\uFEFF/, "").trim().toLowerCase() === key.toLowerCase());
	return match ? String(row[match] ?? "") : "";
}


export function normalizeSemanticsRibbonRow(r) {
	if (!r || typeof r !== "object") return null;
	const word = readField(r, "word").trim();
	const set = readField(r, "set")
		.trim()
		.toLowerCase();
	const usas_top_level_name = readField(r, "usas_top_level_name").trim();
	const usas_tag = readField(r, "usas_tag").trim();
	const usas_top_level = readField(r, "usas_top_level").trim();
	if (!word && !set && !usas_top_level_name) return null;
	return { word, set, usas_top_level_name, usas_tag, usas_top_level };
}

function sampleSpread(words, k = 6) {
	if (words.length <= k) return words;
	const idxs = [];
	for (let i = 0; i < k; i++) idxs.push(Math.floor((i * (words.length - 1)) / (k - 1)));
	return idxs.map((i) => words[i]);
}

function collectExamplesBySet(rows, category, k = 6) {
	const out = { remained: [], added: [], removed: [] };
	for (const s of ["remained", "added", "removed"]) {
		const words = [
			...new Set(
				rows
					.filter((r) => r.usas_top_level_name === category && r.set === s)
					.map((r) => String(r.word ?? "").trim())
					.filter(Boolean)
			)
		].sort();
		out[s] = sampleSpread(words, k);
	}
	return out;
}

/**
 * @param {Array<Record<string, string>>} rawRows
 * @returns {{ nGsl: number, nNgsl: number, categories: object[] }}
 */
export function buildSemanticsRibbonsPayload(rawRows) {
	const rows = (rawRows ?? []).map(normalizeSemanticsRibbonRow).filter(Boolean);

	const df = rows.filter((r) => r.usas_top_level_name);
	const gslDf = df.filter((r) => r.set === "remained" || r.set === "removed");
	const ngslDf = df.filter((r) => r.set === "remained" || r.set === "added");

	const nGsl = gslDf.length;
	const nNgsl = ngslDf.length;
	if (nGsl === 0 || nNgsl === 0) {
		const n = rows.length;
		const withName = rows.filter((r) => r.usas_top_level_name).length;
		const setSamples = [...new Set(rows.slice(0, 200).map((r) => JSON.stringify(r?.set)))].slice(0, 8);
		const keys = n ? Object.keys(rawRows[0] ?? {}) : [];
		throw new Error(
			`[semantics tab] GSL or NGSL has zero tagged rows (GSL=${nGsl}, NGSL=${nNgsl}, rows=${n}, with usas_top_level_name=${withName}). ` +
				`GSL needs set "remained" or "removed"; NGSL needs "remained" or "added". ` +
				`Raw header keys: ${keys.join(", ") || "(none)"}. Sample normalized set values: ${setSamples.join("; ") || "(none)"}.`
		);
	}

	const countBy = (arr, key) => {
		const m = new Map();
		for (const r of arr) {
			const v = r[key];
			if (v == null) continue;
			m.set(v, (m.get(v) ?? 0) + 1);
		}
		return m;
	};

	const gslVc = countBy(gslDf, "usas_top_level_name");
	const ngslVc = countBy(ngslDf, "usas_top_level_name");

	const cats = [];
	for (const cat of CATEGORY_ORDER) {
		const gc = gslVc.get(cat) ?? 0;
		const nc = ngslVc.get(cat) ?? 0;
		const gslPct = (gc / nGsl) * 100;
		const ngslPct = (nc / nNgsl) * 100;
		const rel = gslPct > 0 ? ((ngslPct - gslPct) / gslPct) * 100 : null;

		const examples = collectExamplesBySet(df, cat);

		const wordsFor = (pred) =>
			[
				...new Set(
					df
						.filter(pred)
						.map((r) => String(r.word ?? "").trim())
						.filter(Boolean)
				)
			].sort();

		const gslWords = wordsFor((r) => r.usas_top_level_name === cat && (r.set === "remained" || r.set === "removed"));
		const ngslWords = wordsFor((r) => r.usas_top_level_name === cat && (r.set === "remained" || r.set === "added"));
		const remainedWords = wordsFor((r) => r.usas_top_level_name === cat && r.set === "remained");
		const addedWords = wordsFor((r) => r.usas_top_level_name === cat && r.set === "added");
		const removedWords = wordsFor((r) => r.usas_top_level_name === cat && r.set === "removed");

		cats.push({
			name: cat,
			shortName: SHORT_NAMES[cat] ?? cat,
			mobileShortName: MOBILE_SHORT_NAMES[cat] ?? SHORT_NAMES[cat] ?? cat,
			gslPct: Math.round(gslPct * 1000) / 1000,
			ngslPct: Math.round(ngslPct * 1000) / 1000,
			gslCount: gc,
			ngslCount: nc,
			ppChange: Math.round((ngslPct - gslPct) * 100) / 100,
			relChange: rel != null ? Math.round(rel * 10) / 10 : null,
			shared: examples.remained,
			added: examples.added,
			removed: examples.removed,
			gslWords,
			ngslWords,
			remainedWords,
			addedWords,
			removedWords
		});
	}

	cats.sort((a, b) => (b.gslPct + b.ngslPct) / 2 - (a.gslPct + a.ngslPct) / 2);

	return { nGsl, nNgsl, categories: cats };
}
