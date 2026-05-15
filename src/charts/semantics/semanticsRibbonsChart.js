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

function ribbonPath(c, gslX1, ngslX0, mx) {
	return (
		`M${gslX1},${c.gslY0}` +
		` C${mx},${c.gslY0} ${mx},${c.ngslY0} ${ngslX0},${c.ngslY0}` +
		` L${ngslX0},${c.ngslY1}` +
		` C${mx},${c.ngslY1} ${mx},${c.gslY1} ${gslX1},${c.gslY1}` +
		" Z"
	);
}

function centerLinePath(c, gslX1, ngslX0, mx, fontSize) {
	const shift = fontSize * 0.35;
	const gMid = (c.gslY0 + c.gslY1) / 2 + shift;
	const nMid = (c.ngslY0 + c.ngslY1) / 2 + shift;
	return `M${gslX1},${gMid} C${mx},${gMid} ${mx},${nMid} ${ngslX0},${nMid}`;
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

function expandedCenterPath(c, gslX1, ngslX0, mx, defaultFontSize, thinThreshold) {
	const shift = defaultFontSize * 0.35;
	const gBot = c.gslY1;
	const gMid = gBot - thinThreshold / 2 + shift;
	const nBot = c.ngslY1;
	const nMid = nBot - thinThreshold / 2 + shift;
	return `M${gslX1},${gMid} C${mx},${gMid} ${mx},${nMid} ${ngslX0},${nMid}`;
}

function bandFontSize(c) {
	const gH = c.gslY1 - c.gslY0;
	const nH = c.ngslY1 - c.ngslY0;
	const minH = Math.min(gH, nH);
	if (minH < 2) return 2;
	return Math.min(Math.max(minH * 0.65, 3), 48);
}

function marqueeWordsForCategory(c) {
	if (c.relChange != null && c.relChange >= CHANGE_THRESHOLD) return c.addedWords || [];
	if (c.relChange != null && c.relChange <= -CHANGE_THRESHOLD) return c.removedWords || [];
	return c.remainedWords || [];
}

function marqueeWordSetForCategory(c) {
	if (c.relChange != null && c.relChange >= CHANGE_THRESHOLD) return "added";
	if (c.relChange != null && c.relChange <= -CHANGE_THRESHOLD) return "removed";
	return "remained";
}

function marqueeFontForWordSet(wordSet) {
	if (wordSet === "removed") {
		return { family: "\"Source Serif 4\", serif", style: "italic", weight: 400 };
	}
	return { family: "\"Source Sans 3\", sans-serif", style: "italic", weight: 400 };
}

function wrapLeftToRightOffset(offset, cycleLen) {
	if (cycleLen <= 0) return offset;
	while (offset > 0) offset -= cycleLen;
	while (offset <= -cycleLen) offset += cycleLen;
	return offset;
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
	const mx = (gslX1 + ngslX0) / 2;

	const defaultFontSize = Math.max(14 * fontScale, minBandFontSize);
	const thinThreshold = 13 * layoutScale;
	const antsYOffset = -2 * layoutScale;
	const antsStrokeWidth = 1 * layoutScale;
	const antsDashArray = `${4 * layoutScale} ${7 * layoutScale}`;
	const leftPercentOffset = cssNumber(containerEl, "--sem-left-percent-offset", 8) * layoutScale;
	const rightPercentOffset = cssNumber(containerEl, "--sem-right-percent-offset", 8) * layoutScale;
	const leftLabelOffset = cssNumber(containerEl, "--sem-left-label-offset", 16) * layoutScale;
	const rightChangeOffset = cssNumber(containerEl, "--sem-right-change-offset", 46) * layoutScale;
	const leftLabelHoverShift = cssNumber(containerEl, "--sem-left-label-hover-shift", 30) * layoutScale;
	if (!useResponsiveBudget) {
		leftLabelZone = Math.max(0, leftLabelOffset + leftLabelHoverShift + 24 * layoutScale);
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

	const cats = payload.categories.map((d) => ({ ...d }));
	const numCats = cats.length;
	const totalGap = bandGap * (numCats - 1);
	const bandArea = plotH - totalGap;

	const gslOrder = [...cats].sort((a, b) => b.gslPct - a.gslPct);
	let gslCum = 0;
	gslOrder.forEach((c) => {
		const h = (c.gslPct / 100) * bandArea;
		c.gslY0 = margin.top + gslCum;
		c.gslY1 = margin.top + gslCum + h;
		gslCum += h + bandGap;
	});

	const ngslOrder = [...cats].sort((a, b) => b.ngslPct - a.ngslPct);
	let ngslCum = 0;
	ngslOrder.forEach((c) => {
		const h = (c.ngslPct / 100) * bandArea;
		c.ngslY0 = margin.top + ngslCum;
		c.ngslY1 = margin.top + ngslCum + h;
		ngslCum += h + bandGap;
	});

	cats.forEach((c) => {
		c.dir = c.ngslPct > c.gslPct ? "up" : c.ngslPct < c.gslPct ? "down" : "flat";
		const small = c.relChange == null || Math.abs(c.relChange) < CHANGE_THRESHOLD;
		let key;
		if (small) key = "tan";
		else if (c.dir === "up") key = "up";
		else if (c.dir === "down") key = "down";
		else key = "neutral";
		c.dirColor = `var(--sem-ribbon-${key})`;
		c.dirTextColor = `var(--sem-ribbon-${key}-text)`;
	});

	const svg = d3
		.select(containerEl)
		.append("svg")
		.attr("width", W)
		.attr("height", H)
		.style("width", `${W}px`)
		.style("height", `${H}px`)
		.style("overflow", "visible");

	svg.append("rect").attr("width", W).attr("height", H).attr("fill", "var(--color-bg)");

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
		.attr("text-anchor", "start")
		.attr("fill", "var(--sem-ribbon-header)")
		.attr("font-size", `${13 * fontScale}px`)
		.attr("font-weight", 600)
		.text("1953 list");
	svg
		.append("text")
		.attr("x", gslX1)
		.attr("y", margin.top - 7)
		.attr("text-anchor", "start")
		.attr("fill", "var(--sem-ribbon-header-sub)")
		.attr("font-size", `${9.5 * fontScale}px`)
		.text(`${payload.nGsl.toLocaleString()} words`);

	svg
		.append("text")
		.attr("x", ngslX0)
		.attr("y", margin.top - 20)
		.attr("text-anchor", "end")
		.attr("fill", "var(--sem-ribbon-header)")
		.attr("font-size", `${13 * fontScale}px`)
		.attr("font-weight", 600)
		.text("2023 list");
	svg
		.append("text")
		.attr("x", ngslX0)
		.attr("y", margin.top - 7)
		.attr("text-anchor", "end")
		.attr("fill", "var(--sem-ribbon-header-sub)")
		.attr("font-size", `${9.5 * fontScale}px`)
		.text(`${payload.nNgsl.toLocaleString()} words`);

	const defs = svg.append("defs");
	const catGroups = svg.append("g").attr("class", "cats");

	cats.forEach((c, i) => {
		const cg = catGroups.append("g").attr("class", "cat-group").attr("data-i", i);

		const clipId = `ribbon-clip-${i}`;
		defs.append("clipPath").attr("id", clipId).append("path").attr("d", ribbonPath(c, gslX1, ngslX0, mx));

		const fs = Math.max(bandFontSize(c) * fontScale, minBandFontSize);
		const pathId = `center-${i}`;
		defs.append("path").attr("id", pathId).attr("d", centerLinePath(c, gslX1, ngslX0, mx, fs));

		cg
			.append("path")
			.attr("d", ribbonPath(c, gslX1, ngslX0, mx))
			.attr("fill", c.dirColor)
			.attr("fill-opacity", 0.5)
			.attr("stroke", c.dirColor)
			.attr("stroke-width", 0.5)
			.attr("stroke-opacity", 0.5)
			.attr("class", "ribbon")
			.style("cursor", "pointer");

		const wordSet = marqueeWordSetForCategory(c);
		const marqueeFont = marqueeFontForWordSet(wordSet);
		const allWords = [...new Set(marqueeWordsForCategory(c))];
		d3.shuffle(allWords);
		const wordStr = allWords.map((w) => w.toUpperCase()).join(",  ");
		const repeatCount = 4;
		const repeated = (wordStr + ",   ").repeat(repeatCount);

		c._wordStr = repeated;
		c._repeatCount = repeatCount;
		c._wordSet = wordSet;
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

		c._scrollText = scrollText;
		c._pathId = pathId;
		c._offset = 0;
		c._normalFs = fs;

		const gH = c.gslY1 - c.gslY0;
		const gMidY = c.gslY0 + gH / 2;
		cg
			.append("text")
			.attr("class", "side-percent gsl-percent")
			.attr("x", gslX1 - leftPercentOffset)
			.attr("y", gMidY)
			.attr("text-anchor", "end")
			.attr("dominant-baseline", "central")
			.attr("font-size", `${13 * fontScale}px`)
			.attr("fill", c.dirColor)
			.attr("font-weight", 600)
			.attr("opacity", 0)
			.style("pointer-events", "none")
			.text(`${c.gslPct.toFixed(1)}%`);

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

		const nH = c.ngslY1 - c.ngslY0;
		const nMidY = c.ngslY0 + nH / 2;
		cg
			.append("text")
			.attr("class", "side-percent ngsl-percent")
			.attr("x", ngslX0 + rightPercentOffset)
			.attr("y", nMidY)
			.attr("text-anchor", "start")
			.attr("dominant-baseline", "central")
			.attr("font-size", `${13 * fontScale}px`)
			.attr("fill", c.dirColor)
			.attr("font-weight", 600)
			.attr("opacity", 0)
			.style("pointer-events", "none")
			.text(`${c.ngslPct.toFixed(1)}%`);

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
				.style("pointer-events", "none")
				.text(`${arrow}${Math.abs(c.relChange).toFixed(1)}%`);
		}

		const minBandH = Math.min(gH, nH);
		c._thin = minBandH < thinThreshold;
		if (c._thin) {
			scrollText.style("display", "none");
			const antsPath = cg
				.append("path")
				.attr("d", antsLinePath(c, gslX1, ngslX0, mx, fs, antsYOffset))
				.attr("clip-path", `url(#${clipId})`)
				.attr("fill", "none")
				.attr("stroke", c.dirTextColor)
				.attr("stroke-opacity", 0.85)
				.attr("stroke-width", antsStrokeWidth)
				.attr("stroke-linecap", "round")
				.attr("stroke-dasharray", antsDashArray)
				.attr("class", "thin-band-ants")
				.style("pointer-events", "none");
			c._antsPath = antsPath.node();
			c._antsOffset = Math.random() * 10;
		}
	});

	cats.forEach((c) => {
		const pathEl = defs.select(`#${c._pathId}`).node();
		c._pathLen = pathEl ? pathEl.getTotalLength() : 600;
		c._tpNode = c._scrollText.select("textPath").node();
		c._textLen = c._tpNode ? c._tpNode.getComputedTextLength() : 2000;
		c._cycleLen = c._textLen / c._repeatCount;
		c._offset = c._cycleLen > 0 ? -Math.random() * c._cycleLen : 0;
	});

	const hoverLayer = svg.append("g").attr("class", "hover-layer").style("pointer-events", "none");
	const forcedLayer = svg.append("g").attr("class", "forced-layer").style("pointer-events", "none");
	let interactionLocked = false;
	let forcedFocusSet = null;
	const focusTransitionMs = 240;

	function resetVisualState() {
		catGroups.selectAll(".cat-group").interrupt().attr("opacity", 1);
		catGroups.selectAll(".cat-group .ribbon").attr("fill-opacity", 0.5).attr("stroke-opacity", 0.5).attr("stroke-width", 0.5);
		catGroups.selectAll(".cat-group .category-name").attr("x", categoryLabelRestX);
		catGroups.selectAll(".cat-group .side-percent").attr("opacity", 0);

		hoverLayer.selectAll("*").remove();
		forcedLayer.selectAll("*").remove();
		for (const c of cats) {
			c._hoverActive = false;
			c._hoverTpNode = null;
			c._forcedActive = false;
			c._forcedTpNode = null;
			if (c._antsPath) d3.select(c._antsPath).style("display", null);
		}
	}

	function drawForcedThinOverlay(c) {
		forcedLayer
			.append("path")
			.attr("d", expandedRibbonPath(c, gslX1, ngslX0, mx, thinThreshold))
			.attr("fill", c.dirColor)
			.attr("fill-opacity", 0.2)
			.attr("stroke", "none");

		const text = forcedLayer
			.append("text")
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

		c._forcedTpNode = text.select("textPath").node();
		c._forcedActive = true;
		c._forcedCycleLen = c._forcedTpNode ? c._forcedTpNode.getComputedTextLength() / c._repeatCount : 2000;
		c._forcedOffset = wrapLeftToRightOffset(c._offset, c._forcedCycleLen);
		if (c._forcedTpNode) c._forcedTpNode.setAttribute("startOffset", c._forcedOffset);
	}

	function applyForcedFocus(indices) {
		const nextSet = indices && indices.length ? new Set(indices) : null;
		forcedFocusSet = nextSet;

		hoverLayer.selectAll("*").remove();
		forcedLayer.interrupt().attr("opacity", 0).selectAll("*").remove();
		for (const c of cats) {
			c._hoverActive = false;
			c._hoverTpNode = null;
			c._forcedActive = false;
			c._forcedTpNode = null;
			if (c._antsPath) d3.select(c._antsPath).style("display", null);
		}

		catGroups.selectAll(".cat-group").interrupt();
		catGroups.selectAll(".cat-group").each(function eachGroup() {
			const group = d3.select(this);
			const i = Number(group.attr("data-i"));
			const focused = nextSet?.has(i);
			group.raise().transition().duration(focusTransitionMs).attr("opacity", nextSet ? (focused ? 1 : 0.08) : 1);
			group
				.select(".ribbon")
				.transition()
				.duration(focusTransitionMs)
				.attr("fill-opacity", focused ? 0.4 : 0.5)
				.attr("stroke-opacity", focused ? 0.7 : 0.5)
				.attr("stroke-width", focused ? 1 : 0.5);
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

		if (!nextSet) return;
		forcedLayer.attr("opacity", 0);
		for (const idx of nextSet) {
			const c = cats[idx];
			if (c._thin) {
				if (c._antsPath) d3.select(c._antsPath).style("display", "none");
				drawForcedThinOverlay(c);
			}
		}
		forcedLayer.transition().duration(focusTransitionMs).attr("opacity", 1);
	}

	cats.forEach((c, i) => {
		if (!c._thin) return;
		const expClipId = `exp-clip-${i}`;
		defs
			.append("clipPath")
			.attr("id", expClipId)
			.append("path")
			.attr("d", expandedRibbonPath(c, gslX1, ngslX0, mx, thinThreshold));
		const expPathId = `exp-center-${i}`;
		defs
			.append("path")
			.attr("id", expPathId)
			.attr("d", expandedCenterPath(c, gslX1, ngslX0, mx, defaultFontSize, thinThreshold));
		c._expClipId = expClipId;
		c._expPathId = expPathId;
	});

	let rafId = 0;
	let marqueeRunning = true;
	let lastT = performance.now();

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
	rafId = requestAnimationFrame(animateMarquee);

	catGroups.selectAll(".cat-group").each(function eachCat() {
		const el = d3.select(this);
		const i = Number(el.attr("data-i"));
		const c = cats[i];

		el.on("mouseenter", () => {
			if (interactionLocked) return;
			catGroups.selectAll(".cat-group").transition().duration(120).attr("opacity", 0.08);
			el.raise().transition().duration(120).attr("opacity", 1);
			el.select(".ribbon").attr("fill-opacity", 0.4).attr("stroke-opacity", 0.7).attr("stroke-width", 1);
			el.select(".category-name").transition().duration(hoverLabelTransitionMs).attr("x", categoryLabelHoverX);
			el.selectAll(".side-percent").transition().duration(hoverLabelTransitionMs).attr("opacity", 1);

			if (c._thin) {
				if (c._antsPath) d3.select(c._antsPath).style("display", "none");
				hoverLayer.selectAll("*").remove();
				hoverLayer
					.append("path")
					.attr("d", expandedRibbonPath(c, gslX1, ngslX0, mx, thinThreshold))
					.attr("fill", c.dirColor)
					.attr("fill-opacity", 0.2)
					.attr("stroke", "none");

				const ht = hoverLayer
					.append("text")
					.attr("clip-path", `url(#${c._expClipId})`)
					.attr("font-family", c._wordFontFamily)
					.attr("font-size", `${defaultFontSize}px`)
					.attr("font-weight", c._wordFontWeight)
					.attr("font-style", c._wordFontStyle)
					.attr("letter-spacing", "0.04em")
					.attr("fill", c.dirTextColor)
					.attr("fill-opacity", 1)
					.style("pointer-events", "none");

				ht.append("textPath").attr("href", `#${c._expPathId}`).attr("startOffset", "0").text(c._wordStr);

				c._hoverText = ht;
				c._hoverTpNode = ht.select("textPath").node();
				c._hoverActive = true;
				c._hoverCycleLen = c._hoverTpNode ? c._hoverTpNode.getComputedTextLength() / c._repeatCount : 2000;
				c._hoverOffset = wrapLeftToRightOffset(c._offset, c._hoverCycleLen);
				if (c._hoverTpNode) c._hoverTpNode.setAttribute("startOffset", c._hoverOffset);
			}

		})
			.on("mouseleave", () => {
				if (interactionLocked) return;
				catGroups.selectAll(".cat-group").transition().duration(200).attr("opacity", 1);
				el.select(".ribbon").attr("fill-opacity", 0.4).attr("stroke-opacity", 0.4).attr("stroke-width", 0.5);
				el.select(".category-name").transition().duration(hoverLabelTransitionMs).attr("x", categoryLabelRestX);
				el.selectAll(".side-percent").transition().duration(hoverLabelTransitionMs).attr("opacity", 0);

				if (c._thin) {
					c._hoverActive = false;
					c._hoverTpNode = null;
					if (c._antsPath) d3.select(c._antsPath).style("display", null);
					hoverLayer.selectAll("*").remove();
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
			forcedFocusSet = null;
			applyForcedFocus([]);
		},
		destroy() {
			marqueeRunning = false;
			cancelAnimationFrame(rafId);
			rafId = 0;
			svg.remove();
		}
	};
}
