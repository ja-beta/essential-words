import * as d3 from "d3";

function readCssPx(el, varName, fallback) {
	if (!el) return fallback;
	const raw = getComputedStyle(el).getPropertyValue(varName).trim();
	if (!raw) return fallback;
	const n = parseFloat(raw);
	return Number.isFinite(n) ? n : fallback;
}


export function readConcretenessBandsMetrics(containerEl) {
	const root = containerEl?.closest?.(".concr-bands") ?? containerEl;
	const px = (name, fb) => readCssPx(root, name, fb);
	return {
		margin: {
			top: px("--concr-bands-margin-top", 72),
			right: px("--concr-bands-margin-right", 24),
			bottom: px("--concr-bands-margin-bottom", 72),
			left: px("--concr-bands-margin-left", 24)
		},
		bandH: px("--concr-bands-band-h", 36),
		bandGap: px("--concr-bands-band-gap", 8),
		centerGap: px("--concr-bands-center-gap", 24),
		fontSize: px("--concr-bands-marquee-font-size", 28),
		marqueeSpeed: px("--concr-bands-marquee-speed", 16),
		minBarWidth: px("--concr-bands-min-bar-width", 4),
		textPad: px("--concr-bands-text-pad", 4),
		axisLinePad: px("--concr-bands-axis-line-pad", 8),
		dirLabelOffsetY: px("--concr-bands-dir-label-offset-y", 28),
		dirLabelOffsetX: px("--concr-bands-dir-label-offset-x", 8),
		endpointOffsetTop: px("--concr-bands-endpoint-offset-top", 10),
		endpointOffsetBottom: px("--concr-bands-endpoint-offset-bottom", 20),
		axisLabelW: px("--concr-bands-axis-label-w", 28),
		axisLabelH: px("--concr-bands-axis-label-h", 14),
		dirLabelSizePx: px("--concr-bands-dir-label-size", 11),
		axisWholeSizePx: px("--concr-bands-axis-whole-size", 11),
		axisHalfSizePx: px("--concr-bands-axis-half-size", 9),
		endpointSizePx: px("--concr-bands-endpoint-size", 12),
		axisTickOffset: px("--concr-bands-axis-tick-offset", 40)
	};
}

export const CONCRETENESS_BANDS_CONFIG = {
	marquee: {
		repeat: 6
	},
	colors: {
		primary: "var(--color-primary)",
		background: "transparent",
		removedBg: "var(--concr-bands-removed-bg, rgba(237,144,39,0.25))",
		removedBgRow: "var(--concr-bands-removed-bg-row, var(--concr-bands-removed-bg, rgba(237,144,39,0.25)))",
		removedText: "var(--color-gsl)",
		addedBg: "var(--concr-bands-added-bg, rgba(219,106,232,0.25))",
		addedBgRow: "var(--concr-bands-added-bg-row, var(--concr-bands-added-bg, rgba(219,106,232,0.25)))",
		addedText: "var(--color-ngsl)",
		grid: "var(--concr-bands-grid, #d5d0c8)",
		gridText: "var(--concr-bands-grid-text, #a8a098)",
		muted: "var(--concr-bands-muted, #8F8A77)",
		axisLabelBg: "var(--color-bg, #FFFFF1)"
	},
	typography: {
		sansFont: 'var(--font-sans, "Source Sans 3", system-ui, sans-serif)',
		serifFont: 'var(--font-serif, "Source Serif 4", serif)',
		monoFont: 'var(--font-mono, "Source Code Pro", monospace)'
	}
};

/**
 * @param {HTMLElement} container
 * @param {ReturnType<typeof import("./concretenessBandsPayload.js").buildConcretenessBandsPayload>} payload
 * @param {{ width: number }} options
 */
export function renderConcretenessBands(container, payload, { width }) {
	const cfg = CONCRETENESS_BANDS_CONFIG;
	const m = readConcretenessBandsMetrics(container);
	const W = Math.max(1, Math.round(width));

	const margin = { ...m.margin };
	const bandH = m.bandH;
	const bandGap = m.bandGap;
	const centerGap = m.centerGap;
	const fontSize = m.fontSize;

	const { bins, numBins, binW, maxPct } = payload;
	const plotW = W - margin.left - margin.right;
	const centerX = margin.left + plotW / 2;
	const halfGap = centerGap / 2;
	const halfW = (plotW - centerGap) / 2;

	const niceMax = Math.ceil((maxPct || 1) / 10) * 10;
	const tickStep = niceMax <= 30 ? 10 : 20;
	const axisTicks = d3.range(0, niceMax + 0.001, tickStep);
	const axisTickPx = (pct) => (pct / niceMax) * halfW;
	const axisY = margin.top - m.axisTickOffset;

	const binY = (b) => margin.top + b * (bandH + bandGap);
	const chartH = margin.top + numBins * bandH + (numBins - 1) * bandGap + margin.bottom;

	const colors = {
		removed: { bg: cfg.colors.removedBg, bgRow: cfg.colors.removedBgRow, text: cfg.colors.removedText },
		added: { bg: cfg.colors.addedBg, bgRow: cfg.colors.addedBgRow, text: cfg.colors.addedText }
	};

	const uid = `cb-${Math.random().toString(36).slice(2, 9)}`;
	const wideRemoved = `${uid}-wide-removed`;
	const wideAdded = `${uid}-wide-added`;

	const svg = d3
		.create("svg")
		.attr("width", W)
		.attr("height", chartH)
		.attr("viewBox", [0, 0, W, chartH])
		.style("width", "100%")
		.style("height", "auto")
		.style("display", "block");

	svg.append("rect").attr("width", W).attr("height", chartH).attr("fill", cfg.colors.background);

	const defs = svg.append("defs");


	defs
		.append("clipPath")
		.attr("id", wideRemoved)
		.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", centerX - halfGap)
		.attr("height", chartH);

	defs
		.append("clipPath")
		.attr("id", wideAdded)
		.append("rect")
		.attr("x", centerX + halfGap)
		.attr("y", 0)
		.attr("width", W - (centerX + halfGap))
		.attr("height", chartH);

	// x axis ───────────────
	for (const [x1, x2] of [
		[margin.left, centerX - halfGap],
		[centerX + halfGap, W - margin.right]
	]) {
		svg
			.append("line")
			.attr("x1", x1)
			.attr("x2", x2)
			.attr("y1", axisY)
			.attr("y2", axisY)
			.attr("stroke", cfg.colors.grid)
			.attr("stroke-width", 1)
			.attr("stroke-opacity", 0.8)
			.attr("stroke-linecap", "butt" )
			.attr("stroke-dasharray", "4 5");
	}

	// tick marks and labels ────────────────────────────────────────────
	for (const side of ["removed", "added"]) {
		for (const tick of axisTicks) {
			const xOff = axisTickPx(tick);
			const tickX =
				side === "removed" ? centerX - halfGap - xOff : centerX + halfGap + xOff;

			svg
				.append("line")
				.attr("x1", tickX)
				.attr("x2", tickX)
				.attr("y1", axisY)
				.attr("y2", axisY + 6)
				.attr("stroke", cfg.colors.grid)
				.attr("stroke-width", 1);

			svg
				.append("text")
				.attr("x", tickX)
				.attr("y", axisY + 20)
				.attr("text-anchor", "middle")
				.attr("dominant-baseline", "auto")
				.attr("font-size", `${m.axisHalfSizePx}px`)
				.attr("fill", cfg.colors.gridText)
				.attr("font-weight", 500)
				.attr("letter-spacing", "0.08em")
				.attr("font-family", cfg.typography.monoFont)
				.text(`${tick}%`);
		}
	}

	// direction labels ─────────────────────────────────────────
	const dirY = axisY - 22;
	const removedDirX = centerX - halfGap - m.dirLabelOffsetX;
	const addedDirX = centerX + halfGap + m.dirLabelOffsetX;

	svg
		.append("text")
		.attr("class", "label")
		.attr("x", removedDirX)
		.attr("y", dirY)
		.attr("text-anchor", "end")
		.attr("dominant-baseline", "central")
		.attr("font-size", `${m.dirLabelSizePx}px`)
		.attr("font-weight", 600)
		.attr("letter-spacing", "0.08em")
		.attr("fill", colors.removed.text)
		.text("removed from the 1953 list <");

	svg
		.append("text")
		.attr("class", "label")
		.attr("x", addedDirX)
		.attr("y", dirY)
		.attr("text-anchor", "start")
		.attr("dominant-baseline", "central")
		.attr("font-size", `${m.dirLabelSizePx}px`)
		.attr("font-weight", 600)
		.attr("letter-spacing", "0.08em")
		.attr("fill", colors.added.text)
		.text("> added to the 2023 list");

	function yForLabel(v) {
		if (v <= 1.0) return binY(0);
		if (v >= 5.0) return binY(numBins - 1) + bandH;
		const bAbove = Math.round((v - 1.0) / binW) - 1;
		return binY(bAbove) + bandH + bandGap / 2;
	}

	const yAxisTop = yForLabel(1.0);
	const yAxisBottom = yForLabel(5.0);

	svg
		.append("line")
		.attr("class", "concr-bands-y-axis")
		.attr("x1", centerX)
		.attr("x2", centerX)
		.attr("y1", yAxisTop)
		.attr("y2", yAxisBottom)
		.attr("stroke", cfg.colors.grid)
		.attr("stroke-width", 1)
		.attr("stroke-opacity", 0.8)
		.attr("stroke-dasharray", "4 4");

	const axisValues = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
	const labelPadX = 4;
	const labelPadY = 2;
	for (const v of axisValues) {
		const y = yForLabel(v);
		const isWhole = Number.isInteger(v);

		if (isWhole) {
			for (const side of [-1, 1]) {
				svg
					.append("line")
					.attr("x1", centerX + side * halfGap * 0.3)
					.attr("x2", centerX + side * halfGap * 0.7)
					.attr("y1", y)
					.attr("y2", y)
					.attr("stroke", cfg.colors.grid)
					.attr("stroke-width", 0.8);
			}
		}

		const labelW = m.axisLabelW + labelPadX * 2;
		const labelH = m.axisLabelH + labelPadY * 2;
		svg
			.append("rect")
			.attr("class", "concr-bands-axis-label-bg")
			.attr("x", centerX - labelW / 2)
			.attr("y", y - labelH / 2)
			.attr("width", labelW)
			.attr("height", labelH)
			.attr("fill", cfg.colors.axisLabelBg)
			.attr("fill-opacity", 1)
			.attr("rx", 1);

		svg
			.append("text")
			.attr("x", centerX)
			.attr("y", y)
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "central")
			.attr("font-family", cfg.typography.monoFont)
			.attr("font-size", `${isWhole ? m.axisWholeSizePx : m.axisHalfSizePx}px`)
			.attr("font-weight", isWhole ? 600 : 400)
			.attr("fill", isWhole ? cfg.colors.muted : cfg.colors.gridText)
			.text(isWhole ? String(v) : v.toFixed(1));
	}

	svg
		.append("text")
		.attr("class", "endpoint-text")
		.attr("x", centerX)
		.attr("y", margin.top - m.endpointOffsetTop)
		.attr("text-anchor", "middle")
		.attr("font-size", `${m.endpointSizePx}px`)
		.attr("fill", cfg.colors.gridText)
		.text("abstract");

	svg
		.append("text")
		.attr("class", "endpoint-text")
		.attr("x", centerX)
		.attr("y", binY(numBins - 1) + bandH + m.endpointOffsetBottom)
		.attr("text-anchor", "middle")
		.attr("font-size", `${m.endpointSizePx}px`)
		.attr("fill", cfg.colors.gridText)
		.text("concrete");

	const bandsG = svg.append("g").attr("class", "all-bands");
	/** @type {Array<any>} */
	const allBands = [];
	const REP = cfg.marquee.repeat;
	const SPEED = m.marqueeSpeed;

	bins.forEach((bin, b) => {
		const y = binY(b);

		if (bin.removed.length > 0) {
			const bw = Math.max((bin.pct_removed / niceMax) * halfW, m.minBarWidth);
			const bx = centerX - halfGap - bw;
			const clipId = `${uid}-clip-${b}-removed`;

			defs
				.append("clipPath")
				.attr("id", clipId)
				.append("rect")
				.attr("x", bx)
				.attr("y", y)
				.attr("width", bw)
				.attr("height", bandH);

			const bg = bandsG.append("g").attr("class", "band-group");

			const highlightRect = bg
				.append("rect")
				.attr("class", "band-row-highlight")
				.attr("x", margin.left)
				.attr("y", y)
				.attr("width", halfW)
				.attr("height", bandH)
				.attr("fill", colors.removed.bgRow)
				.attr("rx", 1)
				.attr("opacity", 0);

			const bgRect = bg
				.append("rect")
				.attr("class", "band-bg")
				.attr("x", bx)
				.attr("y", y)
				.attr("width", bw)
				.attr("height", bandH)
				.attr("fill", colors.removed.bg)
				.attr("rx", 1);

			const wordStr = bin.removed.map((w) => w.toUpperCase()).join(",  ");
			const cycle = wordStr + ",   ";
			const repeated = cycle.repeat(REP);

			const txt = bg
				.append("text")
				.attr("class", "band-text")
				.attr("clip-path", `url(#${clipId})`)
				.attr("x", bx + bw - m.textPad)
				.attr("y", y + bandH / 2)
				.attr("dominant-baseline", "central")
				.attr("font-size", `${fontSize}px`)
				.attr("font-weight", 400)
				.attr("font-style", "italic")
				.attr("letter-spacing", "0.05em")
				.attr("fill", colors.removed.text)
				.attr("font-family", cfg.typography.serifFont)
				.text(repeated);

			bg.append("rect")
				.attr("class", "band-hit")
				.attr("x", bx)
				.attr("y", y)
				.attr("width", bw)
				.attr("height", bandH)
				.attr("fill", "transparent")
				.style("cursor", "default");

			allBands.push({
				group: bg,
				bgRect,
				highlightRect,
				txt,
				cycle,
				textStyle: {
					fontSize: `${fontSize}px`,
					fontFamily: cfg.typography.serifFont,
					fontWeight: 400,
					fontStyle: "italic",
					letterSpacing: "0.05em"
				},
				clipId,
				wideId: wideRemoved,
				anchor: bx + bw,
				direction: "rtl",
				y,
				w: bw,
				set: "removed",
				bin: b,
				lo: bin.lo,
				hi: bin.hi,
				pct: bin.pct_removed
			});
		}

		if (bin.added.length > 0) {
			const bw = Math.max((bin.pct_added / niceMax) * halfW, m.minBarWidth);
			const bx = centerX + halfGap;
			const clipId = `${uid}-clip-${b}-added`;

			defs
				.append("clipPath")
				.attr("id", clipId)
				.append("rect")
				.attr("x", bx)
				.attr("y", y)
				.attr("width", bw)
				.attr("height", bandH);

			const bg = bandsG.append("g").attr("class", "band-group");

			const highlightRect = bg
				.append("rect")
				.attr("class", "band-row-highlight")
				.attr("x", centerX + halfGap)
				.attr("y", y)
				.attr("width", halfW)
				.attr("height", bandH)
				.attr("fill", colors.added.bgRow)
				.attr("rx", 1)
				.attr("opacity", 0);

			const bgRect = bg
				.append("rect")
				.attr("class", "band-bg")
				.attr("x", bx)
				.attr("y", y)
				.attr("width", bw)
				.attr("height", bandH)
				.attr("fill", colors.added.bg)
				.attr("rx", 1);

			const wordStr = bin.added.map((w) => w.toUpperCase()).join(",  ");
			const cycle = wordStr + ",   ";
			const repeated = cycle.repeat(REP);

			const txt = bg
				.append("text")
				.attr("class", "band-text")
				.attr("clip-path", `url(#${clipId})`)
				.attr("x", bx + m.textPad)
				.attr("y", y + bandH / 2)
				.attr("dominant-baseline", "central")
				.attr("font-size", `${fontSize}px`)
				.attr("font-weight", 400)
				.attr("font-style", "italic")
				.attr("letter-spacing", "0.05em")
				.attr("fill", colors.added.text)
				.attr("font-family", cfg.typography.sansFont)
				.text(repeated);

			bg.append("rect")
				.attr("class", "band-hit")
				.attr("x", bx)
				.attr("y", y)
				.attr("width", bw)
				.attr("height", bandH)
				.attr("fill", "transparent")
				.style("cursor", "default");

			allBands.push({
				group: bg,
				bgRect,
				highlightRect,
				txt,
				cycle,
				textStyle: {
					fontSize: `${fontSize}px`,
					fontFamily: cfg.typography.sansFont,
					fontWeight: 400,
					fontStyle: "italic",
					letterSpacing: "0.05em"
				},
				clipId,
				wideId: wideAdded,
				anchor: bx,
				direction: "ltr",
				y,
				w: bw,
				set: "added",
				bin: b,
				lo: bin.lo,
				hi: bin.hi,
				pct: bin.pct_added
			});
		}
	});

	function textX(band) {
		const base = band.hovered ? band.hoverAnchor : band.anchor;
		const pad = m.textPad;
		if (band.direction === "rtl") {
			// Keep one full cycle already inside the clip so modulo wrap is seamless.
			return base - pad - band.cycleW - band.offset;
		}
		return base + pad - band.cycleW + band.offset;
	}

	function measureRepeatStride(cycle, style) {
		const probe = svg
			.append("text")
			.attr("visibility", "hidden")
			.attr("pointer-events", "none")
			.attr("font-size", style.fontSize)
			.attr("font-family", style.fontFamily)
			.attr("font-weight", style.fontWeight)
			.attr("font-style", style.fontStyle)
			.attr("letter-spacing", style.letterSpacing);

		probe.text(cycle);
		const w1 = probe.node()?.getComputedTextLength?.() ?? 0;
		probe.text(cycle + cycle);
		const w2 = probe.node()?.getComputedTextLength?.() ?? 0;
		probe.remove();

		const stride = w2 > w1 + 0.01 ? w2 - w1 : w1;
		return Math.max(stride, 1);
	}

	function measureBandCycles() {
		for (const band of allBands) {
			band.cycleW = measureRepeatStride(band.cycle, band.textStyle);
			const node = band.txt.node();
			const fullLen = node?.getComputedTextLength?.() ?? 0;
			if ((!Number.isFinite(band.cycleW) || band.cycleW <= 1) && fullLen > 0) {
				band.cycleW = Math.max(fullLen / REP, 1);
			}
			band.offset = Math.random() * band.cycleW;
			band.hovered = false;
		}
	}

	let marqueeRunning = false;
	let rafId = 0;
	let lastT = performance.now();
	const marqueeHalfRate =
		typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
	let marqueeSkipFrame = false;

	function setMarqueeActive(active) {
		const next = Boolean(active);
		if (next === marqueeRunning) return;
		if (next) {
			marqueeRunning = true;
			lastT = performance.now();
			if (!rafId) rafId = requestAnimationFrame(animateMarquee);
			return;
		}
		marqueeRunning = false;
		if (rafId) {
			cancelAnimationFrame(rafId);
			rafId = 0;
		}
	}

	function animateMarquee(now) {
		if (!marqueeRunning) return;
		if (marqueeHalfRate) {
			marqueeSkipFrame = !marqueeSkipFrame;
			if (marqueeSkipFrame) {
				if (marqueeRunning) rafId = requestAnimationFrame(animateMarquee);
				return;
			}
		}
		let dt = (now - lastT) / 1000;
		lastT = now;
		if (dt > 0.5) dt = 0.016;

		for (const band of allBands) {
			band.offset += SPEED * dt;
			const cw = band.cycleW;
			while (band.offset >= cw) band.offset -= cw;
			band.txt.attr("x", textX(band));
		}
		if (marqueeRunning) rafId = requestAnimationFrame(animateMarquee);
	}

	let hoveredBand = null;

	let pendingHoverRestore = null;
let interactionLocked = false;
let focusRanges = [];
	const HOVER_TRANSITION_MS = 200;
	const hoverEase = d3.easeCubicOut;
	const TR_FADE_OUT = "concr-hover-out";
	const TR_FADE_IN = "concr-hover-in";

	const ROW_HIGHLIGHT_ENABLED = false;
	/** Dimmed band opacity — shared by scroll focus and mouse hover. */
	const DIMMED_BAND_OPACITY = 0.07;

const hoverLayer = svg.append("g").attr("class", "hover-layer");

	function showRowHighlight(band, animate = false) {
		if (!ROW_HIGHLIGHT_ENABLED) return;
		const sel = band.highlightRect.interrupt(TR_FADE_OUT).interrupt(TR_FADE_IN);
		if (animate) {
			sel.transition(TR_FADE_IN).duration(HOVER_TRANSITION_MS).ease(hoverEase).attr("opacity", 1);
		} else {
			sel.attr("opacity", 1);
		}
	}

	function hideRowHighlight(band, animate = false) {
		const sel = band.highlightRect.interrupt(TR_FADE_OUT).interrupt(TR_FADE_IN);
		if (animate) {
			sel.transition(TR_FADE_OUT).duration(HOVER_TRANSITION_MS).ease(hoverEase).attr("opacity", 0);
		} else {
			sel.attr("opacity", 0);
		}
	}

	function finishHoverCleanup(band) {
		band.hovered = false;
		band.txt.attr("clip-path", `url(#${band.clipId})`);
		band.hoverAnchor = null;
	}

	function clearHoverLayer() {
		hoverLayer.selectAll("*").remove();
	}


	const ANNOT = { leader: 16, dotR: 2.5, stackStep: 30, textGap: 16, textInset: 6 };

	const formatPct = (p) => {
		const v = Math.round((Number(p) || 0) * 10) / 10;
		return Number.isInteger(v) ? String(v) : v.toFixed(1);
	};

	function drawBandAnnotations(bands) {
		const list = (bands || []).filter((b) => b && Number.isFinite(b.pct));
		if (!list.length) return;

		for (const side of ["removed", "added"]) {
			const sideBands = list.filter((b) => b.set === side).sort((a, b) => a.y - b.y);
			if (!sideBands.length) continue;

			const maxBottom = Math.max(...sideBands.map((b) => b.y + bandH));
			const stroke = colors[side].text;
			const label = side === "removed" ? "DISCARDED" : "ADDED";

			const textAnchor = side === "removed" ? "end" : "start";

			sideBands.forEach((band, i) => {
				const bx = side === "removed" ? band.anchor - band.w : band.anchor;
				const cx = bx + band.w / 2;
				const dotY = maxBottom + ANNOT.leader + i * ANNOT.stackStep;
				const textX =
					side === "removed" ? cx + ANNOT.textInset : cx - ANNOT.textInset;

				const g = hoverLayer
					.append("g")
					.attr("class", "band-annotation")
					.style("pointer-events", "none");

				g.append("rect")
					.attr("x", bx)
					.attr("y", band.y)
					.attr("width", band.w)
					.attr("height", bandH)
					.attr("fill", "none")
					.attr("stroke", stroke)
					.attr("stroke-width", 1)
					.attr("rx", 1);

				g.append("line")
					.attr("x1", cx)
					.attr("x2", cx)
					.attr("y1", band.y + bandH)
					.attr("y2", dotY)
					.attr("stroke", stroke)
					.attr("stroke-width", 1);

				g.append("circle")
					.attr("cx", cx)
					.attr("cy", dotY)
					.attr("r", ANNOT.dotR)
					.attr("fill", stroke);

				const labelText = g
					.append("text")
					.attr("class", "concr-bands-annotation-text")
					.attr("x", textX)
					.attr("y", dotY + ANNOT.textGap)
					.attr("text-anchor", textAnchor)
					.attr("dominant-baseline", "hanging")
					.attr("font-family", "var(--font-mono)")
					.attr("font-size", "16px")
					.attr("font-weight", 600)
					.attr("fill", cfg.colors.primary);

				labelText
					.append("tspan")
					.attr("x", textX)
					.attr("dy", 0)
					.text(`${formatPct(band.pct)}% OF`);
				labelText
					.append("tspan")
					.attr("x", textX)
					.attr("dy", "1.2em")
					.text(`${label} WORDS`);

			});
		}
	}

	function interruptHoverTransitions() {
		hoverLayer.selectAll(".hover-hit").interrupt(TR_FADE_OUT).interrupt(TR_FADE_IN);
		if (pendingHoverRestore) {
			const b = pendingHoverRestore;
			pendingHoverRestore = null;
			finishHoverCleanup(b);
			hideRowHighlight(b);
		}

		clearHoverLayer();
		bandsG.selectAll(".band-group").attr("opacity", 1);
	}

function isBandFocused(band) {
	if (!focusRanges.length) return true;
	return focusRanges.some((range) => band.lo >= range.lo && band.hi <= range.hi);
}

function applyFocusState() {
	clearHoverLayer();
	const hasForcedFocus = interactionLocked && focusRanges.length > 0;
	if (!hasForcedFocus) {
		for (const band of allBands) {
			band.hovered = false;
			band.hoverAnchor = null;
			band.txt.attr("clip-path", `url(#${band.clipId})`);
			hideRowHighlight(band);
		}
		bandsG.selectAll(".band-group").attr("opacity", 1);
		return;
	}

	const focusedBands = [];
	bandsG.selectAll(".band-group").each(function eachGroup() {
		const band = allBands.find((b) => b.group.node() === this);
		const focused = Boolean(band && isBandFocused(band));
		if (focused) focusedBands.push(band);
		d3.select(this).attr("opacity", focused ? 1 : DIMMED_BAND_OPACITY);
	});

	for (const band of allBands) {
		if (!focusedBands.includes(band)) {
			band.hovered = false;
			band.hoverAnchor = null;
			band.txt.attr("clip-path", `url(#${band.clipId})`);
			hideRowHighlight(band);
		}
	}

	for (const band of focusedBands) {
		band.hovered = true;
		band.hoverAnchor = band.direction === "rtl" ? centerX - halfGap : centerX + halfGap;
		band.txt.attr("clip-path", `url(#${band.wideId})`);
		showRowHighlight(band);
	}

	drawBandAnnotations(focusedBands);
}

	function clearHover() {
		if (!hoveredBand) return;
		const band = hoveredBand;
		hoveredBand = null;
		pendingHoverRestore = null;
		bandsG.selectAll(".band-group").attr("opacity", 1);

		finishHoverCleanup(band);
		clearHoverLayer();
		hideRowHighlight(band, true);
	}

	function showHover(band) {
		if (interactionLocked) return;
		if (hoveredBand === band) return;
		interruptHoverTransitions();

		if (hoveredBand) {
			const prev = hoveredBand;
			hoveredBand = null;
			finishHoverCleanup(prev);
			hideRowHighlight(prev);
			clearHoverLayer();
			bandsG.selectAll(".band-group").attr("opacity", 1);
		}

		hoveredBand = band;
		band.hovered = true;

		bandsG.selectAll(".band-group").each(function eachGroup() {
			d3.select(this).attr("opacity", this === band.group.node() ? 1 : DIMMED_BAND_OPACITY);
		});

		band.txt.attr("clip-path", `url(#${band.wideId})`);

		if (band.direction === "rtl") band.hoverAnchor = centerX - halfGap;
		else band.hoverAnchor = centerX + halfGap;

		const bgX = band.direction === "rtl" ? 0 : centerX + halfGap;
		const bgW = band.direction === "rtl" ? centerX - halfGap : W - (centerX + halfGap);

		showRowHighlight(band, true);

		band.group.raise();

		hoverLayer
			.append("rect")
			.attr("class", "hover-hit")
			.attr("x", bgX)
			.attr("y", band.y)
			.attr("width", bgW)
			.attr("height", bandH)
			.attr("fill", "transparent")
			.style("cursor", "default")
			.on("mouseleave", clearHover);

		drawBandAnnotations([band]);
	}

	bandsG.selectAll(".band-hit").on("mouseenter", function onEnter() {
	if (interactionLocked) return;
		const band = allBands.find((b) => b.group.node() === this.parentNode);
		if (band) showHover(band);
	});

	container.replaceChildren(svg.node());
	measureBandCycles();

	return {
	setInteractionLocked(locked) {
		const next = Boolean(locked);
		if (interactionLocked === next) return;
		interactionLocked = next;
		interruptHoverTransitions();
		if (hoveredBand) {
			const prev = hoveredBand;
			hoveredBand = null;
			finishHoverCleanup(prev);
		}
		applyFocusState();
	},
	setFocus(ranges = []) {
		focusRanges = (Array.isArray(ranges) ? ranges : [])
			.map((range) => {
				if (!range || typeof range !== "object") return null;
				const lo = Number(range.lo ?? range.min ?? range.from);
				const hi = Number(range.hi ?? range.max ?? range.to);
				if (!Number.isFinite(lo) || !Number.isFinite(hi)) return null;
				return { lo: Math.min(lo, hi), hi: Math.max(lo, hi) };
			})
			.filter(Boolean);
		applyFocusState();
	},
	clearFocus() {
		focusRanges = [];
		applyFocusState();
	},
	setMarqueeActive,
		destroy() {
			setMarqueeActive(false);
			interruptHoverTransitions();
			if (hoveredBand) {
				finishHoverCleanup(hoveredBand);
				hoveredBand = null;
			}
			bandsG.selectAll(".band-group").attr("opacity", 1);
			clearHoverLayer();
			svg.remove();
		}
	};
}
