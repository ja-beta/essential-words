import * as d3 from "d3";
import { createMarqueeLoop } from "$utils/marqueeLoop.js";

const COLORS = {
	remained: "var(--color-secondary, #8F8A77)",
	removed: "var(--color-gsl, #ED9027)",
	added: "var(--color-ngsl, #DB6AE8)",
	label: "var(--color-primary, #5B5B5B)",
	bg: "var(--color-bg, #FFFFF1)"
};

const FONTS = {
	removed: { family: '"Source Serif 4", serif', style: "italic", weight: 500 },
	added: { family: '"Source Sans 3", sans-serif', style: "italic", weight: 400 },
	remained: { family: '"Source Sans 3", sans-serif', style: "italic", weight: 400 }
};

const ARC_OPACITY = 0.4;

function readCssPx(el, varName, fallback) {
	if (!el) return fallback;
	const raw = getComputedStyle(el).getPropertyValue(varName).trim();
	const n = parseFloat(raw);
	return Number.isFinite(n) ? n : fallback;
}

function layoutFromWidth(containerWidth) {
	const width = Math.max(1, containerWidth);
	const pad = Math.round(width * 0.045);
	const plotR = width / 2 - pad;
	const maxR = plotR;
	const centerR = maxR * (32 / 550);

	const labelFontSize = Math.min(20, Math.max(14, maxR * 0.06));
	const wordFontSize = Math.max(20, maxR * 0.03);
	const svgW = (plotR + pad) * 2;
	return { pad, plotR, maxR, centerR, labelFontSize, wordFontSize, svgW };
}

function arcPath(cx, cy, r, startAngle, endAngle, sweepFlag) {
	let span;
	if (sweepFlag === 1) {
		span = ((endAngle - startAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
	} else {
		span = ((startAngle - endAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
	}
	if (span >= 2 * Math.PI - 0.001) {
		const top = { x: cx, y: cy - r };
		const bot = { x: cx, y: cy + r };
		return (
			`M ${top.x} ${top.y} ` +
			`A ${r} ${r} 0 0 ${sweepFlag} ${bot.x} ${bot.y} ` +
			`A ${r} ${r} 0 0 ${sweepFlag} ${top.x} ${top.y}`
		);
	}
	if (span < 0.001) return "";
	const x1 = cx + r * Math.cos(startAngle);
	const y1 = cy + r * Math.sin(startAngle);
	const x2 = cx + r * Math.cos(endAngle);
	const y2 = cy + r * Math.sin(endAngle);
	const largeArc = span > Math.PI ? 1 : 0;
	return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${x2} ${y2}`;
}

function buildWordStr(words) {
	if (!words?.length) return "· · ·";
	return words.map((w) => w.w.toUpperCase()).join(", ") + ", ";
}

function wrapPathOffset(offset, cycleLen) {
	if (cycleLen <= 0) return offset;
	while (offset > 0) offset -= cycleLen;
	while (offset <= -cycleLen) offset += cycleLen;
	return offset;
}

function arcBandClipD(cx, cy, r, halfBand, start, end) {
	const ro = r + halfBand;
	const ri = Math.max(1, r - halfBand);
	const span = ((end - start) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
	const large = span > Math.PI ? 1 : 0;
	const xos = cx + ro * Math.cos(start);
	const yos = cy + ro * Math.sin(start);
	const xoe = cx + ro * Math.cos(end);
	const yoe = cy + ro * Math.sin(end);
	const xis = cx + ri * Math.cos(end);
	const yis = cy + ri * Math.sin(end);
	const xie = cx + ri * Math.cos(start);
	const yie = cy + ri * Math.sin(start);
	return (
		`M ${xos} ${yos} ` +
		`A ${ro} ${ro} 0 ${large} 1 ${xoe} ${yoe} ` +
		`L ${xis} ${yis} ` +
		`A ${ri} ${ri} 0 ${large} 0 ${xie} ${yie} Z`
	);
}

export function renderScopeArcsChart(container, payload) {
	if (!container || !payload?.rings?.length) return null;

	const root = container.closest?.(".scope-arcs") ?? container;
	const layoutWidth = root.clientWidth || container.clientWidth;
	if (!layoutWidth || layoutWidth < 2) return null;

	container.innerHTML = "";
	const focusFadeMs = readCssPx(root, "--scope-arcs-focus-fade-ms", 220);
	const zoomMs = readCssPx(root, "--scope-arcs-zoom-ms", 600);
	const zoomMax = readCssPx(root, "--scope-arcs-zoom-max", 3);
	const segmentGapPx = readCssPx(root, "--scope-arcs-segment-gap", 4);

	const wordsBandPx = readCssPx(root, "--scope-arcs-words-band", 30);
	const sideGapPx = readCssPx(root, "--scope-arcs-side-gap", 8);
	const unfocusedOpacity = readCssPx(root, "--scope-arcs-unfocused-opacity", 0.35);
	const dividerWidth = readCssPx(root, "--scope-arcs-divider-width", 1);
	const dividerDash = getComputedStyle(root).getPropertyValue("--scope-arcs-divider-dash").trim() || "5 5";

	const textOutsetPx = readCssPx(root, "--scope-arcs-text-outset", 0);
	const textOutsetRatio = readCssPx(root, "--scope-arcs-text-outset-ratio", 0);
	const labelInset = readCssPx(root, "--scope-arcs-label-inset", 6);
	const marqueeSpeed = readCssPx(root, "--scope-arcs-marquee-speed", 18);
	const marqueeRepeat = Math.max(2, Math.round(readCssPx(root, "--scope-arcs-marquee-repeat", 3)));

	const rings = payload.rings;
	const ringData = rings.map((ring) => {
		const remainedWords = ring.gslWords.filter((w) => w.s === "remained");
		const removedWords = ring.gslWords.filter((w) => w.s === "removed");
		const addedWords = ring.ngslWords.filter((w) => w.s === "added");
		const removedShare = ring.gslCount > 0 ? removedWords.length / ring.gslCount : 0;
		const addedShare = ring.ngslCount > 0 ? addedWords.length / ring.ngslCount : 0;
		return { ...ring, remainedWords, removedWords, addedWords, removedShare, addedShare };
	});

	const layout = layoutFromWidth(layoutWidth);
	const { maxR, centerR, labelFontSize, wordFontSize, svgW } = layout;
	const minArcShare = 0.008;


	const gslPcts = ringData.map((r) => r.gslPct);
	const ngslPcts = ringData.map((r) => r.ngslPct);
	const radialSpan = maxR - centerR;
	const n = ringData.length;
	const trackStep = radialSpan / n;

	const trackGapWanted = readCssPx(
		root,
		"--scope-arcs-track-gap",
		Math.max(labelFontSize + labelInset + 4, trackStep * 0.2)
	);
	const trackGap = Math.min(Math.max(8, trackGapWanted), trackStep * 0.72);
	const maxBand = Math.max(4, trackStep - trackGap);

	const minBand = Math.min(readCssPx(root, "--scope-arcs-min-band", 2), maxBand);
	const maxShare = Math.max(1e-6, d3.max([...gslPcts, ...ngslPcts]) ?? 1);
	const unit = maxBand / maxShare;
	const trackR = ringData.map((_, i) => centerR + (i + 0.5) * trackStep);
	const gslRadii = trackR.slice();
	const ngslRadii = trackR.slice();
	const gslThick = gslPcts.map((p) => Math.max(minBand, p * unit));
	const ngslThick = ngslPcts.map((p) => Math.max(minBand, p * unit));

	const svgCx = svgW / 2;
	const svgCy = svgW / 2;

	const svg = d3
		.create("svg")
		.attr("class", "scope-arcs-svg")
		.attr("viewBox", `0 0 ${svgW} ${svgW}`)
		.attr("preserveAspectRatio", "xMidYMid meet")
		.attr("width", "100%")
		.style("display", "block")
		.style("margin", "0 auto")
		.style("overflow", "hidden");

	const TOP = (3 * Math.PI) / 2;
	const BOTTOM = Math.PI / 2;

	function outerRadiusForRing(ringNum) {
		const i = ringNum - 1;
		const r = trackR[i] ?? centerR;
		const t = Math.max(gslThick[i] ?? 0, ngslThick[i] ?? 0);
		return r + t / 2;
	}

	function innerRadiusForRing(ringNum) {
		const i = ringNum - 1;
		const r = trackR[i] ?? centerR;
		const t = Math.max(gslThick[i] ?? 0, ngslThick[i] ?? 0);
		return r - t / 2;
	}

	function zoomScaleForState({ focusedRing, overview }) {
		if (overview) return 1;
		const ring = focusedRing ?? 1;
		const targetR = Math.max(outerRadiusForRing(ring), centerR + 1);
		return Math.min(zoomMax, maxR / targetR);
	}

	function zoomTransform(scale) {
		return `translate(${svgCx},${svgCy}) scale(${scale}) translate(${-svgCx},${-svgCy})`;
	}


	function sideArcBounds(side, R) {
		const inset = (sideGapPx / 2) / Math.max(R, 1);
		if (side === "left") {
			return { start: BOTTOM + inset, end: TOP - inset, span: Math.PI - 2 * inset };
		}
		return { start: TOP + inset, end: BOTTOM - inset, span: Math.PI - 2 * inset };
	}


	function splitSemicircle(partialShare, side, R) {
		const { start: arcStart, end: arcEnd, span: semi } = sideArcBounds(side, R);
		const hasPartial = partialShare >= minArcShare;
		const partialOnly = partialShare >= 1 - minArcShare;
		const remainedOnly = !hasPartial;

		if (remainedOnly) {
			return { remained: { start: arcStart, end: arcEnd }, partial: null, boundary: null };
		}

		if (partialOnly) {
			return { remained: null, partial: { start: arcStart, end: arcEnd }, boundary: null };
		}

		const partialSpan = partialShare * semi;
		const remainedSpan = semi - partialSpan;

		if (side === "left") {
			const boundary = arcStart + remainedSpan;
			return {
				remained: { start: arcStart, end: boundary },
				partial: { start: boundary, end: arcEnd },
				boundary
			};
		}

		const boundary = arcStart + partialSpan;
		return {
			partial: { start: arcStart, end: boundary },
			remained: { start: boundary, end: arcEnd },
			boundary
		};
	}

	function drawSeparator(g, cx, cy, R, angle, thick) {
		
		const half = Math.max(thick / 2, wordsBandPx / 2) + 1;
		const ri = Math.max(1, R - half);
		const ro = R + half;
		g.append("line")
			.attr("class", "sarc-seg-gap")
			.attr("x1", cx + ri * Math.cos(angle))
			.attr("y1", cy + ri * Math.sin(angle))
			.attr("x2", cx + ro * Math.cos(angle))
			.attr("y2", cy + ro * Math.sin(angle))
			.attr("stroke", COLORS.bg)
			.attr("stroke-width", segmentGapPx)
			.attr("stroke-linecap", "butt")
			.attr("vector-effect", "non-scaling-stroke")
			.attr("pointer-events", "none");
	}

	function readTextOutset(ringNum) {
		const px = readCssPx(root, `--scope-arcs-text-outset-${ringNum}`, NaN);
		const ratio = readCssPx(root, `--scope-arcs-text-outset-ratio-${ringNum}`, NaN);
		return {
			px: Number.isFinite(px) ? px : textOutsetPx,
			ratio: Number.isFinite(ratio) ? ratio : textOutsetRatio
		};
	}

	function ribbonTextRadius(r, ringNum) {
		const { px, ratio } = readTextOutset(ringNum);
		return r + px + r * ratio;
	}


	function labelRadiusForRing(ringNum) {
		const inner = innerRadiusForRing(ringNum);
		return Math.max(labelFontSize, inner - labelInset - labelFontSize * 0.72);
	}

	function drawHitArc(g, cx, cy, r, start, end, width) {
		const d = arcPath(cx, cy, r, start, end, 1);
		if (!d) return;
		g.append("path")
			.attr("class", "sarc-ring-hit")
			.attr("d", d)
			.attr("fill", "none")
			.attr("stroke", "#000")
			.attr("stroke-opacity", 0.001)
			.attr("stroke-width", Math.max(width ?? 0, 28))
			.attr("vector-effect", "non-scaling-stroke")
			.style("pointer-events", "none");
	}

	function drawBandArc(g, className, cx, cy, r, start, end, color, strokeW) {
		const d = arcPath(cx, cy, r, start, end, 1);
		if (!d) return null;
		g
			.append("path")
			.attr("class", `sarc-arc ${className}`)
			.attr("d", d)
			.attr("fill", "none")
			.attr("stroke", color)
			.attr("stroke-width", strokeW)
			.attr("data-thick", strokeW)
			.attr("stroke-linecap", "butt")
			.attr("opacity", ARC_OPACITY);
		
		return d;
	}

	function registerTextPath(id, cx, cy, r, start, end, ringNum) {
		const d = arcPath(cx, cy, ribbonTextRadius(r, ringNum), start, end, 1);
		if (!d) return false;
		defs.append("path").attr("id", id).attr("d", d);
		return true;
	}

	function registerSegmentClip(id, cx, cy, r, start, end, halfBand) {
		const d = arcBandClipD(cx, cy, r, halfBand, start, end);
		if (!d) return null;
		const path = defs
			.append("clipPath")
			.attr("id", id)
			.attr("clipPathUnits", "userSpaceOnUse")
			.append("path")
			.attr("d", d);
		return path.node();
	}

	/** @type {Array<{ ring: number, textEl: SVGTextElement, tpNode: SVGTextPathElement, offset: number, cycleLen: number, cycleText: string, font: { family: string, style: string, weight: string | number }, baseCycleLen: number, baseFontSize: number }>} */
	const marqueeTracks = [];

	/** @type {Array<{ ring: number, node: SVGPathElement, r: number, start: number, end: number, restThick: number }>} */
	const clipMeta = [];

	const zoomG = svg
		.append("g")
		.attr("class", "sarc-zoom-root")
		.attr("transform", zoomTransform(1));
	const defs = zoomG.append("defs");

	ringData.forEach((ring, i) => {
		const R_L = gslRadii[i];
		const R_R = ngslRadii[i];
		const ringNum = i + 1;
		const thickL = gslThick[i];
		const thickR = ngslThick[i];
		const hitL = Math.max(thickL, 22);
		const hitR = Math.max(thickR, 22);

		const addClip = (id, r, start, end, restThick) => {
			const node = registerSegmentClip(id, svgCx, svgCy, r, start, end, restThick / 2);
			if (node) clipMeta.push({ ring: ringNum, node, r, start, end, restThick });
		};

		const g = zoomG.append("g").attr("class", "sarc-ring").attr("data-ring", ringNum);

		const leftSegs = splitSemicircle(ring.removedShare, "left", R_L);
		const rightSegs = splitSemicircle(ring.addedShare, "right", R_R);

		const leftRemTextId = `sarc-rem-left-text-${i}`;
		const removedTextId = `sarc-removed-text-${i}`;
		const rightRemTextId = `sarc-rem-right-text-${i}`;
		const addedTextId = `sarc-added-text-${i}`;
		const leftRemClipId = `sarc-rem-left-clip-${i}`;
		const removedClipId = `sarc-removed-clip-${i}`;
		const rightRemClipId = `sarc-rem-right-clip-${i}`;
		const addedClipId = `sarc-added-clip-${i}`;

		let hasLeftRem = false;
		let hasRemoved = false;
		let hasRightRem = false;
		let hasAdded = false;

		if (leftSegs.remained) {
			hasLeftRem = !!drawBandArc(
				g, "sarc-arc--remained", svgCx, svgCy, R_L,
				leftSegs.remained.start, leftSegs.remained.end, COLORS.remained, thickL
			);
			if (hasLeftRem) {
				registerTextPath(leftRemTextId, svgCx, svgCy, R_L, leftSegs.remained.start, leftSegs.remained.end, ringNum);
				addClip(leftRemClipId, R_L, leftSegs.remained.start, leftSegs.remained.end, thickL);
			}
		}

		if (leftSegs.partial) {
			hasRemoved = !!drawBandArc(
				g, "sarc-arc--removed", svgCx, svgCy, R_L,
				leftSegs.partial.start, leftSegs.partial.end, COLORS.removed, thickL
			);
			if (hasRemoved) {
				registerTextPath(removedTextId, svgCx, svgCy, R_L, leftSegs.partial.start, leftSegs.partial.end, ringNum);
				addClip(removedClipId, R_L, leftSegs.partial.start, leftSegs.partial.end, thickL);
			}
		}

		if (rightSegs.remained) {
			hasRightRem = !!drawBandArc(
				g, "sarc-arc--remained", svgCx, svgCy, R_R,
				rightSegs.remained.start, rightSegs.remained.end, COLORS.remained, thickR
			);
			if (hasRightRem) {
				registerTextPath(rightRemTextId, svgCx, svgCy, R_R, rightSegs.remained.start, rightSegs.remained.end, ringNum);
				addClip(rightRemClipId, R_R, rightSegs.remained.start, rightSegs.remained.end, thickR);
			}
		}

		if (rightSegs.partial) {
			hasAdded = !!drawBandArc(
				g, "sarc-arc--added", svgCx, svgCy, R_R,
				rightSegs.partial.start, rightSegs.partial.end, COLORS.added, thickR
			);
			if (hasAdded) {
				registerTextPath(addedTextId, svgCx, svgCy, R_R, rightSegs.partial.start, rightSegs.partial.end, ringNum);
				addClip(addedClipId, R_R, rightSegs.partial.start, rightSegs.partial.end, thickR);
			}
		}

		const labelG = zoomG
			.append("g")
			.attr("class", "sarc-ring-label")
			.attr("data-ring", ringNum);

		// Word labels (focused / hovered ring only)
		const wordsG = g
			.append("g")
			.attr("class", "sarc-words")
			.attr("data-ring", ringNum)
			.style("pointer-events", "none");
		const addWords = (pathId, clipId, words, font, color) => {
			if (!words?.length || !pathId || !clipId) return;
			const cycleText = buildWordStr(words);
			const repeated = cycleText.repeat(marqueeRepeat);
			const clipG = wordsG.append("g").attr("class", "sarc-word-clip").attr("clip-path", `url(#${clipId})`);
			const tEl = clipG
				.append("text")
				.attr("class", "sarc-word-text")
				.attr("font-size", wordFontSize)
				.attr("font-family", font.family)
				.attr("font-style", font.style)
				.attr("font-weight", font.weight)
				.attr("fill", color)
				.attr("opacity", 1)
				.attr("letter-spacing", "0.04em");
			const tp = tEl
				.append("textPath")
				.attr("href", `#${pathId}`)
				.attr("startOffset", "0")
				.text(repeated);
			const tpNode = tp.node();
			if (tpNode) {
				marqueeTracks.push({
					ring: ringNum,
					textEl: tEl.node(),
					tpNode,
					offset: 0,
					cycleLen: 1,
					cycleText,
					font,
					baseCycleLen: 0,
					baseFontSize: wordFontSize
				});
			}
		};

		if (hasLeftRem) addWords(leftRemTextId, leftRemClipId, ring.remainedWords, FONTS.remained, COLORS.remained);
		if (hasRemoved) addWords(removedTextId, removedClipId, ring.removedWords, FONTS.removed, COLORS.removed);
		if (hasRightRem) addWords(rightRemTextId, rightRemClipId, ring.remainedWords, FONTS.remained, COLORS.remained);
		if (hasAdded) addWords(addedTextId, addedClipId, ring.addedWords, FONTS.added, COLORS.added);

		// Constant on-screen gap between the partial and remained segments.
		if (leftSegs.boundary != null) drawSeparator(g, svgCx, svgCy, R_L, leftSegs.boundary, thickL);
		if (rightSegs.boundary != null) drawSeparator(g, svgCx, svgCy, R_R, rightSegs.boundary, thickR);

		if (leftSegs.remained) drawHitArc(g, svgCx, svgCy, R_L, leftSegs.remained.start, leftSegs.remained.end, hitL);
		if (leftSegs.partial) drawHitArc(g, svgCx, svgCy, R_L, leftSegs.partial.start, leftSegs.partial.end, hitL);
		if (rightSegs.remained) drawHitArc(g, svgCx, svgCy, R_R, rightSegs.remained.start, rightSegs.remained.end, hitR);
		if (rightSegs.partial) drawHitArc(g, svgCx, svgCy, R_R, rightSegs.partial.start, rightSegs.partial.end, hitR);

		if (ringNum === 1) {
			
			const lines = ring.name.toUpperCase().split(/[\s-]+/).filter(Boolean);
			const text = labelG
				.append("text")
				.attr("class", "sarc-ring-label-text sarc-ring-label-text--center")
				.attr("x", svgCx)
				.attr("y", svgCy)
				.attr("font-size", labelFontSize)
				.attr("font-family", '"Source Sans 3", sans-serif')
				.attr("fill", COLORS.label)
				.attr("letter-spacing", "0.06em")
				.attr("text-anchor", "middle")
				.attr("dominant-baseline", "central");
			const startDy = -(lines.length - 1) * 0.6;
			lines.forEach((line, li) => {
				text
					.append("tspan")
					.attr("x", svgCx)
					.attr("dy", `${li === 0 ? startDy : 1.2}em`)
					.text(line);
			});
		} else {
			const labelR = labelRadiusForRing(ringNum);
			
			const approxTextLen = labelFontSize * ring.name.length * 0.58;
			const labelSpan = Math.min(
				(300 * Math.PI) / 180,
				(approxTextLen / Math.max(1, labelR)) * 1.06
			);
			const labelArcD = arcPath(
				svgCx, svgCy, labelR,
				TOP - labelSpan / 2, TOP + labelSpan / 2, 1
			);
			if (labelArcD) {
				const labelPathId = `sarc-label-path-${i}`;
				defs.append("path").attr("id", labelPathId).attr("d", labelArcD);
				labelG
					.append("text")
					.attr("class", "sarc-ring-label-text")
					.attr("font-size", labelFontSize)
					.attr("font-family", '"Source Sans 3", sans-serif')
					.attr("fill", COLORS.label)
					.attr("letter-spacing", "0.06em")
					.append("textPath")
					.attr("href", `#${labelPathId}`)
					.attr("startOffset", "50%")
					.attr("text-anchor", "middle")
					.text(ring.name.toUpperCase());
			}
		}
	});

	const dividerReach = Math.max(maxR, outerRadiusForRing(ringData.length));
	zoomG
		.append("line")
		.attr("class", "sarc-center-divider")
		.attr("x1", svgCx)
		.attr("y1", svgCy - dividerReach)
		.attr("x2", svgCx)
		.attr("y2", svgCy + dividerReach)
		.attr("stroke", "var(--scope-arcs-divider-color, var(--color-primary, #5B5B5B))")
		.attr("stroke-width", dividerWidth)
		.attr("stroke-dasharray", dividerDash)
		.attr("vector-effect", "non-scaling-stroke")
		.attr("opacity", 0.55)
		.attr("pointer-events", "none");

	container.appendChild(svg.node());

	const ringLayer = zoomG.selectAll(".sarc-ring");
	const labelLayer = zoomG.selectAll(".sarc-ring-label");
	const zoomRoot = zoomG;

	let scrollState = { visibleRings: 1, focusedRing: 1, overview: false };
	let hoveredRing = null;
	let marqueePaused = false;
	let marqueeResumeTimer = 0;

	function setMarqueePaused(paused) {
		marqueePaused = paused;
		marqueeLoop.syncEngagement();
	}

	function trackMarqueeActive(track) {
		if (marqueePaused) return false;
		const { visibleRings, focusedRing, overview } = scrollState;
		if (overview) return hoveredRing != null && track.ring === hoveredRing;
		if (!focusedRing) return false;
		return track.ring === focusedRing && track.ring <= visibleRings;
	}

	let marqueeInitialized = false;
	let prevFocusedRing = scrollState.focusedRing;

	function scheduleMarqueeResume(ms, fontSize, resetOffsets) {
		if (marqueeResumeTimer) {
			clearTimeout(marqueeResumeTimer);
			marqueeResumeTimer = 0;
		}
		if (ms <= 0) {
			setMarqueePaused(false);
			measureMarqueeTracks(fontSize, resetOffsets);
			return;
		}
		setMarqueePaused(true);
		marqueeResumeTimer = setTimeout(() => {
			marqueeResumeTimer = 0;
			setMarqueePaused(false);
			measureMarqueeTracks(fontSize, resetOffsets);
			marqueeLoop.syncEngagement();
		}, ms);
	}

	function probeCycleLen(track, fontSize) {
		const probe = svg
			.append("text")
			.attr("visibility", "hidden")
			.attr("pointer-events", "none")
			.attr("font-size", fontSize)
			.attr("font-family", track.font.family)
			.attr("font-style", track.font.style)
			.attr("font-weight", track.font.weight)
			.attr("letter-spacing", "0.04em")
			.text(track.cycleText);
		const probeLen = probe.node()?.getComputedTextLength?.() ?? 0;
		probe.remove();
		return probeLen;
	}

	function initMarqueeBaseMeasurements() {
		const MIN_CYCLE = 24;
		for (const track of marqueeTracks) {
			let len = probeCycleLen(track, wordFontSize);
			// Some WebKit builds still return 0 for hidden text — estimate from char count.
			if (len < MIN_CYCLE) {
				len = Math.max(MIN_CYCLE, track.cycleText.length * wordFontSize * 0.58);
			}
			track.baseFontSize = wordFontSize;
			track.baseCycleLen = len;
			track.cycleLen = len;
			track.offset = -Math.random() * len;
			track.tpNode.setAttribute("startOffset", track.offset);
		}
	}

	function cycleLenForFontSize(track, fontSize) {
		if (!track.baseCycleLen || !track.baseFontSize) return track.cycleLen || 24;
		return track.baseCycleLen * (fontSize / track.baseFontSize);
	}

	function measureMarqueeTracks(fontSize, resetOffsets = false) {
		const MIN_CYCLE = 24;
		for (const track of marqueeTracks) {
			track.textEl.setAttribute("font-size", fontSize);
			const newCycle = Math.max(MIN_CYCLE, cycleLenForFontSize(track, fontSize));

			if (resetOffsets) {
				track.offset = -Math.random() * newCycle;
			} else {
				track.offset = wrapPathOffset(track.offset, newCycle);
			}
			track.cycleLen = newCycle;
			track.tpNode.setAttribute("startOffset", track.offset);
		}
	}

	const marqueeLoop = createMarqueeLoop({
		isEngaged: () => marqueeTracks.some(trackMarqueeActive),
		tick(dt, prefersReducedMotion) {
			for (const track of marqueeTracks) {
				if (!trackMarqueeActive(track)) continue;
				if (prefersReducedMotion) continue;
				track.offset = wrapPathOffset(track.offset + marqueeSpeed * dt, track.cycleLen);
				track.tpNode.setAttribute("startOffset", track.offset);
			}
		}
	});

	function focusOpacity(ring) {
		const { visibleRings, focusedRing, overview } = scrollState;
		if (ring > visibleRings) return 0;
		if (overview) return 1;
		return ring === focusedRing ? 1 : unfocusedOpacity;
	}

	function wordsOpacity(ring) {
		const { visibleRings, focusedRing, overview } = scrollState;
		if (overview) return ring === hoveredRing ? 1 : 0;
		return ring === focusedRing && ring <= visibleRings ? 1 : 0;
	}

	function applyVisualState(animate = true, marqueeReset = false) {
		const { visibleRings, focusedRing, overview } = scrollState;
		const dur = animate ? focusFadeMs : 0;
		const zoomDur = animate ? zoomMs : 0;
		const ease = d3.easeCubicInOut;
		const scale = zoomScaleForState({ focusedRing, overview });
		const ringVisible = (ring) => ring <= visibleRings;

		
		const activeRing = overview
			? hoveredRing
			: focusedRing && focusedRing <= visibleRings
				? focusedRing
				: null;
		const swellWidth = (resting) =>
			activeRing == null ? resting : Math.max(resting, wordsBandPx / Math.max(scale, 0.01));

		ringLayer
			.interrupt()
			.transition("ring-vis")
			.duration(dur)
			.ease(ease)
			.style("opacity", function () {
				return focusOpacity(Number(this.getAttribute("data-ring")));
			})
			.style("visibility", function () {
				return ringVisible(Number(this.getAttribute("data-ring"))) ? "visible" : "hidden";
			})
			.style("cursor", overview ? "pointer" : null);

		ringLayer
			.selectAll(".sarc-ring-hit")
			.style("pointer-events", overview ? "stroke" : "none");

		ringLayer
			.selectAll(".sarc-arc")
			.style("pointer-events", overview ? "stroke" : "none");

		
		ringLayer
			.selectAll(".sarc-arc")
			.interrupt("band-w")
			.transition("band-w")
			.duration(dur)
			.ease(ease)
			.attr("stroke-width", function () {
				const ring = Number(this.parentNode?.getAttribute?.("data-ring"));
				const resting = Number(this.getAttribute("data-thick")) || 0;
				return ring === activeRing ? swellWidth(resting) : resting;
			});

		
		for (const m of clipMeta) {
			const w = m.ring === activeRing ? swellWidth(m.restThick) : m.restThick;
			const d = arcBandClipD(svgCx, svgCy, m.r, w / 2, m.start, m.end);
			if (d) m.node.setAttribute("d", d);
		}

		labelLayer.style("pointer-events", "none");

		ringLayer
			.selectAll(".sarc-words")
			.interrupt()
			.transition("words")
			.duration(dur)
			.ease(ease)
			.style("opacity", function () {
				return wordsOpacity(Number(this.getAttribute("data-ring")));
			});

		labelLayer
			.interrupt()
			.transition("labels")
			.duration(dur)
			.ease(ease)
			.style("opacity", function () {
				const ring = Number(this.getAttribute("data-ring"));
				
				if (ring === activeRing && ring !== 1) return 0;
				return focusOpacity(ring);
			})
			.style("visibility", function () {
				const ring = Number(this.getAttribute("data-ring"));
				return ringVisible(ring) && focusOpacity(ring) > 0 ? "visible" : "hidden";
			});

		const nextTransform = zoomTransform(scale);
		const wordSize = wordFontSize / scale;
		const nameSize = labelFontSize / scale;

		const wordText = ringLayer.selectAll(".sarc-word-text");
		const labelText = labelLayer.selectAll(".sarc-ring-label-text");

		if (animate && zoomDur > 0) {
			zoomRoot.interrupt().transition("zoom").duration(zoomDur).ease(ease).attr("transform", nextTransform);
			wordText.interrupt().transition("text-size").duration(zoomDur).ease(ease).attr("font-size", wordSize);
			labelText.interrupt().transition("text-size").duration(zoomDur).ease(ease).attr("font-size", nameSize);
		} else {
			zoomRoot.interrupt().attr("transform", nextTransform);
			wordText.attr("font-size", wordSize);
			labelText.attr("font-size", nameSize);
		}

		const focusChanged =
			marqueeInitialized && focusedRing !== prevFocusedRing && !overview;
		const hoverChanged = overview && marqueeReset;
		prevFocusedRing = overview ? null : focusedRing;
		const resetOffsets = !marqueeInitialized || focusChanged || hoverChanged;
		const marqueeTransitionMs =
			animate && !overview && (focusChanged || hoverChanged || !marqueeInitialized)
				? Math.max(zoomDur, dur)
				: 0;
		scheduleMarqueeResume(marqueeTransitionMs, wordSize, resetOffsets);
		marqueeInitialized = true;
		marqueeLoop.syncEngagement();
	}

	function setHoveredRing(ring) {
		if (!scrollState.overview) return;
		const next = ring == null ? null : Number(ring);
		if (hoveredRing === next) return;
		hoveredRing = next;
		applyVisualState(true, true);
	}

	const svgNode = svg.node();
	ringLayer
		.on("pointerenter", function () {
			if (!scrollState.overview) return;
			setHoveredRing(Number(this.getAttribute("data-ring")));
		})
		.on("pointerleave", function (event) {
			if (!scrollState.overview) return;
			const related = event.relatedTarget;
			if (related && this.contains(related)) return;
			setHoveredRing(null);
		});
	d3.select(svgNode).on("pointerleave", (event) => {
		if (!scrollState.overview) return;
		if (event.relatedTarget && svgNode.contains(event.relatedTarget)) return;
		setHoveredRing(null);
	});

	function applyScrollState(next, animate = true) {
		const wasOverview = scrollState.overview;
		scrollState = { ...scrollState, ...next };
		if (!scrollState.overview || !wasOverview) hoveredRing = null;
		applyVisualState(animate, false);
	}

	initMarqueeBaseMeasurements();
	applyScrollState(scrollState, false);

	return {
		setScrollState(state) {
			applyScrollState(state, true);
		},
		setMarqueeActive: marqueeLoop.setMarqueeActive,
		setPrefersReducedMotion: marqueeLoop.setPrefersReducedMotion,
		destroy() {
			if (marqueeResumeTimer) {
				clearTimeout(marqueeResumeTimer);
				marqueeResumeTimer = 0;
			}
			marqueeLoop.destroy();
			container.innerHTML = "";
		}
	};
}
