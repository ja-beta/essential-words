

export const CHART_LAZY_INIT_MARGIN = "50% 0px";

/**
 * Calls onChange when `target` enters or leaves the viewport.
 * @param {Element | null | undefined} target
 * @param {(visible: boolean) => void} onChange
 * @param {IntersectionObserverInit} [options]
 */
export function observeChartVisibility(target, onChange, options = {}) {
	if (!target) return { disconnect() {} };

	let visible = false;
	const observer = new IntersectionObserver(
		(entries) => {
			const next = entries.some((entry) => entry.isIntersecting);
			if (next === visible) return;
			visible = next;
			onChange(visible);
		},
		{ root: null, rootMargin: CHART_LAZY_INIT_MARGIN, threshold: 0, ...options }
	);

	observer.observe(target);
	return { disconnect: () => observer.disconnect() };
}
