import * as d3 from "d3";

function readCssPx(el, varName, fallback) {
	if (!el) return fallback;
	const raw = getComputedStyle(el).getPropertyValue(varName).trim();
	if (!raw) return fallback;
	const n = parseFloat(raw);
	return Number.isFinite(n) ? n : fallback;
}

function readCssString(el, varName, fallback) {
	if (!el) return fallback;
	const raw = getComputedStyle(el).getPropertyValue(varName).trim();
	return raw || fallback;
}


export function readScopeMetrics(containerEl) {
	const root = containerEl?.closest?.(".scope") ?? containerEl;
	const px = (name, fb) => readCssPx(root, name, fb);
	const str = (name, fb) => readCssString(root, name, fb);
	return {
		// layout
		viewBox: px("--scope-viewbox", 1000),
		centerR: px("--scope-center-r", 32),
		maxR: px("--scope-max-r", 360),
		ringGap: px("--scope-ring-gap", 32),
		minRingDepthPx: px("--scope-min-ring-depth", 10),
		splitGapPx: px("--scope-split-gap", 8),
		labelGapBias: parseFloat(str("--scope-label-gap-bias", "0.25")) || 0,
		labelOuterPad: px("--scope-label-outer-pad", 8),
		// tiles
		rectW: px("--scope-rect-w", 8),
		rectH: px("--scope-rect-h", 2),
		dotEdgeGap: px("--scope-dot-edge-gap", 1.5),
		dotAlign: str("--scope-dot-align", "inner"),
		hitRadius: px("--scope-hit-radius", 5),
		hoverScale: parseFloat(str("--scope-hover-scale", "1.6")) || 1.6,
		// typography
		ringLabelSize: px("--scope-ring-label-size", 12),
		pctLabelSize: px("--scope-pct-label-size", 10),
		// transitions
		focusFadeMs: px("--scope-focus-fade-ms", 220)
	};
}

export const SCOPE_COLORS = {
	background: "var(--color-bg, #FFFFF1)",
	remained: "var(--scope-color-remained, var(--color-secondary, #8F8A77))",
	removed: "var(--scope-color-removed, var(--color-gsl, #ED9027))",
	added: "var(--scope-color-added, var(--color-ngsl, #DB6AE8))",
	ringStroke: "var(--scope-ring-stroke, #d0cbc4)",
	divider: "var(--scope-divider, var(--color-primary, #5B5B5B))",
	label: "var(--scope-label, var(--color-primary, #504a44))"
};

const SET_LABELS = {
	remained: "in both lists",
	removed: "removed word",
	added: "added word"
};

/**
 * @param {HTMLElement} container
 * @param {ReturnType<typeof import("./scopePayload.js").buildScopePayload>} payload
 */
export function renderScopeChart(container, payload) {
	if (!container || !payload) return null;
	const m = readScopeMetrics(container);

	const W = m.viewBox;
	const H = m.viewBox;
	const cx = W / 2;
	const cy = H / 2;
	const halfSplit = m.splitGapPx / 2;
	const cxLeft = cx - halfSplit;
	const cxRight = cx + halfSplit;

	const radialStride = m.rectW + m.dotEdgeGap;
	const tangentialStride = m.rectH + m.dotEdgeGap;

	const rings = payload.rings;
	const nRings = rings.length;

	rings.forEach((ring, ri) => {
		ring.gslWords.forEach((w, i) => {
			w._id = `g-${ri}-${i}`;
			w._ringIdx = ri;
			w._side = "left";
		});
		ring.ngslWords.forEach((w, i) => {
			w._id = `n-${ri}-${i}`;
			w._ringIdx = ri;
			w._side = "right";
		});
	});

	function computeRingRadialDepth(rMin, wordCount) {
		if (wordCount <= 0) return m.minRingDepthPx;
		let idx = 0;
		let r = rMin + m.rectW / 2 + m.dotEdgeGap * 0.5;
		const positions = [];
		while (idx < wordCount) {
			const capacity = Math.max(1, Math.floor((Math.PI * r) / tangentialStride));
			const n = Math.min(capacity, wordCount - idx);
			positions.push({ r, n, full: n === capacity });
			idx += n;
			r += radialStride;
		}
		if (!positions.length) return m.minRingDepthPx;
		if (m.dotAlign === "center") {
			const usedR =
				positions[positions.length - 1].r + m.rectW / 2 - (positions[0].r - m.rectW / 2);
			return Math.max(m.minRingDepthPx, usedR);
		}
		const lastR = positions[positions.length - 1].r;
		return Math.max(m.minRingDepthPx, lastR + m.rectW / 2 - rMin);
	}

	function clearWordLayout() {
		for (const ring of rings) {
			for (const w of ring.gslWords) {
				w.x = null;
				w.y = null;
				w.theta = null;
			}
			for (const w of ring.ngslWords) {
				w.x = null;
				w.y = null;
				w.theta = null;
			}
		}
	}

	function placementOverflow() {
		for (const ring of rings) {
			for (const w of ring.gslWords) if (w.x == null) return true;
			for (const w of ring.ngslWords) if (w.x == null) return true;
		}
		return false;
	}

	function placeDots(words, rMin, rMax, side) {
		const cxSide = side === "left" ? cxLeft : cxRight;
		let idx = 0;
		let r = rMin + m.rectW / 2 + m.dotEdgeGap * 0.5;
		const positions = [];

		while (idx < words.length && r + m.rectW / 2 <= rMax + 0.5) {
			const capacity = Math.max(1, Math.floor((Math.PI * r) / tangentialStride));
			const n = Math.min(capacity, words.length - idx);
			positions.push({ r, n, startIdx: idx, full: n === capacity });
			idx += n;
			r += radialStride;
		}

		const usedR = positions.length
			? positions[positions.length - 1].r + m.rectW / 2 - (positions[0].r - m.rectW / 2)
			: 0;
		const rOffset = m.dotAlign === "center" ? Math.max(0, (rMax - rMin - usedR) / 2) : 0;

		for (const pos of positions) {
			const ar = pos.r + rOffset;
			const step = pos.full
				? Math.PI / pos.n
				: Math.PI / Math.max(1, Math.floor((Math.PI * ar) / tangentialStride));
			const start = step / 2;
			for (let i = 0; i < pos.n; i++) {
				const angle = start + i * step;
				const theta = side === "left" ? -Math.PI / 2 - angle : -Math.PI / 2 + angle;
				const w = words[pos.startIdx + i];
				w.x = cxSide + ar * Math.cos(theta);
				w.y = cy + ar * Math.sin(theta);
				w.theta = theta;
			}
		}
	}


	let rCursor = m.centerR;
	const naturalDepths = [];
	for (const ring of rings) {
		const wc = Math.max(ring.gslWords.length, ring.ngslWords.length);
		const need = computeRingRadialDepth(rCursor, wc);
		const d = Math.max(m.minRingDepthPx, need);
		naturalDepths.push(d);
		rCursor += d + m.ringGap;
	}


	const gapTotal = (nRings - 1) * m.ringGap;
	const budget = m.maxR - m.centerR - gapTotal;
	const sumNatural = naturalDepths.reduce((a, b) => a + b, 0);
	let scale = sumNatural > 0 ? budget / sumNatural : 1;

	let bands = [];
	let outerR = m.centerR;
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
			placeDots(ring.gslWords, bands[i].rMin, bands[i].rMax, "left");
			placeDots(ring.ngslWords, bands[i].rMin, bands[i].rMax, "right");
		});
		if (!placementOverflow()) break;
		scale *= 1.035;
	}

	const plotR = Math.max(m.maxR, outerR);

	const dividerClearance = 24;
	const padTop = dividerClearance;
	const padBottom = dividerClearance;
	const padX = m.rectW; 
	const vbX = cx - plotR - padX;
	const vbY = cy - plotR - padTop;
	const vbW = plotR * 2 + padX * 2;
	const vbH = plotR * 2 + padTop + padBottom;

	const svg = d3
		.create("svg")
		.attr("class", "scope-svg")
		.attr("viewBox", [vbX, vbY, vbW, vbH])
		.attr("width", vbW)
		.attr("height", vbH)
		.style("display", "block")
		.style("overflow", "visible");

	const defs = svg.append("defs");

	// Ring boundary arcs
	function semiArc(r, side) {
		const cx0 = side === "left" ? cxLeft : cxRight;
		const top = `${cx0} ${cy - r}`;
		const bot = `${cx0} ${cy + r}`;
		const flag = side === "left" ? 0 : 1;
		return `M ${top} A ${r} ${r} 0 0 ${flag} ${bot}`;
	}

	const ringArcsG = svg.append("g").attr("class", "scope-ring-arcs");
	bands.forEach((band) => {
		for (const side of ["left", "right"]) {
			for (const r of [band.rMin, band.rMax]) {
				if (r <= m.centerR + 0.5) continue;
				ringArcsG
					.append("path")
					.attr("d", semiArc(r, side))
					.attr("fill", "none")
					.attr("stroke", SCOPE_COLORS.ringStroke)
					.attr("stroke-width", 0.5);
			}
		}
	});

	// Center divider line
	svg.append("line")
		.attr("class", "scope-divider")
		.attr("x1", cx)
		.attr("x2", cx)
		.attr("y1", cy - plotR - 12)
		.attr("y2", cy + plotR + 12)
		.attr("stroke", SCOPE_COLORS.divider)
		.attr("stroke-width", 0.5)
		.attr("stroke-dasharray", "5,5")
		.attr("stroke-opacity", 0.5);

	const allDots = [];
	for (const ring of rings) {
		for (const w of ring.gslWords) if (w.x != null) allDots.push(w);
		for (const w of ring.ngslWords) if (w.x != null) allDots.push(w);
	}

	const dotLayer = svg.append("g").attr("class", "scope-dots");

	const dotSel = dotLayer
		.selectAll("rect.scope-dot")
		.data(allDots, (d) => d._id)
		.join("rect")
		.attr("class", (d) => `scope-dot scope-dot--${d.s}`)
		.attr("data-id", (d) => d._id)
		.attr("data-ring", (d) => d._ringIdx + 1)
		.attr("x", (d) => d.x - m.rectW / 2)
		.attr("y", (d) => d.y - m.rectH / 2)
		.attr("width", m.rectW)
		.attr("height", m.rectH)
		.attr("fill", (d) => {
			if (d.s === "remained") return SCOPE_COLORS.remained;
			if (d.s === "removed") return SCOPE_COLORS.removed;
			return SCOPE_COLORS.added;
		})
		.attr("transform", (d) => `rotate(${(d.theta * 180) / Math.PI}, ${d.x}, ${d.y})`)
		.style("pointer-events", "none");

	// Invisible hit targets so small rectangles are easy to hover
	const hitSel = dotLayer
		.selectAll("circle.scope-hit")
		.data(allDots, (d) => d._id)
		.join("circle")
		.attr("class", "scope-hit")
		.attr("data-id", (d) => d._id)
		.attr("data-ring", (d) => d._ringIdx + 1)
		.attr("cx", (d) => d.x)
		.attr("cy", (d) => d.y)
		.attr("r", m.hitRadius)
		.attr("fill", "transparent")
		.style("cursor", "default");

	// Ring labels
	const labelLayer = svg.append("g").attr("class", "scope-ring-labels");
	const spc = "\u00A0\u00A0\u00A0\u00A0";
	const span = 1.4;

	function appendLabelTspans(parent, ring) {
		parent
			.append("tspan")
			.attr("class", "scope-pct scope-pct--gsl")
			.attr("font-size", m.pctLabelSize)
			.text(`${ring.gslPct.toFixed(1)}%`);

		parent.append("tspan").text(spc);

		parent
			.append("tspan")
			.attr("class", "scope-ring-name")
			.text(ring.name.toUpperCase());

		parent.append("tspan").text(spc);

		parent
			.append("tspan")
			.attr("class", "scope-pct scope-pct--ngsl")
			.attr("font-size", m.pctLabelSize)
			.text(`${ring.ngslPct.toFixed(1)}%`);
	}

	rings.forEach((ring, i) => {
		const text = labelLayer
			.append("text")
			.attr("class", "scope-ring-label")
			.attr("data-ring", i + 1)
			.attr("font-size", m.ringLabelSize)
			.attr("fill", SCOPE_COLORS.label)
			.attr("paint-order", "stroke")
			.attr("stroke", SCOPE_COLORS.background)
			.attr("stroke-width", 4)
			.attr("stroke-linecap", "round")
			.attr("stroke-linejoin", "round");

		if (i === 0) {
			text
				.attr("x", cx)
				.attr("y", cy)
				.attr("text-anchor", "middle")
				.attr("dominant-baseline", "middle");

			const nameWords = ring.name.toUpperCase().split(/\s+/).filter(Boolean);

			if (nameWords.length >= 2) {
				// top line: first word
				text
					.append("tspan")
					.attr("class", "scope-ring-name")
					.attr("x", cx)
					.attr("dy", "-0.5em")
					.text(nameWords[0]);

				// middle line: percentages flanking
				const middle = text.append("tspan").attr("x", cx).attr("dy", "0");
				middle
					.append("tspan")
					.attr("class", "scope-pct scope-pct--gsl")
					.attr("font-size", m.pctLabelSize)
					.text(`${ring.gslPct.toFixed(1)}%`);
				middle.append("tspan").text(spc);
				middle.append("tspan").text(spc);
				middle
					.append("tspan")
					.attr("class", "scope-pct scope-pct--ngsl")
					.attr("font-size", m.pctLabelSize)
					.text(`${ring.ngslPct.toFixed(1)}%`);

				// bottom line: remaining word(s)
				text
					.append("tspan")
					.attr("class", "scope-ring-name")
					.attr("x", cx)
					.attr("dy", "1em")
					.text(nameWords.slice(1).join(" "));
			} else {
				appendLabelTspans(text, ring);
			}
			return;
		}

	
		const innerPad = m.ringGap * m.labelGapBias;
		const r = bands[i].rMin - innerPad - m.ringLabelSize;

		const a1 = -Math.PI / 2 - span;
		const a2 = -Math.PI / 2 + span;
		const x1 = cx + r * Math.cos(a1);
		const y1 = cy + r * Math.sin(a1);
		const x2 = cx + r * Math.cos(a2);
		const y2 = cy + r * Math.sin(a2);

		const arcId = `scope-ring-arc-${i}`;
		defs.append("path").attr("id", arcId).attr("d", `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`);

		const textPath = text
			.append("textPath")
			.attr("href", `#${arcId}`)
			.attr("startOffset", "50%")
			.attr("text-anchor", "middle");

		appendLabelTspans(textPath, ring);
	});

	// ---- Hover state ----
	let hoveredId = null;
	let interactionLocked = false;
	/** @type {Set<number>} ring ids (1-5) */
	let focusRings = new Set();

	const onHoverChange = { listeners: [] };
	function notifyHover(payload) {
		for (const fn of onHoverChange.listeners) fn(payload);
	}

	function setHover(d) {
		hoveredId = d ? d._id : null;
		dotSel.each(function eachDot(dd) {
			const sel = d3.select(this);
			if (d && dd._id === d._id) {
				const deg = (dd.theta * 180) / Math.PI;
				sel
					.attr("stroke", "var(--color-primary, #222)")
					.attr("stroke-width", 0.6)
					.attr(
						"transform",
						`translate(${dd.x},${dd.y}) rotate(${deg}) scale(${m.hoverScale}) translate(${-dd.x},${-dd.y})`
					);
				sel.raise();
			} else {
				sel
					.attr("stroke", null)
					.attr("stroke-width", null)
					.attr("transform", `rotate(${(dd.theta * 180) / Math.PI}, ${dd.x}, ${dd.y})`);
			}
		});
		notifyHover(d ?? null);
	}

	function applyFocusState() {
		const hasForcedFocus = interactionLocked && focusRings.size > 0;
		if (!hasForcedFocus) {
			dotLayer.selectAll(".scope-dot").transition().duration(m.focusFadeMs).style("opacity", 1);
			labelLayer.selectAll(".scope-ring-label").transition().duration(m.focusFadeMs).style("opacity", 1);
			return;
		}
		dotLayer
			.selectAll(".scope-dot")
			.transition()
			.duration(m.focusFadeMs)
			.style("opacity", function () {
				const ring = Number(this.getAttribute("data-ring"));
				return focusRings.has(ring) ? 1 : 0.07;
			});
		labelLayer
			.selectAll(".scope-ring-label")
			.transition()
			.duration(m.focusFadeMs)
			.style("opacity", function () {
				const ring = Number(this.getAttribute("data-ring"));
				return focusRings.has(ring) ? 1 : 0.25;
			});
	}

	hitSel.on("mouseenter", function onEnter(_event, d) {
		if (interactionLocked) return;
		if (hoveredId === d._id) return;
		setHover(d);
	});
	hitSel.on("mouseleave", function onLeave() {
		if (interactionLocked) return;
		if (hoveredId == null) return;
		setHover(null);
	});

	container.replaceChildren(svg.node());

	return {

		onHover(fn) {
			onHoverChange.listeners.push(fn);
			return () => {
				onHoverChange.listeners = onHoverChange.listeners.filter((l) => l !== fn);
			};
		},
		setInteractionLocked(locked) {
			const next = Boolean(locked);
			if (interactionLocked === next) return;
			interactionLocked = next;
			if (interactionLocked) setHover(null);
		},
		setFocus(rings) {
			focusRings = new Set(
				(Array.isArray(rings) ? rings : [])
					.map((r) => Number(r))
					.filter((r) => Number.isInteger(r) && r >= 1 && r <= nRings)
			);
			applyFocusState();
		},
		clearFocus() {
			focusRings = new Set();
			applyFocusState();
		},
		destroy() {
			onHoverChange.listeners = [];
			svg.remove();
		}
	};
}
