#!/usr/bin/env node
/**
 * generate-scope-poster.js
 *
 * Generates a high-resolution SVG of the scope chart in its final state:
 * all 5 rings visible, divider fully expanded, no hover or focus.
 *
 * Usage:  node generate-scope-poster.js
 * Output: scope-poster.svg  (same directory)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── 1. CSV parser ─────────────────────────────────────────────────────────────

function parseCSVLine(line) {
	const result = [];
	let cur = "";
	let inQ = false;
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

// ── 2. Scope payload (mirrors scopePayload.js) ────────────────────────────────

const SCOPE_RING_ORDER = [1, 2, 3, 4, 5];

const SCOPE_RING_NAMES = {
	1: "the self",
	2: "local\u2013immediate",
	3: "institutional",
	4: "social\u2013communicative",
	5: "universal\u2013abstract",
};

const SCOPE_CATEGORY_TO_RING = {
	"Emotion": 1,
	"The Body and the Individual": 1,
	"Architecture, Housing and the Home": 2,
	"Food and Farming": 2,
	"Life and Living Things": 2,
	"Substances, Materials, Objects and Equipment": 2,
	"World and Environment": 2,
	"Education": 3,
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
	"Time": 5,
};

function buildScopePayload(rawRows) {
	const rows = rawRows.map(r => {
		if (!r || typeof r !== "object") return null;
		const word = (r.word || "").trim();
		const set = (r.set || "").trim().toLowerCase();
		const category = (r.usas_top_level_name || "").trim();
		if (!word || !set || !category) return null;
		return { word, set, category };
	}).filter(Boolean);

	const tagged = rows.filter(r => SCOPE_CATEGORY_TO_RING[r.category] != null);
	const gsl = tagged.filter(r => r.set === "remained" || r.set === "removed");
	const ngsl = tagged.filter(r => r.set === "remained" || r.set === "added");
	const nGsl = gsl.length, nNgsl = ngsl.length;
	if (nGsl === 0 || nNgsl === 0) throw new Error("Empty GSL or NGSL");

	function makeWordRecords(rws) {
		const remained = rws.filter(r => r.set === "remained").sort((a, b) => a.word.localeCompare(b.word));
		const changed = rws.filter(r => r.set !== "remained").sort((a, b) => a.word.localeCompare(b.word));
		return [...remained, ...changed].map(r => ({ w: r.word, s: r.set, c: r.category }));
	}

	const rings = SCOPE_RING_ORDER.map(id => {
		const gslInRing = gsl.filter(r => SCOPE_CATEGORY_TO_RING[r.category] === id);
		const ngslInRing = ngsl.filter(r => SCOPE_CATEGORY_TO_RING[r.category] === id);
		return {
			id,
			name: SCOPE_RING_NAMES[id],
			gslPct: Math.round((gslInRing.length / nGsl) * 1000) / 10,
			ngslPct: Math.round((ngslInRing.length / nNgsl) * 1000) / 10,
			gslWords: makeWordRecords(gslInRing),
			ngslWords: makeWordRecords(ngslInRing),
		};
	});

	return { nGsl, nNgsl, rings };
}

// ── 3. Chart metrics (mirrors scope.svelte CSS, scaled up for poster) ─────────

// Scale factor applied to all spatial values from scope.svelte's CSS.
// At S=3.5, the resulting SVG is roughly 3500 × 3500 px.
const S = 3.5;

const m = {
	viewBox:         1000 * S,   // coordinate-space size (W = H)
	centerR:           45 * S,   // inner radius of ring 1
	maxR:             400 * S,   // target outer radius
	ringGap:           40 * S,   // gap between rings
	minRingDepthPx:    10 * S,   // minimum radial depth per ring
	splitGapPx:         8 * S,   // gap along the vertical divider
	labelGapBias:       0.05,    // how far into the gap the label sits (fraction)
	rectW:             10 * S,   // dot width  (long axis)
	rectH:              3 * S,   // dot height (short axis)
	dotEdgeGap:         2 * S,   // spacing between dots
	dotAlign:        "inner",    // pack from inner ring edge
	ringLabelSize:     20 * S,   // font-size for ring name labels
	listHeaderGap:     32 * S,   // gap from ring edge to "1953 LIST" label
	headerFontSize:    16 * S,   // font-size for "1953 LIST" / "2023 LIST"
};

const COLORS = {
	background: "#FFFFF1",
	remained:   "#8F8A77",  // --color-secondary
	removed:    "#ED9027",  // --color-gsl   (orange  – 1953 only)
	added:      "#DB6AE8",  // --color-ngsl  (purple  – 2023 only)
	ringStroke: "#d0cbc4",
	divider:    "#5B5B5B",  // --color-primary
	label:      "#5B5B5B",
};

// ── 4. Layout algorithm (mirrors renderScopeChart) ────────────────────────────

function computeLayout(payload) {
	const { rings } = payload;
	const nRings = rings.length;

	const W = m.viewBox, H = m.viewBox;
	const cx = W / 2, cy = H / 2;
	const halfSplit = m.splitGapPx / 2;
	const cxLeft  = cx - halfSplit;
	const cxRight = cx + halfSplit;

	const radialStride     = m.rectW + m.dotEdgeGap;
	const tangentialStride = m.rectH + m.dotEdgeGap;

	// Tag words with IDs and side
	rings.forEach((ring, ri) => {
		ring.gslWords.forEach((w, i)  => { w._id = `g-${ri}-${i}`; w._ringIdx = ri; w._side = "left";  });
		ring.ngslWords.forEach((w, i) => { w._id = `n-${ri}-${i}`; w._ringIdx = ri; w._side = "right"; });
	});

	function computeRingRadialDepth(rMin, wordCount) {
		if (wordCount <= 0) return m.minRingDepthPx;
		let idx = 0, r = rMin + m.rectW / 2 + m.dotEdgeGap * 0.5;
		const positions = [];
		while (idx < wordCount) {
			const capacity = Math.max(1, Math.floor((Math.PI * r) / tangentialStride));
			const n = Math.min(capacity, wordCount - idx);
			positions.push({ r, n });
			idx += n; r += radialStride;
		}
		if (!positions.length) return m.minRingDepthPx;
		const lastR = positions[positions.length - 1].r;
		return Math.max(m.minRingDepthPx, lastR + m.rectW / 2 - rMin);
	}

	function clearWordLayout() {
		for (const ring of rings)
			for (const w of [...ring.gslWords, ...ring.ngslWords])
				w.x = w.y = w.theta = null;
	}

	function placeDots(words, rMin, rMax, side) {
		const cxSide = side === "left" ? cxLeft : cxRight;
		let idx = 0, r = rMin + m.rectW / 2 + m.dotEdgeGap * 0.5;
		const positions = [];
		while (idx < words.length && r + m.rectW / 2 <= rMax + 0.5) {
			const capacity = Math.max(1, Math.floor((Math.PI * r) / tangentialStride));
			const n = Math.min(capacity, words.length - idx);
			positions.push({ r, n, startIdx: idx, full: n === capacity });
			idx += n; r += radialStride;
		}
		for (const pos of positions) {
			const step = pos.full
				? Math.PI / pos.n
				: Math.PI / Math.max(1, Math.floor((Math.PI * pos.r) / tangentialStride));
			const start = step / 2;
			for (let i = 0; i < pos.n; i++) {
				const angle = start + i * step;
				const theta = side === "left" ? -Math.PI / 2 - angle : -Math.PI / 2 + angle;
				const w = words[pos.startIdx + i];
				w.x = cxSide + pos.r * Math.cos(theta);
				w.y = cy + pos.r * Math.sin(theta);
				w.theta = theta;
			}
		}
	}

	function hasOverflow() {
		for (const ring of rings)
			for (const w of [...ring.gslWords, ...ring.ngslWords])
				if (w.x == null) return true;
		return false;
	}

	// Natural depths
	let rCursor = m.centerR;
	const naturalDepths = [];
	for (const ring of rings) {
		const wc = Math.max(ring.gslWords.length, ring.ngslWords.length);
		const d  = Math.max(m.minRingDepthPx, computeRingRadialDepth(rCursor, wc));
		naturalDepths.push(d);
		rCursor += d + m.ringGap;
	}

	// Scale to fit, iterating if dots overflow
	const gapTotal   = (nRings - 1) * m.ringGap;
	const budget     = m.maxR - m.centerR - gapTotal;
	const sumNatural = naturalDepths.reduce((a, b) => a + b, 0);
	let   scale      = sumNatural > 0 ? budget / sumNatural : 1;

	let bands = [], outerR = m.centerR;
	for (let guard = 0; guard < 80; guard++) {
		rCursor = m.centerR;
		bands = [];
		for (let i = 0; i < nRings; i++) {
			const d = Math.max(m.minRingDepthPx, naturalDepths[i] * scale);
			bands.push({ rMin: rCursor, rMax: rCursor + d });
			rCursor += d + m.ringGap;
		}
		outerR = rCursor - m.ringGap;
		clearWordLayout();
		rings.forEach((ring, i) => {
			placeDots(ring.gslWords,  bands[i].rMin, bands[i].rMax, "left");
			placeDots(ring.ngslWords, bands[i].rMin, bands[i].rMax, "right");
		});
		if (!hasOverflow()) break;
		scale *= 1.035;
	}

	const plotR = Math.max(m.maxR, outerR);

	// Collect all placed dots
	const allDots = [];
	for (const ring of rings) {
		for (const w of ring.gslWords)  if (w.x != null) allDots.push(w);
		for (const w of ring.ngslWords) if (w.x != null) allDots.push(w);
	}

	return { cx, cy, cxLeft, cxRight, bands, plotR, allDots, nRings };
}

// ── 5. SVG generation ─────────────────────────────────────────────────────────

function generateSVG(payload) {
	const { rings } = payload;
	const layout = computeLayout(payload);
	const { cx, cy, cxLeft, cxRight, bands, plotR, allDots, nRings } = layout;

	// ViewBox — extend on left/right for header labels and add vertical margin
	const chartPadX  = m.rectW;
	const chartPadY  = 24 * S;
	const headerExtra = m.listHeaderGap + m.headerFontSize * 6.5; // approx text width
	const legendH     = 120 * S;                                   // space below for legend

	const vbX = cx - plotR - chartPadX - headerExtra;
	const vbY = cy - plotR - chartPadY;
	const vbW = (plotR + chartPadX + headerExtra) * 2;
	const vbH = plotR * 2 + chartPadY * 2 + legendH;

	// For the output file we set an explicit pixel size; scale to ~3500px wide.
	const targetW  = 3500;
	const aspect   = vbH / vbW;
	const targetH  = Math.round(targetW * aspect);

	// Helper: half-circle arc path
	function semiArc(r, side) {
		const cx0  = side === "left" ? cxLeft : cxRight;
		const top  = `${cx0} ${cy - r}`;
		const bot  = `${cx0} ${cy + r}`;
		const flag = side === "left" ? 0 : 1;
		return `M ${top} A ${r} ${r} 0 0 ${flag} ${bot}`;
	}

	// Ring label arc paths (for textPath references)
	const labelSpan = 1.4; // radians either side of top

	function ringLabelArcPath(i) {
		const innerPad = m.ringGap * m.labelGapBias;
		const r  = bands[i].rMin - innerPad - m.ringLabelSize;
		const a1 = -Math.PI / 2 - labelSpan;
		const a2 = -Math.PI / 2 + labelSpan;
		const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
		const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
		return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
	}

	// ── Divider (final expanded state) ────────────────────────────────────────
	const divY1 = cy - plotR - 12 * S;
	const divY2 = cy + plotR + 12 * S;

	// ── Header label positions (at outermost ring — final step) ───────────────
	const outerR   = bands[nRings - 1].rMax + 0.25; // +0.5 * strokeWidth
	const headerXL = cxLeft  - outerR - m.listHeaderGap;
	const headerXR = cxRight + outerR + m.listHeaderGap;

	// ── Legend metrics ────────────────────────────────────────────────────────
	const legendY      = cy + plotR + chartPadY + 28 * S;
	const dotR         = 10 * S;
	const legendFontSz = 14 * S;
	const legendItems  = [
		{ color: COLORS.remained, label: "in both lists" },
		{ color: COLORS.removed,  label: "removed from 1953 list" },
		{ color: COLORS.added,    label: "added to 2023 list" },
	];
	const legendGap    = 80 * S;
	const totalLegendW = legendItems.reduce((acc, it) =>
		acc + dotR * 2 + 8 * S + it.label.length * legendFontSz * 0.55, 0
	) + legendGap * (legendItems.length - 1);
	let legendX        = cx - totalLegendW / 2;

	// ── Build SVG string ──────────────────────────────────────────────────────
	const parts = [];

	parts.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`);
	parts.push(`  viewBox="${f(vbX)} ${f(vbY)} ${f(vbW)} ${f(vbH)}"`);
	parts.push(`  width="${targetW}" height="${targetH}">`);

	// defs
	parts.push(`<defs>`);
	parts.push(`<style>
  @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600&amp;family=Source+Code+Pro:wght@600&amp;display=swap');
  text {
    font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
  .header-label {
    font-family: 'Source Code Pro', 'Menlo', 'Consolas', monospace;
    font-weight: 600;
    letter-spacing: 0.08em;
  }
  .ring-name {
    font-weight: 300;
    letter-spacing: 0.04em;
  }
</style>`);

	// arc paths for ring labels (rings 1–4, i.e. i=1..4 in 0-indexed)
	for (let i = 1; i < nRings; i++) {
		parts.push(`<path id="arc-${i}" d="${ringLabelArcPath(i)}" fill="none"/>`);
	}
	parts.push(`</defs>`);

	// background
	parts.push(`<rect x="${f(vbX)}" y="${f(vbY)}" width="${f(vbW)}" height="${f(vbH)}" fill="${COLORS.background}"/>`);

	// ring boundary arcs
	parts.push(`<g>`);
	bands.forEach((band, ri) => {
		for (const side of ["left", "right"]) {
			for (const r of [band.rMin, band.rMax]) {
				if (r <= m.centerR + 0.5) continue;
				parts.push(`<path d="${semiArc(r, side)}" fill="none" stroke="${COLORS.ringStroke}" stroke-width="${f(0.5 * S)}"/>`);
			}
		}
	});
	parts.push(`</g>`);

	// divider (fully expanded)
	parts.push(`<line x1="${f(cx)}" x2="${f(cx)}" y1="${f(divY1)}" y2="${f(divY2)}"
  stroke="${COLORS.divider}" stroke-width="${f(0.5 * S)}"
  stroke-dasharray="${f(5 * S)},${f(5 * S)}" stroke-opacity="0.5"/>`);

	// dots
	parts.push(`<g>`);
	for (const d of allDots) {
		const deg   = (d.theta * 180) / Math.PI;
		const color = d.s === "remained" ? COLORS.remained
		            : d.s === "removed"  ? COLORS.removed
		            :                      COLORS.added;
		parts.push(`<rect x="${f(d.x - m.rectW / 2)}" y="${f(d.y - m.rectH / 2)}" width="${f(m.rectW)}" height="${f(m.rectH)}" fill="${color}" transform="rotate(${f(deg)},${f(d.x)},${f(d.y)})"/>`);
	}
	parts.push(`</g>`);

	// ring labels
	const strokeHalo = `paint-order="stroke" stroke="${COLORS.background}" stroke-width="${f(4 * S)}" stroke-linecap="round" stroke-linejoin="round"`;

	parts.push(`<g>`);
	rings.forEach((ring, i) => {
		if (i === 0) {
			// Center circle — split "the self" across two lines
			const words = ring.name.toUpperCase().split(/\s+/);
			const lh    = m.ringLabelSize * 1.15;
			const totalH = (words.length - 1) * lh;
			parts.push(`<text text-anchor="middle" font-size="${f(m.ringLabelSize)}" fill="${COLORS.label}" ${strokeHalo}>`);
			words.forEach((word, wi) => {
				const dy = -totalH / 2 + wi * lh;
				parts.push(`  <tspan class="ring-name" x="${f(cx)}" y="${f(cy + dy)}">${xmlEsc(word)}</tspan>`);
			});
			parts.push(`</text>`);
			return;
		}

		// Arc-following label (ring name only, matching the hidden-pct visual)
		parts.push(`<text font-size="${f(m.ringLabelSize)}" fill="${COLORS.label}" ${strokeHalo}>`);
		parts.push(`  <textPath href="#arc-${i}" startOffset="50%" text-anchor="middle">`);
		parts.push(`    <tspan class="ring-name">${xmlEsc(ring.name.toUpperCase())}</tspan>`);
		parts.push(`  </textPath>`);
		parts.push(`</text>`);
	});
	parts.push(`</g>`);

	// header labels ("1953 LIST" / "2023 LIST")
	parts.push(`<g>`);
	parts.push(`<text class="header-label" x="${f(headerXL)}" y="${f(cy)}" text-anchor="end" dominant-baseline="middle" font-size="${f(m.headerFontSize)}" fill="${COLORS.label}">1953 LIST</text>`);
	parts.push(`<text class="header-label" x="${f(headerXR)}" y="${f(cy)}" text-anchor="start" dominant-baseline="middle" font-size="${f(m.headerFontSize)}" fill="${COLORS.label}">2023 LIST</text>`);
	parts.push(`</g>`);

	// legend
	parts.push(`<g>`);
	for (const item of legendItems) {
		const labelW  = item.label.length * legendFontSz * 0.55;
		const itemW   = dotR * 2 + 8 * S + labelW;
		const dotCX   = legendX + dotR;
		const labelX  = dotCX + dotR + 8 * S;
		parts.push(`<circle cx="${f(dotCX)}" cy="${f(legendY)}" r="${f(dotR)}" fill="${item.color}"/>`);
		parts.push(`<text x="${f(labelX)}" y="${f(legendY)}" dominant-baseline="middle" font-size="${f(legendFontSz)}" fill="${COLORS.label}">${xmlEsc(item.label)}</text>`);
		legendX += itemW + legendGap;
	}
	parts.push(`</g>`);

	parts.push(`</svg>`);

	return parts.join("\n");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Round to 2 decimal places for compact SVG output */
function f(n) { return Math.round(n * 100) / 100; }

function xmlEsc(s) {
	return String(s)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

// ── Main ──────────────────────────────────────────────────────────────────────

const csvPath = path.join(__dirname, "src/data/semantics.csv");
const csvText = fs.readFileSync(csvPath, "utf-8");
const rows    = parseCSV(csvText);
const payload = buildScopePayload(rows);

console.log(`Loaded ${payload.nGsl} GSL words, ${payload.nNgsl} NGSL words`);
payload.rings.forEach(r =>
	console.log(`  Ring ${r.id} "${r.name}": gsl=${r.gslWords.length}, ngsl=${r.ngslWords.length}`)
);

const svgContent = generateSVG(payload);

const outPath = path.join(__dirname, "scope-poster.svg");
fs.writeFileSync(outPath, svgContent, "utf-8");
console.log(`\nSaved: ${outPath}`);
console.log(`Note: open in a browser or Inkscape first to verify fonts load correctly.`);
console.log(`For print: export from Inkscape as PDF, or use a browser's print-to-PDF.`);
