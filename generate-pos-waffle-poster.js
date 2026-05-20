#!/usr/bin/env node
/**
 * generate-pos-waffle-poster.js
 *
 * Generates a high-resolution SVG of the POS waffle chart.
 *
 * ┌──────────────────────────────────────────────────────┐
 * │  1953 list  │ nouns grid (bottom-aligned) │ adj │ …  │
 * │             ├─── category headers ─────────────────  │
 * │  2023 list  │ nouns grid (top-aligned)    │ adj │ …  │
 * └──────────────────────────────────────────────────────┘
 *
 * Usage:  node generate-pos-waffle-poster.js
 * Output: pos-waffle-poster.svg  (same directory)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════════════════════════
//  CONFIG — adjust these before running
// ═══════════════════════════════════════════════════════════════════════════════

/** Overall scale factor.  1 = browser pixel size.  4 ≈ 3000 px poster. */
const SCALE = 4;

/**
 * Size of each word cell (square), in base pixels (before SCALE is applied).
 * In the interactive chart this is 6.
 */
const CELL_SIZE = 6;

/**
 * Gap between adjacent cells, in base pixels.
 * In the interactive chart this is 1.
 */
const CELL_GAP = 1;

/**
 * Number of columns per POS category.
 * Controls how wide each block is and how many rows it needs.
 */
const COLS_PER_POS = {
	noun:      28,
	adjective: 12,
	adverb:    12,
	verb:      12,
	other:     12,
};

/**
 * Order in which POS categories appear left-to-right.
 * Remove an entry to hide that category entirely.
 */
const POS_ORDER = ["noun", "adjective", "adverb", "verb", "other"];

/** Display names shown in the header row between the two grids. */
const POS_HEADERS = {
	noun:      "nouns",
	adjective: "adjectives",
	adverb:    "adverbs",
	verb:      "verbs",
	other:     "other",
};

/** Horizontal gap between POS blocks, base px. */
const POS_GAP = 12;

/** Vertical padding above/below the header row, base px. */
const ROWS_GAP = 20;

/** Font size for the POS category headers ("nouns", "adjectives", …), base px. */
const HEADER_FONT_SIZE = 14;

/** Font size for the "1953 list" / "2023 list" labels, base px. */
const LIST_LABEL_FONT_SIZE = 18;

/** Reserved width for the "1953 list" / "2023 list" labels, base px. */
const LABEL_WIDTH = 120;

/** Gap between the right edge of the label and the left edge of the chart, base px. */
const LABEL_GAP = 14;

/** Extra margin around the entire chart, base px. */
const MARGIN = { top: 40, right: 60, bottom: 80, left: 60 };

/** Cell colors (these differ from the scope chart — lighter palette). */
const COLORS = {
	background: "#FFFFF1",
	remained:   "#d7d1bc",   // light beige  — word in both lists
	removed:    "#fbc576",   // light orange — in 1953 only
	added:      "#f6b6e7",   // light pink   — in 2023 only
	label:      "#5B5B5B",   // --color-primary
	header:     "#8F8A77",   // --color-secondary
};

// ═══════════════════════════════════════════════════════════════════════════════
//  END CONFIG
// ═══════════════════════════════════════════════════════════════════════════════


// ── CSV parser ─────────────────────────────────────────────────────────────────

function parseCSVLine(line) {
	const result = [];
	let cur = "", inQ = false;
	for (const ch of line) {
		if (ch === '"') { inQ = !inQ; }
		else if (ch === ',' && !inQ) { result.push(cur); cur = ""; }
		else { cur += ch; }
	}
	result.push(cur);
	return result;
}

function parseCSV(text) {
	const lines = text.trim().split(/\r?\n/);
	const headers = parseCSVLine(lines[0]).map(h => h.replace(/^\uFEFF/, "").trim());
	return lines.slice(1).filter(l => l.trim()).map(line => {
		const vals = parseCSVLine(line);
		const obj = {};
		headers.forEach((h, i) => { obj[h] = (vals[i] ?? "").trim(); });
		return obj;
	});
}


// ── Data builder (mirrors posWaffle.svelte logic) ──────────────────────────────

function normalizePos(v) {
	const p = String(v ?? "").trim().toLowerCase();
	return POS_ORDER.includes(p) ? p : "other";
}

function buildList(sourceRows, includeSets, setOrder) {
	const grouped = Object.fromEntries(POS_ORDER.map(pos => [pos, []]));
	sourceRows
		.filter(row => includeSets.includes(row?.set))
		.sort((a, b) => {
			const oa = setOrder[a?.set] ?? 99;
			const ob = setOrder[b?.set] ?? 99;
			if (oa !== ob) return oa - ob;
			return String(a?.word ?? "").localeCompare(String(b?.word ?? ""));
		})
		.forEach(row => {
			const pos = normalizePos(row?.pos);
			grouped[pos].push({ word: String(row?.word ?? ""), set: row?.set });
		});
	return grouped; // { noun: [...], adjective: [...], ... }
}

function buildData(rawRows) {
	const rows = rawRows.filter(r => r.word && r.set && r.pos);
	// removed sorts first so it lands at the bottom when the grid is bottom-aligned
	const list1953 = buildList(rows, ["remained", "removed"], { removed: 0, remained: 1 });
	const list2023 = buildList(rows, ["remained", "added"],   { added: 0, remained: 1 });
	return { list1953, list2023 };
}


// ── Layout helpers ─────────────────────────────────────────────────────────────

// All layout values are computed in base px, then multiplied by SCALE for output.

const stride = CELL_SIZE + CELL_GAP;

function blockWidthPx(pos)        { return COLS_PER_POS[pos] * stride - CELL_GAP; }
function blockHeightPx(wordCount, pos) {
	if (wordCount === 0) return 0;
	const rows = Math.ceil(wordCount / COLS_PER_POS[pos]);
	return rows * stride - CELL_GAP;
}

function buildLayout(data) {
	const { list1953, list2023 } = data;

	// Block heights per POS for each section
	const h1953 = Object.fromEntries(POS_ORDER.map(pos => [pos, blockHeightPx(list1953[pos].length, pos)]));
	const h2023 = Object.fromEntries(POS_ORDER.map(pos => [pos, blockHeightPx(list2023[pos].length, pos)]));

	// Section heights = tallest block in each section
	const sec1953H = Math.max(...POS_ORDER.map(pos => h1953[pos]));
	const sec2023H = Math.max(...POS_ORDER.map(pos => h2023[pos]));

	// Header row occupies ROWS_GAP padding + text + ROWS_GAP padding
	const headerRowH = ROWS_GAP + HEADER_FONT_SIZE + ROWS_GAP;

	// Key y coordinates (base px, from chart top = 0)
	const dividerY   = sec1953H;                            // bottom of 1953 section
	const headerMidY = dividerY + ROWS_GAP + HEADER_FONT_SIZE / 2;  // text center
	const sec2023Y   = dividerY + headerRowH;               // top of 2023 section
	const totalH     = sec2023Y + sec2023H;

	// X coordinates per POS block (base px, from chart left = 0)
	const blockX = {};
	let x = 0;
	for (const pos of POS_ORDER) {
		blockX[pos] = x;
		x += blockWidthPx(pos) + POS_GAP;
	}
	const totalW = x - POS_GAP;

	// Left edge where chart area starts (accounting for label + gap)
	const chartOriginX = LABEL_WIDTH + LABEL_GAP;

	return {
		h1953, h2023,
		sec1953H, sec2023H,
		headerRowH, headerMidY,
		dividerY, sec2023Y,
		totalH, totalW,
		blockX, chartOriginX,
	};
}


// ── SVG generation ─────────────────────────────────────────────────────────────

function generateSVG(data, layout) {
	const { list1953, list2023 } = data;
	const {
		h1953, h2023,
		sec1953H, sec2023H,
		headerMidY, dividerY, sec2023Y,
		totalH, totalW,
		blockX, chartOriginX,
	} = layout;

	const S = SCALE;

	// Canvas dimensions
	const canvasW = (MARGIN.left + chartOriginX + totalW + MARGIN.right) * S;
	const canvasH = (MARGIN.top + totalH + MARGIN.bottom) * S;

	// Convert a base-px x in chart coordinates → absolute SVG x
	const svgX  = (bx) => (MARGIN.left + chartOriginX + bx) * S;
	// Convert a base-px y in chart coordinates → absolute SVG y
	const svgY  = (by) => (MARGIN.top + by) * S;

	const parts = [];

	parts.push(`<svg xmlns="http://www.w3.org/2000/svg"`);
	parts.push(`  width="${f(canvasW)}" height="${f(canvasH)}"`);
	parts.push(`  viewBox="0 0 ${f(canvasW)} ${f(canvasH)}">`);

	// Embedded style for fonts
	parts.push(`<defs><style>
  @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600&amp;family=Source+Code+Pro:wght@500;600&amp;display=swap');
  text {
    font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
  .mono {
    font-family: 'Source Code Pro', 'Menlo', 'Consolas', monospace;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
</style></defs>`);

	// Background
	parts.push(`<rect width="${f(canvasW)}" height="${f(canvasH)}" fill="${COLORS.background}"/>`);

	// ── Draw cells ────────────────────────────────────────────────────────────

	// bottomAlign: if true, row 0 (first cells) renders at the bottom of the block
	// so any partial row appears at the top rather than the bottom.
	function drawCells(cells, pos, sectionTopY, bottomAlign = false) {
		if (!cells.length) return;
		const cols      = COLS_PER_POS[pos];
		const bx        = blockX[pos];
		const totalRows = Math.ceil(cells.length / cols);
		for (let idx = 0; idx < cells.length; idx++) {
			const col        = idx % cols;
			const logicalRow = Math.floor(idx / cols);
			const displayRow = bottomAlign ? (totalRows - 1 - logicalRow) : logicalRow;
			const cx    = svgX(bx + col * stride);
			const cy    = svgY(sectionTopY + displayRow * stride);
			const color = cells[idx].set === "remained" ? COLORS.remained
			            : cells[idx].set === "removed"  ? COLORS.removed
			            :                                 COLORS.added;
			parts.push(`<rect x="${f(cx)}" y="${f(cy)}" width="${f(CELL_SIZE * S)}" height="${f(CELL_SIZE * S)}" fill="${color}"/>`);
		}
	}

	parts.push(`<g id="cells-1953">`);
	for (const pos of POS_ORDER) {
		// 1953 section is bottom-aligned to dividerY; cells packed from bottom up
		const sectionTopY = dividerY - h1953[pos];
		drawCells(list1953[pos], pos, sectionTopY, true);
	}
	parts.push(`</g>`);

	parts.push(`<g id="cells-2023">`);
	for (const pos of POS_ORDER) {
		drawCells(list2023[pos], pos, sec2023Y);
	}
	parts.push(`</g>`);

	// ── POS category headers ──────────────────────────────────────────────────

	parts.push(`<g id="pos-headers">`);
	for (const pos of POS_ORDER) {
		const bw    = blockWidthPx(pos);
		const midX  = svgX(blockX[pos] + bw / 2);
		const midY  = svgY(headerMidY);
		const label = POS_HEADERS[pos] ?? pos;
		parts.push(`<text class="mono" x="${f(midX)}" y="${f(midY)}" text-anchor="middle" dominant-baseline="middle" font-size="${f(HEADER_FONT_SIZE * S)}" fill="${COLORS.header}">${xmlEsc(label)}</text>`);
	}
	parts.push(`</g>`);

	// ── List labels ("1953 list" / "2023 list") ───────────────────────────────

	// 1953 label: right-aligned, vertically at the top of its section (top of tallest block)
	const label1953Y = svgY(dividerY - 3);   // -3 matches the CSS `top: -3px`
	// 2023 label: right-aligned, vertically at the top of 2023 section
	const label2023Y = svgY(sec2023Y - 3);
	const labelRightX = (MARGIN.left + chartOriginX - LABEL_GAP) * S;

	parts.push(`<g id="list-labels">`);
	parts.push(`<text class="mono" x="${f(labelRightX)}" y="${f(label1953Y)}" text-anchor="end" dominant-baseline="auto" font-size="${f(LIST_LABEL_FONT_SIZE * S)}" fill="${COLORS.label}">1953 list</text>`);
	parts.push(`<text class="mono" x="${f(labelRightX)}" y="${f(label2023Y)}" text-anchor="end" dominant-baseline="auto" font-size="${f(LIST_LABEL_FONT_SIZE * S)}" fill="${COLORS.label}">2023 list</text>`);
	parts.push(`</g>`);

	// ── Legend ────────────────────────────────────────────────────────────────

	const legendItems = [
		{ color: COLORS.remained, label: "in both lists" },
		{ color: COLORS.removed,  label: "in 1953 list only" },
		{ color: COLORS.added,    label: "in 2023 list only" },
	];
	const legendFontSz  = LIST_LABEL_FONT_SIZE * S;
	const dotSz         = CELL_SIZE * 1.5 * S;
	const dotGap        = 6 * S;
	const legendItemGap = 40 * S;
	const legendY       = svgY(totalH) + ROWS_GAP * S * 2;

	// Estimate total legend width for centering
	const approxItemW   = (s) => dotSz + dotGap + s.length * legendFontSz * 0.55;
	const totalLegendW  = legendItems.reduce((acc, it) => acc + approxItemW(it.label), 0)
	                    + legendItemGap * (legendItems.length - 1);
	let lx              = canvasW / 2 - totalLegendW / 2;

	parts.push(`<g id="legend">`);
	for (const item of legendItems) {
		const dotY = legendY - dotSz / 2;
		parts.push(`<rect x="${f(lx)}" y="${f(dotY)}" width="${f(dotSz)}" height="${f(dotSz)}" fill="${item.color}"/>`);
		const textX = lx + dotSz + dotGap;
		parts.push(`<text x="${f(textX)}" y="${f(legendY)}" dominant-baseline="middle" font-size="${f(legendFontSz)}" fill="${COLORS.label}">${xmlEsc(item.label)}</text>`);
		lx += approxItemW(item.label) + legendItemGap;
	}
	parts.push(`</g>`);

	parts.push(`</svg>`);
	return parts.join("\n");
}


// ── Helpers ────────────────────────────────────────────────────────────────────

function f(n) { return Math.round(n * 100) / 100; }

function xmlEsc(s) {
	return String(s)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}


// ── Main ───────────────────────────────────────────────────────────────────────

const csvPath = path.join(__dirname, "src/data/pos.csv");
const csvText = fs.readFileSync(csvPath, "utf-8");
const rows    = parseCSV(csvText);
const data    = buildData(rows);

console.log("Word counts per POS:");
for (const pos of POS_ORDER) {
	console.log(`  ${pos.padEnd(12)}: 1953=${data.list1953[pos].length}, 2023=${data.list2023[pos].length}`);
}

const layout = buildLayout(data);
console.log(`\nChart dimensions (base px): ${f(layout.totalW)} × ${f(layout.totalH)}`);
console.log(`Output dimensions (scaled ×${SCALE}): ${f((MARGIN.left + layout.chartOriginX + layout.totalW + MARGIN.right) * SCALE)} × ${f((MARGIN.top + layout.totalH + MARGIN.bottom) * SCALE)}`);

const svgContent = generateSVG(data, layout);

const outPath = path.join(__dirname, "pos-waffle-poster.svg");
fs.writeFileSync(outPath, svgContent, "utf-8");
console.log(`\nSaved: ${outPath}`);
