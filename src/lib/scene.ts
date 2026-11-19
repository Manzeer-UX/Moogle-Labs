/**
 * Shared, mutable state that connects the scroll-driven DOM sections with the
 * fixed WebGL scene. Sections write progress values, the scene reads them
 * every frame. Nothing here triggers React renders.
 */

export type SceneGroup = "A" | "B" | "C" | null;

/* ------------------------------------------------------------------ */
/* Scroll choreography (units are viewport heights of scroll)          */
/* ------------------------------------------------------------------ */

/** Capabilities sticky section: length of the pinned part. */
export const CAPS_LEN = 5;
/** "Capabilities & Solutions" intro heading: [inStart, inEnd, outStart, outEnd]. */
export const CAPS_HEAD = [-0.35, 0.05, 0.35, 0.55] as const;
/**
 * [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd] for each category panel.
 * Panels alternate sides (01 right, 02 left, 03 right, 04 left).
 */
export const CAPS_BEATS: ReadonlyArray<readonly [number, number, number, number]> = [
  [0.6, 0.9, 1.4, 1.62],
  [1.65, 1.95, 2.45, 2.67],
  [2.7, 3.0, 3.5, 3.72],
  // last panel clears before the next section slides in
  [3.75, 4.05, 4.65, 4.9],
];
/** Even panels sit on the right, odd panels on the left (desktop). */
export const capsPanelOnRight = (i: number) => i % 2 === 0;

/** Delivery stages sticky section. */
export const DELIVERY_LEN = 7.9;
export const STAGE_BEATS: ReadonlyArray<readonly [number, number, number, number]> = Array.from(
  { length: 7 },
  (_, i) => [0.85 + i * 0.9, 1.1 + i * 0.9, 1.5 + i * 0.9, 1.75 + i * 0.9] as const,
);
export const GOVERNANCE_BEAT = [7.15, 7.4] as const;

/** Why MoogleLabs sticky section. */
export const WHY_LEN = 4.6;
export const WHY_BEATS: ReadonlyArray<readonly [number, number, number, number]> = Array.from(
  { length: 6 },
  (_, j) =>
    (j === 5
      ? [0.1 + j * 0.75, 0.35 + j * 0.75, 4.25, 4.5]
      : [0.1 + j * 0.75, 0.35 + j * 0.75, 0.7 + j * 0.75, 0.85 + j * 0.75]) as readonly [
      number,
      number,
      number,
      number,
    ],
);

/** Middle of a beat's "fully visible" window – used for anchor links. */
export const holdOf = (beat: readonly number[]) => (beat[1] + Math.min(beat[2], beat[1] + 0.6)) / 2;

/* ------------------------------------------------------------------ */
/* Live state                                                          */
/* ------------------------------------------------------------------ */

export const scene = {
  group: "A" as SceneGroup,
  loaded: false,
  /** 0 → 1 once the loader has finished (tweened) */
  intro: 0,
  velocity: 0,
  pointer: { x: 0, y: 0 },
  a: {
    /** hero scroll-out progress 0..1 */
    hero: 0,
    /** capabilities timeline position, -1 (entering) .. CAPS_LEN */
    t: -1,
  },
  b: {
    /** delivery timeline position, -1 .. DELIVERY_LEN + 1 */
    td: -1,
    /** why timeline position, -1 .. WHY_LEN + 1 */
    tw: -1,
  },
  c: {
    /** final CTA progress 0..1 */
    p: 0,
  },
};

/** DOM nodes the scene draws the capability connector into. */
export const connector = {
  line: null as SVGPolylineElement | null,
  dot: null as HTMLElement | null,
  panels: [] as (HTMLElement | null)[],
};

/* ------------------------------------------------------------------ */
/* Group visibility (which act of the 3D scene is on screen)           */
/* ------------------------------------------------------------------ */

const activeGroups = new Set<Exclude<SceneGroup, null>>(["A"]); // page starts in the hero act
const listeners = new Set<(g: SceneGroup) => void>();

export function setGroupActive(group: Exclude<SceneGroup, null>, active: boolean) {
  if (active) activeGroups.add(group);
  else activeGroups.delete(group);
  const order: Exclude<SceneGroup, null>[] = ["A", "B", "C"];
  const next = order.find((g) => activeGroups.has(g)) ?? null;
  if (next !== scene.group) {
    scene.group = next;
    listeners.forEach((fn) => fn(next));
  }
}

export function onGroupChange(fn: (g: SceneGroup) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
