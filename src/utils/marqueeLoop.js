/**
 * RAF loop for chart marquees with visibility gating and reduced-motion support.
 * When reduced motion is preferred, the loop only runs while `isEngaged()` is true.
 *
 * @param {{
 *   tick: (dt: number, prefersReducedMotion: boolean) => void;
 *   isEngaged?: () => boolean;
 *   halfRate?: boolean;
 * }} options
 */
export function createMarqueeLoop({ tick, isEngaged = () => true, halfRate = false }) {
	let visibilityAllowed = false;
	let prefersReducedMotion = false;
	let running = false;
	let rafId = 0;
	let lastT = performance.now();
	let skipFrame = false;

	function shouldRun() {
		return visibilityAllowed && (!prefersReducedMotion || isEngaged());
	}

	function syncLoop() {
		const want = shouldRun();
		if (want === running) return;

		if (want) {
			running = true;
			lastT = performance.now();
			if (!rafId) rafId = requestAnimationFrame(loop);
			return;
		}

		running = false;
		if (rafId) {
			cancelAnimationFrame(rafId);
			rafId = 0;
		}
	}

	function loop(now) {
		if (!running) return;

		if (halfRate) {
			skipFrame = !skipFrame;
			if (skipFrame) {
				if (running) rafId = requestAnimationFrame(loop);
				return;
			}
		}

		let dt = (now - lastT) / 1000;
		lastT = now;
		if (dt > 0.5) dt = 0.016;

		tick(dt, prefersReducedMotion);

		if (running) rafId = requestAnimationFrame(loop);
	}

	return {
		setMarqueeActive(active) {
			visibilityAllowed = Boolean(active);
			syncLoop();
		},
		setPrefersReducedMotion(reduced) {
			prefersReducedMotion = Boolean(reduced);
			syncLoop();
		},
		syncEngagement: syncLoop,
		destroy() {
			visibilityAllowed = false;
			running = false;
			if (rafId) {
				cancelAnimationFrame(rafId);
				rafId = 0;
			}
		}
	};
}
