export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Inverse lerp, clamped to 0..1 */
export const range = (a: number, b: number, v: number) => clamp((v - a) / (b - a));

export const smooth = (t: number) => t * t * (3 - 2 * t);

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutBack = (t: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/**
 * 0 before `a`, eases to 1 between a→b, holds until c, eases back to 0 between c→d.
 */
export function beatWindow(t: number, [a, b, c, d]: readonly number[]) {
  if (t <= a || t >= d) return 0;
  if (t < b) return smooth(range(a, b, t));
  if (t <= c) return 1;
  return 1 - smooth(range(c, d, t));
}

/** Frame-rate independent damping */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));
