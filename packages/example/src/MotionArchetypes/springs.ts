/**
 * Shared motion vocabulary for the archetype compositions.
 *
 * Keeping the spring configs in one place is what makes the archetypes feel
 * like one system instead of four unrelated videos.
 */

export const SPRING = {
	/** Lands without overshooting. For text and anything that must stay readable. */
	precise: {damping: 200, stiffness: 100},
	/** A little overshoot. The default for shapes entering the frame. */
	soft: {damping: 18, stiffness: 120},
	/** Visible bounce. Use sparingly, for accents and logo snaps. */
	bouncy: {damping: 9, stiffness: 140},
	/** Slow and heavy. For large elements that should feel weighty. */
	heavy: {damping: 30, stiffness: 45},
} as const;

/**
 * Evaluates a cubic bezier at `t`, component-wise. Used to fly things along a
 * curve instead of a straight line.
 */
export const cubicBezierPoint = ({
	t,
	p0,
	p1,
	p2,
	p3,
}: {
	t: number;
	p0: [number, number];
	p1: [number, number];
	p2: [number, number];
	p3: [number, number];
}): [number, number] => {
	const u = 1 - t;
	const w0 = u * u * u;
	const w1 = 3 * u * u * t;
	const w2 = 3 * u * t * t;
	const w3 = t * t * t;

	return [
		w0 * p0[0] + w1 * p1[0] + w2 * p2[0] + w3 * p3[0],
		w0 * p0[1] + w1 * p1[1] + w2 * p2[1] + w3 * p3[1],
	];
};

/**
 * A deterministic pseudo-random number in [0, 1) for a given seed.
 * `Math.random()` cannot be used because every frame must render identically.
 */
export const seeded = (seed: number): number => {
	const x = Math.sin(seed * 12.9898) * 43758.5453;
	return x - Math.floor(x);
};
