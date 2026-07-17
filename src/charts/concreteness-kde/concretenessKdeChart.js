import * as d3 from "d3";

function readCssPx(el, varName, fallback) {
	if (!el) return fallback;
	const raw = getComputedStyle(el).getPropertyValue(varName).trim();
	if (!raw) return fallback;
	const n = parseFloat(raw);
	return Number.isFinite(n) ? n : fallback;
}

/** @param {HTMLElement | null | undefined} containerEl */
export function readConcretenessKdeMetrics(containerEl) {
	const root = containerEl?.closest?.(".concr-kde") ?? containerEl;
	const px = (name, fb) => readCssPx(root, name, fb);
	return {
		narrowBreakpoint: px("--concr-kde-narrow-breakpoint", 720),
		seriesLabelLineHeight: px("--concr-kde-series-label-line-height", 1.15)
	};
}

/**
 * @param {import("d3").Selection<SVGGElement, unknown, null, undefined>} g
 * @param {{
 *   x: number;
 *   y: number;
 *   lines: string[];
 *   fontSize: number;
 *   fill: string;
 *   fontFamily: string;
 *   lineHeight?: number;
 *   className?: string;
 *   seriesKey?: string;
 * }} opts
 */
function appendSeriesLabel(g, opts) {
	const {
		x,
		y,
		lines,
		fontSize,
		fill,
		fontFamily,
		lineHeight = 1.15,
		className = "concr-kde-series-label",
		seriesKey
	} = opts;

	const el = g
		.append("text")
		.attr("class", className)
		.attr("x", x)
		.attr("y", y)
		.attr("text-anchor", "start")
		.attr("font-family", fontFamily)
		.attr("font-size", `${fontSize}px`)
		.attr("fill", fill);

	if (seriesKey) el.attr("data-series", seriesKey);

	if (lines.length <= 1) {
		el.attr("dominant-baseline", "middle").text(lines[0] ?? "");
		return el;
	}

	el.attr("dominant-baseline", "central");
	for (let i = 0; i < lines.length; i++) {
		el.append("tspan")
			.attr("x", x)
			.attr("dy", i === 0 ? `${-(lineHeight * (lines.length - 1)) / 2}em` : `${lineHeight}em`)
			.text(lines[i]);
	}

	return el;
}

/** @param {string} label */
function seriesLabelLines(label, narrow) {
	const upper = label.toUpperCase();
	if (!narrow) return [upper];
	const space = label.indexOf(" ");
	if (space > 0) {
		return [label.slice(0, space).toUpperCase(), label.slice(space + 1).toUpperCase()];
	}
	return [upper];
}

/**
 * @param {HTMLElement} container
 * @param {typeof CONCRETENESS_KDE_CONFIG} c
 * @param {boolean} narrow
 */
function measureSeriesLabelsWidth(container, c, narrow) {
	const fontSize = c.seriesLabels.fontSizePx;
	const probeRoot = d3
		.create("svg")
		.attr("width", 0)
		.attr("height", 0)
		.style("position", "absolute")
		.style("visibility", "hidden")
		.style("pointer-events", "none");

	container.appendChild(probeRoot.node());
	const probe = probeRoot
		.append("text")
		.attr("class", "concr-kde-series-label")
		.attr("font-size", `${fontSize}px`);

	let maxW = 0;
	for (const sm of c.series) {
		for (const line of seriesLabelLines(sm.label, narrow)) {
			probe.text(line);
			maxW = Math.max(maxW, probe.node()?.getComputedTextLength?.() ?? 0);
		}
	}

	probeRoot.remove();
	return maxW;
}

/**
 * @param {HTMLElement} container
 * @param {typeof CONCRETENESS_KDE_CONFIG} c
 * @param {boolean} narrow
 */
function seriesLabelsRightMargin(container, c, narrow) {
	const labelW = measureSeriesLabelsWidth(container, c, narrow);
	return Math.ceil(c.seriesLabels.offsetX + labelW + c.seriesLabels.paddingRight);
}

export const CONCRETENESS_KDE_CONFIG = {
	layout: {
		/** width comes from the container at render time */
		height: 250,
		margin: { top: 8, right: 0, bottom: 32, left: 0 }
	},
	x: {
		domain: [1, 5],
		tickValues: [1, 2, 3, 4, 5]
	},
	y: {
		domainTopPadding: 1.08
	},
	zones: {
		concrete: { from: 4.5, to: 5.0, fill: "var(--color-accent)", fillOpacity: 0.1 }
	},
	boundaries: {
		xValues: [1, 2, 3, 4, 5],
		strokeWidth: 0,
		dasharray: "4,4"
	},
	colors: {
		background: "var(--concr-kde-bg, var(--color-bg, #fffff1))",
		grid: "var(--color-secondary)",
		gridText: "var(--color-secondary)"
	},
	typography: {
		fontFamily: "var(--font-mono)",
		tickLabelSizePx: 15,
		axisEndLabelSizePx: 15
	},
	axis: {
		tickLineLength: 7,
		tickLabelYOffset: 22,
		endLabelYOffset: 42,
		abstractLabel: "abstract",
		concreteLabel: "concrete"
	},
	strokes: {
		baselineWidth: 1,
		kdeLineWidth: 3,
		kdeOpacity: 1
	},
	series: [
		{ key: "gsl", label: "1953 list", color: "var(--color-accent)", dash: "5 5", lineWidthPx: 2 },
		{ key: "ngsl", label: "2023 list", color: "var(--color-accent)", lineWidthPx: 1.5 }
	],
	seriesLabels: {
		offsetX: 8,
		fontSizePx: 15,
		minSeparationPx: 14,
		paddingRight: 2,
		color: "var(--color-primary)"
	},
	densityHint: {
		x: 0,
		startY: 12,
		lineHeight: 18,
		fontSizePx: 13,
		moreLabel: "MORE WORDS",
		lessLabel: "FEWER WORDS",
		chevronSizePx: 8
	},
	sourceNote: {
		fontSize: "13px",
		fontFamily: "var(--font-sans)",
		color: "var(--color-small-text)"
	}
};

/**
 * @param {HTMLElement} container
 * @param {{ x: number[]; series: Record<string, { values: number[] }> }} payload
 * @param {{ width: number }} options
 */
export function renderConcretenessKde(container, payload, { width }) {
	const c = CONCRETENESS_KDE_CONFIG;
	const metrics = readConcretenessKdeMetrics(container);
	const W = Math.max(1, Math.round(width));
	const screenW = typeof window !== "undefined" ? window.innerWidth : Infinity;
	const isNarrow = screenW <= metrics.narrowBreakpoint;
	const H = c.layout.height;
	const margin = {
		...c.layout.margin,
		right: seriesLabelsRightMargin(container, c, isNarrow)
	};
	const plotW = W - margin.left - margin.right;
	const plotH = H - margin.top - margin.bottom;

	const xScale = d3.scaleLinear().domain(c.x.domain).range([0, plotW]);

	let yMax = 0;
	for (const sm of c.series) {
		const vals = payload.series[sm.key]?.values;
		if (!vals) continue;
		const m = d3.max(vals);
		if (m > yMax) yMax = m;
	}
	const yScale = d3
		.scaleLinear()
		.domain([0, yMax * c.y.domainTopPadding])
		.range([plotH, 0]);

	const svg = d3
		.create("svg")
		.attr("width", W)
		.attr("height", H)
		.attr("viewBox", [0, 0, W, H])
		.style("width", "100%")
		.style("height", "auto")
		.style("display", "block");

	svg.append("rect").attr("width", W).attr("height", H).attr("fill", c.colors.background);

	const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

	const xAxis = g.append("g").attr("transform", `translate(0,${plotH})`);
	const [xMin, xMax] = c.x.domain;
	for (const v of c.x.tickValues) {
		xAxis
			.append("line")
			.attr("x1", xScale(v))
			.attr("x2", xScale(v))
			.attr("y1", 0)
			.attr("y2", c.axis.tickLineLength)
			.attr("stroke", c.colors.grid);
		xAxis
			.append("text")
			.attr("x", xScale(v))
			.attr("y", c.axis.tickLabelYOffset)
			.attr("text-anchor", v === xMin ? "start" : v === xMax ? "end" : "middle")
			.attr("font-family", c.typography.fontFamily)
			.attr("font-size", `${c.typography.tickLabelSizePx}px`)
			.attr("fill", c.colors.gridText)
			.text(v);
	}
	xAxis
		.append("text")
		.attr("class", "concr-kde-axis-end-label")
		.attr("x", xScale(c.x.domain[0]))
		.attr("y", c.axis.endLabelYOffset)
		.attr("text-anchor", "start")
		.attr("font-family", c.typography.fontFamily)
		.attr("font-size", `${c.typography.axisEndLabelSizePx}px`)
		.attr("fill", c.colors.gridText)
		.text(c.axis.abstractLabel);
	xAxis
		.append("text")
		.attr("class", "concr-kde-axis-end-label")
		.attr("x", xScale(c.x.domain[1]))
		.attr("y", c.axis.endLabelYOffset)
		.attr("text-anchor", "end")
		.attr("font-family", c.typography.fontFamily)
		.attr("font-size", `${c.typography.axisEndLabelSizePx}px`)
		.attr("fill", c.colors.gridText)
		.text(c.axis.concreteLabel);

	const zCo = c.zones.concrete;
	const zoneConcrX = xScale(zCo.from);
	const zoneConcrW = xScale(zCo.to) - xScale(zCo.from);
	g.append("rect")
		.attr("x", zoneConcrX)
		.attr("y", 0)
		.attr("width", zoneConcrW)
		.attr("height", plotH)
		.attr("fill", zCo.fill)
		.attr("fill-opacity", zCo.fillOpacity);

	for (const v of c.boundaries.xValues) {
		g.append("line")
			.attr("x1", xScale(v))
			.attr("x2", xScale(v))
			.attr("y1", 0)
			.attr("y2", plotH)
			.attr("stroke", c.colors.grid)
			.attr("stroke-width", c.boundaries.strokeWidth)
			.attr("stroke-dasharray", c.boundaries.dasharray)
			.attr("stroke-opacity", 0.5);
	}

	g.append("line")
		.attr("x1", 0)
		.attr("x2", plotW)
		.attr("y1", plotH)
		.attr("y2", plotH)
		.attr("stroke", c.colors.grid)
		.attr("stroke-width", c.strokes.baselineWidth);

	const lineGen = d3
		.line()
		.x((d, i) => xScale(payload.x[i]))
		.y((d) => yScale(d))
		.curve(d3.curveBasis);

	const endLabelX = xScale(c.x.domain[1]) + c.seriesLabels.offsetX;
	const labelEnds = [];

	for (const sm of c.series) {
		const vals = payload.series[sm.key]?.values;
		if (!vals) continue;
		const path = g
			.append("path")
			.datum(vals)
			.attr("d", lineGen)
			.attr("fill", "none")
			.attr("stroke", sm.color)
			.attr("stroke-width", sm.lineWidthPx ?? c.strokes.kdeLineWidth)
			.attr("stroke-opacity", c.strokes.kdeOpacity);
		if (sm.dash) path.attr("stroke-dasharray", sm.dash);

		const endY = yScale(vals[vals.length - 1]);
		labelEnds.push({ sm, y: endY });
	}

	const minSep = c.seriesLabels.minSeparationPx;
	if (labelEnds.length === 2) {
		const gap = labelEnds[1].y - labelEnds[0].y;
		if (Math.abs(gap) < minSep) {
			const mid = (labelEnds[0].y + labelEnds[1].y) / 2;
			labelEnds[0].y = mid - minSep / 2;
			labelEnds[1].y = mid + minSep / 2;
		}
	}

	for (const { sm, y } of labelEnds) {
		appendSeriesLabel(g, {
			x: endLabelX,
			y,
			lines: seriesLabelLines(sm.label, isNarrow),
			fontSize: c.seriesLabels.fontSizePx,
			fill: sm.labelColor ?? c.seriesLabels.color,
			fontFamily: c.typography.fontFamily,
			lineHeight: metrics.seriesLabelLineHeight,
			seriesKey: sm.key
		});
	}

	drawDensityHint(g, c);

	container.replaceChildren(svg.node());

	return {
		destroy() {
			svg.remove();
		}
	};
}

function drawDensityHint(g, c) {
	const h = c.densityHint;
	const hint = g.append("g").attr("class", "concr-kde-density-hint");

	const rows = [
		{ chevron: "up", label: h.moreLabel, y: h.startY },
		{ chevron: "down", label: h.lessLabel, y: h.startY + h.lineHeight }
	];

	const chevronW = h.chevronSizePx;
	const textX = h.x + chevronW + 4;

	for (const row of rows) {
		const rowG = hint.append("g").attr("transform", `translate(${h.x},${row.y})`);
		drawChevron(rowG, row.chevron, chevronW);
		rowG
			.append("text")
			.attr("class", "concr-kde-hint-label")
			.attr("x", textX)
			.attr("y", 0)
			.attr("dominant-baseline", "middle")
			.attr("font-family", c.typography.fontFamily)
			.attr("font-size", `${h.fontSizePx}px`)
			.attr("fill", c.colors.gridText)
			.text(row.label);
	}
}

function drawChevron(g, direction, size, height = 5) {
	const cy = -1;
	const halfW = size / 2;
	const halfH = height / 2;
	let path;
	if (direction === "up") {
		path = `M 0 ${cy + halfH} L ${halfW} ${cy - halfH} L ${size} ${cy + halfH}`;
	} else {
		path = `M 0 ${cy - halfH} L ${halfW} ${cy + halfH} L ${size} ${cy - halfH}`;
	}
	g.append("path")
		.attr("d", path)
		.attr("stroke", "var(--color-primary)")
		.attr("stroke-width", 1)
		.attr("fill", "none")
		.attr("class", "concr-kde-density-chevron");
}

