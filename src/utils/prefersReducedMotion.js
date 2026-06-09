export const PREFERS_REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** @returns {boolean} */
export function getPrefersReducedMotion() {
	if (typeof window === "undefined") return false;
	return window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
}

/**
 * Subscribe to `prefers-reduced-motion` changes.
 * @param {(reduced: boolean) => void} onChange
 * @returns {{ get: () => boolean, destroy: () => void }}
 */
export function subscribePrefersReducedMotion(onChange) {
	if (typeof window === "undefined") {
		return { get: () => false, destroy: () => {} };
	}

	const mq = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY);
	const handler = (event) => onChange(event.matches);

	onChange(mq.matches);
	mq.addEventListener("change", handler);

	return {
		get: () => mq.matches,
		destroy: () => mq.removeEventListener("change", handler)
	};
}
