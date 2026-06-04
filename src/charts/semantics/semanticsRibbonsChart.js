import * as d3 from "d3";

const CHANGE_THRESHOLD = 20;

const LAYOUT = {
	margin: { top: 50, right: 200, bottom: 50, left: 200 },
	colW: 0,
	gapW: 640,
	bandGap: 13,
	plotH: 760
};

const BASE_SLOPE_WIDTH = LAYOUT.colW + LAYOUT.gapW + LAYOUT.colW;

function cssNumber(el, name, fallback) {
	const value = Number.parseFloat(getComputedStyle(el).getPropertyValue(name));
	return Number.isFinite(value) ? value : fallback;
}

const RIBBON_COLOR_DEFAULTS = {
	up: "#f493ff",
	down: "#ffaa4a",
	tan: "#b2a47f"
};

const PCT_CAP_TEXT_DEFAULTS = {
	up: "#962FA2",
	down: "#9B5B12",
	tan: "#635D43"
};

function parseColorToRgb(color) {
	const s = String(color ?? "").trim();
	if (!s) return null;
	if (s.startsWith("#")) {
		let h = s.slice(1);
		if (h.length === 3) h = h.split("").map((ch) => ch + ch).join("");
		if (h.length !== 6) return null;
		return {
			r: Number.parseInt(h.slice(0, 2), 16),
			g: Number.parseInt(h.slice(2, 4), 16),
			b: Number.parseInt(h.slice(4, 6), 16)
		};
	}
	const match = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
	if (!match) return null;
	return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) };
}

function rgbToHex({ r, g, b }) {
	const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
	const hex = (v) => clamp(v).toString(16).padStart(2, "0");
	return `#${hex(r)}${hex(g)}${hex(b)}`;
}

function blendColors(foreground, background, alpha) {
	const fg = parseColorToRgb(foreground);
	const bg = parseColorToRgb(background);
	if (!fg || !bg) return foreground;
	return rgbToHex({
		r: fg.r * alpha + bg.r * (1 - alpha),
		g: fg.g * alpha + bg.g * (1 - alpha),
		b: fg.b * alpha + bg.b * (1 - alpha)
	});
}

function resolveCssColor(el, cssVar, defaults, key) {
	const fromCss = getComputedStyle(el).getPropertyValue(cssVar).trim();
	return fromCss || defaults[key] || defaults.tan;
}

function resolvedRibbonHex(el, key) {
	return resolveCssColor(el, `--sem-ribbon-${key}`, RIBBON_COLOR_DEFAULTS, key);
}

function resolvedPctCapTextColor(el, key) {
	return resolveCssColor(el, `--sem-pct-cap-${key}-text`, PCT_CAP_TEXT_DEFAULTS, key);
}

function splitLabelTwoLines(text, targetChars) {
	const raw = String(text ?? "").trim();
	if (!raw) return [""];
	if (raw.length <= targetChars) return [raw];

	const words = raw.split(/\s+/).filter(Boolean);
	if (words.length === 1) {
		const cut = Math.max(4, Math.min(raw.length - 3, targetChars));
		return [raw.slice(0, cut), raw.slice(cut)];
	}

	let line1 = "";
	let i = 0;
	while (i < words.length) {
		const candidate = line1 ? `${line1} ${words[i]}` : words[i];
		if (candidate.length > targetChars && line1) break;
		line1 = candidate;
		i += 1;
	}

	const line2 = words.slice(i).join(" ");
	if (!line2) return [line1];
	return [line1, line2];
}

function normalizeCategoryKey(value) {
	return String(value ?? "")
		.toLowerCase()
		.replace(/&/g, "and")
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

function snapCoord(value) {
	return Math.round(value * 2) / 2;
}

function ribbonYs(c, ribbonCapTrim) {
	const gH = c.gslY1 - c.gslY0;
	const nH = c.ngslY1 - c.ngslY0;
	const trim = Math.min(
		ribbonCapTrim,
		gH * 0.2,
		nH * 0.2,
		Math.max(0, gH - 1) / 2,
		Math.max(0, nH - 1) / 2
	);
	if (trim <= 0 || gH <= trim * 2 || nH <= trim * 2) {
		return { g0: c.gslY0, g1: c.gslY1, n0: c.ngslY0, n1: c.ngslY1, trim: 0 };
	}
	return {
		g0: c.gslY0 + trim,
		g1: c.gslY1 - trim,
		n0: c.ngslY0 + trim,
		n1: c.ngslY1 - trim,
		trim
	};
}

function ribbonBandPath(c, leftX, rightX, mx, ribbonCapTrim = 0) {
	const { g0, g1, n0, n1 } = ribbonYs(c, ribbonCapTrim);
	return (
		`M${leftX},${g0}` +
		` C${mx},${g0} ${mx},${n0} ${rightX},${n0}` +
		` L${rightX},${n1}` +
		` C${mx},${n1} ${mx},${g1} ${leftX},${g1}` +
		" Z"
	);
}

function bandShellPath(c, slopeLeft, slopeRight, ribbonLeft, ribbonRight, mx, ribbonCapTrim = 0) {
	const { g0, g1, n0, n1 } = ribbonYs(c, ribbonCapTrim);
	return (
		`M${slopeLeft},${c.gslY0}` +
		`L${ribbonLeft},${c.gslY0}` +
		(g0 > c.gslY0 ? `L${ribbonLeft},${g0}` : "") +
		`C${mx},${g0} ${mx},${n0} ${ribbonRight},${n0}` +
		(n0 < c.ngslY0 ? `L${ribbonRight},${c.ngslY0}` : "") +
		`L${slopeRight},${c.ngslY0}` +
		`L${slopeRight},${c.ngslY1}` +
		`L${ribbonRight},${c.ngslY1}` +
		(g1 < c.gslY1 ? `L${ribbonRight},${g1}` : "") +
		`C${mx},${n1} ${mx},${g1} ${ribbonLeft},${g1}` +
		(g1 < c.gslY1 ? `L${ribbonLeft},${c.gslY1}` : "") +
		`L${slopeLeft},${c.gslY1}` +
		"Z"
	);
}

function centerLinePath(c, pathLeft, pathRight, mx, fontSize, pathTailX = null) {
	const shift = fontSize * 0.35;
	const gMid = (c.gslY0 + c.gslY1) / 2 + shift;
	const nMid = (c.ngslY0 + c.ngslY1) / 2 + shift;
	const tail =
		pathTailX != null && pathTailX > pathRight ? ` L${pathTailX},${nMid}` : "";
	return `M${pathLeft},${gMid} C${mx},${gMid} ${mx},${nMid} ${pathRight},${nMid}${tail}`;
}

function antsLinePath(c, gslX1, ngslX0, mx, fontSize, antsYOffset) {
	const shift = fontSize * 0.15;
	const gMid = (c.gslY0 + c.gslY1) / 2 + shift + antsYOffset;
	const nMid = (c.ngslY0 + c.ngslY1) / 2 + shift + antsYOffset;
	return `M${gslX1},${gMid} C${mx},${gMid} ${mx},${nMid} ${ngslX0},${nMid}`;
}

function expandedRibbonPath(c, gslX1, ngslX0, mx, thinThreshold) {
	const gBot = c.gslY1;
	const gTop = gBot - thinThreshold;
	const nBot = c.ngslY1;
	const nTop = nBot - thinThreshold;
	return (
		`M${gslX1},${gTop}` +
		` C${mx},${gTop} ${mx},${nTop} ${ngslX0},${nTop}` +
		` L${ngslX0},${nBot}` +
		` C${mx},${nBot} ${mx},${gBot} ${gslX1},${gBot}` +
		" Z"
	);
}

function expandedCenterPath(c, pathLeft, pathRight, mx, defaultFontSize, thinThreshold, pathTailX = null) {
	const shift = defaultFontSize * 0.35;
	const gBot = c.gslY1;
	const gMid = gBot - thinThreshold / 2 + shift;
	const nBot = c.ngslY1;
	const nMid = nBot - thinThreshold / 2 + shift;
	const tail =
		pathTailX != null && pathTailX > pathRight ? ` L${pathTailX},${nMid}` : "";
	return `M${pathLeft},${gMid} C${mx},${gMid} ${mx},${nMid} ${pathRight},${nMid}${tail}`;
}

function appendBandFocusOutline(parent, c, pathD) {
	return parent
		.append("path")
		.attr("class", "band-focus-outline")
		.attr("d", pathD)
		.attr("fill", "none")
		.attr("stroke", c.dirColor)
		.attr("stroke-width", 0)
		.attr("stroke-opacity", 0)
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "butt")
		.attr("vector-effect", "non-scaling-stroke")
		.style("pointer-events", "none");
}

function bandFontSize(c) {
	const gH = c.gslY1 - c.gslY0;
	const nH = c.ngslY1 - c.ngslY0;
	const minH = Math.min(gH, nH);
	if (minH < 2) return 2;
	return Math.min(Math.max(minH * 0.65, 3), 48);
}


const PCT_CAP_LABEL_FONT_SIZE = 14;

function percentCapLabelLayout(y, h, midY, thinThreshold, capLabelBottomPad) {
	if (h >= thinThreshold + 2) {
		return { labelY: midY, baseline: "central", hidden: false };
	}

	const bottomPad = Math.min(capLabelBottomPad, Math.max(0.5, h * 0.2));
	return {
		labelY: y + h - bottomPad,
		baseline: "text-after-edge",
		hidden: true
	};
}

function appendPercentCapRect(group, { x, y, w, h, fill }) {
	group
		.append("rect")
		.attr("class", "pct-cap")
		.attr("x", x)
		.attr("y", y)
		.attr("width", w)
		.attr("height", h)
		.attr("fill", fill)
		.attr("fill-opacity", 1)
		.attr("stroke", fill)
		.attr("stroke-width", 0)
		.attr("stroke-opacity", 0)
		.attr("shape-rendering", "geometricPrecision");
}

function appendPercentCapLabel(group, { x, y, w, h, midY, pct, textColor, thinThreshold, capLabelBottomPad }) {
	if (h <= 0) return;

	const layout = percentCapLabelLayout(y, h, midY, thinThreshold, capLabelBottomPad);
	group
		.append("text")
		.attr("class", layout.hidden ? "pct-cap-label pct-cap-label--hidden" : "pct-cap-label")
		.attr("x", x + w / 2)
		.attr("y", layout.labelY)
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", layout.baseline)
		.attr("font-size", `${PCT_CAP_LABEL_FONT_SIZE}px`)
		.attr("font-weight", 600)
		.attr("fill", textColor)
		.attr("opacity", layout.hidden ? 0 : 1)
		.text(`${pct.toFixed(1)}%`);
}

function marqueeDataForCategory(c) {
	if (c.relChange != null && c.relChange >= CHANGE_THRESHOLD) {
		return { words: c.addedWords || [], wordSet: "added" };
	}
	if (c.relChange != null && c.relChange <= -CHANGE_THRESHOLD) {
		return { words: c.removedWords || [], wordSet: "removed" };
	}
	return { words: c.remainedWords || [], wordSet: "remained" };
}

function marqueeFontForWordSet(wordSet) {
	if (wordSet === "removed") {
		return { family: "\"Source Serif 4\", serif", style: "italic", weight: 500 };
	}
	return { family: "\"Source Sans 3\", sans-serif", style: "italic", weight: 400 };
}

function wrapLeftToRightOffset(offset, cycleLen) {
	if (cycleLen <= 0) return offset;
	while (offset > 0) offset -= cycleLen;
	while (offset <= -cycleLen) offset += cycleLen;
	return offset;
}

function bindMarqueeTextPath(c, textSel, offsetSeed) {
	const tpNode = textSel.select("textPath").node();
	if (!tpNode) return null;
	const cycleLen = tpNode.getComputedTextLength() / c._repeatCount;
	const offset = wrapLeftToRightOffset(offsetSeed, cycleLen);
	tpNode.setAttribute("startOffset", offset);
	return { tpNode, cycleLen, offset };
}

function categoryColorKey(c) {
	const small = c.relChange == null || Math.abs(c.relChange) < CHANGE_THRESHOLD;
	if (small) return "tan";
	if (c.ngslPct > c.gslPct) return "up";
	if (c.ngslPct < c.gslPct) return "down";
	return "tan";
}

export function renderSemanticsRibbons(containerEl, payload) {
	if (!containerEl || !payload?.categories?.length) {
		return () => {};
	}

	containerEl.innerHTML = "";

	const chartW = containerEl.clientWidth || BASE_SLOPE_WIDTH;
	const layoutScale = chartW / BASE_SLOPE_WIDTH;
	const fontScale = cssNumber(containerEl, "--sem-font-scale", 1);
	const minBandFontSize = cssNumber(containerEl, "--sem-min-band-font-size", 15);
	const responsiveBreakpoint = cssNumber(containerEl, "--sem-responsive-breakpoint", 1080);
	const compactBreakpoint = cssNumber(containerEl, "--sem-compact-breakpoint", 700);
	const mobileOuterMargin = cssNumber(containerEl, "--sem-mobile-margin", 20);
	const mobileOuterMarginRight = cssNumber(containerEl, "--sem-mobile-margin-right", mobileOuterMargin);
	const mobileLabelMaxPct = cssNumber(containerEl, "--sem-mobile-label-max-pct", 0.25);
	const mobileLabelMin = cssNumber(containerEl, "--sem-mobile-label-min", 88);
	const mobileRightLabelMaxPct = cssNumber(containerEl, "--sem-mobile-right-label-max-pct", 0.1);
	const mobileRightLabelMin = cssNumber(containerEl, "--sem-mobile-right-label-min", 48);
	const mobileSlopeMin = cssNumber(containerEl, "--sem-mobile-slope-min", 260);
	const debugLayout = cssNumber(containerEl, "--sem-debug-layout", 0) > 0;
	const viewportW =
		typeof window !== "undefined" && Number.isFinite(window.innerWidth) ? window.innerWidth : chartW;
	const useResponsiveBudget = viewportW <= responsiveBreakpoint;
	const useCompactLabels = viewportW <= compactBreakpoint;

	const margin = {
		top: LAYOUT.margin.top * layoutScale,
		bottom: LAYOUT.margin.bottom * layoutScale,
		right: 0,
		left: 0
	};
	const colW = LAYOUT.colW * layoutScale;
	let gapW = LAYOUT.gapW * layoutScale;
	const bandGap = LAYOUT.bandGap * layoutScale;
	const plotH = LAYOUT.plotH * layoutScale;
	const W = chartW;
	const H = margin.top + plotH + margin.bottom;

	let gslX1 = margin.left + colW;
	let leftLabelZone = 0;
	let rightLabelZone = 0;
	if (useResponsiveBudget) {
		const innerW = Math.max(chartW - mobileOuterMargin - mobileOuterMarginRight, 260);
		const leftLabelMax = innerW * mobileLabelMaxPct;
		const rightLabelMax = innerW * mobileRightLabelMaxPct;
		let leftZone = Math.max(leftLabelMax, mobileLabelMin);
		let rightZone = Math.max(rightLabelMax, mobileRightLabelMin);
		let slopeCandidate = innerW - leftZone - rightZone;
		if (slopeCandidate < mobileSlopeMin) {
			rightZone = Math.max(0, innerW - mobileSlopeMin - leftZone);
			slopeCandidate = innerW - leftZone - rightZone;
			if (slopeCandidate < mobileSlopeMin) {
				leftZone = Math.max(0, innerW - mobileSlopeMin - rightZone);
				slopeCandidate = innerW - leftZone - rightZone;
			}
		}
		leftLabelZone = Math.max(0, leftZone);
		rightLabelZone = Math.max(0, rightZone);
		gapW = Math.max(140, slopeCandidate);
		gslX1 = mobileOuterMargin + leftLabelZone + colW;
	}
	const ngslX0 = gslX1 + gapW;

	const defaultFontSize = Math.max(14 * fontScale, minBandFontSize);
	const thinThreshold = 13 * layoutScale;
	const antsYOffset = -2 * layoutScale;
	const antsStrokeWidth = 1 * layoutScale;
	const antsDashArray = `${4 * layoutScale} ${7 * layoutScale}`;
	const pctCapWidth = cssNumber(containerEl, "--sem-pct-cap-width", 44) * layoutScale;
	const capLabelBottomPad = cssNumber(containerEl, "--sem-pct-cap-label-bottom", 2) * layoutScale;
	const ribbonLeft = gslX1 + pctCapWidth;
	const ribbonRight = ngslX0 - pctCapWidth;
	const mx = (ribbonLeft + ribbonRight) / 2;
	const marqueeTailRunway = cssNumber(containerEl, "--sem-marquee-tail-runway", 20) * layoutScale;
	const marqueePathTailX = ngslX0 + marqueeTailRunway;
	const marqueeClipRight = ngslX0;
	const leftLabelOffset = cssNumber(containerEl, "--sem-left-label-offset", 16) * layoutScale;
	const rightChangeOffset = cssNumber(containerEl, "--sem-right-change-offset", 46) * layoutScale;
	const leftLabelHoverShift = cssNumber(containerEl, "--sem-left-label-hover-shift", 30) * layoutScale;
	if (!useResponsiveBudget) {
		leftLabelZone = Math.max(0, leftLabelOffset + leftLabelHoverShift + 32 * layoutScale);
		rightLabelZone = Math.max(0, rightChangeOffset + 48 * layoutScale);
	}
	const categoryLabelRestX = gslX1 - leftLabelOffset;
	const categoryLabelHoverX = categoryLabelRestX - leftLabelHoverShift;
	const labelWrapChars = Math.max(
		8,
		Math.floor(
			((useCompactLabels ? leftLabelZone : chartW * 0.2) - leftLabelOffset) / Math.max(5, 13 * fontScale * 0.56)
		)
	);
	const hoverLabelTransitionMs = 160;
	const marqueeSpeed = 25;
	const antsSpeed = 18;
	const focusRibbonFillOpacity = 1;
	const focusRibbonBlendAlpha = 0.4;
	const restRibbonBlendAlpha = 0.5;
	const focusRibbonStrokeOpacity = 1;
	const focusRibbonStrokeWidth = 1;
	const ribbonCapTrim = cssNumber(containerEl, "--sem-ribbon-cap-trim", 0.5) * layoutScale;

	function setBandFocusStyle(group, focused, duration = 0) {
		const c = group.datum();
		const ribbonSel = group.select(".ribbon").interrupt();
		const outlineSel = group.select(".band-focus-outline").interrupt();
		const targetFill = focused ? c?.dirFillFocused : c?.dirFillRest;

		ribbonSel.attr("fill", targetFill ?? c?.dirColor).attr("fill-opacity", focusRibbonFillOpacity);
		ribbonSel.attr("stroke-width", 0).attr("stroke-opacity", 0);

		// Thin-band fill and outline are toggled together — no stroke fade lag.
		const outlineDuration = c?._thin ? 0 : duration;
		const outlineApply = outlineDuration > 0 ? outlineSel.transition().duration(outlineDuration) : outlineSel;
		outlineApply
			.attr("stroke-opacity", focused ? focusRibbonStrokeOpacity : 0)
			.attr("stroke-width", focused ? focusRibbonStrokeWidth : 0);

		const labelSel = group.select(".pct-cap-label-layer").selectAll(".pct-cap-label");
		const labelApply = duration > 0 ? labelSel.transition().duration(duration) : labelSel;
		labelApply.attr("opacity", function capLabelOpacity() {
			return d3.select(this).classed("pct-cap-label--hidden") ? (focused ? 1 : 0) : 1;
		});
		if (focused) {
			group.select(".pct-cap-label-layer").raise();
		}
	}

	const cats = payload.categories.map((d) => ({ ...d }));
	const numCats = cats.length;
	const totalGap = bandGap * (numCats - 1);
	const bandArea = plotH - totalGap;

	const gslOrder = [...cats].sort((a, b) => b.gslPct - a.gslPct);
	let gslCum = 0;
	gslOrder.forEach((c) => {
		const h = (c.gslPct / 100) * bandArea;
		c.gslY0 = snapCoord(margin.top + gslCum);
		c.gslY1 = snapCoord(margin.top + gslCum + h);
		gslCum += h + bandGap;
	});

	const ngslOrder = [...cats].sort((a, b) => b.ngslPct - a.ngslPct);
	let ngslCum = 0;
	ngslOrder.forEach((c) => {
		const h = (c.ngslPct / 100) * bandArea;
		c.ngslY0 = snapCoord(margin.top + ngslCum);
		c.ngslY1 = snapCoord(margin.top + ngslCum + h);
		ngslCum += h + bandGap;
	});

	const chartBg =
		getComputedStyle(containerEl).getPropertyValue("--sem-chart-bg").trim() ||
		getComputedStyle(containerEl).getPropertyValue("--color-bg").trim() ||
		"#FFFFF1";

	cats.forEach((c) => {
		const key = categoryColorKey(c);
		const ribbonHex = resolvedRibbonHex(containerEl, key);
		c.dirColor = `var(--sem-ribbon-${key})`;
		c.dirTextColor = `var(--sem-ribbon-${key}-text)`;
		c.dirPctCapTextColor = resolvedPctCapTextColor(containerEl, key);
		c.dirFillRest = blendColors(ribbonHex, chartBg, restRibbonBlendAlpha);
		c.dirFillFocused = blendColors(ribbonHex, chartBg, focusRibbonBlendAlpha);
	});

	const svg = d3
		.select(containerEl)
		.append("svg")
		.attr("width", W)
		.attr("height", H)
		.style("width", `${W}px`)
		.style("height", `${H}px`)
		.style("overflow", "visible");

	svg.append("rect").attr("width", W).attr("height", H).attr("fill", "transparent");

	if (debugLayout) {
		const leftX0 = Math.max(0, gslX1 - leftLabelZone);
		const leftX1 = gslX1;
		const slopeX0 = gslX1;
		const slopeX1 = ngslX0;
		const rightX0 = ngslX0;
		const rightX1 = Math.min(W, ngslX0 + rightLabelZone);

		const guides = svg.append("g").attr("class", "sem-debug-layout");
		guides
			.append("rect")
			.attr("x", leftX0)
			.attr("y", margin.top)
			.attr("width", Math.max(0, leftX1 - leftX0))
			.attr("height", plotH)
			.attr("fill", "#3b82f6")
			.attr("fill-opacity", 0.12);
		guides
			.append("rect")
			.attr("x", slopeX0)
			.attr("y", margin.top)
			.attr("width", Math.max(0, slopeX1 - slopeX0))
			.attr("height", plotH)
			.attr("fill", "#22c55e")
			.attr("fill-opacity", 0.12);
		guides
			.append("rect")
			.attr("x", rightX0)
			.attr("y", margin.top)
			.attr("width", Math.max(0, rightX1 - rightX0))
			.attr("height", plotH)
			.attr("fill", "#f97316")
			.attr("fill-opacity", 0.12);

		for (const x of [gslX1, ngslX0]) {
			guides
				.append("line")
				.attr("x1", x)
				.attr("x2", x)
				.attr("y1", margin.top - 20)
				.attr("y2", margin.top + plotH + 20)
				.attr("stroke", "#111827")
				.attr("stroke-width", 1)
				.attr("stroke-dasharray", "4 4")
				.attr("stroke-opacity", 0.6);
		}

		guides
			.append("text")
			.attr("x", 8)
			.attr("y", 16)
			.attr("font-size", "11px")
			.attr("fill", "#111827")
			.text(
				`debug layout  vw:${Math.round(viewportW)}  chart:${Math.round(chartW)}  left:${Math.round(
					leftLabelZone
				)}  slope:${Math.round(gapW)}  right:${Math.round(rightLabelZone)}`
			);
	}

	svg
		.append("text")
		.attr("x", gslX1)
		.attr("y", margin.top - 20)
		.attr("class", "list-head")
		.attr("text-anchor", "start")
		.attr("fill", "var(--sem-ribbon-header)")
		.attr("font-size", `${16 * fontScale}px`)
		.text("1953");

	svg
		.append("text")
		.attr("x", ngslX0)
		.attr("y", margin.top - 20)
		.attr("class", "list-head")
		.attr("text-anchor", "end")
		.attr("fill", "var(--sem-ribbon-header)")
		.attr("font-size", `${16 * fontScale}px`)
		.text("2023");

	const defs = svg.append("defs");
	const catGroups = svg.append("g").attr("class", "cats");

	cats.forEach((c, i) => {
		const cg = catGroups.append("g").attr("class", "cat-group").attr("data-i", i).datum(c);

		const clipId = `ribbon-clip-${i}`;
		defs
			.append("clipPath")
			.attr("id", clipId)
			.append("path")
			.attr("d", ribbonBandPath(c, ribbonLeft, marqueeClipRight, mx, ribbonCapTrim));

		const fs = Math.max(bandFontSize(c) * fontScale, minBandFontSize);
		const pathId = `center-${i}`;
		defs
			.append("path")
			.attr("id", pathId)
			.attr("d", centerLinePath(c, ribbonLeft, ribbonRight, mx, fs, marqueePathTailX));

		cg
			.append("path")
			.attr("d", ribbonBandPath(c, ribbonLeft, ribbonRight, mx, ribbonCapTrim))
			.attr("fill", c.dirFillRest)
			.attr("fill-opacity", focusRibbonFillOpacity)
			.attr("stroke", c.dirColor)
			.attr("stroke-width", 0)
			.attr("stroke-opacity", 0)
			.attr("shape-rendering", "geometricPrecision")
			.attr("class", "ribbon")
			.style("cursor", "pointer");

		const { words, wordSet } = marqueeDataForCategory(c);
		const marqueeFont = marqueeFontForWordSet(wordSet);
		const allWords = [...new Set(words)];
		d3.shuffle(allWords);
		const wordStr = allWords.map((w) => w.toUpperCase()).join(",  ");
		const repeatCount = 4;
		const repeated = (wordStr + ",   ").repeat(repeatCount);

		c._wordStr = repeated;
		c._repeatCount = repeatCount;
		c._wordFontFamily = marqueeFont.family;
		c._wordFontStyle = marqueeFont.style;
		c._wordFontWeight = marqueeFont.weight;

		const scrollText = cg
			.append("text")
			.attr("clip-path", `url(#${clipId})`)
			.attr("font-family", c._wordFontFamily)
			.attr("font-size", `${fs}px`)
			.attr("font-weight", c._wordFontWeight)
			.attr("font-style", c._wordFontStyle)
			.attr("letter-spacing", "0.04em")
			.attr("fill", c.dirTextColor)
			.attr("fill-opacity", 1)
			.style("pointer-events", "none");

		scrollText.append("textPath").attr("href", `#${pathId}`).attr("startOffset", "0").text(repeated);

		c._pathId = pathId;
		c._offset = 0;

		const gH = c.gslY1 - c.gslY0;
		const gMidY = c.gslY0 + gH / 2;
		const nH = c.ngslY1 - c.ngslY0;
		const nMidY = c.ngslY0 + nH / 2;

		const labelEl = cg
			.append("text")
			.attr("class", "category-name")
			.attr("x", categoryLabelRestX)
			.attr("y", gMidY)
			.attr("text-anchor", "end")
			.attr("dominant-baseline", "middle")
			.attr("font-family", "\"Source Serif 4\", serif")
			.attr("font-size", `${13 * fontScale}px`)
			.attr("fill", "var(--sem-ribbon-label)")
			.attr("font-weight", 500)
			.attr("letter-spacing", "0.02em")
			.style("pointer-events", "none");

		const labelLines = useCompactLabels ? splitLabelTwoLines(c.shortName, labelWrapChars) : [c.shortName];
		if (labelLines.length > 1) {
			labelEl
				.append("tspan")
				.attr("x", categoryLabelRestX)
				.attr("dy", "-0.45em")
				.text(labelLines[0]);
			labelEl
				.append("tspan")
				.attr("x", categoryLabelRestX)
				.attr("dy", "1.05em")
				.text(labelLines[1]);
		} else {
			labelEl.text(labelLines[0]);
		}

		if (c.relChange != null && !useResponsiveBudget) {
			const arrow = c.relChange > 0 ? "↑" : "↓";
			const changeColor = c.relChange > 0 ? "var(--sem-ribbon-up)" : "var(--sem-ribbon-down)";
			cg
				.append("text")
				.attr("class", "side-percent change-percent")
				.attr("x", ngslX0 + rightChangeOffset)
				.attr("y", nMidY)
				.attr("text-anchor", "start")
				.attr("dominant-baseline", "central")
				.attr("font-size", `${13 * fontScale}px`)
				.attr("fill", changeColor)
				.attr("font-weight", 500)
				.attr("opacity", 0)
				.style("display", "none")
				.style("pointer-events", "none")
				.text(`${arrow}${Math.abs(c.relChange).toFixed(1)}%`);
		}

		const minBandH = Math.min(gH, nH);
		c._thin = minBandH < thinThreshold;
		if (c._thin) {
			scrollText.style("display", "none");
			const antsPath = cg
				.append("path")
				.attr("d", antsLinePath(c, ribbonLeft, ribbonRight, mx, fs, antsYOffset))
				.attr("clip-path", `url(#${clipId})`)
				.attr("fill", "none")
				.attr("stroke", c.dirTextColor)
				.attr("stroke-opacity", 1)
				.attr("stroke-width", antsStrokeWidth)
				.attr("stroke-linecap", "round")
				.attr("stroke-dasharray", antsDashArray)
				.attr("class", "thin-band-ants")
				.style("pointer-events", "none");
			c._antsPath = antsPath.node();
			c._antsOffset = Math.random() * 10;
		}

		appendPercentCapRect(cg, {
			x: gslX1,
			y: c.gslY0,
			w: pctCapWidth,
			h: gH,
			fill: c.dirColor
		});
		appendPercentCapRect(cg, {
			x: ngslX0 - pctCapWidth,
			y: c.ngslY0,
			w: pctCapWidth,
			h: nH,
			fill: c.dirColor
		});

		const focusOutlineD = c._thin
			? expandedRibbonPath(c, ribbonLeft, ribbonRight, mx, thinThreshold)
			: bandShellPath(c, gslX1, ngslX0, ribbonLeft, ribbonRight, mx, ribbonCapTrim);

		appendBandFocusOutline(cg, c, focusOutlineD);

		const capLabelLayer = cg
			.append("g")
			.attr("class", "pct-cap-label-layer")
			.style("pointer-events", "none")
			.style("overflow", "visible");

		appendPercentCapLabel(capLabelLayer, {
			x: gslX1,
			y: c.gslY0,
			w: pctCapWidth,
			h: gH,
			midY: gMidY,
			pct: c.gslPct,
			textColor: c.dirPctCapTextColor,
			thinThreshold,
			capLabelBottomPad
		});
		appendPercentCapLabel(capLabelLayer, {
			x: ngslX0 - pctCapWidth,
			y: c.ngslY0,
			w: pctCapWidth,
			h: nH,
			midY: nMidY,
			pct: c.ngslPct,
			textColor: c.dirPctCapTextColor,
			thinThreshold,
			capLabelBottomPad
		});

		c._tpNode = scrollText.select("textPath").node();
		c._textLen = c._tpNode ? c._tpNode.getComputedTextLength() : 2000;
		c._cycleLen = c._textLen / c._repeatCount;
		c._offset = c._cycleLen > 0 ? -Math.random() * c._cycleLen : 0;

		if (c._thin) {
			const expClipId = `exp-clip-${i}`;
			defs
				.append("clipPath")
				.attr("id", expClipId)
				.append("path")
				.attr("d", expandedRibbonPath(c, ribbonLeft, ribbonRight, mx, thinThreshold));
			const expPathId = `exp-center-${i}`;
			defs
				.append("path")
				.attr("id", expPathId)
				.attr("d", expandedCenterPath(c, ribbonLeft, ribbonRight, mx, defaultFontSize, thinThreshold, marqueePathTailX));
			c._expClipId = expClipId;
			c._expPathId = expPathId;
		}
	});

	let interactionLocked = false;
	let forcedFocusSet = null;
	const focusTransitionMs = 240;

	function drawThinFocusOverlay(group, c) {
		group.selectAll(".thin-band-focus-fill, .thin-band-focus-text").remove();

		group
			.insert("path", ".band-focus-outline")
			.attr("class", "thin-band-focus-fill")
			.attr("d", expandedRibbonPath(c, ribbonLeft, ribbonRight, mx, thinThreshold))
			.attr("fill", c.dirFillFocused)
			.attr("fill-opacity", focusRibbonFillOpacity)
			.attr("stroke", "none")
			.style("pointer-events", "none");

		const text = group
			.insert("text", ".band-focus-outline")
			.attr("class", "thin-band-focus-text")
			.attr("clip-path", `url(#${c._expClipId})`)
			.attr("font-family", c._wordFontFamily)
			.attr("font-size", `${defaultFontSize}px`)
			.attr("font-weight", c._wordFontWeight)
			.attr("font-style", c._wordFontStyle)
			.attr("letter-spacing", "0.04em")
			.attr("fill", c.dirTextColor)
			.attr("fill-opacity", 1)
			.style("pointer-events", "none");

		text.append("textPath").attr("href", `#${c._expPathId}`).attr("startOffset", "0").text(c._wordStr);

		return text;
	}

	function clearThinFocusOverlay(group) {
		group.selectAll(".thin-band-focus-fill, .thin-band-focus-text").remove();
	}

	function setThinBandFocus(group, c, focused) {
		if (focused) {
			if (c._antsPath) d3.select(c._antsPath).style("display", "none");
			drawThinFocusOverlay(group, c);
			setBandFocusStyle(group, true, 0);
		} else {
			setBandFocusStyle(group, false, 0);
			clearThinFocusOverlay(group);
			if (c._antsPath) d3.select(c._antsPath).style("display", null);
		}
	}

	function resetCategoryMarqueeState(c) {
		c._hoverActive = false;
		c._hoverTpNode = null;
		c._forcedActive = false;
		c._forcedTpNode = null;
		if (c._antsPath) d3.select(c._antsPath).style("display", null);
	}

	function drawForcedThinOverlay(c, group) {
		setThinBandFocus(group, c, true);
		const bound = bindMarqueeTextPath(c, group.select(".thin-band-focus-text"), c._offset);
		if (!bound) return;
		c._forcedTpNode = bound.tpNode;
		c._forcedActive = true;
		c._forcedCycleLen = bound.cycleLen;
		c._forcedOffset = bound.offset;
	}

	function applyForcedFocus(indices) {
		const nextSet = indices && indices.length ? new Set(indices) : null;
		forcedFocusSet = nextSet;

		for (const c of cats) resetCategoryMarqueeState(c);

		catGroups.selectAll(".cat-group").interrupt();
		catGroups.selectAll(".cat-group").each(function eachGroup() {
			const group = d3.select(this);
			clearThinFocusOverlay(group);
			const i = Number(group.attr("data-i"));
			const c = cats[i];
			const focused = nextSet?.has(i);
			group.raise().transition().duration(focusTransitionMs).attr("opacity", nextSet ? (focused ? 1 : 0.08) : 1);
			if (c._thin) {
				if (focused) {
					drawForcedThinOverlay(c, group);
				} else {
					if (c._antsPath) d3.select(c._antsPath).style("display", null);
					setBandFocusStyle(group, false, 0);
				}
			} else {
				setBandFocusStyle(group, Boolean(focused), focusTransitionMs);
			}
			group
				.select(".category-name")
				.transition()
				.duration(focusTransitionMs)
				.attr("x", focused ? categoryLabelHoverX : categoryLabelRestX);
			group
				.selectAll(".side-percent")
				.transition()
				.duration(focusTransitionMs)
				.attr("opacity", nextSet ? (focused ? 1 : 0) : 0);
		});
	}

	let rafId = 0;
	let marqueeRunning = false;
	let lastT = performance.now();

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
		let dt = (now - lastT) / 1000;
		lastT = now;
		if (dt > 0.5) dt = 0.016;

		for (let i = 0; i < cats.length; i++) {
			const c = cats[i];
			c._offset = wrapLeftToRightOffset(c._offset + marqueeSpeed * dt, c._cycleLen);
			if (!c._thin && c._tpNode) c._tpNode.setAttribute("startOffset", c._offset);
			if (c._hoverActive && c._hoverTpNode) {
				c._hoverOffset = wrapLeftToRightOffset(c._hoverOffset + marqueeSpeed * dt, c._hoverCycleLen);
				c._hoverTpNode.setAttribute("startOffset", c._hoverOffset);
			}
			if (c._forcedActive && c._forcedTpNode) {
				c._forcedOffset = wrapLeftToRightOffset(c._forcedOffset + marqueeSpeed * dt, c._forcedCycleLen);
				c._forcedTpNode.setAttribute("startOffset", c._forcedOffset);
			}
			if (c._thin && c._antsPath) {
				c._antsOffset = (c._antsOffset - antsSpeed * dt) % 10;
				c._antsPath.setAttribute("stroke-dashoffset", c._antsOffset);
			}
		}

		if (marqueeRunning) rafId = requestAnimationFrame(animateMarquee);
	}

	catGroups.selectAll(".cat-group").each(function eachCat() {
		const el = d3.select(this);
		const i = Number(el.attr("data-i"));
		const c = cats[i];

		el.on("mouseenter", () => {
			if (interactionLocked) return;
			catGroups.selectAll(".cat-group").transition().duration(120).attr("opacity", 0.25);
			el.raise().transition().duration(120).attr("opacity", 1);
			el.select(".category-name").transition().duration(hoverLabelTransitionMs).attr("x", categoryLabelHoverX);
			el.selectAll(".side-percent").transition().duration(hoverLabelTransitionMs).attr("opacity", 1);

			if (c._thin) {
				setThinBandFocus(el, c, true);
				const bound = bindMarqueeTextPath(c, el.select(".thin-band-focus-text"), c._offset);
				if (bound) {
					c._hoverTpNode = bound.tpNode;
					c._hoverActive = true;
					c._hoverCycleLen = bound.cycleLen;
					c._hoverOffset = bound.offset;
				}
			} else {
				setBandFocusStyle(el, true, hoverLabelTransitionMs);
			}

		})
			.on("mouseleave", () => {
				if (interactionLocked) return;
				catGroups.selectAll(".cat-group").transition().duration(200).attr("opacity", 1);
				el.select(".category-name").transition().duration(hoverLabelTransitionMs).attr("x", categoryLabelRestX);
				el.selectAll(".side-percent").transition().duration(hoverLabelTransitionMs).attr("opacity", 0);

				if (c._thin) {
					c._hoverActive = false;
					c._hoverTpNode = null;
					setThinBandFocus(el, c, false);
				} else {
					setBandFocusStyle(el, false, hoverLabelTransitionMs);
				}

			});
	});

	const categoryIndexByName = new Map();
	cats.forEach((c, i) => {
		categoryIndexByName.set(normalizeCategoryKey(c.name), i);
		categoryIndexByName.set(normalizeCategoryKey(c.shortName), i);
	});

	return {
		setInteractionLocked(locked) {
			interactionLocked = Boolean(locked);
			if (!interactionLocked && !forcedFocusSet) {
				applyForcedFocus([]);
			}
		},
		setFocus(categoryNames = []) {
			const indices = categoryNames
				.map((name) => categoryIndexByName.get(normalizeCategoryKey(name)))
				.filter((v) => Number.isInteger(v));
			applyForcedFocus(indices);
		},
		clearFocus() {
			applyForcedFocus([]);
		},
		setMarqueeActive,
		destroy() {
			setMarqueeActive(false);
			svg.remove();
		}
	};
}
